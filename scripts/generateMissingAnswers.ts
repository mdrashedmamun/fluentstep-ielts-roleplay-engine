import { CURATED_ROLEPLAYS } from '../src/services/staticData';
import * as fs from 'fs';
import * as path from 'path';

interface MissingAnswerContext {
  scenarioId: string;
  topic: string;
  missingAnswers: {
    index: number;
    dialogueLine: string;
    dialogueLineNumber: number;
    speaker: string;
    previousAnswer?: { index: number; answer: string; alternatives: string[] };
    nextAnswer?: { index: number; answer: string; alternatives: string[] };
    deepDiveHint?: { phrase: string; insight: string };
    context: string; // surrounding dialogue for understanding
  }[];
}

// Helper to extract surrounding dialogue context
function getDialogueContext(scenario: any, blankIndex: number): string {
  let currentBlank = 0;
  let contextLines: string[] = [];

  scenario.dialogue.forEach((line: any, lineIdx: number) => {
    const blanksInLine = (line.text.match(/________/g) || []).length;
    const lineStart = currentBlank + 1;
    const lineEnd = currentBlank + blanksInLine;
    currentBlank += blanksInLine;

    // Include lines around the target blank
    if (lineStart <= blankIndex && lineEnd >= blankIndex) {
      // Include 1 line before and after for context
      if (lineIdx > 0) {
        contextLines.push(`(prev) ${scenario.dialogue[lineIdx - 1].speaker}: ${scenario.dialogue[lineIdx - 1].text}`);
      }
      contextLines.push(`${line.speaker}: ${line.text}`);
      if (lineIdx < scenario.dialogue.length - 1) {
        contextLines.push(`(next) ${scenario.dialogue[lineIdx + 1].speaker}: ${scenario.dialogue[lineIdx + 1].text}`);
      }
    }
  });

  return contextLines.join('\n');
}

// Helper to find dialogue line containing a blank index
function findDialogueLine(scenario: any, blankIndex: number): { line: any; lineNumber: number } | null {
  let currentBlank = 0;

  for (let lineIdx = 0; lineIdx < scenario.dialogue.length; lineIdx++) {
    const line = scenario.dialogue[lineIdx];
    const blanksInLine = (line.text.match(/________/g) || []).length;

    for (let i = 0; i < blanksInLine; i++) {
      currentBlank++;
      if (currentBlank === blankIndex) {
        return { line, lineNumber: lineIdx + 1 };
      }
    }
  }

  return null;
}

// Generate missing answer report
const reportData: MissingAnswerContext[] = [];

CURATED_ROLEPLAYS.forEach(scenario => {
  // Count blanks
  const blankCount = scenario.dialogue.reduce((sum: number, line: any) => {
    return sum + (line.text.match(/________/g) || []).length;
  }, 0);

  // Identify missing indices
  const presentIndices = new Set(scenario.answerVariations.map((av: any) => av.index));
  const missingIndices: number[] = [];

  for (let i = 1; i <= blankCount; i++) {
    if (!presentIndices.has(i)) {
      missingIndices.push(i);
    }
  }

  if (missingIndices.length > 0) {
    const missingAnswers = missingIndices.map(index => {
      const dialogueInfo = findDialogueLine(scenario, index);
      const context = getDialogueContext(scenario, index);

      // Find adjacent answer variations
      const previousAnswer = scenario.answerVariations
        .filter((av: any) => av.index < index)
        .sort((a: any, b: any) => b.index - a.index)[0];

      const nextAnswer = scenario.answerVariations
        .filter((av: any) => av.index > index)
        .sort((a: any, b: any) => a.index - b.index)[0];

      // Find deepDive hint
      const deepDiveHint = scenario.deepDive?.find((dd: any) => dd.index === index);

      return {
        index,
        dialogueLine: dialogueInfo?.line.text || '(line not found)',
        dialogueLineNumber: dialogueInfo?.lineNumber || -1,
        speaker: dialogueInfo?.line.speaker || '(unknown)',
        previousAnswer,
        nextAnswer,
        deepDiveHint,
        context
      };
    });

    reportData.push({
      scenarioId: scenario.id,
      topic: scenario.topic,
      missingAnswers
    });
  }
});

// Write report to file
const reportPath = path.join(process.cwd(), 'missing-answers-report.json');
fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

console.log('\n=== Missing Answer Variations Report ===\n');
console.log(`Generated report for ${reportData.length} scenarios with missing answers.\n`);

reportData.forEach(scenario => {
  console.log(`\n📋 ${scenario.scenarioId} - ${scenario.topic}`);
  console.log(`   Missing: ${scenario.missingAnswers.length} answer(s)\n`);

  scenario.missingAnswers.forEach(missing => {
    console.log(`   Index ${missing.index}:`);
    console.log(`   Dialogue (Line ${missing.dialogueLineNumber}): "${missing.dialogueLine}"`);
    console.log(`   Speaker: ${missing.speaker}`);

    if (missing.previousAnswer) {
      console.log(`   📌 Previous answer (index ${missing.previousAnswer.index}): "${missing.previousAnswer.answer}"`);
      console.log(`      Alternatives: ${missing.previousAnswer.alternatives.join(', ')}`);
    }

    if (missing.nextAnswer) {
      console.log(`   📌 Next answer (index ${missing.nextAnswer.index}): "${missing.nextAnswer.answer}"`);
      console.log(`      Alternatives: ${missing.nextAnswer.alternatives.join(', ')}`);
    }

    if (missing.deepDiveHint) {
      console.log(`   💡 DeepDive hint: "${missing.deepDiveHint.phrase}"`);
      console.log(`      Insight: ${missing.deepDiveHint.insight}`);
    }

    console.log(`\n   📍 Dialogue Context:`);
    missing.context.split('\n').forEach(line => {
      console.log(`      ${line}`);
    });

    console.log();
  });
});

console.log(`\n✅ Report saved to: ${reportPath}\n`);
console.log('Next steps:');
console.log('1. Review the report file for missing answers and context');
console.log('2. Manually add the missing answer variations to services/staticData.ts');
console.log('3. Run "npm run validate" to verify the fixes\n');
