/**
 * Exam Language Validator
 * Detects IELTS speaking test language and formal patterns
 * that shouldn't appear in natural role-play conversations
 */

import { RoleplayScript } from '../../staticData';
import { ValidationFinding } from '../types';
import {
  findExamLanguageIssues,
  usesExamLanguage,
  usesRoboticPoliteness
} from '../rules/examLanguagePatterns';
import { scoreConfidence } from '../fixers/confidenceScorer';

export function validateExamLanguage(scenario: RoleplayScript): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  for (const av of scenario.answerVariations) {
    // Check for exam language
    const examAnalysis = usesExamLanguage(av.answer);
    const politenessAnalysis = usesRoboticPoliteness(av.answer);

    // Flag exam language if present
    if (examAnalysis.usesExam) {
      const confidence = scoreConfidence({
        issueType: 'exam-language',
        affectedText: av.answer,
        suggestedFix: examAnalysis.issues[0]?.pattern.suggestions[0] || '',
        context: scenario.dialogue[av.index]?.text || '',
        category: scenario.category
      });

      findings.push({
        validatorName: 'Exam Language',
        scenarioId: scenario.id,
        location: `answerVariations[${av.index}]!.answer`,
        issue: `Uses formal exam language (${examAnalysis.issues.length} pattern(s))`,
        currentValue: av.answer,
        alternatives: [
          ...new Set(
            examAnalysis.issues.flatMap(issue => issue.pattern.suggestions)
          )
        ],
        context: `Dialogue: "${scenario.dialogue[av.index]?.text}"`,
        confidence: confidence.score * 0.75,  // Lower confidence - subjective
        reasoning: `"In my opinion", "I strongly believe", and similar phrases are IELTS exam language. Natural conversation is more direct.`
      });
    }

    // Flag robotic politeness separately
    if (politenessAnalysis.isRobotic) {
      const confidence = scoreConfidence({
        issueType: 'robotic-politeness',
        affectedText: av.answer,
        suggestedFix: 'Sorry about that',
        context: scenario.dialogue[av.index]?.text || '',
        category: scenario.category
      });

      findings.push({
        validatorName: 'Exam Language',
        scenarioId: scenario.id,
        location: `answerVariations[${av.index}]!.answer`,
        issue: `Uses robotic politeness`,
        currentValue: av.answer,
        alternatives: [
          'Sorry about that',
          'I apologize',
          'Thanks so much',
          'I appreciate that'
        ],
        context: `Contains: ${politenessAnalysis.patterns[0]}`,
        confidence: confidence.score * 0.85,
        reasoning: `Native speakers don't apologize this formally in casual contexts. Simpler alternatives sound more natural.`
      });
    }
  }

  return findings;
}
