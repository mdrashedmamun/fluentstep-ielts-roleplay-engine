
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CURATED_ROLEPLAYS } from '../services/staticData';
import { Button } from '../design-system/components/Button';
import { Badge } from '../design-system/components/Badge';
import { progressService } from '../services/progressService';
import { searchService } from '../services/searchService';
import { filterService } from '../services/filterService';
import { sortingService } from '../services/sortingService';
import { urlService } from '../services/urlService';
import JourneyMap from './JourneyMap';
import HeroVideo from './HeroVideo';
import ContinueLearningBanner from './ContinueLearningBanner';
import FilterPanel from './FilterPanel';
import SortingControls from './SortingControls';
import SurpriseMeButton from './SurpriseMeButton';
import { FilterState, SortOption } from '../types/ux-enhancements';

interface TopicSelectorProps {
  onSelect: (scriptId: string) => void;
}

const CATEGORIES = ['Social', 'Workplace', 'Service/Logistics', 'Advanced'] as const;

const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelect }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>('Social');
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(new Set());
  const [useJourneyMap, setUseJourneyMap] = useState(false);
  const [userProgress, setUserProgress] = useState(() => {
    try {
      return progressService.getProgress();
    } catch (e) {
      console.error('Error getting progress:', e);
      return { completedScenarios: [], scenarioProgress: {}, lastVisited: null, totalTimeSpent: 0 };
    }
  });

  // Initialize filters from URL
  const [filters, setFilters] = useState<FilterState>(() => {
    try {
      const difficultyParam = searchParams.get('difficulty');
      const durationParam = searchParams.get('duration');
      const statusParam = searchParams.get('status');

      return {
        difficulty: (difficultyParam ? difficultyParam.split(',') : []) || [],
        duration: (durationParam ? durationParam.split(',') : []) || [],
        status: (statusParam ? statusParam.split(',') : []) || []
      };
    } catch (e) {
      console.error('Error initializing filters:', e);
      return {
        difficulty: [],
        duration: [],
        status: []
      };
    }
  });

  const [sort, setSort] = useState<SortOption>(() => {
    const sortParam = searchParams.get('sort');
    return (sortParam as SortOption) || 'recommended';
  });

  // Update filters and sort when URL params change
  useEffect(() => {
    const difficultyParam = searchParams.get('difficulty');
    const durationParam = searchParams.get('duration');
    const statusParam = searchParams.get('status');

    setFilters({
      difficulty: difficultyParam ? difficultyParam.split(',') : [],
      duration: durationParam ? durationParam.split(',') : [],
      status: statusParam ? statusParam.split(',') : []
    });

    const sortParam = searchParams.get('sort');
    setSort((sortParam as SortOption) || 'recommended');
  }, [searchParams]);

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');

  // Update searchQuery when URL search param changes
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    const progress = progressService.getProgress();
    setUserProgress(progress);
    setCompletedScenarios(new Set(progress?.completedScenarios || []));
    setCompletionPercentage(progressService.getCompletionPercentage(CURATED_ROLEPLAYS.length));
  }, []);

  // Filtering pipeline
  const filteredAndSortedScenarios = useMemo(() => {
    try {
      // 1. Apply search
      let results = searchQuery
        ? searchService.search(searchQuery, CURATED_ROLEPLAYS)
        : CURATED_ROLEPLAYS;

      // Ensure results is valid array
      if (!results || !Array.isArray(results)) {
        return CURATED_ROLEPLAYS;
      }

      // 2. Apply filters
      results = filterService.applyFilters(results, filters, userProgress);
      if (!results || !Array.isArray(results)) {
        return CURATED_ROLEPLAYS;
      }

      // 3. Apply sorting
      results = sortingService.sortScenarios(results, sort, userProgress);
      if (!results || !Array.isArray(results)) {
        return CURATED_ROLEPLAYS;
      }

      return results;
    } catch (error) {
      console.error('Error in filtering pipeline:', error);
      return CURATED_ROLEPLAYS;
    }
  }, [searchQuery, filters, sort, userProgress]);

  const filteredScripts = (filteredAndSortedScenarios || []).filter(s => s && s.category === activeCategory);

  // Handler for filter changes
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    urlService.updateURLWithFilters(newFilters, searchQuery, sort);
  };

  // Handler for reset filters
  const handleResetFilters = () => {
    setFilters({ difficulty: [], duration: [], status: [] });
    urlService.clearURLFilters();
  };

  // Handler for sort changes
  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    urlService.updateURLWithFilters(filters, searchQuery, newSort);
  };

  // Handler for continue banner dismiss
  const handleBannerDismiss = () => {
    // Banner manages its own state
  };

  // Handler for continue banner continue
  const handleBannerContinue = (scenarioId: string) => {
    onSelect(scenarioId);
  };

  // Handler for surprise me
  const handleSurpriseMe = (scenarioId: string) => {
    onSelect(scenarioId);
  };

  // Get last visited scenario for continue banner
  const lastVisitedScenario = userProgress?.lastVisited;

  // If using journey map, show full interactive map
  if (useJourneyMap) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
        {/* Toggle button for accessibility */}
        <div className="flex justify-between items-center max-w-2xl mx-auto w-full">
          <div className="flex-1" />
          <button
            onClick={() => setUseJourneyMap(false)}
            className="text-xs text-neutral-600 hover:text-primary-600 font-semibold uppercase tracking-wider transition-colors flex items-center gap-1"
            title="Switch to grid view for easier navigation"
          >
            <i className="fas fa-th"></i> Grid View
          </button>
        </div>

        {/* Journey Map Component */}
        <JourneyMap
          scenarios={CURATED_ROLEPLAYS}
          completedScenarios={completedScenarios}
          onSelect={onSelect}
          filteredScenarioIds={filteredAndSortedScenarios.map(s => s.id)}
        />
      </div>
    );
  }

  // Grid view (traditional layout with hero video)
  return (
    <div className="space-y-0 animate-in fade-in duration-1000">
      {/* Hero Video Section */}
      <HeroVideo
        videoSrc="/videos/nature-journey.mp4"
        posterSrc="/videos/nature-journey-poster.jpg"
        headline="Your Journey to English Fluency"
        subtitle="Master IELTS speaking through 43 immersive conversations"
        ctaText="Explore Scenarios"
        onCtaClick={() => {
          // Smooth scroll to scenarios list
          document.getElementById('scenarios-list')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }}
        height="three-quarter"
      />

      {/* Scenarios List */}
      <div className="space-y-12 px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section with Progress */}
        <div id="scenarios-list" className="text-center max-w-2xl mx-auto space-y-6 scroll-mt-4">
        {/* Warm Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-200">
          <i className="fas fa-book-open"></i>
          Your Learning Journey
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl font-black text-neutral-800 tracking-tight leading-tight font-display">
          Choose Your <br /><span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">Next Conversation</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg text-neutral-600 leading-relaxed font-medium">
          Each scenario brings you closer to confident, natural English fluency. <br />
          Pick one and dive into a real-world conversation.
        </p>

        {/* Progress Visualization - Warm Gradient */}
        <div className="mt-8 space-y-3 max-w-sm mx-auto bg-gradient-to-br from-orange-50 to-teal-50 p-6 rounded-3xl border border-orange-100">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-800">Your Progress</span>
            <span className="font-bold text-transparent bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text">{completionPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-700"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-xs text-neutral-600 font-medium">
            <span className="text-primary-600 font-bold">{completedScenarios.size}</span> of <span className="text-accent-600 font-bold">{CURATED_ROLEPLAYS.length}</span> scenarios completed
          </p>
        </div>

        {/* Toggle to Journey Map */}
        <button
          onClick={() => setUseJourneyMap(true)}
          className="mt-4 text-xs text-primary-600 hover:text-primary-700 font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 justify-center"
          title="Switch to interactive journey map"
        >
          <i className="fas fa-mountain"></i> Journey Map View
        </button>
        </div>

        {/* Continue Learning Banner */}
        {lastVisitedScenario && (
          <ContinueLearningBanner
            scenarioId={lastVisitedScenario}
            progress={userProgress}
            onContinue={handleBannerContinue}
            onDismiss={handleBannerDismiss}
          />
        )}

        {/* Filter and Sort Section */}
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Filter and Sort Controls */}
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            {/* Filter Panel */}
            <div className="flex-1 w-full">
              <FilterPanel
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
                scenarioCounts={{
                  total: CURATED_ROLEPLAYS.length,
                  filtered: filteredAndSortedScenarios.length
                }}
              />
            </div>

            {/* Sorting Controls */}
            <div className="flex-1 w-full">
              <SortingControls
                currentSort={sort}
                onChange={handleSortChange}
              />
            </div>

            {/* Surprise Me Button */}
            <div className="w-full lg:w-auto">
              <SurpriseMeButton
                scenarios={filteredAndSortedScenarios}
                completedIds={Array.from(completedScenarios)}
                onSelect={handleSurpriseMe}
              />
            </div>
          </div>

          {/* Results Counter */}
          {(searchQuery || (filters?.difficulty?.length || 0) > 0 || (filters?.duration?.length || 0) > 0 || (filters?.status?.length || 0) > 0) && (
            <div className="text-center text-sm font-medium text-neutral-600">
              Showing <span className="text-primary-600 font-bold">{filteredAndSortedScenarios.length}</span> of <span className="text-neutral-700 font-bold">{CURATED_ROLEPLAYS.length}</span> scenarios
            </div>
          )}

          {/* No Results Message */}
          {filteredAndSortedScenarios.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <i className="fas fa-magnifying-glass text-5xl text-neutral-300"></i>
              <p className="text-lg font-semibold text-neutral-600">No scenarios match your filters</p>
              <p className="text-sm text-neutral-500">Try adjusting your search or filter criteria</p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

      {/* Category Tabs - Underline Style */}
      <div className="flex justify-center gap-8 pb-4 border-b-2 border-neutral-200 max-w-fit mx-auto px-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`pb-3 font-semibold text-sm uppercase tracking-wider transition-all duration-200 relative ${
              activeCategory === cat
                ? 'text-primary-600'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {cat}
            {activeCategory === cat && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
            )}
          </button>
        ))}
      </div>

        {/* Storybook Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredScripts.map((script) => {
            const isCompleted = completedScenarios.has(script.id);
            return (
              <button
                key={script.id}
                onClick={() => onSelect(script.id)}
                className="group relative bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden text-left flex flex-col p-6 border-2 border-transparent hover:border-orange-200 hover:-translate-y-1"
              >
                {/* Gradient Accent Strip */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-400 to-accent-400 group-hover:h-2 transition-all duration-300"></div>

                {/* Background Aesthetic - Warm Gradient */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-50 to-teal-50 rounded-bl-[8rem] group-hover:from-orange-100 group-hover:to-teal-100 transition-all duration-300 -mr-12 -mt-12 opacity-50"></div>

                {/* Completion Badge */}
                {isCompleted && (
                  <div className="absolute top-6 right-6 z-20">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-success-400 to-success-500 text-white flex items-center justify-center shadow-lg text-sm font-bold">
                      ✓
                    </div>
                  </div>
                )}

                <div className="relative z-10 h-full flex flex-col">
                  {/* Character Avatars - Larger, with rings */}
                  <div className="mb-5 flex items-center gap-3">
                    {(script.characters || []).slice(0, 2).map((char, i) => (
                      <div
                        key={i}
                        className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-lg font-display shadow-md ring-3 ${
                          i === 0
                            ? 'bg-gradient-to-br from-primary-400 to-primary-500 ring-orange-100'
                            : 'bg-gradient-to-br from-accent-400 to-accent-500 ring-teal-100 -ml-3'
                        }`}
                      >
                        {char?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    ))}
                  </div>

                  {/* Content */}
                  <div className="space-y-3 flex-grow">
                    <h3 className="text-2xl font-bold text-neutral-800 leading-tight group-hover:text-primary-600 transition-colors font-display">
                      {script.topic}
                    </h3>
                    <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2 group-hover:text-neutral-700 transition-colors">
                      {script.context}
                    </p>
                  </div>

                  {/* Metadata Footer */}
                  <div className="pt-4 border-t border-neutral-100 mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-neutral-600 font-medium">
                      <span>⏱️ 5-8 min</span>
                      <span>💬 {(script.dialogue || []).length} phrases</span>
                    </div>
                    <div className="text-primary-600 font-semibold text-xs uppercase tracking-wider flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                      {isCompleted ? 'Review' : 'Start'}
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </div>
                </div>

                {/* Warm Glow on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-accent-500/0 group-hover:from-primary-500/5 group-hover:to-accent-500/5 transition-all duration-300 rounded-3xl pointer-events-none"></div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function getIcon(category: string) {
  switch (category) {
    case 'Social': return 'fa-users';
    case 'Workplace': return 'fa-briefcase';
    case 'Service/Logistics': return 'fa-concierge-bell';
    case 'Advanced': return 'fa-brain';
    default: return 'fa-book';
  }
}

export default TopicSelector;
