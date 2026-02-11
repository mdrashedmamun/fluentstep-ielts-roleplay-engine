/**
 * Structural Discipline Validator
 *
 * Hard gates for scenario structure:
 * - 5-minute practice duration (estimated from word count)
 * - Speaker balance (no speaker dominates >70%)
 * - Blank density (1 blank per 15-25 words)
 * - Context quality (present and meaningful)
 * - Answer variations match blank count
 */

import { RoleplayScript } from '../src/services/staticData';
import { ValidationFinding, FixConfidence } from '../src/services/linguisticAudit/types';

interface StructuralAnalysis {
  totalWordCount: number;
  estimatedMinutes: number;
  blankCount: number;
  blankDensity: number;  // words per blank
  speakerLines: Map<string, number>;
  maxSpeakerPercentage: number;
  contextPresent: boolean;
  contextLength: number;
  answerVariationCount: number;
  matchesBlankCount: boolean;
}

/**
 * Validate structural discipline of a scenario
 */
export function validateStructuralDiscipline(scenario: RoleplayScript): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  const analysis = analyzeStructure(scenario);

  // Check 1: Context is present and meaningful
  if (!analysis.contextPresent) {
    findings.push({
      validatorName: 'Structural Discipline',
      scenarioId: scenario.id,
      location: 'context',
      issue: 'Context field is missing or empty',
      currentValue: scenario.context || '(empty)',
      suggestedValue: `Add meaningful context describing the scenario setting`,
      context: 'Structural requirement',
      confidence: 1.0,
      reasoning: 'Context is required to set the scene and inform dialogue'
    });
  } else if (analysis.contextLength < 10) {
    findings.push({
      validatorName: 'Structural Discipline',
      scenarioId: scenario.id,
      location: 'context',
      issue: 'Context is too brief (less than 10 words)',
      currentValue: scenario.context,
      context: `Current length: ${analysis.contextLength} words`,
      confidence: 0.9,
      reasoning: 'Context should be detailed enough to fully set the scene'
    });
  }

  // Check 2: Duration (5-minute target)
  // Estimate: ~150 words per minute of natural conversation
  const targetWords = 150 * 5;  // 750 words for 5 minutes
  const minWords = 150 * 4;     // 600 words minimum
  const maxWords = 150 * 6;     // 900 words maximum

  if (analysis.totalWordCount < minWords) {
    findings.push({
      validatorName: 'Structural Discipline',
      scenarioId: scenario.id,
      location: 'dialogue',
      issue: `Dialogue too short (${analysis.estimatedMinutes.toFixed(1)} min, target 5 min). Minimum ${minWords} words.`,
      currentValue: `${analysis.totalWordCount} words`,
      context: `Current: ${analysis.estimatedMinutes.toFixed(1)} minutes (${analysis.totalWordCount} words)`,
      confidence: 1.0,
      reasoning: 'IELTS roleplay practice should be ~5 minutes to allow natural conversation development'
    });
  } else if (analysis.totalWordCount > maxWords) {
    findings.push({
      validatorName: 'Structural Discipline',
      scenarioId: scenario.id,
      location: 'dialogue',
      issue: `Dialogue too long (${analysis.estimatedMinutes.toFixed(1)} min, target 5 min). Maximum ${maxWords} words.`,
      currentValue: `${analysis.totalWordCount} words`,
      context: `Current: ${analysis.estimatedMinutes.toFixed(1)} minutes (${analysis.totalWordCount} words)`,
      confidence: 1.0,
      reasoning: 'IELTS roleplay should fit ~5 minutes; longer dialogues become unfocused'
    });
  }

  // Check 3: Speaker balance (no speaker >70%)
  const maxPercentage = analysis.maxSpeakerPercentage;
  if (maxPercentage > 70) {
    const dominantSpeaker = Array.from(analysis.speakerLines.entries()).reduce((a, b) =>
      (a[1] / analysis.totalWordCount) > (b[1] / analysis.totalWordCount) ? a : b
    )[0];

    findings.push({
      validatorName: 'Structural Discipline',
      scenarioId: scenario.id,
      location: 'dialogue',
      issue: `Imbalanced speakers: "${dominantSpeaker}" dominates ${maxPercentage.toFixed(0)}% (max 70%)`,
      currentValue: `${dominantSpeaker}: ${maxPercentage.toFixed(0)}%`,
      context: `Turn-taking is critical for realistic conversation`,
      confidence: 1.0,
      reasoning: 'One speaker should not dominate >70% to ensure balanced turn-taking and conversation practice'
    });
  }

  // Check 4: Blank density (1 blank per 15-25 words)
  const densityTarget = 20; // 1 blank per 20 words
  const densityMin = 15;
  const densityMax = 25;

  if (analysis.blankDensity < densityMin) {
    findings.push({
      validatorName: 'Structural Discipline',
      scenarioId: scenario.id,
      location: 'answerVariations',
      issue: `Blanks too sparse (1 per ${analysis.blankDensity.toFixed(0)} words, target 15-25)`,
      currentValue: `${analysis.blankCount} blanks in ${analysis.totalWordCount} words`,
      context: `Too few blanks reduce learning opportunities`,
      confidence: 0.95,
      reasoning: 'Blank density should be 1 per 15-25 words for sufficient learning opportunities'
    });
  } else if (analysis.blankDensity > densityMax) {
    findings.push({
      validatorName: 'Structural Discipline',
      scenarioId: scenario.id,
      location: 'answerVariations',
      issue: `Blanks too dense (1 per ${analysis.blankDensity.toFixed(0)} words, target 15-25)`,
      currentValue: `${analysis.blankCount} blanks in ${analysis.totalWordCount} words`,
      context: `Too many blanks make dialogue disjointed`,
      confidence: 0.95,
      reasoning: 'Blank density should be 1 per 15-25 words to maintain natural dialogue flow'
    });
  }

  // Check 5: Answer variations match blank count
  if (!analysis.matchesBlankCount) {
    findings.push({
      validatorName: 'Structural Discipline',
      scenarioId: scenario.id,
      location: 'answerVariations',
      issue: `Answer variations count mismatch: ${analysis.answerVariationCount} answers vs ${analysis.blankCount} blanks`,
      currentValue: `${analysis.answerVariationCount} answer variations`,
      context: `Expected ${analysis.blankCount} answer variations`,
      confidence: 1.0,
      reasoning: 'Each blank must have corresponding answer variations'
    });
  }

  // Check 6: Minimum dialogue exchanges (at least 8 exchanges for 5 min)
  const exchanges = Math.floor(scenario.dialogue.length / 2);
  if (exchanges < 8) {
    findings.push({
      validatorName: 'Structural Discipline',
      scenarioId: scenario.id,
      location: 'dialogue',
      issue: `Insufficient dialogue exchanges (${exchanges}, minimum 8 for 5-minute practice)`,
      currentValue: `${scenario.dialogue.length} lines, ${exchanges} exchanges`,
      context: 'More exchanges create better practice flow',
      confidence: 0.9,
      reasoning: 'At least 8 exchanges (16 lines) needed for meaningful 5-minute practice'
    });
  }

  return findings;
}

