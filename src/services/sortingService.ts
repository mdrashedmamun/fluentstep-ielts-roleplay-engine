/**
 * Sorting Service
 * Provides various sorting strategies for scenarios
 * Pure logic, no UI dependencies
 */

import { RoleplayScript } from './staticData';
import { SortOption } from '../types/ux-enhancements';
import { UserProgress } from './progressService';
import { filterService } from './filterService';

/**
 * Calculate recommendation score for a scenario
 * Higher scores indicate better recommendations
 *
 * Score = (isInProgress ? 100 : 0) +
 *         (sameCategoryAsLastCompleted ? 50 : 0) +
 *         (progressiveDifficulty ? 30 : 0) +
 *         (notStarted ? 20 : 0) +
 *         (completed ? -50 : 0)
 *
 * @param scenario - RoleplayScript object
 * @param progress - UserProgress object
 * @param allScenarios - All available scenarios
 * @returns Recommendation score (higher = better)
 *
 * @internal
 */
function calculateRecommendationScore(
  scenario: RoleplayScript,
  progress: UserProgress | null | undefined,
  allScenarios: RoleplayScript[]
): number {
  let score = 0;

  if (!progress) {
    // If no progress, prioritize not started, then by alphabetical
    return 20;
  }

  const status = filterService.getScenarioStatus(scenario.id, progress);
  const difficulty = filterService.getDifficulty(scenario);

  // High priority: in progress (continue where you left off)
  if (status === 'in_progress') {
    score += 100;
  }

  // Medium priority: not started
  if (status === 'not_started') {
    score += 20;
  }

  // Penalty: already completed
  if (status === 'completed') {
    score -= 50;
  }

  // Bonus: same category as last completed scenario
  if (progress.lastVisited) {
    const lastScenario = allScenarios.find((s) => s.id === progress.lastVisited);
    if (lastScenario && lastScenario.category === scenario.category) {
      score += 50;
    }
  }

  // Bonus: progressive difficulty
  // If last completed is B2, prioritize C1 scenarios
  if (progress.completedScenarios && progress.completedScenarios.length > 0) {
    const lastCompletedId = progress.completedScenarios[progress.completedScenarios.length - 1];
    const lastCompletedScenario = allScenarios.find((s) => s.id === lastCompletedId);

    if (lastCompletedScenario) {
      const lastDifficulty = filterService.getDifficulty(lastCompletedScenario);
      // Prioritize C1 after B2
      if (lastDifficulty === 'B2' && difficulty === 'C1') {
        score += 30;
      }
    }
  }

  return score;
}

/**
 * Sort scenarios by recommendation score
 * Prioritizes in-progress, same category as last completed, and progressive difficulty
 *
 * @param scenarios - Array of RoleplayScript objects
 * @param progress - UserProgress object
 * @returns Sorted array (highest recommendation first)
 *
 * @example
 * const sorted = sortByRecommended(scenarios, progress);
 * // Returns: Scenarios sorted by recommendation score
 */
export function sortByRecommended(
  scenarios: RoleplayScript[],
  progress: UserProgress | null | undefined
): RoleplayScript[] {
  if (!scenarios || !Array.isArray(scenarios)) {
    return [];
  }

  const copy = [...scenarios];

  copy.sort((a, b) => {
    const scoreA = calculateRecommendationScore(a, progress, scenarios);
    const scoreB = calculateRecommendationScore(b, progress, scenarios);

    // Higher score first
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    // Tiebreaker: alphabetical by topic
    const topicA = (a.topic || '').toLowerCase();
    const topicB = (b.topic || '').toLowerCase();
    return topicA.localeCompare(topicB);
  });

  return copy;
}

/**
 * Sort scenarios by recently added (reverse order)
 * Later items in the original list are considered more recently added
 *
 * @param scenarios - Array of RoleplayScript objects
 * @returns Sorted array (most recent first)
 *
 * @example
 * const sorted = sortByRecentlyAdded(scenarios);
 * // Returns: Scenarios in reverse order
 */
export function sortByRecentlyAdded(scenarios: RoleplayScript[]): RoleplayScript[] {
  if (!scenarios || !Array.isArray(scenarios)) {
    return [];
  }

  return [...scenarios].reverse();
}

