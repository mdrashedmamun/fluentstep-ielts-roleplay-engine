/**
 * LandscapeElements Component
 * Atmospheric decorations that give the journey map warmth and personality
 * Includes trees, mountains, clouds, sun, and other scenic elements
 */

import React from 'react';

interface LandscapeElementsProps {
  viewBoxHeight: number;
}

const LandscapeElements: React.FC<LandscapeElementsProps> = ({ viewBoxHeight }) => {
  return (
    <g className="landscape-elements" opacity="0.7" style={{ pointerEvents: 'none' }}>
      {/* === BOTTOM VALLEY: Starting Area === */}

      {/* Valley floor trees - welcoming start */}
      <text
        x="50"
        y={viewBoxHeight - 60}
        fontSize="32"
        opacity="0.8"
        style={{ animation: 'sway 3s ease-in-out infinite' }}
      >
        🌳
      </text>

      <text
        x="120"
        y={viewBoxHeight - 50}
        fontSize="28"
        opacity="0.7"
        style={{ animation: 'sway 3.5s ease-in-out infinite 0.2s' }}
      >
        🌲
      </text>

      <text
        x="180"
        y={viewBoxHeight - 70}
        fontSize="30"
        opacity="0.8"
        style={{ animation: 'sway 3.2s ease-in-out infinite 0.4s' }}
      >
        🌳
      </text>

      {/* Welcoming flowers at the start */}
      <text x="80" y={viewBoxHeight - 30} fontSize="16" opacity="0.6">
        🌸
      </text>
      <text x="150" y={viewBoxHeight - 20} fontSize="14" opacity="0.5">
        🌼
      </text>

      {/* === MID-JOURNEY: Foothills === */}

      {/* Rocks and terrain features */}
      <text
        x="300"
        y={viewBoxHeight / 2 + 80}
        fontSize="24"
        opacity="0.6"
        style={{ animation: 'sway 4s ease-in-out infinite' }}
      >
        🪨
      </text>

      <text
        x="450"
        y={viewBoxHeight / 2 + 40}
        fontSize="20"
        opacity="0.5"
        style={{ animation: 'sway 3.8s ease-in-out infinite 0.3s' }}
      >
        🌿
      </text>

      {/* Mid-journey trees */}
      <text
        x="600"
        y={viewBoxHeight / 2}
        fontSize="28"
        opacity="0.7"
        style={{ animation: 'sway 3.6s ease-in-out infinite 0.5s' }}
      >
        🌲
      </text>

      {/* === UPPER JOURNEY: High Elevation === */}

      {/* Mountain peaks - working towards summit */}
      <text
        x="750"
        y="200"
        fontSize="36"
        opacity="0.8"
        style={{ animation: 'float 4s ease-in-out infinite' }}
      >
        ⛰️
      </text>

      <text
        x="850"
        y="150"
        fontSize="32"
        opacity="0.7"
        style={{ animation: 'float 4.5s ease-in-out infinite 0.3s' }}
      >
        🏔️
      </text>

      {/* Final peak - summit area */}
      <text
        x="900"
        y="100"
        fontSize="40"
        opacity="0.9"
        style={{ animation: 'shimmer 3s ease-in-out infinite' }}
      >
        🏔️
      </text>

      {/* Victory flag at the very top */}
      <text
        x="920"
        y="70"
        fontSize="24"
        opacity="0.8"
        style={{ animation: 'wave 2s ease-in-out infinite' }}
      >
        🚩
      </text>

      {/* === SKY: Atmospheric Elements === */}

      {/* Sun - warm and welcoming */}
      <text
        x="150"
        y="80"
        fontSize="40"
        style={{
          animation: 'float 6s ease-in-out infinite',
          filter: 'drop-shadow(0 2px 4px rgba(249, 115, 22, 0.3))'
        }}
      >
        ☀️
      </text>

      {/* Clouds drifting across */}
      <text
        x="700"
        y="200"
        fontSize="32"
        opacity="0.6"
        style={{
          animation: 'drift 8s linear infinite',
          filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))'
        }}
      >
        ☁️
      </text>

      <text
        x="300"
        y="180"
        fontSize="28"
        opacity="0.5"
        style={{
          animation: 'drift 10s linear infinite 2s',
          filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))'
        }}
      >
        ☁️
      </text>

      <text
        x="550"
        y="240"
        fontSize="24"
        opacity="0.4"
        style={{
          animation: 'drift 12s linear infinite 4s',
          filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))'
        }}
      >
        ☁️
      </text>

      {/* Birds flying - sense of freedom and achievement */}
      <text
        x="400"
        y="120"
        fontSize="16"
        opacity="0.4"
        style={{
          animation: 'fly 6s ease-in-out infinite',
          pointerEvents: 'none'
        }}
      >
        🕊️
      </text>

      <text
        x="650"
        y="140"
        fontSize="14"
        opacity="0.3"
        style={{
          animation: 'fly 7s ease-in-out infinite 1s',
          pointerEvents: 'none'
        }}
      >
        🦅
      </text>

      {/* === DECORATIVE: Journey Milestones === */}

      {/* Campfire at mid-journey point */}
      <text
        x="500"
        y={viewBoxHeight / 2.5}
        fontSize="20"
        opacity="0.5"
        style={{
          animation: 'flicker 1.5s ease-in-out infinite',
          pointerEvents: 'none'
        }}
      >
        🔥
      </text>

      {/* Tent at 3/4 point (almost there!) */}
      <text
        x="700"
        y={viewBoxHeight * 0.3}
        fontSize="18"
        opacity="0.6"
        style={{ pointerEvents: 'none' }}
      >
        ⛺
      </text>
    </g>
  );
};

export default LandscapeElements;
