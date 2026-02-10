/**
 * Audit Worker Process
 * Runs linguistic validators on assigned scenarios and outputs JSON findings
 * Forked by auditOrchestrator.ts for parallel processing
 */

import { promises as fs } from 'fs';
import { CURATED_ROLEPLAYS } from '../services/staticData';
import {
  registerValidator,
  runAudit
} from '../services/linguisticAudit/index';
import { WorkerOutput } from '../services/linguisticAudit/types';

// Import all validators to register them
import '../services/linguisticAudit/validators/chunkComplianceValidator';
import '../services/linguisticAudit/validators/dialogueFlowValidator';
import '../services/linguisticAudit/validators/alternativesQualityValidator';
import '../services/linguisticAudit/validators/grammarContextValidator';
import '../services/linguisticAudit/validators/contextualSubstitutionValidator';
import '../services/linguisticAudit/validators/blankAnswerPairingValidator';
import '../services/linguisticAudit/validators/ukEnglishSpellingValidator';
import '../services/linguisticAudit/validators/ukEnglishVocabularyValidator';
import '../services/linguisticAudit/validators/contextualRedundancyValidator';

/**
 * Parse command line arguments
 */
function parseArgs(): {
  workerId: number;
  scenarios: string[];
  outputPath: string;
} {
  const args = process.argv.slice(2);
  const result: any = {};

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      if (key === 'scenarios') {
        result.scenarios = value.split(',');
      } else {
        result[key] = value;
      }
    }
  }

  return {
    workerId: parseInt(result.workerId || '0', 10),
    scenarios: result.scenarios || [],
    outputPath: result.outputPath || '/tmp/audit-worker-unknown.json'
  };
}

/**
 * Main worker function
 */
async function runWorker() {
  const startTime = Date.now();
  const { workerId, scenarios: scenarioIds, outputPath } = parseArgs();

  console.error(`Worker ${workerId} starting with ${scenarioIds.length} scenarios`);

  try {
    // Filter scenarios
    const scenariosToValidate = CURATED_ROLEPLAYS.filter(s =>
      scenarioIds.includes(s.id)
    );

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
      scenariosProcessed: scenariosToValidate.map(s => s.id),
      findings: report.autoFixesLog.map(fix => ({
        validatorName: fix.validatorName,
        scenarioId: fix.scenarioId,
        location: fix.location,
        issue: fix.reason,
        currentValue: fix.oldValue,
        suggestedValue: fix.newValue,
        confidence: 0.95, // Default confidence from validators
        reasoning: `Auto-fix: ${fix.reason}`,
        context: ''
      })),
      executionTime,
      errors: [],
      timestamp: new Date().toISOString()
    };

    // Write output JSON
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8');

    console.error(
      `Worker ${workerId} completed: ${output.findings.length} findings in ${executionTime}ms`
    );

    process.exit(0);
  } catch (error) {
    console.error(`Worker ${workerId} error:`, error);

    const errorOutput: WorkerOutput = {
      workerId,
      scenariosProcessed: scenarioIds,
      findings: [],
      executionTime: Date.now() - startTime,
      errors: [{ scenarioId: 'all', error: String(error) }],
      timestamp: new Date().toISOString()
    };

    try {
      await fs.writeFile(outputPath, JSON.stringify(errorOutput, null, 2), 'utf-8');
    } catch {
      console.error(`Failed to write error output to ${outputPath}`);
    }

    process.exit(1);
  }
}

// Run worker
runWorker().catch(err => {
  console.error('Unhandled worker error:', err);
  process.exit(1);
});
