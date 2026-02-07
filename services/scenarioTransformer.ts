/**
 * Scenario Transformer
 * Converts ParsedScenario into RoleplayScript format
 */

import { RoleplayScript } from './staticData';
import { ParsedScenario } from './scenarioParser';
import { matchToChunk, validateAnswerCompliance, ComplianceReport } from './chunkMatcher';

export interface TransformResult {
  scenario: RoleplayScript;
  complianceReport: ComplianceReport;
  warnings: string[];
}

/**
 * Categorize scenario based on content
 */
function categorizeScenario(
  scenario: ParsedScenario
): 'Social' | 'Workplace' | 'Service/Logistics' | 'Advanced' {
  const allText = (
    scenario.title +
    ' ' +
    scenario.context +
    ' ' +
    scenario.dialogue.map(d => d.text).join(' ')
  ).toLowerCase();

  // Keywords for each category
  const socialKeywords = ['friend', 'meet', 'flatmate', 'weekend', 'coffee', 'casual', 'chat'];
  const workplaceKeywords = [
    'work',
    'colleague',
    'manager',
    'report',
    'project',
    'meeting',
    'professional'
  ];
  const serviceKeywords = ['café', 'cafe', 'hotel', 'airport', 'shop', 'restaurant', 'customer'];
  const advancedKeywords = ['escalate', 'negotiate', 'disagreement', 'complex', 'senior'];

  const countMatches = (keywords: string[]) =>
    keywords.filter(kw => allText.includes(kw)).length;

  const scores = {
    Social: countMatches(socialKeywords),
    Workplace: countMatches(workplaceKeywords),
    'Service/Logistics': countMatches(serviceKeywords),
    Advanced: countMatches(advancedKeywords)
  };

  const category = Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0] as
    | 'Social'
    | 'Workplace'
    | 'Service/Logistics'
    | 'Advanced';

  return category;
}

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 30);
}

/**
 * Generate next ID for category
 */
function generateId(category: 'Social' | 'Workplace' | 'Service/Logistics' | 'Advanced', slug: string): string {
  const categoryPrefix: Record<typeof category, string> = {
    Social: 'social',
    Workplace: 'workplace',
    'Service/Logistics': 'service',
    Advanced: 'advanced'
  };

  // In a real scenario, we'd check existing IDs. For now, use a simple counter.
  // The actual ID will be adjusted when integrating into staticData.ts
  return `${categoryPrefix[category]}-new-${slug}`;
}

/**
 * Create character descriptions
 */
function createCharacterDescriptions(
  characters: string[]
): Array<{ name: string; description: string; avatarUrl?: string }> {
  const charDescMap: Record<string, string> = {
    You: 'You / Learner',
    Jack: 'Friendly flatmate',
    'Friend A': 'Friend',
    'Friend B': 'Friend',
    'Person A': 'Person',
    'Person B': 'Person',
    'Colleague A': 'Colleague',
    'Colleague B': 'Colleague',
    'Manager': 'Manager',
    'Barista': 'Café staff',
    'Check-in Agent': 'Airport agent',
    'Receptionist': 'Hotel receptionist',
    'Shop Assistant': 'Sales assistant',
    'Agent': 'Service representative'
  };

  return characters.map(char => ({
    name: char,
    description: charDescMap[char] || char,
    avatarUrl: undefined // Users can add avatars later
  }));
}

/**
 * Extract blanks and their positions from dialogue
 */
function extractDialogueBlanks(
  dialogue: Array<{ speaker: string; text: string }>
): Array<{ index: number; lineIndex: number; text: string }> {
  const blanks: Array<{ index: number; lineIndex: number; text: string }> = [];
  let index = 0;

  dialogue.forEach((line, lineIndex) => {
    const blankMatches = Array.from(line.text.matchAll(/________/g));
    blankMatches.forEach(() => {
      blanks.push({
        index: index++,
        lineIndex,
        text: line.text
      });
    });
  });

  return blanks;
}

/**
 * Transform dialogue: replace ________ with [BLANK_N]
 */
function transformDialogueText(dialogue: Array<{ speaker: string; text: string }>): Array<{
  speaker: string;
  text: string;
}> {
  let blankIndex = 0;
  return dialogue.map(line => {
    const transformedText = line.text.replace(/________/g, () => {
      const replacement = `________`; // Keep as is, will be rendered with popup
      blankIndex++;
      return replacement;
    });
    return { ...line, text: transformedText };
  });
}

/**
 * Main transformation function
 */
export function transformToRoleplayScript(parsed: ParsedScenario, existingCount: number = 0): TransformResult {
  const warnings: string[] = [];

  // Validate dialogue exists
  if (parsed.dialogue.length === 0) {
    throw new Error(`No dialogue found in scenario: ${parsed.title}`);
  }

  // Extract answers and validate
  const allAnswers = parsed.answers.map(a => a.answer);
  if (allAnswers.length === 0) {
    warnings.push('⚠️ No answers extracted - scenario may have parsing issues');
  }

  const complianceReport = validateAnswerCompliance(allAnswers);

  // Categorize
  const category = categorizeScenario(parsed);
  const slug = generateSlug(parsed.title);
  const id = generateId(category, slug);

  // Transform dialogue
  const transformedDialogue = transformDialogueText(parsed.dialogue);

  // Create answer variations
  const answerVariations = parsed.answers.map((ans, idx) => ({
    index: idx + 1,
    answer: ans.answer,
    alternatives: ans.alternatives.length > 0 ? ans.alternatives : [ans.answer]
  }));

  // Create deep dive insights
  const deepDive = allAnswers.slice(0, 5).map((answer, idx) => {
    const match = matchToChunk(answer);
    return {
      index: idx + 1,
      phrase: answer,
      insight: `${match.bucket === 'A' ? 'Universal chunk' : match.bucket === 'B' ? 'Topic-specific' : 'Native phrase'}: ${match.source}`
    };
  });

  // Build final RoleplayScript
  const scenario: RoleplayScript = {
    id,
    category,
    topic: parsed.title,
    context: parsed.context || `A roleplay scenario: ${parsed.title}`,
    characters: createCharacterDescriptions(parsed.characters),
    dialogue: transformedDialogue,
    answerVariations,
    deepDive,
    backgroundUrl: undefined
  };

  if (complianceReport.complianceScore < 80) {
    warnings.push(
      `⚠️ Compliance score: ${complianceReport.complianceScore}% (target 80%+)`
    );
    warnings.push(`Novel vocabulary: ${complianceReport.novelAnswers.join(', ')}`);
  } else {
    warnings.push(`✓ Excellent compliance: ${complianceReport.complianceScore}%`);
  }

  return {
    scenario,
    complianceReport,
    warnings
  };
}

/**
 * Transform multiple scenarios
 */
export function transformAllScenarios(
  parsedScenarios: ParsedScenario[]
): TransformResult[] {
  return parsedScenarios.map((parsed, idx) =>
    transformToRoleplayScript(parsed, idx)
  );
}
