import { useEffect } from 'react';

interface KeyboardCallbacks {
  onNext?: () => void;
  onBack?: () => void;
  onEscape?: () => void;
  onHelp?: () => void;
}

/**
 * Hook for keyboard navigation
 *
 * Keyboard shortcuts:
 * - Space/Enter: Next turn or advance dialogue
 * - Escape: Close popups, return to library
 * - Cmd/Ctrl + B: Go back to library
 * - ?: Show help/keyboard shortcuts
 */
export function useKeyboard(callbacks: KeyboardCallbacks): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      // Skip if focused on input/textarea
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return;
      }

      // Space or Enter - advance
      if ((e.key === ' ' || e.key === 'Enter') && !e.ctrlKey && !e.metaKey) {
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

      // Cmd/Ctrl + B - back
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        callbacks.onBack?.();
        return;
      }

      // ? - help (not with modifiers)
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        callbacks.onHelp?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
}
