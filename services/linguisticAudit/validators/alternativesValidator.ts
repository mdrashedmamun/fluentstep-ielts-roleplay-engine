/**
 * Alternatives Validator
 * Ensures answer alternatives are true synonyms, maintain tone, and use British English
 */

import { RoleplayScript } from '../../staticData';
import { ValidationFinding } from '../types';
import { findSpellingIssues } from '../rules/britishSpellingRules';
import { findAmericanisms } from '../rules/britishVocabulary';
import { analyzeRegister } from '../rules/tonalityMappings';
import { scoreConfidence } from '../fixers/confidenceScorer';

export function validateAlternatives(scenario: RoleplayScript): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  for (const av of scenario.answerVariations) {
    if (!av.alternatives || av.alternatives.length === 0) {
      continue;
    }

    const primaryTone = analyzeRegister(av.answer);
    const primaryLength = av.answer.length;

    for (let i = 0; i < av.alternatives.length; i++) {
      const alt = av.alternatives[i];

      // Check 1: Tone consistency
      const altTone = analyzeRegister(alt);
      if (altTone !== primaryTone) {
        const confidence = scoreConfidence({
          issueType: 'alternative-quality',
          affectedText: alt,
          suggestedFix: '',
          context: `Primary: "${av.answer}" (${primaryTone}) vs Alternative: "${alt}" (${altTone})`
        });

        findings.push({
          validatorName: 'Alternatives Quality',
          scenarioId: scenario.id,
          location: `answerVariations[${av.index}].alternatives[${i}]`,
          issue: `Alternative has different tone than primary answer`,
          currentValue: alt,
          context: `Primary: "${av.answer}"`,
          confidence: confidence.score * 0.7,
          reasoning: `Alternative "${alt}" (${altTone}) doesn't match primary answer's tone (${primaryTone})`,
          suggestedValue: undefined
        });
      }

      // Check 2: British English compliance for alternatives
      const spellingIssues = findSpellingIssues(alt);
      for (const issue of spellingIssues) {
        const confidence = scoreConfidence({
          issueType: 'british-spelling',
          affectedText: issue.word,
          suggestedFix: issue.fixed
        });

        findings.push({
          validatorName: 'Alternatives Quality',
          scenarioId: scenario.id,
          location: `answerVariations[${av.index}].alternatives[${i}]`,
          issue: `Alternative uses non-British spelling`,
          currentValue: alt,
          suggestedValue: alt.replace(issue.word, issue.fixed),
          context: `Rule: ${issue.rule.name}`,
          confidence: confidence.score,
          reasoning: `Alternative should also follow British spelling: "${issue.word}" → "${issue.fixed}"`
        });
      }

      // Check 3: Vocabulary consistency
      const americanisms = findAmericanisms(alt);
      for (const americanism of americanisms) {
        const confidence = scoreConfidence({
          issueType: 'uk-vocabulary',
          affectedText: americanism.word,
          suggestedFix: americanism.mapping.british
        });

        findings.push({
          validatorName: 'Alternatives Quality',
          scenarioId: scenario.id,
          location: `answerVariations[${av.index}].alternatives[${i}]`,
          issue: `Alternative uses American vocabulary`,
          currentValue: alt,
          suggestedValue: alt.replace(americanism.word, americanism.mapping.british),
          context: `Should use British: "${americanism.mapping.british}"`,
          confidence: confidence.score,
          reasoning: `"${americanism.word}" is American. Use British: "${americanism.mapping.british}"`
        });
      }

      // Check 4: Length similarity (very different length might indicate different meaning)
      const lengthRatio = alt.length / primaryLength;
      if (lengthRatio < 0.5 || lengthRatio > 2) {
        const confidence = scoreConfidence({
          issueType: 'alternative-quality',
          affectedText: alt,
          suggestedFix: ''
        });

        findings.push({
          validatorName: 'Alternatives Quality',
          scenarioId: scenario.id,
          location: `answerVariations[${av.index}].alternatives[${i}]`,
          issue: `Alternative is very different length from primary (may indicate different meaning)`,
          currentValue: alt,
          context: `Primary: "${av.answer}" (${primaryLength} chars) vs Alternative: "${alt}" (${alt.length} chars)`,
          confidence: confidence.score * 0.5,
          reasoning: `Alternatives should be close in length and meaning. This one is ${Math.round(lengthRatio * 100)}% of primary length`,
          suggestedValue: undefined
        });
      }
    }
  }

  return findings;
}

export function getAlternativesReport(scenario: RoleplayScript) {
  const findings = validateAlternatives(scenario);
  const totalAlternatives = scenario.answerVariations.reduce((sum, av) => sum + (av.alternatives?.length || 0), 0);

  return {
    scenarioId: scenario.id,
    totalAlternatives,
    issues: findings.length,
    status: findings.length === 0 ? '✓ PASS' : `⚠ ${findings.length} ISSUE(S)`
  };
}
