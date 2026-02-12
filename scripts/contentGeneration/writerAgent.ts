/**
 * Writer Agent - LLM-powered content package generator
 * 3-stage generation with validation + revision loop
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { buildStage1Prompt, buildStage2Prompt, buildStage3Prompt, buildRevisionPrompt } from './llmPrompts';
import { validatePackage, ValidationResult, ParsedPackage } from './packageValidator';

export type LLMProvider = 'claude' | 'chatgpt';

export interface WriterAgentInput {
    category: string;
    topic: string;
    targetChunks?: number;  // Default: 20
    llmProvider: LLMProvider;
    maxRetries?: number;    // Default: 3
}

export interface WriterAgentOutput {
    packageMarkdown: string;
    validationResult: ValidationResult;
    iterationCount: number;
    llmCalls: number;
}

/**
 * Call LLM with prompt
 */
async function callLLM(prompt: string, provider: LLMProvider): Promise<string> {
    if (provider === 'claude') {
        const client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });

        const response = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 8000,
            messages: [{ role: 'user', content: prompt }]
        });

        return response.content[0].type === 'text' ? response.content[0].text : '';
    } else {
        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const response = await client.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 4000
        });

        return response.choices[0]?.message?.content || '';
    }
}

/**
 * Parse markdown package into structured format for validation
 * Extracts context, dialogue, answers, YAML blocks
 */
function parsePackageMarkdown(markdown: string): ParsedPackage {
    // TODO: Implement full markdown parser
    // For now, return stub that will trigger validation
    return {
        category: 'Healthcare',
        context: '',
        characters: [],
        dialogue: [],
        answers: [],
        blanksInOrder: [],
        chunkFeedback: [],
        patternSummary: {},
        activeRecall: [],
        yamlBlock: ''
    };
}

/**
 * Main writer agent: 3-stage generation with validation + revision loop
 */
export async function generateContentPackage(input: WriterAgentInput): Promise<WriterAgentOutput> {
    const targetChunks = input.targetChunks || 20;
    const maxRetries = input.maxRetries || 3;
    let llmCalls = 0;

    console.log(`\n🤖 Writer Agent: Generating ${input.category} package on "${input.topic}"...`);
    console.log(`   Target: ${targetChunks} chunks, max ${maxRetries} revisions`);

    // STAGE 1: Roleplay dialogue generation
    console.log('\n  📝 Stage 1: Generating roleplay dialogue...');
    const stage1Prompt = buildStage1Prompt({
        category: input.category,
        topic: input.topic,
        targetChunks
    });

    const roleplayMarkdown = await callLLM(stage1Prompt, input.llmProvider);
    llmCalls++;
    console.log(`     ✓ Generated ${roleplayMarkdown.split('**').length - 1} dialogue exchanges`);

    // STAGE 2: Answers + chunkFeedback + blanksInOrder
    console.log('\n  📝 Stage 2: Generating answers + chunk feedback...');
    const stage2Prompt = buildStage2Prompt(roleplayMarkdown);
    const stage2Output = await callLLM(stage2Prompt, input.llmProvider);
    llmCalls++;
    console.log(`     ✓ Generated answers and YAML blocks`);

    // STAGE 3: patternSummary + activeRecall
    console.log('\n  📝 Stage 3: Generating pattern summary + active recall...');
    const fullPackageSoFar = `${roleplayMarkdown}\n\n---\n\n${stage2Output}`;
    const stage3Prompt = buildStage3Prompt(fullPackageSoFar);
    const stage3Output = await callLLM(stage3Prompt, input.llmProvider);
    llmCalls++;
    console.log(`     ✓ Generated pattern summary and test items`);

    let packageMarkdown = `# Category: ${input.category}
# Topic: ${input.topic}
# Status: Draft

---

${roleplayMarkdown}

---

${stage2Output}

---

${stage3Output}
`;

    // Validation + Revision Loop
    let iterationCount = 1;
    let validationResult = validatePackage(parsePackageMarkdown(packageMarkdown));

    while (!validationResult.valid && iterationCount <= maxRetries) {
        console.log(`\n  ⚠️  Iteration ${iterationCount}/${maxRetries}: ${validationResult.errors.length} critical errors found`);
        console.log('     Revising package...');

        const revisionPrompt = buildRevisionPrompt(
            validationResult.errors.map(e => ({
                rule: e.rule,
                message: e.message,
                location: e.location
            })),
            packageMarkdown
        );

        packageMarkdown = await callLLM(revisionPrompt, input.llmProvider);
        llmCalls++;
        iterationCount++;

        validationResult = validatePackage(parsePackageMarkdown(packageMarkdown));

        if (validationResult.valid) {
            console.log(`     ✓ Errors resolved!`);
        } else {
            console.log(`     ✗ Still ${validationResult.errors.length} errors, ${maxRetries - iterationCount + 1} attempts remaining`);
        }
    }

    console.log(`\n📊 Generation Complete:`);
    console.log(`   LLM calls: ${llmCalls}`);
    console.log(`   Iterations: ${iterationCount}`);
    console.log(`   Validation: ${validationResult.valid ? '✅ PASSED' : '❌ FAILED'}`);

    if (!validationResult.valid) {
        console.log(`\n❌ ${validationResult.errors.length} unresolved critical errors:`);
        validationResult.errors.slice(0, 5).forEach((e, i) => {
            console.log(`   ${i + 1}. [${e.rule}] ${e.message}`);
        });
        if (validationResult.errors.length > 5) {
            console.log(`   ... and ${validationResult.errors.length - 5} more`);
        }
    }

    if (validationResult.warnings.length > 0) {
        console.log(`\n⚠️  ${validationResult.warnings.length} warnings (non-blocking):`);
        validationResult.warnings.slice(0, 3).forEach((w, i) => {
            console.log(`   ${i + 1}. [${w.rule}] ${w.message}`);
        });
        if (validationResult.warnings.length > 3) {
            console.log(`   ... and ${validationResult.warnings.length - 3} more`);
        }
    }

    return {
        packageMarkdown,
        validationResult,
        iterationCount,
        llmCalls
    };
}

/**
 * Estimate LLM costs based on API pricing
 */
export function estimateCost(llmCalls: number, provider: LLMProvider): { tokens: number; cost: string } {
    const avgTokensPerCall = 6000; // Average for stage outputs
    const totalTokens = llmCalls * avgTokensPerCall;

    let cost = '';
    if (provider === 'claude') {
        // Claude 3.5 Sonnet: $3/1M input, $15/1M output
        const inputCost = (llmCalls * 3000 * 3) / 1000000; // ~50% input
        const outputCost = (llmCalls * 3000 * 15) / 1000000; // ~50% output
        cost = `$${(inputCost + outputCost).toFixed(4)}`;
    } else {
        // GPT-4 Turbo: $10/1M input, $30/1M output
        const inputCost = (llmCalls * 2000 * 10) / 1000000;
        const outputCost = (llmCalls * 2000 * 30) / 1000000;
        cost = `$${(inputCost + outputCost).toFixed(4)}`;
    }

    return { tokens: totalTokens, cost };
}

/**
 * Validate that required environment variables are set
 */
export function validateEnvironment(provider: LLMProvider): { valid: boolean; message?: string } {
    if (provider === 'claude') {
        if (!process.env.ANTHROPIC_API_KEY) {
            return { valid: false, message: 'Missing ANTHROPIC_API_KEY environment variable' };
        }
    } else {
        if (!process.env.OPENAI_API_KEY) {
            return { valid: false, message: 'Missing OPENAI_API_KEY environment variable' };
        }
    }

    return { valid: true };
}
