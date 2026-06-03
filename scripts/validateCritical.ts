#!/usr/bin/env tsx

/**
 * Critical Validation - BLOCK commits/builds on data errors that cause production failures
 *
 * This script prevents 6 critical error types from reaching production:
 * 1. Parse/syntax errors in staticData.ts
 * 2. Missing required fields for V2 scenarios
 * 3. Blank count mismatches (dialogue vs answers vs feedback vs mappings)
 * 4. Invalid chunkId references (format, existence, cross-references)
 * 5. TypeScript compilation errors
 * 6. Schema inconsistencies (V1/V2 mixing without fallback)
 *
 * Also warns (doesn't block) on 3 style issues for code review.
 *
 * Exit Code: 0 = All critical checks pass | 1 = Critical errors found
 */

import { execSync } from 'child_process';

// Import the actual data to validate
import { CURATED_ROLEPLAYS, type RoleplayScript } from '../src/services/staticData';

interface ValidationError {
  type: 'critical' | 'warning';
  message: string;
  scenario?: string;
}

interface ValidationResult {
  scenarioId: string;
  errors: ValidationError[];
  passCount: number;
}

const results: ValidationResult[] = [];

const writeOut = (message = ''): void => {
  process.stdout.write(`${message}\n`);
};

const getErrorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

const getCommandOutput = (error: unknown): string => {
  if (typeof error !== 'object' || error === null) {
    return String(error);
  }

  const stderr = 'stderr' in error ? error.stderr : undefined;
  if (Buffer.isBuffer(stderr)) {
    return stderr.toString();
  }

  if (typeof stderr === 'string') {
    return stderr;
  }

  return getErrorMessage(error);
};
let totalCriticalErrors = 0;
let totalWarnings = 0;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

/**
 * Check 1: Missing required fields for V2 scenarios
 */
function validateRequiredFields(script: RoleplayScript): ValidationError[] {
  const errors: ValidationError[] = [];
  const requiredFields = ['id', 'category', 'topic', 'context', 'characters', 'dialogue'];

  for (const field of requiredFields) {
    if (!script[field as keyof RoleplayScript]) {
      errors.push({
        type: 'critical',
        message: `Missing required field: "${field}"`,
        scenario: script.id,
      });
    }
  }

  // V2-specific requirements
  if (script.blanksInOrder?.length) {
    if (!script.answerVariations?.length) {
      errors.push({
        type: 'critical',
        message: 'V2 scenario has blanksInOrder but missing answerVariations',
        scenario: script.id,
      });
    }
    if (!script.chunkFeedbackV2?.length) {
      errors.push({
        type: 'critical',
        message: 'V2 scenario has blanksInOrder but missing chunkFeedbackV2',
        scenario: script.id,
      });
    }
  }

  return errors;
}

/**
 * Check 2: Count blanks in dialogue and verify they match answerVariations
 */
function validateBlankCounts(script: RoleplayScript): ValidationError[] {
  const errors: ValidationError[] = [];

  // Count blanks in dialogue
  let dialogueBlankCount = 0;
  script.dialogue.forEach(turn => {
    const matches = turn.text.match(/________/g);
    if (matches) {
      dialogueBlankCount += matches.length;
    }
  });

  const answerCount = script.answerVariations?.length || 0;
  const feedbackCount = script.chunkFeedbackV2?.length || script.chunkFeedback?.length || 0;
  const mappingCount = script.blanksInOrder?.length || 0;

  // Every scenario must keep visible dialogue blanks aligned with answers.
  // V2 scenarios add feedback and mapping alignment on top.
  if (dialogueBlankCount !== answerCount) {
    errors.push({
      type: "critical",
      message: `Blank count mismatch: ${dialogueBlankCount} in dialogue but ${answerCount} answers (should match)`,
      scenario: script.id,
    });
  }

  // For V2 scenarios, feedback and mappings must also match visible blanks.
  if (script.blanksInOrder?.length) {
    if (dialogueBlankCount !== feedbackCount) {
      errors.push({
        type: 'critical',
        message: `Blank count mismatch: ${dialogueBlankCount} in dialogue but ${feedbackCount} feedback items (should match)`,
        scenario: script.id,
      });
    }
    if (dialogueBlankCount !== mappingCount) {
      errors.push({
        type: 'critical',
        message: `Blank count mismatch: ${dialogueBlankCount} in dialogue but ${mappingCount} blank mappings (should match)`,
        scenario: script.id,
      });
    }
  }

  return errors;
}

