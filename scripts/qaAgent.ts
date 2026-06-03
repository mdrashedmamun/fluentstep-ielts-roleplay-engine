/**
 * QA Agent - Quality Assurance Orchestrator
 *
 * Consolidates all validators into a unified QA system with 4 gates:
 * 1. Structural Discipline - Hard structural requirements
 * 2. Pragmatic Sensitivity - Soft conversational quality gates
 * 3. Chunk Awareness - Locked chunk compliance
 * 4. Register Control - UK English and formality rules
 *
 * Philosophy: This is a bouncer, not a teacher.
 * It says YES or NO with specific reasons. It doesn't improve, it validates.
 */

import { RoleplayScript } from '../src/services/staticData';
import { ValidationFinding } from '../src/services/linguisticAudit/types';
import { validateStructuralDiscipline } from './structuralDisciplineValidator';
import { validateChunkCompliance } from '../src/services/linguisticAudit/validators/chunkComplianceValidator';
import { validateNaturalPatterns } from '../src/services/linguisticAudit/validators/naturalPatternsValidator';
import { validateTonality } from '../src/services/linguisticAudit/validators/tonalityValidator';
import { validateDialogueFlow } from '../src/services/linguisticAudit/validators/dialogueFlowValidator';
import { validateBlankAnswerPairing } from '../src/services/linguisticAudit/validators/blankAnswerPairingValidator';
import { validateAlternatives } from '../src/services/linguisticAudit/validators/alternativesValidator';
import { validateUKEnglish } from '../src/services/linguisticAudit/validators/ukEnglishValidator';
import { validateWrittenVsSpoken } from '../src/services/linguisticAudit/validators/writtenVsSpokenValidator';
import { validateExamLanguage } from '../src/services/linguisticAudit/validators/examLanguageValidator';
import { validateIELTSAuthenticity } from '../src/services/linguisticAudit/validators/ieltsAuthenticityValidator';
import { validateSpokenNaturalness } from '../src/services/linguisticAudit/validators/spokenNaturalnessValidator';
import { validatePedagogy } from '../src/services/linguisticAudit/validators/pedagogyValidator';

type GateType =
  | 'structural'
  | 'pragmatic'
  | 'chunk'
  | 'register'
  | 'ielts'
  | 'spoken'
  | 'pedagogy';

export type FinalApprovalStatus = 'approved' | 'blocked' | 'needs-human-review';

export interface FinalApproval {
  status: FinalApprovalStatus;
  blockingGates: string[];
  humanReviewRequired: boolean;
  reason: string;
}

/**
 * Result from a single QA gate
 */
export interface GateResult {
  passed: boolean;
  confidence: number;  // 0-1 average confidence across findings
  findingCount: number;
  findings: ValidationFinding[];
  criticalIssues: ValidationFinding[];  // Issues that block approval
  warnings: ValidationFinding[];        // Non-blocking issues
  suggestions: ValidationFinding[];     // Optional improvements
}

/**
 * Complete QA report for a scenario
 */
export interface QAReport {
  scenarioId: string;
  scenarioTitle: string;
  timestamp: string;
  passed: boolean;
  overallConfidence: number;  // Average of all gates

  gates: {
    structuralDiscipline: GateResult;
    pragmaticSensitivity: GateResult;
    chunkAwareness: GateResult;
    registerControl: GateResult;
    ieltsAuthenticity: GateResult;
    spokenNaturalness: GateResult;
    pedagogy: GateResult;
  };

  humanReview: {
    status: 'not-started' | 'not-required';
    required: boolean;
  };
  finalApproval: FinalApproval;

  criticalIssues: ValidationFinding[];
  warnings: ValidationFinding[];
  suggestions: ValidationFinding[];

  summary: {
    totalFindings: number;
    criticalCount: number;
    warningCount: number;
    suggestionCount: number;
  };
}

/**
 * Run comprehensive QA on a scenario
 */
