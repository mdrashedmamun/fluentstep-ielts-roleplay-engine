/**
 * Consensus Engine - Decides pass/revise/reject based on reviewer outputs
 * Prevents infinite loops with max iteration limits
 */

import { AggregatedReview } from './reviewerOrchestrator';

export interface ConsensusDecision {
    action: 'pass' | 'revise' | 'reject';
    reason: string;
    issuesForWriter?: Array<{ rule: string; message: string; location?: string }>;
    iterationCount: number;
    nextSteps?: string[];
}

/**
 * Consensus logic: Decide pass/revise/reject
 * Rule: Any critical issue = revise (if attempts remaining) or reject (if max reached)
 */
export function decideConsensus(
    review: AggregatedReview,
    currentIteration: number,
    maxIterations: number = 3
): ConsensusDecision {
    const criticalCount = review.criticalIssueCount;
    const warningCount = review.warningCount;

    // HARD RULE: Any critical issue blocks passing
    if (criticalCount > 0) {
        // Check if iterations remaining
        if (currentIteration >= maxIterations) {
            return {
                action: 'reject',
                reason: `Max iterations (${maxIterations}) reached with ${criticalCount} unresolved critical errors`,
                iterationCount: currentIteration,
                nextSteps: [
                    'Review writer agent performance on this topic',
                    'Consider splitting into multiple packages',
                    'Check LLM model output quality'
                ]
            };
        }

        // Get all critical issues for writer to fix
        const allErrors: Array<{ rule: string; message: string; location?: string }> = [];

        for (const error of review.reviewers.structural.criticalIssues) {
            allErrors.push(error);
        }
        for (const error of review.reviewers.content.criticalIssues) {
            allErrors.push(error);
        }
        for (const error of review.reviewers.linguistic.criticalIssues) {
            allErrors.push(error);
        }

        return {
            action: 'revise',
            reason: `Found ${criticalCount} critical issue(s) - attempting revision (${maxIterations - currentIteration} attempts remaining)`,
            issuesForWriter: allErrors,
            iterationCount: currentIteration,
            nextSteps: [
                `Fix critical errors and resubmit (attempt ${currentIteration + 1}/${maxIterations})`,
                'Focus on highest-severity issues first'
            ]
        };
    }

    // SOFT RULE: Many warnings on first attempt = revise once
    if (warningCount >= 5 && currentIteration === 1) {
        const allWarnings: Array<{ rule: string; message: string; location?: string }> = [];

        for (const warning of review.reviewers.structural.warnings) {
            allWarnings.push(warning);
        }
        for (const warning of review.reviewers.content.warnings) {
            allWarnings.push(warning);
        }
        for (const warning of review.reviewers.linguistic.warnings) {
            allWarnings.push(warning);
        }

        return {
            action: 'revise',
            reason: `${warningCount} content warnings detected - attempt one light revision`,
            issuesForWriter: allWarnings,
            iterationCount: currentIteration,
            nextSteps: [
                `Address soft warnings for better content quality`,
                'Focus on specificity in explanations (whyOdd, patterns)'
            ]
        };
    }

    // NO ISSUES: PASS
    return {
        action: 'pass',
        reason: `✅ All validations passed${warningCount > 0 ? ` (${warningCount} minor warnings are acceptable)` : ''}`,
        iterationCount: currentIteration,
        nextSteps: ['Package ready for import to staticData.ts', 'No further revision needed']
    };
}

/**
 * Determine if decision is final (pass/reject) or needs another iteration (revise)
 */
export function isFinal(decision: ConsensusDecision): boolean {
    return decision.action === 'pass' || decision.action === 'reject';
}

/**
 * Format consensus decision for display
 */
export function formatConsensusDecision(decision: ConsensusDecision): string {
    let report = '\n🎯 CONSENSUS DECISION\n';
    report += '═══════════════════════════════════════════\n\n';

    // Main decision
    if (decision.action === 'pass') {
        report += '✅✅✅ PACKAGE APPROVED ✅✅✅\n\n';
    } else if (decision.action === 'revise') {
        report += `⚠️  REVISION REQUIRED\n`;
        report += `   Iteration: ${decision.iterationCount}/3\n\n`;
    } else {
        report += '❌ PACKAGE REJECTED\n';
        report += `   Final iteration: ${decision.iterationCount}/3\n\n`;
    }

    report += `Reason: ${decision.reason}\n`;

    if (decision.issuesForWriter && decision.issuesForWriter.length > 0) {
        report += `\nIssues to Fix (${decision.issuesForWriter.length} total):\n`;

        const byRule = new Map<string, typeof decision.issuesForWriter>();
        for (const issue of decision.issuesForWriter) {
            const key = issue.rule;
            if (!byRule.has(key)) byRule.set(key, []);
            byRule.get(key)!.push(issue);
        }

        let count = 1;
        for (const [rule, issues] of byRule) {
            for (const issue of issues.slice(0, 1)) {
                // Only show first issue per rule to keep concise
                report += `  ${count}. [${rule}] ${issue.message}\n`;
                count++;
            }
            if (issues.length > 1) {
                report += `     (${issues.length - 1} more similar issues)\n`;
            }
        }
    }

    if (decision.nextSteps && decision.nextSteps.length > 0) {
        report += `\nNext Steps:\n`;
        for (const step of decision.nextSteps) {
            report += `  • ${step}\n`;
        }
    }

    report += '\n';

    return report;
}

/**
 * Get all issues that need fixing
 */
export function getAllIssuesForWriter(
    decision: ConsensusDecision
): Array<{ rule: string; message: string; location?: string }> {
    return decision.issuesForWriter || [];
}

/**
 * Count issues by severity
 */
export function countIssuesBySeverity(
    issues: Array<{ rule: string; message: string }>
): { byRule: Map<string, number>; byMessage: Map<string, number> } {
    const byRule = new Map<string, number>();
    const byMessage = new Map<string, number>();

    for (const issue of issues) {
        byRule.set(issue.rule, (byRule.get(issue.rule) || 0) + 1);

        // Normalize message (first 50 chars)
        const msgKey = issue.message.substring(0, 50);
        byMessage.set(msgKey, (byMessage.get(msgKey) || 0) + 1);
    }

    return { byRule, byMessage };
}
