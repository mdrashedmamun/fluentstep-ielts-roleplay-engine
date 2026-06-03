import * as fs from 'fs';
import { load as loadYaml } from 'js-yaml';
import {
  type ActiveRecallItem,
  type BlankMapping,
  type ChunkFeedbackV2,
  type PatternSummary,
  type RoleplayScript
} from '../src/services/staticData';

type ScenarioCategory = RoleplayScript['category'];
type UnknownRecord = Record<string, unknown>;

interface ParsedPackage {
  category: ScenarioCategory;
  scenarioId: string;
  topic: string;
  context: string;
  characters: Array<{ name: string; description: string }>;
  dialogue: Array<{ speaker: string; text: string }>;
  answerVariations: Array<{ index: number; answer: string; alternatives: string[] }>;
  chunkFeedbackV2: ChunkFeedbackV2[];
  blanksInOrder: BlankMapping[];
  patternSummary: PatternSummary;
  activeRecall: ActiveRecallItem[];
}

const VALID_CATEGORIES = new Set<ScenarioCategory>([
  'Social',
  'Workplace',
  'Service/Logistics',
  'Advanced',
  'Academic',
  'Healthcare',
  'Cultural',
  'Community'
]);

const writeOut = (message = ''): void => {
  process.stdout.write(`${message}\n`);
};

