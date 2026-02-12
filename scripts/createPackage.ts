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

import { generateContentPackage, estimateCost, validateEnvironment } from './contentGeneration/writerAgent';
import { runReviewersInParallel, getAllCriticalIssues } from './contentGeneration/reviewerOrchestrator';
import { decideConsensus, formatConsensusDecision } from './contentGeneration/consensusEngine';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface Args {
    category: string;
    topic: string;
    chunks: number;
    provider: 'claude' | 'chatgpt';
    maxRetries: number;
    autoImport: boolean;
    help?: boolean;
}

function parseArgs(): Args {
    const args = process.argv.slice(2);
    const result: any = { provider: 'claude', chunks: 20, maxRetries: 3, autoImport: false };

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
            result.provider = arg.split('=')[1];
        } else if (arg.startsWith('--max-retries=')) {
            result.maxRetries = parseInt(arg.split('=')[1]);
        } else if (arg === '--auto-import') {
            result.autoImport = true;
        }
    }

    return result;
}

function showHelp() {
    console.log(`
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

    console.log(`\n${'═'.repeat(70)}`);
    console.log('🚀 CONTENT PACKAGE CREATION PIPELINE');
    console.log(`${'═'.repeat(70)}\n`);

    console.log(`📋 Package Details:`);
    console.log(`   Category: ${args.category}`);
    console.log(`   Topic: ${args.topic}`);
    console.log(`   Target chunks: ${args.chunks}`);
    console.log(`   Provider: ${args.provider}`);
    console.log(`   Max revisions: ${args.maxRetries}\n`);

    // Initial generation
    console.log(`\n${'─'.repeat(70)}`);
    console.log('PHASE 1: INITIAL GENERATION');
    console.log(`${'─'.repeat(70)}\n`);

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

    console.log(`\n✓ Initial draft generated and saved to ${outputPath}`);

    // Review-revise loop
    let iteration = 1;
    const maxIterations = args.maxRetries;
    let review;
    let decision;

    do {
        console.log(`\n${'─'.repeat(70)}`);
        console.log(`PHASE 2: REVIEW CYCLE ${iteration}/${maxIterations}`);
        console.log(`${'─'.repeat(70)}\n`);

        // Run 3 reviewers in parallel
        review = await runReviewersInParallel(packageMarkdown);

        // Get consensus decision
        decision = decideConsensus(review, iteration, maxIterations);

        console.log(formatConsensusDecision(decision));

        // Handle revision
        if (decision.action === 'revise' && iteration < maxIterations) {
            console.log(`${'─'.repeat(70)}`);
            console.log(`PHASE 3: REVISION (ITERATION ${iteration})`);
            console.log(`${'─'.repeat(70)}\n`);

            console.log(`Revising package with ${decision.issuesForWriter?.length || 0} issues to fix...\n`);

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
    console.log(`\n${'═'.repeat(70)}`);
    console.log('📊 FINAL REPORT');
    console.log(`${'═'.repeat(70)}\n`);

    console.log(`Result: ${decision.action.toUpperCase()}`);
    console.log(`Iterations: ${iteration}/${maxIterations}`);
    console.log(`LLM API calls: ${totalLLMCalls}`);

    const cost = estimateCost(totalLLMCalls, args.provider);
    console.log(`Estimated cost: ${cost.cost}`);

    if (decision.action === 'pass') {
        console.log(`\n✅ PACKAGE APPROVED - All validations passed!\n`);

        // Update file with final status
        const finalContent = packageMarkdown.replace(/# Status: Draft/, '# Status: Approved');
        fs.writeFileSync(outputPath, finalContent);

        if (args.autoImport) {
            console.log(`\n${'─'.repeat(70)}`);
            console.log('PHASE 4: AUTO-IMPORT');
            console.log(`${'─'.repeat(70)}\n`);

            console.log('Importing to staticData.ts...');

            try {
                execSync(`npm run import:enrichments -- --file=${filename}`, { stdio: 'inherit' });
                console.log('\n✅ Package imported successfully!');
            } catch (e) {
                console.error('\n❌ Import failed - please import manually');
                console.log(`   npm run import:enrichments -- --file=${filename}`);
            }
        } else {
            console.log(`\n📥 Next step: Import to staticData.ts`);
            console.log(`   npm run import:enrichments -- --file=${filename}`);
        }

        process.exit(0);
    } else if (decision.action === 'reject') {
        console.log(`\n❌ PACKAGE REJECTED\n`);
        console.log(`Reason: ${decision.reason}\n`);

        if (decision.nextSteps) {
            console.log('Suggestions:');
            for (const step of decision.nextSteps) {
                console.log(`  • ${step}`);
            }
        }

        console.log(`\n📄 Review package: ${outputPath}`);
        process.exit(1);
    } else {
        console.log(`\n⚠️  Pipeline incomplete (status: ${decision.action})`);
        process.exit(1);
    }
}

main().catch(err => {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
});
