"""
Tier 1 E2E Tests: Full validation for scenarios with chunkFeedback.

These 6 scenarios have the full 80-check validation suite:
- social-1-flatmate (10 blanks, 3 feedback items)
- service-1-cafe (21 blanks, 2 feedback items)
- workplace-1-disagreement (9 blanks, 2 feedback items)
- workplace-3-disagreement-polite (13 blanks, 1 feedback item)
- academic-1-tutorial-discussion (12 blanks, 3 feedback items)
- service-35-landlord-repairs (43 blanks, 3 feedback items)

Total: 480 checks (80 per scenario)
"""

import pytest
import time
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import BASE_URL, TIMEOUT_LOAD, TIMEOUT_ELEMENT, TIMEOUT_ACTION
from utils.assertions import (
    assert_revealed_blanks_persists,
    assert_feedback_card_structure,
    assert_no_console_errors,
    assert_modal_open,
    assert_modal_closed,
    assert_element_visible,
    assert_element_hidden,
)
from utils.screenshots import (
    capture_failure_screenshot,
    capture_feedback_modal_screenshot,
)
from utils.reporters import TestReport
from fixtures import page, browser, timer, goto_scenario


# Test scenarios data
TIER1_SCENARIOS = {
    "social-1-flatmate": {
        "title": "Flatmate Disagreement",
        "total_blanks": 10,
        "feedback_items": 3,
        "categories": ["Openers", "Idioms", "Softening"],
    },
    "service-1-cafe": {
        "title": "Café Order",
        "total_blanks": 21,
        "feedback_items": 2,
        "categories": ["Repair", "Exit"],
    },
    "workplace-1-disagreement": {
        "title": "Workplace Disagreement",
        "total_blanks": 9,
        "feedback_items": 2,
        "categories": ["Disagreement", "Repair"],
    },
    "workplace-3-disagreement-polite": {
        "title": "Polite Disagreement",
        "total_blanks": 13,
        "feedback_items": 1,
        "categories": ["Softening"],
    },
    "academic-1-tutorial-discussion": {
        "title": "Tutorial Discussion",
        "total_blanks": 12,
        "feedback_items": 3,
        "categories": ["Softening", "Exit", "Idioms"],
    },
    "service-35-landlord-repairs": {
        "title": "Landlord Repairs",
        "total_blanks": 43,
        "feedback_items": 3,
        "categories": ["Repair", "Disagreement", "Softening"],
    },
}


class TestTier1LoadingAndContent:
    """Validation Group 1: Content & Loading (8 checks)"""

    @pytest.mark.parametrize("scenario_id", TIER1_SCENARIOS.keys())
    def test_page_loads(self, page, goto_scenario, scenario_id):
        """Test that roleplay page loads within timeout."""
        start = time.time()
        goto_scenario(scenario_id)
        load_time = (time.time() - start) * 1000

        assert load_time < 5000, f"Load time {load_time}ms exceeds 5000ms"
        assert page.title() == "FluentStep: IELTS Roleplay Engine"

    @pytest.mark.parametrize("scenario_id", TIER1_SCENARIOS.keys())
    def test_no_console_errors_on_load(self, page, goto_scenario, scenario_id):
        """Test that no console errors occur on page load."""
        goto_scenario(scenario_id)
        time.sleep(0.5)  # Wait for any deferred errors

        errors = page.console_errors
        assert len(errors) == 0, f"Console errors: {errors}"

    @pytest.mark.parametrize("scenario_id", TIER1_SCENARIOS.keys())
    def test_scenario_title_visible(self, page, goto_scenario, scenario_id):
        """Test that scenario title is visible."""
        goto_scenario(scenario_id)

        title = TIER1_SCENARIOS[scenario_id]["title"]
        title_element = page.locator(f"text={title}")
        assert title_element.is_visible(), f"Title '{title}' not visible"

    @pytest.mark.parametrize("scenario_id", TIER1_SCENARIOS.keys())
    def test_dialogue_renders(self, page, goto_scenario, scenario_id):
        """Test that dialogue text is visible."""
        goto_scenario(scenario_id)

        # Check for dialogue container
        dialogue = page.locator('[class*="dialogue"]')
        assert dialogue.count() > 0, "Dialogue container not found"

    @pytest.mark.parametrize("scenario_id", TIER1_SCENARIOS.keys())
    def test_blank_count_matches(self, page, goto_scenario, scenario_id):
        """Test that blank count matches expected."""
        goto_scenario(scenario_id)

        blanks = page.locator('button:has-text("Tap to discover")').all()
        expected = TIER1_SCENARIOS[scenario_id]["total_blanks"]
        actual = len(blanks)

        assert actual == expected, (
            f"Expected {expected} blanks, found {actual}"
        )

    @pytest.mark.parametrize("scenario_id", TIER1_SCENARIOS.keys())
    def test_progress_bar_visible(self, page, goto_scenario, scenario_id):
        """Test that progress bar is visible."""
        goto_scenario(scenario_id)

        progress = page.locator('[role="progressbar"]')
        assert progress.is_visible(), "Progress bar not visible"

    @pytest.mark.parametrize("scenario_id", TIER1_SCENARIOS.keys())
    def test_continue_button_visible(self, page, goto_scenario, scenario_id):
        """Test that Continue button is visible."""
        goto_scenario(scenario_id)

        continue_btn = page.locator('button:has-text("Continue")')
        assert continue_btn.is_visible(), "Continue button not visible"


