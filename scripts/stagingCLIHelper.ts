#!/usr/bin/env node

/**
 * Staging CLI Helper
 *
 * User-friendly commands for managing content staging workflow
 *
 * Commands:
 *   stage:create --id=scenario-1           Create new scenario template
 *   stage:submit --id=scenario-1           Submit for review (in-progress → ready-for-review)
 *   stage:status                           Show all staged scenarios
 *   stage:unlock                           Force release stuck lock (emergency only)
 *   stage:list-ready                       List scenarios ready for review
 *   stage:list-approved                    List approved scenarios
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import {
  getCurrentState,
  printStagingSummary,
  moveScenario,
  getStateFilePath,
  listScenariosInState,
} from './utils/stageStateManager.js';
import { forceReleaseLock } from './utils/fileLocking.js';

const STAGING_BASE = '.staging';
const LOCK_FILE = path.join(STAGING_BASE, '.import.lock');

const writeLine = (message = ''): void => {
  process.stdout.write(`${message}\n`);
};

const writeError = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

const getErrorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

async function handleCommand(command: string, args: Map<string, string>): Promise<void> {
  switch (command) {
    case 'create':
      await createScenario(args.get('id'));
      break;
    case 'submit':
      await submitForReview(args.get('id'));
      break;
    case 'status':
      await printStatus();
      break;
    case 'unlock':
      await forceUnlock();
      break;
    case 'list-ready':
      await listReady();
      break;
    case 'list-approved':
      await listApproved();
      break;
    case 'help':
      printHelp();
      break;
    default:
      writeError(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

async function createScenario(scenarioId?: string): Promise<void> {
  if (!scenarioId) {
    writeError('❌ Scenario ID required: stage:create --id=scenario-1');
    process.exit(1);
  }

  const filePath = getStateFilePath(scenarioId, 'in-progress');

  try {
    // Check if already exists
    await fs.access(filePath);
    writeError(`❌ Scenario already exists: ${scenarioId}`);
    process.exit(1);
  } catch {
    // File doesn't exist, that's good
  }

  // Create template
  const template = `---
category: ""
scenarioId: "${scenarioId}"
topic: ""
context: ""
difficulty: "B2"
---

# Dialogue

[Speaker 1]: [dialogue line]
[Speaker 2]: [dialogue line]

# Answers

Blank 0: [answer option A]
Blank 1: [answer option B]

# V2 Schema

## chunkFeedbackV2

\`\`\`json
{
  "{scenarioId}-b0": {
    "blanksInOrder": ["[answer A]", "[answer B]"],
    "chunkFeedback": {
      "[answer A]": {
        "status": "correct",
        "feedback": "[explanation]"
      },
      "[answer B]": {
        "status": "incorrect",
        "feedback": "[explanation]"
      }
    },
    "patternSummary": {
      "chunk": "[chunk being taught]",
      "context": "[context in this scenario]",
      "commonMistakes": ["[mistake 1]"],
      "keyTakeaway": "[one sentence takeaway]"
    },
    "activeRecall": {
      "question": "[recall question]",
      "expectedAnswer": "[expected answer]",
      "hints": ["[hint 1]"]
    }
  }
}
\`\`\`
`;

  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, template, 'utf-8');

    writeLine(`✅ Created scenario template: ${filePath}`);
    writeLine(`📝 Edit the file to add content, then run: npm run stage:submit --id=${scenarioId}`);
  } catch (error) {
    writeError('❌ Failed to create scenario:', error);
    process.exit(1);
  }
}

async function submitForReview(scenarioId?: string): Promise<void> {
  if (!scenarioId) {
    writeError('❌ Scenario ID required: stage:submit --id=scenario-1');
    process.exit(1);
  }

  try {
    const currentState = await getCurrentState(scenarioId);

    if (!currentState) {
      writeError(`❌ Scenario not found: ${scenarioId}`);
      process.exit(1);
    }

    if (currentState === 'ready-for-review') {
      writeLine(`ℹ️  Scenario already in ready-for-review: ${scenarioId}`);
      writeLine('   Run: npm run stage:validate to start validation');
      return;
    }

    if (currentState === 'in-progress') {
      writeLine(`📤 Submitting ${scenarioId} for review...`);
      await moveScenario(scenarioId, 'in-progress', 'ready-for-review');
      writeLine(`✅ Submitted for review`);
      writeLine('   Next: npm run stage:validate to run validation pipeline');
    } else {
      writeError(`❌ Cannot submit from state: ${currentState}`);
      writeError('   Scenario must be in in-progress state');
      process.exit(1);
    }
  } catch (error) {
    writeError('❌ Failed to submit:', error);
    process.exit(1);
  }
}

async function printStatus(): Promise<void> {
  await printStagingSummary();
}

async function listReady(): Promise<void> {
  const ready = await listScenariosInState('ready-for-review');

  writeLine('\n🔍 SCENARIOS READY FOR REVIEW:');
  writeLine('='.repeat(50));

  if (ready.length === 0) {
    writeLine('(none)');
  } else {
    ready.forEach((s) => writeLine(`  - ${s}`));
  }

  writeLine('');
}

async function listApproved(): Promise<void> {
  const approved = await listScenariosInState('approved');

  writeLine('\n✅ APPROVED SCENARIOS (ready to import):');
  writeLine('='.repeat(50));

  if (approved.length === 0) {
    writeLine('(none)');
  } else {
    approved.forEach((s) => writeLine(`  - ${s}`));
  }

  writeLine('\nRun: npm run stage:import');
  writeLine('');
}

async function forceUnlock(): Promise<void> {
  writeError('⚠️  FORCE UNLOCK - Use only if import process crashed');
  writeError(
    'This should only be used as an emergency measure if a lock is stuck.\n'
  );

  try {
    await forceReleaseLock(LOCK_FILE);
    writeLine('✅ Lock released');
  } catch (error) {
    writeError('❌ Failed to release lock:', error);
    process.exit(1);
  }
}

function printHelp(): void {
  writeLine(`
╔════════════════════════════════════════════════════════════════╗
║              STAGING WORKFLOW - CLI HELPER                     ║
╚════════════════════════════════════════════════════════════════╝

COMMANDS:

  📝 Create new scenario:
     npm run stage:create -- --id=scenario-name

  📤 Submit for review (in-progress → ready-for-review):
     npm run stage:submit -- --id=scenario-name

  🔍 View staging status:
     npm run stage:status

  📋 List scenarios ready for review:
     npm run stage:list-ready

  ✅ List approved scenarios:
     npm run stage:list-approved

  🔓 Force unlock (emergency only):
     npm run stage:unlock

WORKFLOW:

  1. Create scenario:
     npm run stage:create -- --id=my-scenario

  2. Edit content:
     nano .staging/in-progress/my-scenario.md

  3. Submit for validation:
     npm run stage:submit -- --id=my-scenario

  4. Run validation (auto with npm run stage:validate):
     Gate 1: Structural ✓ → Gate 2: Linguistic ✓ → Gate 3: Integration ✓ → Gate 4: QA ✓

  5. Import to app:
     npm run stage:import

For more info, see: .claude/STAGING_WORKFLOW.md
`);
}

// Main
const args = process.argv.slice(2);
const command = args[0] || 'help';

// Parse arguments
const argMap = new Map<string, string>();
for (const arg of args.slice(1)) {
  if (arg.startsWith('--')) {
    const [key, value] = arg.substring(2).split('=');
    argMap.set(key, value || '');
  }
}

handleCommand(command, argMap).catch((error: unknown) => {
  writeError(`❌ Error: ${getErrorMessage(error)}`);
  process.exit(1);
});
