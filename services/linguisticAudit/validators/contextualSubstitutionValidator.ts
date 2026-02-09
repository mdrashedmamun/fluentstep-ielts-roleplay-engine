/**
 * Contextual Substitution Validator
 * Verifies that all answer alternatives work grammatically when substituted into blanks
 * Focuses on ensuring alternatives maintain sentence validity
 */

import { RoleplayScript } from '../../staticData';
import { ValidationFinding } from '../types';
import { scoreConfidence } from '../fixers/confidenceScorer';

export function validateContextualSubstitution(scenario: RoleplayScript): ValidationFinding[] {
  const findings: ValidationFinding[] = [];

  for (const av of scenario.answerVariations) {
    const dialogueLine = scenario.dialogue[av.index]?.text;
    if (!dialogueLine || !av.alternatives?.length) continue;

    // First verify main answer works
    const mainSubstituted = dialogueLine.replace('________', av.answer);
    const mainValidity = validateSentenceStructure(mainSubstituted);
    if (!mainValidity.valid) {
      const confidence = scoreConfidence({
        issueType: 'contextual-fit',
        affectedText: av.answer,
        suggestedFix: undefined,
        ruleCertainty: 0.75
      });

      findings.push({
        validatorName: 'Contextual Substitution Validator',
        scenarioId: scenario.id,
        location: `answerVariations[${av.index}].answer`,
        issue: 'Main answer does not fit context',
        currentValue: av.answer,
        suggestedValue: undefined,
        context: dialogueLine,
        confidence: confidence.score,
        reasoning: `Main answer creates issue: ${mainValidity.reason}. Sentence: "${mainSubstituted}"`
      });
    }

    // Now check all alternatives
    for (let i = 0; i < av.alternatives.length; i++) {
      const alt = av.alternatives[i];
      const substituted = dialogueLine.replace('________', alt);

      // Check if alternative creates valid sentence structure
      const validity = validateSentenceStructure(substituted);

      if (!validity.valid) {
        const confidence = scoreConfidence({
          issueType: 'contextual-fit',
          affectedText: alt,
          suggestedFix: undefined,
          ruleCertainty: 0.75
        });

        findings.push({
          validatorName: 'Contextual Substitution Validator',
          scenarioId: scenario.id,
          location: `answerVariations[${av.index}].alternatives[${i}]`,
          issue: 'Alternative does not fit context',
          currentValue: alt,
          suggestedValue: undefined,
          context: dialogueLine,
          confidence: confidence.score,
          reasoning: `${validity.reason}. Sentence: "${substituted}"`
        });
      }

      // Check semantic compatibility (does the alternative make sense?)
      const semantic = validateSemanticFit(substituted, alt, av.answer);
      if (!semantic.valid) {
        const confidence = scoreConfidence({
          issueType: 'contextual-fit',
          affectedText: alt,
          suggestedFix: undefined,
          ruleCertainty: 0.65
        });

        findings.push({
          validatorName: 'Contextual Substitution Validator',
          scenarioId: scenario.id,
          location: `answerVariations[${av.index}].alternatives[${i}]`,
          issue: 'Alternative does not maintain meaning',
          currentValue: alt,
          suggestedValue: undefined,
          context: dialogueLine,
          confidence: confidence.score,
          reasoning: `${semantic.reason}. Alternative "${alt}" vs main answer "${av.answer}"`
        });
      }
    }
  }

  return findings;
}

/**
 * Validate basic sentence structure when alternative is substituted
 * Returns validation result with reason if invalid
 */
