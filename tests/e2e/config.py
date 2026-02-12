"""
Configuration for E2E tests.

Defines base URLs, timeouts, browsers, and output directories.
"""

import os
from pathlib import Path

# Base URL (adjust if dev server runs on different port)
# Use live Vercel deployment for production testing
BASE_URL = "https://fluentstep-ielts-roleplay-engine.vercel.app"

# Timeouts (in milliseconds)
# Increased for live Vercel deployment (network latency)
TIMEOUT_LOAD = 20000  # Page load (increased for React rendering + network)
TIMEOUT_ELEMENT = 10000  # Element visibility (increased for interactive elements)
TIMEOUT_ACTION = 5000  # Click, fill, etc.
TIMEOUT_ANIMATION = 1000  # Animations

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
