import fs from 'fs';
import path from 'path';
import { CURATED_ROLEPLAYS, type PatternSummary, type RoleplayScript } from '../src/services/staticData';

/**
 * Import enriched scenarios with pattern summaries back into staticData.ts.
 * Enforces category lock and batch size constraints.
 * Usage: npm run import:enrichments -- --file=Social-batch1-enriched.md
 */

type CategoryBreakdownItem = PatternSummary['categoryBreakdown'][number];
type KeyPatternItem = PatternSummary['keyPatterns'][number];
type EnrichedRoleplayScript = Omit<RoleplayScript, 'patternSummary'> & {
  patternSummary?: PatternSummary;
};

interface EnrichmentData {
  scenarioId: string;
  patternSummary: PatternSummary;
}

interface CategoryHeader {
  category: string;
  sourceFile: string;
  scenarioCount: number;
}

const writeOut = (message = ''): void => {
  process.stdout.write(`${message}\n`);
};

const writeWarn = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

const writeErr = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

const getErrorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

function parseArgs(): string {
  const args = process.argv.slice(2);
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const nextArg = args[index + 1];

    if (arg?.startsWith('--file=')) {
      return arg.substring('--file='.length);
    }

    if (arg === '--file' && nextArg) {
      return nextArg;
    }
  }

  writeErr('Usage: npm run import:enrichments -- --file=<filename>');
  writeErr('Example: npm run import:enrichments -- --file=Social-batch1-enriched.md');
  process.exit(1);
}

/**
 * Parse category header and validate format.
 */