/**
 * Analyze structural properties of a scenario
 */
function analyzeStructure(scenario: RoleplayScript): StructuralAnalysis {
  // Count total words
  const dialogueText = scenario.dialogue.map(d => d.text).join(' ');
  const totalWordCount = dialogueText.split(/\s+/).filter(w => w.length > 0).length;

  // Count blanks
  const blankCount = scenario.answerVariations.length;
  const blankDensity = blankCount > 0 ? totalWordCount / blankCount : 0;

  // Estimate duration (150 words per minute)
  const estimatedMinutes = totalWordCount / 150;

  // Analyze speaker balance
  const speakerLines = new Map<string, number>();
  for (const line of scenario.dialogue) {
    const count = speakerLines.get(line.speaker) || 0;
    speakerLines.set(line.speaker, count + line.text.split(/\s+/).length);
  }

  const maxSpeakerWords = Math.max(...Array.from(speakerLines.values()));
  const maxSpeakerPercentage = (maxSpeakerWords / totalWordCount) * 100;

  // Check context
  const contextPresent = !!scenario.context && scenario.context.trim().length > 0;
  const contextLength = scenario.context ? scenario.context.split(/\s+/).length : 0;

  // Check answer variations
  const answerVariationCount = scenario.answerVariations.length;
  const matchesBlankCount = answerVariationCount === blankCount;

  return {
    totalWordCount,
    estimatedMinutes,
    blankCount,
    blankDensity,
    speakerLines,
    maxSpeakerPercentage,
    contextPresent,
    contextLength,
    answerVariationCount,
    matchesBlankCount
  };
}

/**
 * Get structural analysis report
 */
export function getStructuralAnalysisReport(scenario: RoleplayScript): string {
  const analysis = analyzeStructure(scenario);

  const lines = [
    `Scenario: ${scenario.id}`,
    `━`.repeat(50),
    `Total Words: ${analysis.totalWordCount} (est. ${analysis.estimatedMinutes.toFixed(1)} min)`,
    `Blanks: ${analysis.blankCount} (1 per ${analysis.blankDensity.toFixed(1)} words)`,
    `Exchanges: ${Math.floor(scenario.dialogue.length / 2)}`,
    `Speaker Balance: ${Array.from(analysis.speakerLines.entries())
      .map(([speaker, count]) => `${speaker}: ${((count / analysis.totalWordCount) * 100).toFixed(0)}%`)
      .join(', ')}`,
    `Context: ${analysis.contextPresent ? `✓ (${analysis.contextLength} words)` : '✗ Missing'}`,
    `Answer Variations: ${analysis.answerVariationCount}/${analysis.blankCount} ${
      analysis.matchesBlankCount ? '✓' : '✗'
    }`
  ];

  return lines.join('\n');
}
