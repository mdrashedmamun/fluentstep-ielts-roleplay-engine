/**
 * URL Service
 * Provides URL parsing and state synchronization
 * Pure logic, no UI dependencies
 */

import { FilterState, URLParams, SortOption } from '../types/ux-enhancements';

/**
 * Debounce timer reference
 * Used to debounce URL updates
 *
 * @internal
 */
let debounceTimer: NodeJS.Timeout | null = null;

/**
 * Parse filter and sort parameters from URL
 * Reads URLSearchParams from current browser location
 *
 * @returns URLParams object with parsed values
 *
 * @example
 * // URL: /?search=flatmate&difficulty=B2&duration=short&status=in_progress&sort=recommended
 * const params = parseFiltersFromURL();
 * // Returns: {
 * //   search: 'flatmate',
 * //   difficulty: 'B2',
 * //   duration: 'short',
 * //   status: 'in_progress',
 * //   sort: 'recommended'
 * // }
 */
export function parseFiltersFromURL(): URLParams {
  try {
    if (typeof window === 'undefined' || !window.location) {
      return {};
    }

    const params = new URLSearchParams(window.location.search);

    const result: URLParams = {};

    // Parse search query
    const search = params.get('search');
    if (search) {
      result.search = decodeURIComponent(search);
    }

    // Parse difficulty filter
    const difficulty = params.get('difficulty');
    if (difficulty) {
      result.difficulty = difficulty;
    }

    // Parse duration filter
    const duration = params.get('duration');
    if (duration) {
      result.duration = duration;
    }

    // Parse status filter
    const status = params.get('status');
    if (status) {
      result.status = status;
    }

    // Parse sort option
    const sort = params.get('sort') as SortOption | null;
    if (sort && ['recommended', 'recently_added', 'alphabetical', 'duration'].includes(sort)) {
      result.sort = sort;
    }

    return result;
  } catch (error) {
    console.warn('Error parsing URL parameters:', error);
    return {};
  }
}

/**
 * Update browser URL with filter state
 * Debounced (300ms) to avoid history spam
 * Pushes new state to browser history
 *
 * @param filters - FilterState with active filters
 * @param search - Search query string
 * @param sort - Sort option
 *
 * @example
 * const filters = { difficulty: ['B2'], duration: ['short'], status: [] };
 * updateURLWithFilters(filters, 'flatmate', 'recommended');
 * // URL updates to: /?search=flatmate&difficulty=B2&duration=short&sort=recommended
 */
export function updateURLWithFilters(
  filters: FilterState,
  search: string,
  sort: SortOption
): void {
  // Debounce to prevent history spam
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    try {
      if (typeof window === 'undefined' || !window.history) {
        return;
      }

      const params = new URLSearchParams();

      // Add search parameter
      if (search && search.trim().length > 0) {
        params.set('search', encodeURIComponent(search.trim()));
      }

      // Add difficulty filters
      if (filters.difficulty && filters.difficulty.length > 0) {
        params.set('difficulty', filters.difficulty.join(','));
      }

      // Add duration filters
      if (filters.duration && filters.duration.length > 0) {
        params.set('duration', filters.duration.join(','));
      }

      // Add status filters
      if (filters.status && filters.status.length > 0) {
        params.set('status', filters.status.join(','));
      }

      // Add sort option
      if (sort && sort.length > 0) {
        params.set('sort', sort);
      }

      // Build new URL
      const queryString = params.toString();
      const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;

      // Update history without reloading
      window.history.replaceState(null, '', newUrl);
    } catch (error) {
      console.warn('Error updating URL:', error);
    }
  }, 300);
}

/**
 * Clear debounce timer
 * Used for cleanup or testing
 *
 * @internal
 */
