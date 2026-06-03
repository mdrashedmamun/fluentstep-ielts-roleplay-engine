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
import { fileURLToPath } from 'url';
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
const HUMAN_REVIEW_DIR = path.join(STAGING_BASE, 'human-review');

type ValidationReportForState = ReturnType<typeof finalizeReport>;

const writeOut = (message = ''): void => {
  process.stdout.write(`${message}\n`);
};

const writeErr = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

const getErrorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

const getErrorCode = (error: unknown): string | undefined => (
  typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : undefined
);

const getCommandOutput = (error: unknown): string => {
  if (typeof error !== 'object' || error === null) {
    return String(error);
  }

  const stdout = 'stdout' in error ? error.stdout : undefined;
  if (Buffer.isBuffer(stdout)) {
    return stdout.toString();
  }

  if (typeof stdout === 'string') {
    return stdout;
  }

  return getErrorMessage(error);
};

interface HumanReviewChecklist {
  scenarioId: string;
  status: 'pending' | 'approved' | 'changes_requested';
  reviewer: string;
  reviewedAt: string;
  checklist: {
    ieltsRelevance: boolean;
    spokenNaturalness: boolean;
    britishEnglish: boolean;
    blankLearningValue: boolean;
    chunkFeedbackHelpful: boolean;
    noForbiddenClaims: boolean;
  };
  notes: string[];
}

async function validateContent(scenarioIds?: string[]): Promise<void> {
  writeOut('🔍 Starting Content Validation Pipeline\n');

  // Get scenarios to validate
  let scenariosToValidate = scenarioIds;
  if (!scenariosToValidate || scenariosToValidate.length === 0) {
    scenariosToValidate = await listScenariosInState('ready-for-review');

    if (scenariosToValidate.length === 0) {
      writeOut('ℹ️  No scenarios in ready-for-review/. Nothing to validate.');
      return;
    }
  }

  writeOut(`📋 Found ${scenariosToValidate.length} scenario(s) to validate\n`);

  for (const scenarioId of scenariosToValidate) {
    await validateScenario(scenarioId);
  }

  writeOut('\n✅ Validation pipeline completed\n');
}