function validateSentenceStructure(sentence: string): { valid: boolean; reason: string } {
  // Check 1: No duplicate words within 2 positions (except articles, prepositions)
  const words = sentence.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'of', 'is', 'are']);

  for (let i = 0; i < words.length - 1; i++) {
    if (stopWords.has(words[i])) continue;

    for (let j = i + 1; j <= Math.min(i + 2, words.length - 1); j++) {
      if (words[i] === words[j] && words[i].length > 2) {
        return {
          valid: false,
          reason: `Duplicate word "${words[i]}" creates redundancy`
        };
      }
    }
  }

  // Check 2: No double negatives
  const negatives = ['no', 'not', 'none', "n't", 'never', 'neither', 'nothing', 'nobody'];
  let negativeCount = 0;

  for (const neg of negatives) {
    if (sentence.toLowerCase().includes(neg)) {
      negativeCount++;
    }
  }

  if (negativeCount >= 2) {
    return {
      valid: false,
      reason: `Double negative detected (${negativeCount} negations found)`
    };
  }

  // Check 3: No unmatched quotes or parentheses
  const openQuotes = (sentence.match(/"/g) || []).length;
  const openParens = (sentence.match(/\(/g) || []).length;
  const closeParens = (sentence.match(/\)/g) || []).length;

  if (openQuotes % 2 !== 0 || openParens !== closeParens) {
    return {
      valid: false,
      reason: `Unmatched punctuation (quotes or parentheses)`
    };
  }

  // Check 4: No fragment patterns (e.g., starting with conjunction or ending abruptly)
  if (/^\s*(and|or|but|because)\s+/i.test(sentence)) {
    return {
      valid: false,
      reason: `Sentence starts with conjunction (possible fragment)`
    };
  }

  // Check 5: Reasonable sentence length (not too short)
  if (words.length < 3) {
    return {
      valid: false,
      reason: `Sentence too short (${words.length} words)`
    };
  }

  return { valid: true, reason: '' };
}

/**
 * Validate semantic fit: does the alternative make sense in context?
 * Compare semantic characteristics with main answer
 */
function validateSemanticFit(
  substitutedSentence: string,
  alternative: string,
  mainAnswer: string
): { valid: boolean; reason: string } {
  // Check 1: Part of speech consistency
  // If main answer is a noun, alternative should be a noun
  const mainIsNoun = isLikelyNoun(mainAnswer);
  const altIsNoun = isLikelyNoun(alternative);

  if (mainIsNoun && !altIsNoun) {
    return {
      valid: false,
      reason: `Alternative "${alternative}" is not a noun, but main answer "${mainAnswer}" is`
    };
  }

  const mainIsAdjective = isLikelyAdjective(mainAnswer);
  const altIsAdjective = isLikelyAdjective(alternative);

  if (mainIsAdjective && !altIsAdjective) {
    return {
      valid: false,
      reason: `Alternative "${alternative}" is not an adjective, but main answer "${mainAnswer}" is`
    };
  }

  // Check 2: Tense/aspect consistency for verbs
  const mainIsVerb = isLikelyVerb(mainAnswer);
  const altIsVerb = isLikelyVerb(alternative);

  if (mainIsVerb && !altIsVerb) {
    return {
      valid: false,
      reason: `Alternative "${alternative}" is not a verb, but main answer "${mainAnswer}" is`
    };
  }

  // Check 3: Formality/register alignment
  const mainFormality = estimateFormality(mainAnswer);
  const altFormality = estimateFormality(alternative);

  // Allow some formality variation, but flag extreme mismatches
  if (Math.abs(mainFormality - altFormality) > 0.6) {
    return {
      valid: false,
      reason: `Formality mismatch: "${mainAnswer}" (${mainFormality.toFixed(1)}) vs "${alternative}" (${altFormality.toFixed(1)})`
    };
  }

  // Check 4: Common semantic errors
  // Slang in formal dialogue
  const formalMarkers = ['formal', 'professional', 'business', 'manager', 'interview'];
  const isFormalContext = formalMarkers.some(m =>
    substitutedSentence.toLowerCase().includes(m)
  );

  if (isFormalContext && isSlangTerm(alternative)) {
    return {
      valid: false,
      reason: `Slang term "${alternative}" inappropriate in formal context`
    };
  }

  return { valid: true, reason: '' };
}

/**
 * Simple heuristic: is this word likely a noun?
 */
function isLikelyNoun(word: string): boolean {
  // Words that commonly end with noun suffixes
  const nounEndings = ['tion', 'ment', 'ness', 'ity', 'er', 'or', 'ist', 'ism', 'ship'];
  const lower = word.toLowerCase();

  if (nounEndings.some(ending => lower.endsWith(ending))) {
    return true;
  }

  // Check against common verbs and adjectives
  const commonVerbs = new Set(['be', 'have', 'do', 'say', 'go', 'know', 'take', 'see', 'come', 'think']);
  const commonAdj = new Set(['good', 'bad', 'big', 'small', 'new', 'old', 'many', 'some', 'more', 'most']);

  if (commonVerbs.has(lower) || commonAdj.has(lower)) {
    return false;
  }

  return true;
}

/**
 * Simple heuristic: is this word likely an adjective?
 */
function isLikelyAdjective(word: string): boolean {
  const lower = word.toLowerCase();

  // Adjective suffixes
  const adjEndings = ['ful', 'less', 'ous', 'ible', 'able', 'ive', 'al', 'ic', 'ed', 'en'];

  if (adjEndings.some(ending => lower.endsWith(ending))) {
    return true;
  }

  // Common adjectives
  const commonAdj = new Set(['good', 'bad', 'big', 'small', 'new', 'old', 'many', 'some', 'more', 'most',
    'happy', 'sad', 'beautiful', 'ugly', 'bright', 'dark', 'hot', 'cold']);

  return commonAdj.has(lower);
}

/**
 * Simple heuristic: is this word likely a verb?
 */
function isLikelyVerb(word: string): boolean {
  const lower = word.toLowerCase();

  // Verb forms
  if (lower.endsWith('ing') || lower.endsWith('ed')) {
    return true;
  }

  // Common verbs
  const commonVerbs = new Set(['be', 'have', 'do', 'say', 'go', 'know', 'take', 'see', 'come', 'think',
    'make', 'get', 'use', 'find', 'tell', 'ask', 'work', 'seem', 'feel', 'try']);

  return commonVerbs.has(lower);
}

/**
 * Estimate formality on 0-1 scale (0=casual, 1=formal)
 */
function estimateFormality(word: string): number {
  const formalMarkers = ['aforementioned', 'nonetheless', 'moreover', 'therefore', 'subsequently',
    'facilitate', 'leverage', 'implement', 'utilize'];
  const casualMarkers = ['cool', 'awesome', 'gonna', 'wanna', 'kinda', 'sorta', 'yeah', 'nope'];

  const lower = word.toLowerCase();

  if (formalMarkers.some(f => lower.includes(f))) {
    return 0.8;
  }

  if (casualMarkers.some(c => lower.includes(c))) {
    return 0.2;
  }

  // Default estimate based on length (longer = often more formal)
  return Math.min(0.6, word.length / 15);
}

/**
 * Check if word is slang
 */
function isSlangTerm(word: string): boolean {
  const slangTerms = new Set(['gonna', 'wanna', 'gotta', 'coulda', 'shoulda', 'woulda',
    'yeah', 'yep', 'nope', 'kinda', 'sorta', 'cool', 'awesome', 'dude', 'bro', 'mate',
    'bloody', 'crap', 'stuff', 'things']);

  return slangTerms.has(word.toLowerCase());
}

/**
 * Generate a contextual substitution report
 */
export function getContextualSubstitutionReport(scenario: RoleplayScript) {
  const findings = validateContextualSubstitution(scenario);
  const structureIssues = findings.filter(f => f.issue.includes('does not fit context'));
  const semanticIssues = findings.filter(f => f.issue.includes('does not maintain meaning'));

  return {
    scenarioId: scenario.id,
    totalIssues: findings.length,
    structureIssues: structureIssues.length,
    semanticIssues: semanticIssues.length,
    status: findings.length === 0 ? '✓ PASS' : `⚠ ${findings.length} ISSUE(S)`
  };
}
