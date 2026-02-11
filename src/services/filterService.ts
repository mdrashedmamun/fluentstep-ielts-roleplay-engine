/**
 * Filter Service
 * Provides filtering logic for difficulty, duration, and status
 * Pure logic, no UI dependencies
 */

import { RoleplayScript } from './staticData';
import { FilterState, ScenarioMetadata } from '../types/ux-enhancements';
import { UserProgress } from './progressService';

/**
 * Determine difficulty level of a scenario
 * Scans deepDive insights for difficulty keywords
 *
 * @param scenario - RoleplayScript object
 * @returns Difficulty level: 'B2', 'C1', or 'unknown'
 *
 * @example
 * const scenario = {
 *   deepDive: [
 *     { index: 1, phrase: 'hello', insight: 'This is B2 level vocabulary' }
 *   ]
 * };
 * const difficulty = getDifficulty(scenario);
 * // Returns: 'B2'
 */
export function getDifficulty(scenario: RoleplayScript): 'B2' | 'C1' | 'unknown' {
  if (!scenario || !scenario.deepDive || !Array.isArray(scenario.deepDive)) {
    return 'unknown';
  }

  // Keywords for difficulty detection
  const c1Keywords = ['advanced', 'complex', 'nuanced', 'c1', 'C1'];
  const b2Keywords = ['b2', 'B2'];

  // Check all deepDive insights for difficulty indicators
  const allInsights = (scenario.deepDive || [])
    .map((item) => (item && item.insight) || '')
    .filter(Boolean)
    .join(' ');

  if (!allInsights) {
    return 'unknown';
  }

  // Check for C1 indicators first (more specific)
  if (c1Keywords.some((keyword) => allInsights && allInsights.includes && allInsights.includes(keyword))) {
    return 'C1';
  }

  // Check for B2 indicators
  if (b2Keywords.some((keyword) => allInsights && allInsights.includes && allInsights.includes(keyword))) {
    return 'B2';
  }

  // Default to unknown if no clear indicators
  return 'unknown';
}

/**
 * Calculate duration category based on dialogue turn count
 * short = ≤10 turns, medium = 11-20 turns, long = >20 turns
 *
 * @param scenario - RoleplayScript object
 * @returns Duration category: 'short', 'medium', or 'long'
 *
 * @example
 * const scenario = {
 *   dialogue: [
 *     { speaker: 'Jack', text: 'Hello' },
 *     { speaker: 'You', text: 'Hi' },
 *     // ... 8 more turns
 *   ]
 * };
 * const duration = getDuration(scenario);
 * // Returns: 'short'
 */
export function getDuration(scenario: RoleplayScript): 'short' | 'medium' | 'long' {
  if (!scenario || !scenario.dialogue || !Array.isArray(scenario.dialogue)) {
    return 'short';
  }

  const turnCount = scenario.dialogue.length;

  if (turnCount <= 10) {
    return 'short';
  } else if (turnCount <= 20) {
    return 'medium';
  } else {
    return 'long';
  }
}

/**
 * Get turn count for a scenario
 * Helper function to calculate dialogue length
 *
 * @param scenario - RoleplayScript object
 * @returns Number of dialogue turns
 *
 * @example
 * const turnCount = getTurnCount(scenario);
 * // Returns: 16
 */
export function getTurnCount(scenario: RoleplayScript): number {
  if (!scenario || !scenario.dialogue || !Array.isArray(scenario.dialogue)) {
    return 0;
  }

  return scenario.dialogue.length;
}

/**
 * Get scenario metadata (computed properties)
 * Combines difficulty, duration, and turn count
 *
 * @param scenario - RoleplayScript object
 * @returns ScenarioMetadata object
 *
 * @example
 * const metadata = getScenarioMetadata(scenario);
 * // Returns: { difficulty: 'B2', duration: 'medium', turnCount: 16 }
 */
export function getScenarioMetadata(scenario: RoleplayScript): ScenarioMetadata {
  return {
    difficulty: getDifficulty(scenario),
    duration: getDuration(scenario),
    turnCount: getTurnCount(scenario)
  };
}

/**
 * Apply all active filters to scenarios
 * Filters by difficulty, duration, and completion status
 *
 * @param scenarios - Array of RoleplayScript objects
 * @param filters - FilterState with active difficulty, duration, and status filters
 * @param progress - UserProgress object for status checking
 * @returns Filtered array of RoleplayScript objects
 *
 * @example
 * const filters = {
 *   difficulty: ['B2'],
 *   duration: ['short', 'medium'],
 *   status: ['not_started', 'in_progress']
 * };
 * const progress = { scenarioProgress: {}, completedScenarios: [] };
 * const filtered = applyFilters(scenarios, filters, progress);
 * // Returns: Scenarios matching all filter criteria
 */
