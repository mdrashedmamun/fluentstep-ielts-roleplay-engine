/**
 * Spoken Naturalness Validator
 *
 * Deterministic checks for learner lines that are too long, too formal,
 * overloaded, or poorly responsive to the previous turn.
 */

import { RoleplayScript } from '../../staticData';
import { ValidationFinding } from '../types';

const FORMAL_MARKERS = [
  'furthermore',
  'moreover',
  'consequently',
  'therefore',
  'nevertheless',
  'hence',
  'shall',
  'endeavour',
  'delineate',
  'cinematographic',
  'phenomenal',
  'numerous',
  'utilise',
];

const NATURAL_RESPONSE_STARTERS = [
  'yes',
  'no',
  'yeah',
  'not really',
  'actually',
  'i',
  'we',
  'it',
  'that',
  'sure',
  'sorry',
  'thanks',
  'maybe',
  'probably',
];

export function validateSpokenNaturalness(scenario: RoleplayScript): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  const learnerLineIndexes = getLearnerLineIndexes(scenario);

  for (const index of learnerLineIndexes) {
    const turn = scenario.dialogue[index];
    if (!turn) continue;

    const words = getWords(turn.text);
    const maxWords = getMaxLearnerLineWords(scenario.category);
    const formalMatches = findFormalMarkers(turn.text);
    const previousTurn = index > 0 ? scenario.dialogue[index - 1] : undefined;

    if (words.length > maxWords) {
      findings.push(createFinding({
        scenario,
        index,
        issue: 'Learner line is too long for spoken roleplay',
        currentValue: turn.text,
        context: `Word count: ${words.length}. Spoken learner turns should normally stay under ${maxWords} words for this category.`,
        confidence: words.length > 55 ? 0.9 : 0.68,
        reasoning: 'Overlong turns become memorised monologues rather than interactive IELTS speaking practice.',
      }));
    }

    if (formalMatches.length > 0 && isTooFormalForCategory(scenario.category, formalMatches)) {
      findings.push(createFinding({
        scenario,
        index,
        issue: 'Learner line is too formal for spoken roleplay',
        currentValue: formalMatches.join(', '),
        context: turn.text,
        confidence: scenario.category === 'Social' ? 0.9 : 0.74,
        reasoning: 'Spoken roleplay should sound conversational, not like written essay prose.',
      }));
    }

    if (formalMatches.length >= 3 || countLongAdvancedWords(words) >= 5) {
      findings.push(createFinding({
        scenario,
        index,
        issue: 'Learner line is overloaded with advanced phrases',
        currentValue: turn.text,
        context: `Formal markers: ${formalMatches.join(', ') || 'long advanced words'}`,
        confidence: 0.88,
        reasoning:
          'Stacking advanced vocabulary makes the turn sound rehearsed and reduces spoken clarity.',
      }));
    }

    if (previousTurn && previousTurn.text.includes('?') && !respondsNaturally(turn.text)) {
      findings.push(createFinding({
        scenario,
        index,
        issue: 'Learner line may not respond naturally to the previous turn',
        currentValue: turn.text,
        context: `Previous turn: "${previousTurn.text}"`,
        confidence: 0.66,
        reasoning:
          'Question responses usually start with a direct answer, acknowledgement, or natural stance marker.',
      }));
    }
  }

  return findings;
}

function createFinding(input: {
  scenario: RoleplayScript;
  index: number;
  issue: string;
  currentValue: string;
  context: string;
  confidence: number;
  reasoning: string;
}): ValidationFinding {
  return {
    validatorName: 'Spoken Naturalness',
    scenarioId: input.scenario.id,
    location: `dialogue[${input.index}]`,
    issue: input.issue,
    currentValue: input.currentValue,
    context: input.context,
    confidence: input.confidence,
    reasoning: input.reasoning,
  };
}

function getLearnerLineIndexes(scenario: RoleplayScript): number[] {
  const answerIndexes = new Set(scenario.answerVariations.map((answer) => answer.index));
  const indexes = new Set<number>();

  scenario.dialogue.forEach((turn, index) => {
    if (answerIndexes.has(index) || /^(you|student|patient|employee|customer|patron|resident|learner)$/i.test(turn.speaker)) {
      indexes.add(index);
    }
  });

  return [...indexes].sort((a, b) => a - b);
}

function getWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function getMaxLearnerLineWords(category: string): number {
  if (category === 'Social') return 22;
  if (category === 'Academic' || category === 'Advanced') return 34;
  return 28;
}

function findFormalMarkers(text: string): string[] {
  const lower = text.toLowerCase();
  return FORMAL_MARKERS.filter((marker) => new RegExp(`\\b${escapeRegExp(marker)}\\b`, 'i').test(lower));
}

function isTooFormalForCategory(category: string, formalMatches: string[]): boolean {
  if (category === 'Academic' || category === 'Advanced') {
    return formalMatches.length >= 3;
  }

  if (category === 'Workplace' || category === 'Community') {
    return formalMatches.some((marker) => ['furthermore', 'moreover', 'delineate', 'cinematographic'].includes(marker));
  }

  return true;
}

function countLongAdvancedWords(words: string[]): number {
  return words.filter((word) => word.replace(/[^a-z]/gi, '').length >= 12).length;
}

function respondsNaturally(text: string): boolean {
  const normalised = text.trim().toLowerCase().replace(/^["']/, '');
  return NATURAL_RESPONSE_STARTERS.some((starter) => normalised.startsWith(starter));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
