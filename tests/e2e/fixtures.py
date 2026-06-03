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


@pytest.fixture(scope="session")
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
    """Create an isolated page while reusing the browser process."""

    context = browser.new_context(viewport=VIEWPORT)
    context.add_init_script(
        "window.localStorage.setItem('fluentstep:skipOnboarding', 'true');"
    )
    page_instance = context.new_page()

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
    context.close()


@pytest.fixture(scope="function")
def goto_scenario(page: Page):
    """Helper fixture to navigate to a scenario."""

    def _goto(scenario_id: str):
        """Navigate to scenario and reach the interactive turn."""
        # First, prove the local app route is responding. Vite/HMR and media can keep
        # network activity open, so wait for DOM readiness rather than full load/networkidle.
        page.goto(f"{BASE_URL}/", wait_until='domcontentloaded', timeout=TIMEOUT_LOAD)
        page.wait_for_selector('#root', timeout=TIMEOUT_ELEMENT)

        # Skip the homepage onboarding if it appears despite the localStorage guard.
        skip_btns = page.locator('button:has-text("Skip for now")').all()
        if len(skip_btns) > 0:
            skip_btns[0].click()
            page.wait_for_timeout(250)

        # Navigate to the scenario. Use DOM readiness plus explicit roleplay controls.
        url = f"{BASE_URL}/scenario/{scenario_id}"
        page.goto(url, wait_until='domcontentloaded', timeout=TIMEOUT_LOAD)

        # Wait for the scenario onboarding/tutorial to appear
        page.wait_for_selector('button:has-text("Skip for now"), button:has-text("Next Turn")', timeout=TIMEOUT_LOAD)

        # Close the scenario onboarding/tutorial if it appears
        skip_btns = page.locator('button:has-text("Skip for now")').all()
        if len(skip_btns) > 0:
            # Skip the last one (scenario-specific, not homepage)
            skip_btns[-1].click()
            page.wait_for_timeout(250)

        # Advance until the first learner blank appears. Some scenarios have
        # multiple setup turns before the first interactive blank.
        for _ in range(8):
            blanks = page.locator('button:has-text("Tap to discover")')
            if blanks.count() > 0 and blanks.first.is_visible():
                return page

            next_turn = page.locator('button:has-text("Next Turn")')
            if next_turn.count() > 0 and next_turn.first.is_visible():
                next_turn.first.click()
                page.wait_for_timeout(250)
                continue

            page.wait_for_selector(
                'button:has-text("Tap to discover"), button:has-text("Next Turn")',
                timeout=TIMEOUT_ELEMENT,
            )

        # Wait for blanks to appear before handing the page to tests.
        page.wait_for_selector('button:has-text("Tap to discover")', timeout=TIMEOUT_LOAD)

        return page

    return _goto


@pytest.fixture(scope="function")
def load_home(page: Page):
    """Helper fixture to load homepage."""

    def _load():
        page.goto(BASE_URL, wait_until='domcontentloaded', timeout=TIMEOUT_LOAD)
        page.wait_for_selector('#root', timeout=TIMEOUT_ELEMENT)
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
