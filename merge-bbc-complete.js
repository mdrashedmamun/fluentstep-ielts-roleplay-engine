#!/usr/bin/env node

/**
 * BBC Learning English Scenario - Complete Production Merge
 * Properly assembles and merges complete scenario to production
 */

import fs from 'fs';
import path from 'path';

const projectRoot = '/Users/md.rashedmamun/Documents/Projects/fluentstep_-ielts-roleplay-engine';
const stagingDir = path.join(projectRoot, '.staging');
const staticDataPath = path.join(projectRoot, 'src/services/staticData.ts');

console.log('\n' + '='.repeat(80));
console.log('BBC LEARNING ENGLISH - COMPLETE PRODUCTION MERGE');
console.log('='.repeat(80) + '\n');

// Read all phase files
console.log('[1/6] Reading phase files...');
const phase1 = fs.readFileSync(path.join(stagingDir, 'bbc-learning-6-dreams-phase1.md'), 'utf8');
const phase2 = fs.readFileSync(path.join(stagingDir, 'bbc-learning-6-dreams-phase2.md'), 'utf8');
console.log('✅ Phase files loaded\n');

// Extract dialogue from phase1
console.log('[2/6] Extracting dialogue...');
const dialogueLines = phase1.split('\n');
const dialogue = [];

for (const line of dialogueLines) {
  if (line.match(/^\*\*[A-Z]+\*\*:/)) {
    const match = line.match(/^\*\*([A-Z]+)\*\*:\s*(.+)$/);
    if (match) {
      dialogue.push({ speaker: match[1], text: match[2] });
    }
  }
}
console.log(`✅ Extracted ${dialogue.length} dialogue entries\n`);

// Extract answerVariations from phase2
console.log('[3/6] Extracting answerVariations...');
const answerMatch = phase2.match(/const answerVariations = \[([\s\S]*?)\];/);
if (!answerMatch) {
  console.error('❌ Could not extract answerVariations');
  process.exit(1);
}

const answerCount = (answerMatch[1].match(/"index":/g) || []).length;
console.log(`✅ Extracted ${answerCount} answerVariations\n`);

// Create blanksInOrder array
console.log('[4/6] Creating blanksInOrder...');
const blanksInOrder = [];
for (let i = 0; i < answerCount; i++) {
  blanksInOrder.push(`"bbc-learning-6-dreams-b${i}"`);
}
console.log(`✅ Created blanksInOrder array (${blanksInOrder.length} entries)\n`);

// Build the complete scenario object
console.log('[5/6] Building complete scenario object...');

const scenarioLines = [];
scenarioLines.push('  {');
scenarioLines.push('    "id": "bbc-learning-6-dreams",');
scenarioLines.push('    "category": "Social",');
scenarioLines.push('    "topic": "Dreams & Life Regrets",');
scenarioLines.push('    "context": "A conversation between two friends about childhood dreams, life regrets, and following your aspirations. Features stories from Daisy (Riverside community) and Herman Zapp (world traveler).",');
scenarioLines.push('    "characters": [');
scenarioLines.push('      { "name": "Alex", "description": "Friend reflecting on life choices." },');
scenarioLines.push('      { "name": "Sam", "description": "Friend sharing stories and insights." }');
scenarioLines.push('    ],');
scenarioLines.push('    "dialogue": [');

// Add dialogue
dialogue.forEach((turn, idx) => {
  const text = turn.text.replace(/"/g, '\\"');
  scenarioLines.push(`      { "speaker": "${turn.speaker}", "text": "${text}" }${idx < dialogue.length - 1 ? ',' : ''}`);
});

scenarioLines.push('    ],');
scenarioLines.push('    "answerVariations": [');

// Add answerVariations - parse and reformat properly
const answerContent = answerMatch[1];
const entries = answerContent.split(/\n\s*\},?\s*\{/);

entries.forEach((entry, idx) => {
  let trimmedEntry = entry.trim();
  if (!trimmedEntry.startsWith('{')) trimmedEntry = '{' + trimmedEntry;
  if (!trimmedEntry.endsWith('}')) trimmedEntry = trimmedEntry + '}';

  // Clean up comments
  trimmedEntry = trimmedEntry.replace(/\/\/.*$/gm, '').trim();

  // Add proper indentation
  const lines = trimmedEntry.split('\n').map(l => '      ' + l.trim());
  scenarioLines.push(lines.join('\n'));

  if (idx < entries.length - 1) {
    scenarioLines[scenarioLines.length - 1] += ',';
  }
});

scenarioLines.push('    ],');
scenarioLines.push(`    "blanksInOrder": [${blanksInOrder.join(', ')}]`);
scenarioLines.push('  }');

const newScenario = scenarioLines.join('\n');
console.log('✅ Scenario object built\n');

// Read current staticData.ts
console.log('[6/6] Merging into production...');
const currentData = fs.readFileSync(staticDataPath, 'utf8');
const lines = currentData.split('\n');

// Find stub location (line with "bbc-learning-6-dreams")
let stubStartLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"id": "bbc-learning-6-dreams"')) {
    stubStartLine = i - 1; // Include the opening brace
    break;
  }
}

if (stubStartLine === -1) {
  console.error('❌ Could not find BBC scenario stub');
  process.exit(1);
}

// Find stub end (next closing brace at same indent level)
let stubEndLine = -1;
let braceCount = 0;
for (let i = stubStartLine; i < lines.length; i++) {
  braceCount += (lines[i].match(/{/g) || []).length - (lines[i].match(/}/g) || []).length;
  if (braceCount === 0 && lines[i].includes('}')) {
    stubEndLine = i;
    break;
  }
}

if (stubEndLine === -1) {
  console.error('❌ Could not find end of BBC scenario stub');
  process.exit(1);
}

// Create backup
const timestamp = Math.floor(Date.now() / 1000);
const backupPath = `${staticDataPath}.backup-${timestamp}`;
fs.copyFileSync(staticDataPath, backupPath);

// Perform merge
const before = lines.slice(0, stubStartLine).join('\n');
const after = lines.slice(stubEndLine + 1).join('\n');
const merged = before + '\n' + newScenario + '\n' + after;

fs.writeFileSync(staticDataPath, merged, 'utf8');

console.log('✅ Merge complete!\n');

console.log('='.repeat(80));
console.log('PRODUCTION MERGE SUCCESSFUL');
console.log('='.repeat(80));
console.log(`
✅ Dialogue: ${dialogue.length} turns
✅ Answer Variations: ${answerCount} entries
✅ Blanks In Order: ${blanksInOrder.length} entries
✅ Backup: ${path.basename(backupPath)}
✅ Merged: lines ${stubStartLine + 1}-${stubStartLine + newScenario.split('\n').length}

NEXT STEPS:
1. Run: npm run type-check
2. Run: npm run build
3. Run: npm run validate:feedback
4. Commit with: git add . && git commit -m "fix: Complete BBC Learning English scenario merge with 40 blanks"
5. Deploy: git push origin main

`);

console.log('='.repeat(80) + '\n');

process.exit(0);
