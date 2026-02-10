/**
 * ScenarioWaypoint Component
 * Individual waypoint marker on the journey map
 * Displays status and handles interactions
 */

import React from 'react';
import { RoleplayScript } from '../services/staticData';
import { celebrateWithConfetti } from '../services/celebrationService';

interface ScenarioWaypointProps {
  scenario: RoleplayScript;
  position: { x: number; y: number };
  isCompleted: boolean;
  isHovered: boolean;
  isNextRecommended: boolean;
  onClick: () => void;
  onHover: (hovering: boolean) => void;
}

const ScenarioWaypoint: React.FC<ScenarioWaypointProps> = ({
  scenario,
  position,
  isCompleted,
  isHovered,
  isNextRecommended,
  onClick,
  onHover
}) => {
  // Determine waypoint styling based on state
  const radius = isHovered ? 28 : 20;
  const fill = isCompleted ? '#22C55E' : '#F97316';
  const opacity = isHovered ? 1 : 0.9;
  const glowFilter = isHovered ? 'url(#waypointGlow)' : 'none';

  const handleClick = () => {
    // Trigger mini confetti when completing a scenario
    if (isCompleted) {
      celebrateWithConfetti({
        particleCount: 12,
        duration: 800,
        spread: 45,
        startVelocity: 2
      });
    }
    onClick();
  };

  return (
    <g
      key={scenario.id}
      onClick={handleClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      aria-label={`${scenario.topic} - ${scenario.category} - ${isCompleted ? 'Completed' : 'Not started'}`}
    >
      {/* Main waypoint circle */}
      <circle
        cx={position.x}
        cy={position.y}
        r={radius}
        fill={fill}
        opacity={opacity}
        style={{
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          filter: glowFilter
        }}
      />

      {/* Pulse ring for next recommended */}
      {isNextRecommended && (
        <circle
          cx={position.x}
          cy={position.y}
          r="32"
          fill="none"
          stroke="#F97316"
          strokeWidth="2"
          opacity="0.6"
          style={{
            animation: 'waypoint-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
      )}

      {/* Status indicator */}
      <text
        x={position.x}
        y={position.y + 6}
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill="white"
        style={{
          pointerEvents: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {isCompleted ? '✓' : '○'}
      </text>

      {/* Tooltip on hover */}
      {isHovered && (
        <g>
          {/* Background box */}
          <rect
            x={position.x - 80}
            y={position.y - 60}
            width="160"
            height="50"
            rx="8"
            fill="white"
            stroke="#F97316"
            strokeWidth="2"
            filter="drop-shadow(0 2px 8px rgba(0,0,0,0.1))"
          />
          {/* Scenario title */}
          <text
            x={position.x}
            y={position.y - 35}
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill="#1F2937"
            style={{ pointerEvents: 'none' }}
          >
            {scenario.topic.substring(0, 16)}
            {scenario.topic.length > 16 ? '...' : ''}
          </text>
          {/* Category label */}
          <text
            x={position.x}
            y={position.y - 20}
            textAnchor="middle"
            fontSize="10"
            fill="#6B7280"
            style={{ pointerEvents: 'none' }}
          >
            {scenario.category}
          </text>
        </g>
      )}

      {/* Keyboard focus indicator */}
      <circle
        cx={position.x}
        cy={position.y}
        r={radius + 4}
        fill="none"
        stroke="none"
        style={{
          transition: 'stroke 0.2s'
        }}
      />
    </g>
  );
};

export default ScenarioWaypoint;
