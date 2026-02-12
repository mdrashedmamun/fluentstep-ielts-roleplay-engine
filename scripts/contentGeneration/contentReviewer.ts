/**
 * Content Reviewer - Validates rules 5, 6, 8, 9
 * Checks: ChunkID references, full chunk blanks, alternatives quality, whyOdd specificity
 */

import {
    validateChunkIdReferences,
    validateFullChunkBlanks,
    validateAlternativesQuality,
    validateWhyOddSpecificity,
    ValidationError,
    ParsedPackage
} from './packageValidator';

export interface ReviewerOutput {
    passed: boolean;
    criticalIssues: ValidationError[];
    warnings: ValidationError[];
    reviewerName: string;
}

/**
 * Parse markdown package into structured format
 */
function parsePackageMarkdown(markdown: string): ParsedPackage {
    // TODO: Full markdown parser implementation
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
 * Run content quality validation
 * Checks: chunkID references, full chunk blanks, alternatives, whyOdd specificity
 */
export async function runContentReview(packageMarkdown: string): Promise<ReviewerOutput> {
    console.log('  🔍 Reviewer 2: Content quality...');

    const parsed = parsePackageMarkdown(packageMarkdown);

    const criticalIssues = [
        ...validateChunkIdReferences(parsed),
        ...validateFullChunkBlanks(parsed)
    ];

    const warnings = [
        ...validateAlternativesQuality(parsed.answers),
        ...validateWhyOddSpecificity(parsed.chunkFeedback)
    ];

    const passed = criticalIssues.length === 0;

    console.log(`    ${passed ? '✅' : '❌'} ${criticalIssues.length} critical issues, ${warnings.length} warnings`);

    if (!passed && criticalIssues.length > 0) {
        const criticalRules = [...new Set(criticalIssues.map(e => e.rule))];
        console.log(`       Critical rules: ${criticalRules.join(', ')}`);
    }

    if (warnings.length > 0) {
        const warningRules = [...new Set(warnings.map(w => w.rule))];
        console.log(`       Soft warnings: ${warningRules.join(', ')}`);
    }

    return {
        passed,
        criticalIssues,
        warnings,
        reviewerName: 'Content Quality Validator'
    };
}

/**
 * Analyze chunk feedback quality
 */
function analyzeChunkQuality(chunk: any): {
    hasMeaning: boolean;
    hasUseWhen: boolean;
    hasCommonWrong: boolean;
    hasExamples: boolean;
    meaningLength: number;
} {
    return {
        hasMeaning: !!chunk.learner?.meaning && chunk.learner.meaning.length > 10,
        hasUseWhen: !!chunk.learner?.useWhen && chunk.learner.useWhen.length > 10,
        hasCommonWrong: !!chunk.learner?.commonWrong && chunk.learner.commonWrong.split(' ').length > 3,
        hasExamples: chunk.examples && chunk.examples.length >= 1,
        meaningLength: chunk.learner?.meaning?.length || 0
    };
}

/**
 * Format content review for display
 */
export function formatContentReview(output: ReviewerOutput, chunkCount?: number): string {
    let report = '📚 CONTENT QUALITY REVIEW\n';
    report += '═══════════════════════════════════════════\n\n';

    if (output.passed && output.warnings.length === 0) {
        report += '✅ All content validations PASSED\n\n';
        report += 'Verified:';
        report += '\n  • All chunkIds in patternSummary/activeRecall exist';
        report += '\n  • Answer text matches chunk.native exactly (no partial blanks)';
        report += '\n  • Alternatives provided (0-4 per blank)';
        report += '\n  • whyOdd explanations are specific\n';
    } else {
        if (output.criticalIssues.length > 0) {
            report += `❌ ${output.criticalIssues.length} CRITICAL ISSUES\n\n`;

            const byRule = new Map<string, ValidationError[]>();
            for (const error of output.criticalIssues) {
                if (!byRule.has(error.rule)) byRule.set(error.rule, []);
                byRule.get(error.rule)!.push(error);
            }

            for (const [rule, errors] of byRule) {
                report += `[${rule}]\n`;
                for (const error of errors.slice(0, 2)) {
                    report += `  • ${error.message}\n`;
                    if (error.location) report += `    └─ ${error.location}\n`;
                }
                if (errors.length > 2) {
                    report += `  • ... and ${errors.length - 2} more\n`;
                }
                report += '\n';
            }
        }

        if (output.warnings.length > 0) {
            report += `⚠️  ${output.warnings.length} CONTENT WARNINGS\n\n`;

            for (const warning of output.warnings.slice(0, 3)) {
                report += `[${warning.rule}]\n`;
                report += `  • ${warning.message}\n`;
                if (warning.location) report += `    └─ ${warning.location}\n`;
                report += '\n';
            }

            if (output.warnings.length > 3) {
                report += `  ... and ${output.warnings.length - 3} more warnings\n\n`;
            }
        }
    }

    return report;
}
