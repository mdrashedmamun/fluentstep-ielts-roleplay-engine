/**
 * Tonality & Register Validator
 * Ensures formality matches scenario category
 */

import { RoleplayScript } from '../../staticData';
import { ValidationFinding } from '../types';
import {
  analyzeRegister,
  checkToneMatch,
  RegisterLevel,
  containsHedging,
  getMarkersByRegister
} from '../rules/tonalityMappings';
import { scoreConfidence } from '../fixers/confidenceScorer';

export function validateTonality(scenario: RoleplayScript): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  // Check each answer for tonality match
  for (const av of scenario.answerVariations) {
    const toneMatch = checkToneMatch(av.answer, scenario.category);

    // Detect if tone is significantly mismatched
    if (!toneMatch.matches) {
      const mismatchSeverity = calculateToneMismatch(toneMatch.detected, toneMatch.expected);

      // Only flag extreme mismatches (e.g., formal in casual, casual in formal)
      if (mismatchSeverity > 1) {
        const confidence = scoreConfidence({
          issueType: 'tonality',
          affectedText: av.answer,
          suggestedFix: findMoreAppropriateAlternative(av.answer, scenario.category),
          context: scenario.dialogue[av.index]?.text || '',
          category: scenario.category
        });

        findings.push({
          validatorName: 'Tonality & Register',
          scenarioId: scenario.id,
          location: `answerVariations[${av.index}]!.answer`,
          issue: `Tonality mismatch: detected ${toneMatch.detected}, expected ${formatExpected(toneMatch.expected)}`,
          currentValue: av.answer,
          suggestedValue: undefined, // No single suggestion for tone
          alternatives: generateToneAlternatives(av.answer, toneMatch.expected, scenario.category),
          context: `Dialogue: "${scenario.dialogue[av.index]?.text}"`,
          confidence: confidence.score,
          reasoning: `"${av.answer}" is too ${toneMatch.detected.toLowerCase()} for ${scenario.category} category`
        });
      }
    }

    // Check if British hedging is used appropriately
    const hasHedging = containsHedging(av.answer);
    if (scenario.category !== 'Social' && !hasHedging && shouldUseHedging(av.answer)) {
      const confidence = scoreConfidence({
        issueType: 'tonality',
        affectedText: av.answer,
        suggestedFix: '',
        context: scenario.dialogue[av.index] || '',
        category: scenario.category
      });

      // Only flag if confidence is medium/low and it's a professional setting
      if (confidence.score >= 0.6 && scenario.category === 'Workplace') {
        findings.push({
          validatorName: 'Tonality & Register',
          scenarioId: scenario.id,
          location: `answerVariations[${av.index}]!.answer`,
          issue: `Missing British hedging in professional context`,
          currentValue: av.answer,
          alternatives: generateHedgedVersions(av.answer),
          context: `Category: ${scenario.category}`,
          confidence: confidence.score * 0.7, // Lower confidence for optional hedging
          reasoning: `Professional context might benefit from hedging like "I might suggest..." instead of direct statement`,
          suggestedValue: undefined
        });
      }
    }
  }

  // Check alternatives for consistency
  for (const av of scenario.answerVariations) {
    if (!av.alternatives) continue;

    const primaryTone = analyzeRegister(av.answer);
    for (let i = 0; i < av.alternatives.length; i++) {
      const altTone = analyzeRegister(av.alternatives[i]);

      // Alternatives should maintain similar tone
      if (registerDistance(primaryTone, altTone) > 1) {
        const confidence = scoreConfidence({
          issueType: 'tonality',
          affectedText: av.alternatives[i],
          suggestedFix: '',
          category: scenario.category
        });

        findings.push({
          validatorName: 'Tonality & Register',
          scenarioId: scenario.id,
          location: `answerVariations[${av.index}]!.alternatives[${i}]`,
          issue: `Tone inconsistency: alternative has different register than primary`,
          currentValue: av.alternatives[i],
          context: `Primary: "${av.answer}" (${primaryTone}) → Alternative: "${av.alternatives[i]}" (${altTone})`,
          confidence: confidence.score * 0.8,
          reasoning: `Alternatives should maintain similar tone. Primary is ${primaryTone}, alternative is ${altTone}`,
          suggestedValue: undefined
        });
      }
    }
  }

  return findings;
}

/**
 * Calculate how mismatched two registers are
 */
function calculateToneMismatch(detected: RegisterLevel, expected: RegisterLevel | RegisterLevel[]): number {
  const registerOrder = [
    RegisterLevel.CASUAL,
    RegisterLevel.NEUTRAL,
    RegisterLevel.PROFESSIONAL,
    RegisterLevel.FORMAL
  ];

  const detectedIndex = registerOrder.indexOf(detected);

  if (Array.isArray(expected)) {
    const minDistance = Math.min(
      ...expected.map(e => Math.abs(detectedIndex - registerOrder.indexOf(e)))
    );
    return minDistance;
  } else {
    return Math.abs(detectedIndex - registerOrder.indexOf(expected));
  }
}

/**
 * Calculate distance between two registers
 */
function registerDistance(r1: RegisterLevel, r2: RegisterLevel): number {
  const registerOrder = [
    RegisterLevel.CASUAL,
    RegisterLevel.NEUTRAL,
    RegisterLevel.PROFESSIONAL,
    RegisterLevel.FORMAL
  ];
  return Math.abs(registerOrder.indexOf(r1) - registerOrder.indexOf(r2));
}

/**
 * Find a more tonally appropriate alternative
 */
function findMoreAppropriateAlternative(text: string, category: string): string {
  // This could be enhanced with synonym lookup
  // For now, return empty string to indicate no simple fix
  return '';
}

/**
 * Generate alternatives with different tones
 */
function generateToneAlternatives(text: string, expectedTone: RegisterLevel | RegisterLevel[], category: string): string[] {
  const alternatives: string[] = [];

  // These are simplified transformations
  // A full implementation would use synonym databases

  if (text.includes('gonna')) {
    alternatives.push(text.replace('gonna', 'going to'));
  }

  if (text.includes('wanna')) {
    alternatives.push(text.replace('wanna', 'want to'));
  }

  // For now, return basic alternatives
  return alternatives.slice(0, 2);
}

/**
 * Check if text is a direct statement that could use hedging
 */
function shouldUseHedging(text: string): boolean {
  // Simple heuristic: statements starting with imperative or strong assertions
  return (
    text.match(/^(you|we|i)\s+(must|should|will|are)\b/i) !== null ||
    text.match(/^(this|that)\s+(is|was)\b/i) !== null
  );
}

/**
 * Generate hedged versions of a statement
 */
function generateHedgedVersions(text: string): string[] {
  const hedged: string[] = [];

  // Add hedging prefixes
  if (!text.includes('I think') && !text.includes('might') && !text.includes('perhaps')) {
    hedged.push(`I think ${text.toLowerCase()}`);
    hedged.push(`Perhaps ${text.toLowerCase()}`);
  }

  return hedged.slice(0, 2);
}

/**
 * Format expected tone for display
 */
function formatExpected(expected: RegisterLevel | RegisterLevel[]): string {
  if (Array.isArray(expected)) {
    return expected.join(' or ');
  }
  return expected;
}

/**
 * Generate a tonality report for a scenario
 */
export function getTonalityReport(scenario: RoleplayScript) {
  const findings = validateTonality(scenario);

  return {
    scenarioId: scenario.id,
    category: scenario.category,
    issues: findings.length,
    status: findings.length === 0 ? '✓ PASS' : `⚠ ${findings.length} ISSUE(S)`
  };
}