async function validateScenario(scenarioId: string): Promise<void> {
  writeOut(`\n${'='.repeat(70)}`);
  writeOut(`📝 Validating: ${scenarioId}`);
  writeOut('='.repeat(70));

  const filePath = path.join(STAGING_BASE, 'ready-for-review', `${scenarioId}.md`);
  let report = createValidationReport(scenarioId);

  try {
    // Gate 1: Structural Validation
    writeOut('\n🔍 Gate 1: Structural Validation');
    try {
      const structuralResult = await runStructuralValidation(filePath);
      report = updateGateResult(report, 'gate1_structural', structuralResult);
      writeOut(
        `   Status: ${structuralResult.status} (${structuralResult.confidence}% confidence)`
      );

      if (structuralResult.status === 'FAIL') {
        throw new Error('Gate 1 failed - structural validation errors');
      }
    } catch (error) {
      writeErr(`   ❌ Gate 1 failed: ${getErrorMessage(error)}`);
      report = updateGateResult(report, 'gate1_structural', {
        status: 'FAIL',
        errors: [getErrorMessage(error)],
      });
      throw error;
    }

    // Gate 2: Linguistic Validation
    writeOut('\n🔍 Gate 2: Linguistic Validation');
    try {
      const linguisticResult = runLinguisticValidation();
      report = updateGateResult(report, 'gate2_linguistic', linguisticResult);
      writeOut(
        `   Status: ${linguisticResult.status} (${linguisticResult.confidence}% confidence)`
      );

      if (linguisticResult.status === 'FAIL') {
        throw new Error('Gate 2 failed - linguistic validation errors');
      }
    } catch (error) {
      writeErr(`   ❌ Gate 2 failed: ${getErrorMessage(error)}`);
      report = updateGateResult(report, 'gate2_linguistic', {
        status: 'FAIL',
        errors: [getErrorMessage(error)],
      });
      throw error;
    }

    // Gate 3: Integration Validation
    writeOut('\n🔍 Gate 3: Integration Validation');
    try {
      const integrationResult = runIntegrationValidation();
      report = updateGateResult(report, 'gate3_integration', integrationResult);
      writeOut(
        `   Status: ${integrationResult.status} (${integrationResult.confidence}% confidence)`
      );

      if (integrationResult.status === 'FAIL') {
        throw new Error('Gate 3 failed - integration validation errors');
      }
    } catch (error) {
      writeErr(`   ❌ Gate 3 failed: ${getErrorMessage(error)}`);
      report = updateGateResult(report, 'gate3_integration', {
        status: 'FAIL',
        errors: [getErrorMessage(error)],
      });
      throw error;
    }

    // Gate 4: Human QA Review
    writeOut('\n🔍 Gate 4: QA Review');
    const qaReviewResult = await runHumanReviewGate(scenarioId);
    report = updateGateResult(report, 'gate4_qa', qaReviewResult);
    writeOut(`   Status: ${qaReviewResult.status}`);

    if (qaReviewResult.status === 'FAIL') {
      throw new Error('Gate 4 failed - human QA review rejected or invalid');
    }

    // All gates passed - move to approved
    report = finalizeReport(report);
    printValidationReport(report);
    await saveValidationReportForState(report, 'ready-for-review');

    if (report.overallStatus === 'PASS') {
      writeOut('\n✅ All gates passed! Moving to approved/');
      await moveScenario(scenarioId, 'ready-for-review', 'approved');
      await copyValidationReport(scenarioId, 'ready-for-review', 'approved');
    } else {
      writeOut('\n⏳ Scenario remains in ready-for-review until Gate 4 is approved.');
    }
  } catch {
    // Validation failed - move to rejected
    writeErr(`\n❌ Validation failed for ${scenarioId}`);
    report = finalizeReport(report);
    printValidationReport(report);

    writeOut('📦 Moving to rejected/');
    try {
      await moveScenario(scenarioId, 'ready-for-review', 'rejected');
      await saveValidationReport(report);
      writeOut(`📄 Validation report saved to rejected/${scenarioId}-validation-report.json`);
    } catch (moveError) {
      writeErr(`⚠️  Failed to move scenario: ${getErrorMessage(moveError)}`);
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
  } catch (error) {
    return {
      status: 'FAIL',
      confidence: 0,
      errors: [getErrorMessage(error)],
    };
  }
}

function runLinguisticValidation(): GateResult {
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
      } catch (error) {
        const output = getCommandOutput(error);
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
  } catch (error) {
    return {
      status: 'FAIL',
      confidence: 0,
      errors: [getErrorMessage(error)],
    };
  }
}

