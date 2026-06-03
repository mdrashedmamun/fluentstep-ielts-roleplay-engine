/**
 * Audit Orchestrator - Enhanced Audit System
 * Runs comprehensive linguistic audit on scenarios
 * Supports phase-based execution and dry-run mode
 */

import { execSync } from 'child_process';
import { CURATED_ROLEPLAYS } from '../src/services/staticData';
import { runAudit, registerValidator, ValidatorFn } from '../src/services/linguisticAudit/index';
import { validateChunkCompliance } from '../src/services/linguisticAudit/validators/chunkComplianceValidator';
import { validateUKEnglish } from '../src/services/linguisticAudit/validators/ukEnglishValidator';
import { validateTonality } from '../src/services/linguisticAudit/validators/tonalityValidator';
import { validateNaturalPatterns } from '../src/services/linguisticAudit/validators/naturalPatternsValidator';
import { validateDialogueFlow } from '../src/services/linguisticAudit/validators/dialogueFlowValidator';
import { validateAlternatives } from '../src/services/linguisticAudit/validators/alternativesValidator';
import { validateDeepDive } from '../src/services/linguisticAudit/validators/deepDiveValidator';
import { validateGrammarContext } from '../src/services/linguisticAudit/validators/grammarContextValidator';
import { validateContextualSubstitution } from '../src/services/linguisticAudit/validators/contextualSubstitutionValidator';
import { validateBlankAnswerPairing } from '../src/services/linguisticAudit/validators/blankAnswerPairingValidator';

const writeLine = (message = ''): void => {
  process.stdout.write(`${message}
`);
};

const writeErrorLine = (message: string): void => {
  process.stderr.write(`${message}
`);
};

const getErrorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

const runCommand = (command: string): void => {
  execSync(command, { stdio: 'pipe' });
};

