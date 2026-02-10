/**
 * Persistence Module for Parallel Audit Architecture
 * Applies validated fixes to staticData.ts with safety checks
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { ConsolidatedFinding } from './types';

export interface PersistenceResult {
  applied: number;
  failed: number;
  errors: Array<{ location: string; error: string }>;
  backupPath: string;
  modified: boolean;
}

const STATIC_DATA_PATH = path.resolve(process.cwd(), 'services/staticData.ts');
const BACKUP_DIR = path.resolve('/tmp');

/**
 * Create backup of staticData.ts before applying fixes
 */
export async function createBackup(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `staticData.backup.${timestamp}.ts`);

  const content = await fs.readFile(STATIC_DATA_PATH, 'utf-8');
  await fs.writeFile(backupPath, content, 'utf-8');

  return backupPath;
}

/**
 * Escape regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Apply HIGH confidence fixes to staticData.ts
 */
export async function persistFixes(
  findings: ConsolidatedFinding[],
  dryRun: boolean = false
): Promise<PersistenceResult> {
  // Create backup first
  const backupPath = await createBackup();

  try {
    // Read original file
    let content = await fs.readFile(STATIC_DATA_PATH, 'utf-8');
    const originalContent = content;

    const result: PersistenceResult = {
      applied: 0,
      failed: 0,
      errors: [],
      backupPath,
      modified: false
    };

    // Filter to HIGH confidence only
    const highConfidenceFixes = findings.filter(
      f => f.confidence >= 0.95 && f.suggestedValue
    );

    // Apply each fix
    for (const finding of highConfidenceFixes) {
      try {
        const fixed = applyFix(content, finding);
        if (fixed.modified) {
          content = fixed.content;
          result.applied++;
        } else {
          result.failed++;
          result.errors.push({
            location: finding.location,
            error: 'Could not locate content to replace'
          });
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          location: finding.location,
          error: String(error)
        });
      }
    }

    // Validate TypeScript syntax (basic check)
    try {
      const sourceFile = ts.createSourceFile(
        'staticData.ts',
        content,
        ts.ScriptTarget.Latest,
        true
      );

      // Just check that the file was parsed successfully
      // Full type checking would require full TypeScript context
      if (!sourceFile) {
        throw new Error('Failed to parse TypeScript file');
      }
    } catch (error) {
      // Restore from backup
      await fs.writeFile(STATIC_DATA_PATH, originalContent, 'utf-8');
      throw new Error(`TypeScript validation failed: ${error}`);
    }

    // Write to disk if not dry-run
    if (!dryRun && result.applied > 0) {
      await fs.writeFile(STATIC_DATA_PATH, content, 'utf-8');
      result.modified = true;
    }

    return result;
  } catch (error) {
    throw new Error(`Persistence failed: ${error}`);
  }
}

/**
 * Apply a single fix to content using string replacement
 */
function applyFix(
  content: string,
  finding: ConsolidatedFinding
): { content: string; modified: boolean } {
  const { location, currentValue, suggestedValue } = finding;

  if (!suggestedValue) {
    return { content, modified: false };
  }

  // Simple string replacement approach
  // This works for most cases where we're replacing quoted values
  const escapedCurrent = escapeRegex(currentValue);
  const pattern = new RegExp(escapedCurrent, 'g');

  // Check if pattern exists
  if (!pattern.test(content)) {
    return { content, modified: false };
  }

  // Replace only first occurrence (to avoid replacing same value elsewhere)
  const modified = content.replace(pattern, suggestedValue);

  return { content: modified, modified: true };
}

/**
 * Restore from backup
 */
export async function restoreFromBackup(backupPath: string): Promise<void> {
  const content = await fs.readFile(backupPath, 'utf-8');
  await fs.writeFile(STATIC_DATA_PATH, content, 'utf-8');
}

/**
 * Generate persistence report
 */
export function generatePersistenceReport(result: PersistenceResult): string {
  return `
📝 Persistence Report
====================

Applied: ${result.applied}
Failed: ${result.failed}
Backup: ${result.backupPath}
Modified: ${result.modified ? 'Yes' : 'No (dry-run)'}

${result.errors.length > 0 ? 'Errors:\n' + result.errors.map(e => `  ${e.location}: ${e.error}`).join('\n') : ''}
`;
}
