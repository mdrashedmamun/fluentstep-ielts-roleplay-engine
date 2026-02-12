import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Migrate custom category strings to standard ChunkCategory types with customLabel field.
 *
 * Healthcare custom categories map to standard types:
 * - "Clear symptom reporting" → "Repair" (clarification/communication)
 * - "Triggers and practical changes" → "Idioms" (procedural language)
 * - "Next steps and NHS language" → "Exit" (closing/next steps)
 *
 * Community custom categories map to standard types:
 * - "Formal opening and establishing credibility" → "Openers"
 * - "Council procedural and acknowledgment language" → "Repair"
 * - "Planning impact vocabulary" → "Idioms" (domain-specific)
 * - "Consultation and negotiation vocabulary" → "Disagreement"
 * - "Formal requests and closing" → "Exit"
 */

// Category mapping from custom strings to (standard type, display label)
const CATEGORY_MAPPING: Record<string, { type: string; customLabel: string }> = {
  // Healthcare
  'Clear symptom reporting': { type: 'Repair', customLabel: 'Clear symptom reporting' },
  'Triggers and practical changes': { type: 'Idioms', customLabel: 'Triggers and practical changes' },
  'Next steps and NHS language': { type: 'Exit', customLabel: 'Next steps and NHS language' },
  // Community
  'Formal opening and establishing credibility': { type: 'Openers', customLabel: 'Formal opening and establishing credibility' },
  'Council procedural and acknowledgment language': { type: 'Repair', customLabel: 'Council procedural and acknowledgment language' },
  'Planning impact vocabulary': { type: 'Idioms', customLabel: 'Planning impact vocabulary' },
  'Consultation and negotiation vocabulary': { type: 'Disagreement', customLabel: 'Consultation and negotiation vocabulary' },
  'Formal requests and closing': { type: 'Exit', customLabel: 'Formal requests and closing' },
};

interface CategoryBreakdown {
  category: string;
  customLabel?: string;
  count: number;
  exampleChunkIds: string[];
  examples?: string[];
  insight: string;
  nativePatterns?: string[];
  commonMistakes?: string[];
}

interface PatternSummary {
  categoryBreakdown: CategoryBreakdown[];
  overallInsight: string;
  keyPatterns: unknown[];
}

interface RoleplayScript {
  id: string;
  patternSummary?: PatternSummary;
  [key: string]: unknown;
}

// Read staticData.ts
const staticDataPath = path.join(__dirname, '../src/services/staticData.ts');
let fileContent = fs.readFileSync(staticDataPath, 'utf-8');

// Create backup before modifying (with timestamp for unique names)
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = staticDataPath + `.backup-${timestamp}`;
fs.writeFileSync(backupPath, fileContent);
console.log(`✓ Backup created: ${backupPath}`);

// For each custom category, replace it in the file
let migrationCount = 0;

for (const [customCategory, mapping] of Object.entries(CATEGORY_MAPPING)) {
  // Match the pattern: "category": "CustomCategory"
  const pattern = new RegExp(
    `("category":\\s*"${customCategory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}")`,
    'g'
  );

  // Count and replace occurrences
  const matches = fileContent.match(pattern);
  if (matches) {
    fileContent = fileContent.replace(
      pattern,
      `"category": "${mapping.type}",\n    "customLabel": "${mapping.customLabel}"`
    );
    migrationCount += matches.length;
    console.log(`✓ Migrated ${matches.length} occurrence(s) of "${customCategory}"`);
  }
}

// Write the migrated content back
fs.writeFileSync(staticDataPath, fileContent);
console.log(`\n✓ Migration complete!`);
console.log(`  - ${migrationCount} categoryBreakdown field(s) transformed`);
console.log(`  - 3 Healthcare custom categories migrated`);
console.log(`  - 5 Community custom categories migrated`);
console.log(`  - Backup saved: ${backupPath}`);
console.log(`\nNext steps:`);
console.log(`  1. Review the changes: grep -B 1 "customLabel" ${staticDataPath} | head -30`);
console.log(`  2. Build to verify: npm run build`);
console.log(`  3. Test Healthcare/Community scenarios in browser`);
