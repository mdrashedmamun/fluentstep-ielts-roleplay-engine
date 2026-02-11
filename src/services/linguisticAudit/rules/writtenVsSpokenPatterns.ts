/**
 * Written vs Spoken Patterns Detector
 *
 * Identifies essay-like language that sounds "written not spoken"
 * and suggests more natural conversational alternatives
 */

export interface WrittenVsSpokenIssue {
  match: string;
  pattern: {
    issue: string;
    suggestions: string[];
  };
}

/**
 * Essay linking phrases that should be avoided in spoken dialogue
 */
const ESSAY_LINKING_PHRASES = [
  {
    pattern: /\bMoreover\b/gi,
    issue: 'Essay linking phrase',
    suggestions: ['And', 'Also', 'Plus']
  },
  {
    pattern: /\bFurthermore\b/gi,
    issue: 'Essay linking phrase',
    suggestions: ['And', 'Besides', 'Plus']
  },
  {
    pattern: /\bNevertheless\b/gi,
    issue: 'Essay linking phrase',
    suggestions: ['But', 'Still', 'Though']
  },
  {
    pattern: /\bConversely\b/gi,
    issue: 'Essay linking phrase',
    suggestions: ['But', 'On the other hand']
  },
  {
    pattern: /\bIn conclusion\b/gi,
    issue: 'Essay closing phrase',
    suggestions: ['Anyway', 'So', 'In the end']
  },
  {
    pattern: /\bIn summary\b/gi,
    issue: 'Essay closing phrase',
    suggestions: ['So basically', 'To sum up', 'That\'s basically it']
  },
  {
    pattern: /\bFurther to\b/gi,
    issue: 'Overly formal phrase',
    suggestions: ['Following on from', 'About', 'Following']
  },
  {
    pattern: /\bWithin the context of\b/gi,
    issue: 'Overly formal construction',
    suggestions: ['When it comes to', 'With', 'In']
  },
  {
    pattern: /\bCertainly,\s+it\s+is\s+the\s+case\s+that\b/gi,
    issue: 'Overly formal and wordy',
    suggestions: ['Indeed', 'Certainly', 'True']
  },
  {
    pattern: /\bIt\s+could\s+be\s+argued\s+that\b/gi,
    issue: 'Academic hedging, too formal',
    suggestions: ['You could say that', 'It\'s arguable that', 'Some people think']
  }
];

/**
 * Overly formal constructions in casual/social contexts
 */
const OVERLY_FORMAL_CONSTRUCTIONS = [
  {
    pattern: /\bI\s+would\s+appreciate\s+if\s+you\s+could\b/gi,
    issue: 'Overly formal request',
    suggestions: ['Could you', 'Can you', 'Would you mind']
  },
  {
    pattern: /\bI\s+must\s+confess\b/gi,
    issue: 'Overly formal confession',
    suggestions: ['I have to admit', 'To be honest', 'I\'ll be honest']
  },
  {
    pattern: /\bI\s+would\s+like\s+to\s+inquire\b/gi,
    issue: 'Overly formal question',
    suggestions: ['Can I ask', 'I\'d like to know', 'Could you tell me']
  },
  {
    pattern: /\bPrior\s+to\b/gi,
    issue: 'Formal time reference',
    suggestions: ['Before', 'Earlier']
  },
  {
    pattern: /\bSubsequent\s+to\b/gi,
    issue: 'Formal time reference',
    suggestions: ['After', 'Later']
  },
  {
    pattern: /\bI\s+would\s+beg\s+to\s+differ\b/gi,
    issue: 'Overly formal disagreement',
    suggestions: ['I disagree', 'I don\'t think so', 'Actually, I think']
  }
];

/**
 * Robotic politeness phrases (too formal for social contexts)
 */
const ROBOTIC_POLITENESS = [
  {
    pattern: /\bI\s+sincerely\s+apologize\b/gi,
    issue: 'Robotic politeness',
    suggestions: ['Sorry', 'I\'m sorry', 'My bad']
  },
  {
    pattern: /\bI\s+apologize\s+for\s+the\s+inconvenience\s+caused\b/gi,
    issue: 'Robotic politeness',
    suggestions: ['Sorry about that', 'My apologies']
  },
  {
    pattern: /\bI\s+regret\s+to\s+inform\s+you\b/gi,
    issue: 'Robotic politeness',
    suggestions: ['I\'m afraid', 'Unfortunately', 'I\'m sorry']
  },
  {
    pattern: /\bPlease\s+accept\s+my\s+apologies\b/gi,
    issue: 'Robotic politeness',
    suggestions: ['Sorry about that', 'I apologize']
  },
  {
    pattern: /\bI\s+would\s+like\s+to\s+express\s+my\s+gratitude\b/gi,
    issue: 'Robotic gratitude',
    suggestions: ['Thanks', 'Thank you', 'I appreciate it']
  },
  {
    pattern: /\bThank\s+you\s+very\s+much\s+indeed\b/gi,
    issue: 'Overly formal thanks',
    suggestions: ['Thanks', 'Thank you', 'Cheers']
  }
];

