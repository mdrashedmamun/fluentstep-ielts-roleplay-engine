/**
 * FootstepTrail Component
 * Breadcrumb trail showing the path traveled so far
 * Fades out as it gets older in the journey
 */

import React from 'react';

interface FootstepTrailProps {
  completedPositions: Array<{ x: number; y: number }>;
}

const FootstepTrail: React.FC<FootstepTrailProps> = ({ completedPositions }) => {
  if (completedPositions.length === 0) {
    return null;
  }

  return (
    <g className="footstep-trail" opacity="0.6">
      {completedPositions.map((pos, idx) => {
        // Fade out older footsteps
        const progress = idx / Math.max(1, completedPositions.length - 1);
        const opacity = 0.3 + (progress * 0.4); // Ranges from 0.3 to 0.7

        // Alternate positioning for natural look
        const offsetX = idx % 2 === 0 ? -12 : 12;
        const offsetY = 18;

        // Scale slightly based on position (newer footsteps larger)
        const scale = 0.8 + progress * 0.4; // Ranges from 0.8 to 1.2

        return (
          <g key={idx} transform={`translate(${offsetX}, ${offsetY}) scale(${scale})`}>
            <text
              x={pos.x}
              y={pos.y}
              fontSize="12"
              opacity={opacity}
              textAnchor="middle"
              style={{
                transition: 'opacity 0.3s ease-out',
                pointerEvents: 'none',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
              }}
            >
              👣
            </text>
          </g>
        );
      })}
    </g>
  );
};

export default FootstepTrail;
