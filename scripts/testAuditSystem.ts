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

import { CURATED_ROLEPLAYS } from '../services/staticData';
import { validateChunkCompliance } from '../services/linguisticAudit/validators/chunkComplianceValidator';
import { validateUKEnglish } from '../services/linguisticAudit/validators/ukEnglishValidator';
import { validateTonality } from '../services/linguisticAudit/validators/tonalityValidator';
import { validateNaturalPatterns } from '../services/linguisticAudit/validators/naturalPatternsValidator';
import { validateDialogueFlow } from '../services/linguisticAudit/validators/dialogueFlowValidator';
import { validateAlternatives } from '../services/linguisticAudit/validators/alternativesValidator';
import { validateDeepDive } from '../services/linguisticAudit/validators/deepDiveValidator';

console.log('\n🧪 Linguistic Audit System - Test Suite\n');

// Test each validator on first 5 scenarios
const testScenarios = CURATED_ROLEPLAYS.slice(0, 5);

console.log(`Testing ${testScenarios.length} scenarios...\n`);

let totalFindings = 0;
const results: any[] = [];

for (const scenario of testScenarios) {
  console.log(`\n📋 ${scenario.id} (${scenario.category})`);
  console.log('─'.repeat(60));

  const validators = [
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
      console.log(`  ${validator.name.padEnd(20)}: ${status}`);

      if (count > 0 && count <= 2) {
        // Show details for few findings
        findings.slice(0, 2).forEach(f => {
          console.log(`    • ${f.issue}`);
          console.log(`      Confidence: ${Math.round(f.confidence * 100)}%`);
        });
      }

      results.push({
        scenario: scenario.id,
        validator: validator.name,
        issues: count,
        details: findings.slice(0, 3) // Save first 3 findings
      });
    } catch (error: any) {
      console.log(`  ${validator.name.padEnd(20)}: ❌ ERROR`);
      console.log(`    ${error.message}`);
      results.push({
        scenario: scenario.id,
        validator: validator.name,
        error: error.message
      });
    }
  }
}

// Summary
console.log('\n' + '═'.repeat(60));
console.log('📊 Test Summary');
console.log('═'.repeat(60));
console.log(`Total findings: ${totalFindings}`);
console.log(`Tested scenarios: ${testScenarios.length}`);
console.log(`Validators: 7`);
console.log(`Total checks: ${testScenarios.length * 7}`);

// Check for errors
const errors = results.filter(r => r.error);
if (errors.length > 0) {
  console.log(chalk.red(`\n❌ ${errors.length} validator error(s)`));
  errors.forEach(e => {
    console.log(`  • ${e.validator} (${e.scenario}): ${e.error}`);
  });
} else {
  console.log(chalk.green('\n✅ All validators executed without errors'));
}

// Sample findings
const samplesWithIssues = results.filter(r => r.issues && r.issues > 0).slice(0, 3);
if (samplesWithIssues.length > 0) {
  console.log(chalk.blue('\n📝 Sample Findings (first 3 issues):'));
  samplesWithIssues.forEach(r => {
    if (r.details && r.details[0]) {
      console.log(`\n  ${r.scenario} - ${r.validator}`);
      console.log(`    Issue: ${r.details[0].issue}`);
      console.log(`    Value: "${r.details[0].currentValue}"`);
    }
  });
}

console.log(chalk.green('\n✅ Test suite complete!\n'));

// Exit with code 0 if no errors
const hasErrors = errors.length > 0;
process.exit(hasErrors ? 1 : 0);
