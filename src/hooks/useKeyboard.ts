import { useEffect, useRef } from 'react';

interface KeyboardCallbacks {
  onNext?: () => void;
  onBack?: () => void;
  onEscape?: () => void;
  onHelp?: () => void;
  onSearch?: () => void;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
}

/**
 * Hook for keyboard navigation
 *
 * Keyboard shortcuts:
 * - Space/Enter: Next turn or advance dialogue
 * - Escape: Close popups, return to library
 * - Cmd/Ctrl + B: Go back to library
 * - Cmd/Ctrl + K or /: Focus search bar
 * - Arrow Left: Previous scenario (in scenario view)
 * - Arrow Right: Next scenario (in scenario view)
 * - ?: Show help/keyboard shortcuts
 */
export function useKeyboard(callbacks: KeyboardCallbacks): void {
  const lastActionTimeRef = useRef<number>(0);
  const DEBOUNCE_MS = 100;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

      // Check if modal/dialog is open
      const isModalOpen = document.querySelector('[role="dialog"]') !== null;

      // Space or Enter - advance (skip if input focused)
      if ((e.key === ' ' || e.key === 'Enter') && !e.ctrlKey && !e.metaKey && !isInputFocused) {
        e.preventDefault();
        callbacks.onNext?.();
        return;
      }

      // Escape - close/return
      if (e.key === 'Escape') {
        e.preventDefault();
        callbacks.onEscape?.();
        return;
      }

      // Cmd/Ctrl + B - back (skip if input focused)
      if ((e.metaKey || e.ctrlKey) && e.key === 'b' && !isInputFocused) {
        e.preventDefault();
        callbacks.onBack?.();
        return;
      }

      // Cmd/Ctrl + K - search focus
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && !isModalOpen) {
        e.preventDefault();
        callbacks.onSearch?.();
        return;
      }

      // / - search focus (GitHub style, skip if input focused)
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.shiftKey && !isInputFocused && !isModalOpen) {
        e.preventDefault();
        callbacks.onSearch?.();
        return;
      }

      // Arrow keys for navigation (skip if input focused, only in scenario view)
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !isInputFocused && !isModalOpen) {
        // Check if we're in scenario view
        const isInScenario = window.location.pathname.includes('/scenario/');
        if (isInScenario) {
          // Apply debounce to prevent rapid repeated triggers
          const now = Date.now();
          if (now - lastActionTimeRef.current > DEBOUNCE_MS) {
            lastActionTimeRef.current = now;
            e.preventDefault();
            if (e.key === 'ArrowLeft') {
              callbacks.onNavigatePrevious?.();
            } else {
              callbacks.onNavigateNext?.();
            }
          }
        }
        return;
      }

      // ? - help (not with modifiers, skip if input focused)
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !isInputFocused) {
        e.preventDefault();
        callbacks.onHelp?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
}
