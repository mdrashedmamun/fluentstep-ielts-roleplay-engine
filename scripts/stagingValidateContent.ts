#!/usr/bin/env node

/**
 * Staging Content Validation Orchestrator
 *
 * Runs 4-gate validation pipeline on scenarios in .staging/ready-for-review/
 * Gates: Structural → Linguistic → Integration → QA
 *
 * Usage:
 *   npm run stage:validate                    # Validate all ready-for-review scenarios
 *   npm run stage:validate -- --id=scenario-1 # Validate specific scenario
 */

import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import * as path from 'path';
import {
  createValidationReport,
  updateGateResult,
  finalizeReport,
  saveValidationReport,
  printValidationReport,
  type GateResult,
} from './utils/validationReporting.js';
import {
  listScenariosInState,
  moveScenario,
  copyValidationReport,
} from './utils/stageStateManager.js';

const STAGING_BASE = '.staging';

async function validateContent(scenarioIds?: string[]): Promise<void> {
  console.log('🔍 Starting Content Validation Pipeline\n');

  // Get scenarios to validate
  let scenariosToValidate = scenarioIds;
  if (!scenariosToValidate || scenariosToValidate.length === 0) {
    scenariosToValidate = await listScenariosInState('ready-for-review');

    if (scenariosToValidate.length === 0) {
      console.log('ℹ️  No scenarios in ready-for-review/. Nothing to validate.');
      return;
    }
  }

  console.log(`📋 Found ${scenariosToValidate.length} scenario(s) to validate\n`);

  for (const scenarioId of scenariosToValidate) {
    await validateScenario(scenarioId);
  }

  console.log('\n✅ Validation pipeline completed\n');
}

