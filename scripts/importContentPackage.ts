import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { CURATED_ROLEPLAYS, RoleplayScript, ChunkFeedbackV2 } from '../src/services/staticData';
import { parsePackageMarkdown, convertToRoleplayScript } from './parsePackageMarkdown';
import { validatePackage, ParsedPackage as ValidatorPackage, ValidationError } from './contentGeneration/packageValidator';

/**
 * Import a content package markdown file into staticData.ts
 * Replaces or adds the scenario based on scenarioId
 * Usage: npm run import:package -- --file=healthcare-1-gp-appointment-PATCHED-3_02122026.md
 */

type ParsedContentPackage = ReturnType<typeof parsePackageMarkdown>;

type FixedChunkFeedback = ChunkFeedbackV2;

const writeLine = (message = ''): void => {
  process.stdout.write(`${message}\n`);
};

const writeWarnLine = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

const writeErrorLine = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

const getErrorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

const formatValidationMessage = (entry: ValidationError | string): string => (
  typeof entry === 'string' ? entry : entry.message
);

const formatValidationLocation = (entry: ValidationError | string): string => (
  typeof entry === 'object' && entry.location ? ` (${entry.location})` : ''
);

function parseArgs(): string {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--file=')) {
      return arg.substring('--file='.length);
    }
    if (arg === '--file' && i + 1 < args.length) {
      return args[i + 1];
    }
  }

  writeErrorLine('Usage: npm run import:package -- --file=<filename>');
  writeErrorLine('Example: npm run import:package -- --file=healthcare-1-gp-appointment-PATCHED-3_02122026.md');
  process.exit(1);
}

/**
 * Replace or add a scenario in the array
 */
function mergeScenario(scenario: RoleplayScript, currentData: RoleplayScript[]): RoleplayScript[] {
  const index = currentData.findIndex((existingScenario) => existingScenario.id === scenario.id);
  if (index === -1) {
    return [...currentData, scenario];
  }

  return currentData.map((existingScenario, scenarioIndex) => (
    scenarioIndex === index ? scenario : existingScenario
  ));
}

/**
 * Regenerate staticData.ts with updated scenarios
 */
function generateStaticDataFile(scenarios: RoleplayScript[]): string {
  const originalPath = path.join(process.cwd(), 'src/services/staticData.ts');
  const originalContent = fs.readFileSync(originalPath, 'utf-8');

  const lines = originalContent.split('\n');
  let startIndex = -1;
  let endIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('export const CURATED_ROLEPLAYS')) {
      startIndex = i;
    }
    if (startIndex !== -1 && line.trim() === '];') {
      endIndex = i;
      break;
    }
  }

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Could not find CURATED_ROLEPLAYS in staticData.ts');
  }

  // Generate new array with proper formatting
  const scenariosJson = JSON.stringify(scenarios, null, 2);
  const newArray = `export const CURATED_ROLEPLAYS: RoleplayScript[] = ${scenariosJson};`;

  // Reconstruct file
  const newContent = [
    ...lines.slice(0, startIndex),
    newArray,
    ...lines.slice(endIndex + 1),
  ].join('\n');

  return newContent;
}

const countDialogueBlanks = (parsedPackage: ParsedContentPackage): number => (
  parsedPackage.dialogue.reduce(
    (sum, dialogueLine) => sum + (dialogueLine.text.match(/________/g) || []).length,
    0
  )
);

const fixNativeFields = (parsedPackage: ParsedContentPackage): FixedChunkFeedback[] => (
  parsedPackage.chunkFeedbackV2.map((chunk, idx) => {
    const mapping = parsedPackage.blanksInOrder[idx];
    if (mapping && mapping.chunkId === chunk.chunkId) {
      const answer = parsedPackage.answerVariations[idx];
      // If the native field doesn't match the answer, update it to match.
      if (answer && chunk.native !== answer.answer) {
        writeLine(`   ℹ️  Fixing native field: "${chunk.native}" → "${answer.answer}" for ${chunk.chunkId}`);
        return {
          ...chunk,
          native: answer.answer,
        };
      }
    }
    return chunk;
  })
);

const buildValidatorPackage = (
  parsedPackage: ParsedContentPackage,
  fixedChunkFeedback: FixedChunkFeedback[]
): ValidatorPackage => ({
  category: parsedPackage.category,
  scenarioId: parsedPackage.scenarioId,
  topic: parsedPackage.topic,
  context: parsedPackage.context,
  characters: parsedPackage.characters,
  dialogue: parsedPackage.dialogue,
  answers: parsedPackage.answerVariations,
  blanksInOrder: parsedPackage.blanksInOrder,
  chunkFeedback: fixedChunkFeedback,
  patternSummary: parsedPackage.patternSummary,
  activeRecall: parsedPackage.activeRecall,
  yamlBlock: '',
});

