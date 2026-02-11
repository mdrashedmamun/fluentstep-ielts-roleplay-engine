/**
 * Exam Language Patterns Detector
 *
 * Identifies IELTS speaking test language and other formal patterns
 * that shouldn't appear in natural role-play conversations
 */

export interface ExamLanguageIssue {
  match: string;
  pattern: {
    issue: string;
    suggestions: string[];
  };
}

/**
 * "In my opinion" / "I strongly believe" patterns - IELTS structured response
 */
const STRUCTURED_OPINION_PHRASES = [
  {
    pattern: /\bIn\s+my\s+opinion\b/gi,
    issue: 'Exam speaking phrase',
    suggestions: ['I think', 'I reckon', "I'd say"]
  },
  {
    pattern: /\bIn\s+my\s+view\b/gi,
    issue: 'Exam speaking phrase',
    suggestions: ['I think', 'I reckon', 'My view is']
  },
  {
    pattern: /\bPersonally,\s+I\s+believe\b/gi,
    issue: 'Exam speaking phrase',
    suggestions: ['I believe', 'I think', 'I reckon']
  },
  {
    pattern: /\bI\s+strongly\s+believe\b/gi,
    issue: 'Overly emphatic',
    suggestions: ['I really believe', 'I definitely think', 'I really think']
  },
  {
    pattern: /\bI\s+am\s+convinced\s+that\b/gi,
    issue: 'Exam speaking phrase',
    suggestions: ['I\'m sure that', 'I believe that', 'I reckon']
  }
];

/**
 * "It is important to note" / "Key points" - Formal essay structure
 */
const FORMAL_MARKERS = [
  {
    pattern: /\bIt\s+is\s+important\s+to\s+note\b/gi,
    issue: 'Formal marker',
    suggestions: ['The thing is', 'What\'s important is', 'The key thing is']
  },
  {
    pattern: /\bIt\s+is\s+worth\s+noting\b/gi,
    issue: 'Formal marker',
    suggestions: ['Worth mentioning', 'The thing is', 'Actually']
  },
  {
    pattern: /\bA\s+key\s+point\s+is\b/gi,
    issue: 'Formal marker',
    suggestions: ['The thing is', 'The main thing is', 'What I mean is']
  },
  {
    pattern: /\bA\s+significant\s+factor\b/gi,
    issue: 'Academic language',
    suggestions: ['An important thing', 'Something important', 'The thing is']
  }
];

/**
 * Hedging language specific to IELTS exams
 */
const EXAM_HEDGING = [
  {
    pattern: /\bTo\s+some\s+extent\b/gi,
    issue: 'IELTS hedging phrase',
    suggestions: ['Kind of', 'Sort of', 'In a way']
  },
  {
    pattern: /\bIt\s+could\s+be\s+argued\b/gi,
    issue: 'IELTS hedging phrase',
    suggestions: ['You could say', 'Some people think', 'It\'s arguable']
  },
  {
    pattern: /\bOne\s+could\s+say\b/gi,
    issue: 'IELTS hedging phrase',
    suggestions: ['You could say', 'Some people might say']
  },
  {
    pattern: /\bTo\s+a\s+certain\s+extent\b/gi,
    issue: 'IELTS hedging phrase',
    suggestions: ['In a way', 'Sort of', 'Kind of']
  }
];

/**
 * Abstract, non-committal language (avoid in natural speech)
 */
const ABSTRACT_LANGUAGE = [
  {
    pattern: /\bthe\s+general\s+public\b/gi,
    issue: 'Abstract term, too formal',
    suggestions: ['most people', 'ordinary people', 'regular people']
  },
  {
    pattern: /\bmany\s+individuals\b/gi,
    issue: 'Abstract term, too formal',
    suggestions: ['a lot of people', 'most people']
  },
  {
    pattern: /\bthe\s+vast\s+majority\b/gi,
    issue: 'Abstract term, too formal',
    suggestions: ['most people', 'most of us']
  },
  {
    pattern: /\bcontemporary\s+society\b/gi,
    issue: 'Abstract academic term',
    suggestions: ['today', 'now', 'these days']
  },
  {
    pattern: /\bthe\s+modern\s+world\b/gi,
    issue: 'Abstract academic term',
    suggestions: ['today', 'nowadays', 'these days']
  }
];

/**
 * Overly complex sentence structures (sign of essay writing)
 */
