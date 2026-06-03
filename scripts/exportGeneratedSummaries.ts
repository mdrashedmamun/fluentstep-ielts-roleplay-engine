import fs from 'fs';
import path from 'path';
import { CURATED_ROLEPLAYS, type PatternSummary, type RoleplayScript } from '../src/services/staticData';
import { generatePatternSummaryForScenario } from '../src/services/feedbackGeneration/patternSummaryGenerator';

/**
 * Export template-generated pattern summaries to markdown for human review
 * Usage: npm run generate:pattern-summaries -- --category=Social --batch=1
 */

type CategoryName = RoleplayScript['category'];

interface ExportOptions {
  category: CategoryName;
  batch: number;
}

interface CategoryInfo {
  fileName: string;
  prefix: string;
  count: number;
}

// Map category names to file names and valid prefixes
const CATEGORY_MAP: Record<CategoryName, CategoryInfo> = {
  Social: { fileName: 'Social', prefix: 'social-', count: 12 },
  Workplace: { fileName: 'Workplace', prefix: 'workplace-', count: 11 },
  'Service/Logistics': { fileName: 'Service-Logistics', prefix: 'service-', count: 14 },
  Advanced: { fileName: 'Advanced', prefix: 'advanced-', count: 11 },
  Academic: { fileName: 'Academic', prefix: 'academic-', count: 1 },
  Healthcare: { fileName: 'Healthcare', prefix: 'healthcare-', count: 1 },
  Cultural: { fileName: 'Cultural', prefix: 'cultural-', count: 1 },
  Community: { fileName: 'Community', prefix: 'community-', count: 1 }
};

function writeOut(message = ''): void {
  process.stdout.write(`${message}\n`);
}

function writeErr(message = ''): void {
  process.stderr.write(`${message}\n`);
}

function isCategoryName(value: string): value is CategoryName {
  return Object.prototype.hasOwnProperty.call(CATEGORY_MAP, value);
}

function parseArgs(): ExportOptions {
  const args = process.argv.slice(2);
  let category: CategoryName | undefined;
  let batch: number | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const nextArg = args[index + 1];

    if (arg === '--category' && nextArg) {
      if (!isCategoryName(nextArg)) {
        writeErr(`Invalid category: ${nextArg}`);
        writeErr(`Valid categories: ${Object.keys(CATEGORY_MAP).join(', ')}`);
        process.exit(1);
      }

      category = nextArg;
      index += 1;
    } else if (arg === '--batch' && nextArg) {
      const parsedBatch = Number.parseInt(nextArg, 10);
      if (Number.isNaN(parsedBatch) || parsedBatch < 1) {
        writeErr(`Invalid batch: ${nextArg}`);
        process.exit(1);
      }

      batch = parsedBatch;
      index += 1;
    }
  }

  if (!category || !batch) {
    writeErr('Usage: npm run generate:pattern-summaries -- --category=<NAME> --batch=<NUM>');
    writeErr('Example: npm run generate:pattern-summaries -- --category=Social --batch=1');
    process.exit(1);
  }

  return { category, batch };
}

function getScenariosForBatch(category: CategoryName, batch: number): RoleplayScript[] {
  const scenarios = CURATED_ROLEPLAYS.filter((scenario) => scenario.category === category);

  if (scenarios.length === 0) {
    writeErr(`No scenarios found for category: ${category}`);
    process.exit(1);
  }

  // Calculate batch boundaries
  const startIndex = (batch - 1) * 5;
  const endIndex = Math.min(startIndex + 5, scenarios.length);

  if (startIndex >= scenarios.length) {
    writeErr(`Batch ${batch} out of range. Category has ${scenarios.length} scenarios.`);
    process.exit(1);
  }

  return scenarios.slice(startIndex, endIndex);
}

function formatQuotedList(items: string[]): string {
  return items.map((item) => `"${item}"`).join(', ');
}

function getCategoryLabel(item: PatternSummary['categoryBreakdown'][number]): string {
  return String(item.category ?? item.categoryKey);
}

