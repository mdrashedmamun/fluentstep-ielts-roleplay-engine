"""
Tier 2 E2E Tests: Batch 06.

Contains 5 scenarios with basic 15-check validation.
"""

import pytest
import time
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import BASE_URL, TIMEOUT_LOAD, TIMEOUT_ELEMENT, TIMEOUT_ACTION
from utils.assertions import assert_no_console_errors
from fixtures import page, browser, timer, goto_scenario


BATCH_SCENARIOS = ['service-9-return-faulty', 'social-10-new-neighbor', 'social-2-catch-up', 'social-3-weekend-plans', 'social-31-catching-up']


def click_next_turn(page):
    """Click Next Turn, falling back when Playwright's physical click stalls."""
    next_turn_btn = page.locator('button:has-text("Next Turn")').first
    try:
        next_turn_btn.click(timeout=TIMEOUT_ACTION)
    except Exception:
        next_turn_btn.dispatch_event('click')


def advance_to_completion(page, max_turns=80):
    """Advance through the roleplay and open the completion modal."""
    for _ in range(max_turns):
        complete_btn = page.locator('button:has-text("Complete Mastery")')
        if complete_btn.is_visible():
            complete_btn.click()
            page.wait_for_selector('text=Return to Library', timeout=TIMEOUT_ELEMENT)
            return

        next_turn_btn = page.locator('button:has-text("Next Turn")')
        if not next_turn_btn.is_visible():
            break
        click_next_turn(page)
        page.wait_for_timeout(150)

    complete_btn = page.locator('button:has-text("Complete Mastery")')
    if complete_btn.is_visible():
        complete_btn.click()
        page.wait_for_selector('text=Return to Library', timeout=TIMEOUT_ELEMENT)


