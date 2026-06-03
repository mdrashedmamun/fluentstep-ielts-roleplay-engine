/**
 * Pedagogy Validator
 *
 * Validates V2 teaching fields: chunkFeedbackV2, patternSummary, activeRecall,
 * chunk references, and learning value for each blank.
 */

import { RoleplayScript } from '../../staticData';
import { ValidationFinding } from '../types';

const JARGON_WORDS = [
  'optimise',
  'optimize',
  'pragmatic',
  'salience',
  'communicative',
  'intervention',
  'semantic',
  'lexical',
  'metalinguistic',
];

const VAGUE_VALUES = new Set([
  'use it',
  'use this',
  'bad',
  'good',
  'some chunks are useful',
  'sounds natural',
]);

export function validatePedagogy(scenario: RoleplayScript): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  if (!scenario.chunkFeedbackV2 && !scenario.blanksInOrder && !scenario.patternSummary && !scenario.activeRecall) {
    return findings;
  }

  const feedback = scenario.chunkFeedbackV2 || [];
  const blankMappings = scenario.blanksInOrder || [];
  const chunkIds = new Set(feedback.map((item) => item.chunkId));

  feedback.forEach((item, index) => {
    if (!item.chunkId) {
      findings.push(createFinding({
        scenario,
        location: `chunkFeedbackV2[${index}].chunkId`,
        issue: 'Missing chunk ID in pedagogy feedback',
        currentValue: '(empty)',
        context: item.native,
        confidence: 1,
        reasoning: 'Every teaching chunk needs a stable ID for blank mapping, summaries, and active recall.',
      }));
    }

    const explanationQuality = getSimpleExplanationQuality(item.learner.meaning);
    if (!explanationQuality.valid) {
      findings.push(createFinding({
        scenario,
        location: `chunkFeedbackV2[${index}].learner.meaning`,
        issue: 'Pedagogy needs a simple explanation for learners',
        currentValue: item.learner.meaning,
        context: `Chunk: ${item.native}`,
        confidence: 0.68,
        reasoning: 'Learner explanations should use simple words and avoid linguistic jargon.',
      }));
    }

    const useWhenHasValue = hasClearLearningValue(item.learner.useWhen);
    const whyOddHasValue = hasClearLearningValue(item.learner.whyOdd);
    if (!useWhenHasValue || !whyOddHasValue) {
      findings.push(createFinding({
        scenario,
        location: `chunkFeedbackV2[${index}].learner`,
        issue: 'Pedagogy lacks clear learning value for this blank',
        currentValue: `useWhen: "${item.learner.useWhen}" | whyOdd: "${item.learner.whyOdd}"`,
        context: `Chunk: ${item.native}`,
        confidence: 0.68,
        reasoning: 'Each blank needs a clear use case and a specific explanation of the learner mistake.',
      }));
    }

    if (!item.examples.length || item.examples.length > 2) {
      findings.push(createFinding({
        scenario,
        location: `chunkFeedbackV2[${index}].examples`,
        issue: 'Pedagogy examples should include one or two natural examples',
        currentValue: `${item.examples.length} example(s)`,
        context: `Chunk: ${item.native}`,
        confidence: 0.68,
        reasoning: 'Examples should be compact enough for review while still showing natural usage.',
      }));
    } else if (!item.examples.some((example) => containsPhrase(example, item.native))) {
      findings.push(createFinding({
        scenario,
        location: `chunkFeedbackV2[${index}].examples`,
        issue: 'Pedagogy examples should show the native chunk',
        currentValue: item.examples.join(' | '),
        context: `Chunk: ${item.native}`,
        confidence: 0.68,
        reasoning: 'Examples should demonstrate the exact reusable phrase being taught.',
      }));
    }
  });

  blankMappings.forEach((mapping, index) => {
    if (!chunkIds.has(mapping.chunkId)) {
      findings.push(invalidReferenceFinding(
        scenario,
        `blanksInOrder[${index}].chunkId`,
        mapping.chunkId,
        'Each blank mapping must point to an existing chunkFeedbackV2 item.'
      ));
    }
  });

  if (!scenario.patternSummary) {
    findings.push(createFinding({
      scenario,
      location: 'patternSummary',
      issue: 'Missing reusable pattern summary',
      currentValue: '(missing)',
      context: 'V2 scenarios need patternSummary for post-roleplay learning.',
      confidence: 0.92,
      reasoning: 'Pattern summaries turn individual blanks into reusable speaking habits.',
    }));
  } else {
    validatePatternSummary(scenario, chunkIds, findings);
  }

  if (!scenario.activeRecall || scenario.activeRecall.length === 0) {
    findings.push(createFinding({
      scenario,
      location: 'activeRecall',
      issue: 'Missing active recall prompts for taught chunks',
      currentValue: '(empty)',
      context: 'V2 scenarios need at least one active recall item.',
      confidence: 0.68,
      reasoning: 'Active recall helps learners retain the patterns after the roleplay.',
    }));
  } else {
    scenario.activeRecall.forEach((item, index) => {
      if (!hasClearLearningValue(item.prompt)) {
        findings.push(createFinding({
          scenario,
          location: `activeRecall[${index}].prompt`,
          issue: 'Active recall prompt lacks clear learning value',
          currentValue: item.prompt,
          context: `Targets: ${item.targetChunkIds.join(', ')}`,
          confidence: 0.68,
          reasoning: 'Recall prompts should ask learners to retrieve a useful speaking function.',
        }));
      }

      item.targetChunkIds.forEach((chunkId) => {
        if (!chunkIds.has(chunkId)) {
          findings.push(invalidReferenceFinding(
            scenario,
            `activeRecall[${index}].targetChunkIds`,
            chunkId,
            'Active recall targets must reference existing chunkFeedbackV2 items.'
          ));
        }
      });
    });
  }

  return findings;
}

