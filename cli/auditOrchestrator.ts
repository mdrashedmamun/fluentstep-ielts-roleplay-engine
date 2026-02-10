/**
 * Audit Orchestrator - Enhanced Audit System
 * Runs comprehensive linguistic audit on scenarios
 * Supports phase-based execution and dry-run mode
 */

import { CURATED_ROLEPLAYS } from '../services/staticData';
import { runAudit, registerValidator, ValidatorFn } from '../services/linguisticAudit/index';
import { validateChunkCompliance } from '../services/linguisticAudit/validators/chunkComplianceValidator';
import { validateUKEnglish } from '../services/linguisticAudit/validators/ukEnglishValidator';
import { validateTonality } from '../services/linguisticAudit/validators/tonalityValidator';
import { validateNaturalPatterns } from '../services/linguisticAudit/validators/naturalPatternsValidator';
import { validateDialogueFlow } from '../services/linguisticAudit/validators/dialogueFlowValidator';
import { validateAlternatives } from '../services/linguisticAudit/validators/alternativesValidator';
import { validateDeepDive } from '../services/linguisticAudit/validators/deepDiveValidator';
import { validateGrammarContext } from '../services/linguisticAudit/validators/grammarContextValidator';
import { validateContextualSubstitution } from '../services/linguisticAudit/validators/contextualSubstitutionValidator';
import { validateBlankAnswerPairing } from '../services/linguisticAudit/validators/blankAnswerPairingValidator';
import { execSync } from 'child_process';

// Register all validators
registerValidator({
  name: 'Chunk Compliance',
  validate: validateChunkCompliance
} as ValidatorFn);

registerValidator({
  name: 'UK English Spelling',
  validate: (scenario) => validateUKEnglish(scenario).filter(f => f.validatorName === 'UK English Spelling')
} as ValidatorFn);

registerValidator({
  name: 'UK English Vocabulary',
  validate: (scenario) => validateUKEnglish(scenario).filter(f => f.validatorName === 'UK English Vocabulary')
} as ValidatorFn);

registerValidator({
  name: 'Tonality & Register',
  validate: validateTonality
} as ValidatorFn);

registerValidator({
  name: 'Natural Patterns',
  validate: validateNaturalPatterns
} as ValidatorFn);

registerValidator({
  name: 'Dialogue Flow',
  validate: validateDialogueFlow
} as ValidatorFn);

registerValidator({
  name: 'Alternatives Quality',
  validate: validateAlternatives
} as ValidatorFn);

registerValidator({
  name: 'Deep Dive Quality',
  validate: validateDeepDive
} as ValidatorFn);

registerValidator({
  name: 'Grammar Context',
  validate: validateGrammarContext
} as ValidatorFn);

registerValidator({
  name: 'Contextual Substitution',
  validate: validateContextualSubstitution
} as ValidatorFn);

registerValidator({
  name: 'Blank-Answer Pairing',
  validate: validateBlankAnswerPairing
} as ValidatorFn);

const PHASE_CONFIG = {
  1: { categories: ['Advanced', 'Workplace'], name: 'Phase 1: High-Risk' },
  2: { categories: ['Service/Logistics', 'Social'], name: 'Phase 2: Medium-Risk' },
  3: { categories: ['Academic', 'Healthcare', 'Cultural', 'Community'], name: 'Phase 3: Low-Risk' }
};

/**
 * Parse command line arguments
 */
function parseArgs(): {
  phase?: number;
  scenarios?: string[];
  dryRun: boolean;
} {
  const args = process.argv.slice(2);
  const result: any = { dryRun: false };

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      if (key === 'phase') {
        result.phase = parseInt(value, 10);
      } else if (key === 'scenarios') {
        result.scenarios = value.split(',');
      } else if (key === 'dry-run') {
        result.dryRun = true;
      }
    }
  }

  return result;
}

/**
 * Get scenarios for a phase or specific list
 */
