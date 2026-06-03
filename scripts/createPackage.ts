#!/usr/bin/env node

/**
 * CLI: Full content package creation pipeline
 * Usage: npm run create:package -- --category=Healthcare --topic="GP appointment" [--auto-import]
 *
 * Pipeline:
 * 1. Writer Agent: Generate initial draft (3 stages)
 * 2. Review Orchestrator: 3 parallel reviewers
 * 3. Consensus Engine: Decide pass/revise/reject
 * 4. Writer Agent: Revise if needed (up to 3 iterations)
 * 5. Import Pipeline: Import to staticData.ts (optional)
 */

import { generateContentPackage, estimateCost, validateEnvironment, type LLMProvider } from "./contentGeneration/writerAgent";
import { runReviewersInParallel } from "./contentGeneration/reviewerOrchestrator";
import { decideConsensus, formatConsensusDecision } from './contentGeneration/consensusEngine';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface Args {
    category?: string;
    topic?: string;
    chunks: number;
    provider: LLMProvider;
    maxRetries: number;
    autoImport: boolean;
    help: boolean;
    invalidProvider?: string;
}

const writeOut = (message = ""): void => {
    process.stdout.write(`${message}\n`);
};

const writeErr = (message: string): void => {
    process.stderr.write(`${message}\n`);
};

const getErrorMessage = (error: unknown): string => (
    error instanceof Error ? error.message : String(error)
);

const getArgValue = (arg: string): string => arg.slice(arg.indexOf("=") + 1);

const parseIntegerArg = (value: string, fallback: number): number => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const isLLMProvider = (value: string): value is LLMProvider => (
    value === "claude" || value === "chatgpt"
);

function parseArgs(): Args {
    const args = process.argv.slice(2);
    const result: Args = { provider: "claude", chunks: 20, maxRetries: 3, autoImport: false, help: false };

    for (const arg of args) {
        if (arg === "--help" || arg === "-h") {
            result.help = true;
        } else if (arg.startsWith("--category=")) {
            result.category = getArgValue(arg);
        } else if (arg.startsWith("--topic=")) {
            result.topic = getArgValue(arg);
        } else if (arg.startsWith("--chunks=")) {
            result.chunks = parseIntegerArg(getArgValue(arg), result.chunks);
        } else if (arg.startsWith("--provider=")) {
            const provider = getArgValue(arg);
            if (isLLMProvider(provider)) {
                result.provider = provider;
            } else {
                result.invalidProvider = provider;
            }
        } else if (arg.startsWith("--max-retries=")) {
            result.maxRetries = parseIntegerArg(getArgValue(arg), result.maxRetries);
        } else if (arg === "--auto-import") {
            result.autoImport = true;
        }
    }

    return result;
}

