/**
 * Auto-Fix Engine
 * Applies high-confidence fixes directly to scenario data
 */

import type { RoleplayScript, RoleplayScriptV1 } from '../../staticData';
import type { AutoFix, ValidationFinding } from '../types';
import { scoreConfidence } from './confidenceScorer';

export interface AutoFixResult {
  totalChanges: number;
  fixesApplied: AutoFix[];
  log: string[];
}

type AnswerVariation = RoleplayScript['answerVariations'][number];
type DeepDiveItem = NonNullable<RoleplayScriptV1['deepDive']>[number];

const hasDeepDive = (scenario: RoleplayScript): scenario is RoleplayScriptV1 & { deepDive: DeepDiveItem[] } => (
  Array.isArray(scenario.deepDive)
);

const getErrorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

/**
 * Apply all high-confidence fixes to scenarios
 */
export function applyAutoFixes(
  scenarios: RoleplayScript[],
  findings: ValidationFinding[]
): AutoFixResult {
  const fixesApplied: AutoFix[] = [];
  const log: string[] = [];

  // Filter to only high-confidence findings with suggested values
  const autoFixableFinding = findings.filter(
    f => scoreConfidence({
      issueType: f.issue,
      affectedText: f.currentValue,
      suggestedFix: f.suggestedValue || '',
      context: f.context,
      category: scenarios.find(s => s.id === f.scenarioId)?.category
    }).level === 'HIGH' && f.suggestedValue
  );

  for (const finding of autoFixableFinding) {
    try {
      const scenario = scenarios.find(s => s.id === finding.scenarioId);
      if (!scenario) {
        log.push(`⚠️ Scenario not found: ${finding.scenarioId}`);
        continue;
      }

      // Parse location (e.g., "answerVariations[3]!.answer")
      const match = finding.location.match(/(\w+)\[(\d+)\]\.(\w+)/);
      if (!match) {
        log.push(`⚠️ Could not parse location: ${finding.location}`);
        continue;
      }

      const [, arrayName, indexStr, fieldName] = match;
      const index = parseInt(indexStr, 10);

      if (arrayName === 'answerVariations') {
        const av: AnswerVariation | undefined = scenario.answerVariations[index];
        if (av && fieldName === 'answer') {
          const oldValue = av.answer;
          av.answer = finding.suggestedValue!;

          fixesApplied.push({
            scenarioId: scenario.id,
            location: finding.location,
            oldValue,
            newValue: finding.suggestedValue!,
            reason: finding.reasoning,
            validatorName: finding.validatorName
          });

          log.push(
            `✓ ${scenario.id}[${index}]: "${oldValue}" → "${finding.suggestedValue}"`
          );
        } else if (av && fieldName === 'alternatives') {
          const altMatch = finding.location.match(/alternatives\[(\d+)\]/);
          if (altMatch) {
            const altIndex = parseInt(altMatch[1], 10);
            const oldValue = av.alternatives[altIndex];
            av.alternatives[altIndex] = finding.suggestedValue!;

            fixesApplied.push({
              scenarioId: scenario.id,
              location: finding.location,
              oldValue,
              newValue: finding.suggestedValue!,
              reason: finding.reasoning,
              validatorName: finding.validatorName
            });

            log.push(
              `✓ ${scenario.id}[${index}]!.alternatives: "${oldValue}" → "${finding.suggestedValue}"`
            );
          }
        }
      } else if (arrayName === 'deepDive') {
        const dd = hasDeepDive(scenario) ? scenario.deepDive[index] : undefined;
        if (dd && fieldName === 'insight') {
          const oldValue = dd.insight;
          dd.insight = finding.suggestedValue!;

          fixesApplied.push({
            scenarioId: scenario.id,
            location: finding.location,
            oldValue,
            newValue: finding.suggestedValue!,
            reason: finding.reasoning,
            validatorName: finding.validatorName
          });

          log.push(
            `✓ ${scenario.id} deepDive[${index}]: Updated insight`
          );
        }
      }
    } catch (error) {
      log.push(`❌ Error applying fix to ${finding.scenarioId}: ${getErrorMessage(error)}`);
    }
  }

  return {
    totalChanges: fixesApplied.length,
    fixesApplied,
    log
  };
}

/**
 * Create a backup of scenarios before applying fixes (as JSON)
 */
export function createBackup(scenarios: RoleplayScript[]): string {
  return JSON.stringify(scenarios, null, 2);
}

/**
 * Get git diff representation of fixes
 */
export function generateDiffLog(fixes: AutoFix[]): string {
  const lines: string[] = [];

  fixes.forEach(fix => {
    lines.push(`--- ${fix.scenarioId}`);
    lines.push(`Location: ${fix.location}`);
    lines.push(`- ${fix.oldValue}`);
    lines.push(`+ ${fix.newValue}`);
    lines.push(`Reason: ${fix.reason}`);
    lines.push('');
  });

  return lines.join('\n');
}