export function clearDebounceTimer(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

/**
 * Get shareable scenario URL
 * Constructs a full URL for sharing a specific scenario
 *
 * @param scenarioId - ID of the scenario
 * @returns Full URL to the scenario
 *
 * @example
 * const url = getScenarioURL('social-1');
 * // Returns: '/scenario/social-1' or full domain URL
 */
export function getScenarioURL(scenarioId: string): string {
  if (!scenarioId) {
    return '/scenario';
  }

  try {
    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin;
      return `${origin}/scenario/${encodeURIComponent(scenarioId)}`;
    }
  } catch {
    // Handle SSR or environments without window
  }

  // Fallback to relative URL
  return `/scenario/${encodeURIComponent(scenarioId)}`;
}

/**
 * Get scenario ID from URL
 * Extracts scenario ID from current URL pathname
 *
 * @returns Scenario ID or null if not in scenario view
 *
 * @example
 * // Current URL: /scenario/social-1
 * const scenarioId = getScenarioIDFromURL();
 * // Returns: 'social-1'
 */
export function getScenarioIDFromURL(): string | null {
  try {
    if (typeof window === 'undefined' || !window.location) {
      return null;
    }

    const pathParts = window.location.pathname.split('/');
    const scenarioIndex = pathParts.indexOf('scenario');

    if (scenarioIndex >= 0 && scenarioIndex + 1 < pathParts.length) {
      const scenarioId = pathParts[scenarioIndex + 1];
      return scenarioId ? decodeURIComponent(scenarioId) : null;
    }

    return null;
  } catch (error) {
    console.warn('Error parsing scenario ID from URL:', error);
    return null;
  }
}

/**
 * Build query string from filters
 * Creates URL query string from filter state
 *
 * @param filters - FilterState object
 * @param search - Search query
 * @param sort - Sort option
 * @returns URL query string (without leading ?)
 *
 * @internal
 *
 * @example
 * const qs = buildQueryString(
 *   { difficulty: ['B2'], duration: ['short'], status: [] },
 *   'flatmate',
 *   'recommended'
 * );
 * // Returns: 'search=flatmate&difficulty=B2&duration=short&sort=recommended'
 */
export function buildQueryString(filters: FilterState, search: string, sort: SortOption): string {
  const params = new URLSearchParams();

  if (search && search.trim().length > 0) {
    params.set('search', encodeURIComponent(search.trim()));
  }

  if (filters.difficulty && filters.difficulty.length > 0) {
    params.set('difficulty', filters.difficulty.join(','));
  }

  if (filters.duration && filters.duration.length > 0) {
    params.set('duration', filters.duration.join(','));
  }

  if (filters.status && filters.status.length > 0) {
    params.set('status', filters.status.join(','));
  }

  if (sort) {
    params.set('sort', sort);
  }

  return params.toString();
}

/**
 * Check if current URL has filters
 * Returns true if any filter or search is in the URL
 *
 * @returns True if URL contains any filter parameters
 *
 * @example
 * // URL: /?search=flatmate&difficulty=B2
 * const hasFilters = hasURLFilters();
 * // Returns: true
 */
export function hasURLFilters(): boolean {
  const params = parseFiltersFromURL();
  return Object.values(params).some((value) => value !== undefined && value !== null && value !== '');
}

/**
 * Clear all URL filters
 * Removes all filter parameters from URL
 *
 * @example
 * clearURLFilters();
 * // URL updates to: /
 */
export function clearURLFilters(): void {
  try {
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  } catch (error) {
    console.warn('Error clearing URL filters:', error);
  }
}

/**
 * Parse filter arrays from URL strings
 * Converts comma-separated filter strings to arrays
 *
 * @param filterString - Comma-separated filter string
 * @returns Array of filter values
 *
 * @internal
 *
 * @example
 * const difficulties = parseFilterArray('B2,C1');
 * // Returns: ['B2', 'C1']
 */
export function parseFilterArray(filterString: string): string[] {
  if (!filterString) {
    return [];
  }

  return filterString.split(',').map((item) => item.trim()).filter((item) => item.length > 0);
}

// Export service as a single object for functional style
export const urlService = {
  parseFiltersFromURL,
  updateURLWithFilters,
  getScenarioURL,
  getScenarioIDFromURL,
  buildQueryString,
  hasURLFilters,
  clearURLFilters,
  parseFilterArray,
  clearDebounceTimer
};