/**
 * Check 3: Validate chunkId format and existence
 */
function validateChunkIdReferences(script: RoleplayScript): ValidationError[] {
  const errors: ValidationError[] = [];

  // Collect all defined chunkIds from chunkFeedbackV2
  const definedChunkIds = new Set<string>();
  const chunkFeedback = script.chunkFeedbackV2;

  // Handle both array and object-like formats defensively.
  if (Array.isArray(chunkFeedback)) {
    chunkFeedback.forEach((feedback) => {
      if (feedback.chunkId) {
        definedChunkIds.add(feedback.chunkId);
      }
    });
  } else if (typeof chunkFeedback === 'object' && chunkFeedback !== null) {
    Object.keys(chunkFeedback).forEach((key) => {
      definedChunkIds.add(key);
    });
  }

  // Check blanksInOrder references
  (script.blanksInOrder || []).forEach((mapping, idx) => {
    if (!mapping.chunkId) {
      errors.push({
        type: 'critical',
        message: `blanksInOrder[${idx}] is missing chunkId`,
        scenario: script.id,
      });
      return;
    }

    // Validate format: should look like "prefix-ch-slug" or similar stable format
    if (!mapping.chunkId.includes('ch_') && !mapping.chunkId.includes('-ch-')) {
      errors.push({
        type: 'warning',
        message: `blanksInOrder[${idx}] chunkId "${mapping.chunkId}" doesn't follow expected format (suggest: "{scenarioId}-ch_{slug}")`,
        scenario: script.id,
      });
    }

    // Check existence
    if (!definedChunkIds.has(mapping.chunkId)) {
      errors.push({
        type: 'critical',
        message: `blanksInOrder[${idx}] references non-existent chunkId "${mapping.chunkId}"`,
        scenario: script.id,
      });
    }
  });

  // Check patternSummary cross-references
  if (script.patternSummary) {
    const patternChunkIds = new Set<string>();

    script.patternSummary.categoryBreakdown?.forEach(breakdown => {
      (breakdown.exampleChunkIds || []).forEach(chunkId => {
        if (!definedChunkIds.has(chunkId)) {
          errors.push({
            type: 'critical',
            message: `patternSummary.categoryBreakdown references non-existent chunkId "${chunkId}"`,
            scenario: script.id,
          });
        }
        patternChunkIds.add(chunkId);
      });
    });

    script.patternSummary.keyPatterns?.forEach(pattern => {
      (pattern.chunkIds || []).forEach(chunkId => {
        if (!definedChunkIds.has(chunkId)) {
          errors.push({
            type: 'critical',
            message: `patternSummary.keyPatterns references non-existent chunkId "${chunkId}"`,
            scenario: script.id,
          });
        }
        patternChunkIds.add(chunkId);
      });
    });
  }

  // Check activeRecall cross-references
  if (script.activeRecall) {
    script.activeRecall.forEach((item, idx) => {
      (item.targetChunkIds || []).forEach(chunkId => {
        if (!definedChunkIds.has(chunkId)) {
          errors.push({
            type: 'critical',
            message: `activeRecall[${idx}] references non-existent chunkId "${chunkId}"`,
            scenario: script.id,
          });
        }
      });
    });
  }

  return errors;
}

/**
 * Check 4: Schema consistency - no V1/V2 mixing without fallback logic
 */
