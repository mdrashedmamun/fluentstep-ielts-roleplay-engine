import React, { useState } from 'react';
import { RoleplayScript } from '../services/staticData';

interface NavigationButtonsProps {
  currentScenarioId: string;
  allScenarios: RoleplayScript[];
  onNavigate: (scenarioId: string, direction: 'prev' | 'next') => void;
  isLoading?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentScenarioId,
  allScenarios,
  onNavigate,
  isLoading = false
}) => {
  const [hoveredTooltip, setHoveredTooltip] = useState<'prev' | 'next' | null>(null);

  // Find current scenario index
  const currentIndex = allScenarios.findIndex(s => s.id === currentScenarioId);

  // Calculate boundaries
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allScenarios.length - 1;

  // Get adjacent scenarios
  const previousScenario = hasPrevious ? allScenarios[currentIndex - 1] : null;
  const nextScenario = hasNext ? allScenarios[currentIndex + 1] : null;

  const handlePrevious = () => {
    if (hasPrevious && previousScenario && !isLoading) {
      onNavigate(previousScenario.id, 'prev');
    }
  };

  const handleNext = () => {
    if (hasNext && nextScenario && !isLoading) {
      onNavigate(nextScenario.id, 'next');
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Previous Button */}
      <div className="relative group">
        <button
          onClick={handlePrevious}
          disabled={!hasPrevious || isLoading}
          onMouseEnter={() => setHoveredTooltip('prev')}
          onMouseLeave={() => setHoveredTooltip(null)}
          className={`
            w-11 h-11 rounded-full flex items-center justify-center transition-all
            font-bold text-sm flex items-center justify-center
            ${!hasPrevious || isLoading
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              : 'bg-white text-neutral-600 border-2 border-neutral-200 hover:border-primary-300 hover:text-primary-600 hover:shadow-md active:scale-95'
            }
          `}
          title="Previous scenario (Arrow Left)"
          aria-label="Previous scenario"
        >
          <i className="fas fa-chevron-left text-lg"></i>
        </button>

        {/* Previous Tooltip - desktop only */}
        {hoveredTooltip === 'prev' && hasPrevious && previousScenario && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 pointer-events-none hidden md:block">
            <div className="max-w-xs truncate">{previousScenario.topic}</div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900 rotate-45"></div>
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary-50 to-accent-50 rounded-full border border-primary-200">
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-primary-700 tracking-tight">Loading...</span>
        </div>
      )}

      {/* Next Button */}
      <div className="relative group">
        <button
          onClick={handleNext}
          disabled={!hasNext || isLoading}
          onMouseEnter={() => setHoveredTooltip('next')}
          onMouseLeave={() => setHoveredTooltip(null)}
          className={`
            w-11 h-11 rounded-full flex items-center justify-center transition-all
            font-bold text-sm flex items-center justify-center
            ${!hasNext || isLoading
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              : 'bg-white text-neutral-600 border-2 border-neutral-200 hover:border-primary-300 hover:text-primary-600 hover:shadow-md active:scale-95'
            }
          `}
          title="Next scenario (Arrow Right)"
          aria-label="Next scenario"
        >
          <i className="fas fa-chevron-right text-lg"></i>
        </button>

        {/* Next Tooltip - desktop only */}
        {hoveredTooltip === 'next' && hasNext && nextScenario && (
          <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 pointer-events-none hidden md:block">
            <div className="max-w-xs truncate text-right">{nextScenario.topic}</div>
            <div className="absolute top-full right-0 w-2 h-2 bg-neutral-900 rotate-45"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationButtons;
