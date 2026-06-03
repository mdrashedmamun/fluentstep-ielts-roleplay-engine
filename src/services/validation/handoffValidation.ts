/**
 * Handoff Validation: Agent Output Quality Checkpoints
 *
 * Validates agent output at each handoff point in the scenario creation pipeline.
 * Catches incomplete or malformed data immediately, preventing issues from reaching
 * production (addresses root cause of BBC deployment failure).
 *
 * Pipeline flow with checkpoints:
 * content-gen -> validate() -> blank-inserter -> validate() -> transformer -> validate() -> E2E tests
 */

import { type RoleplayScript, type RoleplayScriptV2 } from '../staticData';

type UnknownRecord = Record<string, unknown>;

interface DialogueLineLike {
  text?: string;
}

interface AnswerVariationLike {
  index?: number;
}

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

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function getArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function getDialogueArray(scenario: UnknownRecord): DialogueLineLike[] | undefined {
  const dialogue = getArray(scenario.dialogue);

  if (!dialogue) {
    return undefined;
  }

  return dialogue.filter(isRecord).map((line) => ({
    text: typeof line.text === 'string' ? line.text : undefined
  }));
}

function getAnswerVariationsArray(scenario: UnknownRecord): AnswerVariationLike[] | undefined {
  const answerVariations = getArray(scenario.answerVariations);

  if (!answerVariations) {
    return undefined;
  }

  return answerVariations.filter(isRecord).map((answerVariation) => ({
    index: typeof answerVariation.index === 'number' ? answerVariation.index : undefined
  }));
}

function countDialogueBlanks(dialogue: DialogueLineLike[]): number {
  return dialogue.reduce((sum, dialogueLine) => sum + (dialogueLine.text?.match(/_+/g)?.length ?? 0), 0);
}

function hasObjectValue(value: unknown): boolean {
  return isRecord(value);
}

function hasArrayValue(value: unknown): boolean {
  return Array.isArray(value);
}

function hasDefinedProperty(scenario: UnknownRecord, key: string): boolean {
  return scenario[key] !== undefined;
}

