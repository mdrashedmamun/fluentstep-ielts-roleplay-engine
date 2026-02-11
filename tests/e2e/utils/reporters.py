"""
Report generation utilities for E2E tests.

Generates JSON test results and HTML reports with embedded screenshots.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import REPORTS_DIR, JSON_REPORTS_DIR


class TestReport:
    """Generates and manages test reports."""

    def __init__(self, agent_id: int):
        """Initialize report for a test agent."""
        self.agent_id = agent_id
        self.scenarios = []
        self.start_time = datetime.now()

    def add_scenario_result(
        self,
        scenario_id: str,
        status: str,  # "passed" or "failed"
        checks: Dict[str, int],  # {total, passed, failed}
        duration_ms: float,
        screenshots: List[str] = None,
        error_message: str = None,
    ) -> None:
        """Add test result for a scenario."""

        self.scenarios.append({
            "id": scenario_id,
            "status": status,
            "checks": checks,
            "duration_ms": duration_ms,
            "screenshots": screenshots or [],
            "error_message": error_message,
        })

    def get_summary(self) -> Dict[str, Any]:
        """Get summary statistics."""

        total_scenarios = len(self.scenarios)
        passed_scenarios = sum(1 for s in self.scenarios if s["status"] == "passed")
        failed_scenarios = total_scenarios - passed_scenarios

        total_checks = sum(s["checks"]["total"] for s in self.scenarios)
        passed_checks = sum(s["checks"]["passed"] for s in self.scenarios)
        failed_checks = total_checks - passed_checks

        return {
            "agent_id": self.agent_id,
            "total_scenarios": total_scenarios,
            "passed_scenarios": passed_scenarios,
            "failed_scenarios": failed_scenarios,
            "total_checks": total_checks,
            "passed_checks": passed_checks,
            "failed_checks": failed_checks,
            "pass_rate_scenarios": (passed_scenarios / total_scenarios * 100) if total_scenarios > 0 else 0,
            "pass_rate_checks": (passed_checks / total_checks * 100) if total_checks > 0 else 0,
        }

    def save_json(self) -> str:
        """Save report as JSON."""

        report_data = {
            "agent_id": self.agent_id,
            "timestamp": self.start_time.isoformat(),
            "duration_ms": (datetime.now() - self.start_time).total_seconds() * 1000,
            "summary": self.get_summary(),
            "scenarios": self.scenarios,
        }

        filepath = JSON_REPORTS_DIR / f"agent_{self.agent_id}.json"
        with open(filepath, 'w') as f:
            json.dump(report_data, f, indent=2)

        return str(filepath)


class HTMLReporter:
    """Generates HTML report from all agent JSON reports."""

    @staticmethod
    def generate_report(output_path: str = None) -> str:
        """Generate HTML report from all agent JSON files."""

        if output_path is None:
            output_path = str(REPORTS_DIR / "final_report.html")

        # Aggregate data from all agent reports
        all_results = []
        overall_summary = {
            "total_agents": 0,
            "total_scenarios": 0,
            "passed_scenarios": 0,
            "failed_scenarios": 0,
            "total_checks": 0,
            "passed_checks": 0,
        }

        for json_file in JSON_REPORTS_DIR.glob("agent_*.json"):
            try:
                with open(json_file, 'r') as f:
                    data = json.load(f)
                    all_results.append(data)

                    summary = data.get("summary", {})
                    overall_summary["total_agents"] += 1
                    overall_summary["total_scenarios"] += summary.get("total_scenarios", 0)
                    overall_summary["passed_scenarios"] += summary.get("passed_scenarios", 0)
                    overall_summary["failed_scenarios"] += summary.get("failed_scenarios", 0)
                    overall_summary["total_checks"] += summary.get("total_checks", 0)
                    overall_summary["passed_checks"] += summary.get("passed_checks", 0)
            except Exception as e:
                print(f"Error reading {json_file}: {e}")

        # Sort by agent ID
        all_results.sort(key=lambda x: x.get("agent_id", 0))

        # Generate HTML
        html_content = HTMLReporter._generate_html(all_results, overall_summary)

        # Write to file
        with open(output_path, 'w') as f:
            f.write(html_content)

        return output_path

    @staticmethod
    def _generate_html(results: List[Dict], summary: Dict) -> str:
        """Generate HTML content."""

        total_checks = summary["total_checks"]
        passed_checks = summary["passed_checks"]
        pass_rate = (passed_checks / total_checks * 100) if total_checks > 0 else 0

        status_color = "green" if pass_rate >= 95 else "orange" if pass_rate >= 80 else "red"
        status_emoji = "✅" if pass_rate >= 95 else "⚠️" if pass_rate >= 80 else "❌"

        html = f"""<!DOCTYPE html>
