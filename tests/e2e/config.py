"""
Configuration for E2E tests.

Defines base URLs, timeouts, browsers, and output directories.
"""

import os
from pathlib import Path

# Base URL (adjust if dev server runs on different port)
BASE_URL = "http://localhost:3004"

# Timeouts (in milliseconds)
TIMEOUT_LOAD = 5000  # Page load
TIMEOUT_ELEMENT = 3000  # Element visibility
TIMEOUT_ACTION = 1000  # Click, fill, etc.
TIMEOUT_ANIMATION = 600  # Animations

# Browser settings
BROWSER = "chromium"
HEADLESS = True
SLOW_MO = 0  # Slow down actions for debugging (0 = normal speed)
VIEWPORT = {"width": 1280, "height": 720}

# Screenshot/Log settings
SCREENSHOT_ON_FAILURE = True
CAPTURE_CONSOLE_LOGS = True

# Directories
PROJECT_ROOT = Path(__file__).parent.parent.parent
TESTS_DIR = PROJECT_ROOT / "tests"
REPORTS_DIR = TESTS_DIR / "reports"
SCREENSHOTS_DIR = REPORTS_DIR / "screenshots"
JSON_REPORTS_DIR = REPORTS_DIR / "json"

# Ensure directories exist
for dir_path in [REPORTS_DIR, SCREENSHOTS_DIR, JSON_REPORTS_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# Parallel execution
NUM_AGENTS = 11
SCENARIOS_PER_AGENT = 5

# Tier 1: 6 scenarios with full validation
TIER1_SCENARIOS = [
    "social-1-flatmate",
    "service-1-cafe",
    "workplace-1-disagreement",
    "workplace-3-disagreement-polite",
    "academic-1-tutorial-discussion",
    "service-35-landlord-repairs",
]

# All 52 scenarios (Tier 2: 46 without chunkFeedback)
TIER2_SCENARIOS = [
    # Tier 2 will be populated from staticData.ts
    # This is a placeholder - orchestrator will discover all scenarios
]
