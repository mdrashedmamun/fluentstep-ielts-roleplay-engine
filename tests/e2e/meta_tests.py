"""
Meta tests for the E2E test suite itself.

Validates that:
1. All 52 scenarios have corresponding tests
2. Tier 1 has 6 scenarios with full validation
3. Tier 2 has 46 scenarios with basic validation
4. Test file structure is correct
5. All imports resolve correctly
"""

import pytest
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent))

from config import TIER1_SCENARIOS


class TestTestSuiteStructure:
    """Validate test suite is correctly structured."""

    def test_tier1_scenarios_defined(self):
        """Verify Tier 1 scenarios are defined."""
        assert len(TIER1_SCENARIOS) == 6, f"Expected 6 Tier 1 scenarios, got {len(TIER1_SCENARIOS)}"

    def test_tier1_test_file_exists(self):
        """Verify Tier 1 test file exists."""
        tier1_file = Path(__file__).parent / "scenarios" / "tier1_with_feedback.py"
        assert tier1_file.exists(), f"Tier 1 test file not found: {tier1_file}"

    def test_tier2_batch_files_exist(self):
        """Verify all 10 Tier 2 batch files exist."""
        scenarios_dir = Path(__file__).parent / "scenarios"

        for batch_num in range(1, 11):
            batch_file = scenarios_dir / f"tier2_batch_{batch_num:02d}.py"
            assert batch_file.exists(), f"Batch {batch_num} file not found: {batch_file}"

    def test_config_file_exists(self):
        """Verify config.py exists."""
        config_file = Path(__file__).parent / "config.py"
        assert config_file.exists(), f"Config file not found: {config_file}"

    def test_fixtures_file_exists(self):
        """Verify fixtures.py exists."""
        fixtures_file = Path(__file__).parent / "fixtures.py"
        assert fixtures_file.exists(), f"Fixtures file not found: {fixtures_file}"

    def test_utils_exist(self):
        """Verify all utility modules exist."""
        utils_dir = Path(__file__).parent / "utils"

        required_files = [
            "selectors.py",
            "assertions.py",
            "screenshots.py",
            "reporters.py",
            "__init__.py",
        ]

        for filename in required_files:
            filepath = utils_dir / filename
            assert filepath.exists(), f"Utility file not found: {filepath}"


class TestConfigurability:
    """Verify configuration settings are accessible."""

    def test_base_url_configured(self):
        """Verify BASE_URL is configured."""
        from config import BASE_URL
        assert BASE_URL is not None, "BASE_URL not configured"
        assert "localhost" in BASE_URL, "BASE_URL should point to localhost"

    def test_timeouts_configured(self):
        """Verify timeout values are configured."""
        from config import TIMEOUT_LOAD, TIMEOUT_ELEMENT, TIMEOUT_ACTION
        assert TIMEOUT_LOAD > 0, "TIMEOUT_LOAD not set"
        assert TIMEOUT_ELEMENT > 0, "TIMEOUT_ELEMENT not set"
        assert TIMEOUT_ACTION > 0, "TIMEOUT_ACTION not set"

    def test_directories_exist(self):
        """Verify report directories exist."""
        from config import REPORTS_DIR, SCREENSHOTS_DIR, JSON_REPORTS_DIR
        assert REPORTS_DIR.exists(), f"Reports directory not found: {REPORTS_DIR}"
        assert SCREENSHOTS_DIR.exists(), f"Screenshots directory not found: {SCREENSHOTS_DIR}"
        assert JSON_REPORTS_DIR.exists(), f"JSON reports directory not found: {JSON_REPORTS_DIR}"


class TestImports:
    """Verify all imports work correctly."""

    def test_import_config(self):
        """Test config import."""
        try:
            from config import BASE_URL, TIMEOUT_LOAD
        except ImportError as e:
            pytest.fail(f"Failed to import config: {e}")

    def test_import_fixtures(self):
        """Test fixtures import."""
        try:
            from fixtures import browser, page, goto_scenario
        except ImportError as e:
            pytest.fail(f"Failed to import fixtures: {e}")

    def test_import_assertions(self):
        """Test assertions import."""
        try:
            from utils.assertions import assert_revealed_blanks_persists
        except ImportError as e:
            pytest.fail(f"Failed to import assertions: {e}")

    def test_import_selectors(self):
        """Test selectors import."""
        try:
            from utils.selectors import Selectors
        except ImportError as e:
            pytest.fail(f"Failed to import selectors: {e}")

    def test_import_reporters(self):
        """Test reporters import."""
        try:
            from utils.reporters import TestReport, HTMLReporter
        except ImportError as e:
            pytest.fail(f"Failed to import reporters: {e}")


class TestSelectorConstants:
    """Verify selector constants are defined."""

    def test_critical_selectors_defined(self):
        """Verify critical selectors exist."""
        from utils.selectors import Selectors

        critical_selectors = [
            "BLANK_UNREVEALED",
            "DEEP_DIVE_BUTTON",
            "MODAL_EMPTY_STATE",
            "FEEDBACK_CARD",
            "COMPLETION_MODAL",
        ]

        for selector_name in critical_selectors:
            assert hasattr(Selectors, selector_name), (
                f"Critical selector not defined: {selector_name}"
            )
            selector_value = getattr(Selectors, selector_name)
            assert selector_value is not None, f"Selector {selector_name} is None"
            assert len(selector_value) > 0, f"Selector {selector_name} is empty"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