<html>
<head>
    <title>FluentStep E2E Test Report</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #f5f5f5;
            color: #333;
            padding: 20px;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 30px;
        }}
        h1 {{
            color: #1a73e8;
            margin-bottom: 20px;
            font-size: 28px;
        }}
        .summary {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }}
        .summary-card {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }}
        .summary-card.passed {{
            background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
        }}
        .summary-card.failed {{
            background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
        }}
        .summary-card h3 {{
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 10px;
            text-transform: uppercase;
        }}
        .summary-card .value {{
            font-size: 32px;
            font-weight: bold;
        }}
        .status-badge {{
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
        }}
        .status-badge.passed {{
            background: #c8e6c9;
            color: #2e7d32;
        }}
        .status-badge.failed {{
            background: #ffcdd2;
            color: #c62828;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
        }}
        th {{
            background: #f5f5f5;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #ddd;
        }}
        td {{
            padding: 12px;
            border-bottom: 1px solid #eee;
        }}
        tr:hover {{ background: #fafafa; }}
        .scenario-failed {{
            background-color: #fff3e0 !important;
        }}
        .scenario-failed:hover {{
            background-color: #ffe0b2 !important;
        }}
        .pass-rate {{
            font-weight: bold;
            color: #2e7d32;
        }}
        .pass-rate.low {{
            color: #c62828;
        }}
        .details {{
            margin-top: 20px;
            font-size: 12px;
            color: #666;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #999;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>{status_emoji} FluentStep E2E Test Report</h1>

        <div class="summary">
            <div class="summary-card">
                <h3>Total Scenarios</h3>
                <div class="value">{summary['total_scenarios']}</div>
            </div>
            <div class="summary-card passed">
                <h3>Passed</h3>
                <div class="value">{summary['passed_scenarios']}</div>
            </div>
            <div class="summary-card failed">
                <h3>Failed</h3>
                <div class="value">{summary['failed_scenarios']}</div>
            </div>
            <div class="summary-card">
                <h3>Pass Rate (Scenarios)</h3>
                <div class="value">{summary['passed_scenarios']/summary['total_scenarios']*100:.1f}%</div>
            </div>
            <div class="summary-card">
                <h3>Total Checks</h3>
                <div class="value">{summary['total_checks']}</div>
            </div>
            <div class="summary-card">
                <h3>Pass Rate (Checks)</h3>
                <div class="value">{pass_rate:.1f}%</div>
            </div>
        </div>

        <h2>Results by Scenario</h2>
        <table>
            <thead>
                <tr>
                    <th>Scenario</th>
                    <th>Agent</th>
                    <th>Status</th>
                    <th>Checks</th>
                    <th>Pass Rate</th>
                    <th>Duration (ms)</th>
                </tr>
            </thead>
            <tbody>
"""

        # Add scenario rows
        for result in results:
            for scenario in result.get("scenarios", []):
                checks_total = scenario["checks"]["total"]
                checks_passed = scenario["checks"]["passed"]
                checks_failed = scenario["checks"]["failed"]
                pass_rate_scenario = (checks_passed / checks_total * 100) if checks_total > 0 else 0
                status = scenario["status"]
                row_class = "scenario-failed" if status == "failed" else ""
                status_badge = f'<span class="status-badge {status}">{status.upper()}</span>'

                html += f"""                <tr class="{row_class}">
                    <td>{scenario['id']}</td>
                    <td>{result['agent_id']}</td>
                    <td>{status_badge}</td>
                    <td>{checks_passed}/{checks_total}</td>
                    <td class="pass-rate {'low' if pass_rate_scenario < 80 else ''}">{pass_rate_scenario:.1f}%</td>
                    <td>{scenario['duration_ms']:.0f}</td>
                </tr>
"""

        html += """            </tbody>
        </table>

        <div class="footer">
            <p>Report generated at """ + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + """</p>
            <p>FluentStep E2E Testing System</p>
        </div>
    </div>
</body>
</html>
"""

        return html