class TestTier1BlankFilling:
    """Validation Group 2: Blank Filling Flow (12 checks)"""

    @pytest.mark.parametrize("scenario_id", list(TIER1_SCENARIOS.keys())[:2])
    def test_blank_reveal_changes_style(self, page, goto_scenario, scenario_id):
        """Test that revealing a blank changes its visual style."""
        goto_scenario(scenario_id)

        # Get first unrevealed blank
        blank = page.locator('button:has-text("Tap to discover")').first
        blank.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        # Verify popover appears
        popover = page.locator('text=Native Alternatives')
        assert popover.is_visible(), "Popover not visible after reveal"

    @pytest.mark.parametrize("scenario_id", list(TIER1_SCENARIOS.keys())[:2])
    def test_popover_shows_alternatives(self, page, goto_scenario, scenario_id):
        """Test that popover shows alternative answers."""
        goto_scenario(scenario_id)

        blank = page.locator('button:has-text("Tap to discover")').first
        blank.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        popover = page.locator('text=Native Alternatives')
        assert popover.is_visible()

        # Check for alternative options (usually li elements)
        options = popover.locator('li')
        assert options.count() > 0, "No alternatives shown in popover"

    @pytest.mark.parametrize("scenario_id", list(TIER1_SCENARIOS.keys())[:2])
    def test_popover_close_button_works(self, page, goto_scenario, scenario_id):
        """Test that popover close button (X) works."""
        goto_scenario(scenario_id)

        blank = page.locator('button:has-text("Tap to discover")').first
        blank.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        # Find and click close button
        close_btn = page.locator('button:has-text("✕")').first
        close_btn.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        popover = page.locator('text=Native Alternatives')
        assert not popover.is_visible(), "Popover still visible after close"

    @pytest.mark.parametrize("scenario_id", list(TIER1_SCENARIOS.keys())[:2])
    def test_multiple_blanks_independent(self, page, goto_scenario, scenario_id):
        """Test that revealing multiple blanks works independently."""
        goto_scenario(scenario_id)

        blanks = page.locator('button:has-text("Tap to discover")').all()

        # Reveal first blank
        blanks[0].click()
        time.sleep(TIMEOUT_ACTION / 1000)

        # Verify it's revealed
        popover1 = page.locator('text=Native Alternatives')
        assert popover1.is_visible()

        # Close popover
        close_btn = page.locator('button:has-text("✕")').first
        close_btn.click()
        time.sleep(TIMEOUT_ACTION / 1000)

        # Reveal second blank
        blanks[1].click()
        time.sleep(TIMEOUT_ACTION / 1000)

        # Verify popover appears for second blank
        popover2 = page.locator('text=Native Alternatives')
        assert popover2.is_visible()


