/**
 * JourneyMap Component
 * Interactive mountain journey map with scenario waypoints
 * Transforms the grid into a spatial, visual learning experience
 */

import React, { useState, useMemo, useCallback } from 'react';
import { RoleplayScript } from '../services/staticData';
import ScenarioWaypoint from './ScenarioWaypoint';
import { useMilestoneDetection } from '../hooks/useMilestoneDetection';
import { getEncouragementMessage, getZoneDescription, getMotivationalPhrase } from '../services/encouragementMessages';
import { generateOrganicPath, generateSmoothPathD } from '../services/organicPathGenerator';
import HandwrittenNote from './HandwrittenNote';
import HikerAvatar from './HikerAvatar';
import FootstepTrail from './FootstepTrail';
import LandscapeElements from './LandscapeElements';

interface JourneyMapProps {
  scenarios: RoleplayScript[];
  completedScenarios: Set<string>;
  onSelect: (scriptId: string) => void;
  filteredScenarioIds?: string[];
}

interface WaypointPosition {
  id: string;
  x: number;
  y: number;
  scenario: RoleplayScript;
}

/**
 * Calculate winding mountain path coordinates for all scenarios
 * Uses organic path generator for natural-looking curves
 */
function calculateWaypointPositions(scenarios: RoleplayScript[]): WaypointPosition[] {
  const viewBoxWidth = 1000;
  const viewBoxHeight = 1400;

  const organicPoints = generateOrganicPath(scenarios.length, viewBoxWidth, viewBoxHeight);

  return scenarios.map((scenario, index) => {
    const point = organicPoints[index];
    return {
      id: scenario.id,
      x: point?.x ?? 500,
      y: point?.y ?? 700,
      scenario
    };
  });
}

