"""
Screenshot capture utilities for E2E tests.

Handles capturing full-page and element screenshots for debugging and
visual regression detection.
"""

from pathlib import Path
from datetime import datetime
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import SCREENSHOTS_DIR


def capture_failure_screenshot(
    page,
    test_name: str,
    scenario_id: str,
) -> str:
    """Capture full-page screenshot on test failure."""

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{test_name}_{scenario_id}_{timestamp}_FAILED.png"
    filepath = SCREENSHOTS_DIR / filename

    page.screenshot(path=str(filepath), full_page=True)
    return str(filepath)


def capture_feedback_modal_screenshot(
    page,
    scenario_id: str,
    feedback_index: int,
) -> str:
    """Capture screenshot of feedback modal for visual regression testing."""

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"feedback_{scenario_id}_{feedback_index}_{timestamp}.png"
    filepath = SCREENSHOTS_DIR / filename

    # Try to screenshot just the modal
    modal = page.query_selector('div[data-testid="feedback-modal"]')
    if modal:
        try:
            modal.screenshot(path=str(filepath))
            return str(filepath)
        except Exception:
            pass

    # Fallback to full page
    page.screenshot(path=str(filepath), full_page=True)
    return str(filepath)


def capture_blank_state_screenshot(
    page,
    scenario_id: str,
) -> str:
    """Capture screenshot of roleplay viewer showing blanks."""

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"blanks_{scenario_id}_{timestamp}.png"
    filepath = SCREENSHOTS_DIR / filename

    page.screenshot(path=str(filepath), full_page=True)
    return str(filepath)


def capture_element_screenshot(
    page,
    selector: str,
    test_name: str,
    scenario_id: str,
) -> str:
    """Capture screenshot of specific element."""

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{test_name}_{scenario_id}_{timestamp}.png"
    filepath = SCREENSHOTS_DIR / filename

    element = page.query_selector(selector)
    if element:
        try:
            element.screenshot(path=str(filepath))
            return str(filepath)
        except Exception:
            pass

    # Fallback to full page
    page.screenshot(path=str(filepath), full_page=True)
    return str(filepath)


def cleanup_old_screenshots(days: int = 7) -> None:
    """Delete screenshots older than specified days."""

    import time

    cutoff_time = time.time() - (days * 24 * 60 * 60)

    for filepath in SCREENSHOTS_DIR.glob("*.png"):
        if filepath.stat().st_mtime < cutoff_time:
            filepath.unlink()
