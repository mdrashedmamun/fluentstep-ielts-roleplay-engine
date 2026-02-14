#!/usr/bin/env node

/**
 * BBC Learning English - Corrected Schema Merge
 * Removes chunkId from answerVariations, fixes blanksInOrder structure
 */

import fs from 'fs';
import path from 'path';

const projectRoot = '/Users/md.rashedmamun/Documents/Projects/fluentstep_-ielts-roleplay-engine';
const stagingDir = path.join(projectRoot, '.staging');
const staticDataPath = path.join(projectRoot, 'src/services/staticData.ts');

console.log('\n' + '='.repeat(80));
console.log('BBC LEARNING ENGLISH - SCHEMA CORRECTION');
console.log('='.repeat(80) + '\n');

// Read phase files
console.log('[1/5] Reading phase files...');
const phase1 = fs.readFileSync(path.join(stagingDir, 'bbc-learning-6-dreams-phase1.md'), 'utf8');
const phase2 = fs.readFileSync(path.join(stagingDir, 'bbc-learning-6-dreams-phase2.md'), 'utf8');

// Extract dialogue
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

// Extract answerVariations
const answerMatch = phase2.match(/```typescript\n(const answerVariations = \[[\s\S]*?\];)\n```/);
if (!answerMatch) {
  console.error('❌ Could not extract answerVariations');
  process.exit(1);
}

const answerCount = (answerMatch[1].match(/"index":/g) || []).length;

console.log(`✅ Extracted ${dialogue.length} dialogue entries`);
console.log(`✅ Extracted ${answerCount} answerVariations\n`);

// Build scenario
console.log('[2/5] Building scenario object...');
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
  const text = turn.text.replace(/"/g, '\\"');
  scenarioStr += `      { "speaker": "${turn.speaker}", "text": "${text}" }`;
  if (idx < dialogue.length - 1) scenarioStr += ',';
  scenarioStr += '\n';
});

scenarioStr += '    ],\n';
scenarioStr += '    "answerVariations": [\n';

// Process answerVariations - remove chunkId and chunkType
const answerCode = answerMatch[1];
const answerLines = answerCode.split('\n').slice(1, -1); // Remove const and closing ];

// Parse and reformat - remove chunkId and chunkType
let inEntry = false;
let currentEntry = '';
const cleanedLines = [];

for (const line of answerLines) {
  const trimmed = line.trim();

  // Skip empty lines and comments
  if (!trimmed || trimmed.startsWith('//')) {
    continue;
  }

  // Check if this is a chunkId or chunkType line - skip them
  if (trimmed.includes('"chunkId"') || trimmed.includes('"chunkType"')) {
    // Remove the comma from previous line if needed
    if (currentEntry.endsWith(',\n')) {
      currentEntry = currentEntry.slice(0, -2) + '\n';
    } else if (currentEntry.endsWith(',')) {
      currentEntry = currentEntry.slice(0, -1);
    }
    continue;
  }

  // Add the line
  if (trimmed === '},' || trimmed === '}') {
    currentEntry += line + '\n';
    cleanedLines.push(currentEntry);
    currentEntry = '';
  } else {
    currentEntry += line + '\n';
  }
}

// Add cleaned lines to scenario
for (let i = 0; i < cleanedLines.length; i++) {
  const entry = cleanedLines[i];
  // Ensure proper indentation
  const indented = entry.split('\n').map(l => (l.trim() ? '      ' + l.trim() : '')).filter(l => l).join('\n');
  scenarioStr += indented;
  if (i < cleanedLines.length - 1) {
    scenarioStr += ',\n';
  } else {
    scenarioStr += '\n';
  }
}

scenarioStr += '    ],\n';

// Add blanksInOrder as proper BlankMapping objects
scenarioStr += '    "blanksInOrder": [\n';
for (let i = 0; i < answerCount; i++) {
  scenarioStr += `      { "blankId": "bbc-learning-6-dreams-b${i}", "chunkId": "bbc-learning-6-dreams-b${i}" }`;
  if (i < answerCount - 1) scenarioStr += ',';
  scenarioStr += '\n';
}
scenarioStr += '    ]\n';
scenarioStr += '  }';

console.log('✅ Scenario object built\n');

// Read current data
console.log('[3/5] Finding stub location...');
const currentData = fs.readFileSync(staticDataPath, 'utf8');
const lines = currentData.split('\n');

let stubStart = -1;
let stubEnd = -1;

// Find BBC scenario
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"id": "bbc-learning-6-dreams"')) {
    for (let j = i; j >= 0; j--) {
      if (lines[j].trim().startsWith('{')) {
        stubStart = j;
        break;
      }
    }

    let braceCount = 0;
    let foundStart = false;
    for (let j = stubStart; j < lines.length; j++) {
      if (lines[j].includes('{')) {
        braceCount += (lines[j].match(/{/g) || []).length;
        foundStart = true;
      }
      if (foundStart && lines[j].includes('}')) {
        braceCount -= (lines[j].match(/}/g) || []).length;
      }
      if (foundStart && braceCount === 0 && lines[j].includes('}')) {
        stubEnd = j;
        break;
      }
    }
    break;
  }
}

if (stubStart === -1 || stubEnd === -1) {
  console.error('❌ Could not find BBC stub');
  process.exit(1);
}

console.log(`✅ Found stub at lines ${stubStart + 1}-${stubEnd + 1}\n`);

// Merge
console.log('[4/5] Merging to production...');
const before = lines.slice(0, stubStart).join('\n');
const after = lines.slice(stubEnd + 1).join('\n');
const merged = before + '\n' + scenarioStr + '\n' + after;

const timestamp = Math.floor(Date.now() / 1000);
const backupPath = `${staticDataPath}.backup-${timestamp}`;
fs.copyFileSync(staticDataPath, backupPath);

fs.writeFileSync(staticDataPath, merged, 'utf8');
console.log('✅ Merge complete!\n');

console.log('[5/5] Verifying merge...');
const finalData = fs.readFileSync(staticDataPath, 'utf8');
if (finalData.includes('"id": "bbc-learning-6-dreams"') && finalData.includes('"blanksInOrder"')) {
  console.log('✅ Verification passed!\n');
} else {
  console.error('❌ Verification failed');
  process.exit(1);
}

console.log('='.repeat(80));
console.log('BBC SCENARIO MERGE CORRECTED');
console.log('='.repeat(80));
console.log(`
✅ Dialogue: ${dialogue.length} turns
✅ Answer Variations: ${answerCount} entries (schema corrected)
✅ Blanks In Order: ${answerCount} BlankMapping objects (schema corrected)
✅ Backup: ${path.basename(backupPath)}

NEXT: Run type-check to verify TypeScript compilation
  npm run type-check

`);

console.log('='.repeat(80) + '\n');

process.exit(0);
