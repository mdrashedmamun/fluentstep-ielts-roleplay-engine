/**
 * Dialogue Flow Validator
 * Validates natural turn-taking, emotional tone, and situational realism
 */

import { RoleplayScript } from '../../staticData';
import { ValidationFinding } from '../types';
import { scoreConfidence } from '../fixers/confidenceScorer';

export function validateDialogueFlow(scenario: RoleplayScript): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  // Check for extreme dialogue length mismatches (too many blanks in a row)
  let consecutiveBlanks = 0;
  const blankIndices = new Set(scenario.answerVariations.map(av => av.index));

  for (let i = 0; i < scenario.dialogue.length; i++) {
    if (blankIndices.has(i)) {
      consecutiveBlanks++;
      if (consecutiveBlanks > 2) {
        const confidence = scoreConfidence({
          issueType: 'dialogue-flow',
          affectedText: '',
          suggestedFix: '',
          context: scenario.dialogue.slice(Math.max(0, i - 2), i + 3).join(' '),
          category: scenario.category
        });

        findings.push({
          validatorName: 'Dialogue Flow',
          scenarioId: scenario.id,
          location: `dialogue[${i}]`,
          issue: `Multiple consecutive blanks (${consecutiveBlanks}) may disrupt dialogue coherence`,
          currentValue: `${consecutiveBlanks} blanks in a row`,
          context: scenario.dialogue.slice(Math.max(0, i - 2), i + 3).map(d => d.text).join(' | '),
          confidence: confidence.score * 0.6, // Lower confidence since this is subjective
          reasoning: `Natural dialogue typically alternates between provided and blank content`,
          suggestedValue: undefined
        });
        consecutiveBlanks = 0;
      }
    } else {
      consecutiveBlanks = 0;
    }
  }

  // Check for emotional tone consistency
  // Simple heuristic: detect complaint/apology/thanks patterns
  for (const av of scenario.answerVariations) {
    const isComplaint = /sorry|apologize|apologise|wrong|issue|problem/i.test(av.answer);
    const isThankful = /thank|appreciate|grateful|cheers/i.test(av.answer);

    // If complaint, next speaker should acknowledge
    if (isComplaint && av.index + 1 < scenario.dialogue.length) {
      const nextLine = scenario.dialogue[av.index + 1]?.text || '';
      const acknowledgesIssue = /understand|sorry|fix|resolve|help/i.test(nextLine);

      if (!acknowledgesIssue && !nextLine.includes('______')) {
        const confidence = scoreConfidence({
          issueType: 'dialogue-flow',
          affectedText: av.answer,
          suggestedFix: '',
          context: `${av.answer} | ${nextLine}`,
          category: scenario.category
        });

        findings.push({
          validatorName: 'Dialogue Flow',
          scenarioId: scenario.id,
          location: `answerVariations[${av.index}]!.answer`,
          issue: `Complaint/problem not acknowledged in next turn`,
          currentValue: av.answer,
          context: `Next line: "${nextLine}"`,
          confidence: confidence.score * 0.5, // Very low confidence for this subjective check
          reasoning: `When learner expresses complaint, native speaker typically acknowledges before continuing`,
          suggestedValue: undefined
        });
      }
    }
  }

  return findings;
}

export function getDialogueFlowReport(scenario: RoleplayScript) {
  const findings = validateDialogueFlow(scenario);
  return {
    scenarioId: scenario.id,
    issues: findings.length,
    status: findings.length === 0 ? '✓ PASS' : `⚠ ${findings.length} ISSUE(S)`
  };
}
