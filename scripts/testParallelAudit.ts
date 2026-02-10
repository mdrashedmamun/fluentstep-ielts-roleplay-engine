/**
 * Test suite for parallel audit architecture components
 */

import { consolidateFindings, calculateConsolidationStats } from '../services/linguisticAudit/consolidator';
import { resolveConflicts, generateConflictLog } from '../services/linguisticAudit/conflictResolver';
import { WorkerOutput, ConsolidatedFinding } from '../services/linguisticAudit/types';

// Mock worker outputs for testing
const mockWorkerOutput1: WorkerOutput = {
  workerId: 0,
  scenariosProcessed: ['advanced-1', 'advanced-2'],
  findings: [
    {
      validatorName: 'Grammar Context',
      scenarioId: 'advanced-1',
      location: 'answerVariations[0].answer',
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
      location: 'dialogue[5].text',
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
      location: 'answerVariations[0].answer',
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
      location: 'answerVariations[2].answer',
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
      location: 'answerVariations[2].answer',
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
  console.log('\n✓ Testing Consolidation...\n');

  const workerOutputs = [mockWorkerOutput1, mockWorkerOutput2, mockWorkerOutput3];
  const consolidated = consolidateFindings(workerOutputs);
  const stats = calculateConsolidationStats(workerOutputs, consolidated);

  console.log(`  Total findings from workers: ${stats.totalFindingsFromWorkers}`);
  console.log(`  Unique findings after dedup: ${stats.uniqueFindingsAfterDedup}`);
  console.log(`  Duplicates removed: ${stats.duplicatesRemoved}`);
  console.log(`  Conflicts detected: ${stats.conflictsDetected}`);
  console.log(`  Agreement rate: ${stats.agreementRate.toFixed(1)}%`);

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

  console.log('\n✅ Consolidation test passed!\n');

  return consolidated;
}

/**
 * Test conflict resolution
 */
function testConflictResolution(consolidated: ConsolidatedFinding[]) {
  console.log('✓ Testing Conflict Resolution...\n');

  const resolved = resolveConflicts([...consolidated]);

  const conflictFinding = resolved.find(f => f.conflict);
  if (!conflictFinding) {
    throw new Error('Expected to find a conflict');
  }

  console.log(`  Conflict at: ${conflictFinding.scenarioId}/${conflictFinding.location}`);
  console.log(
    `  Alternatives: ${conflictFinding.conflict!.alternatives
      .map(alt => `"${alt.suggestedValue}" (${(alt.confidence * 100).toFixed(0)}%)`)
      .join(', ')}`
  );
  console.log(`  Winner: "${conflictFinding.suggestedValue}"`);

  // Verify highest confidence wins
  const highest = conflictFinding.conflict!.alternatives.reduce((a, b) =>
    a.confidence > b.confidence ? a : b
  );

  if (conflictFinding.suggestedValue !== highest.suggestedValue) {
    throw new Error('Highest confidence fix should win');
  }

  console.log('\n✅ Conflict resolution test passed!\n');
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Parallel Audit Architecture Test Suite\n');
  console.log('='.repeat(50) + '\n');

  try {
    const consolidated = testConsolidation();
    testConflictResolution(consolidated);

    console.log('='.repeat(50));
    console.log('\n✅ All tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
