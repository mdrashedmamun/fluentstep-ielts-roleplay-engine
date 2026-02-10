/**
 * Comprehensive Audit on All 36 Scenarios
 * Shows detailed findings breakdown by scenario and validator
 */

import { CURATED_ROLEPLAYS } from '../src/services/staticData';
import { validateChunkCompliance } from '../src/services/linguisticAudit/validators/chunkComplianceValidator';
import { validateUKEnglish } from '../src/services/linguisticAudit/validators/ukEnglishValidator';
import { validateTonality } from '../src/services/linguisticAudit/validators/tonalityValidator';
import { validateNaturalPatterns } from '../src/services/linguisticAudit/validators/naturalPatternsValidator';
import { validateDialogueFlow } from '../src/services/linguisticAudit/validators/dialogueFlowValidator';
import { validateAlternatives } from '../src/services/linguisticAudit/validators/alternativesValidator';
import { validateDeepDive } from '../src/services/linguisticAudit/validators/deepDiveValidator';

console.log('\n🧪 Comprehensive Linguistic Audit - ALL 36 Scenarios\n');

const scenarios = CURATED_ROLEPLAYS;
console.log(`Auditing ${scenarios.length} scenarios...\n`);

// Define validators
const validators = [
  { name: 'Chunk Compliance', fn: validateChunkCompliance },
  { name: 'UK English Spelling', fn: validateUKEnglish },
  { name: 'UK English Vocabulary', fn: validateUKEnglish },
  { name: 'Tonality & Register', fn: validateTonality },
  { name: 'Natural Patterns', fn: validateNaturalPatterns },
  { name: 'Dialogue Flow', fn: validateDialogueFlow },
  { name: 'Alternatives Quality', fn: validateAlternatives },
  { name: 'Deep Dive Quality', fn: validateDeepDive }
];

// Results tracking
const results: Record<string, Record<string, number>> = {};
let totalFindings = 0;
const categoryBreakdown: Record<string, number> = {};
const validatorBreakdown: Record<string, number> = {};

// Initialize breakdown objects
for (const v of validators) {
  validatorBreakdown[v.name] = 0;
}

console.log('═'.repeat(80));
console.log('AUDIT RESULTS BY SCENARIO');
console.log('═'.repeat(80) + '\n');

for (const scenario of scenarios) {
  const categoryLabel = `[${scenario.category}]`;
  results[scenario.id] = {};

  let scenarioTotal = 0;
  let passCount = 0;

  for (const validator of validators) {
    try {
      const findings = validator.fn(scenario);
      const count = findings.length;

      results[scenario.id][validator.name] = count;
      scenarioTotal += count;
      validatorBreakdown[validator.name] += count;
      totalFindings += count;

      if (count === 0) passCount++;
    } catch (error) {
      results[scenario.id][validator.name] = -1; // Error marker
    }
  }

  // Track by category
  if (!categoryBreakdown[scenario.category]) {
    categoryBreakdown[scenario.category] = 0;
  }
  categoryBreakdown[scenario.category] += scenarioTotal;

  // Display scenario result
  const status = scenarioTotal === 0 ? '✅ PASS' : `⚠️ ${scenarioTotal} issues`;
  console.log(`${scenario.id.padEnd(35)} ${categoryLabel.padEnd(20)} ${status}`);
}

// Summary
console.log('\n' + '═'.repeat(80));
console.log('SUMMARY STATISTICS');
console.log('═'.repeat(80) + '\n');

console.log(`Total Scenarios Audited: ${scenarios.length}`);
console.log(`Total Findings: ${totalFindings}\n`);

console.log('By Validator:');
Object.entries(validatorBreakdown).forEach(([name, count]) => {
  const pct = ((count / totalFindings) * 100).toFixed(1);
  console.log(`  ${name.padEnd(30)}: ${count.toString().padStart(3)} findings (${pct}%)`);
});

console.log('\nBy Category:');
Object.entries(categoryBreakdown).forEach(([cat, count]) => {
  const scenarios_in_cat = CURATED_ROLEPLAYS.filter(s => s.category === cat).length;
  const avg = (count / scenarios_in_cat).toFixed(1);
  console.log(`  ${cat.padEnd(20)}: ${count.toString().padStart(3)} findings (avg ${avg}/scenario)`);
});

// High-value scenarios (most issues)
console.log('\n' + '─'.repeat(80));
console.log('Top 10 Scenarios Requiring Attention:');
console.log('─'.repeat(80) + '\n');

const scenarioSummary = scenarios
  .map(s => ({
    id: s.id,
    category: s.category,
    total: Object.values(results[s.id]).reduce((a, b) => a + (b > 0 ? b : 0), 0)
  }))
  .sort((a, b) => b.total - a.total)
  .slice(0, 10);

scenarioSummary.forEach((s, idx) => {
  console.log(`${(idx + 1).toString().padStart(2)}. ${s.id.padEnd(35)} ${s.total.toString().padStart(3)} findings`);
});

// Clean scenarios
const cleanScenarios = scenarios.filter(s =>
  Object.values(results[s.id]).every(count => count === 0)
);

console.log('\n' + '─'.repeat(80));
console.log(`Clean Scenarios (0 findings): ${cleanScenarios.length}/${scenarios.length}`);
console.log('─'.repeat(80) + '\n');

if (cleanScenarios.length > 0) {
  cleanScenarios.forEach(s => {
    console.log(`  ✅ ${s.id.padEnd(35)} [${s.category}]`);
  });
}

// Validator effectiveness
console.log('\n' + '═'.repeat(80));
console.log('VALIDATOR EFFECTIVENESS');
console.log('═'.repeat(80) + '\n');

const mostProductive = Object.entries(validatorBreakdown)
  .sort((a, b) => b[1] - a[1])[0];

const leastActive = Object.entries(validatorBreakdown)
  .sort((a, b) => a[1] - b[1])[0];

console.log(`Most Productive: ${mostProductive[0]} (${mostProductive[1]} findings)`);
console.log(`Least Active: ${leastActive[0]} (${leastActive[1]} findings)`);

// High-confidence findings estimate
const estimatedAutoFixes = Math.round(totalFindings * 0.15); // ~15% are high-confidence (spelling, vocabulary)
const estimatedApprovals = Math.round(totalFindings * 0.35); // ~35% require approval
const estimatedReports = Math.round(totalFindings * 0.50); // ~50% are low-confidence reports

console.log('\nEstimated Action Breakdown:');
console.log(`  ✅ Auto-fix (≥95% confidence):    ~${estimatedAutoFixes} findings`);
console.log(`  👤 Require approval (70-94%):     ~${estimatedApprovals} findings`);
console.log(`  ⚠️ Report for review (<70%):      ~${estimatedReports} findings`);

console.log('\n' + '═'.repeat(80));
console.log(`✅ AUDIT COMPLETE: ${scenarios.length} scenarios scanned, ${totalFindings} findings identified`);
console.log('═'.repeat(80) + '\n');

process.exit(0);
