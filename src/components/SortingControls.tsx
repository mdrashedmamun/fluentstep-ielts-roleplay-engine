import React, { useState, useRef, useEffect } from 'react';
import { SortOption } from '../types/ux-enhancements';

interface SortingControlsProps {
  currentSort: SortOption;
  onChange: (sort: SortOption) => void;
}

const SortingControls: React.FC<SortingControlsProps> = ({
  currentSort,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    {
      value: 'recommended' as const,
      label: 'Recommended for you',
      icon: '⭐',
      description: 'Based on your level & progress'
    },
    {
      value: 'recently_added' as const,
      label: 'Recently added',
      icon: '✨',
      description: 'Newest scenarios first'
    },
    {
      value: 'alphabetical' as const,
      label: 'A-Z',
      icon: '🔤',
      description: 'Alphabetical order'
    },
    {
      value: 'duration' as const,
      label: 'Duration',
      icon: '⏱️',
      description: 'Short to long'
    }
  ] as const;

  const currentOption = sortOptions.find(opt => opt.value === currentSort) ?? sortOptions[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
    return undefined;
  }, [isOpen]);

  const handleSelect = (value: SortOption) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Desktop button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:flex items-center gap-3 px-4 py-3 bg-white border-2 border-neutral-200 rounded-xl hover:border-primary-300 transition-all focus:outline-none focus:ring-2 focus:ring-primary-200 text-left min-w-[280px]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        type="button"
      >
        <span className="text-xl">{currentOption.icon}</span>
        <div className="flex-1">
          <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Sort by</div>
          <div className="text-neutral-800 font-semibold">{currentOption.label}</div>
        </div>
        <i className={`fas fa-chevron-down text-primary-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {/* Mobile button - compact version */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2.5 hover:bg-primary-50 rounded-lg transition-colors text-primary-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={`Sort: ${currentOption.label}`}
        type="button"
      >
        <i className="fas fa-sort text-lg"></i>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Overlay on mobile */}
          <div
            className="fixed inset-0 bg-black/40 md:hidden z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown content */}
          <div className="absolute top-full left-0 right-0 md:min-w-[320px] mt-2 bg-white border-2 border-neutral-200 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 md:right-auto md:left-0">
            {/* Header (mobile only) */}
            <div className="md:hidden px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="font-bold text-neutral-800">Sort by</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-neutral-700 transition-colors p-1"
                type="button"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Options */}
            <div className="py-2 md:py-1">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-6 py-4 md:py-3 hover:bg-primary-50 transition-colors flex items-center gap-3 border-l-4 ${
                    currentSort === option.value
                      ? 'border-l-primary-600 bg-primary-50'
                      : 'border-l-transparent'
                  }`}
                  role="option"
                  aria-selected={currentSort === option.value}
                  type="button"
                >
                  <span className="text-2xl md:text-lg">{option.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-neutral-800">{option.label}</div>
                    <div className="text-xs md:text-xs text-neutral-500 hidden md:block">{option.description}</div>
                  </div>
                  {currentSort === option.value && (
                    <i className="fas fa-check text-primary-600 font-bold"></i>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SortingControls;
