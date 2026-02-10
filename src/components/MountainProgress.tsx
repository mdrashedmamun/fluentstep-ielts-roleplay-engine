/**
 * MountainProgress Component
 * Visual journey map showing progress up a mountain
 */

import React from 'react';

interface MountainProgressProps {
  percentage: number; // 0-100
  totalScenarios: number;
  completedScenarios: number;
}

const MountainProgress: React.FC<MountainProgressProps> = ({
  percentage,
  totalScenarios,
  completedScenarios
}) => {
  // Define milestones
  const milestones = [
    { percent: 0, label: 'Start', emoji: '🎒', description: 'Begin Your Journey' },
    { percent: 25, label: 'Viewpoint', emoji: '⛺', description: 'First Achievement' },
    { percent: 50, label: 'Camp', emoji: '🏔️', description: 'Halfway There!' },
    { percent: 75, label: 'Peak', emoji: '🏆', description: 'Almost There!' },
    { percent: 100, label: 'Summit', emoji: '🎉', description: 'You Made It!' }
  ];

  // Get current position
  let currentPosition = percentage;
  let hikerEmoji = '🥾';
  let positionLabel = '';

  if (percentage === 0) {
    hikerEmoji = '🎒';
    positionLabel = 'Ready to start!';
  } else if (percentage < 25) {
    hikerEmoji = '🥾';
    positionLabel = 'Getting started';
  } else if (percentage < 50) {
    hikerEmoji = '⛹️';
    positionLabel = 'Building momentum';
  } else if (percentage < 75) {
    hikerEmoji = '🧗';
    positionLabel = 'Pushing forward';
  } else if (percentage < 100) {
    hikerEmoji = '🏃';
    positionLabel = 'Final stretch!';
  } else {
    hikerEmoji = '🏆';
    positionLabel = 'Peak reached!';
  }

  return (
    <div className="w-full space-y-6">
      {/* Mountain Path */}
      <div className="bg-gradient-to-b from-orange-50 via-white to-accent-50 rounded-2xl p-8 border-2 border-primary-200">
        {/* SVG Mountain Path */}
        <svg
          viewBox="0 0 400 200"
          className="w-full h-32 mb-4"
          preserveAspectRatio="none"
        >
          {/* Mountain outline */}
          <path
            d="M 0 200 L 50 120 L 100 140 L 150 60 L 200 80 L 250 30 L 300 50 L 350 70 L 400 200"
            fill="url(#mountainGradient)"
            opacity="0.3"
          />

          <path
            d="M 0 200 L 50 120 L 100 140 L 150 60 L 200 80 L 250 30 L 300 50 L 350 70 L 400 200"
            stroke="#F97316"
            strokeWidth="3"
            fill="none"
            opacity="0.6"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#F97316', stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: '#14B8A6', stopOpacity: 0.2 }} />
            </linearGradient>
          </defs>

          {/* Milestone markers */}
          {milestones.map((milestone, idx) => (
            <g key={idx}>
              {/* Marker circle */}
              <circle
                cx={(milestone.percent / 100) * 400}
                cy={200 - (milestone.percent / 100) * 170}
                r="8"
                fill={percentage >= milestone.percent ? '#F97316' : '#D1D5DB'}
                opacity={percentage >= milestone.percent ? 1 : 0.5}
              />
              {/* Milestone emoji */}
              <text
                x={(milestone.percent / 100) * 400}
                y={200 - (milestone.percent / 100) * 170 - 16}
                textAnchor="middle"
                fontSize="16"
                opacity={percentage >= milestone.percent ? 1 : 0.3}
              >
                {milestone.emoji}
              </text>
            </g>
          ))}

          {/* Progress fill (path up the mountain) */}
          <path
            d="M 0 200 L 50 120 L 100 140 L 150 60 L 200 80 L 250 30 L 300 50 L 350 70 L 400 200"
            stroke="url(#progressGradient)"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${(percentage / 100) * 750} 750`}
            opacity="0.8"
            style={{ transition: 'stroke-dasharray 0.7s ease-out' }}
          />

          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#F97316' }} />
              <stop offset="100%" style={{ stopColor: '#14B8A6' }} />
            </linearGradient>
          </defs>

          {/* Current hiker position */}
          {percentage > 0 && (
            <text
              x={(currentPosition / 100) * 400}
              y={200 - (currentPosition / 100) * 170 - 28}
              textAnchor="middle"
              fontSize="20"
              className="animate-bounce"
            >
              {hikerEmoji}
            </text>
          )}
        </svg>

        {/* Milestone labels */}
        <div className="flex justify-between text-xs font-semibold text-neutral-600">
          {milestones.map((milestone) => (
            <div key={milestone.percent} className="text-center">
              <p className="font-bold text-neutral-700">{milestone.label}</p>
              <p className="text-[10px] text-neutral-500">{Math.round(milestone.percent)}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Info */}
      <div className="grid grid-cols-2 gap-4">
        {/* Completion Status */}
        <div className="bg-gradient-to-br from-primary-50 to-orange-50 p-4 rounded-xl border-2 border-primary-100">
          <p className="text-xs text-primary-700 font-bold uppercase tracking-wider">Completion</p>
          <p className="text-2xl font-bold text-primary-700 mt-1">{percentage}%</p>
          <p className="text-xs text-neutral-600 mt-1">
            {completedScenarios} of {totalScenarios} scenarios
          </p>
        </div>

        {/* Current Position */}
        <div className="bg-gradient-to-br from-accent-50 to-teal-50 p-4 rounded-xl border-2 border-accent-100">
          <p className="text-xs text-accent-700 font-bold uppercase tracking-wider">Status</p>
          <p className="text-lg font-bold text-accent-700 mt-1">{hikerEmoji}</p>
          <p className="text-xs text-neutral-600 mt-1">{positionLabel}</p>
        </div>
      </div>

      {/* Encouragement Message */}
      <div className="bg-gradient-to-r from-primary-100/50 to-accent-100/50 p-4 rounded-xl border-l-4 border-primary-500">
        <p className="text-sm font-semibold text-neutral-800">
          {percentage === 0 && '🌟 Start your first scenario today to begin your journey!'}
          {percentage > 0 && percentage < 25 && '💪 You\'ve got this! Every step brings you closer.'}
          {percentage >= 25 && percentage < 50 && '🚀 Great progress! You\'re building real momentum.'}
          {percentage >= 50 && percentage < 75 && '⚡ More than halfway! The view from here is beautiful.'}
          {percentage >= 75 && percentage < 100 && '🎯 The peak is in sight! Keep pushing!'}
          {percentage === 100 && '🏆 Congratulations! You\'ve reached the summit!'}
        </p>
      </div>
    </div>
  );
};

export default MountainProgress;
