import { promises as fs } from 'fs';
import * as path from 'path';

export type StagingState =
  | 'in-progress'
  | 'ready-for-review'
  | 'approved'
  | 'rejected'
  | 'archived';

const STAGING_BASE = '.staging';

interface StateTransition {
  from: StagingState;
  to: StagingState;
  requiresValidation?: boolean;
  reversible?: boolean;
}

/**
 * Define allowed state transitions
 */
const ALLOWED_TRANSITIONS: StateTransition[] = [
  { from: 'in-progress', to: 'ready-for-review', reversible: true },
  { from: 'ready-for-review', to: 'approved', requiresValidation: true },
  { from: 'ready-for-review', to: 'rejected', requiresValidation: true },
  { from: 'rejected', to: 'ready-for-review', reversible: true },
  { from: 'approved', to: 'archived' },
];

/**
 * Get file path for a scenario in a given state
 */
export function getStateFilePath(scenarioId: string, state: StagingState): string {
  return path.join(STAGING_BASE, state, `${scenarioId}.md`);
}

/**
 * Get validation report path for a scenario
 */
export function getValidationReportPath(scenarioId: string, state: StagingState): string {
  return path.join(STAGING_BASE, state, `${scenarioId}-validation-report.json`);
}

/**
 * Get current state of a scenario
 */
export async function getCurrentState(scenarioId: string): Promise<StagingState | null> {
  const states: StagingState[] = ['in-progress', 'ready-for-review', 'approved', 'rejected', 'archived'];

  for (const state of states) {
    const filePath = getStateFilePath(scenarioId, state);
    try {
      await fs.access(filePath);
      return state;
    } catch {
      // File not found in this state
    }
  }

  return null;
}

/**
 * Check if a state transition is allowed
 */
export function isTransitionAllowed(from: StagingState, to: StagingState): boolean {
  return ALLOWED_TRANSITIONS.some((t) => t.from === from && t.to === to);
}

/**
 * Move a scenario between states
 */
export async function moveScenario(
  scenarioId: string,
  fromState: StagingState,
  toState: StagingState
): Promise<void> {
  // Validate transition
  if (!isTransitionAllowed(fromState, toState)) {
    throw new Error(
      `❌ Invalid state transition: ${fromState} → ${toState}\n` +
        `Allowed transitions:\n` +
        `  in-progress → ready-for-review\n` +
        `  ready-for-review → approved\n` +
        `  ready-for-review → rejected\n` +
        `  rejected → ready-for-review\n` +
        `  approved → archived`
    );
  }

  const fromPath = getStateFilePath(scenarioId, fromState);
  const toPath = getStateFilePath(scenarioId, toState);

  try {
    console.log(`🔄 Moving ${scenarioId}: ${fromState} → ${toState}`);

    // Ensure target directory exists
    await fs.mkdir(path.dirname(toPath), { recursive: true });

    // Read source file
    const content = await fs.readFile(fromPath, 'utf-8');

    // Write to target
    await fs.writeFile(toPath, content, 'utf-8');

    // Delete from source
    await fs.unlink(fromPath);

    console.log(`✅ Scenario moved successfully`);
  } catch (error) {
    console.error(`❌ Failed to move scenario:`, error);
    throw error;
  }
}

/**
 * Copy validation report between states
 */
export async function copyValidationReport(
  scenarioId: string,
  fromState: StagingState,
  toState: StagingState
): Promise<void> {
  const fromReportPath = getValidationReportPath(scenarioId, fromState);
  const toReportPath = getValidationReportPath(scenarioId, toState);

  try {
    const content = await fs.readFile(fromReportPath, 'utf-8');
    await fs.mkdir(path.dirname(toReportPath), { recursive: true });
    await fs.writeFile(toReportPath, content, 'utf-8');
  } catch (error) {
    // Report may not exist, that's okay
    console.warn(`⚠️  Could not copy validation report: ${error}`);
  }
}

/**
 * List all scenarios in a given state
 */
export async function listScenariosInState(state: StagingState): Promise<string[]> {
  try {
    const dirPath = path.join(STAGING_BASE, state);
    const files = await fs.readdir(dirPath);

    return files
      .filter((f) => f.endsWith('.md') && !f.startsWith('.'))
      .map((f) => f.replace('.md', ''));
  } catch (error) {
    // Directory doesn't exist or is empty
    return [];
  }
}

/**
 * Get summary of all staged scenarios
 */
export async function getStagingSummary(): Promise<{
  [key in StagingState]: string[];
}> {
  const states: StagingState[] = ['in-progress', 'ready-for-review', 'approved', 'rejected', 'archived'];
  const summary: { [key in StagingState]: string[] } = {
    'in-progress': [],
    'ready-for-review': [],
    approved: [],
    rejected: [],
    archived: [],
  };

  for (const state of states) {
    summary[state] = await listScenariosInState(state);
  }

  return summary;
}

/**
 * Print staging summary in a readable format
 */
export async function printStagingSummary(): Promise<void> {
  const summary = await getStagingSummary();

  console.log('\n' + '='.repeat(70));
  console.log('📊 STAGING WORKFLOW SUMMARY');
  console.log('='.repeat(70));

  const states: StagingState[] = ['in-progress', 'ready-for-review', 'approved', 'rejected', 'archived'];

  for (const state of states) {
    const scenarios = summary[state];
    const icon =
      state === 'in-progress'
        ? '✏️'
        : state === 'ready-for-review'
          ? '🔍'
          : state === 'approved'
            ? '✅'
            : state === 'rejected'
              ? '❌'
              : '📦';

    console.log(`\n${icon} ${state.toUpperCase()}: ${scenarios.length} scenario(s)`);

    if (scenarios.length > 0) {
      scenarios.forEach((s) => console.log(`   - ${s}`));
    }
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

/**
 * Delete a scenario from staging (for cleanup)
 */
export async function deleteScenariosFromStaging(
  scenarioId: string,
  allStates: boolean = false
): Promise<void> {
  const states: StagingState[] = allStates
    ? ['in-progress', 'ready-for-review', 'approved', 'rejected', 'archived']
    : [await getCurrentState(scenarioId)] .filter(Boolean) as StagingState[];

  for (const state of states) {
    const filePath = getStateFilePath(scenarioId, state);
    try {
      await fs.unlink(filePath);
      console.log(`🗑️  Deleted ${scenarioId} from ${state}`);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.warn(`⚠️  Could not delete from ${state}:`, error);
      }
    }
  }
}