function parseCategoryHeader(lines: string[]): CategoryHeader | null {
  const categoryLine = lines[0];
  const sourceFileLine = lines[1];
  const countLine = lines[2];

  if (!categoryLine || !sourceFileLine || !countLine) {
    return null;
  }

  const categoryMatch = categoryLine.match(/^# Category: (.+)$/);
  const sourceMatch = sourceFileLine.match(/^# Source file: (.+)\.md$/);
  const countMatch = countLine.match(/^# Scenarios included: (\d+)$/);

  const category = categoryMatch?.[1];
  const sourceFile = sourceMatch?.[1];
  const scenarioCountText = countMatch?.[1];

  if (!category || !sourceFile || !scenarioCountText) {
    return null;
  }

  return {
    category,
    sourceFile,
    scenarioCount: Number.parseInt(scenarioCountText, 10)
  };
}

/**
 * Extract YAML enrichment blocks from markdown.
 */
function extractEnrichments(content: string): EnrichmentData[] {
  const enrichments: EnrichmentData[] = [];

  // Find all scenario blocks (marked by ## Title).
  const scenarioBlocks = content.split(/\n## /).slice(1);

  for (const block of scenarioBlocks) {
    // Extract scenario ID from first line (should be **ID**: `<id>`).
    const idMatch = block.match(/\*\*ID\*\*:\s*`([^`]+)`/);
    const scenarioId = idMatch?.[1];
    if (!scenarioId) {
      continue;
    }

    // Extract YAML block.
    const yamlMatch = block.match(/```yaml\npatternSummary:\n([\s\S]*?)```/);
    const yamlContent = yamlMatch?.[1];
    if (!yamlContent) {
      continue;
    }

    try {
      const patternSummary = parseYamlPatternSummary(yamlContent);
      enrichments.push({ scenarioId, patternSummary });
    } catch (error) {
      writeWarn(`Warning: failed to parse YAML for ${scenarioId}: ${getErrorMessage(error)}`);
    }
  }

  return enrichments;
}

const parseQuotedValue = (line: string, key: string): string | undefined => {
  const match = line.match(new RegExp(`${key}:\\s*"(.*)"`));
  return match?.[1];
};

const parseNumberValue = (line: string, key: string): number | undefined => {
  const match = line.match(new RegExp(`${key}:\\s*(\\d+)`));
  const value = match?.[1];
  return value ? Number.parseInt(value, 10) : undefined;
};

const parseInlineList = (line: string, key: string): string[] | undefined => {
  const match = line.match(new RegExp(`${key}:\\s*\\[(.*)\\]`));
  const listContent = match?.[1];
  if (listContent === undefined) {
    return undefined;
  }

  return listContent
    .split(',')
    .map((entry) => entry.trim().replace(/["']/g, ''))
    .filter(Boolean);
};

const isListStart = (line: string, key: string): boolean => (
  new RegExp(`^\\s*-\\s+${key}:`).test(line)
);

const isChildLine = (line: string): boolean => (
  /^\s{2,}\S/.test(line) && !/^\s*-\s+/.test(line)
);

/**
 * Parse YAML pattern summary block.
 */
function parseYamlPatternSummary(yamlContent: string): PatternSummary {
  const summary: PatternSummary = {
    categoryBreakdown: [],
    overallInsight: '',
    keyPatterns: []
  };

  const lines = yamlContent.split('\n').map((line) => line.trimEnd());
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? '';

    if (line.includes('categoryBreakdown:')) {
      index += 1;
      while (index < lines.length && isListStart(lines[index] ?? '', 'category')) {
        const breakdown = parseBreakdownItem(lines, index);
        if (!breakdown) {
          index += 1;
          continue;
        }

        summary.categoryBreakdown.push(breakdown.item);
        index = breakdown.nextIndex;
      }
    } else if (line.includes('overallInsight:')) {
      summary.overallInsight = parseQuotedValue(line, 'overallInsight') ?? '';
      index += 1;
    } else if (line.includes('keyPatterns:')) {
      index += 1;
      while (index < lines.length && isListStart(lines[index] ?? '', 'pattern')) {
        const pattern = parsePatternItem(lines, index);
        if (!pattern) {
          index += 1;
          continue;
        }

        summary.keyPatterns.push(pattern.item);
        index = pattern.nextIndex;
      }
    } else {
      index += 1;
    }
  }

  return summary;
}

/**
 * Parse a single category breakdown item.
 */
function parseBreakdownItem(lines: string[], startIndex: number): {
  item: CategoryBreakdownItem;
  nextIndex: number;
} | null {
  const startLine = lines[startIndex] ?? '';
  const category = parseQuotedValue(startLine, 'category');
  if (!category) {
    return null;
  }

  let item: CategoryBreakdownItem = {
    category: category as CategoryBreakdownItem['category'],
    count: 0,
    exampleChunkIds: [],
    insight: ''
  };

  let index = startIndex + 1;
  while (index < lines.length && isChildLine(lines[index] ?? '')) {
    const line = lines[index] ?? '';

    if (line.includes('count:')) {
      item = { ...item, count: parseNumberValue(line, 'count') ?? 0 };
    } else if (line.includes('exampleChunkIds:')) {
      item = { ...item, exampleChunkIds: parseInlineList(line, 'exampleChunkIds') ?? [] };
    } else if (line.includes('examples:')) {
      item = { ...item, examples: parseInlineList(line, 'examples') ?? [] };
    } else if (line.includes('insight:')) {
      item = { ...item, insight: parseQuotedValue(line, 'insight') ?? '' };
    } else if (line.includes('nativePatterns:')) {
      item = { ...item, nativePatterns: parseInlineList(line, 'nativePatterns') ?? [] };
    } else if (line.includes('commonMistakes:')) {
      item = { ...item, commonMistakes: parseInlineList(line, 'commonMistakes') ?? [] };
    }

    index += 1;
  }

  return { item, nextIndex: index };
}

/**
 * Parse a single key pattern item.
 */
function parsePatternItem(lines: string[], startIndex: number): {
  item: KeyPatternItem;
  nextIndex: number;
} | null {
  const startLine = lines[startIndex] ?? '';
  const patternName = parseQuotedValue(startLine, 'pattern');
  if (!patternName) {
    return null;
  }

  let item: KeyPatternItem = {
    pattern: patternName,
    explanation: '',
    chunkIds: []
  };

  let index = startIndex + 1;
  while (index < lines.length && isChildLine(lines[index] ?? '')) {
    const line = lines[index] ?? '';

    if (line.includes('explanation:')) {
      item = { ...item, explanation: parseQuotedValue(line, 'explanation') ?? '' };
    } else if (line.includes('chunkIds:')) {
      item = { ...item, chunkIds: parseInlineList(line, 'chunkIds') ?? [] };
    } else if (line.includes('chunks:')) {
      item = { ...item, chunks: parseInlineList(line, 'chunks') ?? [] };
    } else if (line.includes('nativePatterns:')) {
      item = { ...item, nativePatterns: parseInlineList(line, 'nativePatterns') ?? [] };
    } else if (line.includes('commonMistakes:')) {
      item = { ...item, commonMistakes: parseInlineList(line, 'commonMistakes') ?? [] };
    }

    index += 1;
  }

  return { item, nextIndex: index };
}

/**
 * Validate category lock (all scenario IDs must match declared category).
 */
function validateCategoryLock(
  declaredCategory: string,
  enrichments: EnrichmentData[],
  allScenarios: RoleplayScript[]
): boolean {
  // Map declared category name to file prefix.
  const categoryPrefixMap: Record<string, string> = {
    Social: 'social-',
    Workplace: 'workplace-',
    'Service/Logistics': 'service-',
    'Service-Logistics': 'service-',
    Advanced: 'advanced-',
    Academic: 'academic-',
    Healthcare: 'healthcare-',
    Cultural: 'cultural-',
    Community: 'community-'
  };

  const expectedPrefix = categoryPrefixMap[declaredCategory];
  if (!expectedPrefix) {
    writeErr(`Invalid category name: ${declaredCategory}`);
    return false;
  }

  // Check all scenario IDs match the expected prefix.
  for (const enrichment of enrichments) {
    if (!enrichment.scenarioId.startsWith(expectedPrefix)) {
      writeErr(
        `Category lock violation: Scenario ID '${enrichment.scenarioId}' does not match declared category '${declaredCategory}'`
      );
      return false;
    }

    // Also verify scenario exists in database.
    const scenario = allScenarios.find((candidate) => candidate.id === enrichment.scenarioId);
    if (!scenario) {
      writeErr(`Scenario not found: ${enrichment.scenarioId}`);
      return false;
    }

    if (scenario.category !== declaredCategory && scenario.category !== declaredCategory.replace('-', '/')) {
      writeErr(
        `Scenario ${enrichment.scenarioId} belongs to category '${scenario.category}', not '${declaredCategory}'`
      );
      return false;
    }
  }

  return true;
}

/**
 * Merge enrichments into scenarios.
 */
function mergeEnrichments(
  enrichments: EnrichmentData[],
  currentData: RoleplayScript[]
): EnrichedRoleplayScript[] {
  return currentData.map((scenario) => {
    const enrichment = enrichments.find((candidate) => candidate.scenarioId === scenario.id);

    if (!enrichment) {
      return scenario as EnrichedRoleplayScript;
    }

    return {
      ...(scenario as EnrichedRoleplayScript),
      patternSummary: enrichment.patternSummary
    };
  });
}

/**
 * Format merged data back to TypeScript.
 */
function generateStaticDataFile(scenarios: EnrichedRoleplayScript[]): string {
  // Read original file to preserve imports and structure.
  const originalPath = path.join(process.cwd(), 'src/services/staticData.ts');
  const originalContent = fs.readFileSync(originalPath, 'utf-8');

  // Find the CURATED_ROLEPLAYS export and replace it.
  const lines = originalContent.split('\n');
  let startIndex = -1;
  let endIndex = -1;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line?.includes('export const CURATED_ROLEPLAYS')) {
      startIndex = index;
    }
    if (startIndex !== -1 && line?.trim() === '];') {
      endIndex = index;
      break;
    }
  }

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Could not find CURATED_ROLEPLAYS in staticData.ts');
  }

  // Generate new array.
  const newArray = `export const CURATED_ROLEPLAYS: RoleplayScript[] = ${JSON.stringify(scenarios, null, 4)}`;

  // Reconstruct file.
  return [
    ...lines.slice(0, startIndex),
    newArray,
    ...lines.slice(endIndex + 1)
  ].join('\n');
}

function main(): void {
  const filename = parseArgs();
  const filePath = path.join(process.cwd(), 'exports', filename);

  if (!fs.existsSync(filePath)) {
    writeErr(`File not found: ${filePath}`);
    process.exit(1);
  }

  writeOut();
  writeOut('Importing enriched scenarios...');
  writeOut(`   File: ${filename}`);

  // Read and parse file.
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Parse header.
  const header = parseCategoryHeader(lines);
  if (!header) {
    writeErr('Invalid file format. Missing or malformed category header.');
    writeErr('Header must be:');
    writeErr('# Category: <NAME>');
    writeErr('# Source file: <FILENAME>.md');
    writeErr('# Scenarios included: <count>');
    process.exit(1);
  }

  writeOut(`   Category: ${header.category}`);
  writeOut(`   Source file: ${header.sourceFile}.md`);
  writeOut(`   Expected scenarios: ${header.scenarioCount}`);

  // Extract enrichments.
  const enrichments = extractEnrichments(content);
  writeOut(`   Found enrichments: ${enrichments.length}`);

  if (enrichments.length === 0) {
    writeErr('No enrichments found in file');
    process.exit(1);
  }

  if (enrichments.length !== header.scenarioCount) {
    writeWarn(
      `Header says ${header.scenarioCount} scenarios but found ${enrichments.length}. Proceeding with found enrichments.`
    );
  }

  // Validate category lock.
  writeOut();
  writeOut('Enforcing category lock...');
  if (!validateCategoryLock(header.category, enrichments, CURATED_ROLEPLAYS)) {
    writeErr('Category lock validation failed. Import cancelled.');
    process.exit(1);
  }
  writeOut(`   All scenarios match declared category: ${header.category}`);

  // Check for existing summaries.
  const existingScenarios = enrichments.filter((enrichment) => {
    const scenario = CURATED_ROLEPLAYS.find((candidate) => candidate.id === enrichment.scenarioId);
    return 'patternSummary' in (scenario ?? {}) && scenario?.patternSummary !== undefined;
  });

  if (existingScenarios.length > 0) {
    writeWarn('');
    writeWarn(`${existingScenarios.length} scenario(s) already have pattern summaries:`);
    existingScenarios.forEach((enrichment) => writeWarn(`    - ${enrichment.scenarioId}`));
    writeOut('Proceeding to overwrite...');
    writeOut();
  }

  // Merge enrichments.
  writeOut();
  writeOut('Merging enrichments...');
  const merged = mergeEnrichments(enrichments, CURATED_ROLEPLAYS);
  writeOut(`   Merged ${enrichments.length} enrichments`);

  // Create backup.
  const staticDataPath = path.join(process.cwd(), 'src/services/staticData.ts');
  const backupPath = path.join(process.cwd(), 'src/services/staticData.ts.backup');

  writeOut();
  writeOut('Creating backup...');
  fs.copyFileSync(staticDataPath, backupPath);
  writeOut(`   Backup created: ${backupPath}`);

  // Write updated file.
  writeOut();
  writeOut('Writing updated staticData.ts...');
  const newContent = generateStaticDataFile(merged);
  fs.writeFileSync(staticDataPath, newContent, 'utf-8');
  writeOut(`   Updated: ${staticDataPath}`);

  writeOut();
  writeOut('Import complete.');
  writeOut();
  writeOut('Next steps:');
  writeOut('   1. Run: npm run validate:feedback');
  writeOut('   2. Run: npm run build');
  writeOut('   3. Run: npm run dev and test scenarios in browser');
  writeOut('   4. Review repo policy before staging or committing generated data');
  writeOut();
}

try {
  main();
} catch (error) {
  writeErr(`Error: ${getErrorMessage(error)}`);
  process.exit(1);
}
