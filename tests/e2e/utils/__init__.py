"""E2E test utilities."""
from .selectors import Selectors
from .assertions import (
    assert_revealed_blanks_persists,
    assert_feedback_card_structure,
    assert_blank_revealed,
    assert_no_console_errors,
)
from .screenshots import (
    capture_failure_screenshot,
    capture_feedback_modal_screenshot,
)
from .reporters import TestReport, HTMLReporter

__all__ = [
    'Selectors',
    'assert_revealed_blanks_persists',
    'assert_feedback_card_structure',
    'assert_blank_revealed',
    'assert_no_console_errors',
    'capture_failure_screenshot',
    'capture_feedback_modal_screenshot',
    'TestReport',
    'HTMLReporter',
]
