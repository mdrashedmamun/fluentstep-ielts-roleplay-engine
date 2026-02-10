/**
 * Audit Orchestrator - Parallel Multi-Agent Architecture
 * Coordinates worker processes, consolidates results, and applies fixes
 */

import { fork } from 'child_process';
import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import * as path from 'path';
import { CURATED_ROLEPLAYS } from '../services/staticData';
import { WorkerTask, WorkerOutput } from '../services/linguisticAudit/types';
import { consolidateFindings, calculateConsolidationStats, generateConsolidationReport } from '../services/linguisticAudit/consolidator';
import { resolveConflicts, generateConflictLog } from '../services/linguisticAudit/conflictResolver';
import { persistFixes, generatePersistenceReport } from '../services/linguisticAudit/persistence';

const TEMP_DIR = '/tmp';
const PHASE_CONFIG = {
  1: { categories: ['Advanced', 'Workplace'], name: 'Phase 1: High-Risk' },
  2: { categories: ['Service/Logistics', 'Social'], name: 'Phase 2: Medium-Risk' },
  3: { categories: ['Academic', 'Healthcare', 'Cultural', 'Community'], name: 'Phase 3: Low-Risk' }
};

/**
 * Parse command line arguments
 */
function parseArgs(): {
  phase?: number;
  scenarios?: string[];
  workers: number;
  dryRun: boolean;
} {
  const args = process.argv.slice(2);
  const result: any = { workers: 6, dryRun: false };

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      if (key === 'phase') {
        result.phase = parseInt(value, 10);
      } else if (key === 'scenarios') {
        result.scenarios = value.split(',');
      } else if (key === 'workers') {
        result.workers = parseInt(value, 10);
      } else if (key === 'dry-run') {
        result.dryRun = true;
      }
    }
  }

  return result;
}

/**
 * Get scenarios for a phase or specific list
 */
function getScenarios(
  phase?: number,
  specificIds?: string[]
): string[] {
  if (specificIds && specificIds.length > 0) {
    return specificIds;
  }

  if (phase && phase in PHASE_CONFIG) {
    const config = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG];
    return CURATED_ROLEPLAYS.filter(s =>
      config.categories.includes(s.category)
    ).map(s => s.id);
  }

  return CURATED_ROLEPLAYS.map(s => s.id);
}

/**
 * Distribute scenarios evenly across workers
 */
function distributeScenarios(
  scenarioIds: string[],
  numWorkers: number
): string[][] {
  const distribution: string[][] = Array(numWorkers)
    .fill(null)
    .map(() => []);

  scenarioIds.forEach((id, index) => {
    distribution[index % numWorkers].push(id);
  });

  return distribution;
}

/**
 * Run a worker process
 */