const writeErr = (message = ''): void => {
  process.stderr.write(`${message}\n`);
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function getString(record: UnknownRecord, key: string, location: string): string {
  const value = record[key];
  if (typeof value !== 'string') {
    throw new Error(`${location}: missing string field "${key}"`);
  }

  return value;
}

function getOptionalString(record: UnknownRecord, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

function getNumber(record: UnknownRecord, key: string, location: string): number {
  const value = record[key];
  if (typeof value !== 'number') {
    throw new Error(`${location}: missing number field "${key}"`);
  }

  return value;
}

function getRecord(record: UnknownRecord, key: string, location: string): UnknownRecord {
  const value = record[key];
  if (!isRecord(value)) {
    throw new Error(`${location}: missing object field "${key}"`);
  }

  return value;
}

function getRecordArray(record: UnknownRecord, key: string, location: string): UnknownRecord[] {
  const value = record[key];
  if (!Array.isArray(value) || !value.every(isRecord)) {
    throw new Error(`${location}: missing object array field "${key}"`);
  }

  return value;
}

function getOptionalRecordArray(record: UnknownRecord, key: string): UnknownRecord[] {
  const value = record[key];
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function getOptionalStringArray(record: UnknownRecord, key: string): string[] {
  const value = record[key];
  return isStringArray(value) ? value : [];
}

function parseCategoryValue(value: string): ScenarioCategory {
  if (!VALID_CATEGORIES.has(value as ScenarioCategory)) {
    throw new Error(`Invalid category "${value}". Valid categories: ${Array.from(VALID_CATEGORIES).join(', ')}`);
  }

  return value as ScenarioCategory;
}

/**
 * Parse a markdown content package into structured data
 */
export function parsePackageMarkdown(filePath: string): ParsedPackage {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const yamlLines: string[] = [];
  let inYamlBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '```yaml') {
      inYamlBlock = true;
      continue;
    }

    if (trimmed === '```' && inYamlBlock) {
      inYamlBlock = false;
      continue;
    }

    if (inYamlBlock) {
      yamlLines.push(line);
    }
  }

  // Parse each section
  const category = parseCategory(lines);
  const { scenarioId, topic } = parseMetadata(lines);
  const context = parseContext(lines);
  const characters = parseCharacters(lines);
  const { dialogue, blankCount } = parseRoleplay(lines);
  const answerVariations = parseAnswers(lines, blankCount);

  // Parse YAML block
  const yamlContent = yamlLines.join('\n');
  const {
    chunkFeedbackV2,
    blanksInOrder,
    patternSummary,
    activeRecall
  } = parseYamlBlock(yamlContent);

  return {
    category,
    scenarioId,
    topic,
    context,
    characters,
    dialogue,
    answerVariations,
    chunkFeedbackV2,
    blanksInOrder,
    patternSummary,
    activeRecall
  };
}

/**
 * Extract category from header
 */
function parseCategory(allLines: string[]): ScenarioCategory {
  const categoryLine = allLines.find((line) => line.startsWith('# Category:'));
  if (!categoryLine) {
    throw new Error('Missing # Category: header');
  }

  return parseCategoryValue(categoryLine.replace('# Category:', '').trim());
}

/**
 * Extract scenario ID and topic
 */
function parseMetadata(allLines: string[]): { scenarioId: string; topic: string } {
  let scenarioId = '';
  let topic = '';

  // Search for ID
  for (const line of allLines) {
    if (line.includes('**ID**:')) {
      const match = line.match(/`([^`]+)`/);
      if (match?.[1]) {
        scenarioId = match[1];
      }
    }
  }

  // Look for topic (first ## line in content, not # Category)
  for (const line of allLines) {
    if (line.match(/^## [^#]/) && !line.includes('**ID**')) {
      topic = line.replace(/^## /, '').trim();
      break;
    }
  }

  if (!scenarioId) {
    throw new Error('Missing **ID**: `scenarioId` line');
  }
  if (!topic) {
    throw new Error('Missing ## Topic line');
  }

  return { scenarioId, topic };
}

/**
 * Extract context (pre-roleplay popup text)
 */
function parseContext(allLines: string[]): string {
  const contextLines: string[] = [];
  let collecting = false;

  for (const line of allLines) {
    if (line.includes('### Context')) {
      collecting = true;
      continue;
    }
    if (collecting && line.trim().startsWith('###')) {
      break;
    }
    if (collecting && line.trim()) {
      contextLines.push(line.trim());
    }
  }

  return contextLines.join(' ').trim();
}

/**
 * Extract characters array from all lines
 */
function parseCharacters(allLines: string[]): Array<{ name: string; description: string }> {
  const characters: Array<{ name: string; description: string }> = [];
  let collecting = false;

  for (const line of allLines) {
    if (line.includes('### Characters')) {
      collecting = true;
      continue;
    }
    if (collecting && line.trim().startsWith('###')) {
      break;
    }

    if (collecting && line.trim().startsWith('- **')) {
      const match = line.match(/- \*\*([^*]+)\*\*: (.*)/);
      if (match?.[1] && match[2]) {
        characters.push({
          name: match[1],
          description: match[2].trim()
        });
      }
    }
  }

  if (characters.length === 0) {
    throw new Error('No characters found');
  }

  return characters;
}

/**
 * Parse roleplay dialogue with blanks as ________ (8 underscores)
 */
function parseRoleplay(allLines: string[]): { dialogue: Array<{ speaker: string; text: string }>; blankCount: number } {
  const dialogue: Array<{ speaker: string; text: string }> = [];
  let blankCount = 0;
  let collecting = false;

  for (const line of allLines) {
    if (line.includes('### Roleplay')) {
      collecting = true;
      continue;
    }
    if (collecting && line.trim().startsWith('###')) {
      break;
    }

    if (!collecting || !line.trim()) {
      continue;
    }

    // Match pattern: **Speaker**: text
    const match = line.match(/^\*\*([^*]+)\*\*: (.*)/);
    if (match?.[1] && match[2]) {
      const speaker = match[1];
      const text = match[2];

      // Count blanks (8 underscores = 1 blank)
      const blanks = text.match(/________/g)?.length ?? 0;
      blankCount += blanks;

      dialogue.push({
        speaker,
        text
      });
    }
  }

  if (dialogue.length === 0) {
    throw new Error('No dialogue found');
  }
  if (blankCount === 0) {
    throw new Error('No blanks found in dialogue');
  }

  return { dialogue, blankCount };
}

/**
 * Parse answers section
 * Format: **Blank N**: `answer`
 * - Alternatives: `alt1`, `alt2`
 */
function parseAnswers(
  allLines: string[],
  expectedCount: number
): Array<{ index: number; answer: string; alternatives: string[] }> {
  const answers: Array<{ index: number; answer: string; alternatives: string[] }> = [];
  let currentAnswer = '';
  let currentAlternatives: string[] = [];
  let currentIndex = -1;
  let collecting = false;

  const pushCurrentAnswer = (): void => {
    if (currentIndex >= 0) {
      answers.push({
        index: currentIndex,
        answer: currentAnswer,
        alternatives: currentAlternatives
      });
    }
  };

  for (const line of allLines) {
    if (line.includes('### Answers')) {
      collecting = true;
      continue;
    }
    if (collecting && line.trim().startsWith('###')) {
      break;
    }

    if (!collecting) {
      continue;
    }

    const trimmed = line.trim();

    // New blank marker
    if (trimmed.match(/^\*\*Blank \d+\*\*:/)) {
      pushCurrentAnswer();

      // Parse new blank
      const match = trimmed.match(/^\*\*Blank (\d+)\*\*: `([^`]+)`/);
      if (match?.[1] && match[2]) {
        currentIndex = Number.parseInt(match[1], 10) - 1; // 0-indexed
        currentAnswer = match[2];
        currentAlternatives = [];
      }
    } else if (trimmed.includes('Alternatives:')) {
      const altMatch = trimmed.match(/Alternatives: (.*)/);
      if (altMatch?.[1]) {
        const altText = altMatch[1];
        // Extract alternatives: `alt1`, `alt2`, or _(none)_
        if (altText.includes('_(none)_')) {
          currentAlternatives = [];
        } else {
          const alts = altText.match(/`([^`]+)`/g);
          if (alts) {
            currentAlternatives = alts.map((alternative) => alternative.replace(/`/g, ''));
          }
        }
      }
    }
  }

  // Do not forget last answer
  pushCurrentAnswer();

  if (answers.length !== expectedCount) {
    throw new Error(
      `Answer count mismatch: found ${answers.length} answers but expected ${expectedCount} blanks`
    );
  }

  return answers;
}

