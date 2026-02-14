import { promises as fs } from 'fs';
import * as path from 'path';

export interface GateResult {
  status: 'PASS' | 'FAIL' | 'PENDING';
  confidence?: number; // 0-100
  errors?: string[];
  warnings?: string[];
  timestamp?: string;
}

export interface ValidationReport {
  scenarioId: string;
  timestamp: string;
  gates: {
    gate1_structural?: GateResult;
    gate2_linguistic?: GateResult;
    gate3_integration?: GateResult;
    gate4_qa?: GateResult;
  };
  overallStatus: 'PASS' | 'FAIL' | 'PENDING';
  nextSteps: string;
  details?: Record<string, any>;
}

/**
 * Create a validation report
 */
export function createValidationReport(scenarioId: string): ValidationReport {
  return {
    scenarioId,
    timestamp: new Date().toISOString(),
    gates: {},
    overallStatus: 'PENDING',
    nextSteps: 'Starting validation...',
  };
}

/**
 * Update a gate result in the report
 */
export function updateGateResult(
  report: ValidationReport,
  gateName: 'gate1_structural' | 'gate2_linguistic' | 'gate3_integration' | 'gate4_qa',
  result: GateResult
): ValidationReport {
  return {
    ...report,
    gates: {
      ...report.gates,
      [gateName]: {
        ...result,
        timestamp: new Date().toISOString(),
      },
    },
  };
}

/**
 * Finalize validation report and determine overall status
 */
export function finalizeReport(report: ValidationReport): ValidationReport {
  const gates = Object.values(report.gates || {});
  const allPassed = gates.every((g) => g?.status === 'PASS');
  const anyFailed = gates.some((g) => g?.status === 'FAIL');

  let overallStatus: 'PASS' | 'FAIL' | 'PENDING' = 'PENDING';
  let nextSteps = 'Validation in progress...';

  if (anyFailed) {
    overallStatus = 'FAIL';
    nextSteps = '❌ Validation failed. See errors above. Fix and re-submit.';
  } else if (allPassed) {
    overallStatus = 'PASS';
    nextSteps = '✅ All gates passed! Ready for approval and import.';
  }

  return {
    ...report,
    overallStatus,
    nextSteps,
  };
}

/**
 * Save validation report to file
 */
export async function saveValidationReport(
  report: ValidationReport,
  stagePath: string = '.staging'
): Promise<string> {
  try {
    const reportPath = path.join(
      stagePath,
      'rejected',
      `${report.scenarioId}-validation-report.json`
    );

    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');

    console.log(`📄 Validation report saved: ${reportPath}`);
    return reportPath;
  } catch (error) {
    console.error('❌ Failed to save validation report:', error);
    throw error;
  }
}

/**
 * Load validation report from file
 */
export async function loadValidationReport(reportPath: string): Promise<ValidationReport> {
  try {
    const content = await fs.readFile(reportPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Failed to load validation report:', error);
    throw error;
  }
}

/**
 * Pretty print validation report
 */
export function printValidationReport(report: ValidationReport): void {
  console.log('\n' + '='.repeat(60));
  console.log(`📋 VALIDATION REPORT: ${report.scenarioId}`);
  console.log('='.repeat(60));
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Overall Status: ${report.overallStatus}`);
  console.log('');

  // Gate 1
  if (report.gates.gate1_structural) {
    printGateResult('Gate 1: Structural Validation', report.gates.gate1_structural);
  }

  // Gate 2
  if (report.gates.gate2_linguistic) {
    printGateResult('Gate 2: Linguistic Validation', report.gates.gate2_linguistic);
  }

  // Gate 3
  if (report.gates.gate3_integration) {
    printGateResult('Gate 3: Integration Validation', report.gates.gate3_integration);
  }

  // Gate 4
  if (report.gates.gate4_qa) {
    printGateResult('Gate 4: QA Review', report.gates.gate4_qa);
  }

  console.log('');
  console.log('Next Steps:');
  console.log(report.nextSteps);
  console.log('='.repeat(60) + '\n');
}

/**
 * Print individual gate result
 */
function printGateResult(gateName: string, result: GateResult): void {
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏳';
  console.log(`${icon} ${gateName}: ${result.status}`);

  if (result.confidence !== undefined) {
    console.log(`   Confidence: ${result.confidence}%`);
  }

  if (result.errors && result.errors.length > 0) {
    console.log('   Errors:');
    result.errors.forEach((e) => console.log(`     - ${e}`));
  }

  if (result.warnings && result.warnings.length > 0) {
    console.log('   Warnings:');
    result.warnings.forEach((w) => console.log(`     - ${w}`));
  }

  console.log('');
}
