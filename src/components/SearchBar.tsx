import React, { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  isCompact?: boolean; // Mobile mode (icon only)
  isLoading?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search scenarios...',
  isCompact = false,
  isLoading = false,
  inputRef: externalRef
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = externalRef || internalRef;

  // Handle overlay close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        if (!value) {
          setIsExpanded(false);
        }
      }
    };

    if (isExpanded) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
    return undefined;
  }, [isExpanded, value]);

  // Auto-focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleClear = () => {
    onClear();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Escape to clear search when focused, or close mobile overlay
    if (e.key === 'Escape') {
      e.preventDefault();
      if (value) {
        onClear();
      } else if (isCompact && isExpanded) {
        setIsExpanded(false);
      }
    }
  };

  // Desktop version (full width)
  if (!isCompact) {
    return (
      <div className="w-full max-w-md">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            {isLoading ? (
              <i className="fas fa-spinner animate-spin"></i>
            ) : (
              <i className="fas fa-search"></i>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Search scenarios"
            className="w-full pl-12 pr-10 py-3 bg-white border-2 border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
          />

          {value && (
            <button
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-1"
              type="button"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Mobile version (icon button with overlay)
  return (
    <div>
      {/* Icon button for mobile */}
      <button
        onClick={() => setIsExpanded(true)}
        aria-label="Open search"
        className="p-2.5 hover:bg-primary-50 rounded-lg transition-colors text-primary-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
        type="button"
      >
        <i className="fas fa-search text-lg"></i>
      </button>

      {/* Overlay search panel - backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-all duration-200 animate-in fade-in"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}

      {/* Overlay search panel - content */}
      {isExpanded && (
        <div className="absolute top-16 left-4 right-4 md:hidden z-50 bg-white rounded-xl shadow-lg p-4 animate-in fade-in slide-in-from-top-2 duration-150 motion-safe:duration-200">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {isLoading ? (
                <i className="fas fa-spinner animate-spin"></i>
              ) : (
                <i className="fas fa-search"></i>
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              aria-label="Search scenarios"
              className="w-full pl-12 pr-10 py-3 bg-neutral-50 border-2 border-neutral-200 rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
            />

            {value && (
              <button
                onClick={handleClear}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-1"
                type="button"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="mt-3 w-full py-2 text-sm text-neutral-600 hover:text-neutral-800 transition-colors font-medium"
            type="button"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
