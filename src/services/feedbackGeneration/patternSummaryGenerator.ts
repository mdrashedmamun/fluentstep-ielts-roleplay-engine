import { RoleplayScript, PatternSummary, CategoryBreakdown, KeyPattern, ChunkCategory } from '../staticData';
import { analyzeScenarioPatterns, getCategoryBreakdownStats } from './patternAnalyzer';

/**
 * Pattern Summary Generator: Creates consolidated pattern insights using templates
 * Template-based approach = fast, zero-cost, deterministic generation
 */

// Category-specific insight templates (rule-based, no AI)
const CATEGORY_INSIGHT_TEMPLATES: Record<ChunkCategory, string[]> = {
  'Openers': [
    'First impressions prioritize warmth over formality.',
    'Conversation starters establish immediate rapport and connection.',
    'Opening phrases signal approachability and cultural awareness.',
    'Natives begin with warmth before sharing information.',
    'Greeting conventions vary by formality context.',
  ],
  'Softening': [
    'Hedging phrases reduce directness while maintaining politeness.',
    'Tentative language allows flexibility and prevents overclaiming.',
    'Softeners signal caution and respect for listener\'s perspective.',
    'Natives tone down certainty to build consensus.',
    'Mitigation strategies reduce potential face-threat.',
  ],
  'Disagreement': [
    'Polite disagreement separates idea critique from personal rejection.',
    'Challenge markers acknowledge alternative viewpoints.',
    'Disagreement frames show respect for speaker while differing.',
    'Natives preface disagreement to soften the blow.',
    'Perspective contrast requires careful formulation.',
  ],
  'Repair': [
    'Clarification requests show engagement and prevent misunderstanding.',
    'Repair phrases recover from conversational breakdowns gracefully.',
    'Politeness markers minimize discomfort during corrections.',
    'Natives pause and clarify before proceeding.',
    'Face-saving repairs maintain relationship while fixing errors.',
  ],
  'Exit': [
    'Closing signals shift conversation toward conclusion respectfully.',
    'Departure phrases vary by formality and relationship.',
    'Exit techniques leave positive final impressions.',
    'Natives end conversations with clear signals and warmth.',
    'Transition markers ease shift from discussion to goodbye.',
  ],
  'Idioms': [
    'Fixed collocations signal fluency and native-like expression.',
    'Idiomatic phrases are inseparable units, not word combinations.',
    'Chunk memorization accelerates speech fluency and naturalness.',
    'Native speakers rely on fixed expressions to reduce cognitive load.',
    'Collocation accuracy separates proficient from intermediate speakers.',
  ],
};

// Overall insight templates based on category mix
const OVERALL_INSIGHT_TEMPLATES = {
  singleCategory: (cat: ChunkCategory, count: number) =>
    `This scenario focuses on ${cat.toLowerCase()} patterns through ${count} key chunk${count > 1 ? 's' : ''}. Native speakers master these expressions to improve conversational flow and reduce cognitive load.`,

  mixedCategories: (categories: string[], count: number) =>
    `This scenario integrates multiple pattern categories: ${categories.join(', ')}. Together, these chunks create natural, polished English that combines clarity with warmth.`,

  openerFocused: (count: number) =>
    `This conversation prioritizes strong openers and initial warmth. The ${count} key patterns show how natives establish immediate rapport before moving to specific content.`,

  softenerFocused: (count: number) =>
    `This scenario emphasizes politeness and softening techniques. The ${count} patterns demonstrate how natives reduce directness while maintaining professionalism and respect.`,

  disagreementFocused: (count: number) =>
    `This challenging scenario showcases ${count} patterns for polite disagreement. Natives combine softeners with clear reasoning to challenge ideas without damaging relationships.`,
};

// Pattern connection rules (rule-based detection)
const PATTERN_CONNECTION_RULES: Array<{
  condition: (categories: ChunkCategory[]) => boolean;
  pattern: string;
  explanation: string;
}> = [
  {
    condition: (cats) => cats.includes('Openers') && cats.length >= 1,
    pattern: 'Foundation building',
    explanation: 'Strong openers establish context and tone before complex exchanges.'
  },
  {
    condition: (cats) => cats.includes('Softening') && cats.includes('Disagreement'),
    pattern: 'Polite challenging',
    explanation: 'Combining softeners with disagreement markers enables respectful debate without face-threat.'
  },
  {
    condition: (cats) => cats.includes('Softening') && cats.includes('Repair'),
    pattern: 'Diplomatic recovery',
    explanation: 'Softening + repair phrases together reduce discomfort during conversation breakdowns.'
  },
  {
    condition: (cats) => cats.includes('Idioms') && cats.length >= 2,
    pattern: 'Collocation clusters',
    explanation: 'Multiple idiomatic phrases in one scenario show how natives rely on fixed expressions for fluency.'
  },
  {
    condition: (cats) => cats.includes('Exit') && cats.length >= 2,
    pattern: 'Conversation lifecycle',
    explanation: 'Exit patterns combined with other categories show complete conversation flow from start to finish.'
  },
  {
    condition: (cats) => cats.includes('Disagreement') && cats.includes('Repair'),
    pattern: 'Challenge and recovery',
    explanation: 'These patterns together show how to present alternatives safely and adjust course if misunderstood.'
  },
];

