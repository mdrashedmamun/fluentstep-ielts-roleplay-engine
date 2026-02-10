/**
 * Extract Scenarios from PDF
 * Pipeline: PDF → Text → Parse → Transform → Output
 *
 * Usage:
 *   npx ts-node scripts/extractFromPDF.ts [--output FILE] [--compliance-only]
 */

import fs from 'fs';
import path from 'path';
import { extractPDFText } from '../src/services/pdfExtractor';
import { parseAllScenarios } from '../src/services/scenarioParser';
import { transformAllScenarios, TransformResult } from '../src/services/scenarioTransformer';

const PDF_PATH = path.join(process.cwd(), 'Learn w_ J.pdf');
const DEFAULT_OUTPUT = path.join(process.cwd(), 'extracted-scenarios.json');

interface ExtractOptions {
  outputFile: string;
  complianceOnly: boolean;
  verbose: boolean;
}

function parseArgs(): ExtractOptions {
  return {
    outputFile: process.argv.includes('--output')
      ? process.argv[process.argv.indexOf('--output') + 1]
      : DEFAULT_OUTPUT,
    complianceOnly: process.argv.includes('--compliance-only'),
    verbose: process.argv.includes('--verbose')
  };
}

function formatReport(result: TransformResult) {
  const r = result.complianceReport;
  return {
    scenario: {
      id: result.scenario.id,
      topic: result.scenario.topic,
      category: result.scenario.category,
      blankCount: result.scenario.dialogue.filter(d =>
        d.text.includes('________')
      ).length
    },
    compliance: {
      score: `${r.complianceScore}%`,
      chunks: r.chunkMatches,
      novel: r.novelVocab,
      total: r.totalBlanks,
      status: r.complianceScore >= 80 ? '✓ PASS' : '⚠️ REVIEW'
    },
    warnings: result.warnings
  };
}

async function main() {
  const options = parseArgs();

  console.log('\n📄 FluentStep PDF Extraction Pipeline\n');
  console.log(`📖 Reading: ${PDF_PATH}`);

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`❌ PDF file not found: ${PDF_PATH}`);
    process.exit(1);
  }

  try {
    // Step 1: Extract text
    console.log('🔍 Extracting text from PDF...');
    const extracted = await extractPDFText(PDF_PATH);
    console.log(`✓ Extracted ${extracted.totalPages} pages`);

    // Step 2: Parse scenarios
    console.log('📝 Parsing scenarios...');
    const parsed = parseAllScenarios(extracted.fullText);
    console.log(`✓ Found ${parsed.length} scenarios`);

    if (parsed.length === 0) {
      console.warn('⚠️  No scenarios found. Check PDF format.');
      process.exit(0);
    }

    // Step 3: Transform to RoleplayScript
    console.log('🔄 Transforming to RoleplayScript format...');
    const results = transformAllScenarios(parsed);
    console.log(`✓ Transformed ${results.length} scenarios`);

    // Step 4: Validate compliance
    console.log('\n✅ Compliance Report:\n');

    let totalCompliant = 0;
    results.forEach((result, idx) => {
      const report = formatReport(result);
      console.log(`${idx + 1}. ${report.scenario.topic}`);
      console.log(`   ID: ${report.scenario.id}`);
      console.log(`   Category: ${report.scenario.category}`);
      console.log(`   Compliance: ${report.compliance.score} (${report.compliance.chunks}/${report.compliance.total} chunks)`);
      console.log(`   Status: ${report.compliance.status}`);

      if (options.verbose) {
        report.warnings.forEach(w => console.log(`   ${w}`));
      }

      if (result.complianceReport.complianceScore >= 80) {
        totalCompliant++;
      }
      console.log('');
    });

    const complianceRate = Math.round((totalCompliant / results.length) * 100);
    console.log(`\n📊 Overall Compliance: ${totalCompliant}/${results.length} (${complianceRate}%)\n`);

    if (!options.complianceOnly) {
      // Step 5: Output
      console.log(`💾 Saving results to: ${options.outputFile}`);

      const output = {
        exportDate: new Date().toISOString(),
        totalScenarios: results.length,
        complianceRate,
        scenarios: results.map(r => r.scenario)
      };

      fs.writeFileSync(options.outputFile, JSON.stringify(output, null, 2), 'utf-8');
      console.log(`✓ Saved ${results.length} scenarios to ${options.outputFile}`);

      console.log('\n📋 Next Steps:');
      console.log('1. Review scenarios in extracted-scenarios.json');
      console.log('2. Adjust IDs if needed (e.g., social-31, social-32...)');
      console.log('3. Copy scenarios to services/staticData.ts');
      console.log('4. Run: npm run build');
    }

    console.log('\n✨ Extraction complete!\n');
  } catch (error) {
    console.error(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}

main();