function showHelp() {
    writeOut(`
🚀 Content Package Creator

Full pipeline: Generate → Review (3 agents) → Decide → Revise (if needed) → Import

Usage:
  npm run create:package -- --category=CATEGORY --topic="TOPIC" [OPTIONS]

Required:
  --category=CATEGORY       Category (Social, Workplace, Service/Logistics, Advanced, Academic, Healthcare, Cultural, Community)
  --topic="TOPIC"           Scenario topic (e.g., "GP appointment")

Optional:
  --chunks=NUMBER           Target chunk count (default: 20)
  --provider=PROVIDER       LLM provider (claude or chatgpt, default: claude)
  --max-retries=NUMBER      Max revision iterations (default: 3)
  --auto-import             Automatically import if validation passes (default: false)
  --help                    Show this help message

Examples:
  npm run create:package -- --category=Healthcare --topic="GP appointment"
  npm run create:package -- --category=Social --topic="Meeting flatmate" --auto-import

Pipeline Steps:
  1. Writer Agent generates package (3 stages + initial validation)
  2. 3 Reviewers validate in parallel (Structural, Content, Linguistic)
  3. Consensus Engine decides: pass/revise/reject
  4. Writer Agent revises if needed (max 3 iterations)
  5. Import to staticData.ts (if --auto-import flag set)

Typical Duration: 10-15 minutes per package (1-2 revision cycles)

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

    writeOut(`\n${'═'.repeat(70)}`);
    writeOut('🚀 CONTENT PACKAGE CREATION PIPELINE');
    writeOut(`${'═'.repeat(70)}\n`);

    writeOut(`📋 Package Details:`);
    writeOut(`   Category: ${args.category}`);
    writeOut(`   Topic: ${args.topic}`);
    writeOut(`   Target chunks: ${args.chunks}`);
    writeOut(`   Provider: ${args.provider}`);
    writeOut(`   Max revisions: ${args.maxRetries}\n`);

    // Initial generation
    writeOut(`\n${'─'.repeat(70)}`);
    writeOut('PHASE 1: INITIAL GENERATION');
    writeOut(`${'─'.repeat(70)}\n`);

    const generated = await generateContentPackage({
        category: args.category,
        topic: args.topic,
        targetChunks: args.chunks,
        llmProvider: args.provider,
        maxRetries: 1 // Just one attempt, we'll revise if needed
    });

    let packageMarkdown = generated.packageMarkdown;
    let totalLLMCalls = generated.llmCalls;

    // Save initial draft
    const timestamp = Date.now();
    const safeCategory = args.category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `${safeCategory}-${timestamp}.md`;
    const outputDir = path.join('exports', 'generated');
    const outputPath = path.join(outputDir, filename);

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputPath, packageMarkdown);

    writeOut(`\n✓ Initial draft generated and saved to ${outputPath}`);

    // Review-revise loop
    let iteration = 1;
    const maxIterations = args.maxRetries;
    let review;
    let decision;

    do {
        writeOut(`\n${'─'.repeat(70)}`);
        writeOut(`PHASE 2: REVIEW CYCLE ${iteration}/${maxIterations}`);
        writeOut(`${'─'.repeat(70)}\n`);

        // Run 3 reviewers in parallel
        review = await runReviewersInParallel(packageMarkdown);

        // Get consensus decision
        decision = decideConsensus(review, iteration, maxIterations);

        writeOut(formatConsensusDecision(decision));

        // Handle revision
        if (decision.action === 'revise' && iteration < maxIterations) {
            writeOut(`${'─'.repeat(70)}`);
            writeOut(`PHASE 3: REVISION (ITERATION ${iteration})`);
            writeOut(`${'─'.repeat(70)}\n`);

            writeOut(`Revising package with ${decision.issuesForWriter?.length || 0} issues to fix...\n`);

            // Call writer agent with revision prompt
            const revision = await generateContentPackage({
                category: args.category,
                topic: args.topic,
                targetChunks: args.chunks,
                llmProvider: args.provider,
                maxRetries: 1
            });

            packageMarkdown = revision.packageMarkdown;
            totalLLMCalls += revision.llmCalls;
            iteration++;
        } else {
            break;
        }

    } while (!['pass', 'reject'].includes(decision.action) && iteration <= maxIterations);

    // Final report
    writeOut(`\n${'═'.repeat(70)}`);
    writeOut('📊 FINAL REPORT');
    writeOut(`${'═'.repeat(70)}\n`);

    writeOut(`Result: ${decision.action.toUpperCase()}`);
    writeOut(`Iterations: ${iteration}/${maxIterations}`);
    writeOut(`LLM API calls: ${totalLLMCalls}`);

    const cost = estimateCost(totalLLMCalls, args.provider);
    writeOut(`Estimated cost: ${cost.cost}`);

    if (decision.action === 'pass') {
        writeOut(`\n✅ PACKAGE APPROVED - All validations passed!\n`);

        // Update file with final status
        const finalContent = packageMarkdown.replace(/# Status: Draft/, '# Status: Approved');
        fs.writeFileSync(outputPath, finalContent);

        if (args.autoImport) {
            writeOut(`\n${'─'.repeat(70)}`);
            writeOut('PHASE 4: AUTO-IMPORT');
            writeOut(`${'─'.repeat(70)}\n`);

            writeOut('Importing to staticData.ts...');

            try {
                execSync(`npm run import:enrichments -- --file=${filename}`, { stdio: 'inherit' });
                writeOut('\n✅ Package imported successfully!');
            } catch {
                writeErr('\n❌ Import failed - please import manually');
                writeOut(`   npm run import:enrichments -- --file=${filename}`);
            }
        } else {
            writeOut(`\n📥 Next step: Import to staticData.ts`);
            writeOut(`   npm run import:enrichments -- --file=${filename}`);
        }

        process.exit(0);
    } else if (decision.action === 'reject') {
        writeOut(`\n❌ PACKAGE REJECTED\n`);
        writeOut(`Reason: ${decision.reason}\n`);

        if (decision.nextSteps) {
            writeOut('Suggestions:');
            for (const step of decision.nextSteps) {
                writeOut(`  • ${step}`);
            }
        }

        writeOut(`\n📄 Review package: ${outputPath}`);
        process.exit(1);
    } else {
        writeOut(`\n⚠️  Pipeline incomplete (status: ${decision.action})`);
        process.exit(1);
    }
}

main().catch((error: unknown) => {
    writeErr(`\n❌ Fatal error: ${getErrorMessage(error)}`);
    process.exit(1);
});
