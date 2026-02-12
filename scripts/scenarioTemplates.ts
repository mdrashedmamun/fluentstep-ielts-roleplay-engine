/**
 * Dialogue Templates for Scenario Creator Agent
 * Category-specific templates to bootstrap scenario generation
 *
 * Each template provides:
 * - Opening turn structure
 * - Middle dialogue pattern
 * - Closing turn structure
 * - Suggested blank locations (marked with [BLANK])
 */

/**
 * Difficulty Constraints
 * Map IELTS bands to generation parameters
 */
export const difficultyConstraints = {
  B1: {
    name: 'Elementary (Band 4-5)',
    maxSentenceLength: 20,
    avgSentenceLength: 12,
    targetBlankDensity: 0.15, // 1 blank per 6-7 words
    maxAlternatives: 2,
    vocabularyLevel: 'highFrequency',
    chunkComplexity: 'simple',
    description: 'Simple vocabulary, short sentences, high frequency phrases',
    constraints: {
      avoidIdioms: true,
      avoidPhraseVerbs: false, // Some common ones OK
      preferBasicTenses: true,
      sentenceStructure: 'Simple + compound'
    }
  },

  B2: {
    name: 'Intermediate (Band 6-7)',
    maxSentenceLength: 25,
    avgSentenceLength: 16,
    targetBlankDensity: 0.18, // 1 blank per 5-6 words
    maxAlternatives: 3,
    vocabularyLevel: 'intermediate',
    chunkComplexity: 'moderate',
    description: 'Varied vocabulary, moderate complexity, phrasal verbs allowed',
    constraints: {
      avoidIdioms: false,
      avoidPhraseVerbs: false,
      preferBasicTenses: false,
      sentenceStructure: 'Compound + complex'
    }
  },

  C1: {
    name: 'Advanced (Band 7-8)',
    maxSentenceLength: 30,
    avgSentenceLength: 20,
    targetBlankDensity: 0.20, // 1 blank per 5 words
    maxAlternatives: 3,
    vocabularyLevel: 'advanced',
    chunkComplexity: 'sophisticated',
    description: 'Sophisticated language, complex structures, idiomatic expressions',
    constraints: {
      avoidIdioms: false,
      avoidPhraseVerbs: false,
      preferBasicTenses: false,
      sentenceStructure: 'Complex + mixed structures'
    }
  },

  C2: {
    name: 'Mastery (Band 8-9)',
    maxSentenceLength: 35,
    avgSentenceLength: 24,
    targetBlankDensity: 0.22, // 1 blank per 4-5 words
    maxAlternatives: 4,
    vocabularyLevel: 'mastery',
    chunkComplexity: 'nuanced',
    description: 'Nuanced expression, sophisticated idioms, fluent natural speech',
    constraints: {
      avoidIdioms: false,
      avoidPhraseVerbs: false,
      preferBasicTenses: false,
      sentenceStructure: 'All structures, highly varied'
    }
  }
};

/**
 * Helper function to validate dialogue against difficulty constraints
 */
export function validateDifficultyConstraints(
  dialogue: string,
  difficulty: keyof typeof difficultyConstraints
): {
  isValid: boolean;
  violations: string[];
  metrics: {
    sentenceCount: number;
    avgSentenceLength: number;
    blankDensity: number;
    wordCount: number;
  };
} {
  const constraints = difficultyConstraints[difficulty];
  const violations: string[] = [];

  // Split into sentences (rough heuristic)
  const sentences = dialogue.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = dialogue.split(/\s+/);
  const wordCount = words.length;
  const blankCount = (dialogue.match(/____/g) || []).length;
  const blankDensity = blankCount / wordCount;

  // Calculate metrics
  const avgSentenceLength = Math.round(wordCount / sentences.length);
  const maxSentenceLength = Math.max(
    ...sentences.map(s => s.trim().split(/\s+/).length)
  );

  // Check constraints
  if (maxSentenceLength > constraints.maxSentenceLength) {
    violations.push(
      `Sentence too long: ${maxSentenceLength} words (max ${constraints.maxSentenceLength} for ${difficulty})`
    );
  }

  if (blankDensity < constraints.targetBlankDensity * 0.8) {
    violations.push(
      `Too few blanks: ${blankCount} blanks (target ${Math.round(constraints.targetBlankDensity * wordCount)} for ${difficulty})`
    );
  }

  if (blankDensity > constraints.targetBlankDensity * 1.2) {
    violations.push(
      `Too many blanks: ${blankCount} blanks (target ${Math.round(constraints.targetBlankDensity * wordCount)} for ${difficulty})`
    );
  }

  return {
    isValid: violations.length === 0,
    violations,
    metrics: {
      sentenceCount: sentences.length,
      avgSentenceLength,
      blankDensity: Math.round(blankDensity * 1000) / 1000,
      wordCount
    }
  };
}

