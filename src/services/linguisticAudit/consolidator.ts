/**
 * Consolidator for Multi-Agent Audit Architecture
 * Deduplicates findings from multiple worker processes
 * Detects and tracks conflicts in auto-fix suggestions
 */

import { WorkerOutput, ConsolidatedFinding, ValidationFinding } from './types';

export interface ConsolidationStats {
  totalFindingsFromWorkers: number;
  uniqueFindingsAfterDedup: number;
  duplicatesRemoved: number;
  conflictsDetected: number;
  agreementRate: number;  // % of findings found by multiple workers
}

/**
 * Consolidate findings from multiple worker outputs
 * Deduplicates and detects conflicts in suggested fixes
 */
export function consolidateFindings(
  workerOutputs: WorkerOutput[]
): ConsolidatedFinding[] {
  const findingsMap = new Map<string, ConsolidatedFinding>();
  let totalFindings = 0;

  for (const workerOutput of workerOutputs) {
    for (const finding of workerOutput.findings) {
      totalFindings++;
      const key = `${finding.scenarioId}|${finding.location}|${finding.validatorName}`;

      if (findingsMap.has(key)) {
        const existing = findingsMap.get(key)!;

        // Check if suggestedValue differs
        if (
          finding.suggestedValue &&
          existing.suggestedValue &&
          existing.suggestedValue !== finding.suggestedValue
        ) {
          // CONFLICT: Different workers suggest different fixes
          if (!existing.conflict) {
            existing.conflict = {
              alternatives: [
                {
                  workerId: existing.sources[0],
                  suggestedValue: existing.suggestedValue,
                  confidence: existing.confidence
                }
              ],
              resolution: 'auto',
              winner: -1
            };
          }

          // Add this alternative if not already present
          const altExists = existing.conflict.alternatives.some(
            alt => alt.suggestedValue === finding.suggestedValue
          );
          if (!altExists) {
            existing.conflict.alternatives.push({
              workerId: workerOutput.workerId,
              suggestedValue: finding.suggestedValue,
              confidence: finding.confidence
            });
          }
        }

        // Add worker to sources list
        if (!existing.sources.includes(workerOutput.workerId)) {
          existing.sources.push(workerOutput.workerId);
        }
      } else {
        // New finding
        const consolidated: ConsolidatedFinding = {
          ...finding,
          sources: [workerOutput.workerId]
        };
        findingsMap.set(key, consolidated);
      }
    }
  }

  return Array.from(findingsMap.values());
}

/**
 * Calculate consolidation statistics
 */
export function calculateConsolidationStats(
  workerOutputs: WorkerOutput[],
  consolidated: ConsolidatedFinding[]
): ConsolidationStats {
  const totalFromWorkers = workerOutputs.reduce(
    (sum, output) => sum + output.findings.length,
    0
  );

  const duplicatesRemoved = totalFromWorkers - consolidated.length;
  const findingsWithMultipleSources = consolidated.filter(
    f => f.sources.length > 1
  ).length;
  const conflictCount = consolidated.filter(f => f.conflict).length;

  return {
    totalFindingsFromWorkers: totalFromWorkers,
    uniqueFindingsAfterDedup: consolidated.length,
    duplicatesRemoved,
    conflictsDetected: conflictCount,
    agreementRate:
      consolidated.length > 0
        ? (findingsWithMultipleSources / consolidated.length) * 100
        : 0
  };
}

/**
 * Generate consolidation report
 */
export function generateConsolidationReport(
  stats: ConsolidationStats,
  consolidated: ConsolidatedFinding[]
): string {
  const conflictDetails = consolidated
    .filter(f => f.conflict)
    .slice(0, 5)
    .map(
      f =>
        `  - ${f.scenarioId} [${f.location}]: "${f.suggestedValue}" vs ${f.conflict!.alternatives.map(alt => `"${alt.suggestedValue}"`).join(', ')}`
    )
    .join('\n');

  return `
📊 Consolidation Report
=======================

Worker Findings: ${stats.totalFindingsFromWorkers}
Unique Findings: ${stats.uniqueFindingsAfterDedup}
Duplicates Removed: ${stats.duplicatesRemoved}
Conflicts Detected: ${stats.conflictsDetected}
Agreement Rate: ${stats.agreementRate.toFixed(1)}%

${stats.conflictsDetected > 0 ? 'Sample Conflicts:\n' + conflictDetails : 'No conflicts detected ✓'}
`;
}
