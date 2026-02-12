#!/usr/bin/env node

/**
 * CLI: Generate a single content package
 * Usage: npm run generate:package -- --category=Healthcare --topic="GP appointment" [--chunks=20] [--provider=claude]
 */

import { generateContentPackage, estimateCost, validateEnvironment } from './contentGeneration/writerAgent';
import fs from 'fs';
import path from 'path';

interface Args {
    category: string;
    topic: string;
    chunks: number;
    provider: 'claude' | 'chatgpt';
    help?: boolean;
}

function parseArgs(): Args {
    const args = process.argv.slice(2);
    const result: any = { provider: 'claude', chunks: 20 };

    for (const arg of args) {
        if (arg === '--help' || arg === '-h') {
            result.help = true;
        } else if (arg.startsWith('--category=')) {
            result.category = arg.split('=')[1];
        } else if (arg.startsWith('--topic=')) {
            result.topic = arg.split('=')[1];
        } else if (arg.startsWith('--chunks=')) {
            result.chunks = parseInt(arg.split('=')[1]);
        } else if (arg.startsWith('--provider=')) {
            result.provider = arg.split('=')[1] as 'claude' | 'chatgpt';
        }
    }

    return result;
}

function showHelp() {
    console.log(`
🤖 Content Package Generator

Usage:
  npm run generate:package -- --category=CATEGORY --topic="TOPIC" [OPTIONS]

Required:
  --category=CATEGORY       Category (Social, Workplace, Service/Logistics, Advanced, Academic, Healthcare, Cultural, Community)
  --topic="TOPIC"           Scenario topic (e.g., "GP appointment", "job interview")

Optional:
  --chunks=NUMBER           Target chunk count (default: 20, range: 15-30)
  --provider=PROVIDER       LLM provider (claude or chatgpt, default: claude)
  --help                    Show this help message

Examples:
  npm run generate:package -- --category=Healthcare --topic="GP appointment"
  npm run generate:package -- --category=Social --topic="Meeting flatmate" --chunks=25 --provider=chatgpt

Output:
  Generated packages are saved to exports/generated/

Cost Estimation:
  Claude 3.5 Sonnet: ~$0.02-0.05 per package
  GPT-4 Turbo: ~$0.04-0.12 per package

`);
}

async function main() {
    const args = parseArgs();

    if (args.help) {
        showHelp();
        process.exit(0);
    }

    if (!args.category || !args.topic) {
        console.error('❌ Missing required arguments');
        showHelp();
        process.exit(1);
    }

    // Validate environment
    const envCheck = validateEnvironment(args.provider);
    if (!envCheck.valid) {
        console.error(`❌ ${envCheck.message}`);
        process.exit(1);
    }

    // Generate package
    const output = await generateContentPackage({
        category: args.category,
        topic: args.topic,
        targetChunks: args.chunks,
        llmProvider: args.provider
    });

    // Prepare filename
    const timestamp = Date.now();
    const safeCategory = args.category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `${safeCategory}-${timestamp}.md`;
    const outputDir = path.join('exports', 'generated');
    const outputPath = path.join(outputDir, filename);

    // Ensure output directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Write file
    fs.writeFileSync(outputPath, output.packageMarkdown);

    // Print summary
    console.log(`\n${'═'.repeat(50)}`);
    console.log('📄 GENERATION COMPLETE');
    console.log(`${'═'.repeat(50)}\n`);

    console.log(`📍 Location: ${outputPath}`);
    console.log(`📊 Metrics:`);
    console.log(`   • LLM API calls: ${output.llmCalls}`);
    console.log(`   • Revision iterations: ${output.iterationCount}`);

    const cost = estimateCost(output.llmCalls, args.provider);
    console.log(`   • Estimated cost: ${cost.cost}`);

    console.log(`\n✅ Status: ${output.validationResult.valid ? 'PASSED all validations' : 'NEEDS REVISION'}`);

    if (output.validationResult.valid) {
        console.log(`\n📥 Next step: Review and import to staticData.ts`);
        console.log(`   npm run review:package -- --file=${filename}`);
    } else {
        console.log(`\n⚠️  Package has ${output.validationResult.errors.length} critical errors:`);
        output.validationResult.errors.slice(0, 3).forEach((e, i) => {
            console.log(`   ${i + 1}. [${e.rule}] ${e.message}`);
        });
        if (output.validationResult.errors.length > 3) {
            console.log(`   ... and ${output.validationResult.errors.length - 3} more`);
        }
        console.log(`\n   Run with more attempts: npm run create:package -- --category=... --topic=... --max-retries=5`);
    }

    if (output.validationResult.warnings.length > 0) {
        console.log(`\n💡 ${output.validationResult.warnings.length} content warnings (non-blocking):`);
        output.validationResult.warnings.slice(0, 2).forEach(w => {
            console.log(`   • [${w.rule}] ${w.message}`);
        });
    }

    process.exit(output.validationResult.valid ? 0 : 1);
}

main().catch(err => {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
});
