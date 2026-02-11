/**
 * Comprehensive QA Agent Test Suite
 *
 * Tests the QA Agent on multiple scenarios and generates
 * a detailed validation report
 */

import { CURATED_ROLEPLAYS } from '../src/services/staticData';
import { runQACheck, formatQAReport, generateQASummary, QAReport } from './qaAgent';
import { analyzeChunkReuseAcrossScenarios, getChunkReuseReport } from './chunkReuseEnforcer';

interface TestResult {
  passed: boolean;
  passedCount: number;
  failedCount: number;
  warningCount: number;
  totalIssues: number;
  reports: QAReport[];
}

/**
 * Run comprehensive test suite
 */
async function runComprehensiveTests(): Promise<TestResult> {
  console.log('\n');
  console.log('╔' + '═'.repeat(68) + '╗');
  console.log('║' + ' '.repeat(15) + 'QA AGENT COMPREHENSIVE TEST SUITE' + ' '.repeat(20) + '║');
  console.log('╚' + '═'.repeat(68) + '╝');
  console.log('\n');

  const scenarios = CURATED_ROLEPLAYS;
  const reports: QAReport[] = [];
  let passedCount = 0;
  let failedCount = 0;
  let totalIssues = 0;

  console.log(`Testing ${scenarios.length} scenarios...\n`);

  // Run QA checks on all scenarios
  for (const scenario of scenarios) {
    const report = runQACheck(scenario);
    reports.push(report);
    totalIssues += report.summary.totalFindings;

    if (report.passed) {
      passedCount++;
      console.log(`✅ ${report.scenarioId}: PASSED`);
    } else {
      failedCount++;
      console.log(`❌ ${report.scenarioId}: FAILED (${report.summary.criticalCount} critical)`);
    }
  }

  console.log('\n');
  console.log('═'.repeat(70));
  console.log('SUMMARY REPORT');
  console.log('═'.repeat(70));
  console.log(generateQASummary(reports));

  // Gate analysis
  console.log('GATE ANALYSIS:');
  console.log('─'.repeat(70));

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
    console.log(
      `${icon} ${gate.name}: ${gate.stats.passed}/${scenarios.length} (${passRate}%)`
    );
  }

  console.log('');

  // Issue distribution
  console.log('ISSUE DISTRIBUTION:');
  console.log('─'.repeat(70));

  const criticalIssueCount = reports.reduce((sum, r) => sum + r.summary.criticalCount, 0);
  const warningCount = reports.reduce((sum, r) => sum + r.summary.warningCount, 0);
  const suggestionCount = reports.reduce((sum, r) => sum + r.summary.suggestionCount, 0);

  console.log(`Critical Issues: ${criticalIssueCount}`);
  console.log(`Warnings: ${warningCount}`);
  console.log(`Suggestions: ${suggestionCount}`);
  console.log(`Total: ${totalIssues}`);
  console.log('');

  // Chunk reuse analysis
  console.log('CHUNK REUSE ANALYSIS:');
  console.log('─'.repeat(70));
  const chunkReuseReport = analyzeChunkReuseAcrossScenarios(scenarios);
  console.log(
    `Synonym replacements: ${chunkReuseReport.synonymReplacements.length}`
  );
  if (chunkReuseReport.recommendations.length > 0) {
    console.log(`Recommendations: ${chunkReuseReport.recommendations.length}`);
    for (const rec of chunkReuseReport.recommendations.slice(0, 3)) {
      console.log(`  • ${rec}`);
    }
  }
  console.log('');

  // Performance check
  console.log('PERFORMANCE:');
  console.log('─'.repeat(70));
  console.log(`Average confidence: ${(
    reports.reduce((sum, r) => sum + r.overallConfidence, 0) / reports.length * 100
  ).toFixed(0)}%`);
  console.log('');

  // Test result
  const passed = failedCount === 0;

  if (passed) {
    console.log('═'.repeat(70));
    console.log('✅ ALL TESTS PASSED');
    console.log('═'.repeat(70));
  } else {
    console.log('═'.repeat(70));
    console.log(`⚠️  ${failedCount} SCENARIOS REQUIRE ATTENTION`);
    console.log('═'.repeat(70));
  }
  console.log('');

  // Detailed results
  console.log('DETAILED RESULTS (First 3 Failed):');
  console.log('═'.repeat(70));
  let failedShown = 0;
  for (const report of reports.filter(r => !r.passed)) {
    if (failedShown >= 3) break;
    console.log(formatQAReport(report));
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
runComprehensiveTests().catch(console.error);
