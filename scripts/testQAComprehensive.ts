/**
 * Comprehensive QA Agent Test Suite
 *
 * Tests the QA Agent on multiple scenarios and generates
 * a detailed validation report
 */

import { CURATED_ROLEPLAYS } from '../src/services/staticData';
import { runQACheck, formatQAReport, generateQASummary, QAReport } from './qaAgent';
import { analyzeChunkReuseAcrossScenarios } from './chunkReuseEnforcer';

interface TestResult {
  passed: boolean;
  passedCount: number;
  failedCount: number;
  warningCount: number;
  totalIssues: number;
  reports: QAReport[];
}


const writeLine = (message = ''): void => {
  process.stdout.write(`${message}\n`);
};

const writeError = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

const getErrorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

/**
 * Run comprehensive test suite
 */
function runComprehensiveTests(): TestResult {
  writeLine('\n');
  writeLine('╔' + '═'.repeat(68) + '╗');
  writeLine('║' + ' '.repeat(15) + 'QA AGENT COMPREHENSIVE TEST SUITE' + ' '.repeat(20) + '║');
  writeLine('╚' + '═'.repeat(68) + '╝');
  writeLine('\n');

  const scenarios = CURATED_ROLEPLAYS;
  const reports: QAReport[] = [];
  let passedCount = 0;
  let failedCount = 0;
  let totalIssues = 0;

  writeLine(`Testing ${scenarios.length} scenarios...\n`);

  // Run QA checks on all scenarios
  for (const scenario of scenarios) {
    const report = runQACheck(scenario);
    reports.push(report);
    totalIssues += report.summary.totalFindings;

    if (report.passed) {
      passedCount++;
      writeLine(`✅ ${report.scenarioId}: PASSED`);
    } else {
      failedCount++;
      writeLine(`❌ ${report.scenarioId}: FAILED (${report.summary.criticalCount} critical)`);
    }
  }

  writeLine('\n');
  writeLine('═'.repeat(70));
  writeLine('SUMMARY REPORT');
  writeLine('═'.repeat(70));
  writeLine(generateQASummary(reports));

  // Gate analysis
  writeLine('GATE ANALYSIS:');
  writeLine('─'.repeat(70));

  const gateStats = {
    structuralDiscipline: { passed: 0, failed: 0 },
    pragmaticSensitivity: { passed: 0, failed: 0 },
    chunkAwareness: { passed: 0, failed: 0 },
    registerControl: { passed: 0, failed: 0 }
  };

  for (const report of reports) {
    if (report.gates.structuralDiscipline.passed) gateStats.structuralDiscipline.passed++;
    else gateStats.structuralDiscipline.failed++;

    if (report.gates.pragmaticSensitivity.passed) gateStats.pragmaticSensitivity.passed++;
    else gateStats.pragmaticSensitivity.failed++;

    if (report.gates.chunkAwareness.passed) gateStats.chunkAwareness.passed++;
    else gateStats.chunkAwareness.failed++;

    if (report.gates.registerControl.passed) gateStats.registerControl.passed++;
    else gateStats.registerControl.failed++;
  }

  const gates = [
    { name: 'Structural Discipline', stats: gateStats.structuralDiscipline },
    { name: 'Pragmatic Sensitivity', stats: gateStats.pragmaticSensitivity },
    { name: 'Chunk Awareness', stats: gateStats.chunkAwareness },
    { name: 'Register Control', stats: gateStats.registerControl }
  ];

  for (const gate of gates) {
    const passRate = ((gate.stats.passed / scenarios.length) * 100).toFixed(0);
    const icon = gate.stats.failed === 0 ? '✅' : '⚠️';
    writeLine(
      `${icon} ${gate.name}: ${gate.stats.passed}/${scenarios.length} (${passRate}%)`
    );
  }

  writeLine('');

  // Issue distribution
  writeLine('ISSUE DISTRIBUTION:');
  writeLine('─'.repeat(70));

  const criticalIssueCount = reports.reduce((sum, r) => sum + r.summary.criticalCount, 0);
  const warningCount = reports.reduce((sum, r) => sum + r.summary.warningCount, 0);
  const suggestionCount = reports.reduce((sum, r) => sum + r.summary.suggestionCount, 0);

  writeLine(`Critical Issues: ${criticalIssueCount}`);
  writeLine(`Warnings: ${warningCount}`);
  writeLine(`Suggestions: ${suggestionCount}`);
  writeLine(`Total: ${totalIssues}`);
  writeLine('');

  // Chunk reuse analysis
  writeLine('CHUNK REUSE ANALYSIS:');
  writeLine('─'.repeat(70));
  const chunkReuseReport = analyzeChunkReuseAcrossScenarios(scenarios);
  writeLine(
    `Synonym replacements: ${chunkReuseReport.synonymReplacements.length}`
  );
  if (chunkReuseReport.recommendations.length > 0) {
    writeLine(`Recommendations: ${chunkReuseReport.recommendations.length}`);
    for (const rec of chunkReuseReport.recommendations.slice(0, 3)) {
      writeLine(`  • ${rec}`);
    }
  }
  writeLine('');

  // Performance check
  writeLine('PERFORMANCE:');
  writeLine('─'.repeat(70));
  writeLine(`Average confidence: ${(
    reports.reduce((sum, r) => sum + r.overallConfidence, 0) / reports.length * 100
  ).toFixed(0)}%`);
  writeLine('');

  // Test result
  const passed = failedCount === 0;

  if (passed) {
    writeLine('═'.repeat(70));
    writeLine('✅ ALL TESTS PASSED');
    writeLine('═'.repeat(70));
  } else {
    writeLine('═'.repeat(70));
    writeLine(`⚠️  ${failedCount} SCENARIOS REQUIRE ATTENTION`);
    writeLine('═'.repeat(70));
  }
  writeLine('');

  // Detailed results
  writeLine('DETAILED RESULTS (First 3 Failed):');
  writeLine('═'.repeat(70));
  let failedShown = 0;
  for (const report of reports.filter(r => !r.passed)) {
    if (failedShown >= 3) break;
    writeLine(formatQAReport(report));
    failedShown++;
  }

  return {
    passed,
    passedCount,
    failedCount,
    warningCount,
    totalIssues,
    reports
  };
}

// Run the tests
try {
  runComprehensiveTests();
} catch (error) {
  writeError(getErrorMessage(error));
  process.exit(1);
}
