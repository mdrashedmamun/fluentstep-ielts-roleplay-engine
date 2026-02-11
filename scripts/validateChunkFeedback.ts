import { CURATED_ROLEPLAYS } from '../src/services/staticData';
import { validateAllFeedback } from '../src/services/feedbackGeneration/feedbackValidator';

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

// Main validation logic
const main = () => {
  const scenariosWithFeedback = CURATED_ROLEPLAYS.filter(s => s.chunkFeedback);

  console.log('\n=== Chunk Feedback Validation Report ===\n');
  console.log(`Found ${scenariosWithFeedback.length} scenarios with chunkFeedback\n`);

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalFeedbackItems = 0;
  const failedScenarios: string[] = [];

  scenariosWithFeedback.forEach(scenario => {
    console.log(`\n📋 ${scenario.id}`);
    console.log(`   Topic: ${scenario.topic}`);
    console.log(`   Blanks: ${scenario.answerVariations.length}`);
    console.log(
      `   Feedback items: ${scenario.chunkFeedback?.length || 0}`
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

    if (scenarioErrors > 0) {
      failedScenarios.push(scenario.id);
    }
  });

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Total Feedback Items: ${totalFeedbackItems}`);
  console.log(`Total Errors: ${totalErrors}`);
  console.log(`Total Warnings: ${totalWarnings}`);
  console.log(`Pass Rate: ${((totalFeedbackItems - failedScenarios.length) / totalFeedbackItems * 100).toFixed(1)}%`);

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
