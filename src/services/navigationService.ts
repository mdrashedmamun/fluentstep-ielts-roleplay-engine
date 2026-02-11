/**
 * Navigation Service
 * Provides scenario navigation logic (next/previous)
 * Pure logic, no UI dependencies
 */

import { RoleplayScript } from './staticData';
import { NavigationContext } from '../types/ux-enhancements';
import { UserProgress } from './progressService';

/**
 * Category order for navigation priority
 * Used to organize scenarios by category when navigating
 */
const CATEGORY_ORDER = ['Social', 'Workplace', 'Service/Logistics', 'Advanced', 'Academic', 'Healthcare', 'Cultural', 'Community'];

/**
 * Get sort index of a category
 * Returns order for sorting navigation
 *
 * @param category - Category name
 * @returns Numeric order (lower = earlier)
 *
 * @internal
 */
function getCategoryOrder(category: string): number {
  const index = CATEGORY_ORDER.indexOf(category);
  return index >= 0 ? index : CATEGORY_ORDER.length;
}

/**
 * Get navigable scenario index
 * Orders scenarios by category, then by ID within category
 *
 * @param currentId - Current scenario ID
 * @param scenarios - Array of RoleplayScript objects
 * @returns Object with currentIndex and ordered array
 *
 * @internal
 */
function getNavigableOrder(
  currentId: string,
  scenarios: RoleplayScript[]
): { currentIndex: number; orderedScenarios: RoleplayScript[] } {
  if (!scenarios || !Array.isArray(scenarios)) {
    return { currentIndex: -1, orderedScenarios: [] };
  }

  // Sort by category, then by ID
  const ordered = [...scenarios].sort((a, b) => {
    const categoryA = getCategoryOrder(a.category);
    const categoryB = getCategoryOrder(b.category);

    if (categoryA !== categoryB) {
      return categoryA - categoryB;
    }

    // Same category: sort by ID
    return a.id.localeCompare(b.id);
  });

  const currentIndex = ordered.findIndex((s) => s.id === currentId);
  return { currentIndex, orderedScenarios: ordered };
}

/**
 * Get next scenario in navigation order
 * Prioritizes incomplete scenarios in the same category
 *
 * @param currentId - Current scenario ID
 * @param scenarios - Array of RoleplayScript objects
 * @param progress - UserProgress object
 * @returns Next scenario ID or null if at the end
 *
 * @example
 * const nextId = getNextScenario('social-1', scenarios, progress);
 * // Returns: 'social-2' or next incomplete scenario
 */
export function getNextScenario(
  currentId: string,
  scenarios: RoleplayScript[],
  progress: UserProgress | null | undefined
): string | null {
  if (!scenarios || !Array.isArray(scenarios) || scenarios.length === 0) {
    return null;
  }

  const { currentIndex, orderedScenarios } = getNavigableOrder(currentId, scenarios);

  if (currentIndex < 0 || currentIndex >= orderedScenarios.length - 1) {
    // At the end
    return null;
  }

  // Get current scenario info
  const currentScenario = orderedScenarios[currentIndex];
  if (!currentScenario) {
    return null;
  }

  const currentCategory = currentScenario.category;

  // Look for next incomplete scenario in same category
  for (let i = currentIndex + 1; i < orderedScenarios.length; i++) {
    const scenario = orderedScenarios[i];

    if (scenario.category === currentCategory) {
      const status = progress?.scenarioProgress?.[scenario.id]?.status || 'not_started';
      if (status !== 'completed') {
        return scenario.id;
      }
    }
  }

  // No incomplete in same category, return next scenario regardless of status
  if (currentIndex + 1 < orderedScenarios.length) {
    return orderedScenarios[currentIndex + 1].id;
  }

  return null;
}

/**
 * Get previous scenario in navigation order
 * Navigates backward in the sorted list
 *
 * @param currentId - Current scenario ID
 * @param scenarios - Array of RoleplayScript objects
 * @returns Previous scenario ID or null if at the beginning
 *
 * @example
 * const prevId = getPreviousScenario('social-2', scenarios);
 * // Returns: 'social-1' or null if at start
 */
export function getPreviousScenario(
  currentId: string,
  scenarios: RoleplayScript[]
): string | null {
  if (!scenarios || !Array.isArray(scenarios) || scenarios.length === 0) {
    return null;
  }

  const { currentIndex, orderedScenarios } = getNavigableOrder(currentId, scenarios);

  if (currentIndex <= 0) {
    // At the beginning
    return null;
  }

  return orderedScenarios[currentIndex - 1]?.id || null;
}

