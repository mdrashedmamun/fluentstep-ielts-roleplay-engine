/**
 * Structural Reviewer - Validates rules 1, 2, 3, 4, 10
 * Checks: Blank count, YAML syntax, blank-chunk mapping, dialogue structure, chunk slug uniqueness
 */

import {
    validateBlankCountConsistency,
    validateYamlSyntax,
    validateBlankChunkMapping,
    validateDialogueStructure,
    validateChunkSlugUniqueness,
    ValidationError,
    ParsedPackage
} from './packageValidator';

export interface ReviewerOutput {
    passed: boolean;
    criticalIssues: ValidationError[];
    warnings: ValidationError[];
    reviewerName: string;
}

const writeOut = (message = ''): void => {
    process.stdout.write(`${message}\n`);
};

/**
 * Parse markdown package into structured format
 * Stub implementation - actual parser would extract all sections
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
        yamlBlock: markdown
    };
}

/**
 * Run structural validation
 * Checks: blank count consistency, YAML syntax, blank-chunk mapping, dialogue structure, chunk slug uniqueness
 */
export function runStructuralReview(packageMarkdown: string): Promise<ReviewerOutput> {
    writeOut('  🔍 Reviewer 1: Structural validation...');

    const parsed = parsePackageMarkdown(packageMarkdown);

    const criticalIssues = [
        ...validateBlankCountConsistency(parsed),
        ...validateYamlSyntax(parsed.yamlBlock),
        ...validateBlankChunkMapping(parsed),
        ...validateDialogueStructure(parsed.dialogue),
        ...validateChunkSlugUniqueness(parsed.chunkFeedback)
    ];

    const passed = criticalIssues.length === 0;

    writeOut(`    ${passed ? '✅' : '❌'} ${criticalIssues.length} critical issues`);

    if (!passed && criticalIssues.length > 0) {
        writeOut(`       Rules violated: ${[...new Set(criticalIssues.map(e => e.rule))].join(', ')}`);
    }

    return Promise.resolve({
        passed,
        criticalIssues,
        warnings: [],
        reviewerName: 'Structural Validator'
    });
}

/**
 * Format structural review for display
 */
export function formatStructuralReview(output: ReviewerOutput): string {
    let report = '📋 STRUCTURAL REVIEW\n';
    report += '═══════════════════════════════════════════\n\n';

    if (output.passed) {
        report += '✅ All structural validations PASSED\n\n';
        report += 'Verified:';
        report += '\n  • Blank count consistency (dialogue ≥ answers ≥ mappings)';
        report += '\n  • YAML syntax valid';
        report += '\n  • All blanks map to valid chunks';
        report += '\n  • Dialogue: 2 speakers, 30+ lines';
        report += '\n  • No duplicate chunk slugs\n';
    } else {
        report += `❌ ${output.criticalIssues.length} CRITICAL ERRORS\n\n`;

        const byRule = new Map<string, ValidationError[]>();
        for (const error of output.criticalIssues) {
            if (!byRule.has(error.rule)) byRule.set(error.rule, []);
            byRule.get(error.rule)!.push(error);
        }

        for (const [rule, errors] of byRule) {
            report += `[${rule}]\n`;
            for (const error of errors) {
                report += `  • ${error.message}\n`;
                if (error.location) report += `    └─ ${error.location}\n`;
            }
            report += '\n';
        }
    }

    return report;
}
