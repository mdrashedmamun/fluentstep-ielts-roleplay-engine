/**
 * Conflict Resolver for Multi-Agent Audit Architecture
 * Auto-resolves conflicts in suggested fixes using confidence scores
 * and validator priority hierarchy
 */

import { ConsolidatedFinding } from './types';

/**
 * Validator priority for conflict resolution (highest to lowest)
 * Used when multiple fixes have same confidence score
 */
const VALIDATOR_PRIORITY: Record<string, number> = {
  'Grammar Context': 1,
  'UK English Spelling': 2,
  'UK English Vocabulary': 3,
  'Contextual Substitution': 4,
  'Blank-Answer Pairing': 5,
  'Chunk Compliance': 6,
  'Dialogue Flow': 7,
  'Alternatives Quality': 8,
  'Contextual Redundancy': 9
};

/**
 * Get priority score for a validator (lower = higher priority)
 */
function getValidatorPriority(validatorName: string): number {
  return VALIDATOR_PRIORITY[validatorName] ?? 999;
}

/**
 * Resolve conflicts across all findings
 * Uses confidence score, then validator priority, then earliest worker ID
 */
export function resolveConflicts(
  findings: ConsolidatedFinding[]
): ConsolidatedFinding[] {
  const resolutions: Array<{
    finding: ConsolidatedFinding;
    method: 'confidence' | 'priority' | 'earliest';
    winner: number;
  }> = [];

  for (const finding of findings) {
    if (!finding.conflict) continue;

    const alternatives = finding.conflict.alternatives;
    if (alternatives.length === 0) continue;

    // Sort by confidence (descending)
    const sorted = [...alternatives].sort((a, b) => b.confidence - a.confidence);

    let winner = sorted[0];
    let method: 'confidence' | 'priority' | 'earliest' = 'confidence';

    // Check for confidence tie
    if (sorted[0].confidence === sorted[1]?.confidence) {
      // Tie: use validator priority
      const byPriority = [...alternatives].sort((a, b) => {
        const priorityDiff =
          getValidatorPriority(a.suggestedValue) -
          getValidatorPriority(b.suggestedValue);
        if (priorityDiff !== 0) return priorityDiff;
        return a.workerId - b.workerId; // Fallback: earliest worker
      });

      winner = byPriority[0];
      method = 'priority';
    }

    // Apply resolution
    finding.conflict.winner = winner.workerId;
    finding.suggestedValue = winner.suggestedValue;
    finding.confidence = winner.confidence;
    finding.conflict.resolution = 'auto';

    resolutions.push({ finding, method, winner: winner.workerId });
  }

  return findings;
}

/**
 * Generate conflict resolution log
 */
export function generateConflictLog(
  findings: ConsolidatedFinding[]
): string {
  const resolved = findings.filter(f => f.conflict);

  if (resolved.length === 0) {
    return 'No conflicts to resolve ✓';
  }

  const entries = resolved
    .slice(0, 20)
    .map(f => {
      const alternatives = f.conflict!.alternatives
        .map(alt => `"${alt.suggestedValue}" (${(alt.confidence * 100).toFixed(0)}%)`)
        .join(' | ');

      return `[${f.scenarioId}] ${f.location}\n  Alternatives: ${alternatives}\n  ✓ Chose: "${f.suggestedValue}" (worker ${f.conflict!.winner})`;
    })
    .join('\n\n');

  return `
Conflict Resolutions (${resolved.length} total)
================================================

${entries}

${resolved.length > 20 ? `\n... and ${resolved.length - 20} more` : ''}
`;
}
