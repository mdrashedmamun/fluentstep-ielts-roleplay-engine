"""
UI selectors for E2E tests.

Uses role-based, text-based, and ARIA-based selectors for resilience.
Follows hierarchy: role > text > aria > css (fallback only).
"""


class Selectors:
    """Collection of selectors for FluentStep UI elements."""

    # ========== Navigation & Pages ==========
    PAGE_TITLE = 'text="FluentStep: IELTS Roleplay Engine"'
    HERO_SECTION = 'text="Your Journey to English Fluency"'
    LIBRARY_PAGE = 'text="All Scenarios"'

    # ========== Scenario Cards (Library) ==========
    SCENARIO_START_BUTTON = 'button:has-text("Start")'
    SCENARIO_CARD = 'div[role="button"]:has-text("{scenario_title}")'

    # ========== Roleplay Viewer ==========
    ROLEPLAY_CONTAINER = 'div[data-testid="roleplay-container"]'
    DIALOGUE_TEXT = 'div:has-text("{dialogue_text}")'
    BLANK_UNREVEALED = 'button:has-text("Tap to discover")'
    BLANK_REVEALED = '.interactive-blank-container button:has-text("✕")'
    POPOVER = 'div:has-text("Native Alternatives")'
    POPOVER_CLOSE_BUTTON = 'button:has-text("✕")'

    # ========== Progress & Navigation ==========
    PROGRESS_BAR = 'div[role="progressbar"]'
    CONTINUE_BUTTON = 'button:has-text("Continue")'
    BACK_BUTTON = 'button:has-text("Back")'
    SKIP_BUTTON = 'button:has-text("Skip")'

    # ========== Deep Dive / Chunk Feedback ==========
    DEEP_DIVE_BUTTON = 'button[data-testid="deep-dive-button"]'
    FEEDBACK_MODAL = 'div[data-testid="feedback-modal"]'
    MODAL_BACKDROP = 'div:has-text("Chunk Feedback")'
    MODAL_CLOSE_BUTTON = 'button:has-text("×")'
    MODAL_EMPTY_STATE = 'text="Reveal more blanks to unlock chunk feedback"'

    # ========== Feedback Cards ==========
    FEEDBACK_CARD = '.rounded-2xl.border-2'  # CSS fallback (conservative selector)
    FEEDBACK_CATEGORY_BADGE = 'span:has-text("{category}")'
    FEEDBACK_EXPAND_BUTTON = 'button:has-text("Why It Works")'
    FEEDBACK_CORE_FUNCTION = 'text="{core_function}"'
    FEEDBACK_SITUATIONS = 'div:has-text("3 Real-Life Situations")'
    FEEDBACK_USAGE_NOTES = 'div:has-text("Native Usage Notes")'
    FEEDBACK_CONTRAST = 'div:has-text("Non-Native Contrast")'

    # ========== Completion Modal ==========
    COMPLETION_MODAL = 'text="Return to Library"'
    CELEBRATION_ANIMATION = 'canvas'
    RETURN_TO_LIBRARY_BUTTON = 'button:has-text("Return to Library")'

    # ========== Audio Controls ==========
    PLAY_AUDIO_BUTTON = 'button:has-text("▶")'
    PAUSE_AUDIO_BUTTON = 'button:has-text("⏸")'
    AUDIO_SLIDER = 'input[type="range"][aria-label*="audio"]'

    # ========== Filters (Homepage) ==========
    FILTER_CATEGORY = 'div:has-text("{category}")'
    FILTER_CHECKBOX = 'input[type="checkbox"][aria-label="{option}"]'
    FILTER_RESET = 'button:has-text("Reset")'

    # ========== Loading States ==========
    LOADING_SPINNER = 'div[class*="spinner"]'
    LOADING_SKELETON = 'div[class*="skeleton"]'

    @staticmethod
    def scenario_card_by_id(scenario_id: str) -> str:
        """Get selector for scenario card by scenario ID."""
        return f'button[data-scenario-id="{scenario_id}"]'

    @staticmethod
    def blank_by_index(index: int) -> str:
        """Get selector for blank at specific index."""
        return f'button[data-blank-index="{index}"]'

    @staticmethod
    def feedback_card_by_index(index: int) -> str:
        """Get selector for feedback card at specific index."""
        return f'div[data-feedback-index="{index}"]'