function parseChunkFeedback(chunkFeedbackObj: UnknownRecord): ChunkFeedbackV2[] {
  return Object.entries(chunkFeedbackObj).map(([chunkId, chunk], index) => {
    if (!isRecord(chunk)) {
      throw new Error(`chunkFeedback.${chunkId || index}: expected object`);
    }

    const learner = getRecord(chunk, 'learner', `chunkFeedback.${chunkId}.learner`);

    return {
      chunkId,
      native: getString(chunk, 'native', `chunkFeedback.${chunkId}`),
      learner: {
        meaning: getString(learner, 'meaning', `chunkFeedback.${chunkId}.learner`),
        useWhen: getString(learner, 'useWhen', `chunkFeedback.${chunkId}.learner`),
        commonWrong: getString(learner, 'commonWrong', `chunkFeedback.${chunkId}.learner`),
        fix: getString(learner, 'fix', `chunkFeedback.${chunkId}.learner`),
        whyOdd: getString(learner, 'whyOdd', `chunkFeedback.${chunkId}.learner`)
      },
      examples: getOptionalStringArray(chunk, 'examples')
    };
  });
}

function parseBlanksInOrder(parsed: UnknownRecord): BlankMapping[] {
  return getRecordArray(parsed, 'blanksInOrder', 'YAML').map((mapping, index) => ({
    blankId: getString(mapping, 'blankId', `blanksInOrder[${index}]`),
    chunkId: getString(mapping, 'chunkId', `blanksInOrder[${index}]`)
  }));
}

