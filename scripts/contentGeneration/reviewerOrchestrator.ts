/**
 * Reviewer Orchestrator - Runs 3 reviewers in parallel and aggregates results
 * Follows pattern from existing auditOrchestrator.ts
 */

import { runStructuralReview } from './structuralReviewer';
import { runContentReview } from './contentReviewer';
import { runLinguisticReview } from './linguisticReviewer';

export interface ReviewerOutput {
    passed: boolean;
    criticalIssues: any[];
    warnings: any[];
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
    console.log('\n📋 Running 3 reviewers in parallel...\n');

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

    console.log('\n📊 REVIEW AGGREGATION');
    console.log('═══════════════════════════════════════════\n');

    // Summary line
    if (passed) {
        console.log('✅ ALL REVIEWERS PASSED');
    } else {
        console.log(`❌ ${reviewersFailed} reviewer(s) found issues`);
    }

    console.log(`\nReviewer Status:`);
    console.log(`  ${structural.passed ? '✅' : '❌'} Structural: ${structural.criticalIssues.length} critical`);
    console.log(`  ${content.passed ? '✅' : '❌'} Content: ${content.criticalIssues.length} critical, ${content.warnings.length} warnings`);
    console.log(`  ${linguistic.passed ? '✅' : '❌'} Linguistic: ${linguistic.criticalIssues.length} critical, ${linguistic.warnings.length} warnings`);

    console.log(`\nTotal Issues:`);
    console.log(`  Critical: ${allCriticalIssues.length}`);
    console.log(`  Warnings: ${allWarnings.length}`);

    // Group issues by reviewer
    if (allCriticalIssues.length > 0) {
        console.log('\n⚠️  Critical Issues by Reviewer:\n');

        const structuralCrit = structural.criticalIssues.length;
        const contentCrit = content.criticalIssues.length;
        const linguisticCrit = linguistic.criticalIssues.length;

        if (structuralCrit > 0) {
            console.log(`  📋 Structural (${structuralCrit}):`);
            const rules = [...new Set(structural.criticalIssues.map((e: any) => e.rule))];
            console.log(`     ${rules.join(', ')}`);
        }

        if (contentCrit > 0) {
            console.log(`  📚 Content (${contentCrit}):`);
            const rules = [...new Set(content.criticalIssues.map((e: any) => e.rule))];
            console.log(`     ${rules.join(', ')}`);
        }

        if (linguisticCrit > 0) {
            console.log(`  🗣️  Linguistic (${linguisticCrit}):`);
            const rules = [...new Set(linguistic.criticalIssues.map((e: any) => e.rule))];
            console.log(`     ${rules.join(', ')}`);
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
export function getAllCriticalIssues(review: AggregatedReview): any[] {
    return [
        ...review.reviewers.structural.criticalIssues,
        ...review.reviewers.content.criticalIssues,
        ...review.reviewers.linguistic.criticalIssues
    ];
}

/**
 * Get all warnings from aggregated review
 */
export function getAllWarnings(review: AggregatedReview): any[] {
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
