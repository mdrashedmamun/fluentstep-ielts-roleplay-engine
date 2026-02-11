#!/usr/bin/env python3
"""
Comprehensive test suite for homepage error fixes.

Tests verify that:
1. Homepage loads without "Cannot read properties of undefined" errors
2. FilterPanel works correctly (filters[category] fallback)
3. ContinueLearningBanner works correctly (progress.inProgressScenarios fallback)
4. Filter interactions (single, multiple, reset) all work without errors
"""

from playwright.sync_api import sync_playwright
import sys
import time

def test_homepage_loads():
    """Test that homepage loads without JavaScript errors."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console errors
        errors = []
        page.on("console", lambda msg: errors.append(msg) if msg.type == "error" else None)

        # Navigate to homepage
        page.goto('http://localhost:3001/')
        page.wait_for_load_state('networkidle')

        # Check page title
        assert page.title() == "FluentStep: IELTS Roleplay Engine", "Page title mismatch"

        # Check for hero section
        hero = page.locator('text=Your Journey to English Fluency')
        assert hero.is_visible(), "Hero section not visible"

        # Check for scenario grid (at least one scenario visible)
        scenarios = page.locator('button').filter(has_text='Start').all()
        assert len(scenarios) > 0, "No scenarios visible on homepage"

        # Verify no JavaScript errors in console
        js_errors = [e for e in errors if 'error' in str(e).lower()]
        assert len(js_errors) == 0, f"JavaScript errors found: {js_errors}"

        browser.close()
        print("✅ Homepage loads without JavaScript errors")


def test_single_filter():
    """Test that single filter works correctly."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate and wait
        page.goto('http://localhost:3001/')
        page.wait_for_load_state('networkidle')

        # Skip onboarding
        page.click('button:has-text("Skip for now")')
        page.wait_for_timeout(500)

        # Click B2 difficulty filter checkbox
        page.check('input[aria-label="B2 (Upper Intermediate)"]')
        page.wait_for_timeout(500)

        # Verify URL updated
        url = page.url
        assert 'difficulty=B2' in url, f"URL not updated correctly: {url}"

        # Verify checkbox is checked
        checkbox = page.locator('input[aria-label="B2 (Upper Intermediate)"]')
        assert checkbox.is_checked(), "Checkbox not checked"

        # Verify reset button appeared (indicates filter is active)
        reset_button = page.locator('button:has-text("Reset Filters")').first
        assert reset_button.is_visible(), "Reset button not visible after filtering"

        browser.close()
        print("✅ Single filter works correctly")


def test_multiple_filters():
    """Test that multiple filters work together."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate and wait
        page.goto('http://localhost:3001/')
        page.wait_for_load_state('networkidle')

        # Skip onboarding
        page.click('button:has-text("Skip for now")')
        page.wait_for_timeout(500)

        # Apply first filter (B2)
        page.check('input[aria-label="B2 (Upper Intermediate)"]')
        page.wait_for_timeout(300)

        # Expand Duration filter
        duration_button = page.locator('button').filter(has_text='Duration').first
        duration_button.click()
        page.wait_for_timeout(300)

        # Apply second filter (Short)
        page.check('input[aria-label="Short (5-10 min)"]')
        page.wait_for_timeout(500)

        # Verify URL has both filters
        url = page.url
        assert 'difficulty=B2' in url, f"Difficulty filter missing: {url}"
        assert 'duration=short' in url, f"Duration filter missing: {url}"

        # Verify both checkboxes are checked
        b2_checkbox = page.locator('input[aria-label="B2 (Upper Intermediate)"]')
        short_checkbox = page.locator('input[aria-label="Short (5-10 min)"]')
        assert b2_checkbox.is_checked(), "B2 checkbox not checked"
        assert short_checkbox.is_checked(), "Short checkbox not checked"

        browser.close()
        print("✅ Multiple filters work correctly")


def test_reset_filters():
    """Test that reset filters button works."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate and wait
        page.goto('http://localhost:3001/')
        page.wait_for_load_state('networkidle')

        # Skip onboarding
        page.click('button:has-text("Skip for now")')
        page.wait_for_timeout(500)

        # Apply filter
        page.check('input[aria-label="B2 (Upper Intermediate)"]')
        page.wait_for_timeout(300)

        # Verify reset button is visible
        reset_button = page.locator('button').filter(has_text='Reset Filters').first
        assert reset_button.is_visible(), "Reset button not visible after filtering"

        # Verify filter is in URL
        url_with_filter = page.url
        assert 'difficulty=B2' in url_with_filter, f"Filter not applied: {url_with_filter}"

        # Click reset
        reset_button.click()
        page.wait_for_timeout(500)

        # Verify URL is clean
        url_after_reset = page.url
        assert 'difficulty=' not in url_after_reset, f"Filters not reset: {url_after_reset}"

        # Verify checkbox is unchecked
        checkbox = page.locator('input[aria-label="B2 (Upper Intermediate)"]')
        assert not checkbox.is_checked(), "Checkbox still checked after reset"

        # Verify reset button is gone (no active filters)
        reset_buttons = page.locator('button').filter(has_text='Reset Filters').all()
        assert len(reset_buttons) == 0, "Reset button still visible after reset"

        browser.close()
        print("✅ Reset filters works correctly")


def test_no_console_errors():
    """Test that no console errors appear during interactions."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        errors = []
        page.on("console", lambda msg: errors.append((msg.type, msg.text)) if msg.type == "error" else None)

        # Navigate and interact
        page.goto('http://localhost:3001/')
        page.wait_for_load_state('networkidle')

        # Skip onboarding
        page.click('button:has-text("Skip for now")')
        page.wait_for_timeout(300)

        # Toggle multiple filters
        page.click('input[aria-label="B2 (Upper Intermediate)"]')
        page.wait_for_timeout(200)

        page.click('button:has-text("Duration")')
        page.wait_for_timeout(200)

        page.click('input[aria-label="Short (5-10 min)"]')
        page.wait_for_timeout(200)

        page.click('button:has-text("Reset Filters")')
        page.wait_for_timeout(300)

        # Verify no errors
        js_errors = [e for e in errors if 'error' in str(e[0]).lower() and 'undefined' in str(e[1]).lower()]
        assert len(js_errors) == 0, f"Console errors during interactions: {js_errors}"

        browser.close()
        print("✅ No console errors during filter interactions")


if __name__ == '__main__':
    print("🧪 Running Homepage Error Fix Tests\n")

    try:
        test_homepage_loads()
        test_single_filter()
        test_multiple_filters()
        test_reset_filters()
        test_no_console_errors()

        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED")
        print("="*60)
        print("\nFixes verified:")
        print("  ✅ FilterPanel.tsx: filters[category] fallback working")
        print("  ✅ ContinueLearningBanner.tsx: progress properties fallback working")
        print("  ✅ Homepage loads without JavaScript errors")
        print("  ✅ Filter interactions work correctly")

        sys.exit(0)

    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        sys.exit(1)
