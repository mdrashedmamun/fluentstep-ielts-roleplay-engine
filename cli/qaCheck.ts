/**
 * QA Check CLI Command
 *
 * Usage:
 *   npm run qa-check                    # Run QA on all scenarios
 *   npm run qa-check --scenario=ID      # Single scenario
 *   npm run qa-check --strict           # Zero tolerance (fail on warnings)
 *   npm run qa-check --verbose          # Detailed output
 *
 * Exit codes:
 *   0 = All scenarios passed
 *   1 = Some scenarios failed
 *   2 = CLI argument error
 */

import { CURATED_ROLEPLAYS } from '../src/services/staticData';
import { runQACheck, formatQAReport, generateQASummary, QAReport } from '../scripts/qaAgent';
import { analyzeChunkReuseAcrossScenarios, getChunkReuseReport } from '../scripts/chunkReuseEnforcer';
import { getStructuralAnalysisReport } from '../scripts/structuralDisciplineValidator';

interface CLIOptions {
  scenario?: string;
  strict: boolean;
  verbose: boolean;
  report: boolean;
  help: boolean;
}

/**
 * Parse CLI arguments
 */
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    strict: false,
    verbose: false,
    report: false,
    help: false
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--strict') {
      options.strict = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--report') {
      options.report = true;
    } else if (arg.startsWith('--scenario=')) {
      options.scenario = arg.split('=')[1];
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                        QA CHECK COMMAND                       ║
╚═══════════════════════════════════════════════════════════════╝

Usage:
  npm run qa-check [options]

Options:
  --scenario=ID    Check specific scenario (e.g., --scenario=social-1-flatmate)
  --strict         Fail on warnings (not just critical issues)
  --verbose,-v     Show detailed output for each scenario
  --report         Generate detailed HTML report
  --help,-h        Show this help message

Examples:
  npm run qa-check
  npm run qa-check --scenario=social-1-flatmate
  npm run qa-check --strict --verbose
  npm run qa-check --report

Exit Codes:
  0 = All checks passed
  1 = Some checks failed
  2 = Command error

For more information, see the QA Agent documentation.
`);
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  console.log('\n🔍 FluentStep QA Agent\n');

  // Get scenarios to check
  let scenarios = CURATED_ROLEPLAYS;

  if (options.scenario) {
    const scenario = CURATED_ROLEPLAYS.find(s => s.id === options.scenario);
    if (!scenario) {
      console.error(`❌ Scenario not found: ${options.scenario}`);
      console.error(`Available scenarios: ${CURATED_ROLEPLAYS.map(s => s.id).join(', ')}`);
      process.exit(2);
    }
    scenarios = [scenario];
  }

  // Run QA checks
  const reports: QAReport[] = [];
  let allPassed = true;

  for (const scenario of scenarios) {
    const report = runQACheck(scenario);
    reports.push(report);

    if (!report.passed) {
      allPassed = false;
    }

    if (options.verbose || options.scenario) {
      console.log(formatQAReport(report));
    }
  }

  // Print summary
  if (!options.scenario) {
    console.log(generateQASummary(reports));
  }

  // Strict mode: fail on warnings too
  const failedStrict = options.strict
    ? reports.filter(r => r.summary.warningCount > 0 || r.summary.criticalCount > 0)
    : reports.filter(r => !r.passed);

  if (failedStrict.length > 0 && options.strict) {
    console.log('\n⚠️  STRICT MODE: Failed due to warnings or critical issues');
    allPassed = false;
  }

  // Generate chunk reuse report if requested
  if (options.report) {
    console.log('\n' + getChunkReuseReport(scenarios));
  }

  // Chunk reuse enforcement summary
  const chunkReuseReport = analyzeChunkReuseAcrossScenarios(scenarios);
  if (chunkReuseReport.totalIssues > 0) {
    console.log(`\n⚠️  Chunk reuse issues found: ${chunkReuseReport.totalIssues}`);
    console.log(`   Recommendations: ${chunkReuseReport.recommendations.join('; ')}`);
  }

  // Exit with appropriate code
  if (allPassed) {
    console.log('\n✅ QA CHECK PASSED\n');
    process.exit(0);
  } else {
    console.log('\n❌ QA CHECK FAILED\n');
    process.exit(1);
  }
}

// Run
main().catch(error => {
  console.error('❌ QA Agent Error:', error);
  process.exit(2);
});
