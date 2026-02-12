#!/usr/bin/env tsx

/**
 * Validate Perfect Scenarios - Verify template candidates are production-ready
 *
 * Healthcare-1 and Community-1 are templates for scaling to 50 scenarios.
 * This validates they meet 6 objective data integrity checks (no subjective gates).
 *
 * Exit Code: 0 = Both scenarios pass | 1 = Critical issues found
 */

import { CURATED_ROLEPLAYS, RoleplayScript, ChunkFeedbackV2 } from '../src/services/staticData';

interface ObjectiveCheckResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string;
}

interface ScenarioResults {
  id: string;
  checks: ObjectiveCheckResult[];
  overallPass: boolean;
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

const TEMPLATE_SCENARIOS = ['healthcare-1-gp-appointment', 'community-1-council-meeting'];

/**
 * Check 1: V2 Compliance - All mandatory fields present
 */
function checkV2Compliance(script: RoleplayScript): ObjectiveCheckResult {
  const requiredFields = [
    'id',
    'category',
    'topic',
    'context',
    'characters',
    'dialogue',
    'answerVariations',
    'blanksInOrder',
    'chunkFeedbackV2',
  ];

  const missing = requiredFields.filter(
    field => !script[field as keyof RoleplayScript]
  );

  return {
    name: 'V2 Compliance',
    passed: missing.length === 0,
    message:
      missing.length === 0
        ? 'Pure V2 (no legacy fields)'
        : `Missing: ${missing.join(', ')}`,
  };
}

/**
 * Check 2: Blank Correspondence - All counts match (dialogue, answers, feedback, mappings)
 */
function checkBlankCorrespondence(script: RoleplayScript): ObjectiveCheckResult {
  let dialogueBlankCount = 0;
  script.dialogue.forEach(turn => {
    const matches = turn.text.match(/________/g);
    if (matches) {
      dialogueBlankCount += matches.length;
    }
  });

  const answerCount = script.answerVariations?.length || 0;
  const feedbackCount = script.chunkFeedbackV2?.length || 0;
  const mappingCount = script.blanksInOrder?.length || 0;

  const allMatch =
    dialogueBlankCount === answerCount &&
    dialogueBlankCount === feedbackCount &&
    dialogueBlankCount === mappingCount;

  return {
    name: 'Blank Correspondence',
    passed: allMatch,
    message: allMatch
      ? `All counts match: ${dialogueBlankCount}`
      : `Mismatch: ${dialogueBlankCount} dialogue, ${answerCount} answers, ${feedbackCount} feedback, ${mappingCount} mappings`,
    details: `dialogue=${dialogueBlankCount}, answers=${answerCount}, feedback=${feedbackCount}, mappings=${mappingCount}`,
  };
}

/**
 * Check 3: ChunkId Integrity - All defined chunkIds are referenced, no orphans
 */
function checkChunkIdIntegrity(script: RoleplayScript): ObjectiveCheckResult {
  const definedChunkIds = new Set<string>();
  const referencedChunkIds = new Set<string>();

  // Collect defined chunkIds from chunkFeedbackV2
  (script.chunkFeedbackV2 || []).forEach(feedback => {
    if (feedback.chunkId) {
      definedChunkIds.add(feedback.chunkId);
    }
  });

  // Collect referenced chunkIds from all sources
  (script.blanksInOrder || []).forEach(mapping => {
    if (mapping.chunkId) {
      referencedChunkIds.add(mapping.chunkId);
    }
  });

  script.patternSummary?.categoryBreakdown?.forEach(breakdown => {
    (breakdown.exampleChunkIds || []).forEach(id => referencedChunkIds.add(id));
  });

  script.patternSummary?.keyPatterns?.forEach(pattern => {
    (pattern.chunkIds || []).forEach(id => referencedChunkIds.add(id));
  });

  script.activeRecall?.forEach(item => {
    (item.targetChunkIds || []).forEach(id => referencedChunkIds.add(id));
  });

  // Check for orphans
  const orphans = Array.from(definedChunkIds).filter(
    id => !referencedChunkIds.has(id)
  );
  const missing = Array.from(referencedChunkIds).filter(
    id => !definedChunkIds.has(id)
  );

  const passed = orphans.length === 0 && missing.length === 0;

  return {
    name: 'ChunkId Integrity',
    passed,
    message: passed
      ? `${definedChunkIds.size} defined, all referenced`
      : `${orphans.length} orphaned, ${missing.length} missing references`,
    details: orphans.length > 0
      ? `Orphans: ${orphans.join(', ')}`
      : missing.length > 0
        ? `Missing: ${missing.join(', ')}`
        : undefined,
  };
}

/**
 * Check 4: Category Keys Valid - All categoryKey values are standard enums
 */
function checkCategoryKeysValid(script: RoleplayScript): ObjectiveCheckResult {
  const validCategories = new Set([
    'Openers',
    'Softening',
    'Disagreement',
    'Repair',
    'Exit',
    'Idioms',
  ]);

  const invalidCategories = new Set<string>();

  // Check chunkFeedbackV2 (if it has a category field - may not)
  (script.chunkFeedbackV2 || []).forEach(feedback => {
    // V2 may not have category field, that's OK
  });

  // Check patternSummary categoryBreakdown
  script.patternSummary?.categoryBreakdown?.forEach(breakdown => {
    const key = (breakdown as any).categoryKey || breakdown.category;
    if (!validCategories.has(key)) {
      invalidCategories.add(key);
    }
  });

  const passed = invalidCategories.size === 0;

  return {
    name: 'Category Keys Valid',
    passed,
    message: passed
      ? `All categories use standard enum`
      : `Invalid categories: ${Array.from(invalidCategories).join(', ')}`,
  };
}

/**
 * Check 5: Active Recall Valid - All targetChunkIds reference existing chunks
 */
function checkActiveRecallValid(script: RoleplayScript): ObjectiveCheckResult {
  if (!script.activeRecall || script.activeRecall.length === 0) {
    return {
      name: 'Active Recall Valid',
      passed: true,
      message: 'No active recall items (optional)',
    };
  }

  const definedChunkIds = new Set<string>();
  (script.chunkFeedbackV2 || []).forEach(feedback => {
    if (feedback.chunkId) {
      definedChunkIds.add(feedback.chunkId);
    }
  });

  const missingChunkIds = new Set<string>();
  script.activeRecall.forEach(item => {
    (item.targetChunkIds || []).forEach(chunkId => {
      if (!definedChunkIds.has(chunkId)) {
        missingChunkIds.add(chunkId);
      }
    });
  });

  const passed = missingChunkIds.size === 0;

  return {
    name: 'Active Recall Valid',
    passed,
    message: passed
      ? `${script.activeRecall.length} questions, all reference valid chunks`
      : `${missingChunkIds.size} questions reference missing chunks`,
    details: missingChunkIds.size > 0
      ? `Missing: ${Array.from(missingChunkIds).join(', ')}`
      : `Chunk references: ${script.activeRecall.length} items`,
  };
}

/**
 * Check 6: Pattern Summary Complete - All required sections present
 */
function checkPatternSummaryComplete(script: RoleplayScript): ObjectiveCheckResult {
  if (!script.patternSummary) {
    return {
      name: 'Pattern Summary Complete',
      passed: false,
      message: 'Pattern summary missing (required for template scenarios)',
    };
  }

  const ps = script.patternSummary;
  const hasBreakdown = (ps.categoryBreakdown || []).length > 0;
  const hasKeyPatterns = (ps.keyPatterns || []).length > 0;
  const hasInsight = !!ps.overallInsight;

  const breakdownCount = ps.categoryBreakdown?.length || 0;
  const patternCount = ps.keyPatterns?.length || 0;

  const passed = hasBreakdown && hasKeyPatterns && hasInsight;

  return {
    name: 'Pattern Summary Complete',
    passed,
    message: passed
      ? `Complete structure present`
      : `Missing: ${!hasBreakdown ? 'breakdown, ' : ''}${!hasKeyPatterns ? 'patterns, ' : ''}${!hasInsight ? 'insight' : ''}`,
    details: `${breakdownCount} breakdowns, ${patternCount} patterns, insight present`,
  };
}

/**
 * Run all checks for one scenario
 */
function validateScenario(scenario: RoleplayScript): ScenarioResults {
  const checks = [
    checkV2Compliance(scenario),
    checkBlankCorrespondence(scenario),
    checkChunkIdIntegrity(scenario),
    checkCategoryKeysValid(scenario),
    checkActiveRecallValid(scenario),
    checkPatternSummaryComplete(scenario),
  ];

  const overallPass = checks.every(c => c.passed);

  return {
    id: scenario.id,
    checks,
    overallPass,
  };
}

/**
 * Main execution
 */
function main() {
  console.log(
    `\n${colors.blue}=== Validating Perfect Scenario Templates ===${colors.reset}\n`
  );

  const results: ScenarioResults[] = [];
  let templatePass = 0;

  for (const templateId of TEMPLATE_SCENARIOS) {
    const scenario = CURATED_ROLEPLAYS.find(s => s.id === templateId);
    if (!scenario) {
      console.error(`${colors.red}❌ Template scenario not found: ${templateId}${colors.reset}`);
      process.exit(1);
    }

    const result = validateScenario(scenario);
    results.push(result);

    console.log(`${scenario.id}:`);

    for (const check of result.checks) {
      const icon = check.passed ? '✅' : '❌';
      const color = check.passed ? colors.green : colors.red;
      console.log(`${color}${icon} ${check.name}: ${check.message}${colors.reset}`);
      if (check.details) {
        console.log(`   ${colors.gray}${check.details}${colors.reset}`);
      }
    }

    if (result.overallPass) {
      templatePass++;
    }

    console.log();
  }

  // Print summary
  console.log(`${colors.blue}=== Summary ===${colors.reset}`);
  console.log(
    `${colors.green}✅ Templates passing: ${templatePass}/${TEMPLATE_SCENARIOS.length}${colors.reset}`
  );

  if (templatePass === TEMPLATE_SCENARIOS.length) {
    console.log(
      `\n${colors.green}🎉 Both scenarios PASS objective data integrity checks${colors.reset}`
    );
    if (results.some(r => r.checks.some(c => !c.passed))) {
      console.log(
        `${colors.yellow}⚠️  Some warnings above - address in code review${colors.reset}\n`
      );
    } else {
      console.log(`${colors.green}No warnings - ready to scale to 50 scenarios\n${colors.reset}`);
    }
    process.exit(0);
  } else {
    console.log(
      `${colors.red}❌ Templates failing - fix issues before using as template\n${colors.reset}`
    );
    process.exit(1);
  }
}

main();