function parsePatternSummary(parsed: UnknownRecord): PatternSummary {
  const patternSummaryRaw = getRecord(parsed, 'patternSummary', 'YAML');
  const categoryBreakdown = getOptionalRecordArray(patternSummaryRaw, 'categoryBreakdown').map((categoryEntry, index) => ({
    category: getString(categoryEntry, 'category', `patternSummary.categoryBreakdown[${index}]`) as PatternSummary['categoryBreakdown'][number]['category'],
    count: getNumber(categoryEntry, 'count', `patternSummary.categoryBreakdown[${index}]`),
    exampleChunkIds: getOptionalStringArray(categoryEntry, 'exampleChunkIds').length > 0
      ? getOptionalStringArray(categoryEntry, 'exampleChunkIds')
      : getOptionalStringArray(categoryEntry, 'examples'),
    insight: getString(categoryEntry, 'insight', `patternSummary.categoryBreakdown[${index}]`)
  }));

  const keyPatterns = getOptionalRecordArray(patternSummaryRaw, 'keyPatterns').map((pattern, index) => ({
    pattern: getString(pattern, 'pattern', `patternSummary.keyPatterns[${index}]`),
    explanation: getString(pattern, 'explanation', `patternSummary.keyPatterns[${index}]`),
    chunkIds: getOptionalStringArray(pattern, 'chunkIds').length > 0
      ? getOptionalStringArray(pattern, 'chunkIds')
      : getOptionalStringArray(pattern, 'chunks')
  }));

  return {
    categoryBreakdown,
    overallInsight: getOptionalString(patternSummaryRaw, 'overallInsight') ?? '',
    keyPatterns
  };
}

function parseActiveRecall(parsed: UnknownRecord): ActiveRecallItem[] {
  return getRecordArray(parsed, 'activeRecall', 'YAML').map((item, index) => ({
    id: getString(item, 'id', `activeRecall[${index}]`),
    prompt: getString(item, 'prompt', `activeRecall[${index}]`),
    targetChunkIds: getOptionalStringArray(item, 'targetChunkIds'),
    expectedAnswer: getOptionalString(item, 'expectedAnswer'),
    hints: getOptionalStringArray(item, 'hints')
  }));
}

/**
 * Parse YAML block containing chunkFeedback, blanksInOrder, patternSummary, activeRecall
 */
function parseYamlBlock(yamlContent: string): {
  chunkFeedbackV2: ChunkFeedbackV2[];
  blanksInOrder: BlankMapping[];
  patternSummary: PatternSummary;
  activeRecall: ActiveRecallItem[];
} {
  if (!yamlContent.trim()) {
    throw new Error('No YAML content found');
  }

  let parsedUnknown: unknown;
  try {
    parsedUnknown = loadYaml(yamlContent);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`YAML parse error: ${message}`);
  }

  if (!isRecord(parsedUnknown)) {
    throw new Error('YAML root must be an object');
  }

  const chunkFeedbackObj = getRecord(parsedUnknown, 'chunkFeedback', 'YAML');

  return {
    chunkFeedbackV2: parseChunkFeedback(chunkFeedbackObj),
    blanksInOrder: parseBlanksInOrder(parsedUnknown),
    patternSummary: parsePatternSummary(parsedUnknown),
    activeRecall: parseActiveRecall(parsedUnknown)
  };
}

/**
 * Convert parsed package to RoleplayScript format
 */
export function convertToRoleplayScript(pkg: ParsedPackage, scenarioId: string): RoleplayScript {
  return {
    id: scenarioId,
    category: pkg.category,
    topic: pkg.topic,
    context: pkg.context,
    characters: pkg.characters,
    dialogue: pkg.dialogue,
    answerVariations: pkg.answerVariations,
    chunkFeedbackV2: pkg.chunkFeedbackV2,
    blanksInOrder: pkg.blanksInOrder,
    patternSummary: pkg.patternSummary,
    activeRecall: pkg.activeRecall
  };
}

/**
 * CLI: Parse a package markdown file and print JSON
 * Only runs when directly invoked, not when imported
 */
const isDirectInvocation = process.argv[1]?.endsWith('parsePackageMarkdown.ts');

if (isDirectInvocation) {
  const filePath = process.argv[2];
  if (!filePath) {
    writeErr('Usage: npx tsx parsePackageMarkdown.ts <path-to-markdown>');
    process.exit(1);
  }

  try {
    const pkg = parsePackageMarkdown(filePath);
    writeOut(JSON.stringify(pkg, null, 2));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeErr(`Error parsing ${filePath}: ${message}`);
    process.exit(1);
  }
}
