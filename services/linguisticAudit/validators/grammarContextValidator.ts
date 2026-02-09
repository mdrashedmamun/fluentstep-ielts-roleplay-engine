/**
 * Grammar Context Validator
 * Detects redundancy, double negatives, and POS (Part of Speech) mismatches
 * Focuses on grammatical errors that emerge only in context
 */

import { RoleplayScript } from '../../staticData';
import { ValidationFinding } from '../types';
import { scoreConfidence } from '../fixers/confidenceScorer';

export function validateGrammarContext(scenario: RoleplayScript): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  for (const av of scenario.answerVariations) {
    const dialogueLine = scenario.dialogue[av.index]?.text;
    if (!dialogueLine) continue;

    // Substitute answer into blank
    const substituted = dialogueLine.replace('________', av.answer);

    // Check 1: Redundancy (same word within 3-word window)
    const redundancy = detectRedundancy(substituted, av.answer);
    if (redundancy) {
      const confidence = scoreConfidence({
        issueType: 'redundancy',
        affectedText: av.answer,
        suggestedFix: redundancy.suggestion,
        ruleCertainty: 0.98
      });

      findings.push({
        validatorName: 'Grammar Context Validator',
        scenarioId: scenario.id,
        location: `answerVariations[${av.index}].answer`,
        issue: 'Redundancy - same word repeated',
        currentValue: av.answer,
        suggestedValue: redundancy.suggestion,
        context: dialogueLine,
        confidence: confidence.score,
        reasoning: `"${av.answer}" creates repetition: "${substituted}"`
      });
    }

    // Check 2: Double negative
    const doubleNeg = detectDoubleNegative(substituted);
    if (doubleNeg) {
      const confidence = scoreConfidence({
        issueType: 'double-negative',
        affectedText: av.answer,
        suggestedFix: doubleNeg.suggestion,
        ruleCertainty: 1.0
      });

      findings.push({
        validatorName: 'Grammar Context Validator',
        scenarioId: scenario.id,
        location: `answerVariations[${av.index}].answer`,
        issue: 'Double negative - grammatically incorrect',
        currentValue: av.answer,
        suggestedValue: doubleNeg.suggestion,
        context: dialogueLine,
        confidence: confidence.score,
        reasoning: `Contains two negatives: "${doubleNeg.negatives.join('" and "')}". Result: "${substituted}"`
      });
    }

    // Check 3: POS mismatch with coordination
    if (dialogueLine.includes(' and ') || dialogueLine.includes(' or ')) {
      const posMismatch = detectPOSMismatch(substituted, av.answer);
      if (posMismatch) {
        const confidence = scoreConfidence({
          issueType: 'pos-mismatch',
          affectedText: av.answer,
          suggestedFix: posMismatch.suggestion,
          ruleCertainty: 0.90
        });

        findings.push({
          validatorName: 'Grammar Context Validator',
          scenarioId: scenario.id,
          location: `answerVariations[${av.index}].answer`,
          issue: 'POS mismatch - adverb/adjective coordination error',
          currentValue: av.answer,
          suggestedValue: posMismatch.suggestion,
          context: dialogueLine,
          confidence: confidence.score,
          reasoning: posMismatch.reason
        });
      }
    }

    // Also check alternatives
    if (av.alternatives) {
      for (let i = 0; i < av.alternatives.length; i++) {
        const altSubstituted = dialogueLine.replace('________', av.alternatives[i]);

        const altRedundancy = detectRedundancy(altSubstituted, av.alternatives[i]);
        if (altRedundancy) {
          const confidence = scoreConfidence({
            issueType: 'redundancy',
            affectedText: av.alternatives[i],
            suggestedFix: altRedundancy.suggestion,
            ruleCertainty: 0.98
          });

          findings.push({
            validatorName: 'Grammar Context Validator',
            scenarioId: scenario.id,
            location: `answerVariations[${av.index}].alternatives[${i}]`,
            issue: 'Redundancy in alternative',
            currentValue: av.alternatives[i],
            suggestedValue: altRedundancy.suggestion,
            context: dialogueLine,
            confidence: confidence.score,
            reasoning: `Alternative "${av.alternatives[i]}" creates repetition`
          });
        }

        const altDoubleNeg = detectDoubleNegative(altSubstituted);
        if (altDoubleNeg) {
          const confidence = scoreConfidence({
            issueType: 'double-negative',
            affectedText: av.alternatives[i],
            suggestedFix: altDoubleNeg.suggestion,
            ruleCertainty: 1.0
          });

          findings.push({
            validatorName: 'Grammar Context Validator',
            scenarioId: scenario.id,
            location: `answerVariations[${av.index}].alternatives[${i}]`,
            issue: 'Double negative in alternative',
            currentValue: av.alternatives[i],
            suggestedValue: altDoubleNeg.suggestion,
            context: dialogueLine,
            confidence: confidence.score,
            reasoning: `Alternative creates double negative: "${altSubstituted}"`
          });
        }

        const altPosMismatch = detectPOSMismatch(altSubstituted, av.alternatives[i]);
        if (altPosMismatch) {
          const confidence = scoreConfidence({
            issueType: 'pos-mismatch',
            affectedText: av.alternatives[i],
            suggestedFix: altPosMismatch.suggestion,
            ruleCertainty: 0.90
          });

          findings.push({
            validatorName: 'Grammar Context Validator',
            scenarioId: scenario.id,
            location: `answerVariations[${av.index}].alternatives[${i}]`,
            issue: 'POS mismatch in alternative',
            currentValue: av.alternatives[i],
            suggestedValue: altPosMismatch.suggestion,
            context: dialogueLine,
            confidence: confidence.score,
            reasoning: altPosMismatch.reason
          });
        }
      }
    }
  }

  return findings;
}

