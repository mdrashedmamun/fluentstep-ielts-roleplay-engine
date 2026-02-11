import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { celebrateWithConfetti, playSuccessSound } from '../services/celebrationService';
import { AchievementType } from '../types/ux-enhancements';

interface CelebrationOverlayProps {
  isVisible: boolean;
  achievement: {
    type: AchievementType;
    message: string;
    soundId?: 'completion' | 'celebration';
  };
  onDismiss: () => void;
}

const getAchievementBadgeDetails = (
  type: AchievementType
): {
  icon: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  title: string;
} => {
  switch (type) {
    case 'scenario_complete':
      return {
        icon: 'fa-star',
        bgColor: 'from-yellow-50 to-orange-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-300',
        title: 'Scenario Complete'
      };
    case 'milestone_25':
      return {
        icon: 'fa-gem',
        bgColor: 'from-blue-50 to-cyan-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300',
        title: 'Quarter Way There'
      };
    case 'milestone_50':
      return {
        icon: 'fa-fire',
        bgColor: 'from-orange-50 to-red-50',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-300',
        title: 'Halfway Home'
      };
    case 'milestone_75':
      return {
        icon: 'fa-crown',
        bgColor: 'from-purple-50 to-pink-50',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-300',
        title: 'Almost There'
      };
    case 'milestone_100':
      return {
        icon: 'fa-trophy',
        bgColor: 'from-green-50 to-teal-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
        title: 'Master Complete'
      };
  }
};

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  isVisible,
  achievement,
  onDismiss
}) => {
  const [displayMessage, setDisplayMessage] = useState(achievement.message);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  const badgeDetails = getAchievementBadgeDetails(achievement.type);

  // Listen for prefers-reduced-motion changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Trigger celebration effects when visible
  useEffect(() => {
    if (!isVisible) return;

    // Start confetti animation (skip if reduced motion is enabled)
    if (!prefersReducedMotion) {
      celebrateWithConfetti({
        particleCount: 50,
        duration: 3000,
        colors: ['#F97316', '#14B8A6', '#22C55E', '#3B82F6', '#8B5CF6'],
        spread: 90,
        startVelocity: 5
      });
    }

    // Play success sound
    setTimeout(() => {
      playSuccessSound();
    }, 200);

    // Auto-dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(dismissTimer);
  }, [isVisible, onDismiss, prefersReducedMotion]);

  if (!isVisible) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm"
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Celebration card */}
      <div className={`relative max-w-md w-full ${
        prefersReducedMotion
          ? 'scale-100 opacity-100'
          : 'animate-in zoom-in-95 scale-95 duration-300'
      }`}>
        <div className={`
          bg-gradient-to-br ${badgeDetails.bgColor}
          rounded-3xl shadow-2xl border-2 ${badgeDetails.borderColor}
          p-8 flex flex-col items-center gap-6 text-center
        `}>
          {/* Badge Icon */}
          <div className={`
            w-24 h-24 rounded-full flex items-center justify-center
            bg-gradient-to-br ${badgeDetails.bgColor}
            border-3 ${badgeDetails.borderColor}
            shadow-lg ${prefersReducedMotion ? '' : 'animate-bounce'}
          `}>
            <i className={`fas ${badgeDetails.icon} text-5xl ${badgeDetails.textColor}`}></i>
          </div>

          {/* Achievement Title */}
          <div>
            <h2 className={`text-2xl font-black font-display tracking-tight mb-2 ${badgeDetails.textColor}`}>
              {badgeDetails.title}
            </h2>
            <p className="text-neutral-700 text-base font-semibold leading-relaxed">
              {displayMessage}
            </p>
          </div>

          {/* Celebration decorations */}
          <div className="flex gap-2 text-2xl opacity-70">
            <span>✨</span>
            <span>🎉</span>
            <span>✨</span>
          </div>

          {/* Close button */}
          <button
            onClick={onDismiss}
            className={`
              mt-4 px-6 py-2.5 rounded-xl font-bold text-sm
              bg-gradient-to-r from-white to-neutral-50
              ${badgeDetails.textColor}
              border-2 ${badgeDetails.borderColor}
              hover:shadow-md transition-all active:scale-95
              uppercase tracking-wider
            `}
            aria-label="Dismiss celebration"
          >
            Continue
          </button>

          {/* Subtle instruction text */}
          <p className="text-xs text-neutral-600 opacity-75 font-medium">
            (Closes automatically in 5 seconds)
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CelebrationOverlay;
