/**
 * IELTS Authenticity Validator
 *
 * Checks whether scenarios feel plausible for IELTS speaking practice and whether
 * blanks teach reusable speaking patterns rather than impressive but low-use terms.
 */

import { RoleplayScript } from '../../staticData';
import { ValidationFinding } from '../types';

const NICHE_TOPIC_PATTERNS = [
  /\bbasel\s+iii\b/i,
  /\bliquidity\s+coverage\b/i,
  /\bcapital\s+adequacy\b/i,
  /\bpaediatric\s+oncology\s+procurement\b/i,
  /\bquantum\s+cryptography\b/i,
  /\bactuarial\b/i,
  /\bpharmacokinetics\b/i,
  /\bmetabolomics\b/i,
  /\bkubernetes\b/i,
  /\bderivatives\s+pricing\b/i,
];

const ESSAY_LIKE_PATTERNS = [
  /\bin conclusion\b/i,
  /\bit can be argued that\b/i,
  /\bthis essay\b/i,
  /\bthe aforementioned\b/i,
  /\btherefore it is evident\b/i,
  /\bto what extent\b/i,
];

const LOW_USE_VOCABULARY = [
  'ameliorate',
  'delineate',
  'aforementioned',
  'plethora',
  'paradigm',
  'ubiquitous',
  'notwithstanding',
  'heretofore',
];

const CATEGORY_INACCURATE_PATTERNS: Record<string, RegExp[]> = {
  Healthcare: [
    /\bcouncil\s+tax\b/i,
    /\bmortgage\b/i,
    /\bletting\s+agent\b/i,
    /\brefund\b/i,
    /\bcashier\b/i,
    /\bboarding\s+pass\b/i,
  ],
  Academic: [
    /\bGP\b/i,
    /\bprescription\b/i,
    /\bboarding\s+pass\b/i,
    /\brefund\b/i,
  ],
  Workplace: [
    /\bdiagnosis\b/i,
    /\bprescription\b/i,
    /\bboarding\s+pass\b/i,
  ],
};

const UK_TERMS_REQUIRING_CONTEXT = [
  'council tax',
  'NHS',
  'GP',
  'fortnight',
  'chemist',
  'surgery',
  'council',
  'A-level',
  'GCSE',
  'dress circle',
  'estate agent',
];

const REUSABLE_PATTERN_MARKERS = [
  /\b(i|we)\b/i,
  /\bcould\b/i,
  /\bwould\b/i,
  /\bneed to\b/i,
  /\btrying to\b/i,
  /\bkeen to\b/i,
  /\bkeen on\b/i,
  /\bsorry\b/i,
  /\bthanks?\b/i,
  /\bactually\b/i,
  /\bjust\b/i,
  /\bquite\b/i,
  /\brather\b/i,
  /\bthe thing is\b/i,
  /\bget(?:ting)? on with\b/i,
  /\bwork through\b/i,
  /\bflag\b/i,
  /\bclarify\b/i,
];

