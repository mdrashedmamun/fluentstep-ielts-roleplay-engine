import { CURATED_ROLEPLAYS } from '../src/services/staticData';
import { validateAllFeedback } from '../src/services/feedbackGeneration/feedbackValidator';
import { ChunkCategory } from '../src/services/staticData';

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

const validateFeedback = (feedback: any, maxBlankIndex: number): ValidationResult => {
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
      `nativeUsageNotes has ${feedback.nativeUsageNotes.length} items (expected ≥3)`
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
  const coreLength = (feedback.coreFunction || '').split(' ').length;
  if (coreLength > 20) {
    result.warnings.push(
      `coreFunction is ${coreLength} words (recommended ≤20)`
    );
  }

  // Validate situations structure
  if (Array.isArray(feedback.situations)) {
    feedback.situations.forEach((sit: any, idx: number) => {
      if (!sit.context) {
        result.errors.push(`situation[${idx}] missing context`);
      }
      if (!sit.example) {
        result.errors.push(`situation[${idx}] missing example`);
      }
      const exLen = (sit.example || '').split(' ').length;
      if (exLen > 15) {
        result.warnings.push(
          `situation[${idx}] example is ${exLen} words (recommended ≤15)`
        );
      }
    });
  }

  // Validate contrast structure
  if (Array.isArray(feedback.nonNativeContrast)) {
    feedback.nonNativeContrast.forEach((contrast: any, idx: number) => {
      if (!contrast.nonNative) {
        result.errors.push(`contrast[${idx}] missing nonNative`);
      }
      if (!contrast.native) {
        result.errors.push(`contrast[${idx}] missing native`);
      }
      if (!contrast.explanation) {
        result.errors.push(`contrast[${idx}] missing explanation`);
      }
      const expLen = (contrast.explanation || '').split(' ').length;
      if (expLen > 20) {
        result.warnings.push(
          `contrast[${idx}] explanation is ${expLen} words (recommended ≤20)`
        );
      }
    });
  }

  return result;
};

const VALID_CHUNK_CATEGORIES: ChunkCategory[] = ['Openers', 'Softening', 'Disagreement', 'Repair', 'Exit', 'Idioms'];

const validatePatternSummary = (summary: any, chunkFeedback: any[] | undefined, maxBlankIndex: number): ValidationResult => {
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
    summary.categoryBreakdown.forEach((item: any, idx: number) => {
      if (!VALID_CHUNK_CATEGORIES.includes(item.category)) {
        result.errors.push(`categoryBreakdown[${idx}]: Invalid category '${item.category}'`);
      }
      if (item.count !== (item.examples || []).length) {
        result.errors.push(
          `categoryBreakdown[${idx}]: count ${item.count} doesn't match examples length ${(item.examples || []).length}`
        );
      }
      if (!item.insight || item.insight.length < 30 || item.insight.length > 100) {
        result.warnings.push(
          `categoryBreakdown[${idx}]: insight length ${(item.insight || '').length} (expected 30-100)`
        );
      }

      // Verify chunks exist in chunkFeedback
      if (chunkFeedback && Array.isArray(item.examples)) {
        item.examples.forEach((example: string) => {
          if (!chunkFeedback.find(f => f.chunk === example)) {
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

    summary.keyPatterns.forEach((pattern: any, idx: number) => {
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
const main = () => {
  const scenariosWithFeedback = CURATED_ROLEPLAYS.filter(s => s.chunkFeedback);
  const scenariosWithSummary = CURATED_ROLEPLAYS.filter(s => s.patternSummary);

  console.log('\n=== Chunk Feedback & Pattern Summary Validation Report ===\n');
  console.log(`Found ${scenariosWithFeedback.length} scenarios with chunkFeedback`);
  console.log(`Found ${scenariosWithSummary.length} scenarios with patternSummary\n`);

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalFeedbackItems = 0;
  let totalSummaries = 0;
  const failedScenarios: string[] = [];

  scenariosWithFeedback.forEach(scenario => {
    console.log(`\n📋 ${scenario.id}`);
    console.log(`   Topic: ${scenario.topic}`);
    console.log(`   Blanks: ${scenario.answerVariations.length}`);
    console.log(
      `   Feedback items: ${scenario.chunkFeedback?.length || 0}`
    );
    console.log(
      `   Pattern summary: ${scenario.patternSummary ? 'Yes' : 'No'}`
    );

    if (!scenario.chunkFeedback || scenario.chunkFeedback.length === 0) {
      console.log(`   ⚠️  No feedback defined`);
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
          console.log(`   ❌ Errors:`);
        }
        console.log(
          `      Feedback #${idx + 1} (${feedback.chunk || 'MISSING'})`
        );
        result.errors.forEach(err => {
          console.log(`         • ${err}`);
          totalErrors++;
        });
        scenarioErrors += result.errors.length;
      }

      if (result.warnings.length > 0) {
        if (scenarioWarnings === 0) {
          console.log(`   ⚠️  Warnings:`);
        }
        console.log(
          `      Feedback #${idx + 1} (${feedback.chunk || 'UNKNOWN'})`
        );
        result.warnings.forEach(warn => {
          console.log(`         • ${warn}`);
          totalWarnings++;
        });
        scenarioWarnings += result.warnings.length;
      }

      if (result.errors.length > 0) {
        console.log(`      ✗ Failed`);
      } else if (result.warnings.length > 0) {
        console.log(`      ⚠️  Passed with warnings`);
      } else {
        console.log(`      ✓ Passed`);
      }
    });

    // Validate pattern summary if present
    if (scenario.patternSummary) {
      totalSummaries++;
      const summaryResult = validatePatternSummary(
        scenario.patternSummary,
        scenario.chunkFeedback,
        scenario.answerVariations.length
      );

      if (summaryResult.errors.length > 0 || summaryResult.warnings.length > 0) {
        console.log(`   📊 Pattern Summary:`);
        summaryResult.errors.forEach(err => {
          console.log(`      ❌ ${err}`);
          totalErrors++;
          scenarioErrors++;
        });
        summaryResult.warnings.forEach(warn => {
          console.log(`      ⚠️  ${warn}`);
          totalWarnings++;
          scenarioWarnings++;
        });
      } else {
        console.log(`   📊 Pattern Summary: ✓ Passed`);
      }
    }

    if (scenarioErrors > 0) {
      failedScenarios.push(scenario.id);
    }
  });

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Total Feedback Items: ${totalFeedbackItems}`);
  console.log(`Total Pattern Summaries: ${totalSummaries}`);
  console.log(`Total Errors: ${totalErrors}`);
  console.log(`Total Warnings: ${totalWarnings}`);
  console.log(
    `Feedback Pass Rate: ${((totalFeedbackItems - failedScenarios.length) / totalFeedbackItems * 100).toFixed(1)}%`
  );

  if (failedScenarios.length > 0) {
    console.log(`\nFailed Scenarios: ${failedScenarios.join(', ')}`);
  }

  console.log('\n' + '='.repeat(40) + '\n');

  // Exit with error code if validation failed
  if (totalErrors > 0) {
    console.error('❌ Validation FAILED - Please fix errors above');
    process.exit(1);
  } else {
    console.log('✅ Validation PASSED');
    process.exit(0);
  }
};

main();
