/**
 * Test script for QA Agent
 * Run with: npx ts-node scripts/testQAAgent.ts
 */

import { CURATED_ROLEPLAYS } from '../src/services/staticData';
import { runQACheck, formatQAReport, generateQASummary, QAReport } from './qaAgent';

async function main() {
  console.log('🔍 QA Agent Test Suite');
  console.log('═'.repeat(70));
  console.log('');

  // Test on a few scenarios
  const testScenarios = [
    'social-1-flatmate',
    'service-1-cafe',
    'workplace-1-disagreement'
  ];

  const reports: QAReport[] = [];

  for (const scenarioId of testScenarios) {
    const scenario = CURATED_ROLEPLAYS.find(s => s.id === scenarioId);
    if (!scenario) {
      console.log(`❌ Scenario not found: ${scenarioId}`);
      continue;
    }

    console.log(`Testing: ${scenario.id}`);
    const report = runQACheck(scenario);
    reports.push(report);
    console.log(formatQAReport(report));
  }

  // Generate summary
  console.log('');
  console.log(generateQASummary(reports));
}

main().catch(console.error);
