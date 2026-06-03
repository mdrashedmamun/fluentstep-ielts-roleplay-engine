import { CURATED_ROLEPLAYS } from '../src/services/staticData';
import { ChunkCategory, ChunkFeedback, PatternSummary, RoleplayScript } from '../src/services/staticData';

/**
 * Comprehensive validation script for chunk feedback across all scenarios
 * Checks for:
 * - Missing array properties
 * - Invalid blankIndex values
 * - Content quality issues
 * - Data structure compliance
 */

interface ValidationResult {
  errors: string[];
  warnings: string[];
}

type ScenarioWithLegacyFeedback = RoleplayScript & {
  chunkFeedback: ChunkFeedback[];
  patternSummary?: PatternSummary;
};

type ScenarioWithPatternSummary = RoleplayScript & {
  patternSummary: PatternSummary;
};

const hasLegacyChunkFeedback = (scenario: RoleplayScript): scenario is ScenarioWithLegacyFeedback => (
  'chunkFeedback' in scenario && Array.isArray(scenario.chunkFeedback) && scenario.chunkFeedback.length > 0
);

const hasPatternSummary = (scenario: RoleplayScript): scenario is ScenarioWithPatternSummary => (
  'patternSummary' in scenario && Boolean(scenario.patternSummary)
);

const writeLine = (message = ''): void => {
  process.stdout.write(`${message}
`);
};

const writeErrorLine = (message: string): void => {
  process.stderr.write(`${message}
`);
};

const wordCount = (value: string): number => value.split(' ').length;

const validateFeedback = (feedback: ChunkFeedback, maxBlankIndex: number): ValidationResult => {
  const result: ValidationResult = { errors: [], warnings: [] };

  // Check blankIndex validity
  if (feedback.blankIndex < 1 || feedback.blankIndex > maxBlankIndex) {
    result.errors.push(
      `Invalid blankIndex ${feedback.blankIndex} (max: ${maxBlankIndex})`
    );
  }

  // Check required properties exist
  if (!feedback.chunk) {
    result.errors.push('Missing chunk property');
  }
  if (!feedback.category) {
    result.errors.push('Missing category property');
  }
  if (!feedback.coreFunction) {
    result.errors.push('Missing coreFunction property');
  }

  // Check array properties
  if (!Array.isArray(feedback.situations)) {
    result.errors.push('situations is not an array');
  } else if (feedback.situations.length !== 3) {
    result.warnings.push(
      `situations has ${feedback.situations.length} items (expected 3)`
    );
  }

  if (!Array.isArray(feedback.nativeUsageNotes)) {
    result.errors.push('nativeUsageNotes is not an array');
  } else if (feedback.nativeUsageNotes.length < 3) {
    result.warnings.push(
      `nativeUsageNotes has ${feedback.nativeUsageNotes.length} items (expected >=3)`
    );
  }

  if (!Array.isArray(feedback.nonNativeContrast)) {
    result.errors.push('nonNativeContrast is not an array');
  } else if (feedback.nonNativeContrast.length !== 2) {
    result.warnings.push(
      `nonNativeContrast has ${feedback.nonNativeContrast.length} items (expected 2)`
    );
  }

  // Check content lengths (soft validation - just warn)
  const coreLength = wordCount(feedback.coreFunction || '');
  if (coreLength > 20) {
    result.warnings.push(
      `coreFunction is ${coreLength} words (recommended <=20)`
    );
  }

  // Validate situations structure
  if (Array.isArray(feedback.situations)) {
    feedback.situations.forEach((situation, idx) => {
      if (!situation.context) {
        result.errors.push(`situation[${idx}] missing context`);
      }
      if (!situation.example) {
        result.errors.push(`situation[${idx}] missing example`);
      }
      const exLen = wordCount(situation.example || '');
      if (exLen > 15) {
        result.warnings.push(
          `situation[${idx}] example is ${exLen} words (recommended <=15)`
        );
      }
    });
  }

  // Validate contrast structure
  if (Array.isArray(feedback.nonNativeContrast)) {
    feedback.nonNativeContrast.forEach((contrast, idx) => {
      if (!contrast.nonNative) {
        result.errors.push(`contrast[${idx}] missing nonNative`);
      }
      if (!contrast.native) {
        result.errors.push(`contrast[${idx}] missing native`);
      }
      if (!contrast.explanation) {
        result.errors.push(`contrast[${idx}] missing explanation`);
      }
      const expLen = wordCount(contrast.explanation || '');
      if (expLen > 20) {
        result.warnings.push(
          `contrast[${idx}] explanation is ${expLen} words (recommended <=20)`
        );
      }
    });
  }

  return result;
};

