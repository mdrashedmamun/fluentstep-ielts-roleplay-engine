/**
 * UK English Validator
 * Enforces British spelling (4 rules) + UK vocabulary
 */

import { RoleplayScript } from '../../staticData';
import { ValidationFinding } from '../types';
import {
  findSpellingIssues,
  applySpellingFix,
  BRITISH_SPELLING_RULES
} from '../rules/britishSpellingRules';
import {
  findAmericanisms,
  getBritishEquivalent
} from '../rules/britishVocabulary';
import { scoreConfidence } from '../fixers/confidenceScorer';

export function validateUKEnglish(scenario: RoleplayScript): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  // Check all answer variations
  for (const av of scenario.answerVariations) {
    // Check spelling
    const spellingIssues = findSpellingIssues(av.answer);
    for (const issue of spellingIssues) {
      const confidence = scoreConfidence({
        issueType: 'british-spelling',
        affectedText: issue.word,
        suggestedFix: issue.fixed,
        ruleCertainty: issue.rule.confidence
      });

      findings.push({
        validatorName: 'UK English Spelling',
        scenarioId: scenario.id,
        location: `answerVariations[${av.index}]!.answer`,
        issue: `British spelling rule: ${issue.rule.name}`,
        currentValue: av.answer,
        suggestedValue: av.answer.replace(issue.word, issue.fixed),
        context: `Rule examples: ${issue.rule.examples.join(', ')}`,
        confidence: confidence.score,
        reasoning: `"${issue.word}" should be "${issue.fixed}" in British English`
      });
    }

    // Check for Americanisms
    const americanisms = findAmericanisms(av.answer);
    for (const americanism of americanisms) {
      const confidence = scoreConfidence({
        issueType: 'uk-vocabulary',
        affectedText: americanism.word,
        suggestedFix: americanism.mapping.british,
        ruleCertainty: americanism.mapping.confidence
      });

      findings.push({
        validatorName: 'UK English Vocabulary',
        scenarioId: scenario.id,
        location: `answerVariations[${av.index}]!.answer`,
        issue: `American English word should be British: "${americanism.word}" → "${americanism.mapping.british}"`,
        currentValue: av.answer,
        suggestedValue: av.answer.replace(americanism.word, americanism.mapping.british),
        context: `Category: ${americanism.mapping.category}`,
        confidence: confidence.score,
        reasoning: `"${americanism.word}" is American. British equivalent: "${americanism.mapping.british}"`
      });
    }

    // Also check alternatives
    if (av.alternatives) {
      for (let i = 0; i < av.alternatives.length; i++) {
        const altSpellingIssues = findSpellingIssues(av.alternatives[i]);
        for (const issue of altSpellingIssues) {
          const confidence = scoreConfidence({
            issueType: 'british-spelling',
            affectedText: issue.word,
            suggestedFix: issue.fixed,
            ruleCertainty: issue.rule.confidence
          });

          findings.push({
            validatorName: 'UK English Spelling',
            scenarioId: scenario.id,
            location: `answerVariations[${av.index}]!.alternatives[${i}]`,
            issue: `British spelling rule: ${issue.rule.name}`,
            currentValue: av.alternatives[i],
            suggestedValue: av.alternatives[i]!.replace(issue.word, issue.fixed),
            context: `Rule examples: ${issue.rule.examples.join(', ')}`,
            confidence: confidence.score,
            reasoning: `Alternative "${issue.word}" should be "${issue.fixed}"`
          });
        }

        const altAmericanisms = findAmericanisms(av.alternatives[i]);
        for (const americanism of altAmericanisms) {
          const confidence = scoreConfidence({
            issueType: 'uk-vocabulary',
            affectedText: americanism.word,
            suggestedFix: americanism.mapping.british,
            ruleCertainty: americanism.mapping.confidence
          });

          findings.push({
            validatorName: 'UK English Vocabulary',
            scenarioId: scenario.id,
            location: `answerVariations[${av.index}]!.alternatives[${i}]`,
            issue: `American English in alternative`,
            currentValue: av.alternatives[i],
            suggestedValue: av.alternatives[i]!.replace(americanism.word, americanism.mapping.british),
            context: `Category: ${americanism.mapping.category}`,
            confidence: confidence.score,
            reasoning: `Alternative uses American word "${americanism.word}". Use British: "${americanism.mapping.british}"`
          });
        }
      }
    }
  }

  // Also check deepDive insights for British English
  for (const dd of scenario.deepDive || []) {
    const insightSpellingIssues = findSpellingIssues(dd.insight);
    for (const issue of insightSpellingIssues) {
      const confidence = scoreConfidence({
        issueType: 'british-spelling',
        affectedText: issue.word,
        suggestedFix: issue.fixed,
        ruleCertainty: issue.rule.confidence
      });

      findings.push({
        validatorName: 'UK English Spelling',
        scenarioId: scenario.id,
        location: `deepDive[${scenario.deepDive.indexOf(dd)}]!.insight`,
        issue: `British spelling rule: ${issue.rule.name}`,
        currentValue: dd.insight,
        suggestedValue: dd.insight.replace(issue.word, issue.fixed),
        context: `Phrase: "${dd.phrase}"`,
        confidence: confidence.score,
        reasoning: `Insight uses "${issue.word}", should be "${issue.fixed}"`
      });
    }
  }

  return findings;
}

/**
 * Generate a British English compliance report for a scenario
 */
export function getUKEnglishReport(scenario: RoleplayScript) {
  const findings = validateUKEnglish(scenario);
  const spellingFindings = findings.filter(f => f.validatorName === 'UK English Spelling');
  const vocabFindings = findings.filter(f => f.validatorName === 'UK English Vocabulary');

  return {
    scenarioId: scenario.id,
    totalIssues: findings.length,
    spellingIssues: spellingFindings.length,
    vocabularyIssues: vocabFindings.length,
    status: findings.length === 0 ? '✓ PASS' : `⚠ ${findings.length} ISSUE(S)`
  };
}