function isRuntimeV2Scenario(scenario: RoleplayScript): scenario is RoleplayScriptV2 {
  return 'chunkFeedbackV2' in scenario && scenario.chunkFeedbackV2 !== undefined;
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
export function validateContentGenOutput(scenario: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(scenario)) {
    return {
      valid: false,
      errors: ['content-gen: scenario payload missing or invalid'],
      warnings
    };
  }

  const dialogue = getDialogueArray(scenario);
  const answerVariations = getAnswerVariationsArray(scenario);

  // Check dialogue exists and has content
  if (!dialogue || dialogue.length === 0) {
    errors.push('content-gen: Dialogue array missing or empty');
  }

  // Check answer variations exist and match dialogue blanks
  if (!answerVariations) {
    errors.push('content-gen: answerVariations array missing');
  } else if (answerVariations.length === 0) {
    errors.push('content-gen: answerVariations array is empty');
  }

  // For V2 scenarios: check all required feedback properties exist
  const hasChunkFeedbackV2 = hasArrayValue(scenario.chunkFeedbackV2);
  const hasBlankMapping = hasArrayValue(scenario.blanksInOrder);
  const hasPatternSummary = hasObjectValue(scenario.patternSummary);
  const hasActiveRecall = hasArrayValue(scenario.activeRecall);

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
  if (dialogue && answerVariations) {
    const dialogueBlankCount = countDialogueBlanks(dialogue);

    if (dialogueBlankCount !== answerVariations.length) {
      warnings.push(
        `content-gen: Dialogue has ${dialogueBlankCount} blanks but answerVariations has ${answerVariations.length} entries`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
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
export function validateBlankInsertedOutput(scenario: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(scenario)) {
    return {
      valid: false,
      errors: ['blank-inserter: scenario payload missing or invalid'],
      warnings
    };
  }

  const blanksInOrder = getArray(scenario.blanksInOrder);
  const answerVariations = getAnswerVariationsArray(scenario);

  // Check blanksInOrder was created
  if (!blanksInOrder) {
    errors.push('blank-inserter: blanksInOrder mapping not created - required for UI rendering');
  } else {
    // Check length consistency
    if (answerVariations && blanksInOrder.length !== answerVariations.length) {
      errors.push(
        `blank-inserter: blanksInOrder length (${blanksInOrder.length}) ` +
          `does not match answerVariations length (${answerVariations.length})`
      );
    }

    // Check each mapping has expected structure
    blanksInOrder.forEach((mapping, index) => {
      if (!isRecord(mapping)) {
        warnings.push(`blank-inserter: blanksInOrder[${index}] is invalid (should be object)`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
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
export function validateTransformedOutput(scenario: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(scenario)) {
    return {
      valid: false,
      errors: ['transformer: scenario payload missing or invalid'],
      warnings
    };
  }

  // Determine schema version
  const isV2 = hasDefinedProperty(scenario, 'chunkFeedbackV2') || hasDefinedProperty(scenario, 'blanksInOrder');

  if (isV2) {
    const chunkFeedbackV2 = getArray(scenario.chunkFeedbackV2);
    const blanksInOrder = getArray(scenario.blanksInOrder);
    const activeRecall = getArray(scenario.activeRecall);

    // V2 Validation: ALL properties required
    if (!chunkFeedbackV2) {
      errors.push('transformer: V2 scenario missing chunkFeedbackV2 array');
    } else if (chunkFeedbackV2.length === 0) {
      warnings.push('transformer: V2 scenario has empty chunkFeedbackV2 array');
    }

    if (!blanksInOrder) {
      errors.push('transformer: V2 scenario missing blanksInOrder array');
    } else if (blanksInOrder.length === 0) {
      warnings.push('transformer: V2 scenario has empty blanksInOrder array');
    }

    if (!hasObjectValue(scenario.patternSummary)) {
      errors.push('transformer: V2 scenario missing patternSummary object');
    }

    if (!activeRecall) {
      errors.push('transformer: V2 scenario missing activeRecall array');
    } else if (activeRecall.length === 0) {
      warnings.push('transformer: V2 scenario has empty activeRecall array (should have spaced repetition)');
    }

    // V2 should NOT have V1 properties
    if (scenario.deepDive) {
      errors.push('transformer: V2 scenario should not have deepDive property');
    }
  }

  const dialogue = getDialogueArray(scenario);
  const answerVariations = getAnswerVariationsArray(scenario);

  // Verify always-required base properties
  if (!dialogue || dialogue.length === 0) {
    errors.push('transformer: Missing or empty dialogue array');
  }

  if (!answerVariations || answerVariations.length === 0) {
    errors.push('transformer: Missing or empty answerVariations array');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
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

  // If we got here with TS passing, schema is valid.
  // This is mainly for runtime validation and detailed error messages.

  if (isRuntimeV2Scenario(scenario)) {
    // This is a V2 scenario
    const v2errors: string[] = [];

    if (!scenario.chunkFeedbackV2) {
      v2errors.push('chunkFeedbackV2');
    }
    if (!scenario.blanksInOrder) {
      v2errors.push('blanksInOrder');
    }
    if (!scenario.patternSummary) {
      v2errors.push('patternSummary');
    }
    if (!scenario.activeRecall) {
      v2errors.push('activeRecall');
    }

    if (v2errors.length > 0) {
      errors.push(`pre-merge: V2 scenario missing required properties: ${v2errors.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Helper: Format validation results for display
 */
export function formatValidationReport(stepName: string, result: ValidationResult): string {
  const lines: string[] = [];
  lines.push(`\n[${stepName}] Validation Report`);
  lines.push(`Status: ${result.valid ? 'PASS' : 'FAIL'}`);

  if (result.errors.length > 0) {
    lines.push('Errors (blocking):');
    result.errors.forEach((error) => lines.push(`  ERROR ${error}`));
  }

  if (result.warnings.length > 0) {
    lines.push('Warnings (non-blocking):');
    result.warnings.forEach((warning) => lines.push(`  WARN ${warning}`));
  }

  return lines.join('\n');
}

/**
 * Helper: Get total checkpoint status
 */
export function aggregateValidationResults(results: ValidationResult[]): ValidationResult {
  return {
    valid: results.every((result) => result.valid),
    errors: results.flatMap((result) => result.errors),
    warnings: results.flatMap((result) => result.warnings)
  };
}
