"""
Pytest configuration for E2E tests.

Makes fixtures available to all test modules.
"""

from pathlib import Path
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Import fixtures so they're available to all tests
from fixtures import browser, page, goto_scenario, load_home, timer

__all__ = ['browser', 'page', 'goto_scenario', 'load_home', 'timer']