function validatePatternSummary(
  scenario: RoleplayScript,
  chunkIds: Set<string>,
  findings: ValidationFinding[]
): void {
  const summary = scenario.patternSummary;
  if (!summary) return;

  if (!hasClearLearningValue(summary.overallInsight)) {
    findings.push(createFinding({
      scenario,
      location: 'patternSummary.overallInsight',
      issue: 'Pattern summary lacks clear learning value',
      currentValue: summary.overallInsight,
      context: 'Overall insight should explain what the learner can reuse.',
      confidence: 0.68,
      reasoning: 'The summary should name the transferable speaking skill, not just say the chunks are useful.',
    }));
  }

  summary.categoryBreakdown.forEach((breakdown, index) => {
    if (breakdown.count !== breakdown.exampleChunkIds.length) {
      findings.push(createFinding({
        scenario,
        location: `patternSummary.categoryBreakdown[${index}]`,
        issue: 'Pattern summary count does not match chunk references',
        currentValue: `${breakdown.count} count vs ${breakdown.exampleChunkIds.length} references`,
        context: breakdown.insight,
        confidence: 0.9,
        reasoning: 'Counts must stay aligned with stable chunk IDs so the UI can render reliable summaries.',
      }));
    }

    breakdown.exampleChunkIds.forEach((chunkId) => {
      if (!chunkIds.has(chunkId)) {
        findings.push(invalidReferenceFinding(
          scenario,
          `patternSummary.categoryBreakdown[${index}].exampleChunkIds`,
          chunkId,
          'Pattern summary examples must reference existing chunkFeedbackV2 items.'
        ));
      }
    });
  });

  summary.keyPatterns.forEach((pattern, index) => {
    if (!hasClearLearningValue(pattern.explanation)) {
      findings.push(createFinding({
        scenario,
        location: `patternSummary.keyPatterns[${index}].explanation`,
        issue: 'Key pattern explanation lacks clear learning value',
        currentValue: pattern.explanation,
        context: pattern.pattern,
        confidence: 0.68,
        reasoning: 'Pattern explanations should tell learners when and why to reuse the pattern.',
      }));
    }

    pattern.chunkIds.forEach((chunkId) => {
      if (!chunkIds.has(chunkId)) {
        findings.push(invalidReferenceFinding(
          scenario,
          `patternSummary.keyPatterns[${index}].chunkIds`,
          chunkId,
          'Key patterns must reference existing chunkFeedbackV2 items.'
        ));
      }
    });
  });
}

function invalidReferenceFinding(
  scenario: RoleplayScript,
  location: string,
  chunkId: string,
  reasoning: string
): ValidationFinding {
  return createFinding({
    scenario,
    location,
    issue: 'Invalid chunk reference in pedagogy fields',
    currentValue: chunkId,
    context: 'Chunk ID is not present in chunkFeedbackV2.',
    confidence: 1,
    reasoning,
  });
}

function createFinding(input: {
  scenario: RoleplayScript;
  location: string;
  issue: string;
  currentValue: string;
  context: string;
  confidence: number;
  reasoning: string;
}): ValidationFinding {
  return {
    validatorName: 'Pedagogy',
    scenarioId: input.scenario.id,
    location: input.location,
    issue: input.issue,
    currentValue: input.currentValue,
    context: input.context,
    confidence: input.confidence,
    reasoning: input.reasoning,
  };
}

function getSimpleExplanationQuality(value: string): { valid: boolean; major: boolean } {
  const words = value.split(/\s+/).filter(Boolean);
  const lower = value.toLowerCase();

  if (words.length < 2) {
    return { valid: false, major: true };
  }

  const hasJargon = JARGON_WORDS.some((word) => new RegExp(`\\b${word}\\b`, 'i').test(lower));
  if (hasJargon) {
    return { valid: false, major: true };
  }

  if (words.length > 18) {
    return { valid: false, major: false };
  }

  return { valid: true, major: false };
}

function hasClearLearningValue(value: string): boolean {
  const normalised = value.trim().toLowerCase().replace(/[.!?]+$/, '');
  const words = value.split(/\s+/).filter(Boolean);

  if (words.length < 4) {
    return false;
  }

  return !VAGUE_VALUES.has(normalised);
}

function containsPhrase(example: string, phrase: string): boolean {
  return example.toLowerCase().includes(phrase.toLowerCase());
}
