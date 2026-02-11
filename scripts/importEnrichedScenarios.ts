import fs from 'fs';
import path from 'path';
import { CURATED_ROLEPLAYS, PatternSummary, RoleplayScript } from '../src/services/staticData';

/**
 * Import enriched scenarios with pattern summaries back into staticData.ts
 * Enforces category lock and batch size constraints
 * Usage: npm run import:enrichments -- --file=Social-batch1-enriched.md
 */

interface EnrichmentData {
  scenarioId: string;
  patternSummary: PatternSummary;
}

interface ParsedFile {
  category: string;
  sourceFile: string;
  scenarioCount: number;
  enrichments: EnrichmentData[];
}

function parseArgs(): string {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && i + 1 < args.length) {
      return args[i + 1];
    }
  }

  console.error('Usage: npm run import:enrichments -- --file=<filename>');
  console.error('Example: npm run import:enrichments -- --file=Social-batch1-enriched.md');
  process.exit(1);
}

/**
 * Parse category header and validate format
 */
function parseCategoryHeader(lines: string[]): { category: string; sourceFile: string; scenarioCount: number } | null {
  if (lines.length < 3) {
    return null;
  }

  const categoryLine = lines[0];
  const sourceFileLine = lines[1];
  const countLine = lines[2];

  const categoryMatch = categoryLine.match(/^# Category: (.+)$/);
  const sourceMatch = sourceFileLine.match(/^# Source file: (.+)\.md$/);
  const countMatch = countLine.match(/^# Scenarios included: (\d+)$/);

  if (!categoryMatch || !sourceMatch || !countMatch) {
    return null;
  }

  return {
    category: categoryMatch[1],
    sourceFile: sourceMatch[1],
    scenarioCount: parseInt(countMatch[1], 10),
  };
}

/**
 * Extract YAML enrichment blocks from markdown
 */
function extractEnrichments(content: string, expectedScenarioCount: number): EnrichmentData[] {
  const enrichments: EnrichmentData[] = [];

  // Find all scenario blocks (marked by ## Title)
  const scenarioBlocks = content.split(/\n## /).slice(1);

  for (const block of scenarioBlocks) {
    // Extract scenario ID from first line (should be **ID**: `<id>`)
    const idMatch = block.match(/\*\*ID\*\*:\s*`([^`]+)`/);
    if (!idMatch) continue;

    const scenarioId = idMatch[1];

    // Extract YAML block
    const yamlMatch = block.match(/```yaml\npatternSummary:\n([\s\S]*?)```/);
    if (!yamlMatch) continue;

    try {
      const patternSummary = parseYamlPatternSummary(yamlMatch[1]);
      enrichments.push({ scenarioId, patternSummary });
    } catch (error) {
      console.error(`⚠️ Failed to parse YAML for ${scenarioId}: ${error}`);
    }
  }

  return enrichments;
}

/**
 * Parse YAML pattern summary block
 */
function parseYamlPatternSummary(yamlContent: string): PatternSummary {
  const summary: PatternSummary = {
    categoryBreakdown: [],
    overallInsight: '',
    keyPatterns: [],
  };

  const lines = yamlContent.split('\n').map(l => l.trimEnd());
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const indent = line.match(/^(\s*)/)?.[1]?.length ?? 0;

    if (line.includes('categoryBreakdown:')) {
      i++;
      while (i < lines.length && lines[i].match(/^  - category:/)) {
        const breakdown = parseBreakdownItem(lines, i);
        if (breakdown) {
          summary.categoryBreakdown.push(breakdown.item);
          i = breakdown.nextIndex;
        } else {
          i++;
        }
      }
    } else if (line.includes('overallInsight:')) {
      const match = line.match(/overallInsight:\s*"(.*)"/);
      if (match) {
        summary.overallInsight = match[1];
      }
      i++;
    } else if (line.includes('keyPatterns:')) {
      i++;
      while (i < lines.length && lines[i].match(/^  - pattern:/)) {
        const pattern = parsePatternItem(lines, i);
        if (pattern) {
          summary.keyPatterns.push(pattern.item);
          i = pattern.nextIndex;
        } else {
          i++;
        }
      }
    } else {
      i++;
    }
  }

  return summary;
}

/**
 * Parse a single category breakdown item
 */
function parseBreakdownItem(lines: string[], startIndex: number): { item: any; nextIndex: number } | null {
  const item: any = {};
  let i = startIndex;

  while (i < lines.length && lines[i].match(/^    /)) {
    const line = lines[i];

    if (line.includes('category:')) {
      const match = line.match(/category:\s*"(.*)"/);
      item.category = match?.[1];
    } else if (line.includes('count:')) {
      const match = line.match(/count:\s*(\d+)/);
      item.count = match ? parseInt(match[1], 10) : 0;
    } else if (line.includes('examples:')) {
      const match = line.match(/examples:\s*\[(.*)\]/);
      if (match) {
        item.examples = match[1].split(',').map(e => e.trim().replace(/["']/g, ''));
      }
    } else if (line.includes('insight:')) {
      const match = line.match(/insight:\s*"(.*)"/);
      item.insight = match?.[1];
    }

    i++;

    if (lines[i] && !lines[i].match(/^    /)) {
      break;
    }
  }

  return item.category ? { item, nextIndex: i } : null;
}

/**
 * Parse a single key pattern item
 */
function parsePatternItem(lines: string[], startIndex: number): { item: any; nextIndex: number } | null {
  const item: any = {};
  let i = startIndex;

  while (i < lines.length && lines[i].match(/^    /)) {
    const line = lines[i];

    if (line.includes('pattern:')) {
      const match = line.match(/pattern:\s*"(.*)"/);
      item.pattern = match?.[1];
    } else if (line.includes('explanation:')) {
      const match = line.match(/explanation:\s*"(.*)"/);
      item.explanation = match?.[1];
    } else if (line.includes('chunks:')) {
      const match = line.match(/chunks:\s*\[(.*)\]/);
      if (match) {
        item.chunks = match[1].split(',').map(c => c.trim().replace(/["']/g, ''));
      }
    }

    i++;

    if (lines[i] && !lines[i].match(/^    /)) {
      break;
    }
  }

  return item.pattern ? { item, nextIndex: i } : null;
}

/**
 * Validate category lock (all scenario IDs must match declared category)
 */
function validateCategoryLock(
  declaredCategory: string,
  enrichments: EnrichmentData[],
  allScenarios: RoleplayScript[]
): boolean {
  // Map declared category name to file prefix
  const categoryPrefixMap: Record<string, string> = {
    'Social': 'social-',
    'Workplace': 'workplace-',
    'Service/Logistics': 'service-',
    'Service-Logistics': 'service-',
    'Advanced': 'advanced-',
    'Academic': 'academic-',
    'Healthcare': 'healthcare-',
    'Cultural': 'cultural-',
    'Community': 'community-',
  };

  const expectedPrefix = categoryPrefixMap[declaredCategory];
  if (!expectedPrefix) {
    console.error(`❌ Invalid category name: ${declaredCategory}`);
    return false;
  }

  // Check all scenario IDs match the expected prefix
  for (const enrichment of enrichments) {
    if (!enrichment.scenarioId.startsWith(expectedPrefix)) {
      console.error(
        `❌ Category lock violation: Scenario ID '${enrichment.scenarioId}' doesn't match declared category '${declaredCategory}'`
      );
      return false;
    }

    // Also verify scenario exists in database
    const scenario = allScenarios.find(s => s.id === enrichment.scenarioId);
    if (!scenario) {
      console.error(`❌ Scenario not found: ${enrichment.scenarioId}`);
      return false;
    }

    if (scenario.category !== declaredCategory && scenario.category !== declaredCategory.replace('-', '/')) {
      console.error(
        `❌ Scenario ${enrichment.scenarioId} belongs to category '${scenario.category}', not '${declaredCategory}'`
      );
      return false;
    }
  }

  return true;
}

/**
 * Merge enrichments into scenarios
 */
function mergeEnrichments(
  enrichments: EnrichmentData[],
  currentData: RoleplayScript[]
): RoleplayScript[] {
  const merged = JSON.parse(JSON.stringify(currentData)); // Deep copy

  for (const enrichment of enrichments) {
    const scenario = merged.find((s: RoleplayScript) => s.id === enrichment.scenarioId);
    if (scenario) {
      scenario.patternSummary = enrichment.patternSummary;
    }
  }

  return merged;
}

/**
 * Format merged data back to TypeScript
 */
function generateStaticDataFile(scenarios: RoleplayScript[]): string {
  // Read original file to preserve imports and structure
  const originalPath = path.join(process.cwd(), 'src/services/staticData.ts');
  const originalContent = fs.readFileSync(originalPath, 'utf-8');

  // Find the CURATED_ROLEPLAYS export and replace it
  const lines = originalContent.split('\n');
  let startIndex = -1;
  let endIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('export const CURATED_ROLEPLAYS')) {
      startIndex = i;
    }
    if (startIndex !== -1 && lines[i].trim() === '];') {
      endIndex = i;
      break;
    }
  }

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Could not find CURATED_ROLEPLAYS in staticData.ts');
  }

  // Generate new array
  const newArray = 'export const CURATED_ROLEPLAYS: RoleplayScript[] = ' +
    JSON.stringify(scenarios, null, 4).replace(/^/gm, '');

  // Reconstruct file
  const newContent = [
    ...lines.slice(0, startIndex),
    newArray,
    ...lines.slice(endIndex + 1),
  ].join('\n');

  return newContent;
}