export function validateIELTSAuthenticity(scenario: RoleplayScript): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  const topicText = `${scenario.topic} ${scenario.context}`;
  const dialogueText = scenario.dialogue.map((turn) => turn.text).join(' ');

  const nicheMatch = findFirstMatch(topicText, NICHE_TOPIC_PATTERNS);
  if (nicheMatch) {
    findings.push(createFinding({
      scenario,
      location: 'topic',
      issue: 'Topic is too niche for IELTS speaking',
      currentValue: scenario.topic,
      context: `Matched specialist topic marker: "${nicheMatch}"`,
      confidence: 0.95,
      reasoning:
        'IELTS speaking topics should be broadly discussable by educated candidates without specialist domain knowledge.',
    }));
  }

  const essayMatch = findFirstMatch(dialogueText, ESSAY_LIKE_PATTERNS);
  if (essayMatch) {
    findings.push(createFinding({
      scenario,
      location: 'dialogue',
      issue: 'Essay-like dialogue appears in spoken roleplay',
      currentValue: essayMatch,
      context: 'Dialogue should sound like a live speaking exchange, not Task 2 writing.',
      confidence: 0.92,
      reasoning: 'Formulaic essay phrases undermine spoken authenticity.',
    }));
  }

  const inaccurateMatch = findFirstCategoryInaccuracy(scenario.category, dialogueText);
  if (inaccurateMatch) {
    findings.push(createFinding({
      scenario,
      location: 'dialogue',
      issue: 'Domain-inaccurate phrase for scenario category',
      currentValue: inaccurateMatch,
      context: `Category: ${scenario.category}`,
      confidence: 0.9,
      reasoning: 'Scenario language should match the practical domain being roleplayed.',
    }));
  }

  for (const answer of scenario.answerVariations) {
    const lowUseWord = LOW_USE_VOCABULARY.find((word) =>
      new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i').test(answer.answer)
    );

    if (lowUseWord) {
      findings.push(createFinding({
        scenario,
        location: `answerVariations[${answer.index}].answer`,
        issue: 'Impressive but low-use vocabulary in blank answer',
        currentValue: answer.answer,
        context: getDialogueContext(scenario, answer.index),
        confidence: 0.9,
        reasoning:
          'IELTS speaking blanks should prioritise high-utility spoken patterns over rare vocabulary that sounds performative.',
      }));
    }

    if (!teachesReusableSpeakingPattern(answer.answer)) {
      findings.push(createFinding({
        scenario,
        location: `answerVariations[${answer.index}].answer`,
        issue: 'Blank does not teach a reusable speaking pattern',
        currentValue: answer.answer,
        context: getDialogueContext(scenario, answer.index),
        confidence: 0.68,
        reasoning:
          'A blank should help learners reuse a spoken function such as softening, clarifying, responding, repairing, or closing.',
      }));
    }
  }

  for (const term of UK_TERMS_REQUIRING_CONTEXT) {
    if (containsTerm(dialogueText, term) && !hasTermExplanation(scenario, term)) {
      findings.push(createFinding({
        scenario,
        location: 'dialogue',
        issue: 'Unexplained UK term may confuse IELTS learners',
        currentValue: term,
        context: 'Add a short explanation in context or chunk feedback when a UK-specific term is central.',
        confidence: 0.68,
        reasoning:
          'UK-specific language is valuable, but learners need enough context to transfer it correctly.',
      }));
    }
  }

  return findings;
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
    validatorName: 'IELTS Authenticity',
    scenarioId: input.scenario.id,
    location: input.location,
    issue: input.issue,
    currentValue: input.currentValue,
    context: input.context,
    confidence: input.confidence,
    reasoning: input.reasoning,
  };
}

function findFirstMatch(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[0]) {
      return match[0];
    }
  }
  return undefined;
}

function findFirstCategoryInaccuracy(category: string, text: string): string | undefined {
  const patterns = CATEGORY_INACCURATE_PATTERNS[category] || [];
  return findFirstMatch(text, patterns);
}

function teachesReusableSpeakingPattern(answer: string): boolean {
  const trimmed = answer.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  if (LOW_USE_VOCABULARY.some((word) => new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i').test(trimmed))) {
    return false;
  }

  if (wordCount > 6) {
    return false;
  }

  if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(trimmed)) {
    return false;
  }

  if (/\b[A-Z]{2,}\b/.test(trimmed) || /\d/.test(trimmed)) {
    return false;
  }

  return REUSABLE_PATTERN_MARKERS.some((pattern) => pattern.test(trimmed)) || wordCount <= 2;
}

function hasTermExplanation(scenario: RoleplayScript, term: string): boolean {
  const lowerTerm = term.toLowerCase();
  const searchableText = [
    scenario.context,
    ...(scenario.chunkFeedbackV2 || []).flatMap((feedback) => [
      feedback.learner.meaning,
      feedback.learner.useWhen,
      feedback.learner.whyOdd,
      ...feedback.examples,
    ]),
    ...(scenario.chunkFeedback || []).flatMap((feedback) => [
      feedback.coreFunction,
      ...feedback.nativeUsageNotes,
      ...feedback.situations.map((situation) => situation.context),
    ]),
  ].join(' ').toLowerCase();

  if (!searchableText.includes(lowerTerm)) {
    return false;
  }

  const explanationMarkers = ['means', 'refers to', 'called', 'used for', 'uk', 'british', 'nhs'];
  return explanationMarkers.some((marker) => searchableText.includes(marker));
}

function containsTerm(text: string, term: string): boolean {
  return new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i').test(text);
}

function getDialogueContext(scenario: RoleplayScript, index: number): string {
  return scenario.dialogue[index]?.text || 'No dialogue context available';
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
