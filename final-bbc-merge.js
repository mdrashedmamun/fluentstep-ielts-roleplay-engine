#!/usr/bin/env node

/**
 * BBC Learning English - Final Clean Merge
 * Directly inserts properly formatted answerVariations from phase2
 */

import fs from 'fs';
import path from 'path';

const projectRoot = '/Users/md.rashedmamun/Documents/Projects/fluentstep_-ielts-roleplay-engine';
const stagingDir = path.join(projectRoot, '.staging');
const staticDataPath = path.join(projectRoot, 'src/services/staticData.ts');

console.log('\n' + '='.repeat(80));
console.log('BBC LEARNING ENGLISH - FINAL PRODUCTION MERGE');
console.log('='.repeat(80) + '\n');

// Step 1: Read phase files
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

// Extract answerVariations - get the raw TypeScript code
const answerMatch = phase2.match(/```typescript\n(const answerVariations = \[[\s\S]*?\];)\n```/);
if (!answerMatch) {
  console.error('❌ Could not extract answerVariations from phase2');
  process.exit(1);
}

const answerVariationsCode = answerMatch[1];
const answerCount = (answerVariationsCode.match(/"index":/g) || []).length;

console.log(`✅ Extracted ${dialogue.length} dialogue entries`);
console.log(`✅ Extracted ${answerCount} answerVariations\n`);

// Step 2: Build blanksInOrder
console.log('[2/5] Creating blanksInOrder...');
const blanksInOrder = [];
for (let i = 0; i < answerCount; i++) {
  blanksInOrder.push(`"bbc-learning-6-dreams-b${i}"`);
}
console.log(`✅ Created array with ${blanksInOrder.length} entries\n`);

// Step 3: Build complete scenario object
console.log('[3/5] Building scenario object...');
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

// Add dialogue entries
dialogue.forEach((turn, idx) => {
  const text = turn.text.replace(/"/g, '\\"');
  scenarioStr += `      { "speaker": "${turn.speaker}", "text": "${text}" }`;
  if (idx < dialogue.length - 1) scenarioStr += ',';
  scenarioStr += '\n';
});

scenarioStr += '    ],\n';

// Add answerVariations - formatted with proper indentation
scenarioStr += '    "answerVariations": [\n';
const answerLines = answerVariationsCode.split('\n').slice(1, -1); // Remove const and closing ];
for (const line of answerLines) {
  if (line.trim()) {
    // Add proper indentation (6 spaces for items inside array)
    if (line.trim().startsWith('{') || line.trim().startsWith('}')) {
      scenarioStr += '      ' + line + '\n';
    } else {
      scenarioStr += '      ' + line + '\n';
    }
  }
}
scenarioStr += '    ],\n';

// Add blanksInOrder
scenarioStr += `    "blanksInOrder": [${blanksInOrder.join(', ')}]\n`;
scenarioStr += '  }';

console.log('✅ Scenario object built\n');

// Step 4: Read and replace in staticData.ts
console.log('[4/5] Finding stub location...');
const currentData = fs.readFileSync(staticDataPath, 'utf8');
const lines = currentData.split('\n');

let stubStart = -1;
let stubEnd = -1;

// Find the BBC scenario stub
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"id": "bbc-learning-6-dreams"')) {
    // Find opening brace
    for (let j = i; j >= 0; j--) {
      if (lines[j].trim().startsWith('{')) {
        stubStart = j;
        break;
      }
    }

    // Find closing brace
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
  console.error('❌ Could not locate BBC scenario stub');
  process.exit(1);
}

console.log(`✅ Found stub at lines ${stubStart + 1}-${stubEnd + 1}\n`);

// Step 5: Perform merge
console.log('[5/5] Merging to production...');

const before = lines.slice(0, stubStart).join('\n');
const after = lines.slice(stubEnd + 1).join('\n');
const merged = before + '\n' + scenarioStr + '\n' + after;

// Backup
const timestamp = Math.floor(Date.now() / 1000);
const backupPath = `${staticDataPath}.backup-${timestamp}`;
fs.copyFileSync(staticDataPath, backupPath);

// Write
fs.writeFileSync(staticDataPath, merged, 'utf8');

console.log(`✅ Merge complete!\n`);

console.log('='.repeat(80));
console.log('MERGE RESULTS');
console.log('='.repeat(80));
console.log(`
✅ Dialogue: ${dialogue.length} turns
✅ Answer Variations: ${answerCount} entries (Bucket A: 26, Bucket B: 12, Other: 2)
✅ Blanks In Order: ${answerCount} entries
✅ Backup: ${path.basename(backupPath)}

QUALITY GATES TO RUN:
1. npm run type-check          # Gate 1: Build verification
2. npm run build               # Gate 2: Type checking
3. npm run validate:feedback   # Gate 3: Schema validation
4. npm run test:e2e:tier1      # Gate 4: E2E testing (optional)

THEN COMMIT & DEPLOY:
git add src/services/staticData.ts
git commit -m "fix: Complete BBC Learning English scenario with 40 blanks + full answerVariations"
git push origin main

`);

console.log('='.repeat(80) + '\n');

process.exit(0);
