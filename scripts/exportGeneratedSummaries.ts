import fs from 'fs';
import path from 'path';
import { CURATED_ROLEPLAYS, RoleplayScript } from '../src/services/staticData';
import { generatePatternSummaryForScenario } from '../src/services/feedbackGeneration/patternSummaryGenerator';

/**
 * Export template-generated pattern summaries to markdown for human review
 * Usage: npm run generate:pattern-summaries -- --category=Social --batch=1
 */

interface ExportOptions {
  category: string;
  batch: number;
}

// Map category names to file names and valid prefixes
const CATEGORY_MAP: Record<string, { fileName: string; prefix: string; count: number }> = {
  'Social': { fileName: 'Social', prefix: 'social-', count: 12 },
  'Workplace': { fileName: 'Workplace', prefix: 'workplace-', count: 11 },
  'Service/Logistics': { fileName: 'Service-Logistics', prefix: 'service-', count: 14 },
  'Advanced': { fileName: 'Advanced', prefix: 'advanced-', count: 11 },
  'Academic': { fileName: 'Academic', prefix: 'academic-', count: 1 },
  'Healthcare': { fileName: 'Healthcare', prefix: 'healthcare-', count: 1 },
  'Cultural': { fileName: 'Cultural', prefix: 'cultural-', count: 1 },
  'Community': { fileName: 'Community', prefix: 'community-', count: 1 },
};

function parseArgs(): ExportOptions {
  const args = process.argv.slice(2);
  const options: Partial<ExportOptions> = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--category' && i + 1 < args.length) {
      options.category = args[i + 1];
      i++;
    } else if (args[i] === '--batch' && i + 1 < args.length) {
      options.batch = parseInt(args[i + 1], 10);
      i++;
    }
  }

  if (!options.category || !options.batch) {
    console.error('Usage: npm run generate:pattern-summaries -- --category=<NAME> --batch=<NUM>');
    console.error('Example: npm run generate:pattern-summaries -- --category=Social --batch=1');
    process.exit(1);
  }

  return options as ExportOptions;
}

function getScenariosForBatch(category: string, batch: number): RoleplayScript[] {
  const categoryInfo = CATEGORY_MAP[category];
  if (!categoryInfo) {
    console.error(`❌ Invalid category: ${category}`);
    console.error(`Valid categories: ${Object.keys(CATEGORY_MAP).join(', ')}`);
    process.exit(1);
  }

  const scenarios = CURATED_ROLEPLAYS.filter(s => s.category === category);

  if (scenarios.length === 0) {
    console.error(`❌ No scenarios found for category: ${category}`);
    process.exit(1);
  }

  // Calculate batch boundaries
  const startIndex = (batch - 1) * 5;
  const endIndex = Math.min(startIndex + 5, scenarios.length);

  if (startIndex >= scenarios.length) {
    console.error(`❌ Batch ${batch} out of range. Category has ${scenarios.length} scenarios.`);
    process.exit(1);
  }

  return scenarios.slice(startIndex, endIndex);
}