/**
 * Get complete navigation context
 * Provides all navigation information for a scenario
 *
 * @param currentId - Current scenario ID
 * @param scenarios - Array of RoleplayScript objects
 * @param progress - UserProgress object
 * @returns NavigationContext with navigation state and IDs
 *
 * @example
 * const context = getNavigationContext('social-2', scenarios, progress);
 * // Returns: {
 * //   hasPrevious: true,
 * //   hasNext: true,
 * //   currentIndex: 1,
 * //   totalCount: 52,
 * //   previousScenarioId: 'social-1',
 * //   nextScenarioId: 'social-3'
 * // }
 */
export function getNavigationContext(
  currentId: string,
  scenarios: RoleplayScript[],
  progress: UserProgress | null | undefined
): NavigationContext {
  if (!scenarios || !Array.isArray(scenarios)) {
    return {
      hasPrevious: false,
      hasNext: false,
      currentIndex: -1,
      totalCount: 0
    };
  }

  const { currentIndex, orderedScenarios } = getNavigableOrder(currentId, scenarios);

  const previousId = getPreviousScenario(currentId, scenarios);
  const nextId = getNextScenario(currentId, scenarios, progress);

  return {
    hasPrevious: previousId !== null,
    hasNext: nextId !== null,
    currentIndex: currentIndex >= 0 ? currentIndex : 0,
    totalCount: orderedScenarios.length,
    previousScenarioId: previousId || undefined,
    nextScenarioId: nextId || undefined
  };
}

/**
 * Check if scenario is the first in navigation order
 *
 * @param currentId - Current scenario ID
 * @param scenarios - Array of RoleplayScript objects
 * @returns True if this is the first scenario
 *
 * @example
 * const isFirst = isFirstScenario('social-1', scenarios);
 * // Returns: true
 */
export function isFirstScenario(currentId: string, scenarios: RoleplayScript[]): boolean {
  if (!scenarios || !Array.isArray(scenarios) || scenarios.length === 0) {
    return false;
  }

  const { currentIndex } = getNavigableOrder(currentId, scenarios);
  return currentIndex === 0;
}

/**
 * Check if scenario is the last in navigation order
 *
 * @param currentId - Current scenario ID
 * @param scenarios - Array of RoleplayScript objects
 * @returns True if this is the last scenario
 *
 * @example
 * const isLast = isLastScenario('advanced-10', scenarios);
 * // Returns: true
 */
export function isLastScenario(currentId: string, scenarios: RoleplayScript[]): boolean {
  if (!scenarios || !Array.isArray(scenarios) || scenarios.length === 0) {
    return false;
  }

  const { currentIndex, orderedScenarios } = getNavigableOrder(currentId, scenarios);
  return currentIndex === orderedScenarios.length - 1;
}

/**
 * Get category change info
 * Detects if navigation crosses category boundaries
 *
 * @param fromId - Source scenario ID
 * @param toId - Target scenario ID
 * @param scenarios - Array of RoleplayScript objects
 * @returns True if navigation crosses category boundary
 *
 * @example
 * const crossesBoundary = isCategoryChange('social-5', 'workplace-1', scenarios);
 * // Returns: true
 */
export function isCategoryChange(
  fromId: string,
  toId: string,
  scenarios: RoleplayScript[]
): boolean {
  const fromScenario = scenarios.find((s) => s.id === fromId);
  const toScenario = scenarios.find((s) => s.id === toId);

  if (!fromScenario || !toScenario) {
    return false;
  }

  return fromScenario.category !== toScenario.category;
}

/**
 * Get navigation progress percentage
 * Calculates how far through the scenario list
 *
 * @param currentId - Current scenario ID
 * @param scenarios - Array of RoleplayScript objects
 * @returns Percentage (0-100) through the list
 *
 * @example
 * const progress = getNavigationProgress('social-26', scenarios);
 * // Returns: 50 (halfway through)
 */
export function getNavigationProgress(currentId: string, scenarios: RoleplayScript[]): number {
  if (!scenarios || !Array.isArray(scenarios) || scenarios.length === 0) {
    return 0;
  }

  const { currentIndex, orderedScenarios } = getNavigableOrder(currentId, scenarios);

  if (currentIndex < 0) {
    return 0;
  }

  return Math.round(((currentIndex + 1) / orderedScenarios.length) * 100);
}

// Export service as a single object for functional style
export const navigationService = {
  getNextScenario,
  getPreviousScenario,
  getNavigationContext,
  isFirstScenario,
  isLastScenario,
  isCategoryChange,
  getNavigationProgress
};
