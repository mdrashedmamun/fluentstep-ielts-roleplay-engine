/**
 * Handoff Validation: Agent Output Quality Checkpoints
 *
 * Validates agent output at each handoff point in the scenario creation pipeline.
 * Catches incomplete or malformed data immediately, preventing issues from reaching
 * production (addresses root cause of BBC deployment failure).
 *
 * Pipeline flow with checkpoints:
 * content-gen → validate() → blank-inserter → validate() → transformer → validate() → E2E tests
 */

import { RoleplayScript, RoleplayScriptV1, RoleplayScriptV2 } from '../staticData';

/**
 * Validation result: {valid, errors[], warnings[]}
 * Errors = must fix (blocking)
 * Warnings = should fix (non-blocking)
 */
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * CHECKPOINT 1: Content Generation Output Validation
 *
 * Verifies content-gen agent created complete scenario data
 * Should error if:
 * - No dialogue entries
 * - Dialogue/answer mismatch
 * - Missing feedback data for V2 scenarios
 */
export function validateContentGenOutput(scenario: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check dialogue exists and has content
  if (!scenario.dialogue || !Array.isArray(scenario.dialogue) || scenario.dialogue.length === 0) {
    errors.push('content-gen: Dialogue array missing or empty');
  }

  // Check answer variations exist and match dialogue blanks
  if (!scenario.answerVariations || !Array.isArray(scenario.answerVariations)) {
    errors.push('content-gen: answerVariations array missing');
  } else if (scenario.answerVariations.length === 0) {
    errors.push('content-gen: answerVariations array is empty');
  }

  // For V2 scenarios: check all required feedback properties exist
  const hasChunkFeedbackV2 = scenario.chunkFeedbackV2 && Array.isArray(scenario.chunkFeedbackV2);
  const hasBlankMapping = scenario.blanksInOrder && Array.isArray(scenario.blanksInOrder);
  const hasPatternSummary = scenario.patternSummary && typeof scenario.patternSummary === 'object';
  const hasActiveRecall = scenario.activeRecall && Array.isArray(scenario.activeRecall);

  const isV2Scenario = hasChunkFeedbackV2 || hasBlankMapping || hasPatternSummary || hasActiveRecall;

  if (isV2Scenario) {
    if (!hasChunkFeedbackV2) {
      errors.push('content-gen: V2 scenario missing chunkFeedbackV2');
    }
    if (!hasPatternSummary) {
      errors.push('content-gen: V2 scenario missing patternSummary');
    }
  }

  // Verify answer count consistency
  if (scenario.dialogue && scenario.answerVariations) {
    const dialogueBlankCount = scenario.dialogue.reduce(
      (sum: number, d: any) => sum + (d.text?.match(/_+/g) || []).length,
      0
    );

    if (dialogueBlankCount !== scenario.answerVariations.length) {
      warnings.push(
        `content-gen: Dialogue has ${dialogueBlankCount} blanks but answerVariations has ${scenario.answerVariations.length} entries`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * CHECKPOINT 2: Blank Insertion Output Validation
 *
 * Verifies blank-inserter agent created proper metadata
 * Should error if:
 * - blanksInOrder not created
 * - blanksInOrder length != answerVariations length
 */
export function validateBlankInsertedOutput(scenario: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check blanksInOrder was created
  if (!scenario.blanksInOrder || !Array.isArray(scenario.blanksInOrder)) {
    errors.push('blank-inserter: blanksInOrder mapping not created - required for UI rendering');
  } else {
    // Check length consistency
    if (scenario.answerVariations && Array.isArray(scenario.answerVariations)) {
      if (scenario.blanksInOrder.length !== scenario.answerVariations.length) {
        errors.push(
          `blank-inserter: blanksInOrder length (${scenario.blanksInOrder.length}) ` +
          `does not match answerVariations length (${scenario.answerVariations.length})`
        );
      }
    }

    // Check each mapping has expected structure
    scenario.blanksInOrder.forEach((mapping: any, idx: number) => {
      if (!mapping || typeof mapping !== 'object') {
        warnings.push(`blank-inserter: blanksInOrder[${idx}] is invalid (should be object)`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * CHECKPOINT 3: Transformer Output Validation
 *
 * Verifies transformed scenario has complete, consistent schema
 * Should error if:
 * - V2 schema missing required properties
 * - Mixed V1/V2 properties
 * - Invalid data types
 */
export function validateTransformedOutput(scenario: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Determine schema version
  const isV2 = scenario.chunkFeedbackV2 !== undefined || scenario.blanksInOrder !== undefined;
  const isV1 = scenario.deepDive !== undefined || scenario.chunkFeedback !== undefined;

  if (isV2) {
    // V2 Validation: ALL properties required
    if (!scenario.chunkFeedbackV2 || !Array.isArray(scenario.chunkFeedbackV2)) {
      errors.push('transformer: V2 scenario missing chunkFeedbackV2 array');
    } else if (scenario.chunkFeedbackV2.length === 0) {
      warnings.push('transformer: V2 scenario has empty chunkFeedbackV2 array');
    }

    if (!scenario.blanksInOrder || !Array.isArray(scenario.blanksInOrder)) {
      errors.push('transformer: V2 scenario missing blanksInOrder array');
    } else if (scenario.blanksInOrder.length === 0) {
      warnings.push('transformer: V2 scenario has empty blanksInOrder array');
    }

    if (!scenario.patternSummary || typeof scenario.patternSummary !== 'object') {
      errors.push('transformer: V2 scenario missing patternSummary object');
    }

    if (!scenario.activeRecall || !Array.isArray(scenario.activeRecall)) {
      errors.push('transformer: V2 scenario missing activeRecall array');
    } else if (scenario.activeRecall.length === 0) {
      warnings.push('transformer: V2 scenario has empty activeRecall array (should have spaced repetition)');
    }

    // V2 should NOT have V1 properties
    if (scenario.deepDive) {
      errors.push('transformer: V2 scenario should not have deepDive property');
    }
  }

  // Verify always-required base properties
  if (!scenario.dialogue || !Array.isArray(scenario.dialogue) || scenario.dialogue.length === 0) {
    errors.push('transformer: Missing or empty dialogue array');
  }

  if (!scenario.answerVariations || !Array.isArray(scenario.answerVariations) || scenario.answerVariations.length === 0) {
    errors.push('transformer: Missing or empty answerVariations array');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * CHECKPOINT 4: Pre-Merge Schema Validation
 *
 * Final check before merging to main - ensures TypeScript schema requirements met
 */
export function validatePreMergeSchema(scenario: RoleplayScript): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // If we got here with TS passing, schema is valid!
  // This is mainly for runtime validation and detailed error messages

  const v2scenario = scenario as any as RoleplayScriptV2;
  if (v2scenario.chunkFeedbackV2 !== undefined) {
    // This is a V2 scenario
    const v2errors: string[] = [];

    if (!v2scenario.chunkFeedbackV2) v2errors.push('chunkFeedbackV2');
    if (!v2scenario.blanksInOrder) v2errors.push('blanksInOrder');
    if (!v2scenario.patternSummary) v2errors.push('patternSummary');
    if (!v2scenario.activeRecall) v2errors.push('activeRecall');

    if (v2errors.length > 0) {
      errors.push(`pre-merge: V2 scenario missing required properties: ${v2errors.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Helper: Format validation results for display
 */
export function formatValidationReport(stepName: string, result: ValidationResult): string {
  const lines: string[] = [];
  lines.push(`\n[${stepName}] Validation Report`);
  lines.push(`Status: ${result.valid ? '✅ PASS' : '❌ FAIL'}`);

  if (result.errors.length > 0) {
    lines.push('Errors (blocking):');
    result.errors.forEach(err => lines.push(`  ❌ ${err}`));
  }

  if (result.warnings.length > 0) {
    lines.push('Warnings (non-blocking):');
    result.warnings.forEach(warn => lines.push(`  ⚠️  ${warn}`));
  }

  return lines.join('\n');
}

/**
 * Helper: Get total checkpoint status
 */
export function aggregateValidationResults(results: ValidationResult[]): ValidationResult {
  return {
    valid: results.every(r => r.valid),
    errors: results.flatMap(r => r.errors),
    warnings: results.flatMap(r => r.warnings),
  };
}
