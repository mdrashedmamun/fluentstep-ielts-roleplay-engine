import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { RoleplayScript, ChunkFeedbackV2, BlankMapping, ActiveRecallItem, PatternSummary } from '../src/services/staticData';

interface ParsedPackage {
  category: string;
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

/**
 * Parse a markdown content package into structured data
 */
export function parsePackageMarkdown(filePath: string): ParsedPackage {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let currentSection = '';
  let headerLines = [];
  let roleplayLines = [];
  let answerLines = [];
  let yamlLines = [];
  let inYamlBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect section markers (### or ## but not the # Category: line)
    if (trimmed === '---') {
      // Separator between sections
      continue;
    } else if ((trimmed.startsWith('### ') || trimmed.startsWith('## ')) && !trimmed.startsWith('# Category')) {
      currentSection = trimmed;
      if (!inYamlBlock) {
        // Add section header to appropriate section
        if (currentSection.includes('Context') || currentSection.includes('Characters') ||
            currentSection.includes('ID') || currentSection.includes('Category')) {
          headerLines.push(line);
        } else if (currentSection.includes('Roleplay')) {
          roleplayLines.push(line);
        } else if (currentSection.includes('Answers')) {
          answerLines.push(line);
        }
      }
      continue;
    } else if (trimmed === '```yaml') {
      inYamlBlock = true;
      continue;
    } else if (trimmed === '```' && inYamlBlock) {
      inYamlBlock = false;
      continue;
    }

    // Route lines to appropriate sections
    if (inYamlBlock) {
      yamlLines.push(line);
    } else if (currentSection.includes('Context') || currentSection.includes('Characters') ||
               currentSection.includes('ID') || currentSection.includes('Category') || i < 15) {
      headerLines.push(line);
    } else if (currentSection.includes('Roleplay')) {
      roleplayLines.push(line);
    } else if (currentSection.includes('Answers')) {
      answerLines.push(line);
    }
  }

  // Parse each section
  const category = parseCategory(lines);
  const { scenarioId, topic } = parseMetadata(lines, lines);
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
    activeRecall,
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
    activeRecall,
  };
}

/**
 * Extract category from header
 */
function parseCategory(allLines: string[]): string {
  const categoryLine = allLines.find(line => line.startsWith('# Category:'));
  if (!categoryLine) throw new Error('Missing # Category: header');
  return categoryLine.replace('# Category:', '').trim();
}

/**
 * Extract scenario ID and topic
 */