export function runQACheck(scenario: RoleplayScript): QAReport {
  const timestamp = new Date().toISOString();
  const allFindings: ValidationFinding[] = [];

  // GATE 1: Structural Discipline (Hard Gates)
  const structuralFindings = validateStructuralDiscipline(scenario);
  const structuralGate = classifyFindings(structuralFindings, 'structural');
  allFindings.push(...structuralFindings);

  // GATE 2: Pragmatic Sensitivity (Soft Gates)
  const pragmaticFindings = [
    ...validateNaturalPatterns(scenario),
    ...validateDialogueFlow(scenario),
    ...validateWrittenVsSpoken(scenario),
    ...validateExamLanguage(scenario)
  ];
  const pragmaticGate = classifyFindings(pragmaticFindings, 'pragmatic');
  allFindings.push(...pragmaticFindings);

  // GATE 3: Chunk Awareness (Critical Gate)
  const chunkFindings = validateChunkCompliance(scenario);
  const chunkGate = classifyFindings(chunkFindings, 'chunk');
  allFindings.push(...chunkFindings);

  // GATE 4: Register Control
  const registerFindings = [
    ...validateTonality(scenario),
    ...validateUKEnglish(scenario),
    ...validateBlankAnswerPairing(scenario),
    ...validateAlternatives(scenario)
  ];
  const registerGate = classifyFindings(registerFindings, 'register');
  allFindings.push(...registerFindings);

  // GATE 5: IELTS Authenticity (Critical Gate)
  const ieltsFindings = validateIELTSAuthenticity(scenario);
  const ieltsGate = classifyFindings(ieltsFindings, 'ielts');
  allFindings.push(...ieltsFindings);

  // GATE 6: Spoken Naturalness (Subjective unless severe)
  const spokenFindings = validateSpokenNaturalness(scenario);
  const spokenGate = classifyFindings(spokenFindings, 'spoken');
  allFindings.push(...spokenFindings);

  // GATE 7: Pedagogy (Major failures block)
  const pedagogyFindings = validatePedagogy(scenario);
  const pedagogyGate = classifyFindings(pedagogyFindings, 'pedagogy');
  allFindings.push(...pedagogyFindings);

  // Calculate overall confidence
  const gateConfidences = [
    structuralGate.confidence,
    pragmaticGate.confidence,
    chunkGate.confidence,
    registerGate.confidence,
    ieltsGate.confidence,
    spokenGate.confidence,
    pedagogyGate.confidence
  ];
  const overallConfidence = gateConfidences.reduce((a, b) => a + b, 0) / gateConfidences.length;

  // Collect all critical/warning/suggestion findings
  const allCriticalIssues = [
    ...structuralGate.criticalIssues,
    ...pragmaticGate.criticalIssues,
    ...chunkGate.criticalIssues,
    ...registerGate.criticalIssues,
    ...ieltsGate.criticalIssues,
    ...spokenGate.criticalIssues,
    ...pedagogyGate.criticalIssues
  ];

  const allWarnings = [
    ...structuralGate.warnings,
    ...pragmaticGate.warnings,
    ...chunkGate.warnings,
    ...registerGate.warnings,
    ...ieltsGate.warnings,
    ...spokenGate.warnings,
    ...pedagogyGate.warnings
  ];

  const allSuggestions = [
    ...structuralGate.suggestions,
    ...pragmaticGate.suggestions,
    ...chunkGate.suggestions,
    ...registerGate.suggestions,
    ...ieltsGate.suggestions,
    ...spokenGate.suggestions,
    ...pedagogyGate.suggestions
  ];

  const finalApproval = getFinalApproval({
    structuralDiscipline: structuralGate,
    pragmaticSensitivity: pragmaticGate,
    chunkAwareness: chunkGate,
    registerControl: registerGate,
    ieltsAuthenticity: ieltsGate,
    spokenNaturalness: spokenGate,
    pedagogy: pedagogyGate
  });

  const passed = finalApproval.status !== 'blocked';

  return {
    scenarioId: scenario.id,
    scenarioTitle: scenario.topic,
    timestamp,
    passed,
    overallConfidence,
    gates: {
      structuralDiscipline: structuralGate,
      pragmaticSensitivity: pragmaticGate,
      chunkAwareness: chunkGate,
      registerControl: registerGate,
      ieltsAuthenticity: ieltsGate,
      spokenNaturalness: spokenGate,
      pedagogy: pedagogyGate
    },
    humanReview: {
      status: finalApproval.humanReviewRequired ? 'not-started' : 'not-required',
      required: finalApproval.humanReviewRequired
    },
    finalApproval,
    criticalIssues: allCriticalIssues,
    warnings: allWarnings,
    suggestions: allSuggestions,
    summary: {
      totalFindings: allFindings.length,
      criticalCount: allCriticalIssues.length,
      warningCount: allWarnings.length,
      suggestionCount: allSuggestions.length
    }
  };
}