const VALID_CHUNK_CATEGORIES: ChunkCategory[] = ['Openers', 'Softening', 'Disagreement', 'Repair', 'Exit', 'Idioms'];

const validatePatternSummary = (
  summary: PatternSummary,
  chunkFeedback: ChunkFeedback[] | undefined
): ValidationResult => {
  const result: ValidationResult = { errors: [], warnings: [] };

  if (!summary) {
    return result;
  }

  // Check required properties
  if (!Array.isArray(summary.categoryBreakdown)) {
    result.errors.push('categoryBreakdown is not an array');
  } else {
    if (summary.categoryBreakdown.length < 2 || summary.categoryBreakdown.length > 6) {
      result.warnings.push(
        `categoryBreakdown has ${summary.categoryBreakdown.length} items (expected 2-6)`
      );
    }

    // Validate each category breakdown item
    summary.categoryBreakdown.forEach((item, idx) => {
      const category = item.category;
      const examples = item.examples || [];

      if (!category || !VALID_CHUNK_CATEGORIES.includes(category)) {
        result.errors.push(`categoryBreakdown[${idx}]: Invalid category '${category || ''}'`);
      }
      if (item.count !== examples.length) {
        result.errors.push(
          `categoryBreakdown[${idx}]: count ${item.count} doesn't match examples length ${examples.length}`
        );
      }
      if (!item.insight || item.insight.length < 30 || item.insight.length > 100) {
        result.warnings.push(
          `categoryBreakdown[${idx}]: insight length ${(item.insight || '').length} (expected 30-100)`
        );
      }

      // Verify chunks exist in chunkFeedback
      if (chunkFeedback && examples.length > 0) {
        examples.forEach((example) => {
          if (!chunkFeedback.find(feedback => feedback.chunk === example)) {
            result.errors.push(
              `categoryBreakdown[${idx}]: chunk '${example}' not found in chunkFeedback`
            );
          }
        });
      }
    });
  }

  // Check overallInsight
  if (!summary.overallInsight) {
    result.errors.push('Missing overallInsight');
  } else if (summary.overallInsight.length < 100 || summary.overallInsight.length > 300) {
    result.warnings.push(
      `overallInsight length ${summary.overallInsight.length} (expected 100-300)`
    );
  }

  // Check keyPatterns
  if (!Array.isArray(summary.keyPatterns)) {
    result.errors.push('keyPatterns is not an array');
  } else {
    if (summary.keyPatterns.length < 2 || summary.keyPatterns.length > 4) {
      result.warnings.push(
        `keyPatterns has ${summary.keyPatterns.length} items (expected 2-4)`
      );
    }

    summary.keyPatterns.forEach((pattern, idx) => {
      if (!pattern.pattern || pattern.pattern.length < 10 || pattern.pattern.length > 50) {
        result.warnings.push(
          `keyPatterns[${idx}]: pattern length ${(pattern.pattern || '').length} (expected 10-50)`
        );
      }
      if (!pattern.explanation || pattern.explanation.length < 50 || pattern.explanation.length > 150) {
        result.warnings.push(
          `keyPatterns[${idx}]: explanation length ${(pattern.explanation || '').length} (expected 50-150)`
        );
      }
      if (!Array.isArray(pattern.chunks)) {
        result.errors.push(`keyPatterns[${idx}]: chunks is not an array`);
      }
    });
  }

  return result;
};

