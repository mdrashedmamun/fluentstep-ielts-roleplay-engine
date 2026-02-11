"""
Custom assertions for E2E tests.

Provides helpers for complex validations, especially for React state
and dynamic UI elements.
"""

import re
from typing import Optional


class AssertionError(Exception):
    """Custom assertion error with detailed messages."""
    pass


def assert_revealed_blanks_persists(page, expected_count: int) -> None:
    """
    Verify that revealedBlanks Set persists after modal opens.

    This is a critical regression test for the chunk feedback modal bug.
    Previously, revealedBlanks was cleared when the modal opened,
    causing the empty state to always appear.

    Strategy:
    1. Check data-revealed-count attribute on deep-dive button
    2. Verify feedback cards count matches expected
    3. Verify no empty state appears if expected_count > 0
    """

    # Try to get revealed count from data attribute
    button = page.query_selector('[data-revealed-count]')
    if button:
        count_attr = button.get_attribute('data-revealed-count')
        try:
            actual_count = int(count_attr)
            assert actual_count == expected_count, (
                f"Expected {expected_count} revealed blanks, but data-revealed-count={actual_count}"
            )
            return
        except (ValueError, TypeError):
            pass

    # Fallback: Count feedback cards in modal
    feedback_cards = page.query_selector_all('div[data-feedback-index]')
    actual_count = len(feedback_cards)

    if expected_count == 0:
        # Verify empty state appears
        empty_state = page.query_selector('text=Reveal more blanks to unlock chunk feedback')
        assert empty_state is not None, (
            "Expected empty state when no blanks revealed"
        )
    else:
        # Verify empty state does NOT appear
        empty_state = page.query_selector('text=Reveal more blanks to unlock chunk feedback')
        assert empty_state is None, (
            f"Empty state should NOT appear when {expected_count} blanks revealed"
        )

        # Verify feedback cards match expected count
        assert actual_count >= expected_count, (
            f"Expected at least {expected_count} feedback cards, got {actual_count}"
        )


def assert_feedback_card_structure(page, index: int) -> None:
    """Verify feedback card has all required sections."""

    card_selector = f'div[data-feedback-index="{index}"]'
    card = page.query_selector(card_selector)
    assert card is not None, f"Feedback card at index {index} not found"

    # Check for required sections
    required_sections = [
        'Core Function',
        'Real-Life Situations',
        'Native Usage Notes',
        'Non-Native Contrast',
    ]

    card_text = card.text_content() or ""
    for section in required_sections:
        assert section in card_text, (
            f"Feedback card missing section: {section}"
        )


def assert_blank_revealed(page, blank_index: int) -> None:
    """Verify a blank is revealed and shows alternative."""

    blank = page.query_selector(f'button[data-blank-index="{blank_index}"]')
    assert blank is not None, f"Blank at index {blank_index} not found"

    # Check for revealed indicator (× button or different styling)
    close_button = blank.query_selector('[class*="close"]')
    popover = page.query_selector('text=Native Alternatives')

    is_revealed = close_button is not None or popover is not None
    assert is_revealed, f"Blank {blank_index} does not appear revealed"


def assert_no_console_errors(errors: list) -> None:
    """Verify no critical console errors occurred."""

    if not errors:
        return

    # Filter out known non-blocking warnings
    critical_errors = [
        e for e in errors
        if not any(ignore in str(e) for ignore in [
            'localStorage is not available',
            'Deprecation warning',
            'non-critical',
        ])
    ]

    assert len(critical_errors) == 0, (
        f"Console errors found: {critical_errors}"
    )


def assert_page_load_time(load_time_ms: float, threshold_ms: float = 3000) -> None:
    """Verify page loaded within acceptable time."""

    assert load_time_ms < threshold_ms, (
        f"Page load time {load_time_ms}ms exceeds threshold {threshold_ms}ms"
    )


def assert_modal_closed(page) -> None:
    """Verify modal is closed (not visible)."""

    modal = page.query_selector('div[data-testid="feedback-modal"]')
    if modal is None:
        return  # Modal already doesn't exist

    is_visible = modal.is_visible()
    assert not is_visible, "Modal should be closed/hidden"


def assert_modal_open(page) -> None:
    """Verify modal is open and visible."""

    modal = page.query_selector('div[data-testid="feedback-modal"]')
    assert modal is not None, "Modal not found in DOM"
    assert modal.is_visible(), "Modal is not visible"


def assert_element_visible(page, selector: str, timeout_ms: int = 3000) -> None:
    """Verify element is visible with timeout."""

    try:
        page.wait_for_selector(selector, timeout=timeout_ms)
        element = page.query_selector(selector)
        assert element is not None
        assert element.is_visible(), f"Element {selector} is not visible"
    except Exception as e:
        raise AssertionError(f"Element {selector} not visible: {e}")


def assert_element_hidden(page, selector: str) -> None:
    """Verify element is hidden or not in DOM."""

    element = page.query_selector(selector)
    if element is None:
        return  # Element doesn't exist

    is_visible = element.is_visible()
    assert not is_visible, f"Element {selector} should be hidden"


def assert_text_content(page, selector: str, expected_text: str) -> None:
    """Verify element contains expected text."""

    element = page.query_selector(selector)
    assert element is not None, f"Element {selector} not found"

    actual_text = (element.text_content() or "").strip()
    assert expected_text in actual_text, (
        f"Expected '{expected_text}' in '{actual_text}'"
    )


def assert_attribute_equals(page, selector: str, attr: str, expected_value: str) -> None:
    """Verify element attribute equals expected value."""

    element = page.query_selector(selector)
    assert element is not None, f"Element {selector} not found"

    actual_value = element.get_attribute(attr)
    assert actual_value == expected_value, (
        f"Attribute {attr} = '{actual_value}', expected '{expected_value}'"
    )


def assert_localStorage_has_key(page, key: str) -> None:
    """Verify key exists in localStorage."""

    value = page.evaluate(f'localStorage.getItem("{key}")')
    assert value is not None, f"localStorage key '{key}' not found"


def assert_localStorage_value(page, key: str, expected_value: str) -> None:
    """Verify localStorage value."""

    value = page.evaluate(f'localStorage.getItem("{key}")')
    assert value == expected_value, (
        f"localStorage['{key}'] = '{value}', expected '{expected_value}'"
    )
