/**
 * Written vs Spoken Validator
 * Detects essay-like language that doesn't sound natural in conversation
 */

import { RoleplayScript } from '../../staticData';
import { ValidationFinding } from '../types';
import { findWrittenVsSpokenIssues, soundsWritten } from '../rules/writtenVsSpokenPatterns';
import { scoreConfidence } from '../fixers/confidenceScorer';

export function validateWrittenVsSpoken(scenario: RoleplayScript): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  for (const av of scenario.answerVariations) {
    const analysis = soundsWritten(av.answer);

    // Only flag if there are significant issues
    if (analysis.issues.length > 0) {
      const confidence = scoreConfidence({
        issueType: 'written-vs-spoken',
        affectedText: av.answer,
        suggestedFix: analysis.issues[0]?.pattern.suggestions[0] || '',
        context: scenario.dialogue[av.index]?.text || '',
        category: scenario.category
      });

      // Only report if confidence is medium or higher
      if (confidence.score >= 0.6) {
        const issueDescriptions = analysis.issues
          .map(issue => `"${issue.match}"`)
          .join(', ');

        findings.push({
          validatorName: 'Written vs Spoken',
          scenarioId: scenario.id,
          location: `answerVariations[${av.index}]!.answer`,
          issue: `Sounds written, not spoken: ${issueDescriptions}`,
          currentValue: av.answer,
          alternatives: [
            ...new Set(
              analysis.issues.flatMap(issue => issue.pattern.suggestions)
            )
          ],
          context: `Dialogue: "${scenario.dialogue[av.index]?.text}"`,
          confidence: confidence.score * 0.8,  // Lower confidence for subjective call
          reasoning: `Contains formal/essay language. Native speakers in conversation would use simpler alternatives.`
        });
      }
    }
  }

  return findings;
}