/**
 * Classify findings into critical/warning/suggestion based on confidence
 */
function classifyFindings(
  findings: ValidationFinding[],
  gateType: GateType
): GateResult {
  const criticalIssues: ValidationFinding[] = [];
  const warnings: ValidationFinding[] = [];
  const suggestions: ValidationFinding[] = [];

  for (const finding of findings) {
    // Chunk compliance is policy-critical, but individual findings can be slot vocabulary.
    // Treat high-confidence chunk breaks as blockers and route lower-confidence cases to review.
    if (gateType === 'chunk') {
      if (finding.confidence >= 0.85) {
        criticalIssues.push(finding);
      } else if (finding.confidence >= 0.7) {
        warnings.push(finding);
      } else {
        suggestions.push(finding);
      }
    }
    // Structural remains a hard gate for high-confidence structural findings.
    else if (gateType === 'structural' && finding.confidence >= 0.8) {
      criticalIssues.push(finding);
    }
    // IELTS authenticity blocks only high-confidence authenticity failures.
    else if (gateType === 'ielts' && finding.confidence >= 0.85) {
      criticalIssues.push(finding);
    }
    // Major pedagogy failures block; minor teaching quality issues are warnings.
    else if (gateType === 'pedagogy' && finding.confidence >= 0.85) {
      criticalIssues.push(finding);
    }
    // Spoken naturalness is subjective unless severe.
    else if (gateType === 'spoken' && finding.confidence >= 0.9) {
      criticalIssues.push(finding);
    }
    // For pragmatic and register gates, high confidence = critical, medium = warning, low = suggestion
    else if (finding.confidence >= 0.85) {
      criticalIssues.push(finding);
    } else if (finding.confidence >= 0.7) {
      warnings.push(finding);
    } else {
      suggestions.push(finding);
    }
  }

  const allIssues = [...criticalIssues, ...warnings, ...suggestions];
  const avgConfidence = allIssues.length > 0
    ? allIssues.reduce((sum, f) => sum + f.confidence, 0) / allIssues.length
    : 1.0;

  return {
    passed: criticalIssues.length === 0,
    confidence: Math.round(avgConfidence * 100) / 100,
    findingCount: allIssues.length,
    findings: allIssues,
    criticalIssues,
    warnings,
    suggestions
  };
}

function getFinalApproval(gates: QAReport['gates']): FinalApproval {
  const gateEntries = [
    ['Structural Discipline', gates.structuralDiscipline],
    ['Pragmatic Sensitivity', gates.pragmaticSensitivity],
    ['Chunk Awareness', gates.chunkAwareness],
    ['Register Control', gates.registerControl],
    ['IELTS Authenticity', gates.ieltsAuthenticity],
    ['Spoken Naturalness', gates.spokenNaturalness],
    ['Pedagogy', gates.pedagogy],
  ] as const;

  const blockingGates = gateEntries
    .filter(([, gate]) => gate.criticalIssues.length > 0)
    .map(([name]) => name);

  if (blockingGates.length > 0) {
    return {
      status: 'blocked',
      blockingGates,
      humanReviewRequired: false,
      reason: `Blocked by critical issues in: ${blockingGates.join(', ')}`
    };
  }

  const warningCount = gateEntries.reduce((sum, [, gate]) => sum + gate.warnings.length, 0);
  const suggestionCount = gateEntries.reduce((sum, [, gate]) => sum + gate.suggestions.length, 0);

  if (warningCount > 0 || suggestionCount > 0) {
    return {
      status: 'needs-human-review',
      blockingGates: [],
      humanReviewRequired: true,
      reason: `No blocking issues, but ${warningCount} warning(s) and ${suggestionCount} suggestion(s) need reviewer judgement.`
    };
  }

  return {
    status: 'approved',
    blockingGates: [],
    humanReviewRequired: false,
    reason: 'All automated QA gates passed with no warnings.'
  };
}

/**
 * Format QA report as readable text
 */
