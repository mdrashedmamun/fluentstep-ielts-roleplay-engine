/**
 * Audit Worker Process
 * Runs linguistic validators on assigned scenarios and outputs JSON findings.
 * Forked by auditOrchestrator.ts for parallel processing.
 */

import { promises as fs } from 'fs';
import { CURATED_ROLEPLAYS } from '../src/services/staticData';
import {
  registerValidator,
  runAudit,
  type ValidatorFn
} from '../src/services/linguisticAudit/index';
import { type AutoFix, type WorkerOutput } from '../src/services/linguisticAudit/types';
import { validateAlternatives } from '../src/services/linguisticAudit/validators/alternativesValidator';
import { validateBlankAnswerPairing } from '../src/services/linguisticAudit/validators/blankAnswerPairingValidator';
import { validateChunkCompliance } from '../src/services/linguisticAudit/validators/chunkComplianceValidator';
import { validateContextualSubstitution } from '../src/services/linguisticAudit/validators/contextualSubstitutionValidator';
import { validateDeepDive } from '../src/services/linguisticAudit/validators/deepDiveValidator';
import { validateDialogueFlow } from '../src/services/linguisticAudit/validators/dialogueFlowValidator';
import { validateGrammarContext } from '../src/services/linguisticAudit/validators/grammarContextValidator';
import { validateNaturalPatterns } from '../src/services/linguisticAudit/validators/naturalPatternsValidator';
import { validateTonality } from '../src/services/linguisticAudit/validators/tonalityValidator';
import { validateUKEnglish } from '../src/services/linguisticAudit/validators/ukEnglishValidator';

interface WorkerCliArgs {
  workerId: number;
  scenarios: string[];
  outputPath: string;
}

const writeErr = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

const getErrorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

const registerAuditValidators = (): void => {
  registerValidator({
    name: 'Chunk Compliance',
    validate: validateChunkCompliance
  } as ValidatorFn);

  registerValidator({
    name: 'UK English Spelling',
    validate: (scenario) => validateUKEnglish(scenario).filter((finding) => finding.validatorName === 'UK English Spelling')
  } as ValidatorFn);

  registerValidator({
    name: 'UK English Vocabulary',
    validate: (scenario) => validateUKEnglish(scenario).filter((finding) => finding.validatorName === 'UK English Vocabulary')
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
 * Parse command line arguments.
 */
function parseArgs(): WorkerCliArgs {
  const args = process.argv.slice(2);
  const result: WorkerCliArgs = {
    workerId: 0,
    scenarios: [],
    outputPath: '/tmp/audit-worker-unknown.json'
  };

  for (const arg of args) {
    if (!arg.startsWith('--')) {
      continue;
    }

    const [key, value] = arg.substring(2).split('=');
    if (!value) {
      continue;
    }

    if (key === 'workerId') {
      result.workerId = Number.parseInt(value, 10);
    } else if (key === 'scenarios') {
      result.scenarios = value.split(',').filter(Boolean);
    } else if (key === 'outputPath') {
      result.outputPath = value;
    }
  }

  return {
    ...result,
    workerId: Number.isNaN(result.workerId) ? 0 : result.workerId
  };
}

const toWorkerFinding = (fix: AutoFix): WorkerOutput['findings'][number] => ({
  validatorName: fix.validatorName,
  scenarioId: fix.scenarioId,
  location: fix.location,
  issue: fix.reason,
  currentValue: fix.oldValue,
  suggestedValue: fix.newValue,
  confidence: 0.95,
  reasoning: `Auto-fix: ${fix.reason}`,
  context: ''
});

/**
 * Main worker function.
 */
async function runWorker(): Promise<void> {
  registerAuditValidators();
  const startTime = Date.now();
  const { workerId, scenarios: scenarioIds, outputPath } = parseArgs();

  writeErr(`Worker ${workerId} starting with ${scenarioIds.length} scenarios`);

  try {
    // Filter scenarios
    const scenariosToValidate = CURATED_ROLEPLAYS.filter((scenario) => scenarioIds.includes(scenario.id));

    if (scenariosToValidate.length === 0) {
      throw new Error(
        `No scenarios found for IDs: ${scenarioIds.join(', ')}`
      );
    }

    // Run audit on assigned scenarios
    const report = await runAudit(scenariosToValidate, {
      dryRun: false,
      reportOnly: true,
      autoApproveHigh: false,
      verbose: false
    });

    const executionTime = Date.now() - startTime;

    // Prepare output
    const output: WorkerOutput = {
      workerId,
      scenariosProcessed: scenariosToValidate.map((scenario) => scenario.id),
      findings: report.autoFixesLog.map(toWorkerFinding),
      executionTime,
      errors: [],
      timestamp: new Date().toISOString()
    };

    // Write output JSON
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8');

    writeErr(
      `Worker ${workerId} completed: ${output.findings.length} findings in ${executionTime}ms`
    );

    process.exit(0);
  } catch (error) {
    writeErr(`Worker ${workerId} error: ${getErrorMessage(error)}`);

    const errorOutput: WorkerOutput = {
      workerId,
      scenariosProcessed: scenarioIds,
      findings: [],
      executionTime: Date.now() - startTime,
      errors: [{ scenarioId: 'all', error: getErrorMessage(error) }],
      timestamp: new Date().toISOString()
    };

    try {
      await fs.writeFile(outputPath, JSON.stringify(errorOutput, null, 2), 'utf-8');
    } catch {
      writeErr(`Failed to write error output to ${outputPath}`);
    }

    process.exit(1);
  }
}

runWorker().catch((error: unknown) => {
  writeErr(`Unhandled worker error: ${getErrorMessage(error)}`);
  process.exit(1);
});
