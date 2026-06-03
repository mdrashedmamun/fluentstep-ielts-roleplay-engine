/**
 * Reviewer Orchestrator - Runs 3 reviewers in parallel and aggregates results
 * Follows pattern from existing auditOrchestrator.ts
 */

import { runStructuralReview } from './structuralReviewer';
import { runContentReview } from './contentReviewer';
import { runLinguisticReview } from './linguisticReviewer';
import type { ValidationError } from './packageValidator';

const writeOut = (message = ''): void => {
    process.stdout.write(`${message}\n`);
};

const formatRules = (issues: ValidationError[]): string => (
    [...new Set(issues.map((issue) => issue.rule))].join(', ')
);

export interface ReviewerOutput {
    passed: boolean;
    criticalIssues: ValidationError[];
    warnings: ValidationError[];
    reviewerName: string;
}

export interface AggregatedReview {
    passed: boolean;
    criticalIssueCount: number;
    warningCount: number;
    reviewersPassed: number;
    reviewersFailed: number;
    reviewers: {
        structural: ReviewerOutput;
        content: ReviewerOutput;
        linguistic: ReviewerOutput;
    };
}

/**
 * Run all 3 reviewers in parallel
 */
export async function runReviewersInParallel(packageMarkdown: string): Promise<AggregatedReview> {
    writeOut('\n📋 Running 3 reviewers in parallel...\n');

    // Execute all 3 simultaneously
    const [structural, content, linguistic] = await Promise.all([
        runStructuralReview(packageMarkdown),
        runContentReview(packageMarkdown),
        runLinguisticReview(packageMarkdown)
    ]);

    const allCriticalIssues = [
        ...structural.criticalIssues,
        ...content.criticalIssues,
        ...linguistic.criticalIssues
    ];

    const allWarnings = [
        ...structural.warnings,
        ...content.warnings,
        ...linguistic.warnings
    ];

    const reviewersPassed = [structural, content, linguistic].filter(r => r.passed).length;
    const reviewersFailed = [structural, content, linguistic].filter(r => !r.passed).length;
    const passed = structural.passed && content.passed && linguistic.passed;

    writeOut('\n📊 REVIEW AGGREGATION');
    writeOut('═══════════════════════════════════════════\n');

    // Summary line
    if (passed) {
        writeOut('✅ ALL REVIEWERS PASSED');
    } else {
        writeOut(`❌ ${reviewersFailed} reviewer(s) found issues`);
    }

    writeOut(`\nReviewer Status:`);
    writeOut(`  ${structural.passed ? '✅' : '❌'} Structural: ${structural.criticalIssues.length} critical`);
    writeOut(`  ${content.passed ? '✅' : '❌'} Content: ${content.criticalIssues.length} critical, ${content.warnings.length} warnings`);
    writeOut(`  ${linguistic.passed ? '✅' : '❌'} Linguistic: ${linguistic.criticalIssues.length} critical, ${linguistic.warnings.length} warnings`);

    writeOut(`\nTotal Issues:`);
    writeOut(`  Critical: ${allCriticalIssues.length}`);
    writeOut(`  Warnings: ${allWarnings.length}`);

    // Group issues by reviewer
    if (allCriticalIssues.length > 0) {
        writeOut('\n⚠️  Critical Issues by Reviewer:\n');

        const structuralCrit = structural.criticalIssues.length;
        const contentCrit = content.criticalIssues.length;
        const linguisticCrit = linguistic.criticalIssues.length;

        if (structuralCrit > 0) {
            writeOut(`  📋 Structural (${structuralCrit}):`);
            writeOut(`     ${formatRules(structural.criticalIssues)}`);
        }

        if (contentCrit > 0) {
            writeOut(`  📚 Content (${contentCrit}):`);
            writeOut(`     ${formatRules(content.criticalIssues)}`);
        }

        if (linguisticCrit > 0) {
            writeOut(`  🗣️  Linguistic (${linguisticCrit}):`);
            writeOut(`     ${formatRules(linguistic.criticalIssues)}`);
        }
    }

    return {
        passed,
        criticalIssueCount: allCriticalIssues.length,
        warningCount: allWarnings.length,
        reviewersPassed,
        reviewersFailed,
        reviewers: { structural, content, linguistic }
    };
}

/**
 * Get all critical issues from aggregated review
 */
export function getAllCriticalIssues(review: AggregatedReview): ValidationError[] {
    return [
        ...review.reviewers.structural.criticalIssues,
        ...review.reviewers.content.criticalIssues,
        ...review.reviewers.linguistic.criticalIssues
    ];
}

/**
 * Get all warnings from aggregated review
 */
export function getAllWarnings(review: AggregatedReview): ValidationError[] {
    return [
        ...review.reviewers.structural.warnings,
        ...review.reviewers.content.warnings,
        ...review.reviewers.linguistic.warnings
    ];
}

/**
 * Format aggregated review for display
 */
export function formatAggregatedReview(review: AggregatedReview): string {
    let report = '\n🎯 AGGREGATED REVIEW REPORT\n';
    report += '═══════════════════════════════════════════\n\n';

    // Overall verdict
    if (review.passed) {
        report += '✅✅✅ ALL REVIEWERS APPROVED ✅✅✅\n\n';
        report += 'Package is READY FOR IMPORT\n';
    } else {
        report += `❌ PACKAGE REQUIRES REVISION\n\n`;
        report += `Issues Found:\n`;
        report += `  • ${review.criticalIssueCount} Critical Errors\n`;
        report += `  • ${review.warningCount} Warnings\n\n`;
        report += `Failed Reviewers: ${review.reviewersFailed}/3\n`;
    }

    report += '\nDetailed Breakdown:\n';
    report += `  Structural: ${review.reviewers.structural.passed ? '✅ PASSED' : '❌ ' + review.reviewers.structural.criticalIssues.length + ' ERRORS'}\n`;
    report += `  Content:    ${review.reviewers.content.passed ? '✅ PASSED' : '❌ ' + review.reviewers.content.criticalIssues.length + ' ERRORS'}\n`;
    report += `  Linguistic: ${review.reviewers.linguistic.passed ? '✅ PASSED' : '❌ ' + review.reviewers.linguistic.criticalIssues.length + ' ERRORS'}\n`;

    return report;
}
