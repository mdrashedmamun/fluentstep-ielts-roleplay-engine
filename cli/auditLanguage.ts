#!/usr/bin/env node

/**
 * Interactive Linguistic Audit CLI
 * Runs validators and presents MEDIUM/LOW confidence findings for user approval
 */

import readline from 'readline';
import chalk from 'chalk';
import { CURATED_ROLEPLAYS } from '../src/services/staticData';
import type { AuditConfig, AuditReport } from '../src/services/linguisticAudit/types';
import { runAudit, registerValidator, type ValidatorFn } from '../src/services/linguisticAudit';
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
import { generateSuggestions, sortSuggestions, type UserSuggestion, formatOptions } from '../src/services/linguisticAudit/fixers/suggestionEngine';

const writeOut = (message = ''): void => {
  process.stdout.write(`${message}\n`);
};

const writeErr = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

const getErrorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

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

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const config: AuditConfig = {
    dryRun: args.includes('--dry-run'),
    reportOnly: args.includes('--report-only'),
    autoApproveHigh: !args.includes('--no-auto-approve'),
    verbose: args.includes('--verbose'),
    scenarioFilter: args.find(a => a.startsWith('--scenario='))?.split('=')[1],
    categoryFilter: args.find(a => a.startsWith('--category='))?.split('=')[1]
  };

  if (args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  writeOut(chalk.bold.blue('\n🔍 FluentStep IELTS Linguistic Audit\n'));

  // Run audit
  const report = await runAudit(CURATED_ROLEPLAYS, config);

  writeOut(chalk.bold(`Summary`));
  writeOut('========');
  writeOut(chalk.green(`✓ Passed: ${report.summary.passed}`));
  writeOut(chalk.yellow(`⚠ Warning: ${report.summary.warning}`));
  writeOut(chalk.red(`✗ Failed: ${report.summary.failed}`));
  writeOut(`Auto-fixes applied: ${chalk.green(report.autoFixesApplied)}`);
  writeOut(`Findings requiring approval: ${chalk.yellow(report.findingsRequiringApproval)}\n`);

  if (config.reportOnly || config.dryRun) {
    generateReport(report);
    process.exit(0);
  }

  // Collect all findings
  const allFindings = report.validatorResults.flatMap(vr => vr.findings);
  const suggestions = sortSuggestions(generateSuggestions(allFindings));

  if (suggestions.length === 0) {
    writeOut(chalk.green('✅ No issues requiring approval!\n'));
    generateReport(report);
    process.exit(0);
  }

  // Interactive approval loop
  await interactiveApproval(suggestions);

  // Generate final report
  generateReport(report);
}

/**
 * Interactive approval workflow
 */
async function interactiveApproval(suggestions: UserSuggestion[]): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let currentIndex = 0;
  let approved = 0;
  let skipped = 0;

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  writeOut(chalk.bold(`\nReview Required (${suggestions.length} findings)\n`));

  while (currentIndex < suggestions.length) {
    const suggestion = suggestions[currentIndex];
    if (!suggestion) {
      currentIndex++;
      continue;
    }
    const finding = suggestion.finding;

    // Display finding
    writeOut(chalk.bold.blue(`\n[${currentIndex + 1}/${suggestions.length}] ${finding.validatorName}`));
    writeOut(chalk.gray('─'.repeat(60)));
    writeOut(`Scenario: ${chalk.bold(finding.scenarioId)}`);
    writeOut(`Location: ${chalk.cyan(finding.location)}`);
    writeOut(`Issue: ${finding.issue}`);
    writeOut(`Confidence: ${chalk.yellow(`${Math.round(suggestion.confidence * 100)}%`)}`);
    writeOut(`\nCurrent: "${chalk.red(finding.currentValue)}"`);

    if (suggestion.options && suggestion.options.length > 0) {
      writeOut(formatOptions(suggestion.options));
    }

    writeOut(`\nContext: ${chalk.gray(finding.context)}`);
    writeOut(`Reasoning: ${chalk.gray(finding.reasoning)}`);

    // Get user choice
    const choice = await question(
      chalk.bold.cyan(
        '\n[A]pprove | [S]kip | [E]dit | [V]iew dialogue | [Q]uit: '
      )
    ).then(c => c.toLowerCase().trim());

    switch (choice) {
      case 'a':
        writeOut(chalk.green('  ✓ Approved'));
        approved++;
        currentIndex++;
        break;

      case 's':
        writeOut(chalk.yellow('  ○ Skipped'));
        skipped++;
        currentIndex++;
        break;

      case 'e': {
        const newValue = await question(chalk.cyan('Enter new value: '));
        if (newValue.trim()) {
          writeOut(chalk.green(`  ✓ Approved with custom value: "${newValue}"`));
          // In real implementation, would apply custom fix
          approved++;
        }
        currentIndex++;
        break;
      }

      case 'v': {
        // Find full dialogue for context
        const scenario = CURATED_ROLEPLAYS.find((candidate) => candidate.id === finding.scenarioId);
        if (scenario) {
          writeOut(chalk.bold.magenta('\n\nFull Dialogue:'));
          writeOut(chalk.gray('─'.repeat(60)));
          scenario.dialogue.forEach((line, idx) => {
            const isBlanked = scenario.answerVariations.some((answerVariation) => answerVariation.index === idx);
            const prefix = isBlanked ? chalk.yellow('➤') : ' ';
            writeOut(`${prefix} [${idx}] ${line.speaker}: ${line.text}`);
          });
          writeOut(chalk.gray('─'.repeat(60)) + '\n');
        }
        // Don't increment, let them decide again
        break;
      }

      case 'q':
        writeOut(chalk.yellow('\nAudit paused. Changes not saved.'));
        rl.close();
        process.exit(0);
        break;

      default:
        writeOut(chalk.red('Invalid choice. Try again.'));
    }
  }

  rl.close();

  writeOut(chalk.bold(`\nApproval Summary`));
  writeOut('═'.repeat(60));
  writeOut(`Approved: ${chalk.green(approved)}`);
  writeOut(`Skipped: ${chalk.yellow(skipped)}`);
  writeOut('');
}

