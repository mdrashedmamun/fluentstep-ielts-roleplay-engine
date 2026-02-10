/**
 * Shared types for the Linguistic Audit System
 */

export enum FixConfidence {
  HIGH = 0.95,      // Auto-fix without approval
  MEDIUM = 0.70,    // Present suggestion, require approval
  LOW = 0.40        // Report issue, provide multiple alternatives
}

export enum Severity {
  PASS = 'PASS',
  WARNING = 'WARNING',
  FAIL = 'FAIL'
}

/**
 * A single validation finding that requires user approval or auto-fix
 */
export interface ValidationFinding {
  validatorName: string;
  scenarioId: string;
  location: string;                // e.g., "answerVariations[3]!.answer"
  issue: string;                   // Human-readable issue description
  currentValue: string;
  suggestedValue?: string;          // For HIGH/MEDIUM confidence fixes
  alternatives?: string[];          // For LOW confidence (multiple options)
  context: string;                 // Dialogue context for understanding
  confidence: number;              // 0-1 score
  reasoning: string;               // Why this is a fix
}

/**
 * Result from a single validator
 */
export interface ValidatorResult {
  validatorName: string;
  passed: number;                  // # scenarios with no issues
  findings: ValidationFinding[];
  severity: Severity;
}

/**
 * Auto-fix that can be applied directly
 */
export interface AutoFix {
  scenarioId: string;
  location: string;
  oldValue: string;
  newValue: string;
  reason: string;
  validatorName: string;
}

/**
 * Report from a full audit run
 */
export interface AuditReport {
  timestamp: string;
  totalScenarios: number;
  scenariosWithIssues: number;
  autoFixesApplied: number;
  findingsRequiringApproval: number;
  bypassed: number;
  validatorResults: ValidatorResult[];
  autoFixesLog: AutoFix[];
  summary: {
    passed: number;
    warning: number;
    failed: number;
  };
}

/**
 * Result of user approval for a finding
 */
export type ApprovalDecision = 'approve' | 'skip' | 'edit' | 'view';

/**
 * Configuration for an audit run
 */
export interface AuditConfig {
  dryRun: boolean;
  reportOnly: boolean;
  autoApproveHigh: boolean;
  scenarioFilter?: string;         // Filter to single scenario ID
  categoryFilter?: string;         // Filter to category
  verbose: boolean;
}

/**
 * Task sent to a worker process for parallel validation
 */
export interface WorkerTask {
  workerId: number;
  scenarios: string[];             // Scenario IDs to process
  outputPath: string;              // Where to write findings JSON
}

/**
 * Output from a worker process
 */
export interface WorkerOutput {
  workerId: number;
  scenariosProcessed: string[];
  findings: ValidationFinding[];
  executionTime: number;           // Milliseconds
  errors: Array<{ scenarioId: string; error: string }>;
  timestamp: string;
}

/**
 * Finding with metadata about sources and conflicts
 */
export interface ConsolidatedFinding extends ValidationFinding {
  sources: number[];               // Which workers found this issue
  conflict?: {
    alternatives: Array<{
      workerId: number;
      suggestedValue: string;
      confidence: number;
    }>;
    resolution: 'auto' | 'manual';
    winner: number;                // Worker ID whose suggestion was chosen
  };
}