/**
 * Academic hedging in casual contexts
 */
const ACADEMIC_HEDGING = [
  {
    pattern: /\bit\s+would\s+appear\s+that\b/gi,
    issue: 'Academic hedging',
    suggestions: ['It seems', 'It looks like', 'Apparently']
  },
  {
    pattern: /\bIt\s+could\s+be\s+suggested\s+that\b/gi,
    issue: 'Academic hedging',
    suggestions: ['You could say', 'It seems', 'You might think']
  },
  {
    pattern: /\bOne\s+might\s+argue\b/gi,
    issue: 'Academic hedging',
    suggestions: ['You could argue', 'Some people might say']
  },
  {
    pattern: /\bIn\s+light\s+of\s+the\s+aforementioned\b/gi,
    issue: 'Academic reference',
    suggestions: ['Given what I said', 'Based on that']
  }
];

/**
 * Wordy constructions that should be simplified
 */
const WORDY_CONSTRUCTIONS = [
  {
    pattern: /\bat\s+this\s+point\s+in\s+time\b/gi,
    issue: 'Wordy time reference',
    suggestions: ['Now', 'At this point', 'Right now']
  },
  {
    pattern: /\bdue\s+to\s+the\s+fact\s+that\b/gi,
    issue: 'Wordy causal connector',
    suggestions: ['Because', 'Since']
  },
  {
    pattern: /\bin\s+order\s+to\b/gi,
    issue: 'Can often be simplified',
    suggestions: ['To', 'So that']
  },
  {
    pattern: /\bfor\s+the\s+purpose\s+of\b/gi,
    issue: 'Wordy explanation',
    suggestions: ['To', 'For']
  },
  {
    pattern: /\bwith\s+regard\s+to\b/gi,
    issue: 'Formal construction',
    suggestions: ['About', 'Regarding', 'Concerning']
  },
  {
    pattern: /\bas\s+far\s+as.*?is\s+concerned\b/gi,
    issue: 'Wordy construction',
    suggestions: ['When it comes to', 'As for']
  }
];

/**
 * Find written vs spoken issues in text
 */
export function findWrittenVsSpokenIssues(text: string): WrittenVsSpokenIssue[] {
  const issues: WrittenVsSpokenIssue[] = [];

  const allPatterns = [
    ...ESSAY_LINKING_PHRASES,
    ...OVERLY_FORMAL_CONSTRUCTIONS,
    ...ROBOTIC_POLITENESS,
    ...ACADEMIC_HEDGING,
    ...WORDY_CONSTRUCTIONS
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
 * Check if text "sounds written not spoken"
 */
export function soundsWritten(text: string): {
  isWritten: boolean;
  score: number;
  issues: WrittenVsSpokenIssue[];
} {
  const issues = findWrittenVsSpokenIssues(text);

  // Score based on density of issues
  // More issues = more written
  const wordCount = text.split(/\s+/).length;
  const issueScore = issues.length / (wordCount / 100); // Issues per 100 words

  return {
    isWritten: issueScore > 0.5,  // If more than 0.5 issues per 100 words, sounds written
    score: Math.min(issueScore, 1.0),
    issues
  };
}

/**
 * Get detection report
 */
export function getWrittenVsSpokenReport(
  text: string,
  scenarioContext: string = ''
): string {
  const analysis = soundsWritten(text);
  const lines = [
    `Text: "${text}"`,
    `Written Score: ${(analysis.score * 100).toFixed(0)}%`,
    analysis.isWritten ? '⚠️ Sounds written, not spoken' : '✓ Sounds natural',
    `Issues found: ${analysis.issues.length}`,
    ...analysis.issues.map(issue => `  - ${issue.match}: ${issue.pattern.issue}`)
  ];

  return lines.join('\n');
}
