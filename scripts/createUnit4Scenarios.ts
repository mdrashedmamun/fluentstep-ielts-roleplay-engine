/**
 * Unit 4 RoleplayScript Scenario Generator
 * Transforms extracted dialogues into complete RoleplayScript format
 * with intelligent blank insertion and LOCKED_CHUNKS alignment
 */

import { insertBlanksIntelligently } from '../services/blankInserter';
import { transformToRoleplayScript } from '../services/scenarioTransformer';
import { validateWithAdaptiveCompliance } from '../services/adaptiveChunkValidator';
import { UNIT_4_DIALOGUES } from './unit4Transcription';
import type { RoleplayScript } from '../services/staticData';

interface GeneratedScenario {
  id: string;
  roleplayScript: RoleplayScript;
  compliance: any;
  validation: any;
}

async function generateUnit4Scenarios(): Promise<GeneratedScenario[]> {
  console.log('\n🚀 Unit 4 RoleplayScript Scenario Generation\n');
  console.log('═'.repeat(70));

  const results: GeneratedScenario[] = [];

  for (const dialogue of UNIT_4_DIALOGUES) {
    console.log(`\n📖 Processing: ${dialogue.title}`);
    console.log('─'.repeat(70));

    try {
      // Step 1: Parse dialogue structure
      const dialogueLines = dialogue.dialogue.map((line) => {
        const match = line.match(/^([^:]+):\s*(.+)$/);
        if (!match) return null;
        return {
          speaker: match[1]!.trim(),
          text: match[2]!.trim(),
        };
      }).filter(Boolean) as Array<{ speaker: string; text: string }>;

      console.log(`  ✓ Parsed ${dialogueLines.length} dialogue turns`);

      // Step 2: Insert blanks intelligently
      const blankResult = insertBlanksIntelligently(dialogueLines, {
        targetBlanks: 10,
        prioritizePhrasal: true,
        balanceRatio: [0.7, 0.25, 0.05], // BUCKET_A, BUCKET_B, NOVEL
      });

      console.log(`  ✓ Inserted ${blankResult.blanksInserted} blanks`);
      console.log(`    BUCKET_A: ${blankResult.chunkMatches.bucketA} | ` +
                  `BUCKET_B: ${blankResult.chunkMatches.bucketB} | ` +
                  `NOVEL: ${blankResult.chunkMatches.novel}`);
      console.log(`    Compliance: ${blankResult.chunkComplianceScore}%`);

      // Step 3: Validate with adaptive thresholds
      const validation = validateWithAdaptiveCompliance(
        blankResult,
        'Academic Discussion', // C1-C2 advanced content
        'Advanced'
      );

      console.log(`  ✓ Validation confidence: ${validation.confidence}%`);
      console.log(`    Status: ${validation.status}`);

      // Step 4: Transform to RoleplayScript
      const roleplayScript = transformToRoleplayScript(
        dialogue.id.replace('unit4-dialogue-', 'advanced-').replace('-', '-unit4-'),
        dialogue.title,
        dialogue.context,
        blankResult,
        'Advanced'
      );

      console.log(`  ✓ Generated RoleplayScript: ${roleplayScript.id}`);
      console.log(`    Dialogue turns: ${roleplayScript.dialogue.length}`);
      console.log(`    Blanks: ${roleplayScript.answerVariations.length}`);

      results.push({
        id: roleplayScript.id,
        roleplayScript,
        compliance: blankResult,
        validation,
      });

      console.log(`  ✅ COMPLETE: ${dialogue.title}\n`);

    } catch (error) {
      console.error(`  ❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('\n📊 GENERATION SUMMARY\n');
  console.log(`Total scenarios generated: ${results.length}`);
  console.log(`Average compliance: ${(results.reduce((sum, r) => sum + r.compliance.chunkComplianceScore, 0) / results.length).toFixed(1)}%`);
  console.log(`Average validation confidence: ${(results.reduce((sum, r) => sum + r.validation.confidence, 0) / results.length).toFixed(1)}%`);

  console.log('\n✅ All scenarios ready for review\n');

  return results;
}

// Run generation
generateUnit4Scenarios().catch(console.error);