const registerAuditValidators = (): void => {
  registerValidator({
    name: 'Chunk Compliance',
    validate: validateChunkCompliance
  } as ValidatorFn);

  registerValidator({
    name: 'UK English Spelling',
    validate: (scenario) => validateUKEnglish(scenario).filter(finding => finding.validatorName === 'UK English Spelling')
  } as ValidatorFn);

  registerValidator({
    name: 'UK English Vocabulary',
    validate: (scenario) => validateUKEnglish(scenario).filter(finding => finding.validatorName === 'UK English Vocabulary')
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
};

/**
 * Print header
 */
function printHeader(title: string): void {
  writeLine(`\n${'='.repeat(70)}`);
  writeLine(`  ${title}`);
  writeLine(`${'='.repeat(70)}\n`);
}

type PhaseNumber = 1 | 2 | 3;

interface AuditCliArgs {
  phase?: PhaseNumber;
  scenarios?: string[];
  dryRun: boolean;
}

const PHASE_CONFIG: Record<PhaseNumber, { categories: Array<typeof CURATED_ROLEPLAYS[number]['category']>; name: string }> = {
  1: { categories: ['Advanced', 'Workplace'], name: 'Phase 1: High-Risk' },
  2: { categories: ['Service/Logistics', 'Social'], name: 'Phase 2: Medium-Risk' },
  3: { categories: ['Academic', 'Healthcare', 'Cultural', 'Community'], name: 'Phase 3: Low-Risk' }
};

const isPhaseNumber = (value: number): value is PhaseNumber => value === 1 || value === 2 || value === 3;

/**
 * Parse command line arguments
 */
function parseArgs(): AuditCliArgs {
  const args = process.argv.slice(2);
  const result: AuditCliArgs = { dryRun: false };

  for (const arg of args) {
    if (!arg.startsWith('--')) continue;

    const [key, value] = arg.substring(2).split('=');
    if (key === 'phase' && value) {
      const parsedPhase = Number.parseInt(value, 10);
      if (isPhaseNumber(parsedPhase)) {
        result.phase = parsedPhase;
      }
    } else if (key === 'scenarios' && value) {
      result.scenarios = value.split(',');
    } else if (key === 'dry-run') {
      result.dryRun = true;
    }
  }

  return result;
}

/**
 * Get scenarios for a phase or specific list
 */
function getScenarios(
  phase?: PhaseNumber,
  specificIds?: string[]
): string[] {
  if (specificIds && specificIds.length > 0) {
    return specificIds;
  }

  if (phase) {
    const config = PHASE_CONFIG[phase];
    return CURATED_ROLEPLAYS.filter(scenario =>
      config.categories.includes(scenario.category)
    ).map(scenario => scenario.id);
  }

  return CURATED_ROLEPLAYS.map(scenario => scenario.id);
}

/**
 * Main orchestrator function
 */
async function main(): Promise<void> {
  registerAuditValidators();
  const args = parseArgs();
  const scenarioIds = getScenarios(args.phase, args.scenarios);

  printHeader(`Audit Orchestrator - ${scenarioIds.length} scenarios`);

  try {
    // Pre-flight checks
    writeLine('📋 Pre-flight checks...');
    try {
      runCommand('npm run build');
      writeLine('  ✓ Build succeeds');
    } catch {
      writeErrorLine('  ✗ Build failed');
      process.exit(1);
    }

    // Create git tag
    try {
      runCommand('git tag audit-phase1-start');
      writeLine('  ✓ Git tag created: audit-phase1-start');
    } catch {
      writeLine('  ℹ Git tag already exists (continuing...)');
    }

    // Get scenarios to validate
    const scenariosToValidate = CURATED_ROLEPLAYS.filter(scenario =>
      scenarioIds.includes(scenario.id)
    );

    writeLine(`\n📋 Validating ${scenariosToValidate.length} scenarios...`);
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
    writeLine(`Scenarios validated: ${scenariosToValidate.length}`);
    writeLine(`Total findings: ${totalFindings}`);
    writeLine(`Execution time: ${(executionTime / 1000).toFixed(1)}s`);
    writeLine(`Dry-run mode: ${args.dryRun ? 'Yes' : 'No'}\n`);

    // Show findings by validator
    if (report.validatorResults.length > 0) {
      writeLine('📊 Findings by Validator:');
      for (const result of report.validatorResults) {
        if (result.findings.length > 0) {
          writeLine(`  ${result.validatorName}: ${result.findings.length}`);
        }
      }
    }

    // Show top 5 issues if not dry-run
    if (!args.dryRun && report.autoFixesLog.length > 0) {
      writeLine('\n🔧 Sample Fixes Applied:');
      report.autoFixesLog.slice(0, 5).forEach((fix, i) => {
        writeLine(
          `  ${i + 1}. ${fix.scenarioId} [${fix.location}]`
        );
        writeLine(`     ${fix.reason}`);
        writeLine(`     "${fix.oldValue}" → "${fix.newValue}"`);
      });
      if (report.autoFixesLog.length > 5) {
        writeLine(`  ... and ${report.autoFixesLog.length - 5} more`);
      }

      // Verify build after fixes
      writeLine('\n🔨 Verifying build after fixes...');
      try {
        runCommand('npm run build');
        writeLine('  ✓ Build succeeds');

        // Git commit
        writeLine('📦 Creating git commit...');
        const commitMsg = `audit: Apply ${report.autoFixesLog.length} fixes to ${scenariosToValidate.length} scenarios

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>`;

        runCommand('git add services/staticData.ts');
        runCommand(`git commit -m "${commitMsg}"`);
        writeLine('  ✓ Git commit created');
      } catch {
        writeErrorLine('  ✗ Build verification or git commit failed');
        process.exit(1);
      }
    } else if (args.dryRun) {
      writeLine('\n📋 Dry-run mode: No changes applied');
    }

    writeLine('');
  } catch (error) {
    writeErrorLine(`\n❌ Audit error: ${getErrorMessage(error)}`);
    process.exit(1);
  }
}

void main();
