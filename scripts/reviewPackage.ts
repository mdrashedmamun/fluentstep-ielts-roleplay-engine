#!/usr/bin/env node

/**
 * CLI: Review a generated package with 3-reviewer system
 * Usage: npm run review:package -- --file=healthcare-1234567890.md
 */

import { runReviewersInParallel, formatAggregatedReview } from './contentGeneration/reviewerOrchestrator';
import fs from 'fs';
import path from 'path';

interface ReviewPackageArgs {
    file?: string;
    help?: boolean;
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

function parseArgs(): ReviewPackageArgs {
    const args = process.argv.slice(2);
    const result: ReviewPackageArgs = {};

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
    writeLine(`
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
        writeError('❌ Missing required argument: --file=FILENAME');
        showHelp();
        process.exit(1);
    }

    // Resolve file path
    const filePath = path.join('exports', 'generated', args.file);

    if (!fs.existsSync(filePath)) {
        writeError(`❌ File not found: ${filePath}`);
        process.exit(1);
    }

    // Read package markdown
    const packageMarkdown = fs.readFileSync(filePath, 'utf-8');

    writeLine(`\n${'═'.repeat(60)}`);
    writeLine('📋 PACKAGE REVIEW SYSTEM');
    writeLine(`${'═'.repeat(60)}\n`);

    writeLine(`📄 Package: ${args.file}`);
    writeLine(`📊 Size: ${(packageMarkdown.length / 1024).toFixed(1)} KB\n`);

    // Run 3 reviewers in parallel
    const review = await runReviewersInParallel(packageMarkdown);

    // Display aggregated results
    writeLine(formatAggregatedReview(review));

    // Summary
    if (review.passed) {
        writeLine('✅ PACKAGE APPROVED - Ready for import to staticData.ts\n');
        writeLine('📥 Next step:');
        writeLine(`   npm run import:enrichments -- --file=${args.file}`);
    } else {
        writeLine(`⚠️  PACKAGE NEEDS REVISION\n`);
        writeLine(`Critical Issues: ${review.criticalIssueCount}`);
        if (review.warningCount > 0) {
            writeLine(`Warnings: ${review.warningCount}`);
        }
        writeLine('\n📝 Next step:');
        writeLine('   npm run create:package -- --category=... --topic=...');
        writeLine('   (Generate a new attempt with LLM)');
    }

    process.exit(review.passed ? 0 : 1);
}

main().catch((error: unknown) => {
    writeError(`❌ Fatal error: ${getErrorMessage(error)}`);
    process.exit(1);
});