function formatYaml(summary: PatternSummary, indent = ''): string {
  let yaml = '';

  // categoryBreakdown
  yaml += `${indent}categoryBreakdown:\n`;
  for (const item of summary.categoryBreakdown) {
    yaml += `${indent}  - category: "${getCategoryLabel(item)}"\n`;
    yaml += `${indent}    count: ${item.count}\n`;
    // NEW: Export exampleChunkIds with debug comment mapping to chunk text
    if (item.exampleChunkIds.length > 0) {
      yaml += `${indent}    exampleChunkIds: [${formatQuotedList(item.exampleChunkIds)}]\n`;
    }
    // DEPRECATED: Keep examples for backward compat (auto-populated during import)
    if (item.examples && item.examples.length > 0) {
      yaml += `${indent}    # Chunks: [${formatQuotedList(item.examples)}]\n`;
    }
    yaml += `${indent}    insight: "${item.insight}"\n`;
    // NEW: Optional native patterns
    if (item.nativePatterns && item.nativePatterns.length > 0) {
      yaml += `${indent}    nativePatterns: [${formatQuotedList(item.nativePatterns)}]\n`;
    }
    // NEW: Optional common mistakes
    if (item.commonMistakes && item.commonMistakes.length > 0) {
      yaml += `${indent}    commonMistakes: [${formatQuotedList(item.commonMistakes)}]\n`;
    }
  }

  // overallInsight
  yaml += `${indent}overallInsight: "${summary.overallInsight}"\n`;

  // keyPatterns
  yaml += `${indent}keyPatterns:\n`;
  for (const pattern of summary.keyPatterns) {
    yaml += `${indent}  - pattern: "${pattern.pattern}"\n`;
    yaml += `${indent}    explanation: "${pattern.explanation}"\n`;
    // NEW: Export chunkIds with debug comment mapping to chunk text
    if (pattern.chunkIds.length > 0) {
      yaml += `${indent}    chunkIds: [${formatQuotedList(pattern.chunkIds)}]\n`;
    }
    // DEPRECATED: Keep chunks for backward compat (auto-populated during import)
    if (pattern.chunks && pattern.chunks.length > 0) {
      yaml += `${indent}    # Chunks: [${formatQuotedList(pattern.chunks)}]\n`;
    }
    // NEW: Optional native patterns
    if (pattern.nativePatterns && pattern.nativePatterns.length > 0) {
      yaml += `${indent}    nativePatterns: [${formatQuotedList(pattern.nativePatterns)}]\n`;
    }
    // NEW: Optional common mistakes
    if (pattern.commonMistakes && pattern.commonMistakes.length > 0) {
      yaml += `${indent}    commonMistakes: [${formatQuotedList(pattern.commonMistakes)}]\n`;
    }
  }

  return yaml;
}