/**
 * Sort scenarios alphabetically by topic
 * Case-insensitive sorting
 *
 * @param scenarios - Array of RoleplayScript objects
 * @returns Sorted array (A-Z)
 *
 * @example
 * const sorted = sortAlphabetically(scenarios);
 * // Returns: [
 * //   { topic: 'At a Café', ... },
 * //   { topic: 'Meeting a Flatmate', ... }
 * // ]
 */
export function sortAlphabetically(scenarios: RoleplayScript[]): RoleplayScript[] {
  if (!scenarios || !Array.isArray(scenarios)) {
    return [];
  }

  return [...scenarios].sort((a, b) => {
    const topicA = (a.topic || '').toLowerCase();
    const topicB = (b.topic || '').toLowerCase();
    return topicA.localeCompare(topicB);
  });
}

/**
 * Sort scenarios by duration
 * Orders from shortest to longest
 *
 * @param scenarios - Array of RoleplayScript objects
 * @returns Sorted array (short → medium → long)
 *
 * @example
 * const sorted = sortByDuration(scenarios);
 * // Returns: Scenarios sorted by dialogue turn count
 */
export function sortByDuration(scenarios: RoleplayScript[]): RoleplayScript[] {
  if (!scenarios || !Array.isArray(scenarios)) {
    return [];
  }

  const durationOrder = { short: 0, medium: 1, long: 2 };

  return [...scenarios].sort((a, b) => {
    const durationA = filterService.getDuration(a);
    const durationB = filterService.getDuration(b);

    const orderA = durationOrder[durationA as keyof typeof durationOrder] || 0;
    const orderB = durationOrder[durationB as keyof typeof durationOrder] || 0;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // Tiebreaker: by actual turn count
    const turnA = filterService.getTurnCount(a);
    const turnB = filterService.getTurnCount(b);
    return turnA - turnB;
  });
}

/**
 * Apply sorting based on sort option
 * Main sorting dispatcher function
 *
 * @param scenarios - Array of RoleplayScript objects
 * @param sortOption - Sort option to apply
 * @param progress - UserProgress object (for 'recommended' option)
 * @returns Sorted array
 *
 * @example
 * const sorted = applySorting(scenarios, 'recommended', progress);
 * // Returns: Scenarios sorted by recommendation
 */
export function applySorting(
  scenarios: RoleplayScript[],
  sortOption: SortOption,
  progress: UserProgress | null | undefined
): RoleplayScript[] {
  if (!scenarios || !Array.isArray(scenarios)) {
    return [];
  }

  switch (sortOption) {
    case 'recommended':
      return sortByRecommended(scenarios, progress);
    case 'recently_added':
      return sortByRecentlyAdded(scenarios);
    case 'alphabetical':
      return sortAlphabetically(scenarios);
    case 'duration':
      return sortByDuration(scenarios);
    default:
      return scenarios;
  }
}

/**
 * Get sort option label for display
 * Provides human-readable labels for sort options
 *
 * @param sortOption - Sort option to get label for
 * @returns Human-readable label
 *
 * @example
 * const label = getSortLabel('recommended');
 * // Returns: 'Recommended for You'
 */
export function getSortLabel(sortOption: SortOption): string {
  const labels: Record<SortOption, string> = {
    recommended: 'Recommended for You',
    recently_added: 'Recently Added',
    alphabetical: 'Alphabetical',
    duration: 'Duration'
  };

  return labels[sortOption] || 'Sort';
}

/**
 * Get all sort options with labels
 * Returns array of all available sort options
 *
 * @returns Array of sort options
 *
 * @example
 * const options = getAllSortOptions();
 * // Returns: ['recommended', 'recently_added', 'alphabetical', 'duration']
 */
export function getAllSortOptions(): SortOption[] {
  return ['recommended', 'recently_added', 'alphabetical', 'duration'];
}

// Export service as a single object for functional style
export const sortingService = {
  sortByRecommended,
  sortByRecentlyAdded,
  sortAlphabetically,
  sortByDuration,
  applySorting,
  getSortLabel,
  getAllSortOptions,
  // Alias for UI components that expect sortScenarios
  sortScenarios: applySorting
};
