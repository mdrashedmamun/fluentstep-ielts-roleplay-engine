/**
 * BadgeCollection Component
 * Displays all badges organized by category
 */

import React, { useState } from 'react';
import { getAllBadgesWithStatus, getBadgesByCategory, getUnlockedBadgeCount } from '../services/badgeService';

interface BadgeCollectionProps {
  compact?: boolean;
}

const BadgeCollection: React.FC<BadgeCollectionProps> = ({ compact = false }) => {
  const [selectedCategory, setSelectedCategory] = useState<'completion' | 'consistency' | 'skill'>('completion');
  const allBadges = getAllBadgesWithStatus();
  const unlockedCount = getUnlockedBadgeCount();
  const categoryBadges = getBadgesByCategory(selectedCategory);

  return (
    <div className="space-y-6">
      {/* Badge Stats Header */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 p-6 rounded-2xl border-2 border-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-primary-700 uppercase tracking-wider">Achievement Progress</p>
            <p className="text-2xl font-bold text-neutral-800 mt-1">
              {unlockedCount} / {allBadges.length} <span className="text-sm text-neutral-600">Badges Unlocked</span>
            </p>
          </div>
          <div className="text-5xl">🏆</div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full h-2 bg-neutral-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
              style={{ width: `${(unlockedCount / allBadges.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedCategory('completion')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            selectedCategory === 'completion'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          📖 Completion
        </button>
        <button
          onClick={() => setSelectedCategory('consistency')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            selectedCategory === 'consistency'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          🔥 Consistency
        </button>
        <button
          onClick={() => setSelectedCategory('skill')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            selectedCategory === 'skill'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          ⭐ Skills
        </button>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categoryBadges.map(badge => (
          <div
            key={badge.id}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
              badge.unlocked
                ? `bg-gradient-to-br ${badge.unlockedColor} shadow-lg hover:scale-110 cursor-pointer`
                : 'bg-neutral-100 opacity-50'
            }`}
          >
            {/* Badge Icon */}
            <div className="text-5xl">{badge.icon}</div>

            {/* Badge Name */}
            <p className={`text-xs font-bold text-center ${
              badge.unlocked ? 'text-white' : 'text-neutral-600'
            }`}>
              {badge.name}
            </p>

            {/* Unlock Indicator */}
            {badge.unlocked && (
              <div className="text-[10px] text-white/90 font-semibold">
                Unlocked!
              </div>
            )}

            {/* Tooltip on hover */}
            <div className={`text-[10px] text-center absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-2 opacity-0 pointer-events-none transition-opacity bg-neutral-800 text-white rounded px-2 py-1 whitespace-nowrap`}>
              {badge.description}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categoryBadges.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500 font-medium">No badges in this category yet.</p>
          <p className="text-sm text-neutral-400">Keep learning to unlock achievements!</p>
        </div>
      )}
    </div>
  );
};

export default BadgeCollection;
