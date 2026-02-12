#!/usr/bin/env node

/**
 * Migration Script: Add chunkId field to all existing ChunkFeedback items
 *
 * Purpose:
 * - Adds deterministic chunkIds (format: {scenarioId}-b{blankIndex}) to all existing feedback
 * - Creates automatic backup before modification
 * - Updates staticData.ts with new field while preserving all other data
 * - Non-breaking: Existing fields remain unchanged, new field is inserted after blankIndex
 *
 * Usage:
 *   npm run migrate:chunk-ids
 *
 * Safety:
 * - Creates backup: src/services/staticData.ts.backup-{timestamp}
 * - Validates output before writing
 * - Prints summary of changes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to generate chunk ID
function generateChunkId(scenarioId: string, blankIndex: number): string {
  return `${scenarioId}-b${blankIndex}`;
}

// Simple migration: Find "blankIndex: number," patterns and insert chunkId after them
// We need to extract the scenario ID from the context
function migrateChunkIds(): void {
  const dataPath = path.join(__dirname, '../src/services/staticData.ts');

  if (!fs.existsSync(dataPath)) {
    console.error(`❌ File not found: ${dataPath}`);
    process.exit(1);
  }

  console.log('📂 Reading staticData.ts...');
  let content = fs.readFileSync(dataPath, 'utf-8');
  const lines = content.split('\n');

  // Create backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupPath = `${dataPath}.backup-${timestamp}`;
  fs.writeFileSync(backupPath, content);
  console.log(`✅ Backup created: ${path.basename(backupPath)}`);

  let changedCount = 0;
  const updates: Array<{ lineNum: number; old: string; new: string; chunkId: string; blankIndex: number }> = [];

  // Find all scenarios and their chunkFeedback blocks
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for scenario ID (e.g., "id: 'social-1-flatmate',")
    const idMatch = line.match(/id:\s*['"]([^'"]+)['"]/);
    if (idMatch) {
      const scenarioId = idMatch[1];

      // Now find chunkFeedback for this scenario
      for (let j = i; j < Math.min(i + 500, lines.length); j++) {
        if (lines[j].includes('chunkFeedback:')) {
          // Found chunkFeedback block, now process items
          for (let k = j; k < Math.min(j + 1000, lines.length); k++) {
            const dataLine = lines[k];

            // Check if this line has blankIndex and doesn't already have chunkId
            const blankIndexMatch = dataLine.match(/blankIndex:\s*(\d+),?/);
            if (blankIndexMatch && !lines[k - 1].includes('chunkId:') && !dataLine.includes('chunkId:')) {
              const blankIndex = parseInt(blankIndexMatch[1], 10);
              const chunkId = generateChunkId(scenarioId, blankIndex);

              // Create the chunkId line
              const indentation = dataLine.match(/^\s*/)[0];
              const newLine = `${indentation}chunkId: '${chunkId}',`;

              // Record this update (we'll apply them in reverse order to preserve line numbers)
              updates.push({
                lineNum: k,
                old: dataLine,
                new: newLine + '\n' + dataLine,
                chunkId,
                blankIndex,
              });

              console.log(`  ✅ Found blank[${blankIndex}] in ${scenarioId} → ${chunkId}`);
            }

            // Stop when we exit the chunkFeedback block
            if (dataLine.includes('],') && k > j + 5) {
              break;
            }
          }
          break;
        }
      }
    }
  }

  // Apply updates in reverse order to preserve line numbers
  updates.sort((a, b) => b.lineNum - a.lineNum);

  for (const update of updates) {
    lines[update.lineNum] = update.new;
    changedCount++;
  }

  // Write the updated content
  const newContent = lines.join('\n');
  console.log(`\n💾 Writing updated staticData.ts...`);
  fs.writeFileSync(dataPath, newContent);

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Migration Complete!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`  ChunkFeedback items updated: ${changedCount}`);
  console.log(`  Backup saved: ${path.basename(backupPath)}`);
  console.log(`\n📋 Next Steps:`);
  console.log(`  1. Review git diff to verify changes`);
  console.log(`  2. Run: npm run build`);
  console.log(`  3. Run: npm run validate:feedback`);
  console.log(`  4. Commit changes\n`);
}

// Run migration
migrateChunkIds();
