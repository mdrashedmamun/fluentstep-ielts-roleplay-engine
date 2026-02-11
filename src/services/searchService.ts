/**
 * Search Service
 * Provides scenario searching and highlighting capabilities
 * Pure logic, no UI dependencies
 */

import { RoleplayScript } from './staticData';
import { SearchIndex } from '../types/ux-enhancements';

/**
 * Common irregular word forms that don't follow standard suffix rules
 * Maps variations to their base form for consistent stemming
 */
const IRREGULAR_STEMS: Record<string, string> = {
  // Meeting variants
  'meeting': 'meet',
  'meetings': 'meet',

  // Negotiate variants
  'negotiating': 'negotiate',
  'negotiation': 'negotiate',
  'negotiations': 'negotiate',
  'negotiates': 'negotiate',
  'negotiated': 'negotiate',

  // Discuss variants
  'discussing': 'discuss',
  'discussion': 'discuss',
  'discussions': 'discuss',
  'discussed': 'discuss',

  // Repair variants
  'repairing': 'repair',
  'repairs': 'repair',
  'repaired': 'repair',

  // Other common variants
  'lying': 'lie',
  'dying': 'die',
  'tying': 'tie',
  'being': 'be',
  'doing': 'do',
  'going': 'go',
  'coming': 'come',
  'running': 'run',
  'getting': 'get',
  'putting': 'put',
  'cutting': 'cut',
  'sitting': 'sit',
  'wedding': 'wed',
  'housing': 'house',
  'using': 'use',
  'losing': 'lose',
  'choosing': 'choose'
};

/**
 * Stem a word to its root form for better search matching
 * Handles common English suffixes and irregular forms
 *
 * @param word - The word to stem
 * @returns Root form of the word
 *
 * @example
 * stemWord('negotiating') // Returns 'negotiate'
 * stemWord('negotiation') // Returns 'negotiate'
 * stemWord('meeting') // Returns 'meet'
 */
function stemWord(word: string): string {
  const normalized = word.toLowerCase().trim();

  // Check irregular forms first
  if (IRREGULAR_STEMS[normalized]) {
    return IRREGULAR_STEMS[normalized];
  }

  // Apply suffix removal rules for regular forms
  // Order matters: remove longer suffixes first

  // Remove -tion, -ation (but not -sion which is less common)
  if (normalized.endsWith('tion') && normalized.length > 6) {
    return normalized.slice(0, -4);
  }

  // Remove -ation
  if (normalized.endsWith('ation') && normalized.length > 7) {
    return normalized.slice(0, -5);
  }

  // Remove -ing
  if (normalized.endsWith('ing') && normalized.length > 5) {
    return normalized.slice(0, -3);
  }

  // Remove -ed
  if (normalized.endsWith('ed') && normalized.length > 4) {
    return normalized.slice(0, -2);
  }

  // Remove -er
  if (normalized.endsWith('er') && normalized.length > 4) {
    return normalized.slice(0, -2);
  }

  // Remove -ly
  if (normalized.endsWith('ly') && normalized.length > 4) {
    return normalized.slice(0, -2);
  }

  // Remove -es (plural/verb)
  if (normalized.endsWith('es') && normalized.length > 4) {
    return normalized.slice(0, -2);
  }

  // Remove -s (plural/verb)
  if (normalized.endsWith('s') && normalized.length > 3) {
    return normalized.slice(0, -1);
  }

  // Return original if no stem rules applied
  return normalized;
}

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
 * Uses word stemming for intelligent matching of different word forms
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
 * // Word stemming: 'meet' matches 'meeting'
 * const results = search('meet', scenarios);
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

  // Normalize query to lowercase, split into words, and stem each word
  const queryWords = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => stemWord(word));

  if (queryWords.length === 0) {
    return scenarios;
  }

  return scenarios.filter((scenario) => {
    const searchableText = `${scenario.topic || ''} ${scenario.context || ''}`.toLowerCase();

    // Extract words from searchable text and stem them
    const searchableWords = searchableText
      .split(/[\s\-,.:;!?()]+/)
      .filter(word => word && word.length > 0)
      .map(word => stemWord(word));

    // All query word stems must match at least one searchable word stem
    return queryWords.every((queryStem) =>
      searchableWords.some((searchStem) => {
        if (!searchStem || typeof searchStem !== 'string') return false;
        return searchStem === queryStem || (searchStem.includes && searchStem.includes(queryStem));
      })
    );
  });
}

/**
 * Highlight search term matches in text with HTML markers
 * Uses word stemming to match different word forms
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
 * const text = 'Negotiating Business Partnership Terms';
 * const highlighted = highlightMatches(text, 'negotiate');
 * // Returns: '<mark>Negotiating</mark> Business Partnership Terms'
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

  const queryWords = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(word => stemWord(word));

  if (queryWords.length === 0) {
    return text;
  }

  let result = text;

  // Split text into words while preserving original case and structure
  // We need to find original words whose stems match query stems
  const wordPattern = /\b(\w+)\b/g;
  const matchedWords = new Set<string>();

  // First pass: identify which original words should be highlighted
  let match;
  while ((match = wordPattern.exec(text)) !== null) {
    const originalWord = match[1];
    const stemmedWord = stemWord(originalWord);

    // Check if this word's stem matches any query stem
    const shouldHighlight = queryWords.some(queryStem =>
      stemmedWord === queryStem || stemmedWord.includes(queryStem)
    );

    if (shouldHighlight) {
      matchedWords.add(originalWord);
    }
  }

  // Second pass: highlight all matched words
  for (const word of matchedWords) {
    // Escape special regex characters in the word
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
    result = result.replace(regex, '<mark>$&</mark>');
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
