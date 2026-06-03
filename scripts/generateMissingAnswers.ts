import * as fs from 'fs';
import * as path from 'path';
import { CURATED_ROLEPLAYS, type RoleplayScript } from '../src/services/staticData';

type DialogueLine = RoleplayScript['dialogue'][number];
type AnswerVariation = RoleplayScript['answerVariations'][number];
type DeepDiveHint = {
  index: number;
  phrase: string;
  insight: string;
};

interface DialogueLineMatch {
  line: DialogueLine;
  lineNumber: number;
}

interface MissingAnswerContext {
  scenarioId: string;
  topic: string;
  missingAnswers: {
    index: number;
    dialogueLine: string;
    dialogueLineNumber: number;
    speaker: string;
    previousAnswer?: AnswerVariation;
    nextAnswer?: AnswerVariation;
    deepDiveHint?: DeepDiveHint;
    context: string;
  }[];
}

const BLANK_PATTERN = /________/g;

function writeOut(message = ''): void {
  process.stdout.write(`${message}\n`);
}

function countBlanks(text: string): number {
  return text.match(BLANK_PATTERN)?.length ?? 0;
}

function getDeepDiveHint(scenario: RoleplayScript, blankIndex: number): DeepDiveHint | undefined {
  if (!('deepDive' in scenario) || !Array.isArray(scenario.deepDive)) {
    return undefined;
  }

  return scenario.deepDive.find((deepDiveItem) => deepDiveItem.index === blankIndex);
}

function getDialogueContext(scenario: RoleplayScript, blankIndex: number): string {
  let currentBlank = 0;
  const contextLines: string[] = [];

  scenario.dialogue.forEach((line, lineIndex) => {
    const blanksInLine = countBlanks(line.text);
    const lineStart = currentBlank + 1;
    const lineEnd = currentBlank + blanksInLine;
    currentBlank += blanksInLine;

    if (lineStart <= blankIndex && lineEnd >= blankIndex) {
      const previousLine = scenario.dialogue[lineIndex - 1];
      const nextLine = scenario.dialogue[lineIndex + 1];

      if (previousLine) {
        contextLines.push(`(prev) ${previousLine.speaker}: ${previousLine.text}`);
      }

      contextLines.push(`${line.speaker}: ${line.text}`);

      if (nextLine) {
        contextLines.push(`(next) ${nextLine.speaker}: ${nextLine.text}`);
      }
    }
  });

  return contextLines.join('\n');
}

function findDialogueLine(scenario: RoleplayScript, blankIndex: number): DialogueLineMatch | null {
  let currentBlank = 0;

  for (const [lineIndex, line] of scenario.dialogue.entries()) {
    const blanksInLine = countBlanks(line.text);

    for (let blankOffset = 0; blankOffset < blanksInLine; blankOffset += 1) {
      currentBlank += 1;

      if (currentBlank === blankIndex) {
        return { line, lineNumber: lineIndex + 1 };
      }
    }
  }

  return null;
}

function getPreviousAnswer(answerVariations: AnswerVariation[], blankIndex: number): AnswerVariation | undefined {
  return answerVariations
    .filter((answerVariation) => answerVariation.index < blankIndex)
    .sort((first, second) => second.index - first.index)[0];
}

function getNextAnswer(answerVariations: AnswerVariation[], blankIndex: number): AnswerVariation | undefined {
  return answerVariations
    .filter((answerVariation) => answerVariation.index > blankIndex)
    .sort((first, second) => first.index - second.index)[0];
}

function getMissingIndices(scenario: RoleplayScript): number[] {
  const blankCount = scenario.dialogue.reduce((sum, line) => sum + countBlanks(line.text), 0);
  const presentIndices = new Set(scenario.answerVariations.map((answerVariation) => answerVariation.index));
  const missingIndices: number[] = [];

  for (let index = 1; index <= blankCount; index += 1) {
    if (!presentIndices.has(index)) {
      missingIndices.push(index);
    }
  }

  return missingIndices;
}

function buildMissingAnswerContext(scenario: RoleplayScript, index: number): MissingAnswerContext['missingAnswers'][number] {
  const dialogueInfo = findDialogueLine(scenario, index);

  return {
    index,
    dialogueLine: dialogueInfo?.line.text ?? '(line not found)',
    dialogueLineNumber: dialogueInfo?.lineNumber ?? -1,
    speaker: dialogueInfo?.line.speaker ?? '(unknown)',
    previousAnswer: getPreviousAnswer(scenario.answerVariations, index),
    nextAnswer: getNextAnswer(scenario.answerVariations, index),
    deepDiveHint: getDeepDiveHint(scenario, index),
    context: getDialogueContext(scenario, index)
  };
}

function buildReportData(scenarios: RoleplayScript[]): MissingAnswerContext[] {
  return scenarios.reduce<MissingAnswerContext[]>((report, scenario) => {
    const missingIndices = getMissingIndices(scenario);

    if (missingIndices.length === 0) {
      return report;
    }

    report.push({
      scenarioId: scenario.id,
      topic: scenario.topic,
      missingAnswers: missingIndices.map((index) => buildMissingAnswerContext(scenario, index))
    });

    return report;
  }, []);
}

function printMissingAnswer(missing: MissingAnswerContext['missingAnswers'][number]): void {
  writeOut(`   Index ${missing.index}:`);
  writeOut(`   Dialogue (Line ${missing.dialogueLineNumber}): "${missing.dialogueLine}"`);
  writeOut(`   Speaker: ${missing.speaker}`);

  if (missing.previousAnswer) {
    writeOut(`   Previous answer (index ${missing.previousAnswer.index}): "${missing.previousAnswer.answer}"`);
    writeOut(`      Alternatives: ${missing.previousAnswer.alternatives.join(', ')}`);
  }

  if (missing.nextAnswer) {
    writeOut(`   Next answer (index ${missing.nextAnswer.index}): "${missing.nextAnswer.answer}"`);
    writeOut(`      Alternatives: ${missing.nextAnswer.alternatives.join(', ')}`);
  }

  if (missing.deepDiveHint) {
    writeOut(`   DeepDive hint: "${missing.deepDiveHint.phrase}"`);
    writeOut(`      Insight: ${missing.deepDiveHint.insight}`);
  }

  writeOut();
  writeOut('   Dialogue Context:');
  missing.context.split('\n').forEach((line) => {
    writeOut(`      ${line}`);
  });

  writeOut();
}

function printReport(reportData: MissingAnswerContext[], reportPath: string): void {
  writeOut();
  writeOut('=== Missing Answer Variations Report ===');
  writeOut();
  writeOut(`Generated report for ${reportData.length} scenarios with missing answers.`);

  reportData.forEach((scenario) => {
    writeOut();
    writeOut(`${scenario.scenarioId} - ${scenario.topic}`);
    writeOut(`   Missing: ${scenario.missingAnswers.length} answer(s)`);
    writeOut();

    scenario.missingAnswers.forEach(printMissingAnswer);
  });

  writeOut();
  writeOut(`Report saved to: ${reportPath}`);
  writeOut();
  writeOut('Next steps:');
  writeOut('1. Review the report file for missing answers and context');
  writeOut('2. Manually add the missing answer variations to src/services/staticData.ts');
  writeOut('3. Run "npm run validate" to verify the fixes');
  writeOut();
}

const reportData = buildReportData(CURATED_ROLEPLAYS);
const reportPath = path.join(process.cwd(), 'missing-answers-report.json');

fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
printReport(reportData, reportPath);