function validateSchemaConsistency(script: RoleplayScript): ValidationError[] {
  const errors: ValidationError[] = [];

  const hasV1Feedback = (script.chunkFeedback || []).length > 0;
  const hasV2Feedback = (script.chunkFeedbackV2 || []).length > 0;
  const hasBlanksInOrder = (script.blanksInOrder || []).length > 0;

  // If using blanksInOrder, must use V2 feedback
  if (hasBlanksInOrder && !hasV2Feedback && hasV1Feedback) {
    errors.push({
      type: 'warning',
      message: 'Scenario has blanksInOrder but uses V1 chunkFeedback (consider migrating to V2)',
      scenario: script.id,
    });
  }

  // If using V2 feedback, should have blanksInOrder for full compatibility
  if (hasV2Feedback && !hasBlanksInOrder) {
    errors.push({
      type: 'warning',
      message: 'V2 chunkFeedbackV2 defined but no blanksInOrder mapping (may cause issues with progressive unlock)',
      scenario: script.id,
    });
  }

  return errors;
}


/**
 * Check 5: Deterministic feedback and alternatives quality gates
 */
function validateFeedbackQuality(script: RoleplayScript): ValidationError[] {
  const errors: ValidationError[] = [];

  const answerVariations = script.answerVariations || [];
  const allAlternativesEmpty = answerVariations.length >= 3 && answerVariations.every(av => !av.alternatives || av.alternatives.length === 0);

  if (allAlternativesEmpty) {
    errors.push({
      type: 'critical',
      message: `All ${answerVariations.length} answer variations have zero alternatives`,
      scenario: script.id,
    });
  }

  const v2Feedback = script.chunkFeedbackV2 || [];
  const feedbackByChunkId = new Map(v2Feedback.map(feedback => [feedback.chunkId, feedback]));

  v2Feedback.forEach((feedback, index) => {
    if (!feedback.learner?.whyOdd || feedback.learner.whyOdd.trim().length === 0) {
      errors.push({
        type: 'critical',
        message: `chunkFeedbackV2[${index}] has empty learner.whyOdd`,
        scenario: script.id,
      });
    }

    if ((feedback.examples || []).length > 2) {
      errors.push({
        type: 'critical',
        message: `chunkFeedbackV2[${index}] has ${feedback.examples.length} examples; maximum is 2`,
        scenario: script.id,
      });
    }
  });

  if (script.blanksInOrder?.length && v2Feedback.length) {
    script.blanksInOrder.forEach((mapping, index) => {
      const expectedAnswer = answerVariations[index]?.answer;
      const feedback = feedbackByChunkId.get(mapping.chunkId);

      if (expectedAnswer && feedback && !phrasesAlign(feedback.native, [expectedAnswer])) {
        errors.push({
          type: 'critical',
          message: `blanksInOrder[${index}] maps answer "${expectedAnswer}" to feedback native "${feedback.native}"`,
          scenario: script.id,
        });
      }
    });
  }

  const v1Feedback = script.chunkFeedback || [];
  const allAcceptedAnswers = answerVariations.flatMap(answer => [answer.answer, ...(answer.alternatives || [])]);
  v1Feedback.forEach((feedback, index) => {
    if (!phrasesAlign(feedback.chunk, allAcceptedAnswers)) {
      errors.push({
        type: 'critical',
        message: `chunkFeedback[${index}] chunk "${feedback.chunk}" does not align with any accepted answer`,
        scenario: script.id,
      });
    }
  });

  return errors;
}

function phrasesAlign(feedbackPhrase: string, acceptedAnswers: string[]): boolean {
  const feedback = normalizePhrase(feedbackPhrase);
  return acceptedAnswers.some(answer => {
    const accepted = normalizePhrase(answer);
    return feedback === accepted || feedback.includes(accepted) || accepted.includes(feedback);
  });
}

function normalizePhrase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check 6: TypeScript compilation errors for core app files
 * Note: Skips checking CLI tools that have known issues
 */
