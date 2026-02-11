import { RoleplayScript, ChunkCategory, ChunkFeedback } from '../staticData';

/**
 * Pattern Analyzer: Detects and analyzes patterns in scenarios
 * Used to generate pattern summaries by analyzing chunk feedback data
 */

export interface PatternFrequency {
  pattern: string;
  category: ChunkCategory;
  frequency: number;
  scenarios: string[];
}

export interface ScenarioPatterns {
  scenarioId: string;
  categoryBreakdown: Map<ChunkCategory, string[]>; // Category -> chunk examples
  totalChunks: number;
}

/**
 * Analyze a single scenario's chunk patterns by category
 */
export function analyzeScenarioPatterns(scenario: RoleplayScript): ScenarioPatterns {
  const categoryBreakdown = new Map<ChunkCategory, string[]>();

  if (!scenario.chunkFeedback || scenario.chunkFeedback.length === 0) {
    return {
      scenarioId: scenario.id,
      categoryBreakdown,
      totalChunks: 0
    };
  }

  // Group chunks by category
  for (const feedback of scenario.chunkFeedback) {
    if (!categoryBreakdown.has(feedback.category)) {
      categoryBreakdown.set(feedback.category, []);
    }
    categoryBreakdown.get(feedback.category)!.push(feedback.chunk);
  }

  return {
    scenarioId: scenario.id,
    categoryBreakdown,
    totalChunks: scenario.chunkFeedback.length
  };
}

/**
 * Find chunks that appear across multiple scenarios (cross-scenario patterns)
 */
export function findCrossScenarioPatterns(
  scenarios: RoleplayScript[]
): Map<string, PatternFrequency> {
  const patternFrequencies = new Map<string, PatternFrequency>();

  for (const scenario of scenarios) {
    if (!scenario.chunkFeedback) continue;

    for (const feedback of scenario.chunkFeedback) {
      const key = feedback.chunk.toLowerCase();

      if (!patternFrequencies.has(key)) {
        patternFrequencies.set(key, {
          pattern: feedback.chunk,
          category: feedback.category,
          frequency: 0,
          scenarios: []
        });
      }

      const freq = patternFrequencies.get(key)!;
      freq.frequency += 1;
      if (!freq.scenarios.includes(scenario.id)) {
        freq.scenarios.push(scenario.id);
      }
    }
  }

  return patternFrequencies;
}

/**
 * Group patterns by category with frequency analysis
 */
export function groupByCategory(
  patterns: Map<string, PatternFrequency>
): Map<ChunkCategory, PatternFrequency[]> {
  const grouped = new Map<ChunkCategory, PatternFrequency[]>();

  for (const pattern of patterns.values()) {
    if (!grouped.has(pattern.category)) {
      grouped.set(pattern.category, []);
    }
    grouped.get(pattern.category)!.push(pattern);
  }

  // Sort each category by frequency (descending)
  for (const patterns of grouped.values()) {
    patterns.sort((a, b) => b.frequency - a.frequency);
  }

  return grouped;
}

/**
 * Calculate pedagogical value of patterns based on multiple factors
 */
export function calculatePatternValue(
  pattern: PatternFrequency,
  allScenarios: RoleplayScript[]
): number {
  let score = 0;

  // Frequency score (higher = more repeated pattern)
  // Max 30 points for appearing in 3+ scenarios
  score += Math.min(pattern.frequency * 10, 30);

  // Category prioritization (some categories more pedagogically valuable)
  const categoryValue: Record<ChunkCategory, number> = {
    'Openers': 25,      // Foundation of conversations
    'Softening': 20,    // Politeness essential
    'Disagreement': 25, // Complex, high-value
    'Repair': 15,       // Specialized
    'Exit': 10,         // Less frequent
    'Idioms': 20        // Collocation awareness important
  };
  score += categoryValue[pattern.category];

  return score;
}

/**
 * Rank patterns by pedagogical value for selection in summaries
 */
export function rankPatternsByValue(
  patterns: PatternFrequency[],
  allScenarios: RoleplayScript[]
): PatternFrequency[] {
  const scored = patterns.map(p => ({
    pattern: p,
    score: calculatePatternValue(p, allScenarios)
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.pattern);
}

/**
 * Analyze patterns across multiple scenarios to find connections
 */
export function analyzeCrossScenarioConnections(
  scenarioIds: string[],
  allScenarios: RoleplayScript[]
): Map<ChunkCategory, string[]> {
  const connections = new Map<ChunkCategory, string[]>();

  const scenarios = allScenarios.filter(s => scenarioIds.includes(s.id));
  const patterns = findCrossScenarioPatterns(scenarios);

  // Find patterns appearing in 2+ scenarios
  for (const pattern of patterns.values()) {
    if (pattern.frequency >= 2) {
      if (!connections.has(pattern.category)) {
        connections.set(pattern.category, []);
      }
      connections.get(pattern.category)!.push(pattern.pattern);
    }
  }

  return connections;
}

/**
 * Get category breakdown statistics for a scenario
 */
export function getCategoryBreakdownStats(scenario: RoleplayScript): {
  [key in ChunkCategory]?: { count: number; examples: string[] }
} {
  const stats: { [key in ChunkCategory]?: { count: number; examples: string[] } } = {};

  if (!scenario.chunkFeedback || scenario.chunkFeedback.length === 0) {
    return stats;
  }

  const categoryMap = new Map<ChunkCategory, string[]>();

  for (const feedback of scenario.chunkFeedback) {
    if (!categoryMap.has(feedback.category)) {
      categoryMap.set(feedback.category, []);
    }
    categoryMap.get(feedback.category)!.push(feedback.chunk);
  }

  for (const [category, chunks] of categoryMap.entries()) {
    stats[category] = {
      count: chunks.length,
      examples: chunks
    };
  }

  return stats;
}