const JourneyMap: React.FC<JourneyMapProps> = ({
  scenarios,
  completedScenarios,
  onSelect,
  filteredScenarioIds
}) => {
  const [hoveredScenarioId, setHoveredScenarioId] = useState<string | null>(null);

  // Determine if a scenario is filtered (matches current filters)
  const isScenarioFiltered = (scenarioId: string) => {
    // If no filters applied, all scenarios are considered filtered
    if (!filteredScenarioIds) {
      return true;
    }
    return filteredScenarioIds.includes(scenarioId);
  };

  const waypointPositions = useMemo(
    () => calculateWaypointPositions(scenarios),
    [scenarios]
  );

  const pathD = useMemo(
    () => generateSmoothPathD(generateOrganicPath(scenarios.length)),
    [scenarios.length]
  );

  const handleWaypointClick = useCallback((scriptId: string) => {
    onSelect(scriptId);
  }, [onSelect]);

  const handleWaypointHover = useCallback((scriptId: string | null) => {
    setHoveredScenarioId(scriptId);
  }, []);

  // Calculate progress statistics
  const completionPercentage = scenarios.length > 0
    ? Math.round((completedScenarios.size / scenarios.length) * 100)
    : 0;

  // Activate milestone detection with automatic celebrations
  useMilestoneDetection(completionPercentage);

  // Group scenarios by category for zone visualization
  const categoryGroups = useMemo(() => {
    const groups = new Map<string, WaypointPosition[]>();
    waypointPositions.forEach(pos => {
      const cat = pos.scenario.category;
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(pos);
    });
    return groups;
  }, [waypointPositions]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
      {/* Journey Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-4xl font-black text-neutral-800 tracking-tight font-display">
          Your Learning <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">Journey</span>
        </h2>
        <p className="text-neutral-600 font-medium">
          Climb from everyday conversations to advanced discussions. Each waypoint is a scenario.
        </p>
      </div>

      {/* Journey Map SVG Container */}
      <div className="bg-gradient-to-b from-green-50 via-white to-blue-50 rounded-3xl p-4 sm:p-8 border-2 border-primary-200 shadow-lg overflow-hidden">
        <svg
          viewBox="0 0 1000 1400"
          className="w-full h-auto min-h-[600px] sm:min-h-[800px] cursor-pointer"
          style={{ maxWidth: '100%' }}
        >
          {/* SVG Definitions */}
          <defs>
            {/* Gradient for upcoming path (dashed) */}
            <linearGradient
              id="pathGradientUpcoming"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" style={{ stopColor: '#D1D5DB', stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: '#9CA3AF', stopOpacity: 0.3 }} />
            </linearGradient>

            {/* Gradient for completed path */}
            <linearGradient
              id="pathGradientCompleted"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" style={{ stopColor: '#F97316', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#14B8A6', stopOpacity: 0.8 }} />
            </linearGradient>

            {/* Filter for glow effect */}
            <filter id="waypointGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Shadow filter for landscape elements */}
            <filter id="shadowFilter">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
            </filter>
          </defs>

          {/* Atmospheric landscape elements */}
          <LandscapeElements viewBoxHeight={1400} />

          {/* Completed path section (colored) */}
          <path
            d={pathD}
            stroke="url(#pathGradientCompleted)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.7}
            style={{
              strokeDasharray: `${(completionPercentage / 100) * 5000} 5000`,
              transition: 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />

          {/* Upcoming path section (dashed gray) */}
          <path
            d={pathD}
            stroke="url(#pathGradientUpcoming)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="8,4"
            opacity={0.4}
          />

          {/* Footstep trail behind completed waypoints */}
          <FootstepTrail
            completedPositions={waypointPositions
              .filter(pos => completedScenarios.has(pos.id))
              .map(pos => ({ x: pos.x, y: pos.y }))}
          />

          {/* Hiker avatar at current progress */}
          {completedScenarios.size > 0 && waypointPositions.length > 0 && (
            <HikerAvatar
              position={waypointPositions[Math.min(completedScenarios.size - 1, waypointPositions.length - 1)] || { x: 500, y: 700 }}
              completionPercentage={completionPercentage}
              initials="YO"
            />
          )}

          {/* Waypoints (interactive scenario markers) */}
          {waypointPositions.map((pos) => {
            const isCompleted = completedScenarios.has(pos.id);
            const isHovered = hoveredScenarioId === pos.id;
            const isNextRecommended = !isCompleted &&
              Array.from(completedScenarios).length < scenarios.length &&
              Array.from(completedScenarios).length === Array.from(waypointPositions).findIndex(p => p.id === pos.id);
            const isFiltered = isScenarioFiltered(pos.id);

            return (
              <g key={pos.id} style={{ opacity: isFiltered ? 1 : 0.3, transition: 'opacity 0.3s ease' }}>
                {/* Waypoint circle with hover glow */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered ? 28 : 20}
                  fill={isCompleted ? '#22C55E' : '#F97316'}
                  opacity={isHovered ? 1 : 0.9}
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: isFiltered ? 'pointer' : 'default',
                    filter: isHovered ? 'url(#waypointGlow)' : (isFiltered ? 'none' : 'grayscale(1)'),
                    pointerEvents: isFiltered ? 'auto' : 'none'
                  }}
                  onClick={() => isFiltered && handleWaypointClick(pos.id)}
                  onMouseEnter={() => isFiltered && handleWaypointHover(pos.id)}
                  onMouseLeave={() => isFiltered && handleWaypointHover(null)}
                />

                {/* Pulse ring for next recommended scenario */}
                {isNextRecommended && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="32"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="2"
                    opacity="0.6"
                    style={{
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}
                  />
                )}

                {/* Waypoint status indicator */}
                <text
                  x={pos.x}
                  y={pos.y + 6}
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

                {/* Scenario label on hover */}
                {isHovered && (
                  <g>
                    {/* Tooltip background */}
                    <rect
                      x={pos.x - 80}
                      y={pos.y - 60}
                      width="160"
                      height="50"
                      rx="8"
                      fill="white"
                      stroke="#F97316"
                      strokeWidth="2"
                      filter="url(#shadow)"
                    />
                    {/* Tooltip text */}
                    <text
                      x={pos.x}
                      y={pos.y - 35}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill="#1F2937"
                      style={{ pointerEvents: 'none' }}
                    >
                      {pos.scenario.topic.substring(0, 16)}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y - 20}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#6B7280"
                      style={{ pointerEvents: 'none' }}
                    >
                      {pos.scenario.category}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* SVG Animations */}
        <style>{`
          @keyframes pulse {
            0% {
              stroke-width: 2;
              opacity: 0.6;
              r: 32px;
            }
            50% {
              stroke-width: 1;
              opacity: 0.3;
              r: 42px;
            }
            100% {
              stroke-width: 2;
              opacity: 0.6;
              r: 32px;
            }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }

          @keyframes float-up {
            0% { opacity: 1; transform: translateY(0px); }
            100% { opacity: 0; transform: translateY(-30px); }
          }

          @keyframes sway {
            0%, 100% { transform: translateX(0px); }
            50% { transform: translateX(4px); }
          }

          @keyframes drift {
            0% { transform: translateX(-100px); }
            100% { transform: translateX(100px); }
          }

          @keyframes fly {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(20px, -10px); }
          }

          @keyframes flicker {
            0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 0.8; }
            20%, 24%, 55% { opacity: 0.4; }
          }

          @keyframes wave {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(10deg); }
            75% { transform: rotate(-10deg); }
          }

          @keyframes shimmer {
            0%, 100% { opacity: 0.8; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }

          .hiker-avatar { will-change: transform; }
        `}</style>
      </div>

      {/* Journey Stats Footer - Warm & Personal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Progress Card */}
        <div className="bg-gradient-to-br from-primary-50 to-orange-50 p-6 rounded-3xl border-2 border-primary-100 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-primary-700 font-bold uppercase tracking-wider">Your Progress</p>
            <span className="text-2xl">📈</span>
          </div>
          <p className="text-5xl font-black text-transparent bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text font-display">
            {completionPercentage}%
          </p>
          <p className="text-sm text-neutral-700 mt-3 font-medium">
            {completedScenarios.size} of {scenarios.length} conversations mastered
          </p>
          {completionPercentage >= 25 && (
            <p className="text-lg text-primary-600 mt-2" style={{ fontFamily: "'Caveat', cursive" }}>
              {getMotivationalPhrase(completionPercentage)}
            </p>
          )}
        </div>

        {/* Current Zone Card */}
        <div className="bg-gradient-to-br from-accent-50 to-teal-50 p-6 rounded-3xl border-2 border-accent-100 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-accent-700 font-bold uppercase tracking-wider">Current Zone</p>
            <span className="text-2xl">{getZoneDescription(completionPercentage).emoji}</span>
          </div>
          <p className="text-2xl font-bold text-accent-700 font-display">
            {getZoneDescription(completionPercentage).name}
          </p>
          <p className="text-sm text-neutral-700 mt-3 font-medium">
            {getZoneDescription(completionPercentage).description}
          </p>
        </div>

        {/* Encouragement Card */}
        <div className="bg-gradient-to-br from-success-50 to-green-50 p-6 rounded-3xl border-2 border-success-100 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-success-700 font-bold uppercase tracking-wider">Keep Going</p>
            <span className="text-2xl">
              {completionPercentage === 0 ? '🥾' : completionPercentage === 100 ? '🏆' : '🚀'}
            </span>
          </div>
          <p className="text-sm text-neutral-700 mt-3 font-medium leading-relaxed">
            {getEncouragementMessage(completionPercentage, completedScenarios.size).title}
          </p>
          <p className="text-xs text-neutral-600 mt-2 italic">
            💡 Come back tomorrow to keep your streak alive!
          </p>
        </div>
      </div>

      {/* Handwritten Encouragement Note at Milestones */}
      {(completionPercentage === 25 ||
        completionPercentage === 50 ||
        completionPercentage === 75 ||
        completionPercentage === 100) && (
        <div className="max-w-md mx-auto">
          <HandwrittenNote
            message={getEncouragementMessage(completionPercentage, completedScenarios.size).message}
            rotation={completionPercentage % 2 === 0 ? -2 : 2}
            color={completionPercentage >= 75 ? 'teal' : 'orange'}
          />
        </div>
      )}

      {/* Helpful hint for first time */}
      {scenarios.length > 0 && completedScenarios.size === 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-sm text-blue-900 font-medium">
            💡 <strong>Tip:</strong> Click any waypoint on the map to start a scenario. You can tackle them in any order!
          </p>
        </div>
      )}
    </div>
  );
};

export default JourneyMap;
