/**
 * HikerAvatar Component
 * Animated character that moves along the journey path
 * Shows progress through visual changes (color gradients, glow intensity)
 */

import React from 'react';

interface HikerAvatarProps {
  position: { x: number; y: number };
  completionPercentage: number;
  initials?: string;
}

const HikerAvatar: React.FC<HikerAvatarProps> = ({
  position,
  completionPercentage,
  initials = 'YO'
}) => {
  /**
   * Get gradient colors based on progress
   * Valley (start) -> Orange
   * Foothills (25%) -> Orange to Teal transition
   * Peak (50%) -> Teal
   * Summit (75%+) -> Green
   */
  const getGradientColors = () => {
    if (completionPercentage < 25) {
      return { start: '#F97316', end: '#FB923C' };
    }
    if (completionPercentage < 50) {
      return { start: '#FB923C', end: '#14B8A6' };
    }
    if (completionPercentage < 75) {
      return { start: '#14B8A6', end: '#22D3EE' };
    }
    return { start: '#22C55E', end: '#4ADE80' };
  };

  const gradientId = `hikerGradient-${Math.round(completionPercentage)}`;
  const colors = getGradientColors();

  // Scale pulse based on progress - more intense at milestones
  const pulseRadius = 32 + (completionPercentage % 25) * 0.4;

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: colors.start }} />
          <stop offset="100%" style={{ stopColor: colors.end }} />
        </linearGradient>
        <filter id="hikerGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className="hiker-avatar" style={{ transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        {/* Outer pulse ring - animates continuously */}
        <circle
          cx={position.x}
          cy={position.y}
          r={pulseRadius}
          fill="none"
          stroke={colors.start}
          strokeWidth="2"
          opacity="0.4"
          style={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />

        {/* Main avatar circle with gradient */}
        <circle
          cx={position.x}
          cy={position.y}
          r="24"
          fill={`url(#${gradientId})`}
          filter="url(#hikerGlow)"
          style={{
            transition: 'all 0.6s ease-out'
          }}
        />

        {/* Inner highlight for 3D effect */}
        <circle
          cx={position.x - 6}
          cy={position.y - 6}
          r="8"
          fill="white"
          opacity="0.3"
        />

        {/* Initials text */}
        <text
          x={position.x}
          y={position.y + 6}
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="white"
          fontFamily="'Outfit', sans-serif"
          style={{
            pointerEvents: 'none',
            transition: 'all 0.6s ease-out'
          }}
        >
          {initials.substring(0, 2).toUpperCase()}
        </text>

        {/* Achievement sparkle at milestones */}
        {completionPercentage % 25 < 5 && completionPercentage > 0 && (
          <>
            <text
              x={position.x - 28}
              y={position.y - 28}
              fontSize="16"
              opacity="0.8"
              style={{
                animation: 'float-up 1s ease-out forwards',
                pointerEvents: 'none'
              }}
            >
              ✨
            </text>
            <text
              x={position.x + 28}
              y={position.y - 28}
              fontSize="16"
              opacity="0.8"
              style={{
                animation: 'float-up 1s ease-out forwards 0.15s',
                pointerEvents: 'none'
              }}
            >
              ✨
            </text>
          </>
        )}
      </g>
    </>
  );
};

export default HikerAvatar;
