import { CURATED_ROLEPLAYS } from '../services/staticData';

interface ValidationError {
  scenario: string;
  field: string;
  issue: string;
  value?: string;
  details?: {
    expectedBlankCount?: number;
    actualAnswerCount?: number;
    missingIndices?: number[];
    orphanedDeepDiveIndices?: number[];
    affectedDialogueLines?: string[];
  };
}

const errors: ValidationError[] = [];
const scenariosMissingAnswers: Array<{
  scenarioId: string;
  topic: string;
  blankCount: number;
  answerCount: number;
  missingIndices: number[];
  orphanedDeepDiveIndices: number[];
}> = [];

// Helper to check if string contains Chinese characters, emoji, or other non-Latin scripts
// Allows: English letters, numbers, spaces, common punctuation (.,;:!?—–'/"), hyphens, parentheses, brackets
function hasNonLatinScript(str: string): boolean {
  // Check for Chinese characters (CJK range), emoji, Cyrillic, Arabic, etc.
  // Exclude ASCII letters, numbers, spaces, and common punctuation
  const chineseEmojiRegex = /[\u4e00-\u9fff\u3400-\u4dbf\ud800-\udbff\udc00-\udfff\u3040-\u309f\u30a0-\u30ff]/g;
  return chineseEmojiRegex.test(str);
}

// Helper to check if object has valid AnswerVariation structure
function validateAnswerVariation(av: any, scenarioId: string): void {
  if (typeof av.index !== 'number') {
    errors.push({
      scenario: scenarioId,
      field: 'answerVariations',
      issue: 'Missing or invalid index field',
      value: JSON.stringify(av)
    });
    return;
  }

  if (!av.answer || typeof av.answer !== 'string') {
    errors.push({
      scenario: scenarioId,
      field: `answerVariations[${av.index}]`,
      issue: 'Missing or invalid answer field (should be "answer", not other property names)',
      value: JSON.stringify(av)
    });
    return;
  }

  if (!Array.isArray(av.alternatives) || !av.alternatives.every(a => typeof a === 'string')) {
    errors.push({
      scenario: scenarioId,
      field: `answerVariations[${av.index}]`,
      issue: 'Missing or invalid alternatives array',
      value: JSON.stringify(av)
    });
    return;
  }

  // Check for non-Latin characters in answers
  if (hasNonLatinScript(av.answer)) {
    errors.push({
      scenario: scenarioId,
      field: `answerVariations[${av.index}]!.answer`,
      issue: 'Contains non-Latin characters (e.g., Chinese, emoji)',
      value: av.answer
    });
  }

  // Check alternatives for non-Latin characters
  av.alternatives.forEach((alt: string, i: number) => {
    if (hasNonLatinScript(alt)) {
      errors.push({
        scenario: scenarioId,
        field: `answerVariations[${av.index}]!.alternatives[${i}]`,
        issue: 'Contains non-Latin characters (e.g., Chinese, emoji)',
        value: alt
      });
    }
  });

  // Check for invalid property keys (should only have index, answer, alternatives)
  const validKeys = new Set(['index', 'answer', 'alternatives']);
  Object.keys(av).forEach(key => {
    if (!validKeys.has(key)) {
      errors.push({
        scenario: scenarioId,
        field: `answerVariations[${av.index}]`,
        issue: `Invalid property key: "${key}" (should be "answer", not "${key}")`,
        value: JSON.stringify(av)
      });
    }
  });
}

