/**
 * Data Corruption Detection Script
 * Detects validator messages embedded in staticData.ts
 * Run before commits to prevent corruption propagation
 */

import { readFileSync } from 'fs';
import * as path from 'path';

const STATIC_DATA_PATH = path.resolve(process.cwd(), 'src/services/staticData.ts');

// Patterns that indicate data corruption
const CORRUPTION_PATTERNS = [
  'Remove one negative or rephrase as positive',
  'Remove one negative',
  'rephrase as positive',
  'CORRUPTION DETECTED',
];

async function detectCorruption(): Promise<void> {
  try {
    const content = readFileSync(STATIC_DATA_PATH, 'utf-8');
    const lines = content.split('\n');

    let foundCorruption = false;
    const issues: Array<{ line: number; pattern: string; context: string }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const pattern of CORRUPTION_PATTERNS) {
        if (line.includes(pattern)) {
          foundCorruption = true;
          issues.push({
            line: i + 1,
            pattern,
            context: line.substring(0, 100)
          });
        }
      }
    }

    if (foundCorruption) {
      console.error('❌ CORRUPTION DETECTED in staticData.ts');
      console.error('');
      issues.forEach(issue => {
        console.error(`   Line ${issue.line}: "${issue.pattern}"`);
        console.error(`   Context: ${issue.context}...`);
        console.error('');
      });
      process.exit(1);
    }

    console.log('✅ Data integrity check passed - no corruption detected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error reading staticData.ts:', error);
    process.exit(1);
  }
}

detectCorruption();
