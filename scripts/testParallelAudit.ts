/**
 * Test suite for parallel audit architecture components
 */

import { consolidateFindings, calculateConsolidationStats } from '../src/services/linguisticAudit/consolidator';
import { resolveConflicts } from '../src/services/linguisticAudit/conflictResolver';
import { WorkerOutput, ConsolidatedFinding } from '../src/services/linguisticAudit/types';

const writeLine = (message = ''): void => {
  process.stdout.write(`${message}\n`);
};

const writeError = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

const getErrorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

// Mock worker outputs for testing
const mockWorkerOutput1: WorkerOutput = {
  workerId: 0,
  scenariosProcessed: ['advanced-1', 'advanced-2'],
  findings: [
    {
      validatorName: 'Grammar Context',
      scenarioId: 'advanced-1',
      location: 'answerVariations[0]!.answer',
      issue: 'Redundancy',
      currentValue: 'quite quite clear',
      suggestedValue: 'quite clear',
      confidence: 0.98,
      reasoning: 'Word repeated consecutively',
      context: 'This is quite quite clear'
    },
    {
      validatorName: 'UK English Spelling',
      scenarioId: 'advanced-2',
      location: 'dialogue[5]!.text',
      issue: 'American spelling',
      currentValue: 'color',
      suggestedValue: 'colour',
      confidence: 1.0,
      reasoning: 'British English requires "colour"',
      context: 'The color of the sky'
    }
  ],
  executionTime: 2500,
  errors: [],
  timestamp: new Date().toISOString()
};

const mockWorkerOutput2: WorkerOutput = {
  workerId: 1,
  scenariosProcessed: ['advanced-1', 'advanced-3'],
  findings: [
    {
      validatorName: 'Grammar Context',
      scenarioId: 'advanced-1',
      location: 'answerVariations[0]!.answer',
      issue: 'Redundancy',
      currentValue: 'quite quite clear',
      suggestedValue: 'quite clear',
      confidence: 0.98,
      reasoning: 'Word repeated consecutively',
      context: 'This is quite quite clear'
    },
    {
      validatorName: 'Contextual Substitution',
      scenarioId: 'advanced-3',
      location: 'answerVariations[2]!.answer',
      issue: 'Contextual mismatch',
      currentValue: 'walk',
      suggestedValue: 'stroll',
      confidence: 0.85,
      reasoning: 'Better fit for conversational context',
      context: 'I like to walk in the park'
    }
  ],
  executionTime: 2300,
  errors: [],
  timestamp: new Date().toISOString()
};

const mockWorkerOutput3: WorkerOutput = {
  workerId: 2,
  scenariosProcessed: ['advanced-3'],
  findings: [
    {
      validatorName: 'Contextual Substitution',
      scenarioId: 'advanced-3',
      location: 'answerVariations[2]!.answer',
      issue: 'Contextual mismatch',
      currentValue: 'walk',
      suggestedValue: 'wander',
      confidence: 0.90,
      reasoning: 'Even better fit for context',
      context: 'I like to walk in the park'
    }
  ],
  executionTime: 1800,
  errors: [],
  timestamp: new Date().toISOString()
};

/**
 * Test consolidation
 */
function testConsolidation() {
  writeLine('\n✓ Testing Consolidation...\n');

  const workerOutputs = [mockWorkerOutput1, mockWorkerOutput2, mockWorkerOutput3];
  const consolidated = consolidateFindings(workerOutputs);
  const stats = calculateConsolidationStats(workerOutputs, consolidated);

  writeLine(`  Total findings from workers: ${stats.totalFindingsFromWorkers}`);
  writeLine(`  Unique findings after dedup: ${stats.uniqueFindingsAfterDedup}`);
  writeLine(`  Duplicates removed: ${stats.duplicatesRemoved}`);
  writeLine(`  Conflicts detected: ${stats.conflictsDetected}`);
  writeLine(`  Agreement rate: ${stats.agreementRate.toFixed(1)}%`);

  // Verify results
  // 5 total findings from 3 workers:
  // - Worker 0: 2 findings
  // - Worker 1: 2 findings (one duplicate of worker 0's first finding)
  // - Worker 2: 1 finding (conflicts with worker 1's finding on same location)
  // = 3 unique findings after dedup, 2 duplicates removed
  if (stats.duplicatesRemoved !== 2) {
    throw new Error(`Expected 2 duplicates, got ${stats.duplicatesRemoved}`);
  }
  if (stats.conflictsDetected !== 1) {
    throw new Error(`Expected 1 conflict, got ${stats.conflictsDetected}`);
  }

  writeLine('\n✅ Consolidation test passed!\n');

  return consolidated;
}

/**
 * Test conflict resolution
 */
function testConflictResolution(consolidated: ConsolidatedFinding[]) {
  writeLine('✓ Testing Conflict Resolution...\n');

  const resolved = resolveConflicts([...consolidated]);

  const conflictFinding = resolved.find(f => f.conflict);
  if (!conflictFinding) {
    throw new Error('Expected to find a conflict');
  }

  writeLine(`  Conflict at: ${conflictFinding.scenarioId}/${conflictFinding.location}`);
  writeLine(
    `  Alternatives: ${conflictFinding.conflict!.alternatives
      .map(alt => `"${alt.suggestedValue}" (${(alt.confidence * 100).toFixed(0)}%)`)
      .join(', ')}`
  );
  writeLine(`  Winner: "${conflictFinding.suggestedValue}"`);

  // Verify highest confidence wins
  const highest = conflictFinding.conflict!.alternatives.reduce((a, b) =>
    a.confidence > b.confidence ? a : b
  );

  if (conflictFinding.suggestedValue !== highest.suggestedValue) {
    throw new Error('Highest confidence fix should win');
  }

  writeLine('\n✅ Conflict resolution test passed!\n');
}

/**
 * Run all tests
 */
function runTests(): void {
  writeLine('🧪 Parallel Audit Architecture Test Suite\n');
  writeLine('='.repeat(50) + '\n');

  try {
    const consolidated = testConsolidation();
    testConflictResolution(consolidated);

    writeLine('='.repeat(50));
    writeLine('\n✅ All tests passed!\n');
    process.exit(0);
  } catch (error) {
    writeError(`\n❌ Test failed: ${getErrorMessage(error)}`);
    process.exit(1);
  }
}

runTests();