function parseMetadata(allLines: string[], _unused: string[]): { scenarioId: string; topic: string } {
  let scenarioId = '';
  let topic = '';

  // Search for ID
  for (const line of allLines) {
    if (line.includes('**ID**:')) {
      const match = line.match(/`([^`]+)`/);
      if (match) scenarioId = match[1];
    }
  }

  // Look for topic (first ## line in content, not # Category)
  for (const line of allLines) {
    if (line.match(/^## [^#]/) && !line.includes('**ID**')) {
      topic = line.replace(/^## /, '').trim();
      break;
    }
  }

  if (!scenarioId) throw new Error('Missing **ID**: `scenarioId` line');
  if (!topic) throw new Error('Missing ## Topic line');

  return { scenarioId, topic };
}

/**
 * Extract context (pre-roleplay popup text)
 */
function parseContext(allLines: string[]): string {
  let collecting = false;
  let contextLines = [];

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
  const characters = [];
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
      if (match) {
        characters.push({
          name: match[1],
          description: match[2].trim(),
        });
      }
    }
  }

  if (characters.length === 0) throw new Error('No characters found');
  return characters;
}

/**
 * Parse roleplay dialogue with blanks as ________ (8 underscores)
 */
function parseRoleplay(allLines: string[]): { dialogue: Array<{ speaker: string; text: string }>; blankCount: number } {
  const dialogue = [];
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

    if (!collecting || !line.trim()) continue;

    // Match pattern: **Speaker**: text
    const match = line.match(/^\*\*([^*]+)\*\*: (.*)/);
    if (match) {
      const speaker = match[1];
      const text = match[2];

      // Count blanks (8 underscores = 1 blank)
      const blanks = (text.match(/________/g) || []).length;
      blankCount += blanks;

      dialogue.push({
        speaker,
        text,
      });
    }
  }

  if (dialogue.length === 0) throw new Error('No dialogue found');
  if (blankCount === 0) throw new Error('No blanks found in dialogue');

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
  const answers = [];
  let currentAnswer = '';
  let currentAlternatives: string[] = [];
  let currentIndex = -1;
  let collecting = false;

  for (const line of allLines) {
    if (line.includes('### Answers')) {
      collecting = true;
      continue;
    }
    if (collecting && line.trim().startsWith('###')) {
      break;
    }

    if (!collecting) continue;

    const trimmed = line.trim();

    // New blank marker
    if (trimmed.match(/^\*\*Blank \d+\*\*:/)) {
      // Save previous if exists
      if (currentIndex >= 0) {
        answers.push({
          index: currentIndex,
          answer: currentAnswer,
          alternatives: currentAlternatives,
        });
      }

      // Parse new blank
      const match = trimmed.match(/^\*\*Blank (\d+)\*\*: `([^`]+)`/);
      if (match) {
        currentIndex = parseInt(match[1]) - 1; // 0-indexed
        currentAnswer = match[2];
        currentAlternatives = [];
      }
    }
    // Alternatives line: starts with "- Alternatives:" or contains backtick-quoted alternatives
    else if (trimmed.includes('Alternatives:')) {
      const altMatch = trimmed.match(/Alternatives: (.*)/);
      if (altMatch) {
        const altText = altMatch[1];
        // Extract alternatives: `alt1`, `alt2`, or _(none)_
        if (altText.includes('_(none)_')) {
          currentAlternatives = [];
        } else {
          const alts = altText.match(/`([^`]+)`/g);
          if (alts) {
            currentAlternatives = alts.map(a => a.replace(/`/g, ''));
          }
        }
      }
    }
  }

  // Don't forget last answer
  if (currentIndex >= 0) {
    answers.push({
      index: currentIndex,
      answer: currentAnswer,
      alternatives: currentAlternatives,
    });
  }

  if (answers.length !== expectedCount) {
    throw new Error(
      `Answer count mismatch: found ${answers.length} answers but expected ${expectedCount} blanks`
    );
  }

  return answers;
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

  let parsed: any;
  try {
    parsed = yaml.load(yamlContent);
  } catch (e) {
    throw new Error(`YAML parse error: ${(e as Error).message}`);
  }

  // Extract chunkFeedback
  const chunkFeedbackV2: ChunkFeedbackV2[] = [];
  const chunkFeedbackObj = parsed.chunkFeedback || {};

  for (const [chunkId, chunk] of Object.entries(chunkFeedbackObj)) {
    const chunkData = chunk as any;
    chunkFeedbackV2.push({
      chunkId,
      native: chunkData.native,
      learner: {
        meaning: chunkData.learner.meaning,
        useWhen: chunkData.learner.useWhen,
        commonWrong: chunkData.learner.commonWrong,
        fix: chunkData.learner.fix,
        whyOdd: chunkData.learner.whyOdd,
      },
      examples: chunkData.examples || [],
    });
  }

  // Extract blanksInOrder
  const blanksInOrder: BlankMapping[] = parsed.blanksInOrder || [];

  // Extract patternSummary
  const patternSummaryRaw = parsed.patternSummary || {};
  const patternSummary: PatternSummary = {
    categoryBreakdown: (patternSummaryRaw.categoryBreakdown || []).map((cat: any) => ({
      category: cat.category,
      count: cat.count,
      exampleChunkIds: cat.examples || [],
      insight: cat.insight,
    })),
    overallInsight: patternSummaryRaw.overallInsight || '',
    keyPatterns: (patternSummaryRaw.keyPatterns || []).map((pattern: any) => ({
      pattern: pattern.pattern,
      explanation: pattern.explanation,
      chunkIds: pattern.chunks || [],
    })),
  };

  // Extract activeRecall
  const activeRecall: ActiveRecallItem[] = parsed.activeRecall || [];

  return {
    chunkFeedbackV2,
    blanksInOrder,
    patternSummary,
    activeRecall,
  };
}

/**
 * Convert parsed package to RoleplayScript format
 */
export function convertToRoleplayScript(pkg: ParsedPackage, scenarioId: string): RoleplayScript {
  return {
    id: scenarioId,
    category: pkg.category as any,
    topic: pkg.topic,
    context: pkg.context,
    characters: pkg.characters,
    dialogue: pkg.dialogue,
    answerVariations: pkg.answerVariations,
    chunkFeedbackV2: pkg.chunkFeedbackV2,
    blanksInOrder: pkg.blanksInOrder,
    patternSummary: pkg.patternSummary,
    activeRecall: pkg.activeRecall,
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
    console.error('Usage: npx tsx parsePackageMarkdown.ts <path-to-markdown>');
    process.exit(1);
  }

  try {
    const pkg = parsePackageMarkdown(filePath);
    console.log(JSON.stringify(pkg, null, 2));
  } catch (e) {
    console.error(`Error parsing ${filePath}:`, (e as Error).message);
    process.exit(1);
  }
}