/**
 * Detect word repetition (redundancy) within 3-word window
 */
function detectRedundancy(text: string, answer: string): { suggestion: string } | null {
  const words = text.toLowerCase().split(/\s+/);
  const answerLower = answer.toLowerCase();

  // Look for exact repetition of the answer word
  for (let i = 0; i < words.length - 1; i++) {
    // Check if same word appears consecutively or within 2 words
    if (words[i] === answerLower) {
      for (let j = i + 1; j <= Math.min(i + 2, words.length - 1); j++) {
        if (words[j] === answerLower) {
          // Suggest common synonyms
          const synonyms: { [key: string]: string } = {
            'little': 'minor',
            'tiny': 'small',
            'big': 'large',
            'good': 'great',
            'bad': 'terrible',
            'nice': 'pleasant',
            'very': 'extremely',
            'really': 'truly',
            'quite': 'rather',
            'pretty': 'fairly'
          };

          const suggestion = synonyms[answerLower] || answerLower.replace(/(.*)e$/, '$1');
          return { suggestion };
        }
      }
    }
  }

  return null;
}

/**
 * Detect double negatives in a sentence
 */
function detectDoubleNegative(text: string): { negatives: string[]; suggestion: string } | null {
  const negatives = ['no', 'not', 'none', "n't", 'never', 'neither', 'nothing', 'nobody'];
  const foundNegatives: string[] = [];
  const lowerText = text.toLowerCase();

  for (const neg of negatives) {
    if (lowerText.includes(neg)) {
      foundNegatives.push(neg);
    }
  }

  // Only flag if 2 or more negatives found
  if (foundNegatives.length >= 2) {
    return {
      negatives: foundNegatives,
      suggestion: 'Remove one negative or rephrase as positive'
    };
  }

  return null;
}

/**
 * Detect POS (Part of Speech) mismatches in coordinated structures
 * Example: "particularly and great" (adverb + adjective)
 */
function detectPOSMismatch(text: string, answer: string): { reason: string; suggestion: string } | null {
  const answerLower = answer.toLowerCase();

  // Check if answer is an adverb (ends in -ly) or comparative
  const isAdverb = answerLower.endsWith('ly');
  const isComparative = answerLower.endsWith('er') || answerLower.endsWith('est');

  if (!isAdverb && !isComparative) {
    return null;
  }

  // Look for coordination patterns: "answer and SOMETHING" or "SOMETHING and answer"
  const andPattern = new RegExp(
    `(${answer}\\s+(?:and|or)\\s+([\\w]+))|(\\w+\\s+(?:and|or)\\s+${answer})`,
    'i'
  );

  const match = andPattern.exec(text);
  if (!match) {
    return null;
  }

  // Get the coordinated word
  const coordinated = match[2] || text.split(/\s+/).find(w => w !== answer && match[0].includes(w));

  if (!coordinated) {
    return null;
  }

  const coordLower = coordinated.toLowerCase();

  // If answer is adverb, coordinated should also be adverb
  if (isAdverb && !coordLower.endsWith('ly')) {
    const suggestion = answerLower.replace(/ly$/, '');
    return {
      reason: `Adverb "${answer}" coordinates with non-adverb "${coordinated}" - mismatch`,
      suggestion
    };
  }

  // If answer is comparative, coordinated should also be comparative
  if (isComparative) {
    if (!coordLower.endsWith('er') && !coordLower.endsWith('est')) {
      return {
        reason: `Comparative "${answer}" coordinates with non-comparative "${coordinated}" - mismatch`,
        suggestion: answer
      };
    }
  }

  return null;
}

/**
 * Generate a grammar context compliance report
 */
export function getGrammarContextReport(scenario: RoleplayScript) {
  const findings = validateGrammarContext(scenario);
  const redundancyIssues = findings.filter(f => f.issue.includes('Redundancy'));
  const doubleNegIssues = findings.filter(f => f.issue.includes('Double negative'));
  const posMismatchIssues = findings.filter(f => f.issue.includes('POS mismatch'));

  return {
    scenarioId: scenario.id,
    totalIssues: findings.length,
    redundancyIssues: redundancyIssues.length,
    doubleNegativeIssues: doubleNegIssues.length,
    posMismatchIssues: posMismatchIssues.length,
    status: findings.length === 0 ? '✓ PASS' : `⚠ ${findings.length} ISSUE(S)`
  };
}
