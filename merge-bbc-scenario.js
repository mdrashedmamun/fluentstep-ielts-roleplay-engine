#!/usr/bin/env node

/**
 * BBC Learning English Scenario - Production Merge Script
 * Assembles complete scenario from staging phase files and merges to staticData.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = '/Users/md.rashedmamun/Documents/Projects/fluentstep_-ielts-roleplay-engine';
const stagingDir = path.join(projectRoot, '.staging');
const staticDataPath = path.join(projectRoot, 'src/services/staticData.ts');

console.log('\n' + '='.repeat(80));
console.log('BBC LEARNING ENGLISH SCENARIO - PRODUCTION MERGE');
console.log('='.repeat(80) + '\n');

// Step 1: Read and extract all phase files
console.log('[1/7] Reading staging files...');

const phase1 = fs.readFileSync(path.join(stagingDir, 'bbc-learning-6-dreams-phase1.md'), 'utf8');
const phase2 = fs.readFileSync(path.join(stagingDir, 'bbc-learning-6-dreams-phase2.md'), 'utf8');
const phase3 = fs.readFileSync(path.join(stagingDir, 'bbc-learning-6-dreams-phase3.md'), 'utf8');
const phase4 = fs.readFileSync(path.join(stagingDir, 'bbc-learning-6-dreams-phase4.md'), 'utf8');
const phase5 = fs.readFileSync(path.join(stagingDir, 'bbc-learning-6-dreams-phase5.md'), 'utf8');

console.log('✅ All phase files loaded\n');

// Step 2: Extract answerVariations from phase2
console.log('[2/7] Extracting answerVariations...');

const answerMatch = phase2.match(/const answerVariations = \[([\s\S]*?)\];/);
if (!answerMatch) {
  console.error('❌ Could not extract answerVariations from phase2');
  process.exit(1);
}

const answerVarCode = `const answerVariations = [${answerMatch[1]}];`;

// Count entries
const answerCount = (answerMatch[1].match(/"index":/g) || []).length;
console.log(`✅ Extracted ${answerCount} answerVariations entries\n`);

// Step 3: Extract dialogue from phase1 and convert to array
console.log('[3/7] Extracting dialogue...');

// Find dialogue lines in phase1 (lines starting with **ALEX**: or **SAM**:)
const dialogueLines = phase1.split('\n');
const dialogue = [];

for (const line of dialogueLines) {
  if (line.match(/^\*\*(ALEX|SAM)\*\*:/)) {
    const match = line.match(/^\*\*([A-Z]+)\*\*:\s*(.+)$/);
    if (match) {
      dialogue.push({
        speaker: match[1],
        text: match[2]
      });
    }
  }
}

console.log(`✅ Extracted ${dialogue.length} dialogue entries\n`);

// Step 4: Read current staticData.ts to find the stub location
console.log('[4/7] Reading current staticData.ts...');

const currentData = fs.readFileSync(staticDataPath, 'utf8');
const lines = currentData.split('\n');

// Find the BBC scenario stub (starts with { "id": "bbc-learning-6-dreams")
let stubStartLine = -1;
let stubEndLine = -1;
let braceCount = 0;
let inBbcScenario = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"id": "bbc-learning-6-dreams"')) {
    stubStartLine = i;
    inBbcScenario = true;
    // Count opening braces from start of line
    const beforeId = lines[i].substring(0, lines[i].indexOf('"id"'));
    braceCount = (beforeId.match(/{/g) || []).length - (beforeId.match(/}/g) || []).length;
  }

  if (inBbcScenario && i > stubStartLine) {
    braceCount += (lines[i].match(/{/g) || []).length - (lines[i].match(/}/g) || []).length;
    if (braceCount === 0 && lines[i].includes('}')) {
      stubEndLine = i;
      break;
    }
  }
}

if (stubStartLine === -1 || stubEndLine === -1) {
  console.error('❌ Could not find BBC scenario stub in staticData.ts');
  process.exit(1);
}

console.log(`✅ Found stub at lines ${stubStartLine + 1}-${stubEndLine + 1}\n`);

// Step 5: Build the complete scenario object
console.log('[5/7] Building complete scenario object...');

// Get blank indices for blanksInOrder array
const blankIndices = [];
for (let i = 0; i < answerCount; i++) {
  blankIndices.push(`bbc-learning-6-dreams-b${i}`);
}

const scenarioObj = {
  id: "bbc-learning-6-dreams",
  category: "Social",
  topic: "Dreams & Life Regrets",
  context: "A conversation between two friends about childhood dreams, life regrets, and following your aspirations. Features stories from Daisy (Riverside community) and Herman Zapp (world traveler).",
  characters: [
    { name: "Alex", description: "Friend reflecting on life choices." },
    { name: "Sam", description: "Friend sharing stories and insights." }
  ],
  dialogue: dialogue,
  answerVariations: null, // Will be replaced with actual code
  blanksInOrder: blankIndices
};

// Convert to TypeScript format with proper indentation
let scenarioStr = '  {\n';
scenarioStr += '    "id": "bbc-learning-6-dreams",\n';
scenarioStr += '    "category": "Social",\n';
scenarioStr += '    "topic": "Dreams & Life Regrets",\n';
scenarioStr += '    "context": "A conversation between two friends about childhood dreams, life regrets, and following your aspirations. Features stories from Daisy (Riverside community) and Herman Zapp (world traveler).",\n';
scenarioStr += '    "characters": [\n';
scenarioStr += '      { "name": "Alex", "description": "Friend reflecting on life choices." },\n';
scenarioStr += '      { "name": "Sam", "description": "Friend sharing stories and insights." }\n';
scenarioStr += '    ],\n';
scenarioStr += '    "dialogue": [\n';

// Add dialogue
dialogue.forEach((turn, idx) => {
  scenarioStr += `      { "speaker": "${turn.speaker}", "text": "${turn.text.replace(/"/g, '\\"')}" }`;
  if (idx < dialogue.length - 1) scenarioStr += ',';
  scenarioStr += '\n';
});

scenarioStr += '    ],\n';
scenarioStr += '    "answerVariations": [\n';

// Add answerVariations - extract from phase2 and format
const answerLines = answerMatch[1].split('\n');
let inFirstEntry = false;
for (let i = 0; i < answerLines.length; i++) {
  const line = answerLines[i];
  if (line.trim().startsWith('{')) {
    inFirstEntry = true;
    scenarioStr += '      ' + line.trim();
  } else if (inFirstEntry) {
    if (line.trim() === '' && answerLines[i + 1] && answerLines[i + 1].trim().startsWith('//')) {
      scenarioStr += '\n';
    } else if (line.trim() === '' && answerLines[i + 1] && answerLines[i + 1].trim().startsWith('{')) {
      scenarioStr += '\n      ';
    } else if (line.trim() !== '') {
      scenarioStr += '\n      ' + line.trim();
    }
  }
}

scenarioStr += '\n    ],\n';
scenarioStr += `    "blanksInOrder": [${blankIndices.map(id => `"${id}"`).join(', ')}]\n`;
scenarioStr += '  }';

console.log('✅ Scenario object built\n');

// Step 6: Create backup
console.log('[6/7] Creating backup...');

const timestamp = Math.floor(Date.now() / 1000);
const backupPath = `${staticDataPath}.backup-${timestamp}`;
fs.copyFileSync(staticDataPath, backupPath);

console.log(`✅ Backup created: staticData.ts.backup-${timestamp}\n`);

// Step 7: Perform merge
console.log('[7/7] Merging complete scenario...');

const before = lines.slice(0, stubStartLine - 1).join('\n');
const after = lines.slice(stubEndLine + 1).join('\n');
const merged = before + '\n' + scenarioStr + '\n' + after;

fs.writeFileSync(staticDataPath, merged, 'utf8');

console.log('✅ Merge complete!\n');

console.log('='.repeat(80));
console.log('MERGE SUMMARY');
console.log('='.repeat(80));
console.log(`
✅ Dialogue: ${dialogue.length} entries
✅ Answer Variations: ${answerCount} entries
✅ Blanks In Order: ${blankIndices.length} entries
✅ Characters: 2 (Alex & Sam)
✅ Backup: staticData.ts.backup-${timestamp}
✅ Merged: src/services/staticData.ts (lines ${stubStartLine + 1}-${stubStartLine + 1 + scenarioStr.split('\n').length})

NEXT STEPS:
1. Run: npm run type-check
2. Run: npm run build
3. Run: npm run validate:feedback
4. Commit: git add -A && git commit -m "fix: Complete BBC Learning English scenario merge with 40 blanks"
5. Deploy: git push origin main

`);

console.log('='.repeat(80) + '\n');

process.exit(0);
