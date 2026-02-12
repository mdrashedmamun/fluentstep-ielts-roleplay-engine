import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { CURATED_ROLEPLAYS, RoleplayScript } from '../src/services/staticData';
import { parsePackageMarkdown, convertToRoleplayScript } from './parsePackageMarkdown';
import { validatePackage } from './contentGeneration/packageValidator';

/**
 * Import a content package markdown file into staticData.ts
 * Replaces or adds the scenario based on scenarioId
 * Usage: npm run import:package -- --file=healthcare-1-gp-appointment-PATCHED-3_02122026.md
 */

function parseArgs(): string {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--file=')) {
      return args[i].substring('--file='.length);
    }
    if (args[i] === '--file' && i + 1 < args.length) {
      return args[i + 1];
    }
  }

  console.error('Usage: npm run import:package -- --file=<filename>');
  console.error('Example: npm run import:package -- --file=healthcare-1-gp-appointment-PATCHED-3_02122026.md');
  process.exit(1);
}

/**
 * Replace or add a scenario in the array
 */
function mergeScenario(scenario: RoleplayScript, currentData: RoleplayScript[]): RoleplayScript[] {
  const merged = JSON.parse(JSON.stringify(currentData)); // Deep copy

  // Find and replace existing scenario or append new one
  const index = merged.findIndex((s: RoleplayScript) => s.id === scenario.id);
  if (index !== -1) {
    merged[index] = scenario;
  } else {
    merged.push(scenario);
  }

  return merged;
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
    if (lines[i].includes('export const CURATED_ROLEPLAYS')) {
      startIndex = i;
    }
    if (startIndex !== -1 && lines[i].trim() === '];') {
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

async function main() {
  const fileName = parseArgs();
  const filePath = path.join(process.cwd(), 'exports/Content Packages_02122026', fileName);

  console.log(`\n📦 Importing content package...`);
  console.log(`   File: ${fileName}`);

  // Check file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  // Parse markdown
  console.log(`\n🔍 Parsing markdown...`);
  let parsedPackage: any;
  try {
    parsedPackage = parsePackageMarkdown(filePath);
  } catch (e) {
    console.error(`❌ Parse error: ${(e as Error).message}`);
    process.exit(1);
  }

  console.log(`✅ Parsed: ${parsedPackage.topic}`);
  console.log(`   ID: ${parsedPackage.scenarioId}`);
  console.log(`   Category: ${parsedPackage.category}`);

  const blankCount = parsedPackage.dialogue.reduce(
    (sum: number, d: any) => sum + (d.text.match(/________/g) || []).length,
    0
  );
  console.log(`   Blanks: ${blankCount}`);

  // Validate package (transform to validator's expected format first)
  console.log(`\n🧪 Validating package (10 rules)...`);

  // Transform parsed package to validator format
  // Fix: Update chunk native fields to match actual answers
  // This is needed because packages may have full phrase native fields but only blank-fill answers
  const fixedChunkFeedback = parsedPackage.chunkFeedbackV2.map((chunk, idx) => {
    const mapping = parsedPackage.blanksInOrder[idx];
    if (mapping && mapping.chunkId === chunk.chunkId) {
      const answer = parsedPackage.answerVariations[idx];
      // If the native field doesn't match the answer, update it to match
      if (answer && chunk.native !== answer.answer) {
        console.log(`   ℹ️  Fixing native field: "${chunk.native}" → "${answer.answer}" for ${chunk.chunkId}`);
        return {
          ...chunk,
          native: answer.answer,
        };
      }
    }
    return chunk;
  });

  const packageForValidator = {
    category: parsedPackage.category,
    scenarioId: parsedPackage.scenarioId,
    topic: parsedPackage.topic,
    context: parsedPackage.context,
    characters: parsedPackage.characters,
    dialogue: parsedPackage.dialogue,
    answers: parsedPackage.answerVariations, // Transform answerVariations to answers
    blanksInOrder: parsedPackage.blanksInOrder,
    chunkFeedback: fixedChunkFeedback, // Transform chunkFeedbackV2 to chunkFeedback
    patternSummary: parsedPackage.patternSummary,
    activeRecall: parsedPackage.activeRecall,
    yamlBlock: '', // Not used by validator, just needs to be present
  };

  // Also fix the parsed package for later use
  parsedPackage.chunkFeedbackV2 = fixedChunkFeedback;

  const validation = validatePackage(packageForValidator as any);

  // Check for critical errors
  const criticalErrors = validation.errors.filter(e => typeof e === 'object' && e.severity === 'critical');

  if (criticalErrors.length > 0) {
    console.error(`\n❌ Validation failed with critical errors:`);
    criticalErrors.forEach(err => {
      const message = typeof err === 'object' ? err.message : err;
      const location = typeof err === 'object' && err.location ? ` (${err.location})` : '';
      console.error(`   ❌ ${message}${location}`);
    });
    process.exit(1);
  }

  // Show warnings
  if (validation.warnings && validation.warnings.length > 0) {
    console.warn(`\n⚠️  Warnings (non-blocking):`);
    validation.warnings.forEach(warn => {
      const message = typeof warn === 'object' ? warn.message : warn;
      console.warn(`   ${message}`);
    });
  }

  console.log(`\n✅ All validations passed`);

  // Convert to RoleplayScript
  console.log(`\n🔄 Converting to RoleplayScript format...`);
  const roleplayScript = convertToRoleplayScript(parsedPackage, parsedPackage.scenarioId);

  // Check for existing scenario
  const existingScenario = CURATED_ROLEPLAYS.find(s => s.id === roleplayScript.id);
  if (existingScenario) {
    console.log(`   ⚠️  Replacing existing scenario: ${roleplayScript.id}`);
  } else {
    console.log(`   ✅ Adding new scenario: ${roleplayScript.id}`);
  }

  // Merge scenarios
  console.log(`\n🔄 Merging scenario...`);
  const merged = mergeScenario(roleplayScript, CURATED_ROLEPLAYS);
  console.log(`   ✅ Scenario updated in array`);

  // Create backup
  const staticDataPath = path.join(process.cwd(), 'src/services/staticData.ts');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('-').slice(0, 5).join('-');
  const backupPath = `${staticDataPath}.backup-${timestamp}`;

  console.log(`\n💾 Creating backup...`);
  fs.copyFileSync(staticDataPath, backupPath);
  console.log(`   ✅ Backup saved: ${backupPath}`);

  // Write updated file
  console.log(`\n📝 Writing updated staticData.ts...`);
  try {
    const newContent = generateStaticDataFile(merged);
    fs.writeFileSync(staticDataPath, newContent, 'utf-8');
    console.log(`   ✅ staticData.ts updated`);
  } catch (e) {
    console.error(`❌ Error writing file: ${(e as Error).message}`);
    process.exit(1);
  }

  // Run build
  console.log(`\n🔨 Building...`);
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log(`✅ Build succeeded`);
  } catch (e) {
    console.error(`❌ Build failed`);
    console.error(`   Restoring from backup: ${backupPath}`);
    fs.copyFileSync(backupPath, staticDataPath);
    process.exit(1);
  }

  // Run validation
  console.log(`\n✔️ Running feedback validation...`);
  try {
    execSync('npm run validate:feedback', { stdio: 'inherit' });
    console.log(`✅ Feedback validation passed`);
  } catch (e) {
    console.error(`❌ Feedback validation failed`);
    console.error(`   Restoring from backup: ${backupPath}`);
    fs.copyFileSync(backupPath, staticDataPath);
    process.exit(1);
  }

  console.log(`\n✅✅✅ Package imported successfully! ✅✅✅`);
  console.log(`   Scenario: ${roleplayScript.topic}`);
  console.log(`   ID: ${roleplayScript.id}`);
  console.log(`   Category: ${roleplayScript.category}`);
  console.log(`   Status: Ready for production`);
}

main().catch(e => {
  console.error(`❌ Error: ${e.message}`);
  process.exit(1);
});
