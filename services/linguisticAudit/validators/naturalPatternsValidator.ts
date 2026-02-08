/**
 * Natural Patterns Validator
 * Detects awkward "textbook English" phrasing and suggests native alternatives
 */

import { RoleplayScript } from '../../staticData';
import { ValidationFinding } from '../types';
import { findTextbookPatterns } from '../rules/awkwardPhrases';
import { scoreConfidence } from '../fixers/confidenceScorer';

export function validateNaturalPatterns(scenario: RoleplayScript): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  for (const av of scenario.answerVariations) {
    const issues = findTextbookPatterns(av.answer);

    for (const issue of issues) {
      const confidence = scoreConfidence({
        issueType: 'textbook-phrase',
        affectedText: issue.match,
        suggestedFix: issue.pattern.suggestions[0] || '',
        context: scenario.dialogue[av.index] || '',
        category: scenario.category
      });

      findings.push({
        validatorName: 'Natural Patterns',
        scenarioId: scenario.id,
        location: `answerVariations[${av.index}].answer`,
        issue: issue.pattern.issue,
        currentValue: av.answer,
        alternatives: issue.pattern.suggestions,
        context: `Dialogue: "${scenario.dialogue[av.index]}"`,
        confidence: confidence.score,
        reasoning: `"${issue.match}" sounds textbook-like. Native speakers would say: ${issue.pattern.suggestions.slice(0, 2).join(' or ')}`
      });
    }
  }

  return findings;
}

export function getNaturalPatternsReport(scenario: RoleplayScript) {
  const findings = validateNaturalPatterns(scenario);
  return {
    scenarioId: scenario.id,
    issues: findings.length,
    status: findings.length === 0 ? '✓ PASS' : `⚠ ${findings.length} ISSUE(S)`
  };
}
