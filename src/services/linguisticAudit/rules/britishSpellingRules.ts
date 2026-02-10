/**
 * British Spelling Rules
 * Enforces -ise/-ize, -our/-or, -re/-er, and double L conventions
 */

export interface SpellingRule {
  name: string;
  pattern: RegExp;
  fix: (match: string) => string;
  confidence: number;            // 0-1, how confident the rule is
  examples: string[];
  exceptions?: string[];         // Words that don't follow the rule
}

export const BRITISH_SPELLING_RULES: SpellingRule[] = [
  {
    name: '-ize to -ise',
    pattern: /\b(\w+)ize(d|s|r|ing)?\b/gi,
    fix: (match) => {
      const base = match.replace(/ize/i, 'ise');
      return base;
    },
    confidence: 1.0,
    examples: ['realise', 'organisation', 'apologise', 'recognise', 'maximise'],
    exceptions: ['prize', 'size'] // These don't change
  },

  {
    name: '-or to -our',
    pattern: /\b(col|fav|behav|lab|neighb|hon|hum|rum|sav|flav|rigour|vigour)or\b/gi,
    fix: (match) => {
      return match.replace(/or$/, 'our');
    },
    confidence: 1.0,
    examples: ['colour', 'favour', 'behaviour', 'honour', 'rumour', 'labour'],
    exceptions: ['doctor', 'actor', 'tutor'] // Professional words keep -or
  },

  {
    name: '-er to -re',
    pattern: /\b(cent|theat|met|fib|lust|nit)er\b/gi,
    fix: (match) => {
      return match.replace(/er$/, 're');
    },
    confidence: 1.0,
    examples: ['centre', 'theatre', 'metre', 'fibre', 'lustre', 'nitre'],
    exceptions: [] // These are consistent
  },

  {
    name: 'double L before suffix',
    pattern: /\b(\w+[aeiouy])l(ing|ed|s)\b/gi,
    fix: (match) => {
      // Check for consonant before 'l'
      const base = match.replace(/(ing|ed|s)$/, '');
      if (!base.match(/[aeiouy]l$/i)) {
        return match; // consonant-l, don't double
      }
      // Vowel before l, double it
      return base.replace(/l$/, 'll') + match.slice(base.length);
    },
    confidence: 0.95,
    examples: ['travelling', 'cancelled', 'modelling', 'levelled', 'rebelled'],
    exceptions: ['gas', 'bus', 'plus'] // Short words might not double
  }
];

/**
 * Check if a word needs British spelling correction
 */
export function needsSpellingFix(word: string): SpellingRule | null {
  for (const rule of BRITISH_SPELLING_RULES) {
    if (rule.pattern.test(word)) {
      // Check exceptions
      if (rule.exceptions && rule.exceptions.some(e => word.toLowerCase().includes(e.toLowerCase()))) {
        return null;
      }
      return rule;
    }
  }
  return null;
}

/**
 * Apply a spelling rule to a word
 */
export function applySpellingFix(word: string, rule: SpellingRule): string {
  return word.replace(rule.pattern, rule.fix);
}

/**
 * Find all spelling issues in a text
 */
export function findSpellingIssues(text: string): Array<{
  word: string;
  rule: SpellingRule;
  fixed: string;
}> {
  const issues: Array<{ word: string; rule: SpellingRule; fixed: string }> = [];

  // Split into words but preserve spacing
  const words = text.match(/\b\w+\b/g) || [];

  for (const word of words) {
    const rule = needsSpellingFix(word);
    if (rule) {
      const fixed = applySpellingFix(word, rule);
      if (fixed !== word) {
        issues.push({ word, rule, fixed });
      }
    }
  }

  return issues;
}