export function formatQAReport(report: QAReport): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('═'.repeat(60));
  lines.push(`  QA REPORT: ${report.scenarioTitle}`);
  lines.push('═'.repeat(60));
  lines.push('');

  // Overall status
  const statusSymbol = report.passed ? '✅' : '❌';
  const statusText = report.passed ? 'PASSED' : 'FAILED';
  lines.push(`${statusSymbol} Status: ${statusText} (Confidence: ${(report.overallConfidence * 100).toFixed(0)}%)`);
  lines.push(`Final Approval: ${report.finalApproval.status.toUpperCase()} - ${report.finalApproval.reason}`);
  lines.push(`Human Review: ${report.humanReview.required ? 'Required' : 'Not required'}`);
  lines.push('');

  // Gate results
  lines.push('GATE RESULTS:');
  lines.push('─'.repeat(60));

  const gates = [
    { name: 'Structural Discipline', gate: report.gates.structuralDiscipline },
    { name: 'Pragmatic Sensitivity', gate: report.gates.pragmaticSensitivity },
    { name: 'Chunk Awareness', gate: report.gates.chunkAwareness },
    { name: 'Register Control', gate: report.gates.registerControl },
    { name: 'IELTS Authenticity', gate: report.gates.ieltsAuthenticity },
    { name: 'Spoken Naturalness', gate: report.gates.spokenNaturalness },
    { name: 'Pedagogy', gate: report.gates.pedagogy }
  ];

  for (const { name, gate } of gates) {
    const symbol = gate.passed ? '✅' : '⚠️';
    const confidence = (gate.confidence * 100).toFixed(0);
    lines.push(`${symbol} ${name} (${confidence}%)`);

    if (gate.criticalIssues.length > 0) {
      lines.push(`   🔴 ${gate.criticalIssues.length} Critical Issue(s)`);
    }
    if (gate.warnings.length > 0) {
      lines.push(`   🟡 ${gate.warnings.length} Warning(s)`);
    }
    if (gate.suggestions.length > 0) {
      lines.push(`   💡 ${gate.suggestions.length} Suggestion(s)`);
    }
  }
  lines.push('');

  // Critical issues
  if (report.criticalIssues.length > 0) {
    lines.push('CRITICAL ISSUES (Block Approval):');
    lines.push('─'.repeat(60));
    for (const issue of report.criticalIssues.slice(0, 10)) {
      lines.push(`  📍 Line: ${issue.location}`);
      lines.push(`     Issue: ${issue.issue}`);
      lines.push(`     Current: "${issue.currentValue}"`);
      if (issue.suggestedValue) {
        lines.push(`     Suggested: "${issue.suggestedValue}"`);
      }
      if (issue.alternatives && issue.alternatives.length > 0) {
        lines.push(`     Alternatives: ${issue.alternatives.slice(0, 3).join(', ')}`);
      }
      lines.push('');
    }
    if (report.criticalIssues.length > 10) {
      lines.push(`  ... and ${report.criticalIssues.length - 10} more critical issues`);
      lines.push('');
    }
  }

  // Warnings
  if (report.warnings.length > 0) {
    lines.push('WARNINGS (Review Recommended):');
    lines.push('─'.repeat(60));
    for (const warning of report.warnings.slice(0, 5)) {
      lines.push(`  📍 Line: ${warning.location}`);
      lines.push(`     Issue: ${warning.issue}`);
      lines.push('');
    }
    if (report.warnings.length > 5) {
      lines.push(`  ... and ${report.warnings.length - 5} more warnings`);
      lines.push('');
    }
  }

  // Suggestions
  if (report.suggestions.length > 0) {
    lines.push('SUGGESTIONS (Optional):');
    lines.push('─'.repeat(60));
    for (const suggestion of report.suggestions.slice(0, 3)) {
      lines.push(`  💡 ${suggestion.issue}`);
    }
    if (report.suggestions.length > 3) {
      lines.push(`  ... and ${report.suggestions.length - 3} more suggestions`);
    }
    lines.push('');
  }

  // Summary
  lines.push('SUMMARY:');
  lines.push('─'.repeat(60));
  lines.push(`  Total Findings: ${report.summary.totalFindings}`);
  lines.push(`  Critical: ${report.summary.criticalCount}`);
  lines.push(`  Warnings: ${report.summary.warningCount}`);
  lines.push(`  Suggestions: ${report.summary.suggestionCount}`);
  lines.push('');

  // Final verdict
  if (report.passed) {
    lines.push('═'.repeat(60));
    lines.push(
      report.finalApproval.status === 'approved'
        ? '  ✅ APPROVED BY AUTOMATED QA'
        : '  ⚠️  NEEDS HUMAN REVIEW BEFORE APPROVAL'
    );
    lines.push('═'.repeat(60));
  } else {
    lines.push('═'.repeat(60));
    lines.push('  ❌ BLOCKED - CRITICAL ISSUES MUST BE FIXED');
    lines.push('═'.repeat(60));
  }
  lines.push('');

  return lines.join('\n');
}