export const dialogueTemplates = {
  Social: {
    description: "Everyday conversations with friends, acquaintances, or new people",
    opening: `Person A: Hi, how are you?
Person B: I'm doing well, thanks for asking. How about you?
Person A: Great! I wanted to [BLANK] with you about something.`,
    middle: `Person B: Sure, I'd be happy to hear about it.
Person A: So, I [BLANK] that we could [BLANK] this weekend.
Person B: That sounds like a good idea. What did you have in mind?`,
    closing: `Person A: Well, I was thinking we could [BLANK].
Person B: That would be brilliant! Let's [BLANK].
Person A: Brilliant, thanks so much for your time!`,
    suggestedBlanks: ["catch up", "was thinking", "do something fun", "go out for coffee", "make a plan"],
    difficulty: "B2"
  },

  Workplace: {
    description: "Professional settings - meetings, interviews, performance reviews, team discussions",
    opening: `Person A: Good morning. Thanks for making time for this.
Person B: Of course. I'm happy to [BLANK].
Person A: Great. I wanted to [BLANK] about your progress this quarter.`,
    middle: `Person B: I appreciate that. I've been working on [BLANK].
Person A: That's excellent. Can you [BLANK] more about your approach?
Person B: Absolutely. We [BLANK] that the best way forward was...`,
    closing: `Person A: I see your point. [BLANK] for the update.
Person B: Thanks for the feedback. What [BLANK] do you need from me?
Person A: Just keep up the great work. [BLANK].`,
    suggestedBlanks: ["help", "touch base", "several objectives", "tell me", "decided", "Thanks", "would be helpful", "We'll check in soon"],
    difficulty: "B2"
  },

  "Service/Logistics": {
    description: "Customer service interactions - restaurants, hotels, shops, airports, travel",
    opening: `Person A: Good afternoon. [BLANK] I help you?
Person B: Yes, thank you. I'd like to [BLANK].
Person A: Of course. Let me [BLANK] your request.`,
    middle: `Person B: I [BLANK] a table for four tonight.
Person A: Certainly. What time would you [BLANK]?
Person B: Around 7 PM, if that's [BLANK].`,
    closing: `Person A: Perfect. I [BLANK] confirm your reservation.
Person B: Great. Do I need to [BLANK] anything?
Person A: No, just [BLANK] 15 minutes early. Thank you!`,
    suggestedBlanks: ["Can", "place an order", "confirm", "need", "prefer", "possible", "can", "bring anything", "arrive"],
    difficulty: "B2"
  },

  Healthcare: {
    description: "Medical settings - doctor's office, pharmacy, hospital, health appointments",
    opening: `Person A: Good morning. What brings you in today?
Person B: I've been [BLANK] some symptoms lately.
Person A: I'm sorry to hear that. Can you [BLANK] more?`,
    middle: `Person B: Yes. I've had a persistent [BLANK].
Person A: How long have you had this [BLANK]?
Person B: About [BLANK] now. It's been quite bothersome.`,
    closing: `Person A: I recommend [BLANK] these measures for now.
Person B: Should I [BLANK] if it doesn't improve?
Person A: Yes, definitely [BLANK] if you don't see improvement in a week.`,
    suggestedBlanks: ["experiencing", "tell me", "headache", "problem", "two weeks", "taking", "contact us", "come back"],
    difficulty: "B2"
  },

  Community: {
    description: "Civic engagement - libraries, government services, community groups, social organizations",
    opening: `Person A: Hello! Welcome to our community centre. [BLANK] I help you today?
Person B: Yes, I'm interested in [BLANK].
Person A: That's wonderful. Let me [BLANK] you with some information.`,
    middle: `Person B: I [BLANK] more about the programs you offer.
Person A: We have several options. What [BLANK] you most?
Person B: I'm [BLANK] in volunteer opportunities.`,
    closing: `Person A: I can definitely [BLANK] you with that.
Person B: That would be [BLANK]. When can I start?
Person A: Let me [BLANK] your details and we'll [BLANK].`,
    suggestedBlanks: ["Can", "volunteering", "provide", "would like", "interests", "interested", "help", "fantastic", "take", "get in touch"],
    difficulty: "B2"
  },

  Academic: {
    description: "University settings - tutorials, lectures, research discussions, office hours",
    opening: `Person A: Hi, thanks for coming by my office. How can I help?
Person B: I wanted to [BLANK] about my essay.
Person A: Of course. What [BLANK] would you like to discuss?`,
    middle: `Person B: I'm [BLANK] with how to structure my argument.
Person A: That's a common challenge. Have you [[BLANK] any examples?
Person B: Yes, I've looked at a few, but I [BLANK] clarification.`,
    closing: `Person A: I think you're on the [BLANK] track.
Person B: Thanks. This really helped [[BLANK]] my understanding.
Person A: Happy to help. [BLANK] in if you have more questions.`,
    suggestedBlanks: ["discuss", "aspects", "struggling", "looked at", "need", "right", "clarify", "Check"],
    difficulty: "C1"
  },

  Cultural: {
    description: "Cross-cultural interactions - cultural events, traditions, exchange programs, international settings",
    opening: `Person A: Welcome! I'm so [[BLANK]] you could make it.
Person B: Thank you for inviting me. I'm [[BLANK]] to learn more about your culture.
Person A: That's wonderful. [[BLANK]] let me show you around.`,
    middle: `Person B: This is absolutely fascinating. What [[BLANK]] this tradition?
Person A: It's been part of our culture for centuries. [[BLANK]] very important to us.
Person B: I can see why. How do you typically [[BLANK]]?`,
    closing: `Person A: I'm so glad you enjoyed it. [[BLANK]] come again anytime.
Person B: I absolutely will. This has been an incredible experience.
Person A: The pleasure was ours. [[BLANK]] for coming!`,
    suggestedBlanks: ["delighted", "eager", "Please", "sparked", "It's", "celebrate", "Please", "Thanks"],
    difficulty: "B2"
  }
};

