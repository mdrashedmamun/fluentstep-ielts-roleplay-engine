/**
 * Search Service
 * Provides scenario searching and highlighting capabilities
 * Pure logic, no UI dependencies
 */

import { RoleplayScript } from './staticData';
import { SearchIndex } from '../types/ux-enhancements';

/**
 * Build a searchable index from scenarios
 * Extracts topic and context for fast searching
 *
 * @param scenarios - Array of RoleplayScript objects
 * @returns Array of SearchIndex objects
 *
 * @example
 * const scenarios = [{ id: 'social-1', topic: 'Meeting a New Flatmate', ... }];
 * const index = buildSearchIndex(scenarios);
 * // Returns: [{ scenarioId: 'social-1', topic: 'Meeting a New Flatmate', ... }]
 */
export function buildSearchIndex(scenarios: RoleplayScript[]): SearchIndex[] {
  if (!scenarios || !Array.isArray(scenarios)) {
    return [];
  }

  return scenarios.map((scenario) => ({
    scenarioId: scenario.id,
    topic: scenario.topic || '',
    context: scenario.context || '',
    category: scenario.category || 'Unknown'
  }));
}

/**
 * Search scenarios by matching query against topic and context fields
 * Performs case-insensitive matching and requires all query words to match
 *
 * @param query - Search query string
 * @param scenarios - Array of RoleplayScript objects
 * @returns Array of RoleplayScript objects matching the query
 *
 * @example
 * const scenarios = [
 *   { id: 'social-1', topic: 'Meeting a Flatmate', context: 'First meeting...' },
 *   { id: 'cafe-1', topic: 'At a Café', context: 'Ordering coffee...' }
 * ];
 * const results = search('meeting', scenarios);
 * // Returns: [{ id: 'social-1', ... }]
 *
 * @example
 * // Multiple word search - all words must match
 * const results = search('meeting flatmate', scenarios);
 * // Returns: [{ id: 'social-1', ... }]
 */
export function search(query: string, scenarios: RoleplayScript[]): RoleplayScript[] {
  if (!scenarios || !Array.isArray(scenarios)) {
    return [];
  }

  if (!query || query.trim().length === 0) {
    return scenarios;
  }

  // Normalize query to lowercase and split into words
  const queryWords = query.toLowerCase().trim().split(/\s+/).filter(word => word.length > 0);

  if (queryWords.length === 0) {
    return scenarios;
  }

  return scenarios.filter((scenario) => {
    const searchableText = `${scenario.topic} ${scenario.context}`.toLowerCase();

    // All query words must be present in the searchable text
    return queryWords.every((word) => searchableText.includes(word));
  });
}

/**
 * Highlight search term matches in text with HTML markers
 * Wraps matched terms in <mark> tags for visual highlighting
 * Case-insensitive matching
 *
 * @param text - The text to highlight
 * @param query - The search query to highlight
 * @returns Text with matches wrapped in <mark> tags
 *
 * @example
 * const text = 'Meeting a New Flatmate';
 * const highlighted = highlightMatches(text, 'meeting');
 * // Returns: '<mark>Meeting</mark> a New Flatmate'
 *
 * @example
 * const text = 'Meeting a New Flatmate';
 * const highlighted = highlightMatches(text, 'meeting flatmate');
 * // Returns: '<mark>Meeting</mark> a New <mark>Flatmate</mark>'
 */
export function highlightMatches(text: string, query: string): string {
  if (!text || !query || query.trim().length === 0) {
    return text;
  }

  const queryWords = query.toLowerCase().trim().split(/\s+/).filter(word => word.length > 0);

  if (queryWords.length === 0) {
    return text;
  }

  let result = text;

  // Process each query word
  for (const word of queryWords) {
    // Create regex for case-insensitive matching of whole words or word parts
    // Match the word at word boundaries or as part of a word
    const regex = new RegExp(`\\b(${word}[\\w]*)\\b`, 'gi');
    result = result.replace(regex, '<mark>$1</mark>');
  }

  return result;
}

/**
 * Get search statistics
 * Returns count of scenarios matching a query
 *
 * @param query - Search query string
 * @param scenarios - Array of RoleplayScript objects
 * @returns Number of matching scenarios
 *
 * @example
 * const count = getSearchMatchCount('flatmate', scenarios);
 * // Returns: 1
 */
export function getSearchMatchCount(query: string, scenarios: RoleplayScript[]): number {
  return search(query, scenarios).length;
}

/**
 * Clear search (return all scenarios)
 * Utility function for resetting search state
 *
 * @param scenarios - Array of RoleplayScript objects
 * @returns All scenarios (unfiltered)
 *
 * @example
 * const all = clearSearch(scenarios);
 * // Returns: All scenarios
 */
export function clearSearch(scenarios: RoleplayScript[]): RoleplayScript[] {
  return scenarios || [];
}

// Export service as a single object for functional style
export const searchService = {
  buildSearchIndex,
  search,
  highlightMatches,
  getSearchMatchCount,
  clearSearch
};
