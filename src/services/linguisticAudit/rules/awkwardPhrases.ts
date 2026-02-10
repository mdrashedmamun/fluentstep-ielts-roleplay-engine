/**
 * Awkward Phrases & Textbook English Patterns
 * Detects non-native/artificial phrasing
 */

export interface TextbookPattern {
  pattern: RegExp;
  issue: string;
  suggestions: string[];
  confidence: number;
  examples: { awkward: string; natural: string }[];
}

export const TEXTBOOK_PATTERNS: TextbookPattern[] = [
  {
    pattern: /\b(very|really|extremely)\s+(good|nice|bad|interesting)\b/i,
    issue: 'Overly simple intensifier + adjective combination',
    suggestions: ['excellent', 'wonderful', 'terrible', 'fascinating'],
    confidence: 0.8,
    examples: [
      { awkward: 'very good', natural: 'excellent' },
      { awkward: 'really nice', natural: 'lovely' },
      { awkward: 'very bad', natural: 'awful' }
    ]
  },

  {
    pattern: /\bI\s+am\s+(going\s+to|planning\s+to)/i,
    issue: 'Unnatural formality for casual speech',
    suggestions: ["I'm gonna", "I'll", "I plan to"],
    confidence: 0.75,
    examples: [
      { awkward: 'I am going to leave', natural: "I'm gonna leave" },
      { awkward: 'I am planning to visit', natural: "I'm thinking of visiting" }
    ]
  },

  {
    pattern: /\b(however|therefore|thus)\b/i,
    issue: 'Overly formal connectors in casual context',
    suggestions: ['but', 'so', 'because'],
    confidence: 0.7,
    examples: [
      { awkward: 'However, I disagree', natural: 'But I disagree' },
      { awkward: 'Therefore, I left', natural: 'So I left' }
    ]
  },

  {
    pattern: /\b(in\s+conclusion|to\s+conclude|in\s+summary)/i,
    issue: 'Essay-like closing phrases in conversation',
    suggestions: ['Anyway', 'So', 'That\'s it'],
    confidence: 0.75,
    examples: [
      { awkward: 'In conclusion, I enjoyed it', natural: 'Anyway, I really enjoyed it' },
      { awkward: 'To conclude, thanks', natural: 'So, thanks' }
    ]
  },

  {
    pattern: /\bI\s+would\s+like\s+to\s+say\b/i,
    issue: 'Textbook politeness phrase (overly formal)',
    suggestions: ['I want to say', 'I\'d like to mention', 'I think'],
    confidence: 0.75,
    examples: [
      { awkward: 'I would like to say something', natural: 'I want to say something' }
    ]
  }
];

/**
 * Find textbook patterns in text
 */
export function findTextbookPatterns(text: string): Array<{
  pattern: TextbookPattern;
  match: string;
}> {
  const issues: Array<{ pattern: TextbookPattern; match: string }> = [];

  for (const textbookPattern of TEXTBOOK_PATTERNS) {
    const matches = text.match(textbookPattern.pattern);
    if (matches) {
      for (const match of matches) {
        issues.push({ pattern: textbookPattern, match });
      }
    }
  }

  return issues;
}

/**
 * Get suggestions for a textbook pattern
 */
export function getSuggestionsForPattern(pattern: TextbookPattern): string[] {
  return pattern.suggestions;
}
