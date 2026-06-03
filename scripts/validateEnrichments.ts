import fs from 'fs';
import path from 'path';
import { CURATED_ROLEPLAYS, ChunkCategory } from '../src/services/staticData';
import { isValidChunkIdFormat, chunkIdExists } from '../src/services/feedbackGeneration/chunkIdGenerator';

/**
 * Validate enriched markdown files before import
 * Checks: Category header, YAML syntax, batch size, category lock
 * Usage: npm run validate:enrichments -- --file=<filename>
 */

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
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

function parseArgs(): string {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && i + 1 < args.length) {
      return args[i + 1];
    }
  }

  writeError('Usage: npm run validate:enrichments -- --file=<filename>');
  writeError('Example: npm run validate:enrichments -- --file=Social-batch1-enriched.md');
  process.exit(1);
}

const VALID_CATEGORIES = ['Academic', 'Advanced', 'Community', 'Cultural', 'Healthcare', 'Service/Logistics', 'Service-Logistics', 'Social', 'Workplace'];
const VALID_CHUNK_CATEGORIES: ChunkCategory[] = ['Openers', 'Softening', 'Disagreement', 'Repair', 'Exit', 'Idioms'];

/**
 * Validate category header format and values
 */
function validateCategoryHeader(lines: string[]): { valid: boolean; category?: string; errors: string[] } {
  const errors: string[] = [];

  if (lines.length < 3) {
    errors.push('❌ File must start with category header (3 lines)');
    return { valid: false, errors };
  }

  const categoryLine = lines[0];
  const sourceFileLine = lines[1];
  const countLine = lines[2];

  // Validate category line
  const categoryMatch = categoryLine.match(/^# Category: (.+)$/);
  if (!categoryMatch) {
    errors.push(`Line 1: Expected '# Category: <NAME>', got '${categoryLine}'`);
  } else {
    const category = categoryMatch[1];
    if (!VALID_CATEGORIES.includes(category)) {
      errors.push(`Line 1: Invalid category '${category}'. Valid: ${VALID_CATEGORIES.join(', ')}`);
    }
  }

  // Validate source file line
  const sourceMatch = sourceFileLine.match(/^# Source file: (.+)\.md$/);
  if (!sourceMatch) {
    errors.push(`Line 2: Expected '# Source file: <FILENAME>.md', got '${sourceFileLine}'`);
  }

  // Validate count line
  const countMatch = countLine.match(/^# Scenarios included: (\d+)$/);
  if (!countMatch) {
    errors.push(`Line 3: Expected '# Scenarios included: <NUM>', got '${countLine}'`);
  }

  return {
    valid: errors.length === 0,
    category: categoryMatch?.[1],
    errors,
  };
}

/**
 * Validate batch size (≤5 scenarios, except single-scenario categories)
 */
function validateBatchSize(yamlBlocks: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (yamlBlocks === 0) {
    errors.push('No enrichment blocks found (expected at least 1)');
  } else if (yamlBlocks > 5) {
    errors.push(`❌ Batch too large: ${yamlBlocks} scenarios (max 5 per file). Split into multiple batches.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Extract and validate YAML blocks
 */
function validateYamlBlocks(content: string): {
  valid: boolean;
  blocks: Array<{ scenarioId: string; yaml: string }>;
  errors: string[];
} {
  const blocks: Array<{ scenarioId: string; yaml: string }> = [];
  const errors: string[] = [];

  // Find all scenario blocks
  const scenarioBlocks = content.split(/\n## /).slice(1);

  for (const block of scenarioBlocks) {
    // Extract scenario ID
    const idMatch = block.match(/\*\*ID\*\*:\s*`([^`]+)`/);
    if (!idMatch) continue;

    const scenarioId = idMatch[1];

    // Extract YAML block
    const yamlMatch = block.match(/```yaml\npatternSummary:\n([\s\S]*?)```/);
    if (!yamlMatch) {
      errors.push(`${scenarioId}: No YAML enrichment block found`);
      continue;
    }

    const yaml = yamlMatch[1];

    // Validate YAML structure
    if (!yaml.includes('categoryBreakdown:')) {
      errors.push(`${scenarioId}: Missing 'categoryBreakdown' field`);
    }
    if (!yaml.includes('overallInsight:')) {
      errors.push(`${scenarioId}: Missing 'overallInsight' field`);
    }
    if (!yaml.includes('keyPatterns:')) {
      errors.push(`${scenarioId}: Missing 'keyPatterns' field`);
    }

    blocks.push({ scenarioId, yaml });
  }

  return {
    valid: errors.length === 0,
    blocks,
    errors,
  };
}

/**
 * Validate category lock (all IDs match declared category)
 */
function validateCategoryLock(
  declaredCategory: string,
  scenarioIds: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Map category names to ID prefixes
  const categoryPrefixMap: Record<string, string> = {
    'Academic': 'academic-',
    'Advanced': 'advanced-',
    'Community': 'community-',
    'Cultural': 'cultural-',
    'Healthcare': 'healthcare-',
    'Service/Logistics': 'service-',
    'Service-Logistics': 'service-',
    'Social': 'social-',
    'Workplace': 'workplace-',
  };

  const expectedPrefix = categoryPrefixMap[declaredCategory];
  if (!expectedPrefix) {
    errors.push(`Invalid category name: ${declaredCategory}`);
    return { valid: false, errors };
  }

  // Check all IDs match prefix
  const mismatched = scenarioIds.filter(id => !id.startsWith(expectedPrefix));
  if (mismatched.length > 0) {
    errors.push(`❌ Category lock violation: Found IDs for wrong category:`);
    mismatched.forEach(id => {
      errors.push(`   - ${id} (expected prefix: ${expectedPrefix})`);
    });
  }

  // Verify all scenarios exist in database
  const notFound = scenarioIds.filter(id => !CURATED_ROLEPLAYS.find(s => s.id === id));
  if (notFound.length > 0) {
    errors.push(`❌ Scenarios not found in database:`);
    notFound.forEach(id => {
      errors.push(`   - ${id}`);
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate word counts in enrichment fields
 */
function validateWordCounts(scenarioId: string, yaml: string): string[] {
  const errors: string[] = [];

  // Extract insight fields
  const insightMatches = yaml.matchAll(/insight:\s*"([^"]*)"/g);
  for (const match of insightMatches) {
    const insight = match[1];
    if (insight.length < 30 || insight.length > 100) {
      errors.push(`${scenarioId}: Insight length ${insight.length} chars (should be 30-100)`);
    }
  }

  // Extract overall insight
  const overallMatch = yaml.match(/overallInsight:\s*"([^"]*)"/);
  if (overallMatch) {
    const overall = overallMatch[1];
    if (overall.length < 100 || overall.length > 300) {
      errors.push(`${scenarioId}: Overall insight ${overall.length} chars (should be 100-300)`);
    }
  }

  // Extract pattern names
  const patternMatches = yaml.matchAll(/pattern:\s*"([^"]*)"/g);
  for (const match of patternMatches) {
    const pattern = match[1];
    if (pattern.length < 10 || pattern.length > 50) {
      errors.push(`${scenarioId}: Pattern name length ${pattern.length} chars (should be 10-50)`);
    }
  }

  // Extract explanations
  const explanationMatches = yaml.matchAll(/explanation:\s*"([^"]*)"/g);
  for (const match of explanationMatches) {
    const explanation = match[1];
    if (explanation.length < 50 || explanation.length > 150) {
      errors.push(
        `${scenarioId}: Explanation length ${explanation.length} chars (should be 50-150): "${explanation.substring(0, 50)}..."`
      );
    }
  }

  return errors;
}

/**
 * Check for grammar terminology (forbidden language)
 */
function checkGrammarTerminology(scenarioId: string, yaml: string): string[] {
  const errors: string[] = [];

  const forbiddenTerms = [
    'verb', 'noun', 'adjective', 'adverb', 'pronoun',
    'tense', 'grammatical', 'grammar', 'syntax', 'morphology',
    'clause', 'phrase', 'subject', 'object', 'predicate'
  ];

  const lowerYaml = yaml.toLowerCase();
  const found = forbiddenTerms.filter(term => lowerYaml.includes(term));

  if (found.length > 0) {
    errors.push(
      `${scenarioId}: ⚠️ Contains grammar terminology: ${found.join(', ')} (focus on patterns, not grammar)`
    );
  }

  return errors;
}

/**
 * NEW: Validate chunkId format and existence
 */
function validateChunkIds(scenarioId: string, yaml: string): string[] {
  const errors: string[] = [];

  // Find scenario in database
  const scenario = CURATED_ROLEPLAYS.find(s => s.id === scenarioId);
  if (!scenario) {
    errors.push(`${scenarioId}: Scenario not found in database`);
    return errors;
  }

  // Extract all chunkIds from exampleChunkIds and chunkIds fields
  const chunkIdMatches = yaml.matchAll(/chunkIds?:\s*\[(.*?)\]/gs);
  const chunkIds: string[] = [];

  for (const match of chunkIdMatches) {
    const idList = match[1];
    const ids = idList.match(/["']([^"']+)["']/g) || [];
    for (const id of ids) {
      const cleanId = id.replace(/["']/g, '');
      chunkIds.push(cleanId);
    }
  }

  // Validate each chunkId
  for (const chunkId of chunkIds) {
    // Check format
    if (!isValidChunkIdFormat(chunkId)) {
      errors.push(`${scenarioId}: Invalid chunkId format: "${chunkId}" (expected: "{scenarioId}-b{number}")`);
      continue;
    }

    // Check existence
    if (!chunkIdExists(chunkId, scenario)) {
      errors.push(`${scenarioId}: ChunkId "${chunkId}" does not exist in scenario`);
    }
  }

  return errors;
}

/**
 * NEW: Validate native/non-native pattern equality
 */
function validateNativeNonNativePatterns(scenarioId: string, yaml: string): string[] {
  const errors: string[] = [];

  // Extract nativePatterns and commonMistakes arrays
  const nativeMatch = yaml.match(/nativePatterns:\s*\[(.*?)\]/s);
  const commonMatch = yaml.match(/commonMistakes:\s*\[(.*?)\]/s);

  if (nativeMatch && commonMatch) {
    const nativeList = (nativeMatch[1].match(/["']([^"']+)["']/g) || []).length;
    const commonList = (commonMatch[1].match(/["']([^"']+)["']/g) || []).length;

    if (nativeList !== commonList) {
      errors.push(
        `${scenarioId}: nativePatterns (${nativeList}) and commonMistakes (${commonList}) must have equal length`
      );
    }
  } else if (nativeMatch || commonMatch) {
    errors.push(`${scenarioId}: If nativePatterns is present, commonMistakes must also be present (and vice versa)`);
  }

  return errors;
}

/**
 * NEW: Validate category types are standard ChunkCategory values
 */
function validateCategoryTypes(scenarioId: string, yaml: string): string[] {
  const errors: string[] = [];

  // Extract all category values from categoryBreakdown
  const categoryMatches = yaml.matchAll(/category:\s*["']([^"']+)["']/g);

  for (const match of categoryMatches) {
    const category = match[1];
    if (!VALID_CHUNK_CATEGORIES.includes(category as ChunkCategory)) {
      errors.push(
        `${scenarioId}: Invalid category "${category}". ` +
        `Must be one of: ${VALID_CHUNK_CATEGORIES.join(', ')}. ` +
        `Use customLabel field for domain-specific labels.`
      );
    }
  }

  return errors;
}

function main() {
  const filename = parseArgs();
  const filePath = path.join(process.cwd(), 'exports', filename);

  writeLine(`\n🔍 Validating enriched scenarios...`);
  writeLine(`   File: ${filename}\n`);

  // Check file exists
  if (!fs.existsSync(filePath)) {
    writeError(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  // Read content
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // 1. Validate category header
  writeLine('📋 Checking category header...');
  const headerValidation = validateCategoryHeader(lines);
  if (!headerValidation.valid) {
    result.valid = false;
    result.errors.push(...headerValidation.errors);
  } else {
    writeLine(`   ✅ Category: ${headerValidation.category}`);
  }

  // 2. Validate YAML blocks
  writeLine('\n📋 Parsing YAML blocks...');
  const yamlValidation = validateYamlBlocks(content);
  if (!yamlValidation.valid) {
    result.valid = false;
    result.errors.push(...yamlValidation.errors);
  } else {
    writeLine(`   ✅ Found ${yamlValidation.blocks.length} enrichment blocks`);
  }

  // 3. Validate batch size
  writeLine('\n📋 Validating batch size...');
  const batchValidation = validateBatchSize(yamlValidation.blocks.length);
  if (!batchValidation.valid) {
    result.valid = false;
    result.errors.push(...batchValidation.errors);
  } else {
    writeLine(`   ✅ Batch size: ${yamlValidation.blocks.length} scenario(s)`);
  }

  // 4. Validate category lock
  if (headerValidation.category) {
    writeLine('\n🔒 Validating category lock...');
    const scenarioIds = yamlValidation.blocks.map(b => b.scenarioId);
    const lockValidation = validateCategoryLock(headerValidation.category, scenarioIds);
    if (!lockValidation.valid) {
      result.valid = false;
      result.errors.push(...lockValidation.errors);
    } else {
      writeLine(`   ✅ All scenarios match declared category`);
    }
  }

  // 5. Validate word counts and content
  writeLine('\n📋 Validating content...');
  for (const block of yamlValidation.blocks) {
    const wordErrors = validateWordCounts(block.scenarioId, block.yaml);
    result.errors.push(...wordErrors);

    const termErrors = checkGrammarTerminology(block.scenarioId, block.yaml);
    result.warnings.push(...termErrors);

    // NEW: Validate category types
    const categoryTypeErrors = validateCategoryTypes(block.scenarioId, block.yaml);
    result.errors.push(...categoryTypeErrors);

    // NEW: Validate chunkIds
    const chunkIdErrors = validateChunkIds(block.scenarioId, block.yaml);
    result.errors.push(...chunkIdErrors);

    // NEW: Validate native/non-native patterns
    const patternErrors = validateNativeNonNativePatterns(block.scenarioId, block.yaml);
    result.errors.push(...patternErrors);
  }

  if (result.errors.length === 0 && result.warnings.length === 0) {
    writeLine(`   ✅ All validations passed`);
  }

  // Print results
  writeLine('\n' + '='.repeat(60));
  if (result.valid && result.warnings.length === 0) {
    writeLine('\n✅ All validations passed! Ready to import.');
    writeLine(`\n📥 Next step: npm run import:enrichments -- --file=${filename}`);
  } else {
    if (result.errors.length > 0) {
      writeLine('\n❌ ERRORS (must fix before import):');
      result.errors.forEach(e => writeLine(`   ${e}`));
    }

    if (result.warnings.length > 0) {
      writeLine('\n⚠️  WARNINGS (review before import):');
      result.warnings.forEach(w => writeLine(`   ${w}`));
    }

    process.exit(1);
  }

  writeLine('');
}

try {
  main();
} catch (error) {
  writeError(`Error: ${getErrorMessage(error)}`);
  process.exit(1);
}
