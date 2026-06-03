#!/usr/bin/env node

/**
 * CLI: Generate a single content package
 * Usage: npm run generate:package -- --category=Healthcare --topic="GP appointment" [--chunks=20] [--provider=claude]
 */

import { generateContentPackage, estimateCost, validateEnvironment, type LLMProvider } from './contentGeneration/writerAgent';
import fs from 'fs';
import path from 'path';

interface Args {
    category?: string;
    topic?: string;
    chunks: number;
    provider: LLMProvider;
    help: boolean;
    invalidProvider?: string;
}

const writeOut = (message = ''): void => {
    process.stdout.write(`${message}\n`);
};

const writeErr = (message: string): void => {
    process.stderr.write(`${message}\n`);
};

const getErrorMessage = (error: unknown): string => (
    error instanceof Error ? error.message : String(error)
);

const getArgValue = (arg: string): string => arg.slice(arg.indexOf('=') + 1);

const parseIntegerArg = (value: string, fallback: number): number => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const isLLMProvider = (value: string): value is LLMProvider => (
    value === 'claude' || value === 'chatgpt'
);

function parseArgs(): Args {
    const args = process.argv.slice(2);
    const result: Args = { provider: 'claude', chunks: 20, help: false };

    for (const arg of args) {
        if (arg === '--help' || arg === '-h') {
            result.help = true;
        } else if (arg.startsWith('--category=')) {
            result.category = getArgValue(arg);
        } else if (arg.startsWith('--topic=')) {
            result.topic = getArgValue(arg);
        } else if (arg.startsWith('--chunks=')) {
            result.chunks = parseIntegerArg(getArgValue(arg), result.chunks);
        } else if (arg.startsWith('--provider=')) {
            const provider = getArgValue(arg);
            if (isLLMProvider(provider)) {
                result.provider = provider;
            } else {
                result.invalidProvider = provider;
            }
        }
    }

    return result;
}

function showHelp() {
    writeOut(`
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

    if (args.invalidProvider) {
        writeErr(`❌ Unsupported provider: ${args.invalidProvider}`);
        showHelp();
        process.exit(1);
    }

    if (!args.category || !args.topic) {
        writeErr('❌ Missing required arguments');
        showHelp();
        process.exit(1);
    }

    // Validate environment
    const envCheck = validateEnvironment(args.provider);
    if (!envCheck.valid) {
        writeErr(`❌ ${envCheck.message}`);
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
    writeOut(`\n${'═'.repeat(50)}`);
    writeOut('📄 GENERATION COMPLETE');
    writeOut(`${'═'.repeat(50)}\n`);

    writeOut(`📍 Location: ${outputPath}`);
    writeOut(`📊 Metrics:`);
    writeOut(`   • LLM API calls: ${output.llmCalls}`);
    writeOut(`   • Revision iterations: ${output.iterationCount}`);

    const cost = estimateCost(output.llmCalls, args.provider);
    writeOut(`   • Estimated cost: ${cost.cost}`);

    writeOut(`\n✅ Status: ${output.validationResult.valid ? 'PASSED all validations' : 'NEEDS REVISION'}`);

    if (output.validationResult.valid) {
        writeOut(`\n📥 Next step: Review and import to staticData.ts`);
        writeOut(`   npm run review:package -- --file=${filename}`);
    } else {
        writeOut(`\n⚠️  Package has ${output.validationResult.errors.length} critical errors:`);
        output.validationResult.errors.slice(0, 3).forEach((e, i) => {
            writeOut(`   ${i + 1}. [${e.rule}] ${e.message}`);
        });
        if (output.validationResult.errors.length > 3) {
            writeOut(`   ... and ${output.validationResult.errors.length - 3} more`);
        }
        writeOut(`\n   Run with more attempts: npm run create:package -- --category=... --topic=... --max-retries=5`);
    }

    if (output.validationResult.warnings.length > 0) {
        writeOut(`\n💡 ${output.validationResult.warnings.length} content warnings (non-blocking):`);
        output.validationResult.warnings.slice(0, 2).forEach(w => {
            writeOut(`   • [${w.rule}] ${w.message}`);
        });
    }

    process.exit(output.validationResult.valid ? 0 : 1);
}

main().catch((error: unknown) => {
    writeErr(`❌ Fatal error: ${getErrorMessage(error)}`);
    process.exit(1);
});
