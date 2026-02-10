/**
 * Blank-Answer Pairing Validator
 * Ensures deep dive insights accurately reference and explain the correct blanks
 * Validates data integrity and semantic alignment
 */

import { RoleplayScript } from '../../staticData';
import { ValidationFinding } from '../types';
import { scoreConfidence } from '../fixers/confidenceScorer';

export function validateBlankAnswerPairing(scenario: RoleplayScript): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  // Return early if no deep dives
  if (!scenario.deepDive || scenario.deepDive.length === 0) {
    return findings;
  }

  // Build a map of answerVariations by index for quick lookup
  const avByIndex = new Map<number, typeof scenario.answerVariations[0]>();
  for (const av of scenario.answerVariations) {
    avByIndex.set(av.index, av);
  }

  // Check each deepDive
  for (let ddIndex = 0; ddIndex < scenario.deepDive.length; ddIndex++) {
    const dd = scenario.deepDive[ddIndex]!;

    // Check 1: Does the blank index exist?
    const av = avByIndex.get(dd.index);
    if (!av) {
      const confidence = scoreConfidence({
        issueType: 'data-integrity',
        affectedText: `index: ${dd.index}`,
        suggestedFix: undefined,
        ruleCertainty: 1.0
      });

      findings.push({
        validatorName: 'Blank-Answer Pairing Validator',
        scenarioId: scenario.id,
        location: `deepDive[${ddIndex}]`,
        issue: 'DeepDive references non-existent blank index',
        currentValue: `index: ${dd.index}`,
        suggestedValue: undefined,
        context: dd.phrase,
        confidence: confidence.score,
        reasoning: `DeepDive index ${dd.index} has no matching answerVariation. Valid indices: ${Array.from(avByIndex.keys()).join(', ')}`
      });
      continue;
    }

    // Check 2: Does deepDive explain the answer adequately?
    const answerInPhrase = dd.phrase.toLowerCase().includes(av.answer.toLowerCase());
    const answerInInsight = dd.insight.toLowerCase().includes(av.answer.toLowerCase());

    if (!answerInPhrase && !answerInInsight) {
      const confidence = scoreConfidence({
        issueType: 'semantic-alignment',
        affectedText: dd.phrase,
        suggestedFix: undefined,
        ruleCertainty: 0.80
      });

      findings.push({
        validatorName: 'Blank-Answer Pairing Validator',
        scenarioId: scenario.id,
        location: `deepDive[${ddIndex}]`,
        issue: 'DeepDive does not reference the answer word',
        currentValue: dd.phrase,
        suggestedValue: undefined,
        context: `Answer: "${av.answer}", DeepDive phrase: "${dd.phrase}"`,
        confidence: confidence.score,
        reasoning: `DeepDive should explain the word "${av.answer}" but doesn't mention it in phrase or insight`
      });
    }

    // Check 3: Verify alternatives are actually alternatives (not duplicates)
    if (av.alternatives && av.alternatives.length > 0) {
      const uniqueAnswers = new Set<string>();
      uniqueAnswers.add(av.answer.toLowerCase());

      for (let i = 0; i < av.alternatives.length; i++) {
        const altLower = av.alternatives[i]!.toLowerCase();

        if (uniqueAnswers.has(altLower)) {
          const confidence = scoreConfidence({
            issueType: 'duplicate-alternative',
            affectedText: av.alternatives[i],
            suggestedFix: undefined,
            ruleCertainty: 1.0
          });

          findings.push({
            validatorName: 'Blank-Answer Pairing Validator',
            scenarioId: scenario.id,
            location: `answerVariations[${av.index}]!.alternatives[${i}]`,
            issue: 'Duplicate alternative (same as main answer or another alternative)',
            currentValue: av.alternatives[i],
            suggestedValue: undefined,
            context: `Main answer: "${av.answer}"`,
            confidence: confidence.score,
            reasoning: `Alternative "${av.alternatives[i]}" is identical to main answer or another alternative`
          });
        } else {
          uniqueAnswers.add(altLower);
        }
      }
    }

    // Check 4: Verify deepDive index corresponds to dialogue line
    const dialogueLine = scenario.dialogue[dd.index]!;
    if (!dialogueLine) {
      const confidence = scoreConfidence({
        issueType: 'data-integrity',
        affectedText: `index: ${dd.index}`,
        suggestedFix: undefined,
        ruleCertainty: 1.0
      });

      findings.push({
        validatorName: 'Blank-Answer Pairing Validator',
        scenarioId: scenario.id,
        location: `deepDive[${ddIndex}]`,
        issue: 'DeepDive index does not correspond to a dialogue line',
        currentValue: `index: ${dd.index}`,
        suggestedValue: undefined,
        context: `Total dialogue lines: ${scenario.dialogue.length}`,
        confidence: confidence.score,
        reasoning: `DeepDive references index ${dd.index} but dialogue only has ${scenario.dialogue.length} lines`
      });
    }

    // Check 5: Verify deepDive category is valid
    const validCategories = ['pronunciation', 'grammar', 'vocabulary', 'culture', 'usage', 'idiom', 'natural-english'];
    if (!validCategories.includes(dd.category)) {
      const confidence = scoreConfidence({
        issueType: 'invalid-category',
        affectedText: dd.category,
        suggestedFix: validCategories[0],
        ruleCertainty: 0.85
      });

      findings.push({
        validatorName: 'Blank-Answer Pairing Validator',
        scenarioId: scenario.id,
        location: `deepDive[${ddIndex}]!.category`,
        issue: 'Invalid deep dive category',
        currentValue: dd.category,
        suggestedValue: validCategories[0],
        context: `Valid categories: ${validCategories.join(', ')}`,
        confidence: confidence.score,
        reasoning: `Category "${dd.category}" is not recognized. Use one of: ${validCategories.join(', ')}`
      });
    }

    // Check 6: Verify deepDive insight is not empty
    if (!dd.insight || dd.insight.trim().length === 0) {
      const confidence = scoreConfidence({
        issueType: 'missing-content',
        affectedText: 'insight',
        suggestedFix: undefined,
        ruleCertainty: 1.0
      });

      findings.push({
        validatorName: 'Blank-Answer Pairing Validator',
        scenarioId: scenario.id,
        location: `deepDive[${ddIndex}]!.insight`,
        issue: 'DeepDive insight is empty',
        currentValue: dd.insight,
        suggestedValue: undefined,
        context: `Phrase: "${dd.phrase}"`,
        confidence: confidence.score,
        reasoning: `DeepDive must have an insight explaining the teaching point`
      });
    }

    // Check 7: Verify answer-alternative diversity
    if (av.alternatives && av.alternatives.length > 0) {
      const allAnswers = [av.answer, ...av.alternatives];

      for (let i = 0; i < allAnswers.length; i++) {
        for (let j = i + 1; j < allAnswers.length; j++) {
          // Calculate similarity (very simple: shared starting letters)
          if (allAnswers[i]!.substring(0, 3) === allAnswers[j]!.substring(0, 3)) {
            // Only flag if they're too similar (same root)
            if (allAnswers[i]!.toLowerCase() === allAnswers[j]!.toLowerCase()) {
              const confidence = scoreConfidence({
                issueType: 'low-diversity',
                affectedText: allAnswers[j],
                suggestedFix: undefined,
                ruleCertainty: 0.90
              });

              findings.push({
                validatorName: 'Blank-Answer Pairing Validator',
                scenarioId: scenario.id,
                location: `answerVariations[${av.index}]!.alternatives[${j - 1}]`,
                issue: 'Alternatives lack sufficient diversity',
                currentValue: allAnswers[j],
                suggestedValue: undefined,
                context: `All answers: ${allAnswers.join(', ')}`,
                confidence: confidence.score,
                reasoning: `Alternative is too similar to main answer or another alternative`
              });
            }
          }
        }
      }
    }
  }

  return findings;
}

/**
 * Generate a blank-answer pairing report
 */
export function getBlankAnswerPairingReport(scenario: RoleplayScript) {
  const findings = validateBlankAnswerPairing(scenario);
  const indexIssues = findings.filter(f => f.issue.includes('index'));
  const semanticIssues = findings.filter(f => f.issue.includes('reference'));
  const dataIssues = findings.filter(f => f.issue.includes('Data'));

  return {
    scenarioId: scenario.id,
    totalIssues: findings.length,
    indexIssues: indexIssues.length,
    semanticIssues: semanticIssues.length,
    dataIssues: dataIssues.length,
    status: findings.length === 0 ? '✓ PASS' : `⚠ ${findings.length} ISSUE(S)`
  };
}