/**
 * Generate pattern summary for a scenario using templates
 */
export function generatePatternSummaryForScenario(scenario: RoleplayScript): PatternSummary | null {
  if (!scenario.chunkFeedback || scenario.chunkFeedback.length === 0) {
    return null;
  }

  const categoryBreakdown = buildCategoryBreakdown(scenario);
  if (categoryBreakdown.length === 0) {
    return null;
  }

  const overallInsight = buildOverallInsight(scenario, categoryBreakdown);
  const keyPatterns = buildKeyPatterns(scenario, categoryBreakdown);

  return {
    categoryBreakdown,
    overallInsight,
    keyPatterns,
  };
}

/**
 * Build category breakdown with template-generated insights
 */
function buildCategoryBreakdown(scenario: RoleplayScript): CategoryBreakdown[] {
  const stats = getCategoryBreakdownStats(scenario);
  const breakdown: CategoryBreakdown[] = [];

  for (const [category, data] of Object.entries(stats)) {
    if (data) {
      // Select a template insight for this category
      const insights = CATEGORY_INSIGHT_TEMPLATES[category as ChunkCategory];
      const insight = insights[Math.floor(Math.random() * insights.length)];

      breakdown.push({
        category: category as ChunkCategory,
        count: data.count,
        examples: data.examples,
        insight,
      });
    }
  }

  // Sort by count (descending) for better presentation
  breakdown.sort((a, b) => b.count - a.count);

  return breakdown;
}

/**
 * Build overall insight using templates based on category mix
 */
function buildOverallInsight(scenario: RoleplayScript, breakdown: CategoryBreakdown[]): string {
  const categories = breakdown.map(b => b.category);
  const totalChunks = breakdown.reduce((sum, b) => sum + b.count, 0);

  // Rule-based selection of overall insight template
  if (categories.length === 1) {
    return OVERALL_INSIGHT_TEMPLATES.singleCategory(categories[0], totalChunks);
  }

  if (categories.includes('Openers') && categories.length <= 2) {
    return OVERALL_INSIGHT_TEMPLATES.openerFocused(totalChunks);
  }

  if (categories.includes('Softening') && !categories.includes('Disagreement')) {
    return OVERALL_INSIGHT_TEMPLATES.softenerFocused(totalChunks);
  }

  if (categories.includes('Disagreement')) {
    return OVERALL_INSIGHT_TEMPLATES.disagreementFocused(totalChunks);
  }

  return OVERALL_INSIGHT_TEMPLATES.mixedCategories(
    categories.join(', '),
    totalChunks
  );
}

/**
 * Build key patterns using cross-category connection rules
 */
function buildKeyPatterns(scenario: RoleplayScript, breakdown: CategoryBreakdown[]): KeyPattern[] {
  const categories = breakdown.map(b => b.category);
  const allChunks = breakdown.flatMap(b => b.examples);
  const keyPatterns: KeyPattern[] = [];

  // Apply connection rules to detect cross-chunk patterns
  for (const rule of PATTERN_CONNECTION_RULES) {
    if (rule.condition(categories)) {
      // Find relevant chunks for this pattern
      const relevantChunks = allChunks.slice(0, Math.min(3, allChunks.length));

      keyPatterns.push({
        pattern: rule.pattern,
        explanation: rule.explanation,
        chunks: relevantChunks,
      });
    }
  }

  // Limit to 2-4 patterns
  return keyPatterns.slice(0, 4);
}

/**
 * Generate summaries for multiple scenarios in a batch
 */
export function generateSummariesForBatch(scenarios: RoleplayScript[]): Array<{
  scenarioId: string;
  summary: PatternSummary | null;
}> {
  return scenarios.map(scenario => ({
    scenarioId: scenario.id,
    summary: generatePatternSummaryForScenario(scenario),
  }));
}
