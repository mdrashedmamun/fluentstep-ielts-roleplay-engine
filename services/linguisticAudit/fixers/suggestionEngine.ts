/**
 * Suggestion Engine
 * Generates user-facing suggestions for MEDIUM/LOW confidence findings
 */

import { ValidationFinding } from '../types';
import { scoreConfidence, requiresApproval, isLowConfidence } from './confidenceScorer';

export interface UserSuggestion {
  index: number;                   // For CLI numbering
  finding: ValidationFinding;
  confidence: number;
  displayText: string;             // User-friendly display
  options: string[];               // For MEDIUM (1 option) or LOW (multiple)
}

/**
 * Convert validation findings into user-friendly suggestions
 */
export function generateSuggestions(
  findings: ValidationFinding[]
): UserSuggestion[] {
  const suggestions: UserSuggestion[] = [];
  let index = 0;

  for (const finding of findings) {
    const confidence = scoreConfidence({
      issueType: finding.issue,
      affectedText: finding.currentValue,
      suggestedFix: finding.suggestedValue || '',
      context: finding.context
    });

    // Skip HIGH confidence (handled by auto-fixer)
    if (confidence.level === 'HIGH') continue;

    // Include MEDIUM confidence findings
    if (requiresApproval(confidence)) {
      const options = finding.suggestedValue
        ? [finding.suggestedValue]
        : finding.alternatives || [];

      suggestions.push({
        index: ++index,
        finding,
        confidence: confidence.score,
        displayText: buildDisplayText(finding, confidence.score),
        options
      });
    }

    // Include LOW confidence findings with multiple alternatives
    else if (isLowConfidence(confidence)) {
      const options = finding.alternatives || [finding.suggestedValue || ''];

      suggestions.push({
        index: ++index,
        finding,
        confidence: confidence.score,
        displayText: buildDisplayText(finding, confidence.score),
        options
      });
    }
  }

  return suggestions;
}

/**
 * Build human-readable display text for a suggestion
 */
function buildDisplayText(finding: ValidationFinding, confidence: number): string {
  const confidencePercent = Math.round(confidence * 100);
  const location = finding.location.replace(/\[(\d+)\]/g, ' #$1');

  return `
[${finding.validatorName}] ${finding.scenarioId} @ ${location}
Issue: ${finding.issue}
Confidence: ${confidencePercent}%
Current: "${finding.currentValue}"
Reasoning: ${finding.reasoning}
`.trim();
}

/**
 * Format options for CLI presentation
 */
export function formatOptions(options: string[]): string {
  if (options.length === 1) {
    return `  Suggested: "${options[0]}"`;
  }

  return (
    '  Options:\n' +
    options.map((opt, i) => `    ${i + 1}. "${opt}"`).join('\n')
  );
}

/**
 * Group suggestions by scenario and validator for better organization
 */
export function groupSuggestions(
  suggestions: UserSuggestion[]
): Map<string, Map<string, UserSuggestion[]>> {
  const grouped = new Map<string, Map<string, UserSuggestion[]>>();

  for (const suggestion of suggestions) {
    const scenarioId = suggestion.finding.scenarioId;
    const validator = suggestion.finding.validatorName;

    if (!grouped.has(scenarioId)) {
      grouped.set(scenarioId, new Map());
    }

    const scenarioMap = grouped.get(scenarioId)!;
    if (!scenarioMap.has(validator)) {
      scenarioMap.set(validator, []);
    }

    scenarioMap.get(validator)!.push(suggestion);
  }

  return grouped;
}

/**
 * Sort suggestions by confidence (highest first) and validator
 */
export function sortSuggestions(suggestions: UserSuggestion[]): UserSuggestion[] {
  return [...suggestions].sort((a, b) => {
    // Higher confidence first
    if (a.confidence !== b.confidence) {
      return b.confidence - a.confidence;
    }
    // Then by validator name
    return a.finding.validatorName.localeCompare(b.finding.validatorName);
  });
}
