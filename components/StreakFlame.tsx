/**
 * StreakFlame Component
 * Displays the current learning streak with animated flame
 */

import React, { useEffect, useState } from 'react';
import { getCurrentStreak, getStreakEmoji, getStreakMessage } from '../services/streakService';

interface StreakFlameProps {
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
}

const StreakFlame: React.FC<StreakFlameProps> = ({ size = 'md', showMessage = true }) => {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Update streak on mount and when tab becomes visible
    const updateStreak = () => {
      setStreak(getCurrentStreak());
    };

    updateStreak();

    // Listen for visibility change to update on tab return
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateStreak();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const sizeClasses = {
    sm: 'w-8 h-8 text-base',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-4xl'
  };

  const containerSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg'
  };

  if (streak === 0) {
    return (
      <div className={`${containerSize[size]} text-neutral-500`}>
        <span className="text-lg">🌟</span>
        <p className="font-semibold">Start today!</p>
      </div>
    );
  }

  const emoji = getStreakEmoji();
  const message = getStreakMessage();

  return (
    <div className="flex items-center gap-3">
      {/* Animated Flame */}
      <div className={`${sizeClasses[size]} flex items-center justify-center animate-pulse`}>
        {emoji}
      </div>

      {/* Streak Info */}
      <div className={containerSize[size]}>
        <div className="font-bold text-primary-700">
          {streak} day streak
        </div>
        {showMessage && (
          <p className="text-neutral-600 text-xs">{message}</p>
        )}
      </div>
    </div>
  );
};

export default StreakFlame;