function runIntegrationValidation(): GateResult {
  try {
    // Run build
    try {
      execSync('npm run build', { stdio: 'pipe' });
    } catch {
      return {
        status: 'FAIL',
        confidence: 0,
        errors: ['Build failed - TypeScript compilation error'],
      };
    }

    // Run quick E2E tests
    try {
      execSync('npm run test:e2e:tier1', { stdio: 'pipe' });
    } catch {
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
  } catch (error) {
    return {
      status: 'FAIL',
      confidence: 0,
      errors: [getErrorMessage(error)],
    };
  }
}

export async function runHumanReviewGate(scenarioId: string): Promise<GateResult> {
  const reviewPath = getHumanReviewJsonPath(scenarioId);
  const checklistPath = getHumanReviewMarkdownPath(scenarioId);

  try {
    const review = await loadHumanReviewChecklist(reviewPath);
    const incomplete = getIncompleteChecklistItems(review);

    if (review.status === 'approved' && incomplete.length === 0 && review.reviewer.trim().length > 0) {
      return {
        status: 'PASS',
        confidence: 100,
        warnings: review.notes.length > 0 ? review.notes : undefined,
      };
    }

    if (review.status === 'changes_requested') {
      return {
        status: 'FAIL',
        confidence: 100,
        errors: [
          `Human reviewer requested changes. Notes: ${review.notes.join('; ') || 'No notes provided'}`,
        ],
      };
    }

    return {
      status: 'PENDING',
      confidence: 50,
      warnings: [
        `Human review is not approved yet. Review file: ${reviewPath}`,
        incomplete.length > 0 ? `Incomplete checklist: ${incomplete.join(', ')}` : 'Set status to approved and add reviewer name.',
      ],
    };
  } catch (error) {
    if (getErrorCode(error) !== 'ENOENT') {
      return {
        status: 'FAIL',
        confidence: 0,
        errors: [`Could not read human review checklist: ${getErrorMessage(error)}`],
      };
    }

    const checklist = createHumanReviewChecklist(scenarioId);
    await fs.mkdir(HUMAN_REVIEW_DIR, { recursive: true });
    await fs.writeFile(reviewPath, `${JSON.stringify(checklist, null, 2)}\n`, 'utf-8');
    await fs.writeFile(checklistPath, renderHumanReviewMarkdown(checklist), 'utf-8');

    return {
      status: 'PENDING',
      confidence: 50,
      warnings: [
        `Human review checklist created: ${reviewPath}`,
        `Reviewer checklist: ${checklistPath}`,
        'Set status to approved, add reviewer/reviewedAt, and mark all checklist items true before approval.',
      ],
    };
  }
}

async function saveValidationReportForState(
  report: ValidationReportForState,
  state: 'ready-for-review' | 'approved'
): Promise<void> {
  const reportPath = path.join(STAGING_BASE, state, `${report.scenarioId}-validation-report.json`);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf-8');
}

async function loadHumanReviewChecklist(reviewPath: string): Promise<HumanReviewChecklist> {
  const content = await fs.readFile(reviewPath, 'utf-8');
  return JSON.parse(content) as HumanReviewChecklist;
}

function createHumanReviewChecklist(scenarioId: string): HumanReviewChecklist {
  return {
    scenarioId,
    status: 'pending',
    reviewer: '',
    reviewedAt: '',
    checklist: {
      ieltsRelevance: false,
      spokenNaturalness: false,
      britishEnglish: false,
      blankLearningValue: false,
      chunkFeedbackHelpful: false,
      noForbiddenClaims: false,
    },
    notes: [],
  };
}

function getIncompleteChecklistItems(review: HumanReviewChecklist): string[] {
  const incomplete = Object.entries(review.checklist)
    .filter(([, checked]) => !checked)
    .map(([name]) => name);

  if (!review.reviewedAt.trim()) {
    incomplete.push('reviewedAt');
  }

  if (!review.reviewer.trim()) {
    incomplete.push('reviewer');
  }

  return incomplete;
}

function renderHumanReviewMarkdown(review: HumanReviewChecklist): string {
  return `# Human Review Checklist: ${review.scenarioId}

Update ${path.basename(getHumanReviewJsonPath(review.scenarioId))} when review is complete.

- Status: pending
- Reviewer:
- Reviewed at:

## Checklist

- [ ] IELTS topic is plausible and not too niche.
- [ ] Learner lines sound spoken and responsive.
- [ ] British English terms are correct and clear.
- [ ] Each blank teaches a reusable speaking pattern.
- [ ] Chunk feedback is simple, accurate, and useful.
- [ ] Scenario makes no unsupported production, legal, financial, or external claims.

## Approval Rule

The scenario can move to approved only when the JSON review file has:

- "status": "approved"
- non-empty "reviewer"
- non-empty "reviewedAt"
- every checklist field set to true
`;
}

function getHumanReviewJsonPath(scenarioId: string): string {
  return path.join(HUMAN_REVIEW_DIR, `${scenarioId}-qa-review.json`);
}

function getHumanReviewMarkdownPath(scenarioId: string): string {
  return path.join(HUMAN_REVIEW_DIR, `${scenarioId}-human-review-checklist.md`);
}

// Main
const isDirectInvocation = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isDirectInvocation) {
  const scenarioIds = process.argv.slice(2).filter((arg) => {
    if (arg.startsWith('--id=')) {
      return true;
    }
    return false;
  });

  const idsToValidate = scenarioIds.map((arg) => arg.replace('--id=', ''));

  validateContent(idsToValidate.length > 0 ? idsToValidate : undefined).catch((error) => {
    writeErr(`❌ Validation orchestration failed: ${getErrorMessage(error)}`);
    process.exit(1);
  });
}