export function formatQAReportMarkdown(report: QAReport): string {
  const lines: string[] = [
    `# Content QA Report: ${report.scenarioTitle}`,
    '',
    `- Scenario ID: ${report.scenarioId}`,
    `- Generated: ${report.timestamp}`,
    `- Final approval: ${report.finalApproval.status}`,
    `- Human review: ${report.humanReview.required ? 'required' : 'not required'}`,
    `- Reason: ${report.finalApproval.reason}`,
    '',
    '## Gate Results',
    '',
    '| Gate | Status | Critical | Warnings | Suggestions |',
    '| --- | --- | ---: | ---: | ---: |',
  ];

  const gates = [
    ['Structural Discipline', report.gates.structuralDiscipline],
    ['Pragmatic Sensitivity', report.gates.pragmaticSensitivity],
    ['Chunk Awareness', report.gates.chunkAwareness],
    ['Register Control', report.gates.registerControl],
    ['IELTS Authenticity', report.gates.ieltsAuthenticity],
    ['Spoken Naturalness', report.gates.spokenNaturalness],
    ['Pedagogy', report.gates.pedagogy],
  ] as const;

  for (const [name, gate] of gates) {
    lines.push(
      `| ${name} | ${gate.passed ? 'PASS' : 'FAIL'} | ${gate.criticalIssues.length} | ${gate.warnings.length} | ${gate.suggestions.length} |`
    );
  }

  lines.push('', '## Critical Issues', '');
  appendFindings(lines, report.criticalIssues, 'No critical issues.');

  lines.push('', '## Warnings', '');
  appendFindings(lines, report.warnings, 'No warnings.');

  lines.push('', '## Suggestions', '');
  appendFindings(lines, report.suggestions, 'No suggestions.');

  return `${lines.join('\n')}\n`;
}

function appendFindings(lines: string[], findings: ValidationFinding[], emptyText: string): void {
  if (findings.length === 0) {
    lines.push(emptyText);
    return;
  }

  for (const finding of findings) {
    lines.push(
      `- ${finding.validatorName} (${finding.location}): ${finding.issue} [confidence ${(finding.confidence * 100).toFixed(0)}%]`
    );
  }
}

/**
 * Generate summary report for multiple scenarios
 */
export function generateQASummary(reports: QAReport[]): string {
  const lines: string[] = [];

  const passed = reports.filter(r => r.passed).length;
  const failed = reports.filter(r => !r.passed).length;
  const needsHumanReview = reports.filter(r => r.finalApproval.status === 'needs-human-review').length;
  const approved = reports.filter(r => r.finalApproval.status === 'approved').length;
  const blocked = reports.filter(r => r.finalApproval.status === 'blocked').length;
  const avgConfidence = reports.reduce((sum, r) => sum + r.overallConfidence, 0) / reports.length;

  lines.push('');
  lines.push('═'.repeat(60));
  lines.push(`  QA SUMMARY: ${reports.length} Scenario(s)`);
  lines.push('═'.repeat(60));
  lines.push('');
  lines.push(`  ✅ Passed: ${passed}/${reports.length}`);
  lines.push(`  ❌ Failed: ${failed}/${reports.length}`);
  lines.push(`  Final Approval: ${approved} approved, ${needsHumanReview} needs human review, ${blocked} blocked`);
  lines.push(`  📊 Average Confidence: ${(avgConfidence * 100).toFixed(0)}%`);
  lines.push('');

  if (failed > 0) {
    lines.push('Failed Scenarios:');
    lines.push('─'.repeat(60));
    for (const report of reports.filter(r => !r.passed)) {
      lines.push(`  ❌ ${report.scenarioTitle}`);
      lines.push(`     Critical: ${report.summary.criticalCount}, Warnings: ${report.summary.warningCount}`);
    }
    lines.push('');
  }

  lines.push('═'.repeat(60));

  return lines.join('\n');
}
