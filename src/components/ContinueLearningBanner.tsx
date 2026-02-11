import React, { useState, useEffect } from 'react';
import { CURATED_ROLEPLAYS } from '../services/staticData';

interface ContinueLearningBannerProps {
  scenarioId: string;
  progress: any; // from progressService.getProgress()
  onContinue: (scenarioId: string) => void;
  onDismiss: () => void;
}

const ContinueLearningBanner: React.FC<ContinueLearningBannerProps> = ({
  scenarioId,
  progress,
  onContinue,
  onDismiss
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if this banner should be dismissed for the session
  useEffect(() => {
    const skipBannerKey = 'fluentstep:skipBannerForSession';
    const skipBannerId = sessionStorage.getItem(skipBannerKey);
    if (skipBannerId === scenarioId) {
      setIsDismissed(true);
    }
  }, [scenarioId]);

  // Get scenario data
  const scenario = CURATED_ROLEPLAYS.find(s => s.id === scenarioId);

  // Only show if scenario exists and is in_progress
  if (
    !scenario ||
    isDismissed ||
    !(progress.inProgressScenarios || []).includes(scenarioId)
  ) {
    return null;
  }

  const scenarioProgress = (progress.scenarios || {})[scenarioId];
  const progressPercentage = scenarioProgress
    ? Math.round((scenarioProgress.completedPhrases / scenarioProgress.totalPhrases) * 100)
    : 0;

  // Calculate time spent (in minutes)
  const timeSpent = scenarioProgress?.timeSpent
    ? Math.round(scenarioProgress.timeSpent / 60)
    : 0;

  const handleDismiss = () => {
    const skipBannerKey = 'fluentstep:skipBannerForSession';
    sessionStorage.setItem(skipBannerKey, scenarioId);
    setIsDismissed(true);
    onDismiss();
  };

  const handleContinue = () => {
    const skipBannerKey = 'fluentstep:skipBannerForSession';
    sessionStorage.removeItem(skipBannerKey);
    onContinue(scenarioId);
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Social':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Workplace':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Service/Logistics':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Advanced':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const categoryColor = getCategoryColor(scenario.category);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Banner background with gradient */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 opacity-95"></div>

        {/* Decorative elements */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            {/* Left section - Scenario info */}
            <div className="flex-1 min-w-0">
              {/* Topic label */}
              <div className="text-xs md:text-sm uppercase tracking-widest font-bold text-white/80 mb-2">
                <i className="fas fa-bookmark mr-2"></i>
                Continue Learning
              </div>

              {/* Scenario topic */}
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3 line-clamp-2 leading-tight">
                {scenario.topic}
              </h3>

              {/* Category badge and stats */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${categoryColor}`}>
                  <i className="fas fa-tag"></i>
                  {scenario.category}
                </span>

                {timeSpent > 0 && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 text-white rounded-full text-xs font-semibold">
                    <i className="fas fa-hourglass-end"></i>
                    {timeSpent} min spent
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white/90">Progress</span>
                  <span className="text-sm font-bold text-white">{progressPercentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-success-400 to-success-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                    role="progressbar"
                    aria-valuenow={progressPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            </div>

            {/* Right section - CTA buttons */}
            <div className="flex flex-col gap-3 md:flex-col-reverse md:gap-2 flex-shrink-0">
              <button
                onClick={handleContinue}
                className="w-full md:w-auto px-8 py-4 md:py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-primary-50 transition-all active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 min-h-[44px] md:whitespace-nowrap"
                type="button"
              >
                <i className="fas fa-play"></i>
                Continue
              </button>

              <button
                onClick={handleDismiss}
                className="w-full md:w-auto px-6 py-3 md:py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors min-h-[44px] flex items-center justify-center"
                aria-label="Dismiss this banner"
                type="button"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContinueLearningBanner;
