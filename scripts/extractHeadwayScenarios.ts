/**
 * New Headway Advanced Content Extraction
 * Interactive orchestration script for PDF extraction → RoleplayScript transformation
 *
 * Usage:
 *   npm run extract:headway -- --units=1-3 --dry-run
 *   npm run extract:headway -- --type=everyday --output=scenarios.json
 *   npm run extract:headway -- --target=25
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { extractPDFText } from '../src/services/pdfExtractor';
import { chunkPDFByUnits, sortChunksByRichness } from '../src/services/pdfChunker';
import {
  detectAllDialogues,
  filterDialoguesByConfidence,
  groupDialoguesByType,
  DetectedDialogue
} from '../src/services/headwayPatternDetector';
import { insertBlanksIntelligently } from '../src/services/blankInserter';
import { transformToRoleplayScript } from '../src/services/scenarioTransformer';
import type { TransformResult } from '../src/services/scenarioTransformer';
import { validateWithAdaptiveCompliance, suggestContentType, createConfigForScenario } from '../src/services/adaptiveChunkValidator';
import type { AdaptiveComplianceReport } from '../src/services/adaptiveChunkValidator';

/**
 * CLI Configuration
 */
interface CLIArgs {
  units?: string; // "1-3" or "all"
  type?: string; // "everyday", "listening", "speaking"
  dryRun: boolean;
  output?: string;
  target?: number; // Target number of scenarios
  verbose: boolean;
}

/**
 * Extracted scenario result with metadata
 */
interface ExtractedScenarioResult {
  id: string;
  detectedDialogue: DetectedDialogue;
  transformation: TransformResult | null;
  compliance: AdaptiveComplianceReport | null;
  status: 'accepted' | 'rejected' | 'pending';
  notes: string;
}

const writeLine = (message = ''): void => {
  process.stdout.write(`${message}\n`);
};

const writeError = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

const getErrorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

/**
 * Parse CLI arguments
 */
function parseArgs(): CLIArgs {
  const args = process.argv.slice(2);
  const config: CLIArgs = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose')
  };

  for (const arg of args) {
    if (arg.startsWith('--units=')) {
      config.units = arg.split('=')[1];
    } else if (arg.startsWith('--type=')) {
      config.type = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      config.output = arg.split('=')[1];
    } else if (arg.startsWith('--target=')) {
      config.target = parseInt(arg.split('=')[1], 10);
    }
  }

  return config;
}

/**
 * Create readline interface for interactive prompts
 */