function getScenarios(
  phase?: number,
  specificIds?: string[]
): string[] {
  if (specificIds && specificIds.length > 0) {
    return specificIds;
  }

  if (phase && phase in PHASE_CONFIG) {
    const config = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG];
    return CURATED_ROLEPLAYS.filter(s =>
      config.categories.includes(s.category)
    ).map(s => s.id);
  }

  return CURATED_ROLEPLAYS.map(s => s.id);
}

/**
 * Print header
 */
function printHeader(title: string) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Main orchestrator function
 */
async function main() {
  const args = parseArgs();
  const scenarioIds = getScenarios(args.phase, args.scenarios);

  printHeader(`Audit Orchestrator - ${scenarioIds.length} scenarios`);

  try {
    // Pre-flight checks
    console.log('📋 Pre-flight checks...');
    try {
      execSync('npm run build', { stdio: 'pipe' });
      console.log('  ✓ Build succeeds');
    } catch {
      console.error('  ✗ Build failed');
      process.exit(1);
    }

    // Create git tag
    try {
      execSync(`git tag audit-phase1-start`, { stdio: 'pipe' });
      console.log('  ✓ Git tag created: audit-phase1-start');
    } catch {
      console.log('  ℹ Git tag already exists (continuing...)');
    }

    // Get scenarios to validate
    const scenariosToValidate = CURATED_ROLEPLAYS.filter(s =>
      scenarioIds.includes(s.id)
    );

    console.log(`\n📋 Validating ${scenariosToValidate.length} scenarios...`);
    const startTime = Date.now();

    // Run audit on the scenarios
    const report = await runAudit(scenariosToValidate, {
      dryRun: args.dryRun,
      reportOnly: args.dryRun,  // Only report in dry-run mode
      autoApproveHigh: !args.dryRun,  // Auto-approve in full mode
      verbose: false
    });

    const executionTime = Date.now() - startTime;

    // Calculate total findings from all validators
    const totalFindings = report.validatorResults.reduce(
      (sum, result) => sum + result.findings.length,
      0
    );

    // Summary
    printHeader('Audit Summary');
    console.log(`Scenarios validated: ${scenariosToValidate.length}`);
    console.log(`Total findings: ${totalFindings}`);
    console.log(`Execution time: ${(executionTime / 1000).toFixed(1)}s`);
    console.log(`Dry-run mode: ${args.dryRun ? 'Yes' : 'No'}\n`);

    // Show findings by validator
    if (report.validatorResults.length > 0) {
      console.log('📊 Findings by Validator:');
      for (const result of report.validatorResults) {
        if (result.findings.length > 0) {
          console.log(`  ${result.validatorName}: ${result.findings.length}`);
        }
      }
    }

    // Show top 5 issues if not dry-run
    if (!args.dryRun && report.autoFixesLog.length > 0) {
      console.log('\n🔧 Sample Fixes Applied:');
      report.autoFixesLog.slice(0, 5).forEach((fix, i) => {
        console.log(
          `  ${i + 1}. ${fix.scenarioId} [${fix.location}]`
        );
        console.log(`     ${fix.reason}`);
        console.log(`     "${fix.oldValue}" → "${fix.newValue}"`);
      });
      if (report.autoFixesLog.length > 5) {
        console.log(`  ... and ${report.autoFixesLog.length - 5} more`);
      }

      // Verify build after fixes
      console.log('\n🔨 Verifying build after fixes...');
      try {
        execSync('npm run build', { stdio: 'pipe' });
        console.log('  ✓ Build succeeds');

        // Git commit
        console.log('📦 Creating git commit...');
        const commitMsg = `audit: Apply ${report.autoFixesLog.length} fixes to ${scenariosToValidate.length} scenarios

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>`;

        execSync('git add services/staticData.ts', { stdio: 'pipe' });
        execSync(`git commit -m "${commitMsg}"`, { stdio: 'pipe' });
        console.log('  ✓ Git commit created');
      } catch (error) {
        console.error('  ✗ Build verification or git commit failed');
        process.exit(1);
      }
    } else if (args.dryRun) {
      console.log('\n📋 Dry-run mode: No changes applied');
    }

    console.log('');
  } catch (error) {
    console.error('\n❌ Audit error:', error);
    process.exit(1);
  }
}

main();