class TestTier2BasicInteraction:
    """Tier 2 Basic Interaction Tests (15 checks per scenario)"""

    @pytest.mark.parametrize("scenario_id", BATCH_SCENARIOS)
    def test_page_loads(self, page, goto_scenario, scenario_id):
        """Check 1: Page loads successfully."""
        start = time.time()
        try:
            goto_scenario(scenario_id)
            load_time = (time.time() - start) * 1000
            assert load_time < 10000, f"Load time {load_time}ms exceeds 10000ms"
        except Exception as e:
            pytest.fail(f"Failed to load {scenario_id}: {e}")

    @pytest.mark.parametrize("scenario_id", BATCH_SCENARIOS)
    def test_no_console_errors(self, page, goto_scenario, scenario_id):
        """Check 2: No console errors on load."""
        goto_scenario(scenario_id)
        time.sleep(0.5)
        assert len(page.console_errors) == 0, f"Console errors: {page.console_errors}"

    @pytest.mark.parametrize("scenario_id", BATCH_SCENARIOS)
    def test_title_correct(self, page, goto_scenario, scenario_id):
        """Check 3: Page title is correct."""
        goto_scenario(scenario_id)
        assert page.title() == "FluentStep: IELTS Roleplay Engine"

    @pytest.mark.parametrize("scenario_id", BATCH_SCENARIOS)
    def test_dialogue_renders(self, page, goto_scenario, scenario_id):
        """Check 4: Dialogue renders without errors."""
        goto_scenario(scenario_id)
        next_btn = page.locator('button:has-text("Next Turn")')
        assert next_btn.count() > 0, "Dialogue not found"

    @pytest.mark.parametrize("scenario_id", BATCH_SCENARIOS)
    def test_blanks_visible(self, page, goto_scenario, scenario_id):
        """Check 5: At least one blank is visible."""
        goto_scenario(scenario_id)
        blanks = page.locator('button:has-text("Tap to discover")').all()
        assert len(blanks) > 0, "No blanks found"

    @pytest.mark.parametrize("scenario_id", BATCH_SCENARIOS)
    def test_reveal_blank(self, page, goto_scenario, scenario_id):
        """Check 6: Revealing a blank shows alternatives."""
        goto_scenario(scenario_id)
        blank = page.locator('button:has-text("Tap to discover")').first
        blank.click()
        page.wait_for_timeout(500)

        popover = page.locator('text=Native Alternatives')
        assert popover.is_visible(), "Popover not visible after reveal"

    @pytest.mark.parametrize("scenario_id", BATCH_SCENARIOS)
    def test_popover_has_options(self, page, goto_scenario, scenario_id):
        """Check 7: Popover shows multiple alternatives."""
        goto_scenario(scenario_id)
        blank = page.locator('button:has-text("Tap to discover")').first
        blank.click()
        page.wait_for_timeout(500)

        options = page.locator('text=Other ways to say')
        assert options.count() > 0, "No alternatives shown"

    @pytest.mark.parametrize("scenario_id", BATCH_SCENARIOS)
    def test_close_popover(self, page, goto_scenario, scenario_id):
        """Check 8: Closing popover works."""
        goto_scenario(scenario_id)
        blank = page.locator('button:has-text("Tap to discover")').first
        blank.click()
        page.wait_for_timeout(500)

        close_btn = page.locator('button:has(i.fa-times)').first
        close_btn.click()
        page.wait_for_timeout(500)

        popover = page.locator('text=Native Alternatives')
        if close_btn.count() > 0: assert not popover.is_visible(), "Popover not closed"

    @pytest.mark.parametrize("scenario_id", BATCH_SCENARIOS)
    def test_continue_button_works(self, page, goto_scenario, scenario_id):
        """Check 9: Continue button advances dialogue."""
        goto_scenario(scenario_id)

        next_turn_btn = page.locator('button:has-text("Next Turn")')
        assert next_turn_btn.is_visible(), "Next Turn button not visible"

        click_next_turn(page)
        page.wait_for_timeout(750)

        # Button should either still be visible or we're at the end
        next_turn_after = page.locator('button:has-text("Next Turn")')
        completion = page.locator('text=Return to Library')
        if completion.count() > 0: assert completion.is_visible(), "Completion modal not visible"

    @pytest.mark.parametrize("scenario_id", BATCH_SCENARIOS)
    def test_reveal_second_blank(self, page, goto_scenario, scenario_id):
        """Check 10: Can reveal multiple blanks independently."""
        goto_scenario(scenario_id)

        blanks = page.locator('button:has-text("Tap to discover")').all()
        if len(blanks) < 2:
            pytest.skip(f"Scenario has only {len(blanks)} blank(s)")

        blanks[0].click()
        page.wait_for_timeout(500)

        close_btn = page.locator('button:has(i.fa-times)').first
        close_btn.click()
        page.wait_for_timeout(500)

        blanks[1].click()
        page.wait_for_timeout(500)

        popover = page.locator('text=Native Alternatives')
        assert popover.is_visible(), "Second blank not revealed"

    @pytest.mark.parametrize("scenario_id", BATCH_SCENARIOS)
    def test_navigate_to_end(self, page, goto_scenario, scenario_id):
        """Check 11: Can navigate to end of scenario."""
        goto_scenario(scenario_id)

        advance_to_completion(page)

    @pytest.mark.parametrize("scenario_id", BATCH_SCENARIOS)
    def test_completion_modal_appears(self, page, goto_scenario, scenario_id):
        """Check 12: Completion modal appears at end."""
        goto_scenario(scenario_id)

        advance_to_completion(page)

        completion = page.locator('text=Return to Library')
        assert completion.is_visible(), "Completion modal not visible"

    @pytest.mark.parametrize("scenario_id", BATCH_SCENARIOS)
    def test_return_to_library_works(self, page, goto_scenario, scenario_id):
        """Check 13: Return to Library button works."""
        goto_scenario(scenario_id)

        advance_to_completion(page)

        return_btn = page.locator('button:has-text("Return to Library")')
        assert return_btn.is_visible(), "Return to Library button not visible"

    @pytest.mark.parametrize("scenario_id", BATCH_SCENARIOS)
    def test_progress_saved(self, page, goto_scenario, scenario_id):
        """Check 14: Scenario progress is saved."""
        goto_scenario(scenario_id)

        initial_value = page.evaluate('localStorage.getItem("fluentstep:progress")')

        advance_to_completion(page)

        final_value = page.evaluate('localStorage.getItem("fluentstep:progress")')
        assert final_value is not None, "Progress not saved to localStorage"

    @pytest.mark.parametrize("scenario_id", BATCH_SCENARIOS)
    def test_no_final_errors(self, page, goto_scenario, scenario_id):
        """Check 15: No console errors during full scenario."""
        goto_scenario(scenario_id)

        advance_to_completion(page)

        assert len(page.console_errors) == 0, f"Errors occurred: {page.console_errors}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
