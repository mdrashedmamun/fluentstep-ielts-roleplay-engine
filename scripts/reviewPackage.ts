#!/usr/bin/env node

/**
 * CLI: Review a generated package with 3-reviewer system
 * Usage: npm run review:package -- --file=healthcare-1234567890.md
 */

import { runReviewersInParallel, formatAggregatedReview } from './contentGeneration/reviewerOrchestrator';
import fs from 'fs';
import path from 'path';

function parseArgs(): { file?: string; help?: boolean } {
    const args = process.argv.slice(2);
    const result: any = {};

    for (const arg of args) {
        if (arg === '--help' || arg === '-h') {
            result.help = true;
        } else if (arg.startsWith('--file=')) {
            result.file = arg.split('=')[1];
        }
    }

    return result;
}

function showHelp() {
    console.log(`
📋 Package Reviewer

Review a generated content package using 3-reviewer system:
  • Structural Validator (blank count, YAML syntax, dialogue structure)
  • Content Quality Validator (chunk references, blank mapping, alternatives)
  • Linguistic QA (healthcare safety, 4-gate language system)

Usage:
  npm run review:package -- --file=FILENAME

Required:
  --file=FILENAME    Package filename (from exports/generated/)

Examples:
  npm run review:package -- --file=healthcare-1234567890.md
  npm run review:package -- --file=social-1234567890.md

Output:
  • 3 parallel reviewer reports
  • Aggregated decision (pass/revise/reject)
  • Next steps for revision or import

`);
}

async function main() {
    const args = parseArgs();

    if (args.help) {
        showHelp();
        process.exit(0);
    }

    if (!args.file) {
        console.error('❌ Missing required argument: --file=FILENAME');
        showHelp();
        process.exit(1);
    }

    // Resolve file path
    const filePath = path.join('exports', 'generated', args.file);

    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        process.exit(1);
    }

    // Read package markdown
    const packageMarkdown = fs.readFileSync(filePath, 'utf-8');

    console.log(`\n${'═'.repeat(60)}`);
    console.log('📋 PACKAGE REVIEW SYSTEM');
    console.log(`${'═'.repeat(60)}\n`);

    console.log(`📄 Package: ${args.file}`);
    console.log(`📊 Size: ${(packageMarkdown.length / 1024).toFixed(1)} KB\n`);

    // Run 3 reviewers in parallel
    const review = await runReviewersInParallel(packageMarkdown);

    // Display aggregated results
    console.log(formatAggregatedReview(review));

    // Summary
    if (review.passed) {
        console.log('✅ PACKAGE APPROVED - Ready for import to staticData.ts\n');
        console.log('📥 Next step:');
        console.log(`   npm run import:enrichments -- --file=${args.file}`);
    } else {
        console.log(`⚠️  PACKAGE NEEDS REVISION\n`);
        console.log(`Critical Issues: ${review.criticalIssueCount}`);
        if (review.warningCount > 0) {
            console.log(`Warnings: ${review.warningCount}`);
        }
        console.log('\n📝 Next step:');
        console.log('   npm run create:package -- --category=... --topic=...');
        console.log('   (Generate a new attempt with LLM)');
    }

    process.exit(review.passed ? 0 : 1);
}

main().catch(err => {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
});