// Validate all scenarios
CURATED_ROLEPLAYS.forEach(scenario => {
  // Count blanks in dialogue
  const blankCount = scenario.dialogue.reduce((sum, line) => {
    return sum + (line.text.match(/________/g) || []).length;
  }, 0);

  // Validate answerVariations
  if (Array.isArray(scenario.answerVariations)) {
    scenario.answerVariations.forEach(av => {
      validateAnswerVariation(av, scenario.id);
    });

    // Check blank count vs answer variations count
    const answerCount = scenario.answerVariations.length;
    if (blankCount !== answerCount) {
      // Identify missing indices
      const presentIndices = new Set(scenario.answerVariations.map(av => av.index));
      const missingIndices: number[] = [];
      for (let i = 1; i <= blankCount; i++) {
        if (!presentIndices.has(i)) {
          missingIndices.push(i);
        }
      }

      const affectedDialogueLines: string[] = [];
      let blankIndex = 0;
      scenario.dialogue.forEach(line => {
        const blanksInLine = (line.text.match(/________/g) || []).length;
        for (let i = 0; i < blanksInLine; i++) {
          blankIndex++;
          if (missingIndices.includes(blankIndex)) {
            affectedDialogueLines.push(`Line ${scenario.dialogue.indexOf(line) + 1}: "${line.text}"`);
          }
        }
      });

      errors.push({
        scenario: scenario.id,
        field: 'answerVariations',
        issue: `Blank count mismatch: ${blankCount} blanks in dialogue but only ${answerCount} answer variations (missing indices: ${missingIndices.join(', ')})`,
        details: {
          expectedBlankCount: blankCount,
          actualAnswerCount: answerCount,
          missingIndices,
          affectedDialogueLines
        }
      });

      // Track for report generation
      const orphanedDeepDiveIndices = scenario.deepDive
        ?.filter(dd => !presentIndices.has(dd.index))
        .map(dd => dd.index) || [];

      scenariosMissingAnswers.push({
        scenarioId: scenario.id,
        topic: scenario.topic,
        blankCount,
        answerCount,
        missingIndices,
        orphanedDeepDiveIndices
      });
    }

    // Check that indices are sequential (no gaps)
    const maxIndex = Math.max(...scenario.answerVariations.map(av => av.index), 0);
    if (maxIndex > blankCount) {
      errors.push({
        scenario: scenario.id,
        field: 'answerVariations',
        issue: `Max answer index (${maxIndex}) exceeds blank count in dialogue (${blankCount})`
      });
    }
  }

  // Validate deepDive
  if (Array.isArray(scenario.deepDive)) {
    scenario.deepDive.forEach((dd, i) => {
      if (typeof dd.index !== 'number' || typeof dd.phrase !== 'string' || typeof dd.insight !== 'string') {
        errors.push({
          scenario: scenario.id,
          field: `deepDive[${i}]`,
          issue: 'Invalid deepDive structure (missing index, phrase, or insight)',
          value: JSON.stringify(dd)
        });
      }

      if (hasNonLatinScript(dd.phrase)) {
        errors.push({
          scenario: scenario.id,
          field: `deepDive[${i}]!.phrase`,
          issue: 'Contains non-Latin characters',
          value: dd.phrase
        });
      }

      if (hasNonLatinScript(dd.insight)) {
        errors.push({
          scenario: scenario.id,
          field: `deepDive[${i}]!.insight`,
          issue: 'Contains non-Latin characters',
          value: dd.insight
        });
      }

      // Check if deepDive index references existing answer variation
      if (Array.isArray(scenario.answerVariations)) {
        const presentIndices = new Set(scenario.answerVariations.map(av => av.index));
        if (!presentIndices.has(dd.index)) {
          errors.push({
            scenario: scenario.id,
            field: `deepDive[${i}]`,
            issue: `deepDive references index ${dd.index} which has no corresponding answer variation (orphaned)`,
            value: JSON.stringify(dd)
          });
        }
      }
    });
  }
});

// Report results
console.log('\n=== Scenario Data Validation Report ===\n');

if (errors.length === 0) {
  console.log('✅ All scenarios passed validation!');
  console.log(`\nValidated ${CURATED_ROLEPLAYS.length} scenarios with zero errors.`);
} else {
  console.error(`❌ Found ${errors.length} validation error(s):\n`);
  errors.forEach((error, index) => {
    console.error(`${index + 1}. [${error.scenario}] ${error.field}`);
    console.error(`   Issue: ${error.issue}`);
    if (error.value) {
      console.error(`   Value: ${error.value}`);
    }
    if (error.details?.affectedDialogueLines) {
      console.error(`   Affected dialogue lines:`);
      error.details.affectedDialogueLines.forEach(line => {
        console.error(`     - ${line}`);
      });
    }
    console.error();
  });

  // Show summary of scenarios needing fixes
  if (scenariosMissingAnswers.length > 0) {
    console.error('\n=== Summary: Scenarios with Missing Answer Variations ===\n');
    console.error(`Total scenarios affected: ${scenariosMissingAnswers.length}\n`);

    scenariosMissingAnswers.sort((a, b) => b.missingIndices.length - a.missingIndices.length);
    scenariosMissingAnswers.forEach(scenario => {
      console.error(`• ${scenario.scenarioId} (${scenario.topic})`);
      console.error(`  Expected: ${scenario.blankCount} blanks, Found: ${scenario.answerCount} answers`);
      console.error(`  Missing indices: ${scenario.missingIndices.join(', ')}`);
      if (scenario.orphanedDeepDiveIndices.length > 0) {
        console.error(`  Orphaned deepDive indices: ${scenario.orphanedDeepDiveIndices.join(', ')}`);
      }
      console.error();
    });
  }

  process.exit(1);
}