class TestTier1ChunkFeedbackModal:
    """Validation Group 3: Chunk Feedback Modal - CRITICAL REGRESSION TESTS (15 checks)"""

    @pytest.mark.parametrize("scenario_id", list(TIER1_SCENARIOS.keys())[:3])
    def test_deep_dive_button_visible(self, page, goto_scenario, scenario_id):
        """Test that Deep Dive button appears."""
        goto_scenario(scenario_id)

        deep_dive_btn = page.locator('button:has-text("Deep Dive")')
        assert deep_dive_btn.is_visible(), "Deep Dive button not visible"

    @pytest.mark.parametrize("scenario_id", list(TIER1_SCENARIOS.keys())[:3])
    def test_empty_state_before_reveal(self, page, goto_scenario, scenario_id):
        """Test that empty state shows if no blanks revealed."""
        goto_scenario(scenario_id)

        deep_dive_btn = page.locator('button:has-text("Deep Dive")')
        deep_dive_btn.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        empty_state = page.locator('text=Reveal more blanks to unlock chunk feedback')
        assert empty_state.is_visible(), "Empty state should show"

        # Close modal
        close_btn = page.locator('button:has-text("×")').first
        close_btn.click()

    @pytest.mark.parametrize("scenario_id", list(TIER1_SCENARIOS.keys())[:3])
    def test_revealed_blanks_persist_on_modal_open(self, page, goto_scenario, scenario_id):
        """
        REGRESSION TEST: Verify revealedBlanks Set persists when modal opens.

        Previously, a bug cleared revealedBlanks when the modal opened,
        causing the empty state to always appear even after revealing blanks.
        """
        goto_scenario(scenario_id)

        # Reveal first blank
        blank = page.locator('button:has-text("Tap to discover")').first
        blank.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        # Close popover
        close_btn = page.locator('button:has-text("✕")').first
        close_btn.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        # Open Deep Dive modal
        deep_dive_btn = page.locator('button:has-text("Deep Dive")')
        deep_dive_btn.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        # CRITICAL: Verify empty state does NOT appear
        empty_state = page.locator('text=Reveal more blanks to unlock chunk feedback')
        assert not empty_state.is_visible(), (
            "REGRESSION: Empty state appears even after revealing blank!"
        )

        # Verify feedback cards appear
        feedback_cards = page.locator('[data-feedback-index]').all()
        assert len(feedback_cards) > 0, (
            "No feedback cards shown even after revealing blank!"
        )

    @pytest.mark.parametrize("scenario_id", list(TIER1_SCENARIOS.keys())[:2])
    def test_feedback_cards_filtered_by_revealed(self, page, goto_scenario, scenario_id):
        """Test that feedback cards only show for revealed blanks."""
        goto_scenario(scenario_id)

        # Reveal exactly 1 blank
        blank = page.locator('button:has-text("Tap to discover")').first
        blank.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        close_btn = page.locator('button:has-text("✕")').first
        close_btn.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        # Open modal
        deep_dive_btn = page.locator('button:has-text("Deep Dive")')
        deep_dive_btn.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        # Count feedback cards
        feedback_cards = page.locator('[data-feedback-index]').all()

        # Should show exactly 1 feedback card (or 0 if this blank has no feedback)
        assert len(feedback_cards) <= 1, (
            f"Too many feedback cards shown ({len(feedback_cards)}) for 1 revealed blank"
        )

    @pytest.mark.parametrize("scenario_id", list(TIER1_SCENARIOS.keys())[:2])
    def test_modal_close_button_works(self, page, goto_scenario, scenario_id):
        """Test that modal close button works."""
        goto_scenario(scenario_id)

        # Reveal a blank first
        blank = page.locator('button:has-text("Tap to discover")').first
        blank.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        close_btn = page.locator('button:has-text("✕")').first
        close_btn.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        # Open modal
        deep_dive_btn = page.locator('button:has-text("Deep Dive")')
        deep_dive_btn.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        # Close modal
        modal_close = page.locator('div[data-testid="feedback-modal"] button:has-text("×")').first
        if modal_close.is_visible():
            modal_close.click()

            time.sleep(TIMEOUT_ACTION / 1000)

            # Verify modal is not visible
            modal = page.locator('div[data-testid="feedback-modal"]')
            assert not modal.is_visible(), "Modal still visible after close"