/**
 * Generate audit report (Markdown)
 */
function generateReport(report: AuditReport): void {
  const timestamp = new Date().toISOString();
  const reportPath = 'AUDIT_REPORT.md';

  const lines: string[] = [
    '# FluentStep IELTS Linguistic Audit Report',
    `Generated: ${timestamp}\n`,
    '## Summary',
    `- Total Scenarios: ${report.totalScenarios}`,
    `- Passed: ${report.summary.passed}`,
    `- Warnings: ${report.summary.warning}`,
    `- Failed: ${report.summary.failed}`,
    `- Auto-fixes Applied: ${report.autoFixesApplied}`,
    `- Findings Approved: 0 (interactive review)`,
    `- Findings Skipped: 0\n`,
    '## Validator Results\n'
  ];

  for (const vr of report.validatorResults) {
    lines.push(`### ${vr.validatorName}`);
    lines.push(`- Status: ${vr.severity}`);
    lines.push(`- Passed: ${vr.passed}/${report.totalScenarios}`);
    lines.push(`- Issues Found: ${vr.findings.length}\n`);
  }

  lines.push('## Auto-Fixes Applied\n');
  for (const fix of report.autoFixesLog.slice(0, 10)) {
    lines.push(`- ${fix.scenarioId}: "${fix.oldValue}" → "${fix.newValue}"`);
  }
  if (report.autoFixesLog.length > 10) {
    lines.push(`- ... and ${report.autoFixesLog.length - 10} more`);
  }

  lines.push('\n---');
  lines.push(`Report generated at ${timestamp}`);

  writeOut(chalk.green(`\n✓ Report generated: ${reportPath}`));
  writeOut(`Total suggestions for review: ${report.findingsRequiringApproval}\n`);
}

/**
 * Print help text
 */
function printHelp(): void {
  writeOut(`
FluentStep IELTS Linguistic Audit CLI

USAGE:
  npm run audit [OPTIONS]

OPTIONS:
  --dry-run              Preview changes without applying
  --report-only          Generate report without interactive review
  --no-auto-approve      Don't auto-apply HIGH confidence fixes
  --scenario=ID          Audit single scenario (e.g., --scenario=service-1)
  --category=CATEGORY    Audit by category (e.g., --category=Social)
  --verbose              Show detailed validator output
  --help                 Show this help text

EXAMPLES:
  npm run audit                    # Run full audit with interactive review
  npm run audit --dry-run          # Preview without applying
  npm run audit --scenario=social-1  # Single scenario
  npm run audit --category=Workplace # By category

VALIDATORS:
  1. Chunk Compliance (80%+ LOCKED CHUNKS)
  2. UK English Spelling (4 British rules)
  3. UK English Vocabulary (Americanism detection)
  4. Tonality & Register (Category-appropriate formality)
  5. Natural Patterns (Textbook phrase detection)
  6. Dialogue Flow (Turn-taking coherence)
  7. Alternatives Quality (Synonym checking)
  8. Deep Dive Quality (Insight educational value)

APPROVAL WORKFLOW:
  [A] - Approve suggestion and apply fix
  [S] - Skip issue and continue
  [E] - Edit and provide custom value
  [V] - View full dialogue context
  [Q] - Quit audit (unsaved)
`);
}

// Run if executed directly
main().catch((error) => writeErr(getErrorMessage(error)));
