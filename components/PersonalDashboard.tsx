/**
 * PersonalDashboard Component
 * Shows user's journey overview, stats, and achievements
 */

import React, { useEffect, useState } from 'react';
import { CURATED_ROLEPLAYS } from '../services/staticData';
import { progressService } from '../services/progressService';
import { getCurrentStreak, getTotalDaysActive } from '../services/streakService';
import { getUnlockedBadgeCount, getRecentlyUnlockedBadges } from '../services/badgeService';
import MountainProgress from './MountainProgress';
import StreakFlame from './StreakFlame';
import BadgeCollection from './BadgeCollection';

interface PersonalDashboardProps {
  onSelectScenario?: (scriptId: string) => void;
  onClose?: () => void;
}

const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ onSelectScenario, onClose }) => {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState(0);
  const [recentBadges, setRecentBadges] = useState<any[]>([]);
  const [showAllBadges, setShowAllBadges] = useState(false);

  useEffect(() => {
    const progress = progressService.getProgress();
    setCompletedScenarios(progress.completedScenarios);
    setCompletionPercentage(progressService.getCompletionPercentage(CURATED_ROLEPLAYS.length));

    setStreak(getCurrentStreak());
    setTotalDays(getTotalDaysActive());
    setUnlockedBadges(getUnlockedBadgeCount());
    setRecentBadges(getRecentlyUnlockedBadges());
  }, []);

  // Get recently started scenarios
  const recentScenarios = CURATED_ROLEPLAYS
    .filter(s => !completedScenarios.includes(s.id))
    .slice(0, 3);

  return (
    <div className="w-full max-w-5xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-neutral-800 font-display mb-2">
            Your Learning Journey
          </h1>
          <p className="text-lg text-neutral-600">
            Keep climbing the mountain of fluency
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Streak Card */}
        <div className="bg-gradient-to-br from-orange-50 to-primary-50 p-6 rounded-2xl border-2 border-primary-200">
          <StreakFlame size="md" showMessage={false} />
        </div>

        {/* Days Active */}
        <div className="bg-gradient-to-br from-accent-50 to-teal-50 p-6 rounded-2xl border-2 border-accent-200">
          <p className="text-xs font-bold text-accent-700 uppercase tracking-wider mb-2">Learning Habit</p>
          <p className="text-3xl font-bold text-accent-700 mb-2">{totalDays}</p>
          <p className="text-sm text-neutral-600">days active total</p>
        </div>

        {/* Badges Unlocked */}
        <div className="bg-gradient-to-br from-success-50 to-green-50 p-6 rounded-2xl border-2 border-success-200">
          <p className="text-xs font-bold text-success-700 uppercase tracking-wider mb-2">Achievements</p>
          <p className="text-3xl font-bold text-success-700 mb-2">{unlockedBadges}</p>
          <p className="text-sm text-neutral-600">badges earned</p>
        </div>
      </div>

      {/* Mountain Progress */}
      <MountainProgress
        percentage={completionPercentage}
        totalScenarios={CURATED_ROLEPLAYS.length}
        completedScenarios={completedScenarios.length}
      />

      {/* Recent Achievements */}
      {recentBadges.length > 0 && (
        <div className="bg-gradient-to-br from-primary-50 to-orange-50 p-6 rounded-2xl border-2 border-primary-200">
          <h3 className="text-lg font-bold text-neutral-800 mb-4">🏆 Recent Achievements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recentBadges.slice(0, 3).map(badge => (
              <div
                key={badge.id}
                className={`bg-gradient-to-br ${badge.unlockedColor} p-4 rounded-xl text-white text-center shadow-md`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className="text-xs font-bold">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continue Learning Section */}
      {recentScenarios.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">📚 Continue Learning</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recentScenarios.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => onSelectScenario?.(scenario.id)}
                className="group bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all border-2 border-neutral-100 hover:border-primary-200 text-left hover:-translate-y-1"
              >
                <p className="text-xs text-primary-600 font-bold uppercase tracking-wider mb-1">
                  {scenario.category}
                </p>
                <h4 className="font-bold text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors">
                  {scenario.topic}
                </h4>
                <p className="text-xs text-neutral-600 line-clamp-2 mb-3">
                  {scenario.context}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <span className="text-xs text-neutral-600">
                    {scenario.dialogue.length} phrases
                  </span>
                  <span className="text-primary-600 font-bold group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* View All Badges */}
      <div>
        <button
          onClick={() => setShowAllBadges(!showAllBadges)}
          className="w-full py-3 px-4 bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 font-bold rounded-xl border-2 border-primary-200 hover:border-primary-300 hover:bg-gradient-to-r hover:from-primary-100 hover:to-accent-100 transition-all"
        >
          {showAllBadges ? '➖ Hide All Badges' : '➕ View All Badges'}
        </button>

        {showAllBadges && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <BadgeCollection />
          </div>
        )}
      </div>

      {/* Completion Message */}
      {completionPercentage === 100 && (
        <div className="bg-gradient-to-r from-success-100 to-success-50 p-6 rounded-2xl border-2 border-success-300 text-center">
          <p className="text-2xl font-bold text-success-700 mb-2">🎉 Congratulations!</p>
          <p className="text-neutral-700 font-semibold">
            You've completed all 36 scenarios and reached the summit of English fluency!
          </p>
          <p className="text-sm text-neutral-600 mt-2">
            Keep practicing and reviewing to maintain your fluency.
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonalDashboard;