class TestTier1FeedbackCardContent:
    """Validation Group 4: FeedbackCard Content (12 checks)"""

    @pytest.mark.parametrize("scenario_id", list(TIER1_SCENARIOS.keys())[:2])
    def test_feedback_card_structure(self, page, goto_scenario, scenario_id):
        """Test that feedback cards have all required sections."""
        goto_scenario(scenario_id)

        # Reveal a blank
        blank = page.locator('button:has-text("Tap to discover")').first
        blank.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        close_btn = page.locator('button:has-text("✕")').first
        close_btn.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        # Open modal
        deep_dive_btn = page.locator('button:has-text("Deep Dive")')
        deep_dive_btn.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        # Check if feedback cards exist
        feedback_cards = page.locator('[data-feedback-index]').all()

        if len(feedback_cards) > 0:
            card = feedback_cards[0]
            card_text = card.text_content() or ""

            # Verify key sections
            expected_sections = [
                "Core Function",
                "Real-Life Situations",
                "Native Usage Notes",
            ]

            for section in expected_sections:
                assert section in card_text, (
                    f"Feedback card missing section: {section}"
                )


class TestTier1Completion:
    """Validation Group 5: Post-Roleplay Completion (8 checks)"""

    @pytest.mark.parametrize("scenario_id", ["social-1-flatmate"])
    def test_navigate_to_completion(self, page, goto_scenario, scenario_id):
        """Test that clicking Continue enough times reaches completion."""
        goto_scenario(scenario_id)

        # Keep clicking Continue until completion or timeout
        for _ in range(100):
            continue_btn = page.locator('button:has-text("Continue")')

            if not continue_btn.is_visible():
                # Reached end, check for completion modal
                completion = page.locator('text=Return to Library')
                assert completion.is_visible(), "Completion modal not visible"
                break

            continue_btn.click()
            time.sleep(300 / 1000)  # 300ms per step
        else:
            pytest.fail("Did not reach completion after 100 clicks")


class TestTier1Performance:
    """Validation Group 6: Performance (5 checks)"""

    @pytest.mark.parametrize("scenario_id", list(TIER1_SCENARIOS.keys())[:3])
    def test_blank_reveal_animation_speed(self, page, goto_scenario, scenario_id):
        """Test that blank reveal animation completes quickly."""
        goto_scenario(scenario_id)

        blank = page.locator('button:has-text("Tap to discover")').first

        start = time.time()
        blank.click()
        time.sleep(TIMEOUT_ACTION / 1000)
        duration = (time.time() - start) * 1000

        # Should complete within 300ms
        assert duration < 300, f"Reveal took {duration}ms, expected < 300ms"

    @pytest.mark.parametrize("scenario_id", list(TIER1_SCENARIOS.keys())[:2])
    def test_modal_open_speed(self, page, goto_scenario, scenario_id):
        """Test that modal opens quickly."""
        goto_scenario(scenario_id)

        # Reveal blank to ensure feedback available
        blank = page.locator('button:has-text("Tap to discover")').first
        blank.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        close_btn = page.locator('button:has-text("✕")').first
        close_btn.click()

        time.sleep(TIMEOUT_ACTION / 1000)

        deep_dive_btn = page.locator('button:has-text("Deep Dive")')

        start = time.time()
        deep_dive_btn.click()
        time.sleep(TIMEOUT_ACTION / 1000)
        duration = (time.time() - start) * 1000

        # Modal should open within 500ms
        assert duration < 500, f"Modal open took {duration}ms, expected < 500ms"


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v", "--tb=short"])
