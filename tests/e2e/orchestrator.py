#!/usr/bin/env python3
"""
E2E Test Orchestrator.

Coordinates parallel execution of 11 test agents:
- Agent 1: Tier 1 (6 scenarios with full validation)
- Agents 2-11: Tier 2 (46 scenarios with basic validation, 5 per agent)

Uses multiprocessing for true parallelization.
Aggregates JSON reports and generates HTML report.
"""

import sys
import time
import subprocess
import json
from pathlib import Path
from multiprocessing import Pool, cpu_count
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from config import (
    JSON_REPORTS_DIR, REPORTS_DIR,
    TIER1_SCENARIOS, NUM_AGENTS
)
from utils.reporters import HTMLReporter


def run_agent(agent_id: int, test_file: str) -> dict:
    """Run a single test agent."""

    print(f"[Agent {agent_id}] Starting: {test_file}")

    start_time = time.time()

    try:
        # Run pytest for this agent
        result = subprocess.run(
            [
                sys.executable, "-m", "pytest",
                test_file,
                "-v",
                "--tb=short",
                "-q",
                "--json-report",
                f"--json-report-file={JSON_REPORTS_DIR}/pytest_{agent_id}.json",
            ],
            capture_output=True,
            text=True,
            timeout=600,  # 10 minute timeout per agent
        )

        duration = time.time() - start_time
        print(f"[Agent {agent_id}] Completed in {duration:.1f}s (exit code: {result.returncode})")

        return {
            "agent_id": agent_id,
            "test_file": test_file,
            "status": "passed" if result.returncode == 0 else "failed",
            "duration_seconds": duration,
            "stdout": result.stdout,
            "stderr": result.stderr,
        }

    except subprocess.TimeoutExpired:
        duration = time.time() - start_time
        print(f"[Agent {agent_id}] TIMEOUT after {duration:.1f}s")
        return {
            "agent_id": agent_id,
            "test_file": test_file,
            "status": "timeout",
            "duration_seconds": duration,
            "error": "Test execution timed out",
        }

    except Exception as e:
        duration = time.time() - start_time
        print(f"[Agent {agent_id}] ERROR: {e}")
        return {
            "agent_id": agent_id,
            "test_file": test_file,
            "status": "error",
            "duration_seconds": duration,
            "error": str(e),
        }


def main():
    """Main orchestrator function."""

    print("\n" + "=" * 70)
    print("FluentStep E2E Test Orchestrator")
    print("=" * 70)
    print(f"Starting {NUM_AGENTS} parallel test agents...")
    print(f"Timestamp: {datetime.now().isoformat()}\n")

    start_time = time.time()

    # Define test agents
    agents = []

    # Agent 1: Tier 1 (6 scenarios with full validation)
    agents.append((1, "tests/e2e/scenarios/tier1_with_feedback.py"))

    # Agents 2-11: Tier 2 (46 scenarios, 5 per agent)
    for agent_num in range(2, NUM_AGENTS + 1):
        batch_num = agent_num - 1  # Batch 01-10
        agents.append((
            agent_num,
            f"tests/e2e/scenarios/tier2_batch_{batch_num:02d}.py"
        ))

    # Run agents in parallel
    with Pool(processes=NUM_AGENTS) as pool:
        results = []
        for agent_id, test_file in agents:
            result = pool.apply_async(run_agent, (agent_id, test_file))
            results.append(result)

        # Collect results
        agent_results = []
        for result in results:
            try:
                agent_result = result.get(timeout=700)  # 11m 40s timeout
                agent_results.append(agent_result)
            except Exception as e:
                print(f"Error collecting result: {e}")
                agent_results.append({
                    "status": "error",
                    "error": str(e),
                })

    # Summary
    total_duration = time.time() - start_time

    passed_agents = sum(1 for r in agent_results if r.get("status") == "passed")
    failed_agents = sum(1 for r in agent_results if r.get("status") == "failed")
    error_agents = sum(1 for r in agent_results if r.get("status") in ("timeout", "error"))

    print("\n" + "=" * 70)
    print("Test Execution Summary")
    print("=" * 70)
    print(f"Total Agents: {len(agent_results)}")
    print(f"  ✅ Passed: {passed_agents}")
    print(f"  ❌ Failed: {failed_agents}")
    print(f"  ⚠️  Errors: {error_agents}")
    print(f"Total Duration: {total_duration:.1f}s ({total_duration/60:.1f}m)")
    print()

    # Generate HTML report
    try:
        print("Generating HTML report...")
        report_path = HTMLReporter.generate_report()
        print(f"✅ Report generated: {report_path}")
    except Exception as e:
        print(f"❌ Failed to generate HTML report: {e}")

    print("\n" + "=" * 70)

    # Exit with appropriate code
    if error_agents > 0 or failed_agents > 0:
        print("❌ Test suite FAILED (some agents failed)")
        return 1
    else:
        print("✅ Test suite PASSED (all agents passed)")
        return 0


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