// Main validation logic
const main = (): void => {
  const scenariosWithFeedback = CURATED_ROLEPLAYS.filter(hasLegacyChunkFeedback);
  const scenariosWithSummary = CURATED_ROLEPLAYS.filter(hasPatternSummary);

  writeLine('\n=== Chunk Feedback & Pattern Summary Validation Report ===\n');
  writeLine(`Found ${scenariosWithFeedback.length} scenarios with chunkFeedback`);
  writeLine(`Found ${scenariosWithSummary.length} scenarios with patternSummary\n`);

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalFeedbackItems = 0;
  let totalSummaries = 0;
  const failedScenarios: string[] = [];

  scenariosWithFeedback.forEach(scenario => {
    writeLine(`\n📋 ${scenario.id}`);
    writeLine(`   Topic: ${scenario.topic}`);
    writeLine(`   Blanks: ${scenario.answerVariations.length}`);
    writeLine(
      `   Feedback items: ${scenario.chunkFeedback?.length || 0}`
    );
    writeLine(
      `   Pattern summary: ${scenario.patternSummary ? 'Yes' : 'No'}`
    );

    if (!scenario.chunkFeedback || scenario.chunkFeedback.length === 0) {
      writeLine('   ⚠️  No feedback defined');
      return;
    }

    let scenarioErrors = 0;
    let scenarioWarnings = 0;

    // Validate each feedback item
    scenario.chunkFeedback.forEach((feedback, idx) => {
      totalFeedbackItems++;
      const result = validateFeedback(feedback, scenario.answerVariations.length);

      if (result.errors.length > 0) {
        if (scenarioErrors === 0) {
          writeLine('   ❌ Errors:');
        }
        writeLine(
          `      Feedback #${idx + 1} (${feedback.chunk || 'MISSING'})`
        );
        result.errors.forEach(err => {
          writeLine(`         • ${err}`);
          totalErrors++;
        });
        scenarioErrors += result.errors.length;
      }

      if (result.warnings.length > 0) {
        if (scenarioWarnings === 0) {
          writeLine('   ⚠️  Warnings:');
        }
        writeLine(
          `      Feedback #${idx + 1} (${feedback.chunk || 'UNKNOWN'})`
        );
        result.warnings.forEach(warn => {
          writeLine(`         • ${warn}`);
          totalWarnings++;
        });
        scenarioWarnings += result.warnings.length;
      }

      if (result.errors.length > 0) {
        writeLine('      ✗ Failed');
      } else if (result.warnings.length > 0) {
        writeLine('      ⚠️  Passed with warnings');
      } else {
        writeLine('      ✓ Passed');
      }
    });

    // Validate pattern summary if present
    if (scenario.patternSummary) {
      totalSummaries++;
      const summaryResult = validatePatternSummary(
        scenario.patternSummary,
        scenario.chunkFeedback
      );

      if (summaryResult.errors.length > 0 || summaryResult.warnings.length > 0) {
        writeLine('   📊 Pattern Summary:');
        summaryResult.errors.forEach(err => {
          writeLine(`      ❌ ${err}`);
          totalErrors++;
          scenarioErrors++;
        });
        summaryResult.warnings.forEach(warn => {
          writeLine(`      ⚠️  ${warn}`);
          totalWarnings++;
          scenarioWarnings++;
        });
      } else {
        writeLine('   📊 Pattern Summary: ✓ Passed');
      }
    }

    if (scenarioErrors > 0) {
      failedScenarios.push(scenario.id);
    }
  });

  // Summary
  writeLine('\n=== Summary ===');
  writeLine(`Total Feedback Items: ${totalFeedbackItems}`);
  writeLine(`Total Pattern Summaries: ${totalSummaries}`);
  writeLine(`Total Errors: ${totalErrors}`);
  writeLine(`Total Warnings: ${totalWarnings}`);
  const passRate = totalFeedbackItems > 0
    ? ((totalFeedbackItems - failedScenarios.length) / totalFeedbackItems * 100).toFixed(1)
    : '100.0';
  writeLine(`Feedback Pass Rate: ${passRate}%`);

  if (failedScenarios.length > 0) {
    writeLine(`\nFailed Scenarios: ${failedScenarios.join(', ')}`);
  }

  writeLine(`\n${'='.repeat(40)}\n`);

  // Exit with error code if validation failed
  if (totalErrors > 0) {
    writeErrorLine('❌ Validation FAILED - Please fix errors above');
    process.exit(1);
  } else {
    writeLine('✅ Validation PASSED');
    process.exit(0);
  }
};

main();
