/**
 * LOCKED CHUNKS Compliance Validator
 * Enforces 80%+ compliance with UNIVERSAL_CHUNKS (Bucket A + Bucket B)
 * Extends chunkMatcher.ts with semantic scoring
 */

import { RoleplayScript } from '../../staticData';
import { ValidationFinding } from '../types';
import {
  matchToChunk,
  validateAnswerCompliance,
  suggestChunkAlternatives
} from '../../chunkMatcher';
import { scoreConfidence } from '../fixers/confidenceScorer';

export function validateChunkCompliance(scenario: RoleplayScript): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  // Extract all answers from answerVariations
  const answers = scenario.answerVariations.map(av => av.answer);

  if (answers.length === 0) {
    return findings;
  }

  // Check overall compliance score
  const complianceReport = validateAnswerCompliance(answers);

  // If compliance is below 80%, flag issues
  if (complianceReport.complianceScore < 80) {
    // For each NOVEL answer, create a finding with suggestions
    for (const novelAnswer of complianceReport.novelAnswers) {
      const answerVar = scenario.answerVariations.find(av => av.answer === novelAnswer);
      if (!answerVar) continue;

      const dialogueLine = scenario.dialogue[answerVar.index]?.text || '';
      const suggestions = suggestChunkAlternatives(novelAnswer);

      // Score this finding
      const confidence = scoreConfidence({
        issueType: 'chunk-compliance',
        affectedText: novelAnswer,
        suggestedFix: suggestions[0] || novelAnswer,
        context: dialogueLine,
        category: scenario.category
      });

      findings.push({
        validatorName: 'Chunk Compliance',
        scenarioId: scenario.id,
        location: `answerVariations[${answerVar.index}].answer`,
        issue: `Novel vocabulary (not in LOCKED CHUNKS). Compliance: ${complianceReport.complianceScore}%`,
        currentValue: novelAnswer,
        suggestedValue: suggestions[0],
        alternatives: suggestions.length > 1 ? suggestions.slice(1) : undefined,
        context: `Line: "${dialogueLine}"`,
        confidence: confidence.score,
        reasoning: `"${novelAnswer}" is not in LOCKED CHUNKS. Suggestions based on semantic similarity: ${suggestions.join(', ')}`
      });
    }
  }

  return findings;
}

/**
 * Enhanced suggestion engine with semantic scoring
 * This improves the basic word-overlap approach in chunkMatcher
 */
export function suggestChunkAlternativesWithContext(
  answer: string,
  context: string
): string[] {
  // Get basic suggestions from chunkMatcher
  const basicSuggestions = suggestChunkAlternatives(answer);

  if (basicSuggestions.length === 0) {
    // If no suggestions found, try semantic similarity approaches
    return generateSemanticSuggestions(answer, context);
  }

  return basicSuggestions;
}

/**
 * Generate suggestions based on semantic relationships
 * This is a simplified semantic scorer without external APIs
 */
function generateSemanticSuggestions(answer: string, context: string): string[] {
  // This could be enhanced with:
  // 1. Synonym dictionaries
  // 2. Word embeddings (if available)
  // 3. IELTS official vocabulary lists
  // For now, return empty to indicate no semantic alternatives found
  return [];
}

/**
 * Check if an answer is in LOCKED CHUNKS
 */
export function isInLockedChunks(answer: string): boolean {
  const match = matchToChunk(answer);
  return match.bucket !== 'NOVEL';
}

/**
 * Get detailed compliance metrics for a scenario
 */
export function getComplianceMetrics(scenario: RoleplayScript) {
  const answers = scenario.answerVariations.map(av => av.answer);
  const report = validateAnswerCompliance(answers);

  return {
    scenarioId: scenario.id,
    totalAnswers: report.totalBlanks,
    chunkMatches: report.chunkMatches,
    novelAnswers: report.novelVocab,
    complianceScore: report.complianceScore,
    novelList: report.novelAnswers,
    status: report.complianceScore >= 80 ? '✓ PASS' : '✗ FAIL'
  };
}
