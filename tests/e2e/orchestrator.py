#!/usr/bin/env python3
"""
E2E Test Orchestrator.

Coordinates bounded execution of 11 test agents:
- Agent 1: Tier 1 (6 scenarios with full validation)
- Agents 2-11: Tier 2 (46 scenarios with basic validation, 5 per agent)

Uses a bounded thread scheduler. Each agent runs pytest in its own subprocess,
which keeps browser process timeouts reliable while avoiding local Chromium
overload from starting every batch at once. Non-passing agents are retried once
sequentially by default so the report distinguishes deterministic failures from
local browser-load flakes.
"""

import os
import sys
import time
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from importlib.util import find_spec
from pathlib import Path
from multiprocessing import cpu_count
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from config import JSON_REPORTS_DIR, NUM_AGENTS
from utils.reporters import HTMLReporter


HAS_JSON_REPORT_PLUGIN = find_spec("pytest_jsonreport") is not None
AGENT_TIMEOUT_SECONDS = int(os.getenv("E2E_AGENT_TIMEOUT_SECONDS", "900"))
AGENT_CONCURRENCY = max(1, min(
    NUM_AGENTS,
    int(os.getenv("E2E_AGENT_CONCURRENCY", str(min(2, cpu_count(), NUM_AGENTS))))
))
RETRY_NON_PASSING = os.getenv("E2E_RETRY_NON_PASSING", "1") != "0"
OUTPUT_TAIL_LINES = int(os.getenv("E2E_OUTPUT_TAIL_LINES", "80"))
PASSING_STATUSES = {"passed", "passed_after_retry"}


def coerce_output(value) -> str:
    """Normalize subprocess output from normal and timeout paths."""
    if not value:
        return ""
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    return str(value)


def tail(text: str, lines: int = OUTPUT_TAIL_LINES) -> str:
    """Return the last lines of subprocess output for compact diagnostics."""
    normalized = coerce_output(text)
    if not normalized:
        return ""
    split = normalized.strip().splitlines()
    return "\n".join(split[-lines:])


def run_agent(agent_id: int, test_file: str, attempt: int = 1) -> dict:
    """Run a single test agent."""

    label = f"Agent {agent_id}" if attempt == 1 else f"Agent {agent_id} retry {attempt}"
    print(f"[{label}] Starting: {test_file}", flush=True)
    start_time = time.time()

    command = [
        sys.executable, "-m", "pytest",
        test_file,
        "-v",
        "--tb=short",
        "-q",
    ]

    if HAS_JSON_REPORT_PLUGIN:
        suffix = f"{agent_id}" if attempt == 1 else f"{agent_id}_retry{attempt}"
        command.extend([
            "--json-report",
            f"--json-report-file={JSON_REPORTS_DIR}/pytest_{suffix}.json",
        ])

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=AGENT_TIMEOUT_SECONDS,
        )

        duration = time.time() - start_time
        status = "passed" if result.returncode == 0 else "failed"
        print(
            f"[{label}] {status.upper()} in {duration:.1f}s "
            f"(exit code: {result.returncode})",
            flush=True,
        )

        return {
            "agent_id": agent_id,
            "test_file": test_file,
            "attempt": attempt,
            "status": status,
            "duration_seconds": duration,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode,
        }

    except subprocess.TimeoutExpired as exc:
        duration = time.time() - start_time
        print(f"[{label}] TIMEOUT after {duration:.1f}s", flush=True)
        return {
            "agent_id": agent_id,
            "test_file": test_file,
            "attempt": attempt,
            "status": "timeout",
            "duration_seconds": duration,
            "stdout": coerce_output(exc.stdout),
            "stderr": coerce_output(exc.stderr),
            "error": f"Test execution timed out after {AGENT_TIMEOUT_SECONDS}s",
        }

    except Exception as exc:
        duration = time.time() - start_time
        print(f"[{label}] ERROR: {exc}", flush=True)
        return {
            "agent_id": agent_id,
            "test_file": test_file,
            "attempt": attempt,
            "status": "error",
            "duration_seconds": duration,
            "error": str(exc),
        }


def build_agents() -> list[tuple[int, str]]:
    """Return the E2E agent file list."""
    agents = [(1, "tests/e2e/scenarios/tier1_with_feedback.py")]

    for agent_num in range(2, NUM_AGENTS + 1):
        batch_num = agent_num - 1
        agents.append((
            agent_num,
            f"tests/e2e/scenarios/tier2_batch_{batch_num:02d}.py",
        ))

    return agents


def run_initial_agents(agents: list[tuple[int, str]]) -> list[dict]:
    """Run the first pass with bounded concurrency."""
    agent_results = []
    with ThreadPoolExecutor(max_workers=AGENT_CONCURRENCY) as executor:
        future_to_agent = {
            executor.submit(run_agent, agent_id, test_file): (agent_id, test_file)
            for agent_id, test_file in agents
        }

        for future in as_completed(future_to_agent):
            agent_id, test_file = future_to_agent[future]
            try:
                agent_results.append(future.result())
            except Exception as exc:
                print(f"[Agent {agent_id}] COLLECTION ERROR: {exc}", flush=True)
                agent_results.append({
                    "agent_id": agent_id,
                    "test_file": test_file,
                    "attempt": 1,
                    "status": "error",
                    "error": str(exc),
                })

    return agent_results


