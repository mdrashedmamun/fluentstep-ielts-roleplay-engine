import React, { useState, useEffect } from 'react';

interface MuteToggleProps {
  isMuted: boolean;
  onToggle: () => void;
}

const MuteToggle: React.FC<MuteToggleProps> = ({ isMuted, onToggle }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState(isMuted ? 'Unmute' : 'Mute');

  useEffect(() => {
    setTooltipText(isMuted ? 'Unmute' : 'Mute');
  }, [isMuted]);

  return (
    <div className="relative group">
      <button
        onClick={onToggle}
        className={`
          w-11 h-11 rounded-full flex items-center justify-center
          transition-all duration-200 font-bold text-lg
          border-2 shadow-md
          ${isMuted
            ? 'bg-neutral-100 text-neutral-500 border-neutral-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
            : 'bg-white text-neutral-600 border-neutral-200 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50'
          }
          active:scale-95 transition-all
        `}
        title={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        aria-pressed={isMuted}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <i className={`fas ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 pointer-events-none z-50">
          {tooltipText}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default MuteToggle;