/**
 * ChunkFeedback Template Library
 * Pre-built feedback for common chunks across categories
 */
export const chunkFeedbackTemplates = {
  Openers: [
    {
      chunk: "I wanted to",
      meaning: "A polite way to introduce your topic or purpose",
      useWhen: "Professional contexts when you want to clearly state your intention",
      commonWrong: "I want to (too direct, less polite)",
      fix: "Add 'ed': 'I wanted to' = past tense that sounds more thoughtful",
      whyOdd: "Uses past tense to soften present intent - very British, very polite",
      examples: [
        {
          native: "I wanted to discuss your performance",
          wrong: "I want to discuss your performance"
        }
      ]
    },
    {
      chunk: "thanks for making time",
      meaning: "Appreciating someone for scheduling a meeting with you",
      useWhen: "Professional settings when opening a meeting",
      commonWrong: "thanks for time (misses 'making' which shows active effort)",
      fix: "Use 'making time' - emphasizes the person's effort to fit you in",
      whyOdd: "Phrasal verb 'make time' = actively prioritizing someone",
      examples: [
        {
          native: "Thanks for making time for this meeting",
          wrong: "Thanks for your time for this meeting"
        }
      ]
    }
  ],

  Softening: [
    {
      chunk: "I see your point",
      meaning: "Acknowledging the other person's opinion before disagreeing",
      useWhen: "When you disagree but want to maintain the relationship",
      commonWrong: "I understand (less personal, too neutral)",
      fix: "'See your point' = I comprehend AND acknowledge your perspective",
      whyOdd: "Uses 'see' metaphorically - 'point' = argument/perspective",
      examples: [
        {
          native: "I see your point, but I'd suggest...",
          wrong: "I understand, but..."
        }
      ]
    }
  ],

  Repair: [
    {
      chunk: "let me clarify",
      meaning: "Fixing a misunderstanding by explaining more clearly",
      useWhen: "When someone has misunderstood you",
      commonWrong: "I need to explain (less direct, weaker)",
      fix: "'Let me clarify' = active invitation for them to understand better",
      whyOdd: "Uses 'clarify' = make clear, implies there was confusion",
      examples: [
        {
          native: "Let me clarify what I meant",
          wrong: "I need to explain what I meant"
        }
      ]
    }
  ],

  Exit: [
    {
      chunk: "thanks for the update",
      meaning: "Appreciating someone for providing new information",
      useWhen: "Professional settings when ending a conversation",
      commonWrong: "thanks for telling me (more casual)",
      fix: "'Update' = formal word for news/information",
      whyOdd: "Signals the information was useful and time was well-spent",
      examples: [
        {
          native: "Thanks for the update. I appreciate it.",
          wrong: "Thanks for telling me. I appreciate it."
        }
      ]
    }
  ],

  Idioms: [
    {
      chunk: "touch base",
      meaning: "Have a brief discussion or check in with someone",
      useWhen: "Professional settings when initiating contact",
      commonWrong: "'touch a base' or 'touch the base' (incorrect articles)",
      fix: "Use as phrasal verb: 'base' is object, no article",
      whyOdd: "Comes from baseball - making contact with the base",
      examples: [
        {
          native: "Let's touch base next week",
          wrong: "Let's touch a base next week"
        }
      ]
    }
  ]
};