function createPrompt(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Interactive dialogue approval loop
 */
async function approveDialogues(
  dialogues: DetectedDialogue[],
  targetCount: number = 20,
  dryRun: boolean = false
): Promise<ExtractedScenarioResult[]> {
  const approved: ExtractedScenarioResult[] = [];
  const rl = createPrompt();

  writeLine(`\n📋 Found ${dialogues.length} dialogues. Approving first ${targetCount}...\n`);

  for (let i = 0; i < dialogues.length && approved.length < targetCount; i++) {
    const dialogue = dialogues[i];
    writeLine(`\n${'─'.repeat(60)}`);
    writeLine(
      `[${i + 1}/${dialogues.length}] ${dialogue.type.toUpperCase()} | Confidence: ${(dialogue.confidence * 100).toFixed(0)}%`
    );
    writeLine(`Title: ${dialogue.title}`);
    writeLine(`Speakers: ${dialogue.speakers.join(', ')}`);
    writeLine(`Turns: ${dialogue.estimatedTurns}`);
    writeLine(`\nPreview: ${dialogue.rawText.substring(0, 150)}...`);

    if (dryRun) {
      writeLine('✓ (DRY RUN - auto-approved)');
      approved.push({
        id: `headway-${i + 1}`,
        detectedDialogue: dialogue,
        transformation: null,
        compliance: null,
        status: 'accepted',
        notes: 'Dry run auto-approval'
      });
    } else {
      const response = await new Promise<string>(resolve => {
        rl.question(
          '\n[a]ccept / [s]kip / [v]iew / [q]uit? ',
          answer => resolve(answer.toLowerCase().trim())
        );
      });

      if (response === 'a') {
        approved.push({
          id: `headway-${i + 1}`,
          detectedDialogue: dialogue,
          transformation: null,
          compliance: null,
          status: 'accepted',
          notes: 'User approved'
        });
        writeLine('✓ Approved');
      } else if (response === 's') {
        writeLine('⊘ Skipped');
      } else if (response === 'v') {
        writeLine(`\nFull text:\n${dialogue.rawText}\n`);
        i--; // Re-prompt for this item
      } else if (response === 'q') {
        writeLine('\n⊗ Extraction halted by user');
        break;
      } else {
        i--; // Re-prompt for this item
      }
    }
  }

  if (!dryRun) {
    rl.close();
  }

  return approved;
}

/**
 * Transform approved dialogues to RoleplayScript format
 */
function transformDialogues(
  approved: ExtractedScenarioResult[]
): ExtractedScenarioResult[] {
  writeLine(`\n⚙️  Transforming ${approved.length} approved dialogues...\n`);

  for (const result of approved) {
    try {
      // Parse dialogue into structured format
      const dialogueArray = parseDialogueFromText(result.detectedDialogue.rawText);

      // Insert blanks intelligently
      const blanked = insertBlanksIntelligently(dialogueArray, 12);

      // Create minimal scenario for transformation
      const scenario = {
        title: result.detectedDialogue.title,
        context: result.detectedDialogue.type,
        characters: result.detectedDialogue.speakers,
        dialogue: blanked.dialogue,
        answers: blanked.answers.map(a => ({
          index: a.index,
          lineIndex: -1,
          blankPosition: -1,
          answer: a.answer,
          alternatives: a.alternatives
        })),
        rawText: result.detectedDialogue.rawText
      };

      // Transform to RoleplayScript
      const transformed = transformToRoleplayScript(scenario);

      // Validate with adaptive compliance
      const contentType = suggestContentType(
        result.detectedDialogue.speakers,
        dialogueArray
      );
      const config = createConfigForScenario(contentType, 'C1');
      const compliance = validateWithAdaptiveCompliance(
        blanked.answers.map(a => a.answer),
        config
      );

      result.transformation = transformed;
      result.compliance = compliance;

      writeLine(
        `✓ ${result.detectedDialogue.title} | ${blanked.blanksInserted} blanks | ${compliance.complianceScore}% compliance`
      );
    } catch (error) {
      result.status = 'rejected';
      result.notes = `Transform error: ${error instanceof Error ? error.message : String(error)}`;
      writeLine(`✗ ${result.detectedDialogue.title} - Transform failed`);
    }
  }

  return approved;
}

/**
 * Parse dialogue from raw text
 */
function parseDialogueFromText(text: string): Array<{ speaker: string; text: string }> {
  const dialogue: Array<{ speaker: string; text: string }> = [];
  const lines = text.split('\n');

  for (const line of lines) {
    // Try colon format: "Speaker: text"
    let match = line.match(/^([^:]+):\s*(.+)$/);

    // Try double-space format: "Person A  text"
    if (!match) {
      match = line.match(/^(Person\s+[A-Z]|Speaker\s+\d+|[A-Z][a-z]+)\s{2,}(.+)$/);
    }

    if (match) {
      const speaker = match[1]!.trim();
      const text = match[2]!.trim();

      if (speaker.length > 0 && text.length > 2) {
        dialogue.push({ speaker, text });
      }
    }
  }

  return dialogue;
}

/**
 * Main extraction pipeline
 */
async function main() {
  const args = parseArgs();
  const pdfPath = path.resolve('Source Materials/New-Headway-Advanced-Student_s-Book.pdf');

  writeLine('\n🚀 New Headway Advanced Content Extraction Pipeline');
  writeLine('═'.repeat(60));

  // Check PDF exists
  if (!fs.existsSync(pdfPath)) {
    writeError(`❌ PDF not found: ${pdfPath}`);
    process.exit(1);
  }

  writeLine(`\n📖 Loading PDF: ${pdfPath}`);
  writeLine(`📏 Size: ${(fs.statSync(pdfPath).size / 1024 / 1024).toFixed(1)} MB`);

  // Extract PDF text
  writeLine('\n⏳ Extracting PDF text...');
  const extracted = await extractPDFText(pdfPath);
  writeLine(`✓ Extracted ${extracted.totalPages} pages`);

  // Chunk PDF
  writeLine('\n⏳ Chunking PDF by units...');
  const chunks = chunkPDFByUnits(extracted.pages, 20);
  writeLine(`✓ Created ${chunks.length} chunks`);

  if (args.verbose) {
    chunks.forEach(chunk => {
      writeLine(
        `  Unit ${chunk.unitNumber || '?'}: pages ${chunk.startPage}-${chunk.endPage}, richness: ${chunk.estimatedDialogueRichness}%`
      );
    });
  }

  // Detect dialogues
  writeLine('\n⏳ Detecting dialogues...');
  const richChunks = sortChunksByRichness(chunks).slice(0, Math.ceil(chunks.length / 2));
  const allDialogues: DetectedDialogue[] = [];

  for (const chunk of richChunks) {
    const detected = detectAllDialogues(chunk.extractedText, chunk.startPage);
    allDialogues.push(...detected);
  }

  writeLine(`✓ Detected ${allDialogues.length} potential dialogues`);

  // Filter by confidence
  const filtered = filterDialoguesByConfidence(allDialogues, 0.6);
  writeLine(`✓ ${filtered.length} meet confidence threshold (≥60%)`);

  // Show type breakdown
  const grouped = groupDialoguesByType(filtered);
  writeLine('\nBy type:');
  for (const [type, dialogues] of Object.entries(grouped)) {
    writeLine(`  ${type}: ${dialogues.length}`);
  }

  // Interactive approval
  const targetCount = args.target || 20;
  const approved = await approveDialogues(filtered, targetCount, args.dryRun);

  writeLine(`\n✓ Approved ${approved.length} dialogues`);

  // Transform
  const transformed = transformDialogues(approved.filter(a => a.status === 'accepted'));

  // Output results
  const outputPath = args.output || 'headway-extraction-results.json';
  fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2), 'utf-8');
  writeLine(`\n✓ Results saved to ${outputPath}`);

  // Summary
  const accepted = transformed.filter(t => t.status === 'accepted').length;
  const avgCompliance =
    transformed
      .filter(t => t.compliance)
      .reduce((sum, t) => sum + (t.compliance?.complianceScore || 0), 0) / (accepted || 1);

  writeLine('\n📊 Summary:');
  writeLine(`  Accepted: ${accepted}`);
  writeLine(`  Rejected: ${transformed.filter(t => t.status === 'rejected').length}`);
  writeLine(`  Average compliance: ${avgCompliance.toFixed(0)}%`);
  writeLine('\n✅ Extraction complete!');

  process.exit(0);
}

// Run extraction
main().catch(error => {
  writeError(`❌ Fatal error: ${getErrorMessage(error)}`);
  process.exit(1);
});