async function main() {
  const filename = parseArgs();
  const filePath = path.join(process.cwd(), 'exports', filename);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`\n📥 Importing enriched scenarios...`);
  console.log(`   File: ${filename}`);

  // Read and parse file
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Parse header
  const header = parseCategoryHeader(lines);
  if (!header) {
    console.error('❌ Invalid file format. Missing or malformed category header.');
    console.error('Header must be:');
    console.error('# Category: <NAME>');
    console.error('# Source file: <FILENAME>.md');
    console.error('# Scenarios included: <count>');
    process.exit(1);
  }

  console.log(`   Category: ${header.category}`);
  console.log(`   Expected scenarios: ${header.scenarioCount}`);

  // Extract enrichments
  const enrichments = extractEnrichments(content, header.scenarioCount);
  console.log(`   Found enrichments: ${enrichments.length}`);

  if (enrichments.length === 0) {
    console.error('❌ No enrichments found in file');
    process.exit(1);
  }

  if (enrichments.length !== header.scenarioCount) {
    console.warn(
      `⚠️  Header says ${header.scenarioCount} scenarios but found ${enrichments.length}. Proceeding with found enrichments.`
    );
  }

  // Validate category lock
  console.log(`\n🔒 Enforcing category lock...`);
  if (!validateCategoryLock(header.category, enrichments, CURATED_ROLEPLAYS)) {
    console.error('❌ Category lock validation failed. Import cancelled.');
    process.exit(1);
  }
  console.log(`   ✅ All scenarios match declared category: ${header.category}`);

  // Check for existing summaries
  const existingScenarios = enrichments.filter(e => {
    const scenario = CURATED_ROLEPLAYS.find(s => s.id === e.scenarioId);
    return scenario?.patternSummary !== undefined;
  });

  if (existingScenarios.length > 0) {
    console.warn(`\n⚠️  ${existingScenarios.length} scenario(s) already have pattern summaries:`);
    existingScenarios.forEach(e => console.warn(`    - ${e.scenarioId}`));
    console.log('Proceeding to overwrite...\n');
  }

  // Merge enrichments
  console.log(`\n🔄 Merging enrichments...`);
  const merged = mergeEnrichments(enrichments, CURATED_ROLEPLAYS);
  console.log(`   ✅ Merged ${enrichments.length} enrichments`);

  // Create backup
  const staticDataPath = path.join(process.cwd(), 'src/services/staticData.ts');
  const backupPath = path.join(process.cwd(), 'src/services/staticData.ts.backup');

  console.log(`\n💾 Creating backup...`);
  fs.copyFileSync(staticDataPath, backupPath);
  console.log(`   ✅ Backup created: ${backupPath}`);

  // Write updated file
  console.log(`\n✍️  Writing updated staticData.ts...`);
  const newContent = generateStaticDataFile(merged);
  fs.writeFileSync(staticDataPath, newContent, 'utf-8');
  console.log(`   ✅ Updated: ${staticDataPath}`);

  console.log(`\n✅ Import complete!`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Run: npm run validate:feedback`);
  console.log(`   2. Run: npm run build`);
  console.log(`   3. Run: npm run dev (and test scenarios in browser)`);
  console.log(`   4. If satisfied, commit: git add src/services/staticData.ts && git commit`);
  console.log('');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
