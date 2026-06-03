/**
 * Test Script for Linguistic Audit System
 * Validates all 7 validators work correctly on sample scenarios
 */

// Helper for color output (simple version)
const chalk = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`
};

const writeOut = (message = ''): void => {
  process.stdout.write(`${message}\n`);
};

const getErrorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

interface ValidatorSmokeResult {
  scenario: string;
  validator: string;
  issues?: number;
  details?: ValidationFinding[];
  error?: string;
}

interface ValidatorSmoke {
  name: string;
  fn: (scenario: RoleplayScript) => ValidationFinding[];
}

import { CURATED_ROLEPLAYS, type RoleplayScript } from '../src/services/staticData';
import type { ValidationFinding } from '../src/services/linguisticAudit/types';
import { validateChunkCompliance } from '../src/services/linguisticAudit/validators/chunkComplianceValidator';
import { validateUKEnglish } from '../src/services/linguisticAudit/validators/ukEnglishValidator';
import { validateTonality } from '../src/services/linguisticAudit/validators/tonalityValidator';
import { validateNaturalPatterns } from '../src/services/linguisticAudit/validators/naturalPatternsValidator';
import { validateDialogueFlow } from '../src/services/linguisticAudit/validators/dialogueFlowValidator';
import { validateAlternatives } from '../src/services/linguisticAudit/validators/alternativesValidator';
import { validateDeepDive } from '../src/services/linguisticAudit/validators/deepDiveValidator';

writeOut('\n🧪 Linguistic Audit System - Test Suite\n');

// Test each validator on first 5 scenarios
const testScenarios = CURATED_ROLEPLAYS.slice(0, 5);

writeOut(`Testing ${testScenarios.length} scenarios...\n`);

let totalFindings = 0;
const results: ValidatorSmokeResult[] = [];

for (const scenario of testScenarios) {
  writeOut(`\n📋 ${scenario.id} (${scenario.category})`);
  writeOut('─'.repeat(60));

  const validators: ValidatorSmoke[] = [
    { name: 'Chunk Compliance', fn: validateChunkCompliance },
    { name: 'UK English', fn: validateUKEnglish },
    { name: 'Tonality', fn: validateTonality },
    { name: 'Natural Patterns', fn: validateNaturalPatterns },
    { name: 'Dialogue Flow', fn: validateDialogueFlow },
    { name: 'Alternatives', fn: validateAlternatives },
    { name: 'Deep Dive', fn: validateDeepDive }
  ];

  for (const validator of validators) {
    try {
      const findings = validator.fn(scenario);
      const count = findings.length;
      totalFindings += count;

      const status = count === 0 ? '✓ PASS' : `⚠ ${count} issue(s)`;
      writeOut(`  ${validator.name.padEnd(20)}: ${status}`);

      if (count > 0 && count <= 2) {
        // Show details for few findings
        findings.slice(0, 2).forEach(f => {
          writeOut(`    • ${f.issue}`);
          writeOut(`      Confidence: ${Math.round(f.confidence * 100)}%`);
        });
      }

      results.push({
        scenario: scenario.id,
        validator: validator.name,
        issues: count,
        details: findings.slice(0, 3) // Save first 3 findings
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      writeOut(`  ${validator.name.padEnd(20)}: ❌ ERROR`);
      writeOut(`    ${errorMessage}`);
      results.push({
        scenario: scenario.id,
        validator: validator.name,
        error: errorMessage
      });
    }
  }
}

// Summary
writeOut('\n' + '═'.repeat(60));
writeOut('📊 Test Summary');
writeOut('═'.repeat(60));
writeOut(`Total findings: ${totalFindings}`);
writeOut(`Tested scenarios: ${testScenarios.length}`);
writeOut(`Validators: 7`);
writeOut(`Total checks: ${testScenarios.length * 7}`);

// Check for errors
const errors = results.filter(r => r.error);
if (errors.length > 0) {
  writeOut(chalk.red(`\n❌ ${errors.length} validator error(s)`));
  errors.forEach(e => {
    writeOut(`  • ${e.validator} (${e.scenario}): ${e.error}`);
  });
} else {
  writeOut(chalk.green('\n✅ All validators executed without errors'));
}

// Sample findings
const samplesWithIssues = results.filter(r => r.issues && r.issues > 0).slice(0, 3);
if (samplesWithIssues.length > 0) {
  writeOut(chalk.blue('\n📝 Sample Findings (first 3 issues):'));
  samplesWithIssues.forEach(r => {
    if (r.details && r.details[0]) {
      writeOut(`\n  ${r.scenario} - ${r.validator}`);
      writeOut(`    Issue: ${r.details[0].issue}`);
      writeOut(`    Value: "${r.details[0].currentValue}"`);
    }
  });
}

writeOut(chalk.green('\n✅ Test suite complete!\n'));

// Exit with code 0 if no errors
const hasErrors = errors.length > 0;
process.exit(hasErrors ? 1 : 0);