function formatYaml(summary: any, indent: string = ''): string {
  if (!summary) return '';

  let yaml = '';

  // categoryBreakdown
  yaml += `${indent}categoryBreakdown:\n`;
  for (const item of summary.categoryBreakdown) {
    yaml += `${indent}  - category: "${item.category}"\n`;
    yaml += `${indent}    count: ${item.count}\n`;
    // NEW: Export exampleChunkIds with debug comment mapping to chunk text
    if (item.exampleChunkIds && item.exampleChunkIds.length > 0) {
      yaml += `${indent}    exampleChunkIds: [${item.exampleChunkIds.map((id: string) => `"${id}"`).join(', ')}]\n`;
    }
    // DEPRECATED: Keep examples for backward compat (auto-populated during import)
    if (item.examples && item.examples.length > 0) {
      yaml += `${indent}    # Chunks: [${item.examples.map((e: string) => `"${e}"`).join(', ')}]\n`;
    }
    yaml += `${indent}    insight: "${item.insight}"\n`;
    // NEW: Optional native patterns
    if (item.nativePatterns && item.nativePatterns.length > 0) {
      yaml += `${indent}    nativePatterns: [${item.nativePatterns.map((p: string) => `"${p}"`).join(', ')}]\n`;
    }
    // NEW: Optional common mistakes
    if (item.commonMistakes && item.commonMistakes.length > 0) {
      yaml += `${indent}    commonMistakes: [${item.commonMistakes.map((m: string) => `"${m}"`).join(', ')}]\n`;
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
    if (pattern.chunkIds && pattern.chunkIds.length > 0) {
      yaml += `${indent}    chunkIds: [${pattern.chunkIds.map((id: string) => `"${id}"`).join(', ')}]\n`;
    }
    // DEPRECATED: Keep chunks for backward compat (auto-populated during import)
    if (pattern.chunks && pattern.chunks.length > 0) {
      yaml += `${indent}    # Chunks: [${pattern.chunks.map((c: string) => `"${c}"`).join(', ')}]\n`;
    }
    // NEW: Optional native patterns
    if (pattern.nativePatterns && pattern.nativePatterns.length > 0) {
      yaml += `${indent}    nativePatterns: [${pattern.nativePatterns.map((p: string) => `"${p}"`).join(', ')}]\n`;
    }
    // NEW: Optional common mistakes
    if (pattern.commonMistakes && pattern.commonMistakes.length > 0) {
      yaml += `${indent}    commonMistakes: [${pattern.commonMistakes.map((m: string) => `"${m}"`).join(', ')}]\n`;
    }
  }

  return yaml;
}

function generateMarkdown(scenarios: RoleplayScript[], category: string, batch: number): string {
  const categoryInfo = CATEGORY_MAP[category];
  let markdown = '';

  // Header
  markdown += `# Category: ${category}\n`;
  markdown += `# Source file: ${categoryInfo.fileName}.md\n`;
  markdown += `# Scenarios included: ${scenarios.length}\n\n`;

  markdown += `## Generated Pattern Summaries - Batch ${batch}\n\n`;
  markdown += `**Status**: 🤖 Template-generated (requires human review)\n`;
  markdown += `**Generated**: ${new Date().toISOString().split('T')[0]}\n`;
  markdown += `**Action**: Review each scenario's pattern summary below. Edit insights and key patterns as needed. `;
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
    markdown += `[ Add your refinement notes here ]\n\n`;

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

async function main() {
  const options = parseArgs();

  console.log(`\n📋 Generating pattern summaries...`);
  console.log(`   Category: ${options.category}`);
  console.log(`   Batch: ${options.batch}`);

  // Get scenarios for this batch
  const scenarios = getScenariosForBatch(options.category, options.batch);
  console.log(`   Scenarios: ${scenarios.length} (${scenarios.map(s => s.id).join(', ')})`);

  // Generate markdown
  const markdown = generateMarkdown(scenarios, options.category, options.batch);

  // Ensure output directory exists
  const outputDir = path.join(process.cwd(), 'exports', 'generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write file
  const categoryInfo = CATEGORY_MAP[options.category];
  const outputFile = path.join(outputDir, `${categoryInfo.fileName}-batch${options.batch}-generated.md`);

  fs.writeFileSync(outputFile, markdown, 'utf-8');

  console.log(`\n✅ Generated: ${outputFile}`);
  console.log(`\n📖 Next steps:`);
  console.log(`   1. Open: ${outputFile}`);
  console.log(`   2. Review and edit pattern summaries`);
  console.log(`   3. Save as: ${categoryInfo.fileName}-batch${options.batch}-enriched.md`);
  console.log(`   4. Run: npm run import:enrichments -- --file=${categoryInfo.fileName}-batch${options.batch}-enriched.md`);
  console.log('');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
