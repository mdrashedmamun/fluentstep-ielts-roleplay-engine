/**
 * Deep Dive Validator
 * Ensures insights teach WHY phrases are native (not just definitions)
 */

import { RoleplayScript } from '../../staticData';
import { ValidationFinding } from '../types';
import { findSpellingIssues } from '../rules/britishSpellingRules';
import { scoreConfidence } from '../fixers/confidenceScorer';

export function validateDeepDive(scenario: RoleplayScript): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  if (!scenario.deepDive || scenario.deepDive.length === 0) {
    return findings;
  }

  for (let i = 0; i < scenario.deepDive.length; i++) {
    const dd = scenario.deepDive[i];
    const answerVariation = scenario.answerVariations.find(av => av.index === dd.index);

    if (!answerVariation) {
      findings.push({
        validatorName: 'Deep Dive Quality',
        scenarioId: scenario.id,
        location: `deepDive[${i}]`,
        issue: `Deep dive index ${dd.index} doesn't match any answer variation`,
        currentValue: dd.phrase,
        context: `Valid indices: ${scenario.answerVariations.map(av => av.index).join(', ')}`,
        confidence: 1.0,
        reasoning: `Deep dive must reference a valid answer variation index`,
        suggestedValue: undefined
      });
      continue;
    }

    // Check 1: Insight quality (should teach WHY, not just WHAT)
    const isDefinition = /^(means|is|defines|refers to)/i.test(dd.insight);
    const exploresUsage = /usage|pattern|native|why|how|context|situation|tone|register/i.test(dd.insight);

    if (isDefinition && !exploresUsage) {
      const confidence = scoreConfidence({
        issueType: 'alternative-quality',
        affectedText: dd.insight,
        suggestedFix: ''
      });

      findings.push({
        validatorName: 'Deep Dive Quality',
        scenarioId: scenario.id,
        location: `deepDive[${i}].insight`,
        issue: `Insight reads like definition instead of usage pattern`,
        currentValue: dd.insight,
        context: `Phrase: "${dd.phrase}"`,
        confidence: confidence.score * 0.7,
        reasoning: `Insight should explain WHY this phrase is native/useful (usage pattern), not just its definition. Add context like: "used in X situation", "native speakers say it because..."`,
        suggestedValue: undefined
      });
    }

    // Check 2: British spelling in insights
    const spellingIssues = findSpellingIssues(dd.insight);
    for (const issue of spellingIssues) {
      const confidence = scoreConfidence({
        issueType: 'british-spelling',
        affectedText: issue.word,
        suggestedFix: issue.fixed
      });

      findings.push({
        validatorName: 'Deep Dive Quality',
        scenarioId: scenario.id,
        location: `deepDive[${i}].insight`,
        issue: `Insight uses non-British spelling`,
        currentValue: dd.insight,
        suggestedValue: dd.insight.replace(issue.word, issue.fixed),
        context: `Rule: ${issue.rule.name}`,
        confidence: confidence.score,
        reasoning: `Insight should also follow British English: "${issue.word}" → "${issue.fixed}"`,
      });
    }

    // Check 3: Phrase consistency (phrase should match actual answer in dialogue)
    const dialogueLine = scenario.dialogue[dd.index]?.text || '';
    const phraseInDialogue = dialogueLine.toLowerCase().includes(dd.phrase.toLowerCase());

    if (!phraseInDialogue) {
      const confidence = scoreConfidence({
        issueType: 'alternative-quality',
        affectedText: dd.phrase,
        suggestedFix: ''
      });

      findings.push({
        validatorName: 'Deep Dive Quality',
        scenarioId: scenario.id,
        location: `deepDive[${i}].phrase`,
        issue: `Phrase doesn't appear in the dialogue line`,
        currentValue: dd.phrase,
        context: `Dialogue[${dd.index}]: "${dialogueLine}"`,
        confidence: confidence.score * 0.8,
        reasoning: `Deep dive phrase should match the actual answer being highlighted. Current phrase: "${dd.phrase}"`,
        suggestedValue: undefined
      });
    }

    // Check 4: Minimal length for insight
    if (dd.insight.length < 20) {
      const confidence = scoreConfidence({
        issueType: 'alternative-quality',
        affectedText: dd.insight,
        suggestedFix: ''
      });

      findings.push({
        validatorName: 'Deep Dive Quality',
        scenarioId: scenario.id,
        location: `deepDive[${i}].insight`,
        issue: `Insight is too brief to provide meaningful learning`,
        currentValue: dd.insight,
        context: `Currently: "${dd.insight}" (${dd.insight.length} chars)`,
        confidence: confidence.score * 0.6,
        reasoning: `Insights should be substantive (20+ chars) to teach usage patterns effectively`,
        suggestedValue: undefined
      });
    }
  }

  return findings;
}

export function getDeepDiveReport(scenario: RoleplayScript) {
  const findings = validateDeepDive(scenario);
  return {
    scenarioId: scenario.id,
    totalInsights: scenario.deepDive?.length || 0,
    issues: findings.length,
    status: findings.length === 0 ? '✓ PASS' : `⚠ ${findings.length} ISSUE(S)`
  };
}
