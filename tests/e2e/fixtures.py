"""
Pytest fixtures for E2E tests.

Provides fixtures for browser setup, page navigation, and logging.
"""

import pytest
from playwright.sync_api import sync_playwright, Page, Browser
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from config import (
    BASE_URL, TIMEOUT_LOAD, TIMEOUT_ELEMENT, TIMEOUT_ACTION,
    BROWSER, HEADLESS, SLOW_MO, VIEWPORT
)


@pytest.fixture(scope="function")
def browser():
    """Create and teardown browser instance."""

    with sync_playwright() as p:
        browser_instance = getattr(p, BROWSER).launch(
            headless=HEADLESS,
            slow_mo=SLOW_MO,
        )
        yield browser_instance
        browser_instance.close()


@pytest.fixture(scope="function")
def page(browser) -> Page:
    """Create page with logging and timeouts."""

    page_instance = browser.new_page(
        viewport=VIEWPORT
    )

    # Set timeouts
    page_instance.set_default_timeout(TIMEOUT_ELEMENT)
    page_instance.set_default_navigation_timeout(TIMEOUT_LOAD)

    # Capture console logs
    console_messages = []
    console_errors = []

    def on_console(msg):
        console_messages.append({
            'type': msg.type,
            'text': msg.text,
            'args': msg.args,
        })
        if msg.type == 'error':
            console_errors.append(msg.text)

    page_instance.on('console', on_console)

    # Store for access in tests
    page_instance.console_errors = console_errors
    page_instance.console_messages = console_messages

    yield page_instance

    page_instance.close()


@pytest.fixture(scope="function")
def goto_scenario(page: Page):
    """Helper fixture to navigate to a scenario."""

    def _goto(scenario_id: str):
        """Navigate to scenario and reach the interactive turn."""
        # First, go to homepage (with extended timeout for slower connections)
        page.goto(f"{BASE_URL}/", timeout=TIMEOUT_LOAD)
        page.wait_for_load_state('networkidle', timeout=TIMEOUT_LOAD)

        # Skip the homepage onboarding if it appears
        skip_btns = page.locator('button:has-text("Skip for now")').all()
        if len(skip_btns) > 0:
            skip_btns[0].click()
            page.wait_for_load_state('networkidle')

        # Navigate to the scenario (with extended timeout)
        url = f"{BASE_URL}/scenario/{scenario_id}"
        page.goto(url, wait_until='load', timeout=TIMEOUT_LOAD)

        # Wait for the scenario onboarding/tutorial to appear
        page.wait_for_selector('button:has-text("Skip for now"), button:has-text("Next Turn")', timeout=TIMEOUT_LOAD)

        # Close the scenario onboarding/tutorial if it appears
        skip_btns = page.locator('button:has-text("Skip for now")').all()
        if len(skip_btns) > 0:
            # Skip the last one (scenario-specific, not homepage)
            skip_btns[-1].click()
            page.wait_for_load_state('networkidle')

        # Click Next Turn to reach the interactive user turn with blanks
        next_turn = page.locator('button:has-text("Next Turn")')
        if next_turn.is_visible():
            next_turn.click()
            page.wait_for_load_state('networkidle')

        # Wait for blanks to appear
        page.wait_for_selector('button:has-text("Tap to discover")', timeout=TIMEOUT_LOAD)

        return page

    return _goto


@pytest.fixture(scope="function")
def load_home(page: Page):
    """Helper fixture to load homepage."""

    def _load():
        page.goto(BASE_URL)
        page.wait_for_load_state('networkidle')
        return page

    return _load


@pytest.fixture(scope="function")
def timer():
    """Simple timer for measuring durations."""

    class Timer:
        def __init__(self):
            self.start_time = None

        def start(self):
            import time
            self.start_time = time.time()

        def stop(self) -> float:
            import time
            return (time.time() - self.start_time) * 1000  # ms

    return Timer()
