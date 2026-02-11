import React, { useState, useRef, useEffect } from 'react';
import { FilterState } from '../types/ux-enhancements';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  scenarioCounts: {
    total: number;
    filtered: number;
  };
}

type FilterSection = 'difficulty' | 'duration' | 'status';

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onReset,
  scenarioCounts
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<FilterSection>>(new Set(['difficulty']));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Manage focus for drawer (a11y) and keyboard handling
  useEffect(() => {
    if (isDrawerOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    if (!isDrawerOpen) {
      return;
    }

    // Handle Escape key to close drawer
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDrawerOpen]);

  const toggleSection = (section: FilterSection) => {
    const newSections = new Set(expandedSections);
    if (newSections.has(section)) {
      newSections.delete(section);
    } else {
      newSections.add(section);
    }
    setExpandedSections(newSections);
  };

  const toggleFilter = (category: keyof FilterState, value: string) => {
    const currentValues = filters[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    onChange({
      ...filters,
      [category]: newValues
    });
  };

  const isAnyFilterActive =
    filters.difficulty.length > 0 ||
    filters.duration.length > 0 ||
    filters.status.length > 0;

  const difficultyOptions = [
    { value: 'B2', label: 'B2 (Upper Intermediate)', icon: '📚' },
    { value: 'C1', label: 'C1 (Advanced)', icon: '🎓' }
  ];

  const durationOptions = [
    { value: 'short', label: 'Short (5-10 min)', icon: '⚡' },
    { value: 'medium', label: 'Medium (10-15 min)', icon: '⏱️' },
    { value: 'long', label: 'Long (15+ min)', icon: '🏔️' }
  ];

  const statusOptions = [
    { value: 'not_started', label: 'Not Started', icon: '🆕' },
    { value: 'in_progress', label: 'In Progress', icon: '🔄' },
    { value: 'completed', label: 'Completed', icon: '✅' }
  ];

  const FilterAccordion = ({
    title,
    section,
    options
  }: {
    title: string;
    section: FilterSection;
    options: Array<{ value: string; label: string; icon: string }>;
  }) => {
    const isExpanded = expandedSections.has(section);
    const selectedValues = filters[section] as string[];

    return (
      <div className="border-b border-neutral-200 last:border-b-0">
        <button
          onClick={() => toggleSection(section)}
          className="w-full flex items-center justify-between px-4 py-4 hover:bg-neutral-50 transition-colors"
          aria-expanded={isExpanded}
          type="button"
        >
          <span className="font-semibold text-neutral-800">{title}</span>
          <i className={`fas fa-chevron-down text-primary-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}></i>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 bg-neutral-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => toggleFilter(section, option.value)}
                  className="w-5 h-5 rounded border-2 border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-200 cursor-pointer accent-primary-600"
                  aria-label={option.label}
                />
                <span className="text-lg">{option.icon}</span>
                <span className="text-neutral-700 group-hover:text-neutral-900 transition-colors">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  const panelContent = (
    <div className="space-y-6">
      {/* Filter sections */}
      <div className="border border-neutral-200 rounded-xl overflow-hidden">
        <FilterAccordion
          title="Difficulty"
          section="difficulty"
          options={difficultyOptions}
        />
        <FilterAccordion
          title="Duration"
          section="duration"
          options={durationOptions}
        />
        <FilterAccordion
          title="Status"
          section="status"
          options={statusOptions}
        />
      </div>

      {/* Results counter */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 p-4 rounded-xl border border-primary-200">
        <div className="text-sm text-neutral-700 font-medium" aria-live="polite" aria-atomic="true">
          <span className="text-primary-600 font-bold">{scenarioCounts.filtered}</span> of{' '}
          <span className="text-accent-600 font-bold">{scenarioCounts.total}</span> scenarios
        </div>
      </div>

      {/* Reset button */}
      {isAnyFilterActive && (
        <button
          onClick={onReset}
          className="w-full py-3 px-4 bg-white border-2 border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-50 hover:border-neutral-400 transition-all active:scale-95"
          type="button"
        >
          <i className="fas fa-redo mr-2"></i>
          Reset Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop version */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        {panelContent}
      </div>

      {/* Mobile version - Icon button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-2.5 hover:bg-primary-50 rounded-lg transition-colors text-primary-600 min-h-[44px] min-w-[44px] flex items-center justify-center relative focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
          type="button"
          aria-label={`Open filters ${isAnyFilterActive ? '(active)' : ''}`}
          aria-expanded={isDrawerOpen}
        >
          <i className="fas fa-sliders-h text-lg"></i>
          {isAnyFilterActive && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-600 rounded-full"></span>
          )}
        </button>

        {/* Mobile drawer overlay - backdrop with focus trap */}
        {isDrawerOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 transition-all duration-200 animate-in fade-in md:hidden"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile drawer - full height slide-up animation */}
        {isDrawerOpen && (
          <div
            ref={drawerRef}
            className="fixed bottom-0 right-0 left-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-3 duration-300 motion-safe:duration-300 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-lg font-bold text-neutral-800">Filters</h2>
              <button
                ref={closeButtonRef}
                onClick={() => setIsDrawerOpen(false)}
                className="text-neutral-500 hover:text-neutral-700 transition-colors p-2 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                type="button"
                aria-label="Close filters"
                title="Close (Esc)"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 pb-20">
              {panelContent}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FilterPanel;