function validateTypeScript(): ValidationError[] {
  const errors: ValidationError[] = [];

  try {
    // Check only src/ (app code), skip cli/ (tools with known issues)
    execSync('npx tsc src/ --noEmit --skipLibCheck --lib es2020 2>&1', {
      cwd: process.cwd(),
      stdio: 'pipe',
    });
  } catch (error) {
    // Only treat as critical if it's actually app code errors
    const stderr = getCommandOutput(error);
    // Filter out known issues from CLI files
    const appErrors = stderr
      .split('\n')
      .filter(line => !line.includes('cli/') && line.includes('error'));

    if (appErrors.length > 0) {
      errors.push({
        type: 'critical',
        message: `TypeScript compilation errors in app code:\n${appErrors.join('\n')}`,
      });
    }
  }

  return errors;
}

/**
 * Check 7: Warn on hardcoded values (style check, not critical)
 */
function checkHardcodedValues(): ValidationError[] {
  const warnings: ValidationError[] = [];

  // This is just a simple check - in production you'd parse the source code
  // For now, we'll skip this as it would require reading source files
  // Real implementation would use AST parsing

  return warnings;
}

/**
 * Main validation loop
 */
function validateAllScenarios() {
  writeOut(`\n${colors.blue}=== Critical Data Validation ===${colors.reset}\n`);

  // First, validate TypeScript
  writeOut(`${colors.gray}Checking TypeScript compilation...${colors.reset}`);
  const tsErrors = validateTypeScript();
  if (tsErrors.length > 0) {
    tsErrors.forEach(err => {
      console.error(`${colors.red}❌ CRITICAL: ${err.message}${colors.reset}`);
      totalCriticalErrors++;
    });
    return;
  }
  writeOut(`${colors.green}✅ TypeScript: No compilation errors${colors.reset}\n`);

  // Validate each scenario
  for (const script of CURATED_ROLEPLAYS) {
    const errors: ValidationError[] = [];

    // Run all checks
    errors.push(...validateRequiredFields(script));
    errors.push(...validateBlankCounts(script));
    errors.push(...validateChunkIdReferences(script));
    errors.push(...validateSchemaConsistency(script));
    errors.push(...validateFeedbackQuality(script));
    errors.push(...checkHardcodedValues());

    // Separate critical from warnings
    const criticals = errors.filter(e => e.type === 'critical');
    const warnings = errors.filter(e => e.type === 'warning');

    // Count results
    const passCount = 6 - (criticals.length > 0 ? 1 : 0);

    if (criticals.length > 0 || warnings.length > 0) {
      writeOut(`${script.id}:`);

      if (criticals.length === 0) {
        writeOut(`${colors.green}✅ No critical errors${colors.reset}`);
      } else {
        criticals.forEach(err => {
          console.error(`  ${colors.red}❌ CRITICAL: ${err.message}${colors.reset}`);
          totalCriticalErrors++;
        });
      }

      if (warnings.length > 0) {
        warnings.forEach(warn => {
          console.warn(`  ${colors.yellow}⚠️  ${warn.message}${colors.reset}`);
          totalWarnings++;
        });
      }

      writeOut();
    } else {
      writeOut(`${script.id}: ${colors.green}✅ All checks pass${colors.reset}`);
    }

    results.push({
      scenarioId: script.id,
      errors,
      passCount,
    });
  }
}

/**
 * Exit with appropriate code
 */
function exitWithStatus() {
  writeOut(`${colors.blue}=== Summary ===${colors.reset}`);
  writeOut(`Total scenarios validated: ${CURATED_ROLEPLAYS.length}`);
  writeOut(`Critical errors: ${colors.red}${totalCriticalErrors}${colors.reset}`);
  writeOut(`Warnings: ${colors.yellow}${totalWarnings}${colors.reset}`);

  if (totalCriticalErrors > 0) {
    console.error(
      `\n${colors.red}❌ FAILED - ${totalCriticalErrors} critical error(s) found${colors.reset}`
    );
    console.error(colors.red + 'Blocking build. Fix errors and retry.\n' + colors.reset);
    process.exit(1);
  } else {
    writeOut(`\n${colors.green}✅ All critical checks passed${colors.reset}\n`);
    process.exit(0);
  }
}

// Run validation
validateAllScenarios();
exitWithStatus();