/**
 * Active Recall Question Templates
 * By difficulty level
 */
export const activeRecallTemplates = {
  B2: [
    "How would you politely open a professional discussion?",
    "What phrases show you're acknowledging someone's opinion?",
    "How do you ask for clarification without sounding rude?",
    "What's the difference between casual and formal closings?",
    "How do you disagree politely in professional settings?"
  ],

  C1: [
    "Explain the pragmatic function of past tense in polite openers like 'I wanted to'",
    "Compare direct vs indirect ways to introduce topics in formal contexts",
    "How do idiomatic expressions change the tone of professional communication?",
    "Analyze how repair strategies maintain interpersonal harmony",
    "What register shifts occur between opening and closing in formal conversations?"
  ]
};

/**
 * Category-Specific Chunk Types
 * Maps dialogue context to chunk categories
 */
export const categoryMapping = {
  Social: {
    Openers: ["Hi", "Hey", "I wanted to", "catch up"],
    Softening: ["Maybe", "I think", "somehow"],
    Exit: ["Thanks", "See you", "Catch up"]
  },
  Workplace: {
    Openers: ["I wanted to", "thanks for making time", "Good morning"],
    Softening: ["I see your point", "In my view"],
    Disagreement: ["However", "I'd suggest"],
    Repair: ["Let me clarify"],
    Exit: ["Thanks for the update"],
    Idioms: ["touch base", "on the same page"]
  },
  Healthcare: {
    Openers: ["What brings you in", "I've been experiencing"],
    Softening: ["I'm sorry to hear"],
    Repair: ["Let me ask"],
    Exit: ["Make sure to", "Come back if"]
  }
};

/**
 * Helper to auto-select chunk category based on context
 */
export function inferChunkCategory(
  chunk: string,
  context: "opening" | "middle" | "closing",
  category: string
): string {
  const openingPatterns = ["hi", "hello", "wanted to", "thanks", "good"];
  const closingPatterns = ["thanks", "great", "come", "bye"];
  const repairPatterns = ["clarify", "explain", "mean", "sorry"];
  const disagreePatterns = ["but", "however", "point", "suggest"];

  const lowerChunk = chunk.toLowerCase();

  if (context === "opening" && openingPatterns.some(p => lowerChunk.includes(p))) {
    return "Openers";
  }
  if (context === "closing" && closingPatterns.some(p => lowerChunk.includes(p))) {
    return "Exit";
  }
  if (repairPatterns.some(p => lowerChunk.includes(p))) {
    return "Repair";
  }
  if (disagreePatterns.some(p => lowerChunk.includes(p))) {
    return "Disagreement";
  }

  // Default based on category
  const categoryDefaults: Record<string, string> = {
    Healthcare: "Repair",
    Academic: "Idioms",
    Community: "Openers",
    Workplace: "Softening",
    Social: "Softening",
    "Service/Logistics": "Softening",
    Cultural: "Openers"
  };

  return categoryDefaults[category] || "Softening";
}