export function applyFilters(
  scenarios: RoleplayScript[],
  filters: FilterState,
  progress: UserProgress | null | undefined
): RoleplayScript[] {
  if (!scenarios || !Array.isArray(scenarios)) {
    return [];
  }

  if (!filters) {
    return scenarios.filter(s => s && typeof s === 'object');
  }

  return scenarios.filter((scenario) => {
    // Ensure scenario is valid
    if (!scenario || typeof scenario !== 'object') return false;
    if (!scenario.id) return false;

    // Check difficulty filter
    if (filters.difficulty && Array.isArray(filters.difficulty) && filters.difficulty.length > 0) {
      const scenarioDifficulty = getDifficulty(scenario);
      // Only filter if difficulty is B2 or C1 (ignore 'unknown' in filter matching)
      if (scenarioDifficulty !== 'unknown' && !filters.difficulty.includes(scenarioDifficulty)) {
        return false;
      }
    }

    // Check duration filter
    if (filters.duration && Array.isArray(filters.duration) && filters.duration.length > 0) {
      const scenarioDuration = getDuration(scenario);
      if (!filters.duration.includes(scenarioDuration)) {
        return false;
      }
    }

    // Check status filter
    if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
      const scenarioStatus = getScenarioStatus(scenario.id, progress);
      if (!filters.status.includes(scenarioStatus)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get completion status of a scenario
 * Helper function to check progress status
 *
 * @param scenarioId - ID of the scenario
 * @param progress - UserProgress object
 * @returns Status: 'not_started', 'in_progress', or 'completed'
 *
 * @example
 * const status = getScenarioStatus('social-1', progress);
 * // Returns: 'not_started'
 */
export function getScenarioStatus(
  scenarioId: string,
  progress: UserProgress | null | undefined
): 'not_started' | 'in_progress' | 'completed' {
  if (!progress || !progress.scenarioProgress) {
    return 'not_started';
  }

  const scenarioProgress = progress.scenarioProgress[scenarioId];
  if (!scenarioProgress) {
    return 'not_started';
  }

  return scenarioProgress.status || 'not_started';
}

/**
 * Get filter summary
 * Returns count of scenarios per filter value
 *
 * @param scenarios - Array of RoleplayScript objects
 * @param progress - UserProgress object for status checking
 * @returns Object with counts for each filter value
 *
 * @example
 * const summary = getFilterSummary(scenarios, progress);
 * // Returns: {
 * //   difficulty: { B2: 25, C1: 15, unknown: 12 },
 * //   duration: { short: 20, medium: 20, long: 12 },
 * //   status: { not_started: 40, in_progress: 5, completed: 7 }
 * // }
 */
export function getFilterSummary(
  scenarios: RoleplayScript[],
  progress: UserProgress | null | undefined
): {
  difficulty: Record<string, number>;
  duration: Record<string, number>;
  status: Record<string, number>;
} {
  const summary: {
    difficulty: Record<string, number>;
    duration: Record<string, number>;
    status: Record<string, number>;
  } = {
    difficulty: { B2: 0, C1: 0, unknown: 0 },
    duration: { short: 0, medium: 0, long: 0 },
    status: { not_started: 0, in_progress: 0, completed: 0 }
  };

  if (!scenarios || !Array.isArray(scenarios)) {
    return summary;
  }

  for (const scenario of scenarios) {
    // Count by difficulty
    const difficulty = getDifficulty(scenario);
    summary.difficulty[difficulty] = (summary.difficulty[difficulty] || 0) + 1;

    // Count by duration
    const duration = getDuration(scenario);
    summary.duration[duration] = (summary.duration[duration] || 0) + 1;

    // Count by status
    const status = getScenarioStatus(scenario.id, progress);
    summary.status[status] = (summary.status[status] || 0) + 1;
  }

  return summary;
}

/**
 * Check if any filters are active
 * Helper to determine if filters are being applied
 *
 * @param filters - FilterState object
 * @returns True if any filter array is non-empty
 *
 * @example
 * const hasFilters = hasActiveFilters({ difficulty: ['B2'], duration: [], status: [] });
 * // Returns: true
 */
export function hasActiveFilters(filters: FilterState | null | undefined): boolean {
  if (!filters) {
    return false;
  }

  return (
    (filters.difficulty && filters.difficulty.length > 0) ||
    (filters.duration && filters.duration.length > 0) ||
    (filters.status && filters.status.length > 0)
  );
}

/**
 * Clear all filters
 * Returns empty filter state
 *
 * @returns Empty FilterState
 *
 * @example
 * const cleared = clearFilters();
 * // Returns: { difficulty: [], duration: [], status: [] }
 */
export function clearFilters(): FilterState {
  return {
    difficulty: [],
    duration: [],
    status: []
  };
}

// Export service as a single object for functional style
export const filterService = {
  getDifficulty,
  getDuration,
  getTurnCount,
  getScenarioMetadata,
  applyFilters,
  getScenarioStatus,
  getFilterSummary,
  hasActiveFilters,
  clearFilters
};
