import React from 'react';
import { Button } from '../design-system/components/Button';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  key: string;
  description: string;
  context: string;
}

const shortcuts: Shortcut[] = [
  {
    key: 'Cmd/Ctrl + K',
    description: 'Focus search bar',
    context: 'Library view'
  },
  {
    key: '/',
    description: 'Focus search bar (GitHub style)',
    context: 'Library view'
  },
  {
    key: 'Space / Enter',
    description: 'Advance to next dialogue turn',
    context: 'During roleplay'
  },
  {
    key: 'Arrow Left / Right',
    description: 'Navigate to previous/next scenario',
    context: 'During roleplay'
  },
  {
    key: 'Escape',
    description: 'Close popup or clear search',
    context: 'Anywhere'
  },
  {
    key: 'Cmd/Ctrl + B',
    description: 'Go back to scenario library',
    context: 'During roleplay'
  },
  {
    key: '?',
    description: 'Open keyboard shortcuts',
    context: 'Anywhere'
  }
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-300 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 text-2xl w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {shortcuts.map((shortcut, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
            >
              <div className="flex-shrink-0">
                <kbd className="px-3 py-1.5 bg-slate-100 text-slate-900 text-sm font-bold rounded-md border border-slate-300">
                  {shortcut.key}
                </kbd>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{shortcut.description}</p>
                <p className="text-xs text-slate-500 mt-1">{shortcut.context}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50">
          <Button variant="primary" onClick={onClose} className="w-full">
            Got It
          </Button>
        </div>
      </div>
    </div>
  );
};
