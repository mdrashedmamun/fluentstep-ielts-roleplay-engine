/**
 * Linguistic Audit System - Main Orchestrator
 * Coordinates all validators and generates findings
 */

import { RoleplayScript } from '../staticData';
import { ValidationFinding, ValidatorResult, AuditReport, Severity, AuditConfig } from './types';
import { applyAutoFixes, AutoFixResult } from './fixers/autoFixer';
import { generateSuggestions, UserSuggestion, sortSuggestions } from './fixers/suggestionEngine';

// Validators will be imported here once created
export interface ValidatorFn {
  name: string;
  validate: (scenario: RoleplayScript) => ValidationFinding[];
}

// Registry of all validators
const validators: ValidatorFn[] = [];

/**
 * Register a validator with the audit system
 */
export function registerValidator(validator: ValidatorFn): void {
  validators.push(validator);
}

/**
 * Run a comprehensive linguistic audit on all scenarios
 */
export async function runAudit(
  scenarios: RoleplayScript[],
  config: AuditConfig = {
    dryRun: false,
    reportOnly: false,
    autoApproveHigh: true,
    verbose: false
  }
): Promise<AuditReport> {
  const timestamp = new Date().toISOString();
  const allFindings: ValidationFinding[] = [];
  const validatorResults: ValidatorResult[] = [];

  console.log('🔍 Starting Linguistic Audit...\n');

  // Run each validator on all scenarios
  for (const validator of validators) {
    console.log(`Running: ${validator.name}...`);
    const validatorFindings: ValidationFinding[] = [];

    for (const scenario of scenarios) {
      // Skip if scenario filter is applied
      if (config.scenarioFilter && scenario.id !== config.scenarioFilter) {
        continue;
      }

      const findings = validator.validate(scenario);
      validatorFindings.push(...findings);
    }

    allFindings.push(...validatorFindings);

    // Determine severity
    let severity: Severity = Severity.PASS;
    if (validatorFindings.some(f => f.validatorName === validator.name)) {
      severity = validatorFindings.some(f => f.issue.includes('FAIL'))
        ? Severity.FAIL
        : Severity.WARNING;
    }

    validatorResults.push({
      validatorName: validator.name,
      passed: scenarios.length - validatorFindings.length,
      findings: validatorFindings,
      severity
    });

    console.log(
      `  ✓ ${validator.name}: ${validatorFindings.length} finding(s)`
    );
  }

  console.log('');

  // Apply auto-fixes if not in dry-run/report-only mode
  let autoFixResult: AutoFixResult = {
    totalChanges: 0,
    fixesApplied: [],
    log: []
  };

  if (!config.dryRun && !config.reportOnly) {
    autoFixResult = applyAutoFixes(scenarios, allFindings);

    console.log('Auto-fixes Applied');
    console.log('==================');
    autoFixResult.log.slice(0, 10).forEach(line => console.log(line));
    if (autoFixResult.log.length > 10) {
      console.log(`... and ${autoFixResult.log.length - 10} more`);
    }
    console.log('');
  }

  // Generate suggestions for MEDIUM/LOW confidence findings
  const suggestions = generateSuggestions(allFindings);
  const sortedSuggestions = sortSuggestions(suggestions);

  // Calculate summary
  const summary = {
    passed: scenarios.filter(s => !allFindings.some(f => f.scenarioId === s.id)).length,
    warning: validatorResults.filter(r => r.severity === Severity.WARNING).length,
    failed: validatorResults.filter(r => r.severity === Severity.FAIL).length
  };

  const report: AuditReport = {
    timestamp,
    totalScenarios: scenarios.length,
    scenariosWithIssues: new Set(allFindings.map(f => f.scenarioId)).size,
    autoFixesApplied: autoFixResult.totalChanges,
    findingsRequiringApproval: sortedSuggestions.length,
    bypassed: 0,
    validatorResults,
    autoFixesLog: autoFixResult.fixesApplied,
    summary
  };

  return report;
}

/**
 * Get all registered validators
 */
export function getValidators(): ValidatorFn[] {
  return [...validators];
}

/**
 * Clear all validators (useful for testing)
 */
export function clearValidators(): void {
  validators.length = 0;
}