const COMPLEX_STRUCTURES = [
  {
    pattern: /\b[A-Za-z\s]+,\s+which\s+(?:is|are)\s+[A-Za-z]+,\s+[A-Za-z]/gi,
    issue: 'Complex relative clause (sounds written)',
    suggestions: ['Break into simpler sentences', 'Use more direct language']
  }
];

/**
 * First-person academic language
 */
const ACADEMIC_FIRST_PERSON = [
  {
    pattern: /\bI\s+would\s+like\s+to\s+address\b/gi,
    issue: 'Academic framing',
    suggestions: ['I\'d like to talk about', 'I want to say']
  },
  {
    pattern: /\bI\s+would\s+like\s+to\s+elaborate\b/gi,
    issue: 'Academic framing',
    suggestions: ['Let me explain', 'I\'ll tell you more', 'I should explain']
  },
  {
    pattern: /\bI\s+would\s+like\s+to\s+emphasize\b/gi,
    issue: 'Academic framing',
    suggestions: ['I want to make clear', 'Let me be clear', 'The thing is']
  }
];

/**
 * Generalized statements (IELTS discussion style)
 */
const GENERALIZED_STATEMENTS = [
  {
    pattern: /\bPeople\s+(?:often|usually|generally|tend\s+to)/gi,
    issue: 'Generalized statement',
    suggestions: ['Some people', 'A lot of people', 'Many people']
  },
  {
    pattern: /\bSociety\s+(?:needs|requires|demands)/gi,
    issue: 'Generalized statement',
    suggestions: ['We need', 'People need', 'Most of us need']
  }
];

/**
 * Find exam language issues in text
 */
export function findExamLanguageIssues(text: string): ExamLanguageIssue[] {
  const issues: ExamLanguageIssue[] = [];

  const allPatterns = [
    ...STRUCTURED_OPINION_PHRASES,
    ...FORMAL_MARKERS,
    ...EXAM_HEDGING,
    ...ABSTRACT_LANGUAGE,
    ...ACADEMIC_FIRST_PERSON,
    ...GENERALIZED_STATEMENTS
  ];

  for (const patternDef of allPatterns) {
    const matches = text.match(patternDef.pattern);
    if (matches) {
      for (const match of matches) {
        issues.push({
          match,
          pattern: {
            issue: patternDef.issue,
            suggestions: patternDef.suggestions
          }
        });
      }
    }
  }

  return issues;
}

/**
 * Check if text uses exam language
 */
export function usesExamLanguage(text: string): {
  usesExam: boolean;
  score: number;
  issues: ExamLanguageIssue[];
} {
  const issues = findExamLanguageIssues(text);

  // Score based on density of exam language
  const wordCount = text.split(/\s+/).length;
  const examScore = issues.length / (wordCount / 100); // Issues per 100 words

  return {
    usesExam: examScore > 0.3,  // If more than 0.3 exam phrases per 100 words
    score: Math.min(examScore, 1.0),
    issues
  };
}

/**
 * Check if text uses robotic/artificial politeness
 */
export function usesRoboticPoliteness(text: string): {
  isRobotic: boolean;
  patterns: string[];
} {
  const roboticPatterns = [
    /\bI\s+sincerely\s+apologize\b/gi,
    /\bI\s+regret\s+to\s+inform\b/gi,
    /\bI\s+would\s+like\s+to\s+express\s+my\s+gratitude\b/gi,
    /\bPlease\s+accept\s+my\s+apologies\b/gi,
    /\bThank\s+you\s+very\s+much\s+indeed\b/gi,
    /\bI\s+would\s+appreciate\s+if\b/gi
  ];

  const found = roboticPatterns
    .map(pattern => text.match(pattern))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map(match => match[0]);

  return {
    isRobotic: found.length > 0,
    patterns: found
  };
}

/**
 * Get exam language report
 */
export function getExamLanguageReport(text: string): string {
  const examAnalysis = usesExamLanguage(text);
  const politenessAnalysis = usesRoboticPoliteness(text);

  const lines = [
    `Text: "${text}"`,
    `Exam Language Score: ${(examAnalysis.score * 100).toFixed(0)}%`,
    examAnalysis.usesExam ? '⚠️ Contains exam language' : '✓ Natural tone',
    `Issues found: ${examAnalysis.issues.length}`,
    ...examAnalysis.issues
      .slice(0, 5)
      .map(issue => `  - "${issue.match}": ${issue.pattern.issue}`)
  ];

  if (politenessAnalysis.isRobotic) {
    lines.push('');
    lines.push('🤖 Robotic politeness detected:');
    lines.push(...politenessAnalysis.patterns.map(p => `  - "${p}"`));
  }

  return lines.join('\n');
}