def apply_retries(agent_results: list[dict]) -> list[dict]:
    """Retry non-passing agents once, sequentially, preserving flake evidence."""
    if not RETRY_NON_PASSING:
        return agent_results

    final_results = {result.get("agent_id"): result for result in agent_results}
    retry_targets = [
        result for result in sorted(agent_results, key=lambda r: r.get("agent_id", 999))
        if result.get("status") not in PASSING_STATUSES
    ]

    if not retry_targets:
        return agent_results

    print("\nRetrying non-passing agents sequentially...", flush=True)
    for original in retry_targets:
        retry = run_agent(original["agent_id"], original["test_file"], attempt=2)
        retry["initial_status"] = original.get("status")
        retry["initial_duration_seconds"] = original.get("duration_seconds")
        if retry.get("status") == "passed":
            retry["status"] = "passed_after_retry"
        final_results[retry["agent_id"]] = retry

    return list(final_results.values())


def print_diagnostics(agent_results: list[dict]) -> None:
    """Print compact diagnostics for any final non-passing agents."""
    non_passing = [r for r in agent_results if r.get("status") not in PASSING_STATUSES]
    if not non_passing:
        return

    print("\nNon-passing agent diagnostics:", flush=True)
    for result in non_passing:
        print(
            f"\n[Agent {result.get('agent_id')}] {result.get('status', 'unknown').upper()} "
            f"{result.get('test_file', '')}",
            flush=True,
        )
        if result.get("error"):
            print(result["error"], flush=True)
        stdout_tail = tail(result.get("stdout", ""))
        stderr_tail = tail(result.get("stderr", ""))
        if stdout_tail:
            print("--- stdout tail ---", flush=True)
            print(stdout_tail, flush=True)
        if stderr_tail:
            print("--- stderr tail ---", flush=True)
            print(stderr_tail, flush=True)


def main():
    """Main orchestrator function."""

    print("\n" + "=" * 70, flush=True)
    print("FluentStep E2E Test Orchestrator", flush=True)
    print("=" * 70, flush=True)
    print(f"Starting {NUM_AGENTS} test agents with concurrency {AGENT_CONCURRENCY}...", flush=True)
    print(f"Per-agent timeout: {AGENT_TIMEOUT_SECONDS}s", flush=True)
    print(f"Retry non-passing agents: {'yes' if RETRY_NON_PASSING else 'no'}", flush=True)
    print(
        "pytest-json-report plugin: "
        f"{'available' if HAS_JSON_REPORT_PLUGIN else 'not installed; using plain pytest'}",
        flush=True,
    )
    print(f"Timestamp: {datetime.now().isoformat()}\n", flush=True)

    start_time = time.time()

    for stale_report in JSON_REPORTS_DIR.glob("pytest_*.json"):
        stale_report.unlink()

    agents = build_agents()
    initial_results = run_initial_agents(agents)
    agent_results = apply_retries(initial_results)
    agent_results.sort(key=lambda result: result.get("agent_id", 999))

    total_duration = time.time() - start_time
    first_passed_agents = sum(1 for r in agent_results if r.get("status") == "passed")
    retry_passed_agents = sum(1 for r in agent_results if r.get("status") == "passed_after_retry")
    failed_agents = sum(1 for r in agent_results if r.get("status") == "failed")
    error_agents = sum(1 for r in agent_results if r.get("status") in ("timeout", "error"))

    print("\n" + "=" * 70, flush=True)
    print("Test Execution Summary", flush=True)
    print("=" * 70, flush=True)
    print(f"Total Agents: {len(agent_results)}", flush=True)
    print(f"  Passed first attempt: {first_passed_agents}", flush=True)
    print(f"  Passed after retry: {retry_passed_agents}", flush=True)
    print(f"  Failed: {failed_agents}", flush=True)
    print(f"  Errors: {error_agents}", flush=True)
    print(f"Total Duration: {total_duration:.1f}s ({total_duration/60:.1f}m)", flush=True)

    if retry_passed_agents:
        print("\nRetry-pass agents indicate local E2E flake/load sensitivity:", flush=True)
        for result in agent_results:
            if result.get("status") == "passed_after_retry":
                print(
                    f"  Agent {result.get('agent_id')}: {result.get('test_file')} "
                    f"(initial {result.get('initial_status')})",
                    flush=True,
                )

    print_diagnostics(agent_results)

    try:
        agent_json_reports = list(JSON_REPORTS_DIR.glob("pytest_*.json"))
        if agent_json_reports:
            print("\nGenerating HTML report...", flush=True)
            report_path = HTMLReporter.generate_report()
            print(f"Report generated: {report_path}", flush=True)
        else:
            print("\nSkipping HTML report: no pytest_*.json reports were generated.", flush=True)
    except Exception as exc:
        print(f"Failed to generate HTML report: {exc}", flush=True)

    print("\n" + "=" * 70, flush=True)

    if failed_agents > 0 or error_agents > 0:
        print("Test suite FAILED (some agents failed)", flush=True)
        return 1

    print("Test suite PASSED (all agents passed; retry-pass agents are reported above)", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
