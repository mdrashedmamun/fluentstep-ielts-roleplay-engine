/**
 * Unit 4 RoleplayScript Scenario Generator
 * Transforms extracted dialogues into complete RoleplayScript format
 * with intelligent blank insertion and LOCKED_CHUNKS alignment
 */

import { insertBlanksIntelligently, type BlankInsertionResult } from '../src/services/blankInserter';
import { transformToRoleplayScript } from '../src/services/scenarioTransformer';
import {
  validateWithAdaptiveCompliance,
  type AdaptiveComplianceReport
} from '../src/services/adaptiveChunkValidator';
import { UNIT_4_DIALOGUES } from './unit4Transcription';
import type { RoleplayScript } from '../src/services/staticData';
import type { ParsedDialogue, ParsedScenario } from '../src/services/scenarioParser';

interface GeneratedScenario {
  id: string;
  roleplayScript: RoleplayScript;
  compliance: BlankInsertionResult;
  validation: AdaptiveComplianceReport;
}

const writeOut = (message = ''): void => {
  process.stdout.write(`${message}\n`);
};

const writeErr = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

const getErrorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

const isParsedDialogue = (line: ParsedDialogue | null): line is ParsedDialogue => line !== null;

function generateUnit4Scenarios(): GeneratedScenario[] {
  writeOut('\n🚀 Unit 4 RoleplayScript Scenario Generation\n');
  writeOut('═'.repeat(70));

  const results: GeneratedScenario[] = [];

  for (const dialogue of UNIT_4_DIALOGUES) {
    writeOut('\n📖 Processing: ' + dialogue.title);
    writeOut('─'.repeat(70));

    try {
      // Step 1: Parse dialogue structure.
      const dialogueLines = dialogue.dialogue.map((line): ParsedDialogue | null => {
        const match = line.match(/^([^:]+):\s*(.+)$/);
        if (!match) return null;
        return {
          speaker: match[1]!.trim(),
          text: match[2]!.trim(),
        };
      }).filter(isParsedDialogue);

      writeOut('  ✓ Parsed ' + dialogueLines.length + ' dialogue turns');

      // Step 2: Insert blanks intelligently.
      const blankResult = insertBlanksIntelligently(dialogueLines, 10);

      writeOut('  ✓ Inserted ' + blankResult.blanksInserted + ' blanks');
      writeOut(
        '    BUCKET_A: ' + blankResult.chunkMatches.bucketA + ' | ' +
          'BUCKET_B: ' + blankResult.chunkMatches.bucketB + ' | ' +
          'NOVEL: ' + blankResult.chunkMatches.novel
      );
      writeOut('    Compliance: ' + blankResult.chunkComplianceScore + '%');

      // Step 3: Validate with adaptive thresholds.
      const validation = validateWithAdaptiveCompliance(
        blankResult.answers.map(answer => answer.answer),
        {
          contentType: 'academic_discussion',
          targetCompliance: 60,
          allowNovelVocabulary: true,
          ieltsLevel: 'C1',
        }
      );

      writeOut('  ✓ Validation compliance: ' + validation.complianceScore + '%');
      writeOut('    Status: ' + (validation.passesAdaptiveThreshold ? 'passed' : 'needs review'));

      // Step 4: Transform to RoleplayScript.
      const parsedScenario: ParsedScenario = {
        title: dialogue.title,
        context: dialogue.context,
        characters: Array.from(new Set(dialogueLines.map(line => line.speaker))),
        dialogue: blankResult.dialogue,
        answers: blankResult.answers.map((answer, index) => ({
          index: answer.index,
          lineIndex: index,
          blankPosition: index,
          answer: answer.answer,
          alternatives: answer.alternatives,
        })),
        rawText: dialogue.dialogue.join('\n'),
      };

      const { scenario: roleplayScript } = transformToRoleplayScript(parsedScenario);

      writeOut('  ✓ Generated RoleplayScript: ' + roleplayScript.id);
      writeOut('    Dialogue turns: ' + roleplayScript.dialogue.length);
      writeOut('    Blanks: ' + roleplayScript.answerVariations.length);

      results.push({
        id: roleplayScript.id,
        roleplayScript,
        compliance: blankResult,
        validation,
      });

      writeOut('  ✅ COMPLETE: ' + dialogue.title + '\n');
    } catch (error) {
      writeErr('  ❌ ERROR: ' + getErrorMessage(error));
    }
  }

  const averageCompliance = results.length > 0
    ? (results.reduce((sum, result) => sum + result.compliance.chunkComplianceScore, 0) / results.length).toFixed(1)
    : '0.0';
  const averageValidationCompliance = results.length > 0
    ? (results.reduce((sum, result) => sum + result.validation.complianceScore, 0) / results.length).toFixed(1)
    : '0.0';

  writeOut('\n' + '═'.repeat(70));
  writeOut('\n📊 GENERATION SUMMARY\n');
  writeOut('Total scenarios generated: ' + results.length);
  writeOut('Average compliance: ' + averageCompliance + '%');
  writeOut('Average validation compliance: ' + averageValidationCompliance + '%');
  writeOut('\n✅ All scenarios ready for review\n');

  return results;
}

// Run generation.
generateUnit4Scenarios();