function runWorker(task: WorkerTask): Promise<WorkerOutput> {
  return new Promise((resolve, reject) => {
    const workerScript = path.resolve(process.cwd(), 'cli/auditWorker.ts');
    const timeoutMs = 15 * 60 * 1000; // 15 minutes

    const worker = fork(workerScript, [], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      env: { ...process.env, NODE_ENV: 'production' }
    });

    const timeout = setTimeout(() => {
      worker.kill();
      reject(new Error(`Worker ${task.workerId} timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    worker.on('exit', async code => {
      clearTimeout(timeout);

      try {
        if (!(await fileExists(task.outputPath))) {
          reject(
            new Error(
              `Worker ${task.workerId} output file not created: ${task.outputPath}`
            )
          );
          return;
        }

        const content = await fs.readFile(task.outputPath, 'utf-8');
        const output: WorkerOutput = JSON.parse(content);
        resolve(output);
      } catch (error) {
        reject(
          new Error(
            `Failed to read worker ${task.workerId} output: ${error}`
          )
        );
      }
    });

    worker.on('error', error => {
      clearTimeout(timeout);
      reject(error);
    });

    // Send task to worker
    worker.send({
      workerId: task.workerId,
      scenarios: task.scenarios,
      outputPath: task.outputPath
    });

    // Also pass as command line args
    const scenariosArg = task.scenarios.join(',');
    worker.disconnect();
  });
}

/**
 * Check if file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Print header
 */
function printHeader(title: string) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Main orchestrator function
 */
async function main() {
  const args = parseArgs();
  const scenarioIds = getScenarios(args.phase, args.scenarios);
  const numWorkers = Math.min(args.workers, scenarioIds.length);

  printHeader(`Parallel Audit Orchestrator - ${scenarioIds.length} scenarios, ${numWorkers} workers`);

  try {
    // Pre-flight checks
    console.log('📋 Pre-flight checks...');
    try {
      execSync('npm run build', { stdio: 'pipe' });
      console.log('  ✓ Build succeeds');
    } catch {
      console.error('  ✗ Build failed');
      process.exit(1);
    }

    // Create git tag
    try {
      execSync(`git tag audit-phase1-start`, { stdio: 'pipe' });
      console.log('  ✓ Git tag created: audit-phase1-start');
    } catch {
      console.log('  ℹ Git tag already exists (continuing...)');
    }

    // Distribute scenarios
    console.log(`\n🔄 Distributing scenarios across ${numWorkers} workers...`);
    const distribution = distributeScenarios(scenarioIds, numWorkers);
    const tasks: WorkerTask[] = distribution.map((scenarios, index) => ({
      workerId: index,
      scenarios,
      outputPath: path.join(TEMP_DIR, `audit-worker-${index}.json`)
    }));

    distribution.forEach((scenarios, index) => {
      console.log(
        `  Worker ${index}: ${scenarios.length} scenarios`
      );
    });

    // Run workers in parallel
    console.log(`\n⚙️  Running ${numWorkers} workers in parallel...`);
    const startTime = Date.now();

    const workerPromises = tasks.map((task, index) => {
      console.log(`  Starting worker ${index}...`);

      // Run worker as child process
      return new Promise<WorkerOutput>(resolve => {
        const workerScript = path.resolve(
          process.cwd(),
          'cli/auditWorker.ts'
        );
        const args = [
          `--worker-id=${task.workerId}`,
          `--scenarios=${task.scenarios.join(',')}`,
          `--output-path=${task.outputPath}`
        ];

        const child = require('child_process').spawn('tsx', [workerScript, ...args], {
          stdio: ['ignore', 'pipe', 'pipe']
        });

        let timeout: NodeJS.Timeout;

        const cleanup = async () => {
          clearTimeout(timeout);

          try {
            if (await fileExists(task.outputPath)) {
              const content = await fs.readFile(task.outputPath, 'utf-8');
              const output = JSON.parse(content);
              resolve(output);
            } else {
              resolve({
                workerId: task.workerId,
                scenariosProcessed: [],
                findings: [],
                executionTime: 0,
                errors: [{ scenarioId: 'all', error: 'Output file not created' }],
                timestamp: new Date().toISOString()
              });
            }
          } catch (error) {
            resolve({
              workerId: task.workerId,
              scenariosProcessed: [],
              findings: [],
              executionTime: 0,
              errors: [{ scenarioId: 'all', error: String(error) }],
              timestamp: new Date().toISOString()
            });
          }
        };

        timeout = setTimeout(() => {
          child.kill();
          cleanup();
        }, 15 * 60 * 1000);

        child.on('exit', cleanup);
      });
    });

    const workerOutputs = await Promise.all(workerPromises);
    const orchestrationTime = Date.now() - startTime;

    console.log(
      `  ✓ All workers completed in ${(orchestrationTime / 1000).toFixed(1)}s`
    );

    // Consolidate results
    console.log(`\n🔗 Consolidating findings from ${workerOutputs.length} workers...`);
    const consolidated = consolidateFindings(workerOutputs);
    const stats = calculateConsolidationStats(workerOutputs, consolidated);

    console.log(generateConsolidationReport(stats));

    // Resolve conflicts
    if (stats.conflictsDetected > 0) {
      console.log(`\n⚖️  Resolving ${stats.conflictsDetected} conflicts...`);
      resolveConflicts(consolidated);
      console.log(generateConflictLog(consolidated));
    }

    // Persist fixes
    if (!args.dryRun && consolidated.length > 0) {
      console.log(`\n💾 Persisting ${consolidated.length} findings...`);
      const persistResult = await persistFixes(consolidated, args.dryRun);
      console.log(generatePersistenceReport(persistResult));

      if (persistResult.applied > 0) {
        // Verify build still works
        console.log('\n🔨 Verifying build after fixes...');
        try {
          execSync('npm run build', { stdio: 'pipe' });
          console.log('  ✓ Build succeeds after fixes');

          // Git commit
          console.log('\n📦 Creating git commit...');
          const commitMsg = `audit: Phase 1 - Apply ${persistResult.applied} fixes to ${scenarioIds.length} scenarios

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>`;

          execSync('git add services/staticData.ts', { stdio: 'pipe' });
          execSync(`git commit -m "${commitMsg}"`, { stdio: 'pipe' });
          console.log('  ✓ Git commit created');
        } catch (error) {
          console.error('  ✗ Build verification or git commit failed');
          process.exit(1);
        }
      }
    } else if (args.dryRun) {
      console.log('\n📋 Dry-run mode: No changes applied');
    }

    // Summary
    printHeader('Audit Summary');
    console.log(`Scenarios processed: ${scenarioIds.length}`);
    console.log(`Workers: ${numWorkers}`);
    console.log(`Total findings: ${stats.totalFindingsFromWorkers}`);
    console.log(`Unique findings: ${stats.uniqueFindingsAfterDedup}`);
    console.log(`Conflicts resolved: ${stats.conflictsDetected}`);
    console.log(`Execution time: ${(orchestrationTime / 1000).toFixed(1)}s\n`);
  } catch (error) {
    console.error('\n❌ Orchestrator error:', error);
    process.exit(1);
  }
}

main();