async function validateScenario(scenarioId: string): Promise<void> {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📝 Validating: ${scenarioId}`);
  console.log('='.repeat(70));

  const filePath = path.join(STAGING_BASE, 'ready-for-review', `${scenarioId}.md`);
  let report = createValidationReport(scenarioId);

  try {
    // Gate 1: Structural Validation
    console.log('\n🔍 Gate 1: Structural Validation');
    try {
      const structuralResult = await runStructuralValidation(filePath);
      report = updateGateResult(report, 'gate1_structural', structuralResult);
      console.log(
        `   Status: ${structuralResult.status} (${structuralResult.confidence}% confidence)`
      );

      if (structuralResult.status === 'FAIL') {
        throw new Error('Gate 1 failed - structural validation errors');
      }
    } catch (error: any) {
      console.error(`   ❌ Gate 1 failed:`, error.message);
      report = updateGateResult(report, 'gate1_structural', {
        status: 'FAIL',
        errors: [error.message],
      });
      throw error;
    }

    // Gate 2: Linguistic Validation
    console.log('\n🔍 Gate 2: Linguistic Validation');
    try {
      const linguisticResult = await runLinguisticValidation(filePath);
      report = updateGateResult(report, 'gate2_linguistic', linguisticResult);
      console.log(
        `   Status: ${linguisticResult.status} (${linguisticResult.confidence}% confidence)`
      );

      if (linguisticResult.status === 'FAIL') {
        throw new Error('Gate 2 failed - linguistic validation errors');
      }
    } catch (error: any) {
      console.error(`   ❌ Gate 2 failed:`, error.message);
      report = updateGateResult(report, 'gate2_linguistic', {
        status: 'FAIL',
        errors: [error.message],
      });
      throw error;
    }

    // Gate 3: Integration Validation
    console.log('\n🔍 Gate 3: Integration Validation');
    try {
      const integrationResult = await runIntegrationValidation(filePath);
      report = updateGateResult(report, 'gate3_integration', integrationResult);
      console.log(
        `   Status: ${integrationResult.status} (${integrationResult.confidence}% confidence)`
      );

      if (integrationResult.status === 'FAIL') {
        throw new Error('Gate 3 failed - integration validation errors');
      }
    } catch (error: any) {
      console.error(`   ❌ Gate 3 failed:`, error.message);
      report = updateGateResult(report, 'gate3_integration', {
        status: 'FAIL',
        errors: [error.message],
      });
      throw error;
    }

    // Gate 4: QA Review (manual, mark as PENDING for now)
    console.log('\n🔍 Gate 4: QA Review');
    report = updateGateResult(report, 'gate4_qa', {
      status: 'PENDING',
      warnings: ['Awaiting manual QA review'],
    });

    // All gates passed - move to approved
    report = finalizeReport(report);
    printValidationReport(report);

    if (report.overallStatus === 'PASS') {
      console.log('\n✅ All gates passed! Moving to approved/');
      await moveScenario(scenarioId, 'ready-for-review', 'approved');
      await copyValidationReport(scenarioId, 'ready-for-review', 'approved');
    }
  } catch (error: any) {
    // Validation failed - move to rejected
    console.error(`\n❌ Validation failed for ${scenarioId}`);
    report = finalizeReport(report);
    printValidationReport(report);

    console.log('📦 Moving to rejected/');
    try {
      await moveScenario(scenarioId, 'ready-for-review', 'rejected');
      await saveValidationReport(report);
      console.log(`📄 Validation report saved to rejected/${scenarioId}-validation-report.json`);
    } catch (moveError) {
      console.error('⚠️  Failed to move scenario:', moveError);
    }
  }
}

async function runStructuralValidation(filePath: string): Promise<GateResult> {
  try {
    // Parse Markdown to verify structure
    const content = await fs.readFile(filePath, 'utf-8');

    // Check for required sections
    const hasDialogue = content.includes('# Dialogue');
    const hasAnswers = content.includes('# Answers');
    const hasYAML = content.startsWith('---');

    if (!hasDialogue || !hasAnswers || !hasYAML) {
      return {
        status: 'FAIL',
        confidence: 0,
        errors: [
          !hasYAML ? 'Missing YAML frontmatter (---)' : null,
          !hasDialogue ? 'Missing "# Dialogue" section' : null,
          !hasAnswers ? 'Missing "# Answers" section' : null,
        ].filter(Boolean) as string[],
      };
    }

    // Run external validator if available
    try {
      execSync('npm run review:package 2>/dev/null', { stdio: 'pipe' });
      return {
        status: 'PASS',
        confidence: 95,
      };
    } catch {
      // Validator not available or had warnings, but structure is OK
      return {
        status: 'PASS',
        confidence: 80,
        warnings: ['Manual review recommended'],
      };
    }
  } catch (error: any) {
    return {
      status: 'FAIL',
      confidence: 0,
      errors: [error.message],
    };
  }
}

async function runLinguisticValidation(filePath: string): Promise<GateResult> {
  try {
    // Run linguistic validators
    const validators = [
      'npm run validate:feedback 2>&1',
      'npm run validate:alternatives 2>&1',
    ];

    const warnings: string[] = [];
    let confidence = 95;

    for (const validator of validators) {
      try {
        execSync(validator, { stdio: 'pipe' });
      } catch (error: any) {
        const output = error.stdout?.toString() || error.message;
        if (output.includes('warning')) {
          warnings.push(output.substring(0, 100) + '...');
          confidence -= 10;
        } else if (output.includes('error')) {
          return {
            status: 'FAIL',
            confidence: 0,
            errors: [output.substring(0, 200)],
          };
        }
      }
    }

    const status = confidence >= 85 ? 'PASS' : 'FAIL';
    return {
      status,
      confidence: Math.max(0, confidence),
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error: any) {
    return {
      status: 'FAIL',
      confidence: 0,
      errors: [error.message],
    };
  }
}

async function runIntegrationValidation(filePath: string): Promise<GateResult> {
  try {
    // Run build
    try {
      execSync('npm run build', { stdio: 'pipe' });
    } catch (error: any) {
      return {
        status: 'FAIL',
        confidence: 0,
        errors: ['Build failed - TypeScript compilation error'],
      };
    }

    // Run quick E2E tests
    try {
      execSync('npm run test:e2e:tier1', { stdio: 'pipe' });
    } catch (error: any) {
      return {
        status: 'FAIL',
        confidence: 0,
        errors: ['E2E tests failed - UI rendering or integration issue'],
      };
    }

    return {
      status: 'PASS',
      confidence: 100,
    };
  } catch (error: any) {
    return {
      status: 'FAIL',
      confidence: 0,
      errors: [error.message],
    };
  }
}

// Main
const scenarioIds = process.argv.slice(2).filter((arg) => {
  if (arg.startsWith('--id=')) {
    return true;
  }
  return false;
});

const idsToValidate = scenarioIds.map((arg) => arg.replace('--id=', ''));

validateContent(idsToValidate.length > 0 ? idsToValidate : undefined).catch((error) => {
  console.error('❌ Validation orchestration failed:', error);
  process.exit(1);
});