/**
 * Generate scenario ID based on category and topic
 */
export function generateScenarioId(category: string, topic: string): string {
  const categoryPrefixes: Record<string, string> = {
    Social: "social",
    Workplace: "workplace",
    "Service/Logistics": "service",
    Healthcare: "healthcare",
    Community: "community",
    Academic: "academic",
    Cultural: "cultural"
  };

  const prefix = categoryPrefixes[category] || category.toLowerCase();

  // Get next number for this category (would be fetched from staticData in real implementation)
  const nextNumber = 1; // Placeholder - agent will calculate actual number

  // Convert topic to slug
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .slice(0, 3)
    .join("-");

  return `${prefix}-${nextNumber}-${slug}`;
}

/**
 * Generate chunkId based on scenario and chunk text
 */
export function generateChunkId(scenarioId: string, chunkText: string): string {
  // Extract prefix from scenarioId (e.g., "wp" from "workplace-53")
  const parts = scenarioId.split("-");
  const categoryPrefix = parts[0].substring(0, 2);

  // Convert chunk to slug
  const slug = chunkText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .slice(0, 3)
    .join("_");

  return `${categoryPrefix}_ch_${slug}`;
}

/**
 * Select appropriate alternatives count based on difficulty
 */
export function getAlternativesCount(difficulty: keyof typeof difficultyConstraints): number {
  return difficultyConstraints[difficulty].maxAlternatives;
}

/**
 * Get vocabulary guidance for generation based on difficulty
 */
export function getVocabularyGuidance(
  difficulty: keyof typeof difficultyConstraints
): string {
  const c = difficultyConstraints[difficulty];
  return `
Target: ${c.vocabularyLevel}
- Max sentence length: ${c.maxSentenceLength} words
- Avg sentence length: ${c.avgSentenceLength} words
- Blank density: ~${Math.round(c.targetBlankDensity * 100)}% (1 blank per ${Math.round(1 / c.targetBlankDensity)} words)
- Max alternatives per blank: ${c.maxAlternatives}
- Complexity: ${c.chunkComplexity}
${c.constraints.avoidIdioms ? '- Avoid idioms' : '- Idioms welcome'}
${c.constraints.avoidPhraseVerbs ? '- Avoid phrasal verbs' : '- Phrasal verbs welcome'}
`;
}

/**
 * Validate scenario ID is unique (must be called during generation)
 */
export function validateScenarioIdUniqueness(
  candidateId: string,
  existingIds: string[]
): {
  isUnique: boolean;
  suggestion?: string;
} {
  if (existingIds.includes(candidateId)) {
    // Suggest alternative by appending timestamp
    const suggestion = `${candidateId}-v${Date.now().toString().slice(-4)}`;
    return {
      isUnique: false,
      suggestion
    };
  }

  return { isUnique: true };
}

/**
 * Minimum viable scenario requirements
 */
export const minimumRequirements = {
  dialogueLines: 30,
  speakers: 2,
  blanks: { min: 5, max: 20 },
  turns: { min: 8, max: 20 },
  blankAnswerFeedbackRatio: '1:1:1',
  blankAnswerOrderRatio: '1:1:1'
};

export default {
  dialogueTemplates,
  chunkFeedbackTemplates,
  activeRecallTemplates,
  categoryMapping,
  difficultyConstraints,
  minimumRequirements,
  inferChunkCategory,
  generateScenarioId,
  generateChunkId,
  validateDifficultyConstraints,
  getAlternativesCount,
  getVocabularyGuidance,
  validateScenarioIdUniqueness
};