function main(): void {
  const fileName = parseArgs();
  const filePath = path.join(process.cwd(), 'exports/Content Packages_02122026', fileName);

  writeLine('\n📦 Importing content package...');
  writeLine(`   File: ${fileName}`);

  // Check file exists
  if (!fs.existsSync(filePath)) {
    writeErrorLine(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  // Parse markdown
  writeLine('\n🔍 Parsing markdown...');
  let parsedPackage: ParsedContentPackage;
  try {
    parsedPackage = parsePackageMarkdown(filePath);
  } catch (error) {
    writeErrorLine(`❌ Parse error: ${getErrorMessage(error)}`);
    process.exit(1);
  }

  writeLine(`✅ Parsed: ${parsedPackage.topic}`);
  writeLine(`   ID: ${parsedPackage.scenarioId}`);
  writeLine(`   Category: ${parsedPackage.category}`);

  const blankCount = countDialogueBlanks(parsedPackage);
  writeLine(`   Blanks: ${blankCount}`);

  // Validate package (transform to validator's expected format first)
  writeLine('\n🧪 Validating package (10 rules)...');

  // Transform parsed package to validator format.
  // Fix: update chunk native fields to match actual answers.
  // This is needed because packages may have full phrase native fields but only blank-fill answers.
  const fixedChunkFeedback = fixNativeFields(parsedPackage);
  const packageForValidator = buildValidatorPackage(parsedPackage, fixedChunkFeedback);

  // Also fix the parsed package for later use.
  parsedPackage = {
    ...parsedPackage,
    chunkFeedbackV2: fixedChunkFeedback,
  };

  const validation = validatePackage(packageForValidator);

  // Check for critical errors
  const criticalErrors = validation.errors.filter(error => (
    typeof error === 'object' && error.severity === 'critical'
  ));

  if (criticalErrors.length > 0) {
    writeErrorLine('\n❌ Validation failed with critical errors:');
    criticalErrors.forEach(error => {
      writeErrorLine(`   ❌ ${formatValidationMessage(error)}${formatValidationLocation(error)}`);
    });
    process.exit(1);
  }

  // Show warnings
  if (validation.warnings && validation.warnings.length > 0) {
    writeWarnLine('\n⚠️  Warnings (non-blocking):');
    validation.warnings.forEach(warning => {
      writeWarnLine(`   ${formatValidationMessage(warning)}`);
    });
  }

  writeLine('\n✅ All validations passed');

  // Convert to RoleplayScript
  writeLine('\n🔄 Converting to RoleplayScript format...');
  const roleplayScript = convertToRoleplayScript(parsedPackage, parsedPackage.scenarioId);

  // Check for existing scenario
  const existingScenario = CURATED_ROLEPLAYS.find(scenario => scenario.id === roleplayScript.id);
  if (existingScenario) {
    writeLine(`   ⚠️  Replacing existing scenario: ${roleplayScript.id}`);
  } else {
    writeLine(`   ✅ Adding new scenario: ${roleplayScript.id}`);
  }

  // Merge scenarios
  writeLine('\n🔄 Merging scenario...');
  const merged = mergeScenario(roleplayScript, CURATED_ROLEPLAYS);
  writeLine('   ✅ Scenario updated in array');

  // Create backup
  const staticDataPath = path.join(process.cwd(), 'src/services/staticData.ts');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('-').slice(0, 5).join('-');
  const backupPath = `${staticDataPath}.backup-${timestamp}`;

  writeLine('\n💾 Creating backup...');
  fs.copyFileSync(staticDataPath, backupPath);
  writeLine(`   ✅ Backup saved: ${backupPath}`);

  // Write updated file
  writeLine('\n📝 Writing updated staticData.ts...');
  try {
    const newContent = generateStaticDataFile(merged);
    fs.writeFileSync(staticDataPath, newContent, 'utf-8');
    writeLine('   ✅ staticData.ts updated');
  } catch (error) {
    writeErrorLine(`❌ Error writing file: ${getErrorMessage(error)}`);
    process.exit(1);
  }

  // Run build
  writeLine('\n🔨 Building...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    writeLine('✅ Build succeeded');
  } catch {
    writeErrorLine('❌ Build failed');
    writeErrorLine(`   Restoring from backup: ${backupPath}`);
    fs.copyFileSync(backupPath, staticDataPath);
    process.exit(1);
  }

  // Run validation
  writeLine('\n✔️ Running feedback validation...');
  try {
    execSync('npm run validate:feedback', { stdio: 'inherit' });
    writeLine('✅ Feedback validation passed');
  } catch {
    writeErrorLine('❌ Feedback validation failed');
    writeErrorLine(`   Restoring from backup: ${backupPath}`);
    fs.copyFileSync(backupPath, staticDataPath);
    process.exit(1);
  }

  writeLine('\n✅✅✅ Package imported successfully! ✅✅✅');
  writeLine(`   Scenario: ${roleplayScript.topic}`);
  writeLine(`   ID: ${roleplayScript.id}`);
  writeLine(`   Category: ${roleplayScript.category}`);
  writeLine('   Status: Imported locally; complete review gates before production use');
}

try {
  main();
} catch (error) {
  writeErrorLine(`❌ Error: ${getErrorMessage(error)}`);
  process.exit(1);
}