function generateMarkdown(scenarios: RoleplayScript[], category: CategoryName, batch: number): string {
  const categoryInfo = CATEGORY_MAP[category];
  let markdown = '';

  // Header
  markdown += `# Category: ${category}\n`;
  markdown += `# Source file: ${categoryInfo.fileName}.md\n`;
  markdown += `# Scenarios included: ${scenarios.length}\n\n`;

  markdown += `## Generated Pattern Summaries - Batch ${batch}\n\n`;
  markdown += '**Status**: Template-generated (requires human review)\n';
  markdown += `**Generated**: ${new Date().toISOString().slice(0, 10)}\n`;
  markdown += '**Action**: Review each scenario\'s pattern summary below. Edit insights and key patterns as needed. ';
  markdown += `Check QA boxes, then save as \`${categoryInfo.fileName}-batch${batch}-enriched.md\` and run: `;
  markdown += `\`npm run import:enrichments -- --file=${categoryInfo.fileName}-batch${batch}-enriched.md\`\n\n`;

  markdown += '---\n\n';

  // Per-scenario blocks
  for (const scenario of scenarios) {
    const summary = generatePatternSummaryForScenario(scenario);

    markdown += `## ${scenario.topic}\n\n`;
    markdown += `**ID**: \`${scenario.id}\`\n`;
    markdown += `**Context**: ${scenario.context}\n\n`;

    // QA Checklist
    markdown += '### Pattern Summary QA Checklist\n\n';
    markdown += '- [ ] Category breakdown accurate and complete\n';
    markdown += '- [ ] Overall insight captures learning outcome (may refine from template)\n';
    markdown += '- [ ] Key patterns show cross-chunk connections\n';
    markdown += '- [ ] No grammar terminology (verb, noun, tense, etc.)\n';
    markdown += '- [ ] Word counts within limits (insight: 30-100, overall: 100-300, pattern: 10-50, explanation: 50-150)\n';
    markdown += '- [ ] All chunks exist in scenario\'s chunkFeedback\n\n';

    // Enrichment block
    markdown += '### Pattern Enrichment (for Import)\n\n';
    markdown += '```yaml\n';
    markdown += 'patternSummary:\n';

    if (summary) {
      markdown += formatYaml(summary, '  ');
    } else {
      markdown += '  categoryBreakdown: []\n';
      markdown += '  overallInsight: ""\n';
      markdown += '  keyPatterns: []\n';
    }

    markdown += '```\n\n';

    // Notes section
    markdown += '### Review Notes\n\n';
    markdown += '**Template Feedback:**\n';
    markdown += '- Generator created baseline insights using pattern templates\n';
    markdown += '- Your task: Refine insights with specific scenario context\n';
    markdown += '- Improve key pattern explanations if needed\n';
    markdown += '- Verify all chunks reference actual chunkFeedback items\n\n';

    markdown += '**Author Comments** (optional):\n';
    markdown += '[ Add your refinement notes here ]\n\n';

    markdown += '---\n\n';
  }

  markdown += '## Import Instructions\n\n';
  markdown += '1. Review all scenarios above\n';
  markdown += '2. Edit YAML blocks as needed (refine insights, improve explanations)\n';
  markdown += `3. Save this file as: \`${categoryInfo.fileName}-batch${batch}-enriched.md\`\n`;
  markdown += `4. Validate: \`npm run validate:enrichments -- --file=${categoryInfo.fileName}-batch${batch}-enriched.md\`\n`;
  markdown += `5. Import: \`npm run import:enrichments -- --file=${categoryInfo.fileName}-batch${batch}-enriched.md\`\n`;
  markdown += '6. Test: `npm run dev` and verify scenarios in browser\n\n';

  return markdown;
}

function main(): void {
  const options = parseArgs();
  const categoryInfo = CATEGORY_MAP[options.category];

  writeOut();
  writeOut('Generating pattern summaries...');
  writeOut(`   Category: ${options.category}`);
  writeOut(`   Batch: ${options.batch}`);

  // Get scenarios for this batch
  const scenarios = getScenariosForBatch(options.category, options.batch);
  writeOut(`   Scenarios: ${scenarios.length} (${scenarios.map((scenario) => scenario.id).join(', ')})`);

  // Generate markdown
  const markdown = generateMarkdown(scenarios, options.category, options.batch);

  // Ensure output directory exists
  const outputDir = path.join(process.cwd(), 'exports', 'generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write file
  const outputFile = path.join(outputDir, `${categoryInfo.fileName}-batch${options.batch}-generated.md`);

  fs.writeFileSync(outputFile, markdown, 'utf-8');

  writeOut();
  writeOut(`Generated: ${outputFile}`);
  writeOut();
  writeOut('Next steps:');
  writeOut(`   1. Open: ${outputFile}`);
  writeOut('   2. Review and edit pattern summaries');
  writeOut(`   3. Save as: ${categoryInfo.fileName}-batch${options.batch}-enriched.md`);
  writeOut(`   4. Run: npm run import:enrichments -- --file=${categoryInfo.fileName}-batch${options.batch}-enriched.md`);
  writeOut();
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  writeErr(`Error: ${message}`);
  process.exit(1);
}
