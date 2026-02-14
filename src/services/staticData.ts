export type ChunkCategory =
    | 'Openers'        // Conversation starters, greetings
    | 'Softening'      // Hedging, politeness markers
    | 'Disagreement'   // Polite disagreement, challenging
    | 'Repair'         // Clarification, fixing misunderstandings
    | 'Exit'           // Closing, ending conversations
    | 'Idioms';        // Fixed expressions, collocations

export interface ChunkFeedback {
    chunkId?: string;         // Optional - Deterministic ID: "{scenarioId}-b{blankIndex}" (e.g., "social-1-flatmate-b1")
    blankIndex: number;
    chunk: string;
    category: ChunkCategory;
    coreFunction: string;     // ≤20 words - explains social function
    situations: Array<{
        context: string;
        example: string;      // ≤15 words
    }>;                       // Exactly 3
    nativeUsageNotes: string[]; // 3-5 pragmatic notes
    nonNativeContrast: Array<{
        nonNative: string;
        native: string;
        explanation: string;  // ≤20 words
    }>;                       // Exactly 2
}

export interface CategoryBreakdown {
    categoryKey?: ChunkCategory;                // Machine key for styling (stable enum: Openers, Softening, etc.)
    category?: ChunkCategory;                   // Legacy field - either categoryKey or category must be present
    categoryLabel?: string;                     // Human-readable label for display (new style)
    customLabel?: string;                       // Deprecated - use categoryLabel instead (kept for backward compat)
    count: number;                              // Must match exampleChunkIds.length
    exampleChunkIds: string[];                  // NEW - Stable chunk IDs (e.g., ["social-1-flatmate-b1", "social-1-flatmate-b3"])
    /** @deprecated Use exampleChunkIds instead - text-based references break when content changes */
    examples?: string[];                        // Chunk text references (populated for backward compat)
    insight: string;                            // 30-100 chars, pattern-focused
    nativePatterns?: string[];                  // NEW - Optional native speaker patterns (extracted from nonNativeContrast)
    commonMistakes?: string[];                  // NEW - Optional non-native patterns (extracted from nonNativeContrast)
}

export interface KeyPattern {
    pattern: string;                            // 10-50 chars, pattern name
    explanation: string;                        // 50-150 chars, shows WHY it works
    chunkIds: string[];                         // NEW - Stable chunk IDs (e.g., ["social-1-flatmate-b1", "academic-1-tutorial-discussion-b5"])
    /** @deprecated Use chunkIds instead - text-based references break when content changes */
    chunks?: string[];                          // References to chunk text (populated for backward compat)
    nativePatterns?: string[];                  // NEW - Optional native speaker patterns
    commonMistakes?: string[];                  // NEW - Optional non-native patterns
}

export interface PatternSummary {
    categoryBreakdown: CategoryBreakdown[];      // 2-6 items
    overallInsight: string;                     // 100-300 chars, learning outcome
    keyPatterns: KeyPattern[];                  // 2-4 cross-chunk patterns
}

/**
 * Maps blank positions to chunk IDs
 * Format: blankId: "{scenarioId}-b{index}" → chunkId: "{scenarioId}-ch_{slug}"
 */
export interface BlankMapping {
    blankId: string;      // e.g., "hc1_b1"
    chunkId: string;      // e.g., "hc1_ch_suffering_from"
}

/**
 * Active recall test item (spaced repetition)
 * Two types: "Choose chunk that means X" or "Fill gap: sentence with ________"
 */
export interface ActiveRecallItem {
    id: string;                 // e.g., "hc1_ar_1"
    prompt: string;             // Test question
    targetChunkIds: string[];   // References to chunkFeedback items
}

/**
 * New chunk feedback schema (template-compliant)
 * Uses native/learner/examples structure
 */
export interface ChunkFeedbackV2 {
    chunkId: string;            // e.g., "hc1_ch_suffering_from"
    native: string;             // Native phrase (matches Answer text exactly)
    learner: {
        meaning: string;        // Simple explanation
        useWhen: string;        // When/why natives use it
        commonWrong: string;    // Learner mistake (full sentence)
        fix: string;            // Corrected version
        whyOdd: string;         // Why mistake sounds unnatural (specific)
    };
    examples: string[];         // 1-2 natural usage examples
}

export interface RoleplayScript {
    id: string;
    category: 'Social' | 'Workplace' | 'Service/Logistics' | 'Advanced' | 'Academic' | 'Healthcare' | 'Cultural' | 'Community';
    topic: string;
    context: string;
    characters: {
        name: string;
        description: string;
        avatarUrl?: string;
    }[];
    dialogue: {
        speaker: string;
        text: string;
    }[];
    answerVariations: {
        index: number;
        answer: string;
        alternatives: string[];
    }[];
    deepDive?: {
        index: number;
        phrase: string;
        insight: string;
    }[];
    chunkFeedback?: ChunkFeedback[];
    chunkFeedbackV2?: ChunkFeedbackV2[];        // NEW - Template-compliant (new packages)
    blanksInOrder?: BlankMapping[];              // NEW - Maps blank positions to chunks
    activeRecall?: ActiveRecallItem[];           // NEW - Spaced repetition tests
    patternSummary?: PatternSummary;             // Optional consolidated pattern insights
    backgroundUrl?: string;
}

export const CURATED_ROLEPLAYS: RoleplayScript[] = [
  {
    "id": "social-1-flatmate",
    "category": "Social",
    "topic": "Meeting a New Flatmate",
    "context": "First meeting in the new shared house.",
    "characters": [
      {
        "name": "Jack",
        "description": "Friendly flatmate.",
        "avatarUrl": "/avatars/jack_character_3d_1770270663949.png"
      },
      {
        "name": "You",
        "description": "New flatmate."
      }
    ],
    "dialogue": [
      {
        "speaker": "Jack",
        "text": "Hello, I’m Jack. I’m the new flatmate."
      },
      {
        "speaker": "You",
        "text": "Hello, my name is Alex. Nice to ________ you."
      },
      {
        "speaker": "Jack",
        "text": "Nice to meet you too. So, this is the house. It’s really ________, isn’t it?"
      },
      {
        "speaker": "You",
        "text": "Yes, it is. But it’s very difficult to keep ________."
      },
      {
        "speaker": "Jack",
        "text": "Don’t worry. Your accent is very clear. Where are you ________?"
      },
      {
        "speaker": "You",
        "text": "I’m from ________."
      },
      {
        "speaker": "Jack",
        "text": "That’s interesting. How long have you been living here?"
      },
      {
        "speaker": "You",
        "text": "I’ve been living here for about ________."
      },
      {
        "speaker": "Jack",
        "text": "Do you like it so far?"
      },
      {
        "speaker": "You",
        "text": "Yes, I do. The area is quite ________, and the people are very ________."
      },
      {
        "speaker": "Jack",
        "text": "That’s good to hear. By the way, what do you do for ________?"
      },
      {
        "speaker": "You",
        "text": "I work as a ________."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "meet",
        "alternatives": [
          "see",
          "finally meet"
        ]
      },
      {
        "index": 2,
        "answer": "bright",
        "alternatives": [
          "nice",
          "spacious",
          "comfortable",
          "lovely"
        ]
      },
      {
        "index": 3,
        "answer": "clean",
        "alternatives": [
          "tidy",
          "organized",
          "neat"
        ]
      },
      {
        "index": 4,
        "answer": "from",
        "alternatives": [
          "originally from",
          "coming from"
        ]
      },
      {
        "index": 5,
        "answer": "London",
        "alternatives": [
          "overseas"
        ]
      },
      {
        "index": 6,
        "answer": "six months",
        "alternatives": [
          "quite a while",
          "nearly a year"
        ]
      },
      {
        "index": 7,
        "answer": "quiet",
        "alternatives": [
          "convenient",
          "pleasant",
          "peaceful"
        ]
      },
      {
        "index": 8,
        "answer": "friendly",
        "alternatives": [
          "welcoming",
          "polite",
          "approachable"
        ]
      },
      {
        "index": 9,
        "answer": "a living",
        "alternatives": [
          "work",
          "a career"
        ]
      },
      {
        "index": 10,
        "answer": "designer",
        "alternatives": [
          "teacher",
          "engineer"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "meet",
        "insight": "Standard greeting. Responses often include \"too\"."
      },
      {
        "index": 6,
        "phrase": "quite a while",
        "insight": "Vagueness signals native-like comfort with the language."
      },
      {
        "index": 8,
        "phrase": "friendly",
        "insight": "Default positive adjective, never wrong."
      }
    ],
    "chunkFeedback": [
      {
        "chunkId": "social-1-flatmate-b1",
        "blankIndex": 1,
        "chunk": "meet",
        "category": "Openers",
        "coreFunction": "Acknowledges first meeting; creates warm, social foundation for conversation.",
        "situations": [
          {
            "context": "Introduction at social event",
            "example": "Nice to meet you. I'm Alex."
          },
          {
            "context": "New colleague greeting",
            "example": "It's great to meet you. Welcome to the team."
          },
          {
            "context": "Friend introducing contact",
            "example": "This is Sam. Sam, nice to meet you."
          }
        ],
        "nativeUsageNotes": [
          "Always \"meet\" not \"know\" for first meetings",
          "Use \"too\" in response: \"Nice to meet you too\"",
          "Works in formal and casual contexts equally"
        ],
        "nonNativeContrast": [
          {
            "nonNative": "I'm happy to meet you.",
            "native": "Nice to meet you.",
            "explanation": "Native version is shorter, warmer; avoids \"happy\" which signals awkwardness."
          },
          {
            "nonNative": "I'm pleased to encounter you.",
            "native": "Nice to meet you.",
            "explanation": "Native version is casual; formal version sounds unnatural and distant."
          }
        ]
      },
      {
        "blankIndex": 3,
        "chunk": "keep track",
        "category": "Idioms",
        "coreFunction": "Means monitor progress or stay updated; practical collocation for management contexts.",
        "situations": [
          {
            "context": "Project management",
            "example": "I'll keep track of the budget throughout the project."
          },
          {
            "context": "Staying informed",
            "example": "It's hard to keep track of all the emails."
          },
          {
            "context": "Monitoring progress",
            "example": "We need to keep track of deadlines carefully."
          }
        ],
        "nativeUsageNotes": [
          "Collocation: always \"keep track of\" (not \"keep track on\")",
          "Common in work/academic contexts",
          "Implies active monitoring, not passive awareness"
        ],
        "nonNativeContrast": [
          {
            "nonNative": "It's very difficult to track it.",
            "native": "It's hard to keep track of it.",
            "explanation": "Native version uses natural collocation; direct translation sounds robotic."
          },
          {
            "nonNative": "I will manage the follow-up.",
            "native": "I'll keep track of the next steps.",
            "explanation": "Native version is more specific and conversational."
          }
        ]
      },
      {
        "blankIndex": 8,
        "chunk": "friendly",
        "category": "Softening",
        "coreFunction": "Describes warmth and approachability; creates positive impression without overclaiming.",
        "situations": [
          {
            "context": "Describing new environment",
            "example": "The people here are very friendly and welcoming."
          },
          {
            "context": "Appreciating interaction",
            "example": "That was a friendly conversation; I felt comfortable."
          },
          {
            "context": "Community description",
            "example": "It's a friendly neighborhood where everyone helps."
          }
        ],
        "nativeUsageNotes": [
          "Default positive descriptor for people and places",
          "Safer than \"nice\" because more specific about warmth",
          "Works equally in formal and casual contexts"
        ],
        "nonNativeContrast": [
          {
            "nonNative": "The people are very good.",
            "native": "The people are very friendly.",
            "explanation": "Native version is precise; \"good\" is too vague and abstract."
          },
          {
            "nonNative": "Everyone is very nice to me.",
            "native": "Everyone is very friendly.",
            "explanation": "Native version describes atmosphere; non-native focuses on personal treatment."
          }
        ]
      }
    ]
  },
  {
    "id": "service-1-cafe",
    "category": "Service/Logistics",
    "topic": "At a Café (Three Minute Flow)",
    "context": "Ordering and handling a drink issue in a busy café.",
    "characters": [
      {
        "name": "Barista",
        "description": "Efficient and busy.",
        "avatarUrl": "/avatars/barista.png"
      },
      {
        "name": "You",
        "description": "Customer."
      }
    ],
    "backgroundUrl": "/avatars/london_cafe_interior_3d_1770271472049.png",
    "dialogue": [
      {
        "speaker": "Barista",
        "text": "Hi there. What can I get for you?"
      },
      {
        "speaker": "You",
        "text": "Hi. Can I have a ________ ________, please?"
      },
      {
        "speaker": "Barista",
        "text": "Sure. Would you like it hot or ________?"
      },
      {
        "speaker": "You",
        "text": "________, please."
      },
      {
        "speaker": "Barista",
        "text": "No problem. Any milk preference?"
      },
      {
        "speaker": "You",
        "text": "Yes, ________ milk, please."
      },
      {
        "speaker": "Barista",
        "text": "Anything else?"
      },
      {
        "speaker": "You",
        "text": "I’ll also have a ________."
      },
      {
        "speaker": "Barista",
        "text": "Eat in or take ________?"
      },
      {
        "speaker": "You",
        "text": "Eat ________, please."
      },
      {
        "speaker": "Barista",
        "text": "That’ll be £5.50. You can pay by card or ________."
      },
      {
        "speaker": "You",
        "text": "Card is ________."
      },
      {
        "speaker": "Barista",
        "text": "Great. Just tap when you’re ready."
      },
      {
        "speaker": "You",
        "text": "There you ________."
      },
      {
        "speaker": "Barista",
        "text": "Perfect. Your order will be ready in about ________ minutes."
      },
      {
        "speaker": "You",
        "text": "No ________."
      },
      {
        "speaker": "You",
        "text": "Excuse me, sorry to ________ you."
      },
      {
        "speaker": "Barista",
        "text": "No worries. What’s up?"
      },
      {
        "speaker": "You",
        "text": "I think this is supposed to be ________, but it tastes a bit ________."
      },
      {
        "speaker": "Barista",
        "text": "Oh, sorry about that. Would you like me to ________ it?"
      },
      {
        "speaker": "You",
        "text": "Yes, that would be ________, thanks."
      },
      {
        "speaker": "Barista",
        "text": "Here you go. I’ve made it ________ this time."
      },
      {
        "speaker": "You",
        "text": "That’s much ________. I really ________ it."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "flat",
        "alternatives": [
          "latte",
          "cappuccino",
          "black"
        ]
      },
      {
        "index": 2,
        "answer": "white",
        "alternatives": [
          "coffee",
          "americano"
        ]
      },
      {
        "index": 3,
        "answer": "iced",
        "alternatives": [
          "cold"
        ]
      },
      {
        "index": 4,
        "answer": "Hot",
        "alternatives": [
          "Iced"
        ]
      },
      {
        "index": 5,
        "answer": "oat",
        "alternatives": [
          "soy",
          "regular",
          "skimmed"
        ]
      },
      {
        "index": 6,
        "answer": "croissant",
        "alternatives": [
          "muffin",
          "brownie"
        ]
      },
      {
        "index": 7,
        "answer": "away",
        "alternatives": [
          "out"
        ]
      },
      {
        "index": 8,
        "answer": "in",
        "alternatives": [
          "here"
        ]
      },
      {
        "index": 9,
        "answer": "cash",
        "alternatives": []
      },
      {
        "index": 10,
        "answer": "fine",
        "alternatives": [
          "perfect",
          "okay"
        ]
      },
      {
        "index": 11,
        "answer": "go",
        "alternatives": [
          "are"
        ]
      },
      {
        "index": 12,
        "answer": "three",
        "alternatives": [
          "five"
        ]
      },
      {
        "index": 13,
        "answer": "problem",
        "alternatives": [
          "worries"
        ]
      },
      {
        "index": 14,
        "answer": "bother",
        "alternatives": [
          "interrupt"
        ]
      },
      {
        "index": 15,
        "answer": "hot",
        "alternatives": [
          "sweet",
          "strong"
        ]
      },
      {
        "index": 16,
        "answer": "cold",
        "alternatives": [
          "weak",
          "bitter"
        ]
      },
      {
        "index": 17,
        "answer": "remade",
        "alternatives": [
          "fixed",
          "exchanged"
        ]
      },
      {
        "index": 18,
        "answer": "great",
        "alternatives": [
          "lovely",
          "perfect"
        ]
      },
      {
        "index": 19,
        "answer": "fresh",
        "alternatives": [
          "hotter",
          "stronger"
        ]
      },
      {
        "index": 20,
        "answer": "better",
        "alternatives": [
          "nicer"
        ]
      },
      {
        "index": 21,
        "answer": "appreciate",
        "alternatives": [
          "enjoy",
          "like"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 11,
        "phrase": "There you go",
        "insight": "Fixed phrase for handing something over. Don't overthink it."
      },
      {
        "index": 14,
        "phrase": "sorry to bother you",
        "insight": "Standard polite interruptive phrase."
      },
      {
        "index": 21,
        "phrase": "really appreciate it",
        "insight": "Common way to signal satisfaction after an issue is fixed."
      }
    ],
    "chunkFeedback": [
      {
        "chunkId": "service-1-cafe-b14",
        "blankIndex": 14,
        "chunk": "bother",
        "category": "Repair",
        "coreFunction": "Softens interruption by expressing concern about inconvenience; preserves listener comfort.",
        "situations": [
          {
            "context": "Interrupting someone",
            "example": "Excuse me, sorry to bother you, but I have a question."
          },
          {
            "context": "Asking for help",
            "example": "I hate to bother you, but could you help?"
          },
          {
            "context": "Seeking attention",
            "example": "Sorry to bother you while you're busy."
          }
        ],
        "nativeUsageNotes": [
          "Always \"bother\" not \"disturb\" in casual English",
          "Used with \"sorry\" to show genuine concern",
          "Makes request feel less demanding"
        ],
        "nonNativeContrast": [
          {
            "nonNative": "Excuse me, I need to speak with you.",
            "native": "Sorry to bother you, but could I ask something?",
            "explanation": "Native version is considerate; direct request can feel abrupt or impolite."
          },
          {
            "nonNative": "I have a question for you.",
            "native": "Sorry to bother you, do you have a minute?",
            "explanation": "Native version acknowledges listener's time; non-native assumes availability."
          }
        ]
      },
      {
        "blankIndex": 21,
        "chunk": "appreciate",
        "category": "Exit",
        "coreFunction": "Expresses genuine gratitude more warmly than \"thank you\"; strengthens relationship.",
        "situations": [
          {
            "context": "After someone helps",
            "example": "Thank you so much. I really appreciate it."
          },
          {
            "context": "Valuing effort",
            "example": "I appreciate that you took time to help."
          },
          {
            "context": "Acknowledging support",
            "example": "I really appreciate your patience with this."
          }
        ],
        "nativeUsageNotes": [
          "More sincere than \"thank\" in emotional contexts",
          "Works with \"really\" to intensify gratitude",
          "Common after problems are solved or effort is expended"
        ],
        "nonNativeContrast": [
          {
            "nonNative": "I thank you for this.",
            "native": "I really appreciate it.",
            "explanation": "Native version feels natural and warm; formal version sounds translated."
          },
          {
            "nonNative": "It is good that you helped.",
            "native": "I truly appreciate your help.",
            "explanation": "Native version is personal; non-native is impersonal observation."
          }
        ]
      }
    ]
  },
  {
    "id": "service-2-airport",
    "category": "Service/Logistics",
    "topic": "Airport Check-In Flow",
    "context": "The full check-in experience from passport to boarding pass.",
    "characters": [
      {
        "name": "Agent",
        "description": "Official and efficient."
      },
      {
        "name": "You",
        "description": "Traveler."
      }
    ],
    "dialogue": [
      {
        "speaker": "Agent",
        "text": "Good morning. May I see your passport, please?"
      },
      {
        "speaker": "You",
        "text": "Good morning. Here you ________."
      },
      {
        "speaker": "Agent",
        "text": "Thank you. Where are you flying ________ today?"
      },
      {
        "speaker": "You",
        "text": "I’m flying to ________."
      },
      {
        "speaker": "Agent",
        "text": "Is this for business or ________?"
      },
      {
        "speaker": "You",
        "text": "It’s for ________."
      },
      {
        "speaker": "Agent",
        "text": "Do you have any bags to ________ in?"
      },
      {
        "speaker": "You",
        "text": "Yes, I have ________ bag."
      },
      {
        "speaker": "Agent",
        "text": "Please place your bag on the ________."
      },
      {
        "speaker": "You",
        "text": "Sure. Here you ________."
      },
      {
        "speaker": "Agent",
        "text": "Thank you. Your bag is ________ kilos, which is fine."
      },
      {
        "speaker": "Agent",
        "text": "Did you pack your bags ________?"
      },
      {
        "speaker": "You",
        "text": "Yes, I packed them ________."
      },
      {
        "speaker": "Agent",
        "text": "Are you carrying any liquids, sharp objects, or ________ items?"
      },
      {
        "speaker": "You",
        "text": "No, nothing like ________."
      },
      {
        "speaker": "Agent",
        "text": "Do you have a seat preference? Window or ________?"
      },
      {
        "speaker": "You",
        "text": "A ________ seat, if possible."
      },
      {
        "speaker": "Agent",
        "text": "Alright. Here is your boarding ________."
      },
      {
        "speaker": "You",
        "text": "Thank you. How long does boarding usually ________?"
      },
      {
        "speaker": "Agent",
        "text": "About ________ minutes. Is the flight still ________ on time?"
      },
      {
        "speaker": "Agent",
        "text": "Yes, everything looks ________."
      },
      {
        "speaker": "You",
        "text": "Perfect. Thank you for your ________."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "go",
        "alternatives": [
          "are"
        ]
      },
      {
        "index": 2,
        "answer": "to",
        "alternatives": [
          "out to",
          "off to"
        ]
      },
      {
        "index": 3,
        "answer": "London",
        "alternatives": [
          "Tokyo",
          "New York"
        ]
      },
      {
        "index": 4,
        "answer": "leisure",
        "alternatives": [
          "holiday",
          "personal travel"
        ]
      },
      {
        "index": 5,
        "answer": "pleasure",
        "alternatives": [
          "vacation"
        ]
      },
      {
        "index": 6,
        "answer": "check",
        "alternatives": [
          "check in",
          "put in"
        ]
      },
      {
        "index": 7,
        "answer": "one",
        "alternatives": [
          "just one",
          "a single"
        ]
      },
      {
        "index": 8,
        "answer": "scale",
        "alternatives": [
          "belt",
          "conveyor"
        ]
      },
      {
        "index": 9,
        "answer": "are",
        "alternatives": [
          "go"
        ]
      },
      {
        "index": 10,
        "answer": "20",
        "alternatives": [
          "around 20"
        ]
      },
      {
        "index": 11,
        "answer": "yourself",
        "alternatives": [
          "on your own"
        ]
      },
      {
        "index": 12,
        "answer": "myself",
        "alternatives": [
          "on my own"
        ]
      },
      {
        "index": 13,
        "answer": "prohibited",
        "alternatives": [
          "restricted",
          "dangerous"
        ]
      },
      {
        "index": 14,
        "answer": "that",
        "alternatives": [
          "those",
          "that at all"
        ]
      },
      {
        "index": 15,
        "answer": "aisle",
        "alternatives": [
          "middle"
        ]
      },
      {
        "index": 16,
        "answer": "window",
        "alternatives": [
          "aisle"
        ]
      },
      {
        "index": 17,
        "answer": "pass",
        "alternatives": [
          "card"
        ]
      },
      {
        "index": 18,
        "answer": "take",
        "alternatives": [
          "last"
        ]
      },
      {
        "index": 19,
        "answer": "30",
        "alternatives": []
      },
      {
        "index": 20,
        "answer": "running",
        "alternatives": [
          "expected to be"
        ]
      },
      {
        "index": 21,
        "answer": "fine",
        "alternatives": [
          "good",
          "on schedule"
        ]
      },
      {
        "index": 22,
        "answer": "help",
        "alternatives": [
          "assistance"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 11,
        "phrase": "yourself",
        "insight": "Standard security question phrase."
      },
      {
        "index": 17,
        "phrase": "boarding pass",
        "insight": "The official term for your flight ticket document."
      }
    ]
  },
  {
    "id": "service-3-hotel-full",
    "category": "Service/Logistics",
    "topic": "Hotel Check-In",
    "context": "Checking into a hotel with specific room preferences.",
    "characters": [
      {
        "name": "Receptionist",
        "description": "Helpful and polite."
      },
      {
        "name": "You",
        "description": "Guest."
      }
    ],
    "dialogue": [
      {
        "speaker": "Receptionist",
        "text": "Good evening. How can I ________ you?"
      },
      {
        "speaker": "You",
        "text": "Hi, I have a ________ under the name Alex Smith."
      },
      {
        "speaker": "Receptionist",
        "text": "Let me check. May I see your ________, please?"
      },
      {
        "speaker": "You",
        "text": "Sure. Here you ________."
      },
      {
        "speaker": "Receptionist",
        "text": "Thank you. You’re staying for ________ nights, correct?"
      },
      {
        "speaker": "You",
        "text": "Yes, that’s ________."
      },
      {
        "speaker": "Receptionist",
        "text": "Would you like a room with a ________ or a ________ view?"
      },
      {
        "speaker": "You",
        "text": "A ________ view, if possible."
      },
      {
        "speaker": "Receptionist",
        "text": "No problem. Breakfast is ________ from 7 to 10 a.m."
      },
      {
        "speaker": "You",
        "text": "Great. Is Wi-Fi ________ in the room?"
      },
      {
        "speaker": "Receptionist",
        "text": "Yes, it’s completely ________."
      },
      {
        "speaker": "You",
        "text": "Perfect. What time is ________?"
      },
      {
        "speaker": "Receptionist",
        "text": "Check-out is at ________."
      },
      {
        "speaker": "You",
        "text": "That’s fine. Thank you for your ________."
      },
      {
        "speaker": "Receptionist",
        "text": "You’re welcome. Enjoy your ________."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "help",
        "alternatives": [
          "assist"
        ]
      },
      {
        "index": 2,
        "answer": "reservation",
        "alternatives": [
          "booking"
        ]
      },
      {
        "index": 3,
        "answer": "passport",
        "alternatives": [
          "ID"
        ]
      },
      {
        "index": 4,
        "answer": "go",
        "alternatives": [
          "are"
        ]
      },
      {
        "index": 5,
        "answer": "three",
        "alternatives": [
          "two",
          "few"
        ]
      },
      {
        "index": 6,
        "answer": "right",
        "alternatives": [
          "correct",
          "fine"
        ]
      },
      {
        "index": 7,
        "answer": "city",
        "alternatives": [
          "garden",
          "sea",
          "street"
        ]
      },
      {
        "index": 8,
        "answer": "courtyard",
        "alternatives": [
          "pool",
          "mountain"
        ]
      },
      {
        "index": 9,
        "answer": "sea",
        "alternatives": [
          "garden",
          "pool"
        ]
      },
      {
        "index": 10,
        "answer": "served",
        "alternatives": [
          "available",
          "included"
        ]
      },
      {
        "index": 11,
        "answer": "available",
        "alternatives": [
          "included",
          "free"
        ]
      },
      {
        "index": 12,
        "answer": "free",
        "alternatives": [
          "included",
          "unlimited"
        ]
      },
      {
        "index": 13,
        "answer": "check-out",
        "alternatives": []
      },
      {
        "index": 14,
        "answer": "eleven",
        "alternatives": [
          "noon"
        ]
      },
      {
        "index": 15,
        "answer": "help",
        "alternatives": [
          "assistance"
        ]
      },
      {
        "index": 16,
        "answer": "stay",
        "alternatives": [
          "time",
          "visit"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 12,
        "phrase": "completely free",
        "insight": "High-value signal. \"Included\" is standard, but \"completely free\" sounds more native."
      }
    ]
  },
  {
    "id": "service-4-return-no-receipt",
    "category": "Service/Logistics",
    "topic": "Returning a Faulty Item",
    "context": "Handling a return for a faulty item when you’ve lost the receipt.",
    "characters": [
      {
        "name": "Assistant",
        "description": "Helpful store assistant.",
        "avatarUrl": "/avatars/assistant.png"
      },
      {
        "name": "You",
        "description": "Customer seeking a fair outcome."
      }
    ],
    "dialogue": [
      {
        "speaker": "Assistant",
        "text": "Hi there. How can I help you today?"
      },
      {
        "speaker": "You",
        "text": "Hi. I’d like to ________ this item, please."
      },
      {
        "speaker": "Assistant",
        "text": "Of course. What seems to be the problem?"
      },
      {
        "speaker": "You",
        "text": "It’s ________, and it stopped working after ________ days."
      },
      {
        "speaker": "Assistant",
        "text": "I see. When did you buy it?"
      },
      {
        "speaker": "You",
        "text": "I bought it ________."
      },
      {
        "speaker": "Assistant",
        "text": "Do you happen to have the receipt with you?"
      },
      {
        "speaker": "You",
        "text": "Actually, I don’t have the ________ anymore."
      },
      {
        "speaker": "Assistant",
        "text": "Okay. Did you pay by card or ________?"
      },
      {
        "speaker": "You",
        "text": "I paid by ________."
      },
      {
        "speaker": "Assistant",
        "text": "That helps. Sometimes we can still locate the ________ using the payment record."
      },
      {
        "speaker": "Assistant",
        "text": "Do you remember roughly what ________ you came in?"
      },
      {
        "speaker": "You",
        "text": "It was around ________ in the afternoon."
      },
      {
        "speaker": "Assistant",
        "text": "Alright, let me check our system. Are you looking for a refund or an ________?"
      },
      {
        "speaker": "You",
        "text": "Ideally, I’d like a ________."
      },
      {
        "speaker": "Assistant",
        "text": "I understand. Without a receipt, our policy usually allows for a ________ refund or an exchange."
      },
      {
        "speaker": "You",
        "text": "I see. That’s understandable. To be honest, I’ve barely ________ the item."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "return",
        "alternatives": [
          "get a refund on",
          "bring back"
        ]
      },
      {
        "index": 2,
        "answer": "faulty",
        "alternatives": [
          "defective",
          "damaged"
        ]
      },
      {
        "index": 3,
        "answer": "a few",
        "alternatives": [
          "two",
          "three"
        ]
      },
      {
        "index": 4,
        "answer": "last week",
        "alternatives": [
          "recently",
          "a few days ago"
        ]
      },
      {
        "index": 5,
        "answer": "receipt",
        "alternatives": [
          "proof of purchase"
        ]
      },
      {
        "index": 6,
        "answer": "cash",
        "alternatives": []
      },
      {
        "index": 7,
        "answer": "card",
        "alternatives": [
          "debit card"
        ]
      },
      {
        "index": 8,
        "answer": "transaction",
        "alternatives": [
          "purchase",
          "order"
        ]
      },
      {
        "index": 9,
        "answer": "time",
        "alternatives": [
          "day"
        ]
      },
      {
        "index": 10,
        "answer": "three",
        "alternatives": [
          "four",
          "half past three"
        ]
      },
      {
        "index": 11,
        "answer": "exchange",
        "alternatives": [
          "replacement"
        ]
      },
      {
        "index": 12,
        "answer": "refund",
        "alternatives": [
          "full refund"
        ]
      },
      {
        "index": 13,
        "answer": "partial",
        "alternatives": [
          "store credit",
          "gift card"
        ]
      },
      {
        "index": 14,
        "answer": "used",
        "alternatives": [
          "touched",
          "had a chance to use"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 5,
        "phrase": "proof of purchase",
        "insight": "The formal synonym for receipt. Useful for IELTS/Professional English."
      }
    ]
  },
  {
    "id": "advanced-1-manager-escalation",
    "category": "Advanced",
    "topic": "Manager Escalation (Hard)",
    "context": "Advocating for a return after an assistant says no.",
    "characters": [
      {
        "name": "Assistant",
        "description": "Rule-follower."
      },
      {
        "name": "Manager",
        "description": "Decision maker."
      },
      {
        "name": "You",
        "description": "Polite but persistent customer."
      }
    ],
    "dialogue": [
      {
        "speaker": "Assistant",
        "text": "I understand your concern, but unfortunately this is our standard return policy."
      },
      {
        "speaker": "You",
        "text": "I see. Thanks for explaining. Would it be possible to ________ to the manager for a moment?"
      },
      {
        "speaker": "Assistant",
        "text": "Of course. I’ll let them know. Please give me a ________."
      },
      {
        "speaker": "Manager",
        "text": "Hello. I’m the store manager. I understand there’s an issue with a return?"
      },
      {
        "speaker": "You",
        "text": "Yes, thanks for coming over. I completely understand the ________, but I was hoping you might be able to ________."
      },
      {
        "speaker": "Manager",
        "text": "Could you briefly explain what happened?"
      },
      {
        "speaker": "You",
        "text": "Of course. I purchased this item ________, and it stopped working within ________ days."
      },
      {
        "speaker": "You",
        "text": "Ideally, I’d like a ________, but I’m open to ________ if that’s more appropriate."
      },
      {
        "speaker": "Manager",
        "text": "I can’t approve a full refund to your original payment method, but I can offer ________."
      },
      {
        "speaker": "You",
        "text": "I appreciate you looking into this. Could you clarify what that would ________?"
      },
      {
        "speaker": "Manager",
        "text": "We can issue store credit for the full ________."
      },
      {
        "speaker": "You",
        "text": "That sounds ________. I’m happy to go ahead with that."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "speak",
        "alternatives": [
          "talk",
          "have a word"
        ]
      },
      {
        "index": 2,
        "answer": "moment",
        "alternatives": [
          "minute",
          "second"
        ]
      },
      {
        "index": 3,
        "answer": "policy",
        "alternatives": [
          "situation",
          "process"
        ]
      },
      {
        "index": 4,
        "answer": "help",
        "alternatives": [
          "make an exception",
          "look into it"
        ]
      },
      {
        "index": 5,
        "answer": "recently",
        "alternatives": [
          "last week"
        ]
      },
      {
        "index": 6,
        "answer": "two",
        "alternatives": [
          "three",
          "a few"
        ]
      },
      {
        "index": 7,
        "answer": "refund",
        "alternatives": [
          "full refund"
        ]
      },
      {
        "index": 8,
        "answer": "exchange",
        "alternatives": [
          "store credit"
        ]
      },
      {
        "index": 9,
        "answer": "store credit",
        "alternatives": [
          "a gift card"
        ]
      },
      {
        "index": 10,
        "answer": "mean",
        "alternatives": [
          "involve",
          "look like"
        ]
      },
      {
        "index": 11,
        "answer": "amount",
        "alternatives": [
          "value",
          "purchase price"
        ]
      },
      {
        "index": 12,
        "answer": "fair",
        "alternatives": [
          "reasonable",
          "fine"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "have a word",
        "insight": "Very British, polite way to ask for a conversation."
      },
      {
        "index": 4,
        "phrase": "make an exception",
        "insight": "The master phrase for asking for a rule to be bent."
      }
    ]
  },
  {
    "id": "advanced-2-manager-no",
    "category": "Advanced",
    "topic": "When the Manager Says No",
    "context": "Handling a complete refusal with grace and professionalism.",
    "characters": [
      {
        "name": "Manager",
        "description": "Firm but polite."
      },
      {
        "name": "You",
        "description": "Customer handling disappointment."
      }
    ],
    "dialogue": [
      {
        "speaker": "Manager",
        "text": "I understand where you’re coming from, but I’m afraid I won’t be able to make an exception in this case."
      },
      {
        "speaker": "You",
        "text": "I see. Thanks for being ________ with me."
      },
      {
        "speaker": "Manager",
        "text": "Without a receipt or proof of purchase, we’re unable to offer a refund."
      },
      {
        "speaker": "You",
        "text": "I understand the policy. I just wanted to check, as I thought it was worth a ________."
      },
      {
        "speaker": "Manager",
        "text": "I appreciate that. Unfortunately, my hands are ________."
      },
      {
        "speaker": "You",
        "text": "Fair enough. I don’t want to make a ________ about it."
      },
      {
        "speaker": "Manager",
        "text": "Thank you for understanding."
      },
      {
        "speaker": "You",
        "text": "Just so I’m clear, there’s no ________ at all, even as store credit?"
      },
      {
        "speaker": "Manager",
        "text": "I’m afraid not. This is a hard ________."
      },
      {
        "speaker": "You",
        "text": "Alright. No worries. I won’t ________ the point."
      },
      {
        "speaker": "You",
        "text": "It’s okay. These things ________."
      },
      {
        "speaker": "Manager",
        "text": "I’m sorry we couldn’t help more. If you find the receipt later, we’d be happy to take another look."
      },
      {
        "speaker": "You",
        "text": "That’s good to know. I’ll keep that in ________. Thanks for taking the time to ________ it anyway."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "honest",
        "alternatives": [
          "upfront",
          "clear",
          "straight"
        ]
      },
      {
        "index": 2,
        "answer": "try",
        "alternatives": [
          "shot",
          "check",
          "conversation"
        ]
      },
      {
        "index": 3,
        "answer": "tied",
        "alternatives": [
          "bound"
        ]
      },
      {
        "index": 4,
        "answer": "fuss",
        "alternatives": [
          "scene",
          "big deal"
        ]
      },
      {
        "index": 5,
        "answer": "possibility",
        "alternatives": [
          "option",
          "way"
        ]
      },
      {
        "index": 6,
        "answer": "no",
        "alternatives": [
          "line",
          "stop"
        ]
      },
      {
        "index": 7,
        "answer": "push",
        "alternatives": [
          "press",
          "argue",
          "labour"
        ]
      },
      {
        "index": 8,
        "answer": "happen",
        "alternatives": [
          "come up",
          "occur"
        ]
      },
      {
        "index": 9,
        "answer": "mind",
        "alternatives": [
          "note"
        ]
      },
      {
        "index": 10,
        "answer": "review",
        "alternatives": [
          "look into",
          "explain"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 3,
        "phrase": "hands are tied",
        "insight": "Idiom meaning \"I have no power to change this\"."
      },
      {
        "index": 4,
        "phrase": "make a fuss",
        "insight": "Britishism for \"causing trouble\" or \"complaining loudly\"."
      },
      {
        "index": 7,
        "phrase": "push the point",
        "insight": "Polite way to signal you are stopping the argument."
      }
    ]
  },
  {
    "id": "workplace-1-disagreement",
    "category": "Workplace",
    "topic": "Workplace Disagreement",
    "context": "Offering an alternative view in a meeting without being confrontational.",
    "characters": [
      {
        "name": "Colleague",
        "description": "Opinionated but professional."
      },
      {
        "name": "Manager",
        "description": "Facilitator."
      },
      {
        "name": "You",
        "description": "Thoughtful team member."
      }
    ],
    "dialogue": [
      {
        "speaker": "Colleague",
        "text": "I think we should move forward with this approach as it is."
      },
      {
        "speaker": "You",
        "text": "I see your point. I just have a slightly ________ view on this."
      },
      {
        "speaker": "Manager",
        "text": "Okay, let’s hear it."
      },
      {
        "speaker": "You",
        "text": "From my perspective, there might be a ________ risk if we proceed this way."
      },
      {
        "speaker": "Colleague",
        "text": "What kind of risk are you referring to?"
      },
      {
        "speaker": "You",
        "text": "Mainly around ________ and how it could impact the final outcome."
      },
      {
        "speaker": "Manager",
        "text": "That’s interesting. Can you explain a bit more?"
      },
      {
        "speaker": "You",
        "text": "Sure. Based on what we’ve seen so far, the current plan could ________ timelines and put extra pressure on the team."
      },
      {
        "speaker": "Colleague",
        "text": "I’m not sure I agree with that."
      },
      {
        "speaker": "You",
        "text": "That’s fair. I’m not saying the idea is ________, just that it may need some ________."
      },
      {
        "speaker": "Manager",
        "text": "What would you suggest instead?"
      },
      {
        "speaker": "You",
        "text": "One option could be to ________ the rollout and test it on a smaller ________ first."
      },
      {
        "speaker": "You",
        "text": "Ultimately, I’m happy to support whichever direction we choose. I just wanted to ________ this concern before we commit."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "different",
        "alternatives": [
          "alternative",
          "broader"
        ]
      },
      {
        "index": 2,
        "answer": "potential",
        "alternatives": [
          "significant",
          "long-term"
        ]
      },
      {
        "index": 3,
        "answer": "timing",
        "alternatives": [
          "execution",
          "alignment"
        ]
      },
      {
        "index": 4,
        "answer": "stretch",
        "alternatives": [
          "affect",
          "impact",
          "delay"
        ]
      },
      {
        "index": 5,
        "answer": "flawed",
        "alternatives": [
          "wrong",
          "bad",
          "off-base"
        ]
      },
      {
        "index": 6,
        "answer": "fine-tuning",
        "alternatives": [
          "refining",
          "adjustment"
        ]
      },
      {
        "index": 7,
        "answer": "pilot",
        "alternatives": [
          "phase",
          "stagger"
        ]
      },
      {
        "index": 8,
        "answer": "scale",
        "alternatives": [
          "limited",
          "initial"
        ]
      },
      {
        "index": 9,
        "answer": "flag",
        "alternatives": [
          "raise",
          "surface",
          "highlight"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "different view",
        "insight": "Softer than saying \"I disagree\"."
      },
      {
        "index": 9,
        "phrase": "flag a concern",
        "insight": "The professional way to highlight a risk without sounding negative."
      }
    ],
    "chunkFeedback": [
      {
        "chunkId": "workplace-1-disagreement-b1",
        "blankIndex": 1,
        "chunk": "different",
        "category": "Disagreement",
        "coreFunction": "Signals perspective shift gently; invites discussion rather than confrontation.",
        "situations": [
          {
            "context": "Offering alternative view in meeting",
            "example": "I see your point. I just have a slightly different view."
          },
          {
            "context": "Respectful challenge",
            "example": "That's fair, but I have a different take on this."
          },
          {
            "context": "Adding nuance",
            "example": "I understand, and I have a somewhat different perspective."
          }
        ],
        "nativeUsageNotes": [
          "Much softer than \"I disagree\" or \"You're wrong\"",
          "Phrases like \"slightly different\" or \"somewhat different\" reduce confrontation",
          "Creates collaborative tone despite disagreement"
        ],
        "nonNativeContrast": [
          {
            "nonNative": "I do not agree with you.",
            "native": "I see your point. I just have a different view.",
            "explanation": "Native version validates listener first; non-native is direct rejection."
          },
          {
            "nonNative": "That is wrong.",
            "native": "I have a somewhat different perspective on this.",
            "explanation": "Native version is collaborative; non-native is dismissive and harsh."
          }
        ]
      },
      {
        "blankIndex": 9,
        "chunk": "flag",
        "category": "Repair",
        "coreFunction": "Professionally highlights risk or concern without sounding negative or obstructive.",
        "situations": [
          {
            "context": "Raising concern in meeting",
            "example": "I just wanted to flag this concern before we commit."
          },
          {
            "context": "Drawing attention to issue",
            "example": "Can I flag something that might be worth considering?"
          },
          {
            "context": "Signaling potential problem",
            "example": "I'd like to flag a potential issue with this approach."
          }
        ],
        "nativeUsageNotes": [
          "Business idiom: \"flag\" = bring attention to something",
          "More constructive than \"complain\" or \"criticize\"",
          "Shows you're trying to help solve problems, not create them"
        ],
        "nonNativeContrast": [
          {
            "nonNative": "I have a problem with this plan.",
            "native": "I'd like to flag a concern with this approach.",
            "explanation": "Native version frames as collaborative help; non-native sounds oppositional."
          },
          {
            "nonNative": "This might not work.",
            "native": "I'd like to flag this as something worth discussing.",
            "explanation": "Native version invites dialogue; non-native is abrupt prediction of failure."
          }
        ]
      }
    ]
  },
  {
    "id": "advanced-3-manager-pushback",
    "category": "Advanced",
    "topic": "Manager Pushes Back Harder",
    "context": "A high-stakes disagreement where the manager is dismissive.",
    "characters": [
      {
        "name": "Manager",
        "description": "Time-pressured and firm."
      },
      {
        "name": "You",
        "description": "Senior-level contributor standing ground."
      }
    ],
    "dialogue": [
      {
        "speaker": "Manager",
        "text": "We’re on a tight timeline. Reopening this now could slow things down."
      },
      {
        "speaker": "You",
        "text": "I agree timing is ________. My concern is that moving too quickly here could create ________ issues later."
      },
      {
        "speaker": "Manager",
        "text": "We can’t design for every possible risk."
      },
      {
        "speaker": "You",
        "text": "Absolutely. I’m not suggesting we cover ________. I’m referring to one specific area that might ________ the rollout."
      },
      {
        "speaker": "You",
        "text": "My hesitation is that fixing it later may be more ________ and disruptive than addressing it now."
      },
      {
        "speaker": "Manager",
        "text": "So what exactly are you proposing at this stage?"
      },
      {
        "speaker": "You",
        "text": "At minimum, I’d suggest we ________ the assumption around ________ and confirm it with real data before launch."
      },
      {
        "speaker": "Manager",
        "text": "We’ve already committed resources based on the current plan."
      },
      {
        "speaker": "You",
        "text": "I’m aware of that. I’m not asking to change the entire ________, just to make a small ________ adjustment."
      },
      {
        "speaker": "You",
        "text": "This is one of those moments where I felt it was ________ to speak up."
      },
      {
        "speaker": "Manager",
        "text": "Alright. Put together a short summary, no more than ________ page, and we’ll review it tomorrow."
      },
      {
        "speaker": "You",
        "text": "That works. I’ll keep it ________ and focused. Thanks for the ________."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "tight",
        "alternatives": [
          "critical",
          "sensitive"
        ]
      },
      {
        "index": 2,
        "answer": "downstream",
        "alternatives": [
          "knock-on",
          "operational"
        ]
      },
      {
        "index": 3,
        "answer": "everything",
        "alternatives": [
          "every scenario",
          "every edge case"
        ]
      },
      {
        "index": 4,
        "answer": "disrupt",
        "alternatives": [
          "delay",
          "complicate",
          "undermine"
        ]
      },
      {
        "index": 5,
        "answer": "costly",
        "alternatives": [
          "time-consuming",
          "expensive"
        ]
      },
      {
        "index": 6,
        "answer": "validate",
        "alternatives": [
          "pressure-test",
          "revisit"
        ]
      },
      {
        "index": 7,
        "answer": "capacity",
        "alternatives": [
          "adoption",
          "dependencies"
        ]
      },
      {
        "index": 8,
        "answer": "plan",
        "alternatives": [
          "direction",
          "strategy"
        ]
      },
      {
        "index": 9,
        "answer": "tactical",
        "alternatives": [
          "minor",
          "minor",
          "targeted"
        ]
      },
      {
        "index": 10,
        "answer": "important",
        "alternatives": [
          "responsible",
          "necessary"
        ]
      },
      {
        "index": 11,
        "answer": "one",
        "alternatives": [
          "a single"
        ]
      },
      {
        "index": 12,
        "answer": "concise",
        "alternatives": [
          "tight",
          "to the point"
        ]
      },
      {
        "index": 13,
        "answer": "input",
        "alternatives": [
          "feedback",
          "consideration"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 2,
        "phrase": "downstream issues",
        "insight": "High-level business term for future problems caused by today’s choices."
      },
      {
        "index": 6,
        "phrase": "pressure-test",
        "insight": "Corporate idiom for checking if a theory holds up in reality."
      },
      {
        "index": 10,
        "phrase": "responsible to speak up",
        "insight": "A power move phrase: framing disagreement as a duty to the company."
      }
    ]
  },
  {
    "id": "workplace-2-feedback",
    "category": "Workplace",
    "topic": "Negative Feedback on a Report",
    "context": "Correcting a colleague’s work without bruising their ego.",
    "characters": [
      {
        "name": "Colleague",
        "description": "Hard worker but needs guidance."
      },
      {
        "name": "You",
        "description": "Reviewer/Mentor."
      }
    ],
    "dialogue": [
      {
        "speaker": "You",
        "text": "Thanks for sharing the report. Before we circulate it more widely, I wanted to walk through a few ________ points with you."
      },
      {
        "speaker": "Colleague",
        "text": "Sure. What did you think?"
      },
      {
        "speaker": "You",
        "text": "Overall, the structure is solid, and the effort is clear. That said, there are a few areas where the report could be ________."
      },
      {
        "speaker": "You",
        "text": "Starting with the executive summary, I think the key message gets a bit ________. It might help to make the main takeaway more ________ upfront."
      },
      {
        "speaker": "You",
        "text": "The challenge is that senior readers tend to focus on ________ first, so clarity there really ________."
      },
      {
        "speaker": "You",
        "text": "In the analysis section, some of the assumptions aren’t fully ________."
      },
      {
        "speaker": "Colleague",
        "text": "I didn’t want to overcomplicate it."
      },
      {
        "speaker": "You",
        "text": "I appreciate that. It’s a balance, but right now it might feel a bit ________ to someone less close to the work."
      },
      {
        "speaker": "You",
        "text": "Another thing to flag is tone. In a few places, the language comes across as quite ________."
      },
      {
        "speaker": "You",
        "text": "I think softening it slightly and grounding it more in ________ would help."
      },
      {
        "speaker": "You",
        "text": "On the recommendations page, I’d recommend a quick ________ pass just to improve flow and remove repetition."
      },
      {
        "speaker": "You",
        "text": "To be clear, the content is there. This is more about ________ and making sure the report lands the way we intend."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "key",
        "alternatives": [
          "specific",
          "important"
        ]
      },
      {
        "index": 2,
        "answer": "sharper",
        "alternatives": [
          "stronger",
          "clearer"
        ]
      },
      {
        "index": 3,
        "answer": "lost",
        "alternatives": [
          "buried",
          "diluted"
        ]
      },
      {
        "index": 4,
        "answer": "explicit",
        "alternatives": [
          "clear",
          "direct"
        ]
      },
      {
        "index": 5,
        "answer": "summary",
        "alternatives": [
          "headlines",
          "top-line messages"
        ]
      },
      {
        "index": 6,
        "answer": "matters",
        "alternatives": [
          "counts",
          "sets the tone"
        ]
      },
      {
        "index": 7,
        "answer": "justified",
        "alternatives": [
          "explained",
          "supported"
        ]
      },
      {
        "index": 8,
        "answer": "thin",
        "alternatives": [
          "light",
          "underdeveloped"
        ]
      },
      {
        "index": 9,
        "answer": "absolute",
        "alternatives": [
          "strong",
          "assertive"
        ]
      },
      {
        "index": 10,
        "answer": "evidence",
        "alternatives": [
          "data",
          "facts"
        ]
      },
      {
        "index": 11,
        "answer": "polish",
        "alternatives": [
          "editing",
          "clarity"
        ]
      },
      {
        "index": 12,
        "answer": "framing",
        "alternatives": [
          "positioning",
          "presentation"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "walk through",
        "insight": "The collaborative alternative to \"discuss\" or \"critique\"."
      },
      {
        "index": 12,
        "phrase": "lands the way we intend",
        "insight": "Modern professional way to talk about the receiver’s reaction."
      }
    ]
  },
  {
    "id": "social-2-catch-up",
    "category": "Social",
    "topic": "Catching Up with an Old Friend",
    "context": "A deep catch-up covering life changes and advice.",
    "characters": [
      {
        "name": "Friend",
        "description": "Hectic worker."
      },
      {
        "name": "You",
        "description": "Empathetic listener."
      }
    ],
    "dialogue": [
      {
        "speaker": "You",
        "text": "Hey, nice to see you again. Nice to ________ you."
      },
      {
        "speaker": "Friend",
        "text": "Yeah, it’s good to see you too. It’s a ________. So, how’s it ________?"
      },
      {
        "speaker": "You",
        "text": "Not too bad, actually. Busy, but in a good way. What have you been ________ to?"
      },
      {
        "speaker": "Friend",
        "text": "Work’s been hectic. To be honest, I’ve been thinking about making a few changes."
      },
      {
        "speaker": "You",
        "text": "Oh yeah? From my perspective, that can be a good thing, depending on the timing."
      },
      {
        "speaker": "Friend",
        "text": "Exactly. I mean, I see the benefits, but it’s not an easy decision."
      },
      {
        "speaker": "You",
        "text": "I see your point. Change always sounds good in theory, but the reality can be different."
      },
      {
        "speaker": "Friend",
        "text": "I’ve thought about moving. A new place can be a ________ of fresh air, you know?"
      },
      {
        "speaker": "You",
        "text": "That’s true. You can always play it by ________ and see how things go."
      },
      {
        "speaker": "You",
        "text": "Anyway, I don’t want to keep you too long. Let’s keep in ________."
      },
      {
        "speaker": "You",
        "text": "Alright, take care. You too. Take ________."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "see",
        "alternatives": [
          "meet"
        ]
      },
      {
        "index": 2,
        "answer": "pleasure",
        "alternatives": [
          "surprise"
        ]
      },
      {
        "index": 3,
        "answer": "going",
        "alternatives": [
          "moving"
        ]
      },
      {
        "index": 4,
        "answer": "up",
        "alternatives": [
          "doing"
        ]
      },
      {
        "index": 5,
        "answer": "breath",
        "alternatives": [
          "blast"
        ]
      },
      {
        "index": 6,
        "answer": "ear",
        "alternatives": [
          "whim"
        ]
      },
      {
        "index": 7,
        "answer": "touch",
        "alternatives": [
          "contact"
        ]
      },
      {
        "index": 8,
        "answer": "it easy",
        "alternatives": [
          "care"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 5,
        "phrase": "breath of fresh air",
        "insight": "Idiom for a positive, new change."
      },
      {
        "index": 6,
        "phrase": "play it by ear",
        "insight": "One of the most used native idioms for being flexible."
      }
    ]
  },
  {
    "id": "social-3-weekend-plans",
    "category": "Social",
    "topic": "Changing Weekend Plans",
    "context": "Cancelling a meeting last-minute without being rude.",
    "characters": [
      {
        "name": "Friend A",
        "description": "Disappointed but kind."
      },
      {
        "name": "Friend B",
        "description": "The one cancelling."
      }
    ],
    "dialogue": [
      {
        "speaker": "Friend A",
        "text": "Hey, how’s it ________? So, about the weekend, are you still free?"
      },
      {
        "speaker": "Friend B",
        "text": "I was thinking we could grab a coffee. How does that ________?"
      },
      {
        "speaker": "Friend A",
        "text": "Saturday works for me, but we could also play it by ________, depending on the weather."
      },
      {
        "speaker": "Friend B",
        "text": "Around four-ish? Yeah, that makes ________."
      },
      {
        "speaker": "Friend B",
        "text": "Hey, quick message. I just wanted to let you know that something has ________ up."
      },
      {
        "speaker": "Friend A",
        "text": "Oh right. What happened?"
      },
      {
        "speaker": "Friend B",
        "text": "To be honest, I’ve had to help out at home unexpectedly. That’s a bit of a shame, but fair ________."
      },
      {
        "speaker": "Friend B",
        "text": "Yeah, it’s a ________, but there’s not much I can do. These things ________."
      },
      {
        "speaker": "Friend B",
        "text": "I didn’t want to mess you around. Would Sunday work, or would you rather ________ leave it?"
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "going",
        "alternatives": [
          "moving"
        ]
      },
      {
        "index": 2,
        "answer": "sound",
        "alternatives": [
          "work"
        ]
      },
      {
        "index": 3,
        "answer": "ear",
        "alternatives": [
          "whim"
        ]
      },
      {
        "index": 4,
        "answer": "sense",
        "alternatives": [
          "logic"
        ]
      },
      {
        "index": 5,
        "answer": "come",
        "alternatives": [
          "cropped"
        ]
      },
      {
        "index": 6,
        "answer": "enough",
        "alternatives": [
          "play"
        ]
      },
      {
        "index": 7,
        "answer": "shame",
        "alternatives": [
          "pity"
        ]
      },
      {
        "index": 8,
        "answer": "happen",
        "alternatives": [
          "occur"
        ]
      },
      {
        "index": 9,
        "answer": "not",
        "alternatives": [
          "rather not"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 5,
        "phrase": "something has come up",
        "insight": "The perfect vague phrase for cancelling without over-explaining."
      },
      {
        "index": 8,
        "phrase": "these things happen",
        "insight": "The native \"social glue\" phrase for accepting an apology for a minor issue."
      }
    ]
  },
  {
    "id": "workplace-3-disagreement-polite",
    "category": "Workplace",
    "topic": "Polite Disagreement at Work",
    "context": "Calibrating a project approach with a colleague.",
    "characters": [
      {
        "name": "Colleague A",
        "description": "Direct."
      },
      {
        "name": "Colleague B",
        "description": "Cautious collaborator."
      }
    ],
    "dialogue": [
      {
        "speaker": "Colleague A",
        "text": "Alright, shall we go straight to the ________?"
      },
      {
        "speaker": "Colleague B",
        "text": "From my ________, I think we should keep the plan fairly simple."
      },
      {
        "speaker": "Colleague A",
        "text": "I see your ________, but I’m not completely convinced."
      },
      {
        "speaker": "Colleague B",
        "text": "To be ________, I think the current plan might be too cautious."
      },
      {
        "speaker": "Colleague A",
        "text": "I can understand that, and that makes ________ in some ways."
      },
      {
        "speaker": "Colleague A",
        "text": "Possibly, but I’m not sure I ________ with that entirely."
      },
      {
        "speaker": "Colleague B",
        "text": "What I ________ is, if something goes wrong, it’ll be harder to fix later. Am I making ________?"
      },
      {
        "speaker": "Colleague A",
        "text": "Fair ________. I guess it comes down to how much uncertainty we’re comfortable with."
      },
      {
        "speaker": "Colleague B",
        "text": "I hear that, but I beg to ________ slightly. Stability matters more."
      },
      {
        "speaker": "Colleague A",
        "text": "The point is ________, we could test things on a smaller scale first."
      },
      {
        "speaker": "Colleague B",
        "text": "Sounds like a ________. Shall we move ________ to the next item?"
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "point",
        "alternatives": [
          "issue"
        ]
      },
      {
        "index": 2,
        "answer": "perspective",
        "alternatives": [
          "view"
        ]
      },
      {
        "index": 3,
        "answer": "point",
        "alternatives": [
          "argument"
        ]
      },
      {
        "index": 4,
        "answer": "honest",
        "alternatives": [
          "frank"
        ]
      },
      {
        "index": 5,
        "answer": "sense",
        "alternatives": [
          "logic"
        ]
      },
      {
        "index": 6,
        "answer": "agree",
        "alternatives": [
          "concur"
        ]
      },
      {
        "index": 7,
        "answer": "mean",
        "alternatives": [
          "want to say"
        ]
      },
      {
        "index": 8,
        "answer": "sense",
        "alternatives": [
          "myself clear"
        ]
      },
      {
        "index": 9,
        "answer": "enough",
        "alternatives": [
          "point taken"
        ]
      },
      {
        "index": 10,
        "answer": "differ",
        "alternatives": [
          "disagree"
        ]
      },
      {
        "index": 11,
        "answer": "this",
        "alternatives": []
      },
      {
        "index": 12,
        "answer": "plan",
        "alternatives": [
          "compromise",
          "solution"
        ]
      },
      {
        "index": 13,
        "answer": "on",
        "alternatives": [
          "forward"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "straight to the point",
        "insight": "Professional request for efficiency."
      },
      {
        "index": 10,
        "phrase": "beg to differ",
        "insight": "The classic, ultra-polite way to express a strong disagreement."
      }
    ],
    "chunkFeedback": [
      {
        "chunkId": "workplace-3-disagreement-polite-b9",
        "blankIndex": 9,
        "chunk": "enough",
        "category": "Disagreement",
        "coreFunction": "Acknowledges opponent's point while preparing counter-argument or pivot.",
        "situations": [
          {
            "context": "Work disagreement",
            "example": "Fair enough, but have we considered the budget?"
          },
          {
            "context": "Negotiation concession",
            "example": "Fair enough, let's try your approach first."
          },
          {
            "context": "Debate acknowledgment",
            "example": "Fair enough, though I still have concerns."
          }
        ],
        "nativeUsageNotes": [
          "Always \"fair enough\" (never \"enough fair\" or \"fairly enough\")",
          "Signals agreement WITHOUT full commitment",
          "Creates bridge to next point while maintaining respect",
          "Common in professional disagreements to soften stance"
        ],
        "nonNativeContrast": [
          {
            "nonNative": "Okay, you are correct.",
            "native": "Fair enough.",
            "explanation": "Native version is shorter and maintains equal status, avoiding submission."
          },
          {
            "nonNative": "I agree with your point completely.",
            "native": "Fair enough, but let me add...",
            "explanation": "Native version shows partial agreement while preserving space to disagree."
          }
        ]
      }
    ]
  },
  {
    "id": "workplace-4-asking-help",
    "category": "Workplace",
    "topic": "Asking for Help (Without Weakness)",
    "context": "Enlisting a colleague’s expertise for a second opinion.",
    "characters": [
      {
        "name": "Colleague",
        "description": "Expert."
      },
      {
        "name": "You",
        "description": "Confident but careful user."
      }
    ],
    "dialogue": [
      {
        "speaker": "You",
        "text": "Hi, how’s it ________? Have you got a minute?"
      },
      {
        "speaker": "You",
        "text": "Well, to be ________, I was hoping you could help me with something."
      },
      {
        "speaker": "You",
        "text": "Could you do me a ________ and take a quick look at this? I just want a second opinion."
      },
      {
        "speaker": "Colleague",
        "text": "Yeah, of course. Go ________."
      },
      {
        "speaker": "You",
        "text": "From my ________, it looks fine, but I’m not completely sure."
      },
      {
        "speaker": "You",
        "text": "I see your ________, but do you think this part is clear enough?"
      },
      {
        "speaker": "You",
        "text": "Right. That makes ________. I was worried it might be a bit confusing."
      },
      {
        "speaker": "You",
        "text": "To be honest, I didn’t want to bother you, but I didn’t want to get it wrong either."
      },
      {
        "speaker": "You",
        "text": "I really appreciate your ________. Don’t ________, happy to help."
      },
      {
        "speaker": "You",
        "text": "Do you mind if I ________ one small change? I’ll ________ it here."
      },
      {
        "speaker": "You",
        "text": "Let’s keep in ________. Take ________."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "going",
        "alternatives": [
          "moving"
        ]
      },
      {
        "index": 2,
        "answer": "honest",
        "alternatives": [
          "frank"
        ]
      },
      {
        "index": 3,
        "answer": "favour",
        "alternatives": [
          "hand"
        ]
      },
      {
        "index": 4,
        "answer": "ahead",
        "alternatives": [
          "on then"
        ]
      },
      {
        "index": 5,
        "answer": "perspective",
        "alternatives": [
          "view"
        ]
      },
      {
        "index": 6,
        "answer": "point",
        "alternatives": [
          "idea"
        ]
      },
      {
        "index": 7,
        "answer": "sense",
        "alternatives": [
          "logic"
        ]
      },
      {
        "index": 8,
        "answer": "help",
        "alternatives": [
          "time"
        ]
      },
      {
        "index": 9,
        "answer": "mention it",
        "alternatives": [
          "worry"
        ]
      },
      {
        "index": 10,
        "answer": "make",
        "alternatives": [
          "change"
        ]
      },
      {
        "index": 11,
        "answer": "leave",
        "alternatives": [
          "finish"
        ]
      },
      {
        "index": 12,
        "answer": "touch",
        "alternatives": [
          "contact"
        ]
      },
      {
        "index": 13,
        "answer": "care",
        "alternatives": [
          "care of you",
          "care about"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 3,
        "phrase": "do me a favour",
        "insight": "Actually makes the other person feel valued, rather than bothered."
      },
      {
        "index": 11,
        "phrase": "leave it here",
        "insight": "Excellent phrase for ending a collaboration session cleanly."
      }
    ]
  },
  {
    "id": "social-4-daily-routines",
    "category": "Social",
    "topic": "Daily Life & Routines",
    "context": "Discussing work-life balance and weekend habits.",
    "characters": [
      {
        "name": "Jack",
        "description": "Curious flatmate."
      },
      {
        "name": "You",
        "description": "Balanced professional."
      }
    ],
    "dialogue": [
      {
        "speaker": "Jack",
        "text": "So, what do you usually do after work?"
      },
      {
        "speaker": "You",
        "text": "I usually ________ home, have a quick ________, and then ________ for a while."
      },
      {
        "speaker": "Jack",
        "text": "Sounds relaxed. Do you go out during the week?"
      },
      {
        "speaker": "You",
        "text": "Not very often. I mostly stay ________, but sometimes I ________ friends."
      },
      {
        "speaker": "Jack",
        "text": "And what about weekends?"
      },
      {
        "speaker": "You",
        "text": "On weekends, I try to ________ up early, ________ some exercise, and ________ myself."
      },
      {
        "speaker": "Jack",
        "text": "Do you prefer living with others or living ________?"
      },
      {
        "speaker": "You",
        "text": "It’s more ________, and I can be more ________ with my time."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "head",
        "alternatives": [
          "go",
          "get",
          "walk"
        ]
      },
      {
        "index": 2,
        "answer": "bite",
        "alternatives": [
          "rest",
          "break"
        ]
      },
      {
        "index": 3,
        "answer": "unwind",
        "alternatives": [
          "relax",
          "switch off"
        ]
      },
      {
        "index": 4,
        "answer": "in",
        "alternatives": [
          "home",
          "indoors"
        ]
      },
      {
        "index": 5,
        "answer": "catch up with",
        "alternatives": [
          "see",
          "meet"
        ]
      },
      {
        "index": 6,
        "answer": "get",
        "alternatives": [
          "wake",
          "be"
        ]
      },
      {
        "index": 7,
        "answer": "do",
        "alternatives": [
          "get",
          "fit in"
        ]
      },
      {
        "index": 8,
        "answer": "enjoy",
        "alternatives": [
          "take it easy",
          "slow down"
        ]
      },
      {
        "index": 9,
        "answer": "on my own",
        "alternatives": [
          "alone",
          "by myself"
        ]
      },
      {
        "index": 10,
        "answer": "flexible",
        "alternatives": [
          "peaceful",
          "independent",
          "free"
        ]
      },
      {
        "index": 11,
        "answer": "flexible",
        "alternatives": [
          "free",
          "in control",
          "independent"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 3,
        "phrase": "unwind",
        "insight": "More advanced than \"relax\". Very common in native UK English."
      },
      {
        "index": 9,
        "phrase": "on my own",
        "insight": "Very natural UK alternative to \"alone\"."
      }
    ]
  },
  {
    "id": "advanced-4-honesty-tact",
    "category": "Advanced",
    "topic": "Honest Opinion (Tactful)",
    "context": "Providing direct feedback without breaking the relationship.",
    "characters": [
      {
        "name": "Colleague",
        "description": "Seeking validation."
      },
      {
        "name": "You",
        "description": "Tactful supervisor."
      }
    ],
    "dialogue": [
      {
        "speaker": "Colleague",
        "text": "From my perspective, the idea has potential. What do you think?"
      },
      {
        "speaker": "You",
        "text": "Well, to be ________, I think the concept is interesting."
      },
      {
        "speaker": "You",
        "text": "I see your ________, but from my ________, there are significant risks."
      },
      {
        "speaker": "You",
        "text": "The point is ________, we don’t have to ignore the risk to keep moving."
      },
      {
        "speaker": "You",
        "text": "On the other ________, if we address this now, the results will be much ________."
      },
      {
        "speaker": "You",
        "text": "I appreciate you being ________ to this discussion."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "honest",
        "alternatives": [
          "frank",
          "straight"
        ]
      },
      {
        "index": 2,
        "answer": "point",
        "alternatives": [
          "argument",
          "view"
        ]
      },
      {
        "index": 3,
        "answer": "perspective",
        "alternatives": [
          "side",
          "point of view"
        ]
      },
      {
        "index": 4,
        "answer": "this",
        "alternatives": []
      },
      {
        "index": 5,
        "answer": "hand",
        "alternatives": [
          "side"
        ]
      },
      {
        "index": 6,
        "answer": "stronger",
        "alternatives": [
          "clearer",
          "better"
        ]
      },
      {
        "index": 7,
        "answer": "open",
        "alternatives": [
          "receptive",
          "amenable"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "To be honest",
        "insight": "The classic \"softener\" for an opposing opinion."
      },
      {
        "index": 5,
        "phrase": "on the other hand",
        "insight": "Perfect transition for showing the positive side of a critique."
      }
    ]
  },
  {
    "id": "social-5-running-into",
    "category": "Social",
    "topic": "Running into Someone",
    "context": "A street encounter with surprise and quick catch-up.",
    "characters": [
      {
        "name": "Person A",
        "description": "Surprised."
      },
      {
        "name": "You",
        "description": "Happy to chat."
      }
    ],
    "dialogue": [
      {
        "speaker": "Person A",
        "text": "Oh wow, hi! I didn’t expect to see you here. How’s it ________?"
      },
      {
        "speaker": "You",
        "text": "Yeah, what are the chances? Not too bad, actually. You?"
      },
      {
        "speaker": "Person A",
        "text": "Great. It’s a ________ to run into you. What have you been ________ to lately?"
      },
      {
        "speaker": "You",
        "text": "A bit of this and that. I’m in a bit of a ________, but we should catch up properly."
      },
      {
        "speaker": "You",
        "text": "Anyway, I won’t ________ the point. Let’s keep in ________."
      },
      {
        "speaker": "You",
        "text": "Take ________."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "going",
        "alternatives": [
          "moving"
        ]
      },
      {
        "index": 2,
        "answer": "pleasure",
        "alternatives": [
          "surprise"
        ]
      },
      {
        "index": 3,
        "answer": "up",
        "alternatives": [
          "doing"
        ]
      },
      {
        "index": 4,
        "answer": "hurry",
        "alternatives": [
          "rush"
        ]
      },
      {
        "index": 5,
        "answer": "labour",
        "alternatives": [
          "push"
        ]
      },
      {
        "index": 6,
        "answer": "touch",
        "alternatives": [
          "contact"
        ]
      },
      {
        "index": 7,
        "answer": "care",
        "alternatives": [
          "care about you",
          "care of you"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 2,
        "phrase": "what are the chances",
        "insight": "The standard native way to comment on an unexpected encounter."
      }
    ]
  },
  {
    "id": "service-5-security",
    "category": "Service/Logistics",
    "topic": "Airport Security",
    "context": "Getting through the security line smoothly.",
    "characters": [
      {
        "name": "Security",
        "description": "Official."
      },
      {
        "name": "You",
        "description": "Traveler."
      }
    ],
    "dialogue": [
      {
        "speaker": "Security",
        "text": "Good morning. Are you carrying any liquids, sharp objects, or ________ items?"
      },
      {
        "speaker": "You",
        "text": "No, nothing like ________."
      },
      {
        "speaker": "Security",
        "text": "Did you pack your bags ________?"
      },
      {
        "speaker": "You",
        "text": "Yes, I packed them ________."
      },
      {
        "speaker": "Security",
        "text": "Please place your electronics in a separate ________."
      },
      {
        "speaker": "You",
        "text": "Sure. Here you ________."
      },
      {
        "speaker": "Security",
        "text": "Alright. Go ________ the scanner, please."
      },
      {
        "speaker": "You",
        "text": "Perfect. Thank you for your ________."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "prohibited",
        "alternatives": [
          "restricted",
          "dangerous"
        ]
      },
      {
        "index": 2,
        "answer": "that",
        "alternatives": [
          "that at all"
        ]
      },
      {
        "index": 3,
        "answer": "yourself",
        "alternatives": [
          "on your own"
        ]
      },
      {
        "index": 4,
        "answer": "myself",
        "alternatives": []
      },
      {
        "index": 5,
        "answer": "tray",
        "alternatives": [
          "bin"
        ]
      },
      {
        "index": 6,
        "answer": "go",
        "alternatives": [
          "are"
        ]
      },
      {
        "index": 7,
        "answer": "through",
        "alternatives": []
      },
      {
        "index": 8,
        "answer": "patience",
        "alternatives": [
          "help"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 3,
        "phrase": "pack your bags yourself",
        "insight": "Universal requirement for air travel safety."
      }
    ]
  },
  {
    "id": "workplace-5-marketing-sync",
    "category": "Workplace",
    "topic": "Marketing Sync-up",
    "context": "A quick talk about project status and blockers.",
    "characters": [
      {
        "name": "Sam",
        "description": "Lead."
      },
      {
        "name": "You",
        "description": "Strategist."
      }
    ],
    "dialogue": [
      {
        "speaker": "Sam",
        "text": "Hi there! Do you have a minute to ________? I want to make sure the campaign is ________."
      },
      {
        "speaker": "You",
        "text": "Hey Sam. Yes, of course. ________, how’s it going?"
      },
      {
        "speaker": "You",
        "text": "From my ________, things are looking good, but we have one ________ issue."
      },
      {
        "speaker": "You",
        "text": "I just wanted to ________ this concern before launch."
      },
      {
        "speaker": "Sam",
        "text": "I appreciate you being ________ to the discussion. Let’s ________ this offline."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "touch base",
        "alternatives": [
          "talk",
          "chat"
        ]
      },
      {
        "index": 2,
        "answer": "on track",
        "alternatives": [
          "moving"
        ]
      },
      {
        "index": 3,
        "answer": "Actually",
        "alternatives": []
      },
      {
        "index": 4,
        "answer": "perspective",
        "alternatives": [
          "view"
        ]
      },
      {
        "index": 5,
        "answer": "timing",
        "alternatives": [
          "delivery"
        ]
      },
      {
        "index": 6,
        "answer": "flag",
        "alternatives": [
          "raise",
          "highlight"
        ]
      },
      {
        "index": 7,
        "answer": "open",
        "alternatives": [
          "receptive",
          "responsive"
        ]
      },
      {
        "index": 8,
        "answer": "discuss",
        "alternatives": [
          "tackle",
          "hash out"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "touch base",
        "insight": "The most common corporate idiom for a short check-in."
      }
    ]
  },
  {
    "id": "social-6-career-decisions",
    "category": "Social",
    "topic": "Talk about Career Decisions",
    "context": "Sharing advice over coffee in a busy café.",
    "characters": [
      {
        "name": "Jamie",
        "description": "Stressed."
      },
      {
        "name": "You",
        "description": "Advisor."
      }
    ],
    "dialogue": [
      {
        "speaker": "Jamie",
        "text": "Sorry I’m late! Shall we ________ and grab a bite?"
      },
      {
        "speaker": "You",
        "text": "No worries! How’s it going? You look like you’ve had a ________ week."
      },
      {
        "speaker": "Jamie",
        "text": "I have. I’m thinking about leaving my job."
      },
      {
        "speaker": "You",
        "text": "Well, to be ________, I’d probably stay put for now."
      },
      {
        "speaker": "You",
        "text": "I see your ________, but moving right now might be ________."
      },
      {
        "speaker": "You",
        "text": "You can always play it by ________ and see how things go."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "sit down",
        "alternatives": [
          "grab a table"
        ]
      },
      {
        "index": 2,
        "answer": "long",
        "alternatives": [
          "tough",
          "hectic"
        ]
      },
      {
        "index": 3,
        "answer": "honest",
        "alternatives": [
          "frank"
        ]
      },
      {
        "index": 4,
        "answer": "point",
        "alternatives": [
          "logic"
        ]
      },
      {
        "index": 5,
        "answer": "risky",
        "alternatives": [
          "tough"
        ]
      },
      {
        "index": 6,
        "answer": "ear",
        "alternatives": [
          "whim"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 2,
        "phrase": "long week",
        "insight": "The understated native way to say a week was exhausting."
      }
    ]
  },
  {
    "id": "social-7-house-rules",
    "category": "Social",
    "topic": "Settling Into a London Shared House",
    "context": "A friendly conversation with your new flatmate about house rules, responsibilities, and expectations. The goal is to understand norms around shared spaces, waste disposal, and noise levels, while confirming you're an easy-going person who respects boundaries.",
    "characters": [
      {
        "name": "Alex",
        "description": "Flatmate—helpful and reassuring about house norms."
      },
      {
        "name": "You",
        "description": "Newcomer to the shared house."
      }
    ],
    "dialogue": [
      {
        "speaker": "Alex",
        "text": "Welcome back. What have you been ________?"
      },
      {
        "speaker": "You",
        "text": "Not too much. ________, I was wondering about the kitchen rules."
      },
      {
        "speaker": "Alex",
        "text": "Oh, it's pretty ________. We just try to keep things ________."
      },
      {
        "speaker": "You",
        "text": "That makes ________. I'm not ________ at all, I'm pretty easy-going."
      },
      {
        "speaker": "You",
        "text": "By the way, what's the protocol for ________ trash?"
      },
      {
        "speaker": "Alex",
        "text": "Oh, sure. The bins go out on Thursday mornings. We ________ taking turns putting them out."
      },
      {
        "speaker": "You",
        "text": "________ we recycle cans and bottles?"
      },
      {
        "speaker": "Alex",
        "text": "Yeah. There's a bin storage area round the back. Just keep waste and recycling ________."
      },
      {
        "speaker": "You",
        "text": "That's helpful. Hey, I'm also curious about noise hours. Do you have any ________ about guests in the evenings?"
      },
      {
        "speaker": "Alex",
        "text": "We're pretty ________. Most of us finish up around 10 or 11, so if you're planning something ________, just give us a heads up beforehand."
      },
      {
        "speaker": "You",
        "text": "Fair ________. I appreciate that—I'll let you know if I'm planning anything."
      },
      {
        "speaker": "Alex",
        "text": "Brilliant. We also have a shared WhatsApp group for any urgent messages."
      }
    ],
    "answerVariations": [
      {
        "index": 0,
        "answer": "up to",
        "alternatives": [
          "doing",
          "been up to"
        ]
      },
      {
        "index": 1,
        "answer": "Actually",
        "alternatives": [
          "To be honest",
          "Well"
        ]
      },
      {
        "index": 2,
        "answer": "relaxed",
        "alternatives": [
          "flexible",
          "laid-back"
        ]
      },
      {
        "index": 3,
        "answer": "tidy",
        "alternatives": [
          "clean",
          "neat"
        ]
      },
      {
        "index": 4,
        "answer": "sense",
        "alternatives": [
          "logic",
          "point"
        ]
      },
      {
        "index": 5,
        "answer": "fussy",
        "alternatives": [
          "picky",
          "particular"
        ]
      },
      {
        "index": 6,
        "answer": "disposing of",
        "alternatives": [
          "taking out",
          "throwing out"
        ]
      },
      {
        "index": 7,
        "answer": "take",
        "alternatives": [
          "rotate",
          "share"
        ]
      },
      {
        "index": 8,
        "answer": "Should",
        "alternatives": [
          "Do",
          "Are"
        ]
      },
      {
        "index": 9,
        "answer": "separate",
        "alternatives": [
          "kept apart",
          "divided"
        ]
      },
      {
        "index": 10,
        "answer": "ground rules",
        "alternatives": [
          "guidelines",
          "expectations"
        ]
      },
      {
        "index": 11,
        "answer": "laid-back",
        "alternatives": [
          "relaxed",
          "easy-going"
        ]
      },
      {
        "index": 12,
        "answer": "noisy",
        "alternatives": [
          "loud",
          "rowdy"
        ]
      },
      {
        "index": 13,
        "answer": "enough",
        "alternatives": [
          "sure",
          "cool"
        ]
      }
    ],
    "chunkFeedbackV2": [
      {
        "chunkId": "social-7-house-rules-b0",
        "native": "up to",
        "learner": {
          "meaning": "A casual way to ask what someone has been doing recently.",
          "useWhen": "When you run into a friend or flatmate and want to catch up.",
          "commonWrong": "What have you done?",
          "fix": "What have you been up to?",
          "whyOdd": "'Done' sounds too formal; 'up to' is the everyday phrase for current activity."
        },
        "examples": [
          "What have you been up to since we last spoke?"
        ]
      },
      {
        "chunkId": "social-7-house-rules-b1",
        "native": "Actually",
        "learner": {
          "meaning": "A soft way to shift topics or introduce a new idea.",
          "useWhen": "When you want to move from small talk to something you're curious about.",
          "commonWrong": "But, I was wondering...",
          "fix": "Actually, I was wondering...",
          "whyOdd": "Softer than 'but'; it signals a gentle topic change without sounding abrupt."
        },
        "examples": [
          "That sounds good, actually."
        ]
      },
      {
        "chunkId": "social-7-house-rules-b2",
        "native": "relaxed",
        "learner": {
          "meaning": "Not strict or demanding about rules.",
          "useWhen": "When describing casual, easy-going norms in a shared space.",
          "commonWrong": "We are not strict.",
          "fix": "It's pretty relaxed.",
          "whyOdd": "Direct negation sounds stiff; 'relaxed' is the natural, positive description."
        },
        "examples": [
          "The dress code is pretty relaxed."
        ]
      },
      {
        "chunkId": "social-7-house-rules-b3",
        "native": "tidy",
        "learner": {
          "meaning": "Clean and organized.",
          "useWhen": "When describing expectations for shared spaces.",
          "commonWrong": "keep things organized",
          "fix": "keep things tidy",
          "whyOdd": "'Organized' can mean structured; 'tidy' specifically means neat and clean."
        },
        "examples": [
          "The bathroom is nice and tidy."
        ]
      },
      {
        "chunkId": "social-7-house-rules-b4",
        "native": "makes sense",
        "learner": {
          "meaning": "Shows that you understand and agree with what was just said.",
          "useWhen": "When someone explains a rule or idea and you want to confirm understanding.",
          "commonWrong": "I understand.",
          "fix": "That makes sense.",
          "whyOdd": "'I understand' sounds stiff; 'makes sense' is friendly and natural."
        },
        "examples": [
          "We recycle, so there's a bin every Friday. That makes sense."
        ]
      },
      {
        "chunkId": "social-7-house-rules-b5",
        "native": "fussy",
        "learner": {
          "meaning": "Hard to please; caring about small details in a way that might annoy others.",
          "useWhen": "When you want to reassure someone that you're easy-going about small things.",
          "commonWrong": "I'm not particular.",
          "fix": "I'm not fussy.",
          "whyOdd": "'Particular' is formal; 'fussy' is a common UK word for being picky."
        },
        "examples": [
          "Don't worry—I'm not fussy about exactly when the kitchen gets cleaned."
        ]
      },
      {
        "chunkId": "social-7-house-rules-b6",
        "native": "disposing of",
        "learner": {
          "meaning": "Getting rid of something, especially waste or trash.",
          "useWhen": "When asking about formal or official procedures for waste.",
          "commonWrong": "throwing trash",
          "fix": "disposing of trash",
          "whyOdd": "'Throwing' is informal; 'disposing of' is the proper, polite form."
        },
        "examples": [
          "What's the protocol for disposing of recycling?"
        ]
      },
      {
        "chunkId": "social-7-house-rules-b7",
        "native": "take",
        "learner": {
          "meaning": "Share responsibility in a rotating pattern.",
          "useWhen": "When talking about fairness and shared duties in a group.",
          "commonWrong": "we rotate turns putting them out",
          "fix": "we take turns putting them out",
          "whyOdd": "'Rotate turns' is clumsy; 'take turns' is the standard phrase."
        },
        "examples": [
          "We take turns cooking on weekends."
        ]
      },
      {
        "chunkId": "social-7-house-rules-b8",
        "native": "Should",
        "learner": {
          "meaning": "A soft way to ask a permission or confirmation question.",
          "useWhen": "When you're politely checking what's OK to do.",
          "commonWrong": "Do we recycle?",
          "fix": "Should we recycle?",
          "whyOdd": "'Should' signals 'is it OK?'; 'Do' is just asking about fact."
        },
        "examples": [
          "Should I bring my own tea bags?"
        ]
      },
      {
        "chunkId": "social-7-house-rules-b9",
        "native": "separate",
        "learner": {
          "meaning": "Keep two things apart or distinct.",
          "useWhen": "When giving instructions on how to organize waste.",
          "commonWrong": "keep waste and recycling different",
          "fix": "keep waste and recycling separate",
          "whyOdd": "'Different' is vague; 'separate' clearly means they should not mix."
        },
        "examples": [
          "Please keep the clean and dirty dishes separate."
        ]
      },
      {
        "chunkId": "social-7-house-rules-b10",
        "native": "ground rules",
        "learner": {
          "meaning": "Basic expectations or guidelines that everyone should follow.",
          "useWhen": "When asking about what's expected in a shared space.",
          "commonWrong": "any rules",
          "fix": "any ground rules",
          "whyOdd": "'Ground rules' is more formal and sounds like you're asking about established norms."
        },
        "examples": [
          "Are there any ground rules about shower times?"
        ]
      },
      {
        "chunkId": "social-7-house-rules-b11",
        "native": "laid-back",
        "learner": {
          "meaning": "Relaxed and not strict; casual about rules.",
          "useWhen": "When describing people or an atmosphere that is easy-going.",
          "commonWrong": "we are relaxed",
          "fix": "We're pretty laid-back.",
          "whyOdd": "'Laid-back' is a common phrase to describe attitude; 'relaxed' is less natural in this context."
        },
        "examples": [
          "The whole vibe here is laid-back."
        ]
      },
      {
        "chunkId": "social-7-house-rules-b12",
        "native": "noisy",
        "learner": {
          "meaning": "Making a lot of sound; loud.",
          "useWhen": "When describing loud or rambunctious activity.",
          "commonWrong": "loud",
          "fix": "noisy",
          "whyOdd": "'Noisy' often implies raucousness or disruption; 'loud' is more neutral."
        },
        "examples": [
          "It's OK if you're noisy after 10pm as long as you give a heads up."
        ]
      },
      {
        "chunkId": "social-7-house-rules-b13",
        "native": "enough",
        "learner": {
          "meaning": "Used in the phrase 'fair enough,' meaning 'I accept that as reasonable.'",
          "useWhen": "When you hear a suggestion or explanation and think it's sensible.",
          "commonWrong": "That's fair.",
          "fix": "Fair enough.",
          "whyOdd": "'Fair enough' is a complete, conversational expression; 'That's fair' is more formal."
        },
        "examples": [
          "You have to give us a heads up first? Fair enough!"
        ]
      }
    ],
    "blanksInOrder": [
      {
        "blankId": "social-7-house-rules-b0",
        "chunkId": "social-7-house-rules-b0"
      },
      {
        "blankId": "social-7-house-rules-b1",
        "chunkId": "social-7-house-rules-b1"
      },
      {
        "blankId": "social-7-house-rules-b2",
        "chunkId": "social-7-house-rules-b2"
      },
      {
        "blankId": "social-7-house-rules-b3",
        "chunkId": "social-7-house-rules-b3"
      },
      {
        "blankId": "social-7-house-rules-b4",
        "chunkId": "social-7-house-rules-b4"
      },
      {
        "blankId": "social-7-house-rules-b5",
        "chunkId": "social-7-house-rules-b5"
      },
      {
        "blankId": "social-7-house-rules-b6",
        "chunkId": "social-7-house-rules-b6"
      },
      {
        "blankId": "social-7-house-rules-b7",
        "chunkId": "social-7-house-rules-b7"
      },
      {
        "blankId": "social-7-house-rules-b8",
        "chunkId": "social-7-house-rules-b8"
      },
      {
        "blankId": "social-7-house-rules-b9",
        "chunkId": "social-7-house-rules-b9"
      },
      {
        "blankId": "social-7-house-rules-b10",
        "chunkId": "social-7-house-rules-b10"
      },
      {
        "blankId": "social-7-house-rules-b11",
        "chunkId": "social-7-house-rules-b11"
      },
      {
        "blankId": "social-7-house-rules-b12",
        "chunkId": "social-7-house-rules-b12"
      },
      {
        "blankId": "social-7-house-rules-b13",
        "chunkId": "social-7-house-rules-b13"
      }
    ],
    "patternSummary": {
      "categoryBreakdown": [
        {
          "category": "Openers",
          "customLabel": "Greeting and topic-shifting",
          "count": 4,
          "exampleChunkIds": [
            "social-7-house-rules-b0",
            "social-7-house-rules-b1",
            "social-7-house-rules-b6",
            "social-7-house-rules-b10"
          ],
          "insight": "Flatmate conversations often start with casual check-ins and soft topic shifts. 'What have you been up to?' opens the chat; 'Actually' smoothly moves from small talk to practical questions."
        },
        {
          "category": "Softening",
          "customLabel": "Diplomatic and reassuring language",
          "count": 6,
          "exampleChunkIds": [
            "social-7-house-rules-b2",
            "social-7-house-rules-b3",
            "social-7-house-rules-b5",
            "social-7-house-rules-b8",
            "social-7-house-rules-b11",
            "social-7-house-rules-b13"
          ],
          "insight": "Natives soften expectations and norms: 'pretty relaxed' avoids sounding strict; 'laid-back' shows attitude; 'fair enough' signals acceptance. These cushion what might otherwise sound blunt or demanding."
        },
        {
          "category": "Idioms",
          "customLabel": "Functional and practical phrases",
          "count": 2,
          "exampleChunkIds": [
            "social-7-house-rules-b4",
            "social-7-house-rules-b7"
          ],
          "insight": "Practical conversations rely on fixed phrases like 'makes sense' (for agreement) and 'take turns' (for shared responsibility). These show you can track agreements and contribute fairly."
        },
        {
          "category": "Exit",
          "customLabel": "Clarity and distinction",
          "count": 2,
          "exampleChunkIds": [
            "social-7-house-rules-b9",
            "social-7-house-rules-b12"
          ],
          "insight": "Clear instructions and descriptions matter: 'separate' (not 'different') shows you understand boundaries; 'noisy' (not just 'loud') gives specificity about what's actually problematic."
        }
      ],
      "overallInsight": "This scenario teaches boundary negotiation in a UK shared house. The native pattern is: open casually, ask politely about norms, show you're easy-going, confirm expectations, and close on friendly terms. Key cultural note: British flatmates expect soft directness—you state what you need without being demanding, and you confirm rules with warm reassurance ('laid-back,' 'fair enough'). Dodging the conversation makes people suspicious; engaging respectfully builds trust.",
      "keyPatterns": [
        {
          "pattern": "Soft confirmation before new topics",
          "explanation": "Instead of launching straight into rules, natives check first. 'What have you been up to?' opens warmly, then 'Actually, I was wondering...' signals the shift. This politeness opens doors rather than demanding information.",
          "chunkIds": [
            "social-7-house-rules-b0",
            "social-7-house-rules-b1"
          ]
        },
        {
          "pattern": "Describe norms with softening language, not hard rules",
          "explanation": "When flatmates explain expectations, they soften them: 'pretty relaxed,' 'laid-back,' 'fair enough.' This makes rules sound collaborative, not authoritarian. Natives rarely say 'you must'; they show the culture and invite you in.",
          "chunkIds": [
            "social-7-house-rules-b2",
            "social-7-house-rules-b11",
            "social-7-house-rules-b13"
          ]
        },
        {
          "pattern": "Reassure early about your flexibility",
          "explanation": "Saying 'I'm not fussy' or 'I'm easy-going' pre-emptively removes tension. It signals you're not someone who will create drama over small things, which builds goodwill and makes flatmates more willing to compromise when you do have a real concern.",
          "chunkIds": [
            "social-7-house-rules-b5"
          ]
        }
      ]
    },
    "activeRecall": [
      {
        "id": "social-7-ar-1",
        "prompt": "Choose the chunk a native uses to ask a flatmate what they've been doing recently.",
        "targetChunkIds": [
          "social-7-house-rules-b0"
        ]
      },
      {
        "id": "social-7-ar-2",
        "prompt": "Choose the chunk that softly shifts the topic from small talk to a practical question.",
        "targetChunkIds": [
          "social-7-house-rules-b1"
        ]
      },
      {
        "id": "social-7-ar-3",
        "prompt": "Fill the gap: 'It's pretty ________; we're not too strict about rules.'",
        "targetChunkIds": [
          "social-7-house-rules-b2"
        ]
      },
      {
        "id": "social-7-ar-4",
        "prompt": "Choose the chunk that means 'we share responsibility by rotating who does it.'",
        "targetChunkIds": [
          "social-7-house-rules-b7"
        ]
      },
      {
        "id": "social-7-ar-5",
        "prompt": "Fill the gap: 'Are there any ________ about noise hours?'",
        "targetChunkIds": [
          "social-7-house-rules-b10"
        ]
      },
      {
        "id": "social-7-ar-6",
        "prompt": "Choose the chunk that means 'not demanding about small details.'",
        "targetChunkIds": [
          "social-7-house-rules-b5"
        ]
      },
      {
        "id": "social-7-ar-7",
        "prompt": "Choose the chunk that shows you accept someone's explanation as reasonable.",
        "targetChunkIds": [
          "social-7-house-rules-b13"
        ]
      },
      {
        "id": "social-7-ar-8",
        "prompt": "Fill the gap: 'We're pretty ________; most of us finish up around 10 or 11.'",
        "targetChunkIds": [
          "social-7-house-rules-b11"
        ]
      }
    ]
  },
  {
    "id": "social-8-old-friend",
    "category": "Social",
    "topic": "Catching Up with an Old Friend",
    "context": "Two old friends meet and reconnect.",
    "characters": [
      {
        "name": "Sam",
        "description": "Relaxed."
      },
      {
        "name": "Chris",
        "description": "Busy but friendly."
      }
    ],
    "dialogue": [
      {
        "speaker": "Sam",
        "text": "Chris! Is that you? I haven't seen you in ages."
      },
      {
        "speaker": "Chris",
        "text": "Sam! What a surprise. How ________?"
      },
      {
        "speaker": "Sam",
        "text": "I'm ________, thanks. Just taking a stroll. What have you ________?"
      },
      {
        "speaker": "Chris",
        "text": "Not much, just ________ with work lately. By the way, did you hear about Sarah's wedding?"
      },
      {
        "speaker": "Sam",
        "text": "No! That ________. When is it?"
      },
      {
        "speaker": "Chris",
        "text": "Next month. I still need to ________ if I can make it, though."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "is it going",
        "alternatives": [
          "are you doing",
          "have you been"
        ]
      },
      {
        "index": 2,
        "answer": "doing well",
        "alternatives": [
          "not too bad",
          "pretty good"
        ]
      },
      {
        "index": 3,
        "answer": "been up to",
        "alternatives": [
          "been doing",
          "been up to lately"
        ]
      },
      {
        "index": 4,
        "answer": "swamped",
        "alternatives": [
          "busy",
          "tied up"
        ]
      },
      {
        "index": 5,
        "answer": "sounds nice",
        "alternatives": [
          "sounds good",
          "sounds lovely"
        ]
      },
      {
        "index": 6,
        "answer": "make up my mind",
        "alternatives": [
          "decide",
          "figure out"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "is it going",
        "insight": "The classic warm greeting for friends."
      },
      {
        "index": 4,
        "phrase": "swamped",
        "insight": "A very natural way to describe being busy without sounding stressed."
      },
      {
        "index": 6,
        "phrase": "make up my mind",
        "insight": "Used for decisions that require some thought."
      }
    ]
  },
  {
    "id": "social-9-weekend-plans",
    "category": "Social",
    "topic": "Making Weekend Plans",
    "context": "Two colleagues deciding what to do on Saturday.",
    "characters": [
      {
        "name": "Jo",
        "description": "Proactive."
      },
      {
        "name": "Alex",
        "description": "Flexible."
      }
    ],
    "dialogue": [
      {
        "speaker": "Jo",
        "text": "Hey Alex, any plans for the weekend?"
      },
      {
        "speaker": "Alex",
        "text": "Not yet. I was thinking of just ________."
      },
      {
        "speaker": "Jo",
        "text": "Why don't we go for a hike? The weather is supposed to be ________."
      },
      {
        "speaker": "Alex",
        "text": "That sounds ________. What time were you ________?"
      },
      {
        "speaker": "Jo",
        "text": "Maybe around ten?"
      },
      {
        "speaker": "Alex",
        "text": "Perfect. Let's ________ on Friday to confirm the details."
      },
      {
        "speaker": "Jo",
        "text": "Great. We can always ________ if the weather changes."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "taking it easy",
        "alternatives": [
          "relaxing",
          "staying in"
        ]
      },
      {
        "index": 2,
        "answer": "lovely",
        "alternatives": [
          "nice",
          "bright",
          "pleasant"
        ]
      },
      {
        "index": 3,
        "answer": "like a plan",
        "alternatives": [
          "good",
          "great"
        ]
      },
      {
        "index": 4,
        "answer": "thinking",
        "alternatives": [
          "planning",
          "aiming"
        ]
      },
      {
        "index": 5,
        "answer": "touch base",
        "alternatives": [
          "catch up",
          "check in"
        ]
      },
      {
        "index": 6,
        "answer": "play it by ear",
        "alternatives": [
          "see how it goes",
          "decide then"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "taking it easy",
        "insight": "High-value phrase for \"relaxing\"."
      },
      {
        "index": 2,
        "phrase": "lovely",
        "insight": "British/IELTS 9 favorite for \"good\"."
      },
      {
        "index": 5,
        "phrase": "touch base",
        "insight": "Professional but friendly way to say \"let's talk later\"."
      },
      {
        "index": 6,
        "phrase": "play it by ear",
        "insight": "Idiom for being flexible."
      }
    ]
  },
  {
    "id": "advanced-2-moving-house",
    "category": "Advanced",
    "topic": "Shifting to a New House",
    "context": "A close friend calls to catch up after you've moved. A natural 8-9 minute conversation about the moving experience, settling in, and adjusting to the new place. Very authentic, native-level dialogue with colloquialisms and conversational patterns.",
    "characters": [
      {
        "name": "Sarah",
        "description": "Your close friend, curious and supportive."
      },
      {
        "name": "You",
        "description": "Recently moved to a new house."
      }
    ],
    "dialogue": [
      {
        "speaker": "Sarah",
        "text": "Hey! How's it going? I haven't heard from you in ages. How's the new place?"
      },
      {
        "speaker": "You",
        "text": "Oh Sarah, honestly, it's been quite ________ to adjust, you know?"
      },
      {
        "speaker": "Sarah",
        "text": "Really? I thought you were over the moon about it!"
      },
      {
        "speaker": "You",
        "text": "I am, I mean... I am, but the moving process itself was absolutely ________, mate."
      },
      {
        "speaker": "Sarah",
        "text": "Oh no, what happened?"
      },
      {
        "speaker": "You",
        "text": "Well, for starters, the removals company was three hours ________, so everything got a bit ________ with the schedule."
      },
      {
        "speaker": "Sarah",
        "text": "That's a nightmare. Did you at least get things sorted eventually?"
      },
      {
        "speaker": "You",
        "text": "Yeah, eventually. But honestly, it took its ________ on me. I didn't sleep properly for like two days."
      },
      {
        "speaker": "Sarah",
        "text": "That sounds exhausting. But at least you're in now. How are you finding the place itself?"
      },
      {
        "speaker": "You",
        "text": "Oh, the house is ________, genuinely. The kitchen is amazing, and there's this lovely garden. But there are these ________ little teething problems, you know?"
      },
      {
        "speaker": "Sarah",
        "text": "Like what? Any major issues?"
      },
      {
        "speaker": "You",
        "text": "Nothing serious, thankfully. The boiler's acting up a bit, and we can't quite ________ the heating system yet. It's just typical moving house stuff."
      },
      {
        "speaker": "Sarah",
        "text": "Yeah, it always is. I remember when we moved, it was chaos for weeks. But you get used to it eventually."
      },
      {
        "speaker": "You",
        "text": "That's what everyone keeps saying. Honestly though, I'm starting to ________ it already. The neighbourhood is brilliant. Really friendly people and everything."
      },
      {
        "speaker": "Sarah",
        "text": "Oh, have you met the neighbours then?"
      },
      {
        "speaker": "You",
        "text": "A few, yeah. The couple next door basically turned up on the first day with a cake, which was dead ________. And I met this bloke down the street who's got the same car as me, so we got chatting for like half an hour."
      },
      {
        "speaker": "Sarah",
        "text": "Aw, that's lovely. See? You're already settling in. Are you finding it easy to get around?"
      },
      {
        "speaker": "You",
        "text": "Actually, yeah. The location is spot on, to be honest. It's like five minutes from the train station, and there's a proper ________ of shops nearby. Honestly, I can't ________ how I managed before."
      },
      {
        "speaker": "Sarah",
        "text": "That's brilliant! What about unpacking? That must be taking forever."
      },
      {
        "speaker": "You",
        "text": "Oh mate, don't get me started. I've got boxes literally ________ in every room. Some of it's still unopened from three weeks ago because I can't remember what half of it is!"
      },
      {
        "speaker": "Sarah",
        "text": "Haha, that's the worst part though, isn't it? The unpacking nightmare."
      },
      {
        "speaker": "You",
        "text": "Honestly, it's driving me ________. I've been crackling on, but it's taking way longer than I thought it would. And the thing is, some stuff just doesn't ________ in the space properly, so I'm having to get creative with storage."
      },
      {
        "speaker": "Sarah",
        "text": "Welcome to home ownership! Or renting, or whatever you're doing. It's always a puzzle."
      },
      {
        "speaker": "You",
        "text": "Tell me about it. Although, here's the thing—and I probably shouldn't say this because it's early days—but I think I actually made the right ________. It feels like a fresh start, you know?"
      },
      {
        "speaker": "Sarah",
        "text": "Aww, that's sweet! You deserve it. You've been talking about moving for ages."
      },
      {
        "speaker": "You",
        "text": "Yeah, I have. I mean, it's going to take a bit of time to get my head around everything and make this place feel like home, but I reckon it'll ________. I just need to push through this settling-in period."
      },
      {
        "speaker": "Sarah",
        "text": "You will. Trust me, in a month you'll wonder how you ever lived anywhere else."
      },
      {
        "speaker": "You",
        "text": "I really hope so. The only thing that's been a bit of a mission is getting the internet set up. They gave me a date that went completely pear-shaped."
      },
      {
        "speaker": "Sarah",
        "text": "Of course they did. Internet companies are the worst. Are you sorted now though?"
      },
      {
        "speaker": "You",
        "text": "Finally, yeah. Got it done yesterday. Such a relief because I was honestly going mad without proper wifi—couldn't work from home properly."
      },
      {
        "speaker": "Sarah",
        "text": "Right, yeah, that would drive me up the wall. So work's been okay then? Not too stressed?"
      },
      {
        "speaker": "You",
        "text": "Well, that's the thing. I took time off for the move, which was a godsend, really. But I'm heading back next week, and honestly, I'm a bit worried about balancing everything."
      },
      {
        "speaker": "Sarah",
        "text": "It'll be fine. You'll crack on. You always do."
      },
      {
        "speaker": "You",
        "text": "Yeah, I suppose. I mean, there's still loads to do around the house. I want to get some paint up, maybe sort out the garden properly, but none of that's ________ urgent."
      },
      {
        "speaker": "Sarah",
        "text": "One step at a time, yeah? Don't ________ yourself out trying to do everything at once."
      },
      {
        "speaker": "You",
        "text": "That's fair. You're right. Actually, it'd be nice to just have some mates round, get the housewarming done and dusted. Would you be up for that in a few weeks?"
      },
      {
        "speaker": "Sarah",
        "text": "Absolutely! I'd love to see the place. Count me in."
      },
      {
        "speaker": "You",
        "text": "Brilliant. I'll message you once I've got things a bit more ________ and organized. Right now it's still a bit mad."
      },
      {
        "speaker": "Sarah",
        "text": "No worries. Just keep your ________ up, and before you know it, you'll be completely settled."
      },
      {
        "speaker": "You",
        "text": "Cheers for the pep talk, honestly. I feel better about it all now."
      },
      {
        "speaker": "Sarah",
        "text": "That's what I'm here for! Now seriously, go get some sleep. You sound knackered."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "mental",
        "alternatives": [
          "mad",
          "hectic",
          "intense"
        ]
      },
      {
        "index": 2,
        "answer": "chaotic",
        "alternatives": [
          "mad",
          "insane",
          "crazy"
        ]
      },
      {
        "index": 3,
        "answer": "late",
        "alternatives": [
          "delayed"
        ]
      },
      {
        "index": 4,
        "answer": "mental",
        "alternatives": [
          "hectic",
          "manic"
        ]
      },
      {
        "index": 5,
        "answer": "toll",
        "alternatives": [
          "effect",
          "toll on me"
        ]
      },
      {
        "index": 6,
        "answer": "gorgeous",
        "alternatives": [
          "beautiful",
          "lovely",
          "stunning"
        ]
      },
      {
        "index": 7,
        "answer": "minor",
        "alternatives": [
          "little",
          "tiny"
        ]
      },
      {
        "index": 8,
        "answer": "work out",
        "alternatives": [
          "get",
          "figure out"
        ]
      },
      {
        "index": 9,
        "answer": "get used to",
        "alternatives": [
          "settle into",
          "like"
        ]
      },
      {
        "index": 10,
        "answer": "kind",
        "alternatives": [
          "sweet",
          "lovely",
          "thoughtful"
        ]
      },
      {
        "index": 11,
        "answer": "wealth",
        "alternatives": [
          "bunch",
          "variety"
        ]
      },
      {
        "index": 12,
        "answer": "believe",
        "alternatives": [
          "understand",
          "fathom"
        ]
      },
      {
        "index": 13,
        "answer": "stacked",
        "alternatives": [
          "piled",
          "everywhere"
        ]
      },
      {
        "index": 14,
        "answer": "mental",
        "alternatives": [
          "mad",
          "nuts"
        ]
      },
      {
        "index": 15,
        "answer": "fit",
        "alternatives": [
          "work",
          "squeeze in"
        ]
      },
      {
        "index": 16,
        "answer": "decision",
        "alternatives": [
          "move",
          "choice"
        ]
      },
      {
        "index": 17,
        "answer": "work out",
        "alternatives": [
          "grow on me",
          "click"
        ]
      },
      {
        "index": 18,
        "answer": "particularly",
        "alternatives": []
      },
      {
        "index": 19,
        "answer": "burn",
        "alternatives": [
          "stress",
          "push"
        ]
      },
      {
        "index": 20,
        "answer": "straight",
        "alternatives": [
          "together",
          "sorted"
        ]
      },
      {
        "index": 21,
        "answer": "chin",
        "alternatives": []
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "quite mental",
        "insight": "British slang for \"hectic/chaotic\". Top-tier native expression at IELTS 9."
      },
      {
        "index": 2,
        "phrase": "absolutely chaotic",
        "insight": "Intensity amplification. \"Absolutely\" before negative adjectives = native-level emphasis."
      },
      {
        "index": 5,
        "phrase": "took its toll",
        "insight": "Idiom meaning \"exhausted me/had a negative effect\". Very native, especially British English."
      },
      {
        "index": 9,
        "phrase": "get used to it",
        "insight": "High-frequency collocation. Slightly informal but totally natural."
      },
      {
        "index": 11,
        "phrase": "wealth of shops",
        "insight": "Formal synonym for \"lots of\". Shows range of vocabulary."
      },
      {
        "index": 15,
        "phrase": "fit in the space",
        "insight": "Phrasal verb \"fit in\" = \"have space for\" or \"find room for\"."
      },
      {
        "index": 16,
        "phrase": "made the right decision",
        "insight": "High-value phrase for committing to a choice. Native speakers use \"make the right call/decision\"."
      },
      {
        "index": 17,
        "phrase": "it'll work out",
        "insight": "Phrasal verb \"work out\" = \"resolve itself\" / \"turn out okay\". Optimistic, colloquial."
      },
      {
        "index": 20,
        "phrase": "particularly urgent",
        "insight": "Hedge word \"particularly\" = \"especially/really\". Shows nuance and native confidence."
      }
    ]
  },
  {
    "id": "social-10-new-neighbor",
    "category": "Social",
    "topic": "Meeting a New Neighbor",
    "context": "Welcoming someone who just moved in next door.",
    "characters": [
      {
        "name": "Mrs. Higgins",
        "description": "Welcoming."
      },
      {
        "name": "Mark",
        "description": "New neighbor."
      }
    ],
    "dialogue": [
      {
        "speaker": "Mrs. Higgins",
        "text": "Hello there! I'm Mrs. Higgins from next door."
      },
      {
        "speaker": "Mark",
        "text": "Oh, hi! I'm Mark. ________ you."
      },
      {
        "speaker": "Mrs. Higgins",
        "text": "Welcome to the neighborhood. It's quite ________ here, I hope you like it."
      },
      {
        "speaker": "Mark",
        "text": "Thanks. It seems ________ so far."
      },
      {
        "speaker": "Mrs. Higgins",
        "text": "If you ever need a ________, just let me know."
      },
      {
        "speaker": "Mark",
        "text": "That's very ________ of you. I appreciate it."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "Nice to meet",
        "alternatives": [
          "Pleasure to meet",
          "Good to meet"
        ]
      },
      {
        "index": 2,
        "answer": "peaceful",
        "alternatives": [
          "quiet",
          "residential",
          "calm"
        ]
      },
      {
        "index": 3,
        "answer": "lovely",
        "alternatives": [
          "nice",
          "great",
          "fine"
        ]
      },
      {
        "index": 4,
        "answer": "hand",
        "alternatives": [
          "favor",
          "bit of help"
        ]
      },
      {
        "index": 5,
        "answer": "kind",
        "alternatives": [
          "thoughtful",
          "nice"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "Nice to meet",
        "insight": "Standard, can't go wrong."
      },
      {
        "index": 2,
        "phrase": "peaceful",
        "insight": "Describes an area well—very IELTS friendly."
      },
      {
        "index": 4,
        "phrase": "need a hand",
        "insight": "Native idiom for \"need help\"."
      }
    ]
  },
  {
    "id": "workplace-6-proposal-feedback",
    "category": "Workplace",
    "topic": "Giving Feedback on a Proposal",
    "context": "Discussing a new project timeline with a colleague.",
    "characters": [
      {
        "name": "Taylor",
        "description": "Lead."
      },
      {
        "name": "Alex",
        "description": "Coordinator."
      }
    ],
    "dialogue": [
      {
        "speaker": "Taylor",
        "text": "Thanks for sending over the proposal, Alex."
      },
      {
        "speaker": "Alex",
        "text": "No problem. What did you think?"
      },
      {
        "speaker": "Taylor",
        "text": "Overall, I see your ________. However, I have a slightly ________ view on the timeline."
      },
      {
        "speaker": "Alex",
        "text": "Oh? Is it too ________?"
      },
      {
        "speaker": "Taylor",
        "text": "Possibly. From my ________, it might need some ________ to be realistic."
      },
      {
        "speaker": "Alex",
        "text": "That's fair. Maybe we could ________ the rollout and see?"
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "point",
        "alternatives": [
          "reasoning",
          "logic"
        ]
      },
      {
        "index": 2,
        "answer": "different",
        "alternatives": [
          "alternative",
          "broader"
        ]
      },
      {
        "index": 3,
        "answer": "tight",
        "alternatives": [
          "critical",
          "sensitive"
        ]
      },
      {
        "index": 4,
        "answer": "perspective",
        "alternatives": [
          "point of view",
          "experience"
        ]
      },
      {
        "index": 5,
        "answer": "fine-tuning",
        "alternatives": [
          "refining",
          "adjustment"
        ]
      },
      {
        "index": 6,
        "answer": "pilot",
        "alternatives": [
          "phase",
          "stagger"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 2,
        "phrase": "different view",
        "insight": "A soft way to disagree without being negative."
      },
      {
        "index": 5,
        "phrase": "fine-tuning",
        "insight": "Implies the idea is good, but needs minor changes."
      },
      {
        "index": 6,
        "phrase": "pilot",
        "insight": "Very professional \"corporate\" English for \"testing\"."
      }
    ]
  },
  {
    "id": "workplace-7-ask-help",
    "category": "Workplace",
    "topic": "Asking for Help at Work",
    "context": "Needing assistance with a complex spreadsheet.",
    "characters": [
      {
        "name": "Sarah",
        "description": "Busy."
      },
      {
        "name": "Sam",
        "description": "Needing help."
      }
    ],
    "dialogue": [
      {
        "speaker": "Sam",
        "text": "Hey Sarah, do you ________ a minute?"
      },
      {
        "speaker": "Sarah",
        "text": "Yeah, what's up?"
      },
      {
        "speaker": "Sam",
        "text": "Well, to be ________, I'm a bit ________ with this data."
      },
      {
        "speaker": "Sarah",
        "text": "No worries. What do you need?"
      },
      {
        "speaker": "Sam",
        "text": "Could you do me a ________ and take a ________ look at this formula?"
      },
      {
        "speaker": "Sarah",
        "text": "Sure. Go ________."
      },
      {
        "speaker": "Sam",
        "text": "Thanks, I really ________ your help."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "have got",
        "alternatives": [
          "have"
        ]
      },
      {
        "index": 2,
        "answer": "honest",
        "alternatives": [
          "frank",
          "upfront"
        ]
      },
      {
        "index": 3,
        "answer": "swamped",
        "alternatives": [
          "overwhelmed",
          "busy"
        ]
      },
      {
        "index": 4,
        "answer": "favour",
        "alternatives": [
          "hand"
        ]
      },
      {
        "index": 5,
        "answer": "quick",
        "alternatives": [
          "brief",
          "fast"
        ]
      },
      {
        "index": 6,
        "answer": "ahead",
        "alternatives": [
          "on then"
        ]
      },
      {
        "index": 7,
        "answer": "appreciate",
        "alternatives": [
          "value",
          "thank you for"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "have you got",
        "insight": "Natural British/Common English for \"do you have\"."
      },
      {
        "index": 3,
        "phrase": "swamped",
        "insight": "Great for admitting you're busy/overwhelmed professionally."
      },
      {
        "index": 4,
        "phrase": "do me a favour",
        "insight": "Actually makes the other person feel valued."
      }
    ]
  },
  {
    "id": "workplace-8-handle-mistake",
    "category": "Workplace",
    "topic": "Handling a Mistake at Work",
    "context": "A report was sent with the wrong numbers.",
    "characters": [
      {
        "name": "Manager",
        "description": "Calm."
      },
      {
        "name": "Employee",
        "description": "Responsible."
      }
    ],
    "dialogue": [
      {
        "speaker": "Employee",
        "text": "I'm sorry to ________ you, but something has ________ up."
      },
      {
        "speaker": "Manager",
        "text": "What happened?"
      },
      {
        "speaker": "Employee",
        "text": "To be ________, I made a small mistake on the report."
      },
      {
        "speaker": "Manager",
        "text": "I see. Well, let's ________ down and look at it properly."
      },
      {
        "speaker": "Employee",
        "text": "I've already ________ how to fix it. I'll send a revised version ________."
      },
      {
        "speaker": "Manager",
        "text": "Good. Lesson ________. Let's make sure it doesn't happen again."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "interrupt",
        "alternatives": [
          "bother",
          "disturb"
        ]
      },
      {
        "index": 2,
        "answer": "come",
        "alternatives": [
          "cropped",
          "turned"
        ]
      },
      {
        "index": 3,
        "answer": "honest",
        "alternatives": [
          "frank",
          "upfront"
        ]
      },
      {
        "index": 4,
        "answer": "calm",
        "alternatives": [
          "sit",
          "settle"
        ]
      },
      {
        "index": 5,
        "answer": "figured out",
        "alternatives": [
          "worked out",
          "ironed out"
        ]
      },
      {
        "index": 6,
        "answer": "shortly",
        "alternatives": [
          "soon",
          "in a bit"
        ]
      },
      {
        "index": 7,
        "answer": "learned",
        "alternatives": [
          "learned",
          "noted"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 2,
        "phrase": "something has come up",
        "insight": "The perfect vague phrase for a problem."
      },
      {
        "index": 5,
        "phrase": "figured out",
        "insight": "Collaborative and proactive phrasing."
      },
      {
        "index": 7,
        "phrase": "lesson learned",
        "insight": "Accepts responsibility and signals moving forward."
      }
    ]
  },
  {
    "id": "service-8-restaurant-order",
    "category": "Service/Logistics",
    "topic": "Ordering at a Restaurant",
    "context": "Ordering lunch for two.",
    "characters": [
      {
        "name": "Waiter",
        "description": "Professional."
      },
      {
        "name": "Customer",
        "description": "Polite."
      }
    ],
    "dialogue": [
      {
        "speaker": "Waiter",
        "text": "Are you ready to order, or do you need a ________?"
      },
      {
        "speaker": "Customer",
        "text": "I think we're ________."
      },
      {
        "speaker": "Waiter",
        "text": "Great. What can I get for you?"
      },
      {
        "speaker": "Customer",
        "text": "I'll ________ the grilled fish, please."
      },
      {
        "speaker": "Waiter",
        "text": "Excellent choice. And for you?"
      },
      {
        "speaker": "Customer",
        "text": "Could I have the salad, but ________ the dressing?"
      },
      {
        "speaker": "Waiter",
        "text": "Of course. Anything else?"
      },
      {
        "speaker": "Customer",
        "text": "No, that's ________. Thanks for your ________."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "moment",
        "alternatives": [
          "minute",
          "second"
        ]
      },
      {
        "index": 2,
        "answer": "good",
        "alternatives": [
          "set",
          "ready"
        ]
      },
      {
        "index": 3,
        "answer": "have",
        "alternatives": [
          "take",
          "order"
        ]
      },
      {
        "index": 4,
        "answer": "without",
        "alternatives": [
          "no",
          "easy on"
        ]
      },
      {
        "index": 5,
        "answer": "everything",
        "alternatives": [
          "all",
          "it"
        ]
      },
      {
        "index": 6,
        "answer": "help",
        "alternatives": [
          "assistance",
          "time"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "need a moment",
        "insight": "Standard restaurant etiquette."
      },
      {
        "index": 3,
        "phrase": "I'll have the...",
        "insight": "The most natural way to order."
      },
      {
        "index": 5,
        "phrase": "that's everything",
        "insight": "Signals the end of the order clearly."
      }
    ]
  },
  {
    "id": "service-9-return-faulty",
    "category": "Service/Logistics",
    "topic": "Returning a Faulty Item",
    "context": "Bringing back a toaster that doesn't work.",
    "characters": [
      {
        "name": "Shop Assistant",
        "description": "Polite."
      },
      {
        "name": "Customer",
        "description": "Firm but calm."
      }
    ],
    "dialogue": [
      {
        "speaker": "Shop Assistant",
        "text": "Hello. How can I assist you today?"
      },
      {
        "speaker": "Customer",
        "text": "Hi. I'd like to ________ this toaster, please."
      },
      {
        "speaker": "Shop Assistant",
        "text": "Of course. What seems to be the ________?"
      },
      {
        "speaker": "Customer",
        "text": "It's ________, and it doesn't toast ________."
      },
      {
        "speaker": "Shop Assistant",
        "text": "I see. Do you have the ________?"
      },
      {
        "speaker": "Customer",
        "text": "Yes, here you ________. I'd prefer a ________, if possible."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "return",
        "alternatives": [
          "refund",
          "bring back"
        ]
      },
      {
        "index": 2,
        "answer": "problem",
        "alternatives": [
          "issue",
          "trouble"
        ]
      },
      {
        "index": 3,
        "answer": "faulty",
        "alternatives": [
          "damaged",
          "broken",
          "defective"
        ]
      },
      {
        "index": 4,
        "answer": "properly",
        "alternatives": [
          "correctly",
          "at all"
        ]
      },
      {
        "index": 5,
        "answer": "receipt",
        "alternatives": [
          "proof of purchase"
        ]
      },
      {
        "index": 6,
        "answer": "go",
        "alternatives": [
          "are"
        ]
      },
      {
        "index": 7,
        "answer": "refund",
        "alternatives": [
          "replacement",
          "exchange"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "I'd like to return",
        "insight": "Direct but polite opening."
      },
      {
        "index": 3,
        "phrase": "faulty",
        "insight": "The standard word for \"doesn't work well\"."
      },
      {
        "index": 5,
        "phrase": "receipt",
        "insight": "Essential for returns."
      }
    ]
  },
  {
    "id": "service-10-hotel-checkout",
    "category": "Service/Logistics",
    "topic": "Hotel Checkout with Issues",
    "context": "Checking out of a hotel and addressing unexpected charges.",
    "characters": [
      {
        "name": "Receptionist",
        "description": "Professional."
      },
      {
        "name": "Guest",
        "description": "Concerned."
      }
    ],
    "dialogue": [
      {
        "speaker": "Receptionist",
        "text": "Good morning. How was your ________?"
      },
      {
        "speaker": "Guest",
        "text": "It was lovely, thanks. But I noticed there's a ________ on my bill."
      },
      {
        "speaker": "Receptionist",
        "text": "I see. What seems to be the issue?"
      },
      {
        "speaker": "Guest",
        "text": "I didn't ________ anything from the minibar, but I've been ________."
      },
      {
        "speaker": "Receptionist",
        "text": "Let me check that for you. Can I see your ________?"
      },
      {
        "speaker": "Guest",
        "text": "Of course. I booked a ________ room, not a ________ one."
      },
      {
        "speaker": "Receptionist",
        "text": "You're absolutely ________. I apologize for the error. I'll ________ it immediately."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "stay",
        "alternatives": [
          "visit",
          "time"
        ]
      },
      {
        "index": 2,
        "answer": "charge",
        "alternatives": [
          "fee",
          "cost"
        ]
      },
      {
        "index": 3,
        "answer": "order",
        "alternatives": [
          "take",
          "use"
        ]
      },
      {
        "index": 4,
        "answer": "charged",
        "alternatives": [
          "billed"
        ]
      },
      {
        "index": 5,
        "answer": "room key",
        "alternatives": [
          "keycard",
          "folio"
        ]
      },
      {
        "index": 6,
        "answer": "standard",
        "alternatives": [
          "basic",
          "single"
        ]
      },
      {
        "index": 7,
        "answer": "premium",
        "alternatives": [
          "deluxe",
          "suite"
        ]
      },
      {
        "index": 8,
        "answer": "right",
        "alternatives": [
          "correct"
        ]
      },
      {
        "index": 9,
        "answer": "fix",
        "alternatives": [
          "correct",
          "resolve"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 2,
        "phrase": "charge on my bill",
        "insight": "The polite way to question unexpected costs."
      },
      {
        "index": 8,
        "phrase": "you're absolutely right",
        "insight": "Acknowledgment that signals a quick resolution."
      }
    ]
  },
  {
    "id": "service-31-cafe-full-flow",
    "category": "Service/Logistics",
    "topic": "At a Café (Full 3-Minute Flow)",
    "context": "Ordering a drink at a busy café, handling a beverage issue, and polite conversation with barista.",
    "characters": [
      {
        "name": "Barista",
        "description": "Efficient and busy café staff member"
      },
      {
        "name": "You",
        "description": "Customer"
      }
    ],
    "dialogue": [
      {
        "speaker": "Barista",
        "text": "Hi there. What can I get for you?"
      },
      {
        "speaker": "You",
        "text": "Hi. Can I have a ________ ________, please?"
      },
      {
        "speaker": "Barista",
        "text": "Sure. Would you like it hot or ________?"
      },
      {
        "speaker": "You",
        "text": "________, please."
      },
      {
        "speaker": "Barista",
        "text": "No problem. Any milk preference?"
      },
      {
        "speaker": "You",
        "text": "Yes, ________ milk, please."
      },
      {
        "speaker": "Barista",
        "text": "Anything else?"
      },
      {
        "speaker": "You",
        "text": "I'll also have a ________."
      },
      {
        "speaker": "Barista",
        "text": "Eat in or take ________?"
      },
      {
        "speaker": "You",
        "text": "Eat ________, please."
      },
      {
        "speaker": "Barista",
        "text": "That'll be £5.50. You can pay by card or ________."
      },
      {
        "speaker": "You",
        "text": "Card is ________."
      },
      {
        "speaker": "Barista",
        "text": "Great. Just tap when you're ready."
      },
      {
        "speaker": "You",
        "text": "There you ________."
      },
      {
        "speaker": "Barista",
        "text": "Perfect. Your order will be ready in about ________ minutes."
      },
      {
        "speaker": "You",
        "text": "No ________."
      },
      {
        "speaker": "Barista",
        "text": "Here you go. One ________ ________ and a ________."
      },
      {
        "speaker": "You",
        "text": "Thanks a ________."
      },
      {
        "speaker": "Barista",
        "text": "Careful, it's quite ________."
      },
      {
        "speaker": "You",
        "text": "That's ________. Thank you."
      },
      {
        "speaker": "You",
        "text": "Excuse me, sorry to ________ you."
      },
      {
        "speaker": "Barista",
        "text": "No worries. What's up?"
      },
      {
        "speaker": "You",
        "text": "I think this is supposed to be ________, but it tastes a bit ________."
      },
      {
        "speaker": "Barista",
        "text": "Oh, sorry about that. Would you like me to ________ it?"
      },
      {
        "speaker": "You",
        "text": "Yes, that would be ________, thanks."
      },
      {
        "speaker": "Barista",
        "text": "Give me just a ________."
      },
      {
        "speaker": "Barista",
        "text": "Here you go. I've made it ________ this time."
      },
      {
        "speaker": "You",
        "text": "That's much ________. I really ________ it."
      },
      {
        "speaker": "Barista",
        "text": "Glad to hear that. Are you working today or just ________?"
      },
      {
        "speaker": "You",
        "text": "Just ________. I needed a bit of ________ time."
      },
      {
        "speaker": "Barista",
        "text": "Sounds nice. It's pretty ________ in here today."
      },
      {
        "speaker": "You",
        "text": "Yeah, I like it when it's not too ________."
      },
      {
        "speaker": "Barista",
        "text": "Same. Makes the day feel more ________."
      },
      {
        "speaker": "You",
        "text": "Everything was ________. Thanks for your ________."
      },
      {
        "speaker": "Barista",
        "text": "You're welcome. Have a ________ day."
      },
      {
        "speaker": "You",
        "text": "You ________. See you ________."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "flat white",
        "alternatives": [
          "cappuccino",
          "latte",
          "americano",
          "black coffee"
        ]
      },
      {
        "index": 2,
        "answer": "hot",
        "alternatives": [
          "iced",
          "cold"
        ]
      },
      {
        "index": 3,
        "answer": "hot",
        "alternatives": [
          "iced"
        ]
      },
      {
        "index": 4,
        "answer": "oat",
        "alternatives": [
          "regular",
          "semi-skimmed",
          "skimmed",
          "soy"
        ]
      },
      {
        "index": 5,
        "answer": "croissant",
        "alternatives": [
          "muffin",
          "sandwich",
          "slice of cake",
          "brownie"
        ]
      },
      {
        "index": 6,
        "answer": "away",
        "alternatives": [
          "out"
        ]
      },
      {
        "index": 7,
        "answer": "in",
        "alternatives": [
          "here"
        ]
      },
      {
        "index": 8,
        "answer": "cash",
        "alternatives": []
      },
      {
        "index": 9,
        "answer": "fine",
        "alternatives": [
          "good",
          "perfect",
          "okay"
        ]
      },
      {
        "index": 10,
        "answer": "go",
        "alternatives": []
      },
      {
        "index": 11,
        "answer": "five",
        "alternatives": [
          "two",
          "three"
        ]
      },
      {
        "index": 12,
        "answer": "problem",
        "alternatives": [
          "worries"
        ]
      },
      {
        "index": 13,
        "answer": "flat white",
        "alternatives": [
          "latte",
          "cappuccino"
        ]
      },
      {
        "index": 14,
        "answer": "croissant",
        "alternatives": [
          "muffin",
          "sandwich"
        ]
      },
      {
        "index": 15,
        "answer": "lot",
        "alternatives": [
          "bunch"
        ]
      },
      {
        "index": 16,
        "answer": "hot",
        "alternatives": [
          "warm"
        ]
      },
      {
        "index": 17,
        "answer": "fine",
        "alternatives": [
          "okay",
          "alright"
        ]
      },
      {
        "index": 18,
        "answer": "bother",
        "alternatives": [
          "interrupt"
        ]
      },
      {
        "index": 19,
        "answer": "hot",
        "alternatives": [
          "sweet",
          "strong"
        ]
      },
      {
        "index": 20,
        "answer": "cold",
        "alternatives": [
          "weak",
          "bitter"
        ]
      },
      {
        "index": 21,
        "answer": "remake",
        "alternatives": [
          "change",
          "fix"
        ]
      },
      {
        "index": 22,
        "answer": "great",
        "alternatives": [
          "lovely",
          "perfect"
        ]
      },
      {
        "index": 23,
        "answer": "second",
        "alternatives": [
          "moment"
        ]
      },
      {
        "index": 24,
        "answer": "fresh",
        "alternatives": [
          "hotter",
          "stronger"
        ]
      },
      {
        "index": 25,
        "answer": "better",
        "alternatives": [
          "nicer"
        ]
      },
      {
        "index": 26,
        "answer": "appreciate",
        "alternatives": [
          "like",
          "enjoy"
        ]
      },
      {
        "index": 27,
        "answer": "relaxing",
        "alternatives": [
          "chilling",
          "taking a break"
        ]
      },
      {
        "index": 28,
        "answer": "relaxing",
        "alternatives": [
          "taking it easy",
          "having a break"
        ]
      },
      {
        "index": 29,
        "answer": "quiet",
        "alternatives": [
          "personal",
          "down"
        ]
      },
      {
        "index": 30,
        "answer": "calm",
        "alternatives": [
          "quiet",
          "relaxed"
        ]
      },
      {
        "index": 31,
        "answer": "busy",
        "alternatives": [
          "noisy",
          "crowded"
        ]
      },
      {
        "index": 32,
        "answer": "great",
        "alternatives": [
          "lovely",
          "perfect"
        ]
      },
      {
        "index": 33,
        "answer": "help",
        "alternatives": [
          "service"
        ]
      },
      {
        "index": 34,
        "answer": "nice",
        "alternatives": [
          "good",
          "lovely"
        ]
      },
      {
        "index": 35,
        "answer": "too",
        "alternatives": [
          "as well"
        ]
      },
      {
        "index": 36,
        "answer": "later",
        "alternatives": [
          "soon"
        ]
      },
      {
        "index": 37,
        "answer": "perfect",
        "alternatives": [
          "lovely",
          "nice"
        ]
      },
      {
        "index": 38,
        "answer": "too",
        "alternatives": [
          "as well"
        ]
      },
      {
        "index": 39,
        "answer": "soon",
        "alternatives": [
          "later",
          "around"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "flat white",
        "insight": "Universal IELTS chunk - specific coffee order, very common in UK."
      },
      {
        "index": 6,
        "phrase": "take away",
        "insight": "Phrasal verb: extremely common in British English, native speech marker."
      },
      {
        "index": 10,
        "phrase": "there you go",
        "insight": "Fixed phrase from LOCKED CHUNKS - used constantly by natives."
      },
      {
        "index": 18,
        "phrase": "sorry to bother you",
        "insight": "Polite interruption phrase - shows deference, very natural."
      },
      {
        "index": 26,
        "phrase": "I really appreciate it",
        "insight": "Universal chunk - expresses gratitude in mature, professional way."
      }
    ]
  },
  {
    "id": "service-32-airport-checkin",
    "category": "Service/Logistics",
    "topic": "Airport Check-In (Full 3-Minute Flow)",
    "context": "Checking in at airport counter - passport, bags, seat selection, and flight confirmation.",
    "characters": [
      {
        "name": "Check-in Agent",
        "description": "Professional airport staff member"
      },
      {
        "name": "You",
        "description": "Traveller"
      }
    ],
    "dialogue": [
      {
        "speaker": "Check-in Agent",
        "text": "Good morning. May I see your passport, please?"
      },
      {
        "speaker": "You",
        "text": "Good morning. Here you ________."
      },
      {
        "speaker": "Check-in Agent",
        "text": "Thank you. Where are you flying ________ today?"
      },
      {
        "speaker": "You",
        "text": "I'm flying to ________."
      },
      {
        "speaker": "Check-in Agent",
        "text": "Is this for business or ________?"
      },
      {
        "speaker": "You",
        "text": "It's for ________."
      },
      {
        "speaker": "Check-in Agent",
        "text": "Do you have any bags to ________ in?"
      },
      {
        "speaker": "You",
        "text": "Yes, I have ________ bag."
      },
      {
        "speaker": "Check-in Agent",
        "text": "Please place your bag on the ________."
      },
      {
        "speaker": "You",
        "text": "Sure. Here you ________."
      },
      {
        "speaker": "Check-in Agent",
        "text": "Your bag is ________ kilos, which is fine. Did you pack your bags ________?"
      },
      {
        "speaker": "You",
        "text": "Yes, I packed them ________."
      },
      {
        "speaker": "Check-in Agent",
        "text": "Are you carrying any liquids, sharp objects, or ________ items?"
      },
      {
        "speaker": "You",
        "text": "No, nothing like ________."
      },
      {
        "speaker": "Check-in Agent",
        "text": "Do you have a seat preference? Window or ________?"
      },
      {
        "speaker": "You",
        "text": "A ________ seat, if possible."
      },
      {
        "speaker": "Check-in Agent",
        "text": "Let me check... yes, I can do that. Would you like to sit near the aisle or ________ the wing?"
      },
      {
        "speaker": "You",
        "text": "Near the ________, please."
      },
      {
        "speaker": "Check-in Agent",
        "text": "Alright. Here is your boarding ________."
      },
      {
        "speaker": "Check-in Agent",
        "text": "Boarding starts at ________, and your gate is ________."
      },
      {
        "speaker": "You",
        "text": "Okay. How long does boarding usually ________?"
      },
      {
        "speaker": "Check-in Agent",
        "text": "About ________ minutes."
      },
      {
        "speaker": "You",
        "text": "Great. Is the flight ________ on time?"
      },
      {
        "speaker": "Check-in Agent",
        "text": "Yes, everything looks ________."
      },
      {
        "speaker": "You",
        "text": "Perfect. Thank you for your ________."
      },
      {
        "speaker": "Check-in Agent",
        "text": "You're welcome. Have a ________ flight."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "go",
        "alternatives": [
          "are"
        ]
      },
      {
        "index": 2,
        "answer": "to",
        "alternatives": [
          "out to",
          "off to"
        ]
      },
      {
        "index": 3,
        "answer": "Paris",
        "alternatives": [
          "Berlin",
          "London",
          "Rome"
        ]
      },
      {
        "index": 4,
        "answer": "leisure",
        "alternatives": [
          "holiday",
          "personal travel"
        ]
      },
      {
        "index": 5,
        "answer": "leisure",
        "alternatives": [
          "holiday"
        ]
      },
      {
        "index": 6,
        "answer": "check",
        "alternatives": [
          "check in",
          "put in"
        ]
      },
      {
        "index": 7,
        "answer": "one",
        "alternatives": [
          "just one",
          "a single"
        ]
      },
      {
        "index": 8,
        "answer": "scale",
        "alternatives": [
          "belt",
          "conveyor"
        ]
      },
      {
        "index": 9,
        "answer": "go",
        "alternatives": [
          "are"
        ]
      },
      {
        "index": 10,
        "answer": "about",
        "alternatives": [
          "around",
          "just under"
        ]
      },
      {
        "index": 11,
        "answer": "yourself",
        "alternatives": [
          "on your own"
        ]
      },
      {
        "index": 12,
        "answer": "restricted",
        "alternatives": [
          "dangerous",
          "prohibited"
        ]
      },
      {
        "index": 13,
        "answer": "that",
        "alternatives": [
          "those",
          "that at all"
        ]
      },
      {
        "index": 14,
        "answer": "aisle",
        "alternatives": [
          "middle"
        ]
      },
      {
        "index": 15,
        "answer": "window",
        "alternatives": [
          "aisle"
        ]
      },
      {
        "index": 16,
        "answer": "near",
        "alternatives": [
          "under",
          "by"
        ]
      },
      {
        "index": 17,
        "answer": "aisle",
        "alternatives": [
          "window",
          "front"
        ]
      },
      {
        "index": 18,
        "answer": "pass",
        "alternatives": [
          "card"
        ]
      },
      {
        "index": 19,
        "answer": "six thirty",
        "alternatives": [
          "seven",
          "shortly"
        ]
      },
      {
        "index": 20,
        "answer": "A12",
        "alternatives": [
          "B7",
          "C3"
        ]
      },
      {
        "index": 21,
        "answer": "take",
        "alternatives": [
          "last"
        ]
      },
      {
        "index": 22,
        "answer": "still",
        "alternatives": [
          "running",
          "expected to be"
        ]
      },
      {
        "index": 23,
        "answer": "fine",
        "alternatives": [
          "good",
          "on schedule",
          "normal"
        ]
      },
      {
        "index": 24,
        "answer": "help",
        "alternatives": [
          "assistance"
        ]
      },
      {
        "index": 25,
        "answer": "pleasant",
        "alternatives": [
          "safe",
          "nice"
        ]
      },
      {
        "index": 26,
        "answer": "help",
        "alternatives": [
          "assistance",
          "support"
        ]
      },
      {
        "index": 27,
        "answer": "good",
        "alternatives": [
          "pleasant",
          "nice"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "here you go",
        "insight": "LOCKED CHUNK - universal phrase for handing items over."
      },
      {
        "index": 3,
        "phrase": "leisure",
        "insight": "Standard UK English for vacation/holiday travel."
      },
      {
        "index": 15,
        "phrase": "window seat",
        "insight": "Common preference phrase, natural and native."
      },
      {
        "index": 24,
        "phrase": "help / assistance",
        "insight": "Both are LOCKED CHUNKS; assistance is slightly more formal."
      }
    ]
  },
  {
    "id": "service-33-hotel-checkin",
    "category": "Service/Logistics",
    "topic": "Hotel Check-In (Fill the Blanks)",
    "context": "Arriving at a hotel, checking in, and arranging amenities.",
    "characters": [
      {
        "name": "Receptionist",
        "description": "Professional hotel staff member"
      },
      {
        "name": "You",
        "description": "Guest"
      }
    ],
    "dialogue": [
      {
        "speaker": "Receptionist",
        "text": "Good evening. How can I ________ you?"
      },
      {
        "speaker": "You",
        "text": "Hi, I have a ________ under the name ________."
      },
      {
        "speaker": "Receptionist",
        "text": "Let me check. May I see your ________, please?"
      },
      {
        "speaker": "You",
        "text": "Sure. Here you ________."
      },
      {
        "speaker": "Receptionist",
        "text": "Thank you. You're staying for ________ nights, correct?"
      },
      {
        "speaker": "You",
        "text": "Yes, that's ________."
      },
      {
        "speaker": "Receptionist",
        "text": "Would you like a room with a ________ or a ________ view?"
      },
      {
        "speaker": "You",
        "text": "A ________ view, if possible."
      },
      {
        "speaker": "Receptionist",
        "text": "No problem. Breakfast is ________ from 7 to 10 a.m."
      },
      {
        "speaker": "You",
        "text": "Great. Is Wi-Fi ________ in the room?"
      },
      {
        "speaker": "Receptionist",
        "text": "Yes, it's completely ________."
      },
      {
        "speaker": "You",
        "text": "Perfect. What time is ________?"
      },
      {
        "speaker": "Receptionist",
        "text": "Check-out is at ________."
      },
      {
        "speaker": "You",
        "text": "That's fine. Thank you for your ________."
      },
      {
        "speaker": "Receptionist",
        "text": "You're welcome. Enjoy your ________."
      },
      {
        "speaker": "You",
        "text": "Thanks. Have a ________ evening."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "help",
        "alternatives": [
          "assist"
        ]
      },
      {
        "index": 2,
        "answer": "reservation",
        "alternatives": [
          "booking"
        ]
      },
      {
        "index": 3,
        "answer": "Alex Smith",
        "alternatives": [
          "[Your Name]"
        ]
      },
      {
        "index": 4,
        "answer": "passport",
        "alternatives": [
          "ID"
        ]
      },
      {
        "index": 5,
        "answer": "go",
        "alternatives": [
          "are"
        ]
      },
      {
        "index": 6,
        "answer": "two",
        "alternatives": [
          "one",
          "three",
          "a few"
        ]
      },
      {
        "index": 7,
        "answer": "correct",
        "alternatives": [
          "right",
          "fine"
        ]
      },
      {
        "index": 8,
        "answer": "city",
        "alternatives": [
          "garden",
          "sea",
          "street"
        ]
      },
      {
        "index": 9,
        "answer": "pool",
        "alternatives": [
          "courtyard",
          "mountain"
        ]
      },
      {
        "index": 10,
        "answer": "city",
        "alternatives": [
          "garden",
          "sea",
          "pool"
        ]
      },
      {
        "index": 11,
        "answer": "served",
        "alternatives": [
          "available",
          "included"
        ]
      },
      {
        "index": 12,
        "answer": "available",
        "alternatives": [
          "included",
          "free"
        ]
      },
      {
        "index": 13,
        "answer": "free",
        "alternatives": [
          "included",
          "unlimited"
        ]
      },
      {
        "index": 14,
        "answer": "check-out",
        "alternatives": []
      },
      {
        "index": 15,
        "answer": "eleven",
        "alternatives": [
          "ten",
          "noon"
        ]
      },
      {
        "index": 16,
        "answer": "help",
        "alternatives": [
          "assistance"
        ]
      },
      {
        "index": 17,
        "answer": "stay",
        "alternatives": [
          "visit",
          "time"
        ]
      },
      {
        "index": 18,
        "answer": "pleasant",
        "alternatives": [
          "good",
          "lovely"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "How can I help you?",
        "insight": "LOCKED CHUNK - standard opening for service interactions."
      },
      {
        "index": 2,
        "phrase": "reservation/booking",
        "insight": "Both common; \"booking\" slightly more modern."
      },
      {
        "index": 5,
        "phrase": "here you go",
        "insight": "LOCKED CHUNK - universal for handing items."
      }
    ]
  },
  {
    "id": "service-34-shopping-return",
    "category": "Service/Logistics",
    "topic": "Shopping Return / Refund",
    "context": "Returning a faulty item to a shop for refund or exchange.",
    "characters": [
      {
        "name": "Shop Assistant",
        "description": "Helpful sales staff member"
      },
      {
        "name": "You",
        "description": "Customer"
      }
    ],
    "dialogue": [
      {
        "speaker": "Shop Assistant",
        "text": "Hi there. How can I ________ you?"
      },
      {
        "speaker": "You",
        "text": "Hi. I'd like to ________ this item, please."
      },
      {
        "speaker": "Shop Assistant",
        "text": "Of course. What seems to be the ________?"
      },
      {
        "speaker": "You",
        "text": "It's ________, and it doesn't work ________."
      },
      {
        "speaker": "Shop Assistant",
        "text": "I see. When did you ________ it?"
      },
      {
        "speaker": "You",
        "text": "I bought it ________."
      },
      {
        "speaker": "Shop Assistant",
        "text": "Do you have the ________?"
      },
      {
        "speaker": "You",
        "text": "Yes, here you ________."
      },
      {
        "speaker": "Shop Assistant",
        "text": "Would you like a ________ or an exchange?"
      },
      {
        "speaker": "You",
        "text": "I'd prefer a ________, please."
      },
      {
        "speaker": "Shop Assistant",
        "text": "That's fine. The refund will go back to your original ________."
      },
      {
        "speaker": "You",
        "text": "That's ________."
      },
      {
        "speaker": "Shop Assistant",
        "text": "It should take about ________ days to process."
      },
      {
        "speaker": "You",
        "text": "No ________."
      },
      {
        "speaker": "Shop Assistant",
        "text": "Is there anything else I can ________ you with?"
      },
      {
        "speaker": "You",
        "text": "No, that's ________. Thanks for your ________."
      },
      {
        "speaker": "Shop Assistant",
        "text": "You're welcome. Have a ________ day."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "help",
        "alternatives": [
          "assist"
        ]
      },
      {
        "index": 2,
        "answer": "return",
        "alternatives": [
          "refund",
          "bring back"
        ]
      },
      {
        "index": 3,
        "answer": "problem",
        "alternatives": [
          "issue",
          "trouble"
        ]
      },
      {
        "index": 4,
        "answer": "faulty",
        "alternatives": [
          "damaged",
          "broken",
          "defective"
        ]
      },
      {
        "index": 5,
        "answer": "properly",
        "alternatives": [
          "correctly",
          "at all"
        ]
      },
      {
        "index": 6,
        "answer": "buy",
        "alternatives": [
          "purchase"
        ]
      },
      {
        "index": 7,
        "answer": "last week",
        "alternatives": [
          "yesterday",
          "a few days ago"
        ]
      },
      {
        "index": 8,
        "answer": "receipt",
        "alternatives": [
          "proof of purchase"
        ]
      },
      {
        "index": 9,
        "answer": "go",
        "alternatives": [
          "are"
        ]
      },
      {
        "index": 10,
        "answer": "refund",
        "alternatives": [
          "replacement"
        ]
      },
      {
        "index": 11,
        "answer": "refund",
        "alternatives": [
          "replacement"
        ]
      },
      {
        "index": 12,
        "answer": "payment method",
        "alternatives": [
          "card",
          "account"
        ]
      },
      {
        "index": 13,
        "answer": "fine",
        "alternatives": [
          "okay",
          "perfect"
        ]
      },
      {
        "index": 14,
        "answer": "three",
        "alternatives": [
          "five",
          "seven"
        ]
      },
      {
        "index": 15,
        "answer": "problem",
        "alternatives": [
          "worries"
        ]
      },
      {
        "index": 16,
        "answer": "help",
        "alternatives": [
          "assist"
        ]
      },
      {
        "index": 17,
        "answer": "all",
        "alternatives": [
          "everything"
        ]
      },
      {
        "index": 18,
        "answer": "help",
        "alternatives": [
          "assistance"
        ]
      },
      {
        "index": 19,
        "answer": "nice",
        "alternatives": [
          "good",
          "pleasant"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 2,
        "phrase": "I'd like to return",
        "insight": "Direct but polite LOCKED CHUNK for formal requests."
      },
      {
        "index": 4,
        "phrase": "faulty",
        "insight": "Standard UK English for \"not working properly\"."
      },
      {
        "index": 9,
        "phrase": "here you go",
        "insight": "LOCKED CHUNK - universal handing-over phrase."
      }
    ]
  },
  {
    "id": "workplace-31-disagreement",
    "category": "Workplace",
    "topic": "Workplace Disagreement (Calm Resolution)",
    "context": "Two colleagues discussing an approach with respectful disagreement and alignment.",
    "characters": [
      {
        "name": "Colleague",
        "description": "Peer at work"
      },
      {
        "name": "You",
        "description": "Team member"
      }
    ],
    "dialogue": [
      {
        "speaker": "Colleague",
        "text": "I think we should move forward with this approach as is."
      },
      {
        "speaker": "You",
        "text": "I see your point. I just have a slightly ________ view on this."
      },
      {
        "speaker": "Colleague",
        "text": "Okay, let's hear it."
      },
      {
        "speaker": "You",
        "text": "From my perspective, there might be a ________ risk if we proceed this way."
      },
      {
        "speaker": "Colleague",
        "text": "What kind of risk are you referring to?"
      },
      {
        "speaker": "You",
        "text": "Mainly around ________ and how it could impact the final outcome."
      },
      {
        "speaker": "Colleague",
        "text": "That's interesting. Can you explain a bit more?"
      },
      {
        "speaker": "You",
        "text": "Sure. Based on what we've seen so far, the current plan could ________ timelines and put extra pressure on the team."
      },
      {
        "speaker": "Colleague",
        "text": "I'm not sure I agree with that."
      },
      {
        "speaker": "You",
        "text": "That's fair. I'm not saying the idea is ________, just that it may need some ________."
      },
      {
        "speaker": "Colleague",
        "text": "What would you suggest instead?"
      },
      {
        "speaker": "You",
        "text": "One option could be to ________ the rollout and test it on a smaller ________ first."
      },
      {
        "speaker": "Colleague",
        "text": "That might slow things down."
      },
      {
        "speaker": "You",
        "text": "Possibly in the short term, yes. But in the long run, it could ________ rework and reduce overall risk."
      },
      {
        "speaker": "Colleague",
        "text": "I see both sides here."
      },
      {
        "speaker": "You",
        "text": "Ultimately, I'm happy to support whichever direction we choose. I just wanted to ________ this concern before we commit."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "different",
        "alternatives": [
          "alternative",
          "broader"
        ]
      },
      {
        "index": 2,
        "answer": "potential",
        "alternatives": [
          "significant",
          "operational",
          "long-term"
        ]
      },
      {
        "index": 3,
        "answer": "delivery",
        "alternatives": [
          "execution",
          "timing",
          "alignment"
        ]
      },
      {
        "index": 4,
        "answer": "affect",
        "alternatives": [
          "impact",
          "delay",
          "stretch"
        ]
      },
      {
        "index": 5,
        "answer": "wrong",
        "alternatives": [
          "bad",
          "flawed",
          "off-base"
        ]
      },
      {
        "index": 6,
        "answer": "refining",
        "alternatives": [
          "adjustment",
          "reworking",
          "fine-tuning"
        ]
      },
      {
        "index": 7,
        "answer": "pilot",
        "alternatives": [
          "delay",
          "stagger",
          "phase"
        ]
      },
      {
        "index": 8,
        "answer": "scale",
        "alternatives": [
          "group",
          "cohort",
          "segment"
        ]
      },
      {
        "index": 9,
        "answer": "reduce",
        "alternatives": [
          "minimize",
          "avoid",
          "cut down on"
        ]
      },
      {
        "index": 10,
        "answer": "flag",
        "alternatives": [
          "raise",
          "surface",
          "highlight"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "I see your point",
        "insight": "LOCKED CHUNK - acknowledgment without agreement."
      },
      {
        "index": 2,
        "phrase": "from my perspective",
        "insight": "LOCKED CHUNK - polite way to introduce differing opinion."
      },
      {
        "index": 10,
        "phrase": "flag this concern",
        "insight": "Workplace LOCKED CHUNK - professional, measured language."
      }
    ]
  },
  {
    "id": "social-31-catching-up",
    "category": "Social",
    "topic": "Catching Up with an Old Friend",
    "context": "Informal conversation with a friend you haven't seen in a while.",
    "characters": [
      {
        "name": "Friend",
        "description": "Close acquaintance"
      },
      {
        "name": "You",
        "description": "You"
      }
    ],
    "dialogue": [
      {
        "speaker": "You",
        "text": "Hey, nice to see you again. Nice to ________ you."
      },
      {
        "speaker": "Friend",
        "text": "Yeah, it's good to see you too. It's a ________. So, how's it ________?"
      },
      {
        "speaker": "You",
        "text": "Not too bad, actually. Busy, but in a good way. What about you? What have you been ________ to?"
      },
      {
        "speaker": "Friend",
        "text": "A bit of this and that, really. Work's been hectic. To be honest, I've been thinking about making a few changes."
      },
      {
        "speaker": "You",
        "text": "Oh yeah? That's interesting. From my perspective, that can be a good thing, depending on the timing."
      },
      {
        "speaker": "Friend",
        "text": "Exactly. I mean, I see the benefits, but it's not an easy decision."
      },
      {
        "speaker": "You",
        "text": "I see your point. Change always sounds good in theory, but the reality can be different."
      },
      {
        "speaker": "Friend",
        "text": "True. Some people say you should just go for it."
      },
      {
        "speaker": "You",
        "text": "That makes sense, but I'm not sure I agree with that completely. It really depends on the situation."
      },
      {
        "speaker": "Friend",
        "text": "Fair enough. Everyone's circumstances are different."
      },
      {
        "speaker": "You",
        "text": "By the way, are you still living in the same area?"
      },
      {
        "speaker": "Friend",
        "text": "Yeah, for now. Though I've thought about moving."
      },
      {
        "speaker": "You",
        "text": "Really? Well, to be honest, I'd probably stay put if I were you."
      },
      {
        "speaker": "Friend",
        "text": "Oh? Why's that?"
      },
      {
        "speaker": "You",
        "text": "From my perspective, moving sounds exciting, but it can be stressful. And if things are working, sometimes it's better not to rush."
      },
      {
        "speaker": "Friend",
        "text": "I get that, but I beg to differ slightly. A new place can be a ________ of fresh air, you know?"
      },
      {
        "speaker": "You",
        "text": "That's true. I'm not saying you're wrong. I just think it's worth thinking it through."
      },
      {
        "speaker": "Friend",
        "text": "Yeah, fair enough. I suppose there's no rush."
      },
      {
        "speaker": "You",
        "text": "Exactly. You can always play it by ________ and see how things go."
      },
      {
        "speaker": "Friend",
        "text": "That's probably the smartest approach."
      },
      {
        "speaker": "You",
        "text": "Anyway, I don't want to keep you too long. But it was really good catching up."
      },
      {
        "speaker": "Friend",
        "text": "Same here. We should do this more often."
      },
      {
        "speaker": "You",
        "text": "Definitely. Let's keep in ________."
      },
      {
        "speaker": "Friend",
        "text": "For sure. Alright, take care."
      },
      {
        "speaker": "You",
        "text": "You too. Take ________."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "see",
        "alternatives": [
          "meet"
        ]
      },
      {
        "index": 2,
        "answer": "pleasure",
        "alternatives": []
      },
      {
        "index": 3,
        "answer": "going",
        "alternatives": [
          "going with you"
        ]
      },
      {
        "index": 4,
        "answer": "up to",
        "alternatives": [
          "up to lately"
        ]
      },
      {
        "index": 5,
        "answer": "breath",
        "alternatives": [
          "something refreshing"
        ]
      },
      {
        "index": 6,
        "answer": "ear",
        "alternatives": [
          "see how it goes"
        ]
      },
      {
        "index": 7,
        "answer": "touch",
        "alternatives": [
          "contact"
        ]
      },
      {
        "index": 8,
        "answer": "care",
        "alternatives": [
          "it easy"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "Nice to see you",
        "insight": "LOCKED CHUNK - universal greeting."
      },
      {
        "index": 5,
        "phrase": "a breath of fresh air",
        "insight": "LOCKED CHUNK - idiom expressing positive change."
      },
      {
        "index": 7,
        "phrase": "let's keep in touch",
        "insight": "LOCKED CHUNK - natural closing phrase."
      }
    ]
  },
  {
    "id": "advanced-5",
    "category": "Advanced",
    "topic": "Negotiating Business Partnership Terms",
    "context": "Two entrepreneurs discussing equity split and governance for a joint venture.",
    "characters": [
      {
        "name": "Alex",
        "description": "Experienced entrepreneur"
      },
      {
        "name": "Jordan",
        "description": "Entrepreneur with distribution network"
      },
      {
        "name": "You",
        "description": "You"
      }
    ],
    "dialogue": [
      {
        "speaker": "Alex",
        "text": "I ________ your interest in partnering with us."
      },
      {
        "speaker": "Jordan",
        "text": "Your market positioning is ________, but we need to ________ equity split."
      },
      {
        "speaker": "Alex",
        "text": "We were ________ a 60-40 arrangement."
      },
      {
        "speaker": "Jordan",
        "text": "That seems somewhat ________ given our distribution reach."
      },
      {
        "speaker": "Alex",
        "text": "I ________ your point. What if we structured it with ________-based adjustments?"
      },
      {
        "speaker": "Jordan",
        "text": "Now we're ________. That introduces ________ and rewards for results."
      },
      {
        "speaker": "Alex",
        "text": "Exactly. We should ________ operational control too."
      },
      {
        "speaker": "Jordan",
        "text": "Essential. We'll need ________ access to financial records."
      },
      {
        "speaker": "Alex",
        "text": "Understood. Shall we ________ a follow-up with legal teams?"
      },
      {
        "speaker": "Jordan",
        "text": "Perfect. I'll have counsel draft an MOU by ________."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "appreciate",
        "alternatives": [
          "value"
        ]
      },
      {
        "index": 2,
        "answer": "impeccable",
        "alternatives": [
          "excellent"
        ]
      },
      {
        "index": 3,
        "answer": "discuss",
        "alternatives": [
          "clarify"
        ]
      },
      {
        "index": 4,
        "answer": "thinking",
        "alternatives": [
          "proposing"
        ]
      },
      {
        "index": 5,
        "answer": "lopsided",
        "alternatives": [
          "unbalanced"
        ]
      },
      {
        "index": 6,
        "answer": "see",
        "alternatives": [
          "understand"
        ]
      },
      {
        "index": 7,
        "answer": "performance",
        "alternatives": [
          "merit"
        ]
      },
      {
        "index": 8,
        "answer": "talking",
        "alternatives": [
          "on the same page"
        ]
      },
      {
        "index": 9,
        "answer": "clarify",
        "alternatives": [
          "define"
        ]
      },
      {
        "index": 10,
        "answer": "transparent",
        "alternatives": [
          "open"
        ]
      },
      {
        "index": 11,
        "answer": "discuss",
        "alternatives": [
          "align",
          "determine"
        ]
      },
      {
        "index": 12,
        "answer": "schedule",
        "alternatives": [
          "arrange",
          "organize"
        ]
      },
      {
        "index": 13,
        "answer": "end of week",
        "alternatives": [
          "Friday",
          "next week"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "appreciate",
        "insight": "Formal opening showing respect in negotiations."
      },
      {
        "index": 2,
        "phrase": "impeccable",
        "insight": "Premium adjective for business reputation."
      },
      {
        "index": 5,
        "phrase": "lopsided",
        "insight": "Diplomatic way to say unfair or unbalanced."
      }
    ]
  },
  {
    "id": "workplace-32",
    "category": "Workplace",
    "topic": "Performance Review and Career Advancement",
    "context": "Manager and employee discussing promotion and development opportunity.",
    "characters": [
      {
        "name": "Manager",
        "description": "Senior manager"
      },
      {
        "name": "Sam",
        "description": "High-performing employee"
      },
      {
        "name": "You",
        "description": "You"
      }
    ],
    "dialogue": [
      {
        "speaker": "Manager",
        "text": "Sam, your performance has been ________. I want to discuss your career."
      },
      {
        "speaker": "Sam",
        "text": "Thank you. I've been ________ to explore growth opportunities."
      },
      {
        "speaker": "Manager",
        "text": "We're considering ________ you to senior analyst."
      },
      {
        "speaker": "Sam",
        "text": "That's exciting. What would the role ________?"
      },
      {
        "speaker": "Manager",
        "text": "You'd ________ a team and report to the department head."
      },
      {
        "speaker": "Sam",
        "text": "What about ________ development and certifications?"
      },
      {
        "speaker": "Manager",
        "text": "Absolutely. We allocate ________ for continuous learning."
      },
      {
        "speaker": "Sam",
        "text": "And ________ terms, what range do you envision?"
      },
      {
        "speaker": "Manager",
        "text": "A 25% increase plus ________ bonuses."
      },
      {
        "speaker": "Sam",
        "text": "That's ________. When would this start?"
      },
      {
        "speaker": "Manager",
        "text": "Next month, pending your ________."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "exceptional",
        "alternatives": [
          "outstanding"
        ]
      },
      {
        "index": 2,
        "answer": "keen",
        "alternatives": [
          "eager"
        ]
      },
      {
        "index": 3,
        "answer": "promoting",
        "alternatives": [
          "advancing"
        ]
      },
      {
        "index": 4,
        "answer": "entail",
        "alternatives": [
          "involve"
        ]
      },
      {
        "index": 5,
        "answer": "oversee",
        "alternatives": [
          "manage"
        ]
      },
      {
        "index": 6,
        "answer": "professional",
        "alternatives": [
          "career"
        ]
      },
      {
        "index": 7,
        "answer": "funds",
        "alternatives": [
          "budget",
          "money"
        ]
      },
      {
        "index": 8,
        "answer": "salary",
        "alternatives": [
          "compensation"
        ]
      },
      {
        "index": 9,
        "answer": "performance",
        "alternatives": [
          "merit"
        ]
      },
      {
        "index": 10,
        "answer": "generous",
        "alternatives": [
          "competitive"
        ]
      },
      {
        "index": 11,
        "answer": "acceptance",
        "alternatives": [
          "approval"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "exceptional",
        "insight": "Standard praise showing genuine impression."
      },
      {
        "index": 3,
        "phrase": "promoting",
        "insight": "Professional term for career advancement."
      }
    ]
  },
  {
    "id": "advanced-6",
    "category": "Advanced",
    "topic": "Debating Environmental Sustainability",
    "context": "Leadership team discussing climate targets and feasibility.",
    "characters": [
      {
        "name": "Lisa",
        "description": "Sustainability director"
      },
      {
        "name": "Martin",
        "description": "Finance director"
      },
      {
        "name": "CEO",
        "description": "Chief executive"
      },
      {
        "name": "You",
        "description": "You"
      }
    ],
    "dialogue": [
      {
        "speaker": "Lisa",
        "text": "Our sustainability targets are ________. We need carbon neutrality by 2030."
      },
      {
        "speaker": "Martin",
        "text": "I ________ the sentiment, but that's ________ given our constraints."
      },
      {
        "speaker": "Lisa",
        "text": "Or simply ________? Competitors are already ________ this."
      },
      {
        "speaker": "Martin",
        "text": "They can ________ it. Our margins are ________."
      },
      {
        "speaker": "Lisa",
        "text": "That's a false ________. Early investment yields long-term ________."
      },
      {
        "speaker": "Martin",
        "text": "Perhaps, but ________ costs are substantial."
      },
      {
        "speaker": "CEO",
        "text": "Lisa, prepare a ________. Martin, document your ________."
      },
      {
        "speaker": "Lisa",
        "text": "I'll include ________ from successful transitions."
      },
      {
        "speaker": "Martin",
        "text": "I'll provide ________ on our capabilities."
      },
      {
        "speaker": "CEO",
        "text": "Excellent. Let's ________ in two weeks."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "insufficient",
        "alternatives": [
          "inadequate"
        ]
      },
      {
        "index": 2,
        "answer": "appreciate",
        "alternatives": [
          "understand"
        ]
      },
      {
        "index": 3,
        "answer": "unrealistic",
        "alternatives": [
          "unfeasible"
        ]
      },
      {
        "index": 4,
        "answer": "unambitious",
        "alternatives": [
          "timid"
        ]
      },
      {
        "index": 5,
        "answer": "making",
        "alternatives": [
          "embracing"
        ]
      },
      {
        "index": 6,
        "answer": "afford",
        "alternatives": [
          "sustain"
        ]
      },
      {
        "index": 7,
        "answer": "tighter",
        "alternatives": [
          "lower"
        ]
      },
      {
        "index": 8,
        "answer": "dichotomy",
        "alternatives": [
          "false choice"
        ]
      },
      {
        "index": 9,
        "answer": "benefits",
        "alternatives": [
          "returns"
        ]
      },
      {
        "index": 10,
        "answer": "transition",
        "alternatives": [
          "implementation"
        ]
      },
      {
        "index": 11,
        "answer": "business case",
        "alternatives": [
          "proposal",
          "report"
        ]
      },
      {
        "index": 12,
        "answer": "concerns",
        "alternatives": [
          "objections",
          "position"
        ]
      },
      {
        "index": 13,
        "answer": "case studies",
        "alternatives": [
          "examples",
          "evidence"
        ]
      },
      {
        "index": 14,
        "answer": "details",
        "alternatives": [
          "information",
          "data"
        ]
      },
      {
        "index": 15,
        "answer": "reconvene",
        "alternatives": [
          "regroup",
          "follow up"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "insufficient",
        "insight": "Formal business critique showing gaps."
      },
      {
        "index": 8,
        "phrase": "dichotomy",
        "insight": "Advanced debate term for false choice."
      }
    ]
  },
  {
    "id": "advanced-virtual-meetings",
    "category": "Advanced",
    "topic": "Adjusting to Virtual Meeting Culture",
    "context": "Colleagues discussing challenges of remote work and video conferencing etiquette",
    "characters": [
      {
        "name": "Alex",
        "description": "Colleague reflecting on remote work challenges"
      },
      {
        "name": "Sam",
        "description": "Colleague sharing perspective on video call fatigue"
      }
    ],
    "dialogue": [
      {
        "speaker": "Alex",
        "text": "I've been reflecting on how differently we communicate now compared to before the pandemic. Video calls have definitely ________ the way we interact professionally."
      },
      {
        "speaker": "Sam",
        "text": "Absolutely. I find that people are more ________ to speak up on video than they were in person, which can be both positive and challenging."
      },
      {
        "speaker": "Alex",
        "text": "That's a fair ________. I've noticed we ________ less informal chat before meetings start. We just log in and get straight to business."
      },
      {
        "speaker": "Sam",
        "text": "Exactly. There's a loss of ________. Those water cooler moments where you'd catch up on personal matters are ________."
      },
      {
        "speaker": "Alex",
        "text": "Do you think we should ________ schedule some casual virtual coffee meetings?"
      },
      {
        "speaker": "Sam",
        "text": "That's a ________ idea, but people seem ________ by \"Zoom fatigue.\" We need to ________ the number of meetings overall."
      },
      {
        "speaker": "Alex",
        "text": "I ________ your perspective. Perhaps we could establish clearer norms - like video-off Fridays or meeting-free afternoons?"
      },
      {
        "speaker": "Sam",
        "text": "That would be ________. It would give people space to concentrate on deep work."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "transformed",
        "alternatives": [
          "changed",
          "altered",
          "reshaped"
        ]
      },
      {
        "index": 2,
        "answer": "reluctant",
        "alternatives": [
          "hesitant",
          "unwilling",
          "resistant"
        ]
      },
      {
        "index": 3,
        "answer": "point",
        "alternatives": [
          "observation",
          "perspective",
          "view"
        ]
      },
      {
        "index": 4,
        "answer": "encounter",
        "alternatives": [
          "experience",
          "have",
          "see"
        ]
      },
      {
        "index": 5,
        "answer": "rapport",
        "alternatives": [
          "connection",
          "relationship",
          "bond"
        ]
      },
      {
        "index": 6,
        "answer": "diminished",
        "alternatives": [
          "reduced",
          "weakened",
          "lessened"
        ]
      },
      {
        "index": 7,
        "answer": "intentionally",
        "alternatives": [
          "deliberately",
          "on purpose",
          "purposefully"
        ]
      },
      {
        "index": 8,
        "answer": "valid",
        "alternatives": [
          "good",
          "sound",
          "reasonable"
        ]
      },
      {
        "index": 9,
        "answer": "overwhelmed",
        "alternatives": [
          "exhausted",
          "fatigued",
          "burnt out"
        ]
      },
      {
        "index": 10,
        "answer": "reduce",
        "alternatives": [
          "limit",
          "minimize",
          "cut down"
        ]
      },
      {
        "index": 11,
        "answer": "appreciate",
        "alternatives": [
          "understand",
          "respect"
        ]
      },
      {
        "index": 12,
        "answer": "welcome",
        "alternatives": [
          "helpful",
          "beneficial"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "transformed",
        "insight": "C1 verb: metaphorical transformation. Better than \"changed\" in formal discourse."
      },
      {
        "index": 2,
        "phrase": "reluctant",
        "insight": "Adjective collocation: \"reluctant to\" + infinitive. Shows hesitation with reluctance."
      },
      {
        "index": 3,
        "phrase": "point",
        "insight": "Casual but effective: \"That's a good point\" is universal in academic discussion."
      },
      {
        "index": 4,
        "phrase": "encounter",
        "insight": "Formal verb: \"encounter\" more sophisticated than \"have\" or \"see\"."
      },
      {
        "index": 5,
        "phrase": "rapport",
        "insight": "French origin noun meaning interpersonal connection. Key in social/professional contexts."
      },
      {
        "index": 6,
        "phrase": "diminished",
        "insight": "Past participle as adjective. Suggests gradual or natural decline."
      },
      {
        "index": 7,
        "phrase": "intentionally",
        "insight": "Adverb from intent. Emphasizes deliberate action, not accident."
      },
      {
        "index": 8,
        "phrase": "valid",
        "insight": "C1 adjective: grants legitimacy to an idea more forcefully than \"good\"."
      }
    ]
  },
  {
    "id": "advanced-ai-displacement",
    "category": "Advanced",
    "topic": "Debating AI and Job Displacement",
    "context": "Two professionals discussing impact of artificial intelligence on employment and careers",
    "characters": [
      {
        "name": "Jordan",
        "description": "Professional concerned about AI impact on employment"
      },
      {
        "name": "Casey",
        "description": "Optimistic professional advocating for upskilling"
      }
    ],
    "dialogue": [
      {
        "speaker": "Jordan",
        "text": "The rapid advancement of AI has been creating considerable ________ in the workplace. Many worry their jobs will become ________."
      },
      {
        "speaker": "Casey",
        "text": "I understand the concern, but historically, technological innovation has ________ rather than eliminated employment opportunities."
      },
      {
        "speaker": "Jordan",
        "text": "That may be true historically, but the pace is ________ now. We don't have time to ________ and reskill."
      },
      {
        "speaker": "Casey",
        "text": "True, but I think we're seeing ________ in how companies approach this. Some are investing in upskilling programmes."
      },
      {
        "speaker": "Jordan",
        "text": "I ________ that's commendable, though it's not universal. The burden shouldn't fall entirely on ________."
      },
      {
        "speaker": "Casey",
        "text": "Agreed. There's a pressing need for policy ________. Governments should establish frameworks to support transitions."
      },
      {
        "speaker": "Jordan",
        "text": "And not just financially. Workers need ________ that career pivots are feasible and achievable."
      },
      {
        "speaker": "Casey",
        "text": "Absolutely. The narrative around AI needs to shift from threat to ________."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "concern",
        "alternatives": [
          "worry",
          "anxiety",
          "apprehension"
        ]
      },
      {
        "index": 2,
        "answer": "redundant",
        "alternatives": [
          "obsolete",
          "unnecessary",
          "superfluous"
        ]
      },
      {
        "index": 3,
        "answer": "created",
        "alternatives": [
          "generated",
          "produced",
          "made"
        ]
      },
      {
        "index": 4,
        "answer": "unprecedented",
        "alternatives": [
          "unparalleled",
          "extraordinary",
          "remarkable"
        ]
      },
      {
        "index": 5,
        "answer": "adapt",
        "alternatives": [
          "adjust",
          "acclimate",
          "evolve"
        ]
      },
      {
        "index": 6,
        "answer": "positive momentum",
        "alternatives": [
          "progress",
          "advancement",
          "improvement"
        ]
      },
      {
        "index": 7,
        "answer": "acknowledge",
        "alternatives": [
          "recognize",
          "admit",
          "concede"
        ]
      },
      {
        "index": 8,
        "answer": "opportunity",
        "alternatives": [
          "chance",
          "possibility",
          "prospect"
        ]
      },
      {
        "index": 9,
        "answer": "change",
        "alternatives": [
          "intervention",
          "reform"
        ]
      },
      {
        "index": 10,
        "answer": "assurance",
        "alternatives": [
          "proof",
          "evidence"
        ]
      },
      {
        "index": 11,
        "answer": "opportunity",
        "alternatives": [
          "possibility",
          "prospect"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "concern",
        "insight": "Noun abstract. Collocation: \"express concern\", \"raise concern\"."
      },
      {
        "index": 2,
        "phrase": "redundant",
        "insight": "C1 adjective: replaced/unnecessary. Technical term borrowed from engineering."
      },
      {
        "index": 3,
        "phrase": "created",
        "insight": "Simple past with strong context: AI \"created\" opportunities, not just effects."
      },
      {
        "index": 4,
        "phrase": "unprecedented",
        "insight": "C1 adjective: \"without precedent\". Emphasizes novelty and challenge."
      },
      {
        "index": 5,
        "phrase": "adapt",
        "insight": "Key verb in IELTS Speaking Part 3: how people respond to change."
      },
      {
        "index": 6,
        "phrase": "positive momentum",
        "insight": "Collocation: abstract noun + direction indicator. Business jargon."
      },
      {
        "index": 7,
        "phrase": "acknowledge",
        "insight": "Formal verb: recognize validity even while disagreeing."
      },
      {
        "index": 8,
        "phrase": "opportunity",
        "insight": "Positive reframing: from \"job loss\" to \"opportunity\". Rhetorical strategy."
      }
    ]
  },
  {
    "id": "advanced-sustainability",
    "category": "Advanced",
    "topic": "Corporate Sustainability and Profit Tensions",
    "context": "Executives discussing balancing environmental responsibility with shareholder returns",
    "characters": [
      {
        "name": "Morgan",
        "description": "Executive balancing sustainability with shareholder returns"
      },
      {
        "name": "Taylor",
        "description": "Executive advocating for long-term ESG value"
      }
    ],
    "dialogue": [
      {
        "speaker": "Morgan",
        "text": "Our sustainability initiatives are being ________ by investors who prioritize short-term profits."
      },
      {
        "speaker": "Taylor",
        "text": "It's a genuine ________, though I believe the calculus is changing. ESG considerations are increasingly ________ with long-term value."
      },
      {
        "speaker": "Morgan",
        "text": "Perhaps, but the evidence remains ________. We've had to scale back several programmes due to budget ________."
      },
      {
        "speaker": "Taylor",
        "text": "I sympathize with the constraint, but consider this: brand damage from environmental negligence is far more ________."
      },
      {
        "speaker": "Morgan",
        "text": "That's a valid ________. We've seen competitors suffer reputationally. Still, our board wants ________ that investments yield measurable returns."
      },
      {
        "speaker": "Taylor",
        "text": "Have you ________ communicating the indirect benefits? Cost savings from efficiency, talent attraction, regulatory advantage?"
      },
      {
        "speaker": "Morgan",
        "text": "We have, but the messaging hasn't quite ________ through. The business case needs to be more ________."
      },
      {
        "speaker": "Taylor",
        "text": "Perhaps we could partner with analysts to quantify the ROI more ________. That might help persuade the sceptics."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "questioned",
        "alternatives": [
          "challenged",
          "disputed",
          "scrutinized"
        ]
      },
      {
        "index": 2,
        "answer": "tension",
        "alternatives": [
          "conflict",
          "strain",
          "competition"
        ]
      },
      {
        "index": 3,
        "answer": "aligned",
        "alternatives": [
          "connected",
          "related",
          "associated"
        ]
      },
      {
        "index": 4,
        "answer": "mixed",
        "alternatives": [
          "inconclusive",
          "unclear",
          "ambiguous"
        ]
      },
      {
        "index": 5,
        "answer": "constraints",
        "alternatives": [
          "limitations",
          "restrictions",
          "obstacles"
        ]
      },
      {
        "index": 6,
        "answer": "devastating",
        "alternatives": [
          "catastrophic",
          "terrible",
          "ruinous"
        ]
      },
      {
        "index": 7,
        "answer": "assurance",
        "alternatives": [
          "guarantee",
          "proof",
          "evidence"
        ]
      },
      {
        "index": 8,
        "answer": "comprehensively",
        "alternatives": [
          "thoroughly",
          "carefully",
          "systematically"
        ]
      },
      {
        "index": 9,
        "answer": "attempted",
        "alternatives": [
          "tried",
          "considered",
          "explored"
        ]
      },
      {
        "index": 10,
        "answer": "come",
        "alternatives": [
          "gotten",
          "landed",
          "broken"
        ]
      },
      {
        "index": 11,
        "answer": "compelling",
        "alternatives": [
          "persuasive",
          "stronger",
          "clearer"
        ]
      },
      {
        "index": 12,
        "answer": "precisely",
        "alternatives": [
          "accurately",
          "exactly",
          "clearly"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "questioned",
        "insight": "Past participle: passive voice construction for neutrality."
      },
      {
        "index": 2,
        "phrase": "tension",
        "insight": "Abstract noun: intellectual conflict without personal animosity."
      },
      {
        "index": 3,
        "phrase": "aligned",
        "insight": "Business metaphor: strategy/values/interests \"align\" (become compatible)."
      },
      {
        "index": 4,
        "phrase": "mixed",
        "insight": "Adjective for evidence: results neither clearly positive nor negative."
      },
      {
        "index": 5,
        "phrase": "constraints",
        "insight": "Business jargon: limitations imposed by external factors (budget, resources)."
      },
      {
        "index": 6,
        "phrase": "devastating",
        "insight": "Hyperbolic but defensible: reputation damage costs more than remediation."
      },
      {
        "index": 7,
        "phrase": "assurance",
        "insight": "Noun from assure: commitment to certainty. Corporate language."
      },
      {
        "index": 8,
        "phrase": "comprehensively",
        "insight": "Adverb: covering all aspects thoroughly. Shows systematic thinking."
      }
    ]
  },
  {
    "id": "advanced-language-learning",
    "category": "Advanced",
    "topic": "Strategies for Effective Language Acquisition",
    "context": "Language professionals discussing modern approaches to adult language learning",
    "characters": [
      {
        "name": "Professor Chen",
        "description": "Language educator promoting communicative approaches"
      },
      {
        "name": "David",
        "description": "Student discussing modern language learning methodology"
      }
    ],
    "dialogue": [
      {
        "speaker": "Professor Chen",
        "text": "The traditional approach to language education has been ________ for decades, yet outcomes haven't improved proportionally."
      },
      {
        "speaker": "David",
        "text": "What specifically would you ________ to change?"
      },
      {
        "speaker": "Professor Chen",
        "text": "The over-emphasis on grammar rules. Students memorize paradigms but remain ________ when attempting real communication."
      },
      {
        "speaker": "David",
        "text": "So you'd advocate for more ________ speaking practice?"
      },
      {
        "speaker": "Professor Chen",
        "text": "Precisely. Coupled with authentic materials - podcasts, films, social media. Learners need to be ________ to genuine language as it's actually used."
      },
      {
        "speaker": "David",
        "text": "But doesn't that create difficulties for beginners who lack the foundation to ________ complex input?"
      },
      {
        "speaker": "Professor Chen",
        "text": "A fair ________. I'd advocate for a ________ approach - scaffolded exposure combined with targeted grammar instruction when it serves communication."
      },
      {
        "speaker": "David",
        "text": "That sounds pragmatic. Have you had success ________ this methodology in formal classroom settings?"
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "unchanged",
        "alternatives": [
          "the same",
          "unaltered",
          "constant"
        ]
      },
      {
        "index": 2,
        "answer": "argue",
        "alternatives": [
          "suggest",
          "propose",
          "advocate"
        ]
      },
      {
        "index": 3,
        "answer": "incompetent",
        "alternatives": [
          "incapable",
          "unable",
          "unqualified"
        ]
      },
      {
        "index": 4,
        "answer": "extensive",
        "alternatives": [
          "significant",
          "substantial",
          "considerable"
        ]
      },
      {
        "index": 5,
        "answer": "exposed",
        "alternatives": [
          "subjected",
          "vulnerable",
          "open"
        ]
      },
      {
        "index": 6,
        "answer": "process",
        "alternatives": [
          "understand",
          "grasp",
          "comprehend"
        ]
      },
      {
        "index": 7,
        "answer": "observation",
        "alternatives": [
          "point",
          "comment",
          "note"
        ]
      },
      {
        "index": 8,
        "answer": "blended",
        "alternatives": [
          "balanced",
          "combined"
        ]
      },
      {
        "index": 9,
        "answer": "implementing",
        "alternatives": [
          "applying",
          "using",
          "employing"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "unchanged",
        "insight": "Negative prefix + past participle: remains as it was."
      },
      {
        "index": 2,
        "phrase": "argue",
        "insight": "Academic verb: \"argue for/against\" = present evidence-based position."
      },
      {
        "index": 3,
        "phrase": "incompetent",
        "insight": "C1+ negative judgment: lacking skill/ability. Stronger than \"unable\"."
      },
      {
        "index": 4,
        "phrase": "extensive",
        "insight": "C1 adjective: large in scope/scale. Indicates serious engagement."
      },
      {
        "index": 5,
        "phrase": "exposed",
        "insight": "Passive construction: \"be exposed to\" = receive/encounter (often involuntary)."
      },
      {
        "index": 6,
        "phrase": "process",
        "insight": "Verb in learning context: mentally work through information."
      },
      {
        "index": 7,
        "phrase": "observation",
        "insight": "Formal noun: result of careful attention. Grounds opinion in evidence."
      },
      {
        "index": 8,
        "phrase": "implementing",
        "insight": "Gerund: putting plan/method into action. Shows practical application."
      }
    ]
  },
  {
    "id": "youtube-social-english-conversations-1705402200",
    "category": "Social",
    "topic": "English Learning - Real-Life Conversations",
    "context": "A comprehensive English learning course featuring multiple real-life conversation scenarios including shopping at grocery stores and cafes, family discussions, holiday planning, and various daily interactions. Designed to help learners understand natural English pronunciation, common phrases, and practical communication skills used in everyday situations.",
    "characters": [
      {
        "name": "Jessica",
        "description": "English learning channel host providing real-life conversation lessons"
      },
      {
        "name": "Customer",
        "description": "A person shopping for baking supplies at a grocery store"
      },
      {
        "name": "Shop Assistant",
        "description": "Helpful grocery store employee assisting with locating items"
      },
      {
        "name": "Sarah",
        "description": "Shopper discussing grocery purchases"
      },
      {
        "name": "Max",
        "description": "Shopper concerned about healthy eating while enjoying variety"
      },
      {
        "name": "Barista",
        "description": "Coffee shop employee helping customers choose drinks"
      },
      {
        "name": "Customer 2",
        "description": "Customer ordering smoothies at a cafe"
      },
      {
        "name": "Customer 3",
        "description": "Customer with health-conscious preferences"
      },
      {
        "name": "Friend 1",
        "description": "Friend discussing new year goals and plans"
      },
      {
        "name": "Laura",
        "description": "Friend interested in cooking and personal development"
      },
      {
        "name": "Emily",
        "description": "Friend celebrating Christmas with family"
      },
      {
        "name": "Alex",
        "description": "Friend enjoying holiday preparations"
      }
    ],
    "dialogue": [
      {
        "speaker": "Jessica",
        "text": "________. ________ here. ________ channel. Is your English learning journey going well?"
      },
      {
        "speaker": "Jessica",
        "text": "I hope you keep it up. Today, let's practice real-life conversations."
      },
      {
        "speaker": "Jessica",
        "text": "We will focus on simple words and phrases that you can use in everyday life."
      },
      {
        "speaker": "Customer",
        "text": "________, ________? I'm looking for baking powder."
      },
      {
        "speaker": "Shop Assistant",
        "text": "Sure! It's right here on this shelf. Are you baking something today?"
      },
      {
        "speaker": "Customer",
        "text": "Yes, I'm trying to make a cake, but I'm missing a few things. I also need flour."
      },
      {
        "speaker": "Shop Assistant",
        "text": "Yes, you got it right—flour! It's on the shelf below the baking powder shelf. By the way, is this your first time baking?"
      },
      {
        "speaker": "Customer",
        "text": "Yes, and I'm so nervous. My friend told me to wing it, but I'm not sure what that means."
      },
      {
        "speaker": "Shop Assistant",
        "text": "Oh, it means to try without following exact steps or recipes."
      },
      {
        "speaker": "Sarah",
        "text": "Do we really need five boxes of cereal?"
      },
      {
        "speaker": "Max",
        "text": "________! They're on sale!"
      },
      {
        "speaker": "Sarah",
        "text": "But we only eat breakfast once a day, right?"
      },
      {
        "speaker": "Max",
        "text": "True, but think of all the flavors!"
      },
      {
        "speaker": "Sarah",
        "text": "You mean all the sugar? Just ________ after that."
      },
      {
        "speaker": "Max",
        "text": "Deal! Oh, what about chips?"
      },
      {
        "speaker": "Sarah",
        "text": "I thought we came here to buy healthy food only!"
      },
      {
        "speaker": "Max",
        "text": "You should have cheat days for yourself. It's when you eat less healthy food."
      },
      {
        "speaker": "Sarah",
        "text": "Having a few cheat days isn't harmful to your health, Max."
      },
      {
        "speaker": "Barista",
        "text": "What can I get for you today? Do you have any fresh smoothies?"
      },
      {
        "speaker": "Customer 2",
        "text": "Yes! We have strawberry, mango, and even a green detox one with spinach and kale."
      },
      {
        "speaker": "Customer 2",
        "text": "Hmm, spinach and kale? That sounds healthy, but maybe a little boring."
      },
      {
        "speaker": "Barista",
        "text": "Well, if you're looking for something fun, we have a chocolate peanut butter smoothie."
      },
      {
        "speaker": "Customer 2",
        "text": "Oh, that sounds like a cheat day in a cup!"
      },
      {
        "speaker": "Customer 3",
        "text": "I'll stick to something healthy. I'll have the green detox smoothie."
      },
      {
        "speaker": "Friend 1",
        "text": "Have you made any plans for the new year, Laura?"
      },
      {
        "speaker": "Laura",
        "text": "Not yet. I'm thinking about setting some personal goals. How about you?"
      },
      {
        "speaker": "Friend 1",
        "text": "I want to start a fitness routine. Maybe join a gym and get healthier."
      },
      {
        "speaker": "Laura",
        "text": "That sounds great! I'm thinking of learning to cook. I hardly ever make home-cooked meals."
      },
      {
        "speaker": "Friend 1",
        "text": "Cooking is a useful skill. Maybe you can take a cooking class."
      },
      {
        "speaker": "Emily",
        "text": "Hi Alex! I've been helping my family decorate the Christmas tree. And you?"
      },
      {
        "speaker": "Alex",
        "text": "I've been baking cookies with my little sister. We made chocolate chip and gingerbread cookies."
      },
      {
        "speaker": "Emily",
        "text": "That sounds delicious! Do you have any special plans for tonight?"
      },
      {
        "speaker": "Alex",
        "text": "Yes, we're having a family dinner and then we'll exchange gifts. What about you?"
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "Welcome back",
        "alternatives": [
          "Hello everyone",
          "Hi there"
        ]
      },
      {
        "index": 2,
        "answer": "It's Jessica",
        "alternatives": [
          "I'm Jessica",
          "This is Jessica"
        ]
      },
      {
        "index": 3,
        "answer": "Welcome to my",
        "alternatives": [
          "Thank you for visiting my",
          "Come to my"
        ]
      },
      {
        "index": 4,
        "answer": "Excuse me",
        "alternatives": [
          "pardon me",
          "sorry",
          "I'm sorry"
        ]
      },
      {
        "index": 5,
        "answer": "can you help me",
        "alternatives": [
          "could you help me",
          "could you assist me",
          "can you assist me"
        ]
      },
      {
        "index": 6,
        "answer": "Of course",
        "alternatives": [
          "absolutely",
          "definitely",
          "for sure",
          "sure"
        ]
      },
      {
        "index": 7,
        "answer": "don't drink coffee",
        "alternatives": [
          "don't have caffeine",
          "just relax",
          "avoid caffeine"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 4,
        "phrase": "Excuse me",
        "insight": "Can mean either asking for forgiveness ('I'm sorry') or getting attention. Context determines meaning."
      },
      {
        "index": 5,
        "phrase": "can you help me",
        "insight": "Key phrase for universal communication. Essential across all English contexts for polite requests."
      },
      {
        "index": 1,
        "phrase": "Welcome back",
        "insight": "Key greeting phrase used in everyday situations and general communication contexts."
      }
    ]
  },
  {
    "id": "academic-1-tutorial-discussion",
    "category": "Academic",
    "topic": "University Tutorial - Essay Planning",
    "context": "Discussing essay structure and argument development with your tutor at Oxford/Cambridge.",
    "characters": [
      {
        "name": "Dr. Harrison",
        "description": "Academic tutor at prestigious university",
        "avatarUrl": "/avatars/tutor.png"
      },
      {
        "name": "You",
        "description": "Undergraduate student"
      }
    ],
    "dialogue": [
      {
        "speaker": "Dr. Harrison",
        "text": "Come in, come in. How are you ________ on with the essay?"
      },
      {
        "speaker": "You",
        "text": "Honestly, I'm in two ________ about my main argument."
      },
      {
        "speaker": "Dr. Harrison",
        "text": "Well, let's ________ through it together. What's your thesis?"
      },
      {
        "speaker": "You",
        "text": "I want to argue that the author was deliberately ________ with structure."
      },
      {
        "speaker": "Dr. Harrison",
        "text": "That's a promising ________ . Have you gathered sufficient evidence?"
      },
      {
        "speaker": "You",
        "text": "I've found three key passages, but I'm keen on ________ them more thoroughly."
      },
      {
        "speaker": "Dr. Harrison",
        "text": "Good. The ________ of a strong essay is rigorous textual analysis."
      },
      {
        "speaker": "You",
        "text": "Should I ________ the secondary sources you mentioned?"
      },
      {
        "speaker": "Dr. Harrison",
        "text": "By all means. But ________ that primary sources take precedence."
      },
      {
        "speaker": "You",
        "text": "Right. That makes ________ . How many words should I aim for?"
      },
      {
        "speaker": "Dr. Harrison",
        "text": "Three thousand is the ballpark, but don't ________ to the word count."
      },
      {
        "speaker": "You",
        "text": "Would you mind awfully if I ________ you my draft next week?"
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "getting",
        "alternatives": [
          "coming",
          "progressing",
          "moving"
        ]
      },
      {
        "index": 2,
        "answer": "minds",
        "alternatives": [
          "thoughts",
          "ways",
          "views"
        ]
      },
      {
        "index": 3,
        "answer": "work",
        "alternatives": [
          "walk",
          "go",
          "think"
        ]
      },
      {
        "index": 4,
        "answer": "experimenting",
        "alternatives": [
          "playing",
          "toying",
          "tinkering"
        ]
      },
      {
        "index": 5,
        "answer": "line",
        "alternatives": [
          "avenue",
          "direction",
          "angle"
        ]
      },
      {
        "index": 6,
        "answer": "unpacking",
        "alternatives": [
          "exploring",
          "examining",
          "dissecting"
        ]
      },
      {
        "index": 7,
        "answer": "foundation",
        "alternatives": [
          "cornerstone",
          "bedrock",
          "basis"
        ]
      },
      {
        "index": 8,
        "answer": "incorporate",
        "alternatives": [
          "include",
          "weave in",
          "integrate"
        ]
      },
      {
        "index": 9,
        "answer": "bear in mind",
        "alternatives": [
          "remember",
          "note that",
          "keep in mind"
        ]
      },
      {
        "index": 10,
        "answer": "sense",
        "alternatives": [
          "point",
          "logic",
          "way"
        ]
      },
      {
        "index": 11,
        "answer": "sacrifice",
        "alternatives": [
          "compromise",
          "prioritise",
          "subordinate"
        ]
      },
      {
        "index": 12,
        "answer": "run",
        "alternatives": [
          "send",
          "share",
          "pass"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "in two minds",
        "insight": "British idiom for genuine indecision, more emotionally nuanced than \"undecided\". Band 8-9 marker for ambivalent reasoning."
      },
      {
        "index": 6,
        "phrase": "foundation",
        "insight": "Metaphorical use shows sophisticated academic vocabulary. Alternative \"bedrock\" achieves same effect in geology/construction contexts."
      },
      {
        "index": 8,
        "phrase": "bear in mind",
        "insight": "Essential British academic phrase. Softer than \"remember\" and registers as experienced researcher maintaining nuance."
      },
      {
        "index": 11,
        "phrase": "run...draft",
        "insight": "Phrasal verb \"run by\" = submit for feedback. Casual enough for student-tutor dynamic whilst maintaining professionalism."
      }
    ],
    "chunkFeedback": [
      {
        "chunkId": "academic-1-tutorial-discussion-b2",
        "blankIndex": 2,
        "chunk": "in two minds",
        "category": "Softening",
        "coreFunction": "Expresses genuine uncertainty; signals thoughtful deliberation without committing to position.",
        "situations": [
          {
            "context": "Expressing academic doubt",
            "example": "I'm in two minds about my main argument."
          },
          {
            "context": "Essay planning",
            "example": "I was in two minds whether to use qualitative or quantitative methods."
          },
          {
            "context": "Research direction",
            "example": "I'm in two minds about which theoretical framework to use."
          }
        ],
        "nativeUsageNotes": [
          "British idiom; Americans use \"split on\" or \"torn\"",
          "Shows active deliberation, not indecision",
          "Band 8+ marker for nuanced academic thinking"
        ],
        "nonNativeContrast": [
          {
            "nonNative": "I am not sure which is better.",
            "native": "I'm in two minds about which approach is stronger.",
            "explanation": "Native version shows active thinking; non-native sounds passive."
          },
          {
            "nonNative": "I have two different opinions.",
            "native": "I'm in two minds about this thesis.",
            "explanation": "Native version uses precise idiom; non-native is awkward."
          }
        ]
      },
      {
        "blankIndex": 9,
        "chunk": "bear in mind",
        "category": "Exit",
        "coreFunction": "Reminds listener of important context; softens directive by suggesting rather than commanding.",
        "situations": [
          {
            "context": "Academic guidance",
            "example": "Bear in mind that primary sources take precedence."
          },
          {
            "context": "Research reminder",
            "example": "Do bear in mind the word count limit."
          },
          {
            "context": "Nuanced suggestion",
            "example": "As you review this, bear in mind the deadline."
          }
        ],
        "nativeUsageNotes": [
          "British academic formality marker",
          "More formal than \"keep in mind\"",
          "Softens instructions without losing authority"
        ],
        "nonNativeContrast": [
          {
            "nonNative": "Remember that primary sources are important.",
            "native": "Bear in mind that primary sources take precedence.",
            "explanation": "Native version uses sophisticated idiom; sounds like experienced scholar."
          },
          {
            "nonNative": "You must use primary sources.",
            "native": "Do bear in mind the centrality of primary sources.",
            "explanation": "Native version is respectful suggestion; command form is impolite."
          }
        ]
      },
      {
        "blankIndex": 6,
        "chunk": "unpacking",
        "category": "Idioms",
        "coreFunction": "Means analyzing in detail; academic metaphor for breaking down complex ideas systematically.",
        "situations": [
          {
            "context": "Essay analysis",
            "example": "I'm keen on unpacking these passages more thoroughly."
          },
          {
            "context": "Literary discussion",
            "example": "We need to unpack what the author means here."
          },
          {
            "context": "Argument development",
            "example": "Let's unpack your main thesis further."
          }
        ],
        "nativeUsageNotes": [
          "Academic collocation for detailed textual analysis",
          "More specific than \"analyzing\" or \"examining\"",
          "Common in university tutorials and seminars"
        ],
        "nonNativeContrast": [
          {
            "nonNative": "I need to look at these passages.",
            "native": "I'm keen on unpacking these passages more thoroughly.",
            "explanation": "Native version shows academic engagement; non-native is vague."
          },
          {
            "nonNative": "I understand the text now.",
            "native": "I need to unpack this argument further.",
            "explanation": "Native version shows deeper analytical work; non-native implies surface reading."
          }
        ]
      }
    ]
  },
  {
    "id": "healthcare-1-gp-appointment",
    "category": "Healthcare",
    "topic": "GP Appointment - Chronic Condition Discussion",
    "context": "You're in an NHS GP appointment because you've had headaches for about three months. Your goal is to describe the symptoms clearly, explain what makes them worse, and understand what happens next (tests, timings, and what you should do while waiting). Keep your tone calm and matter-of-fact.",
    "characters": [
      {
        "name": "Dr. Patel",
        "description": "Experienced GP"
      },
      {
        "name": "You",
        "description": "Patient with a long-standing issue"
      }
    ],
    "dialogue": [
      {
        "speaker": "Dr. Patel",
        "text": "Right then, what seems to be the trouble today?  "
      },
      {
        "speaker": "You",
        "text": "I've been ________ from persistent headaches for about ________ now.  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "That sounds rather bothersome. ________ you noticed any patterns?  "
      },
      {
        "speaker": "You",
        "text": "They're worse when I'm under ________ at work, ________.  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "When do they usually start, morning or evening?  "
      },
      {
        "speaker": "You",
        "text": "Usually late afternoon, and it can ________ into the evening.  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "Any nausea, vision changes, or sensitivity to light?  "
      },
      {
        "speaker": "You",
        "text": "Sometimes I feel a bit ________, and bright screens make it worse.  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "How often are you getting them?  "
      },
      {
        "speaker": "You",
        "text": "Most days, but it's ________. Some weeks are better than others.  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "Have you tried anything that helps?  "
      },
      {
        "speaker": "You",
        "text": "I've tried ________ down on screen time and drinking more water.  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "And pain relief?  "
      },
      {
        "speaker": "You",
        "text": "Mostly ________ painkillers, but I'm trying not to take them every day.  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "Sensible. We don't want rebound headaches.  "
      },
      {
        "speaker": "You",
        "text": "That's what I was worried about, ________.  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "Do you have any other symptoms with it, like neck stiffness?  "
      },
      {
        "speaker": "You",
        "text": "Not really. It's more like a tight band around my head.  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "How's your sleep?  "
      },
      {
        "speaker": "You",
        "text": "Not great. I've been waking up a lot, and my sleep routine is a bit ________.  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "Stress and sleep can ________ headaches. Have you tried ________ your stress levels?  "
      },
      {
        "speaker": "You",
        "text": "I've tried, but it's quite ________, and I keep slipping back into old habits.  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "Any major changes recently, new job, new home, anything like that?  "
      },
      {
        "speaker": "You",
        "text": "Work's been intense, and I've been skipping breaks.  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "Right. Let's not ________ this. I'd like to do some checks.  "
      },
      {
        "speaker": "You",
        "text": "What sort of ________ are we talking about?  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "Blood work first, and if needed, we can look at imaging later. It's mostly to ________ anything serious out.  "
      },
      {
        "speaker": "You",
        "text": "Okay. Will I need to go to the hospital for that?  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "Blood tests can be done through the surgery. If we need a scan, that's when a ________ might come in.  "
      },
      {
        "speaker": "You",
        "text": "How long will the ________ take, usually?  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "You should ________ within a ________. Sometimes it's quicker, sometimes a bit slower.  "
      },
      {
        "speaker": "You",
        "text": "If I don't hear anything, what should I do?  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "If you've heard nothing after two to three weeks, give us a ring and we'll ________ it.  "
      },
      {
        "speaker": "You",
        "text": "Got it. Is there anything I should do while I'm waiting?  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "Yes. ________: when it starts, what you were doing, what you ate, and what helps.  "
      },
      {
        "speaker": "You",
        "text": "So basically track triggers and patterns.  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "Exactly. Also try to keep meals regular and take short breaks from screens.  "
      },
      {
        "speaker": "You",
        "text": "Makes sense.  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "For today, I'll ________ this prescription for a mild option, but I'd rather start with the basics and only ________ if needed.  "
      },
      {
        "speaker": "You",
        "text": "That sounds fair.  "
      },
      {
        "speaker": "Dr. Patel",
        "text": "We'll review once the results are back and ________."
      }
    ],
    "answerVariations": [
      {
        "index": 0,
        "answer": "suffering",
        "alternatives": [
          "struggling",
          "dealing",
          "contending"
        ]
      },
      {
        "index": 1,
        "answer": "three months",
        "alternatives": [
          "a few months",
          "around three months"
        ]
      },
      {
        "index": 2,
        "answer": "Have",
        "alternatives": []
      },
      {
        "index": 3,
        "answer": "stress",
        "alternatives": [
          "pressure",
          "strain",
          "tension"
        ]
      },
      {
        "index": 4,
        "answer": "if I'm honest",
        "alternatives": [
          "to be honest",
          "honestly"
        ]
      },
      {
        "index": 5,
        "answer": "drag on",
        "alternatives": [
          "carry on",
          "last"
        ]
      },
      {
        "index": 6,
        "answer": "sick",
        "alternatives": [
          "queasy",
          "nauseous"
        ]
      },
      {
        "index": 7,
        "answer": "on and off",
        "alternatives": [
          "up and down",
          "not constant"
        ]
      },
      {
        "index": 8,
        "answer": "cutting",
        "alternatives": [
          "reducing",
          "scaling"
        ]
      },
      {
        "index": 9,
        "answer": "over-the-counter",
        "alternatives": [
          "non-prescription",
          "shop-bought"
        ]
      },
      {
        "index": 10,
        "answer": "to be fair",
        "alternatives": [
          "to be honest",
          "in fairness"
        ]
      },
      {
        "index": 11,
        "answer": "all over the place",
        "alternatives": [
          "a mess",
          "in a bad way"
        ]
      },
      {
        "index": 12,
        "answer": "feed into",
        "alternatives": [
          "make worse",
          "contribute to"
        ]
      },
      {
        "index": 13,
        "answer": "addressing",
        "alternatives": [
          "managing",
          "reducing",
          "tackling"
        ]
      },
      {
        "index": 14,
        "answer": "challenging",
        "alternatives": [
          "difficult",
          "tough",
          "hard to keep up"
        ]
      },
      {
        "index": 15,
        "answer": "brush aside",
        "alternatives": [
          "dismiss",
          "ignore",
          "overlook"
        ]
      },
      {
        "index": 16,
        "answer": "investigations",
        "alternatives": [
          "tests",
          "checks",
          "scans"
        ]
      },
      {
        "index": 17,
        "answer": "rule",
        "alternatives": []
      },
      {
        "index": 18,
        "answer": "referral",
        "alternatives": [
          "specialist referral",
          "hospital referral"
        ]
      },
      {
        "index": 19,
        "answer": "referral process",
        "alternatives": [
          "wait time",
          "timeline"
        ]
      },
      {
        "index": 20,
        "answer": "hear back",
        "alternatives": [
          "get a reply",
          "receive an update"
        ]
      },
      {
        "index": 21,
        "answer": "fortnight",
        "alternatives": [
          "two weeks",
          "a couple of weeks"
        ]
      },
      {
        "index": 22,
        "answer": "follow it up",
        "alternatives": [
          "chase it up",
          "check on it"
        ]
      },
      {
        "index": 23,
        "answer": "keep a diary",
        "alternatives": [
          "keep a record",
          "track it in a diary"
        ]
      },
      {
        "index": 24,
        "answer": "issue",
        "alternatives": [
          "write",
          "sort",
          "prepare"
        ]
      },
      {
        "index": 25,
        "answer": "step up",
        "alternatives": [
          "increase",
          "move up"
        ]
      },
      {
        "index": 26,
        "answer": "take it from there",
        "alternatives": [
          "go from there",
          "move forward"
        ]
      }
    ],
    "chunkFeedbackV2": [
      {
        "chunkId": "hc1_ch_suffering_from",
        "native": "suffering",
        "learner": {
          "meaning": "Having a problem continuously for a period of time.",
          "useWhen": "When describing an ongoing symptom or issue to a doctor.",
          "commonWrong": "I am suffering with headache from three months.",
          "fix": "I've been suffering from headaches for three months.",
          "whyOdd": "'Suffering with' and the timeline phrasing sound unnatural and make the time period unclear."
        },
        "examples": [
          "I've been suffering from back pain on and off."
        ]
      },
      {
        "chunkId": "hc1_ch_three_months",
        "native": "three months",
        "learner": {
          "meaning": "A clear time period.",
          "useWhen": "When you want to give a specific duration in a medical context.",
          "commonWrong": "from three months",
          "fix": "for three months",
          "whyOdd": "'From three months' sounds unfinished; doctors expect 'for + duration'."
        },
        "examples": [
          "It's been going on for three months."
        ]
      },
      {
        "chunkId": "hc1_ch_have_you_noticed",
        "native": "Have",
        "learner": {
          "meaning": "Asking if someone has observed something.",
          "useWhen": "When a doctor asks about patterns or triggers.",
          "commonWrong": "You noticed any pattern?",
          "fix": "Have you noticed any patterns?",
          "whyOdd": "Dropping the helper verb makes it sound abrupt and incomplete."
        },
        "examples": [
          "Have you noticed anything that makes it better or worse?"
        ]
      },
      {
        "chunkId": "hc1_ch_under_stress",
        "native": "stress",
        "learner": {
          "meaning": "Feeling pressure or mental strain.",
          "useWhen": "When explaining triggers like work pressure.",
          "commonWrong": "when I am in stress",
          "fix": "when I'm under stress",
          "whyOdd": "'In stress' is a direct translation that isn't natural English."
        },
        "examples": [
          "It flares up when I'm under stress at work."
        ]
      },
      {
        "chunkId": "hc1_ch_if_im_honest",
        "native": "if I'm honest",
        "learner": {
          "meaning": "A soft, natural way to add a truthful detail.",
          "useWhen": "When sharing something personal without sounding dramatic.",
          "commonWrong": "if I am honest speaking",
          "fix": "if I'm honest",
          "whyOdd": "Extra words make it heavy; natives keep it short."
        },
        "examples": [
          "It's been worse lately, if I'm honest."
        ]
      },
      {
        "chunkId": "hc1_ch_drag_on",
        "native": "drag on",
        "learner": {
          "meaning": "Continue for longer than expected.",
          "useWhen": "When symptoms keep going into the next part of the day.",
          "commonWrong": "it continues more long",
          "fix": "it can drag on into the evening",
          "whyOdd": "Literal phrasing sounds stiff; 'drag on' is the natural short form."
        },
        "examples": [
          "Sometimes it drags on into the night."
        ]
      },
      {
        "chunkId": "hc1_ch_feel_sick",
        "native": "sick",
        "learner": {
          "meaning": "Feel like you might vomit.",
          "useWhen": "When describing nausea in a simple, natural way.",
          "commonWrong": "I feel vomit",
          "fix": "I feel sick sometimes.",
          "whyOdd": "'Feel vomit' is not an English pattern; 'feel sick' is the everyday phrase."
        },
        "examples": [
          "I feel sick if I look at a screen for too long."
        ]
      },
      {
        "chunkId": "hc1_ch_on_and_off",
        "native": "on and off",
        "learner": {
          "meaning": "Not constant; it comes and goes.",
          "useWhen": "When describing symptoms that vary by day or week.",
          "commonWrong": "sometimes yes sometimes no",
          "fix": "It's on and off.",
          "whyOdd": "Long phrasing sounds unsure; 'on and off' is the clean label."
        },
        "examples": [
          "It's been on and off for years."
        ]
      },
      {
        "chunkId": "hc1_ch_cutting_down",
        "native": "cutting",
        "learner": {
          "meaning": "Reducing something.",
          "useWhen": "When talking about lifestyle changes you're trying.",
          "commonWrong": "I cut the screen time",
          "fix": "I've been cutting down on screen time.",
          "whyOdd": "Without 'down on', it sounds like you physically cut something."
        },
        "examples": [
          "I'm cutting down on caffeine."
        ]
      },
      {
        "chunkId": "hc1_ch_over_the_counter",
        "native": "over-the-counter",
        "learner": {
          "meaning": "Medicine you can buy without a prescription.",
          "useWhen": "When describing common painkillers in the UK.",
          "commonWrong": "market medicine",
          "fix": "over-the-counter painkillers",
          "whyOdd": "'Market medicine' is vague; 'over-the-counter' is standard."
        },
        "examples": [
          "I've only used over-the-counter painkillers so far."
        ]
      },
      {
        "chunkId": "hc1_ch_to_be_fair",
        "native": "to be fair",
        "learner": {
          "meaning": "A softener that shows you're being reasonable.",
          "useWhen": "When you're admitting concern without sounding argumentative.",
          "commonWrong": "to be fairness",
          "fix": "to be fair",
          "whyOdd": "'Fairness' is the noun; the phrase is 'to be fair'."
        },
        "examples": [
          "That's what I was worried about, to be fair."
        ]
      },
      {
        "chunkId": "hc1_ch_all_over_the_place",
        "native": "all over the place",
        "learner": {
          "meaning": "Not consistent or organised.",
          "useWhen": "When describing a messy routine (sleep, meals, schedule).",
          "commonWrong": "my sleep is not in line",
          "fix": "my sleep routine is all over the place",
          "whyOdd": "Literal phrasing sounds unnatural; this is common and clear."
        },
        "examples": [
          "My schedule's been all over the place lately."
        ]
      },
      {
        "chunkId": "hc1_ch_feed_into",
        "native": "feed into",
        "learner": {
          "meaning": "Contribute to or make something worse.",
          "useWhen": "When explaining how one factor affects a symptom.",
          "commonWrong": "stress and sleep add headache",
          "fix": "Stress and sleep can feed into headaches.",
          "whyOdd": "'Add headache' isn't natural; 'feed into' is the standard phrase."
        },
        "examples": [
          "Poor sleep can feed into headaches."
        ]
      },
      {
        "chunkId": "hc1_ch_addressing_stress_levels",
        "native": "addressing",
        "learner": {
          "meaning": "Trying to reduce or manage stress.",
          "useWhen": "When discussing practical steps you've tried.",
          "commonWrong": "reducing stress level",
          "fix": "addressing my stress levels",
          "whyOdd": "The direct phrasing sounds clipped; 'addressing' sounds complete."
        },
        "examples": [
          "I've been addressing my stress levels by walking after work."
        ]
      },
      {
        "chunkId": "hc1_ch_quite_challenging",
        "native": "challenging",
        "learner": {
          "meaning": "Difficult, said in a calm, understated way.",
          "useWhen": "When describing difficulty without sounding dramatic.",
          "commonWrong": "it is too much hard",
          "fix": "It's quite challenging.",
          "whyOdd": "Over-intense wording can sound unnatural; understatement is common."
        },
        "examples": [
          "It's quite challenging to keep it consistent."
        ]
      },
      {
        "chunkId": "hc1_ch_not_brush_aside",
        "native": "brush aside",
        "learner": {
          "meaning": "Not ignore something important.",
          "useWhen": "When a professional signals they will take a concern seriously.",
          "commonWrong": "don't ignore this",
          "fix": "Let's not brush this aside.",
          "whyOdd": "'Ignore' can sound blunt; 'brush aside' is firm but natural."
        },
        "examples": [
          "We shouldn't brush this aside given how long it's been going on."
        ]
      },
      {
        "chunkId": "hc1_ch_investigations",
        "native": "investigations",
        "learner": {
          "meaning": "Medical tests and checks.",
          "useWhen": "When discussing what tests will be done.",
          "commonWrong": "What investigation you do?",
          "fix": "What sort of investigations are we talking about?",
          "whyOdd": "Word order matters; the natural question shape sounds confident."
        },
        "examples": [
          "We'll start with basic investigations and go from there."
        ]
      },
      {
        "chunkId": "hc1_ch_rule_out",
        "native": "rule",
        "learner": {
          "meaning": "Exclude a serious cause by testing.",
          "useWhen": "When explaining why tests are needed.",
          "commonWrong": "remove the serious problems",
          "fix": "rule anything serious out",
          "whyOdd": "'Remove' isn't how doctors explain testing; 'rule out' is standard."
        },
        "examples": [
          "We're doing this to rule anything serious out."
        ]
      },
      {
        "chunkId": "hc1_ch_referral",
        "native": "referral",
        "learner": {
          "meaning": "Being sent to a specialist or hospital service.",
          "useWhen": "When talking about next steps beyond the GP.",
          "commonWrong": "I go to hospital directly",
          "fix": "I might need a referral.",
          "whyOdd": "In NHS talk, 'referral' is the normal label for specialist care."
        },
        "examples": [
          "If needed, we can make a referral."
        ]
      },
      {
        "chunkId": "hc1_ch_referral_process",
        "native": "referral process",
        "learner": {
          "meaning": "The timeline and steps after a referral is made.",
          "useWhen": "When asking how long it typically takes.",
          "commonWrong": "How long referral take?",
          "fix": "How long will the referral process take?",
          "whyOdd": "Missing structure makes it abrupt; this form is natural and polite."
        },
        "examples": [
          "How long does the referral process usually take?"
        ]
      },
      {
        "chunkId": "hc1_ch_hear_back",
        "native": "hear back",
        "learner": {
          "meaning": "Get a response or update.",
          "useWhen": "When talking about waiting for results or hospital contact.",
          "commonWrong": "get message from them",
          "fix": "hear back",
          "whyOdd": "Your version is understandable but less natural and more wordy."
        },
        "examples": [
          "You should hear back within two weeks."
        ]
      },
      {
        "chunkId": "hc1_ch_fortnight",
        "native": "fortnight",
        "learner": {
          "meaning": "About two weeks.",
          "useWhen": "In UK contexts when discussing timeframes.",
          "commonWrong": "fifteen days",
          "fix": "within a fortnight",
          "whyOdd": "'Fifteen days' is fine, but 'fortnight' is very common in UK talk."
        },
        "examples": [
          "You should hear back within a fortnight."
        ]
      },
      {
        "chunkId": "hc1_ch_follow_it_up",
        "native": "follow it up",
        "learner": {
          "meaning": "Check the status and push for an update.",
          "useWhen": "When you haven't heard back and want the clinic to chase.",
          "commonWrong": "we will do follow",
          "fix": "we'll follow it up",
          "whyOdd": "'Do follow' is incomplete; 'follow it up' is the natural phrase."
        },
        "examples": [
          "If you haven't heard, we'll follow it up."
        ]
      },
      {
        "chunkId": "hc1_ch_keep_a_diary",
        "native": "keep a diary",
        "learner": {
          "meaning": "Record details regularly.",
          "useWhen": "When a doctor asks you to track symptoms and triggers.",
          "commonWrong": "make a diary",
          "fix": "keep a diary",
          "whyOdd": "'Make' sounds like creating a book; 'keep' means maintain records over time."
        },
        "examples": [
          "Keep a diary of when it happens and what you were doing."
        ]
      },
      {
        "chunkId": "hc1_ch_issue_prescription",
        "native": "issue",
        "learner": {
          "meaning": "Formally provide a prescription.",
          "useWhen": "When a doctor gives medication paperwork.",
          "commonWrong": "I will give you prescription",
          "fix": "I'll issue this prescription.",
          "whyOdd": "'Give' is too general; 'issue' fits the formal medical setting."
        },
        "examples": [
          "I'll issue this prescription today."
        ]
      },
      {
        "chunkId": "hc1_ch_step_up",
        "native": "step up",
        "learner": {
          "meaning": "Increase or move to a stronger option.",
          "useWhen": "When discussing escalating treatment if needed.",
          "commonWrong": "go upper",
          "fix": "step up",
          "whyOdd": "'Go upper' isn't natural; 'step up' is short and common."
        },
        "examples": [
          "We can step up treatment if needed."
        ]
      },
      {
        "chunkId": "hc1_ch_take_it_from_there",
        "native": "take it from there",
        "learner": {
          "meaning": "Decide the next steps after we get new information.",
          "useWhen": "When closing a plan and moving forward calmly.",
          "commonWrong": "then we will do next",
          "fix": "and take it from there",
          "whyOdd": "Your version is understandable but awkward; this is the natural closing phrase."
        },
        "examples": [
          "We'll review the results and take it from there."
        ]
      }
    ],
    "blanksInOrder": [
      {
        "blankId": "hc1_b1",
        "chunkId": "hc1_ch_suffering_from"
      },
      {
        "blankId": "hc1_b2",
        "chunkId": "hc1_ch_three_months"
      },
      {
        "blankId": "hc1_b3",
        "chunkId": "hc1_ch_have_you_noticed"
      },
      {
        "blankId": "hc1_b4",
        "chunkId": "hc1_ch_under_stress"
      },
      {
        "blankId": "hc1_b5",
        "chunkId": "hc1_ch_if_im_honest"
      },
      {
        "blankId": "hc1_b6",
        "chunkId": "hc1_ch_drag_on"
      },
      {
        "blankId": "hc1_b7",
        "chunkId": "hc1_ch_feel_sick"
      },
      {
        "blankId": "hc1_b8",
        "chunkId": "hc1_ch_on_and_off"
      },
      {
        "blankId": "hc1_b9",
        "chunkId": "hc1_ch_cutting_down"
      },
      {
        "blankId": "hc1_b10",
        "chunkId": "hc1_ch_over_the_counter"
      },
      {
        "blankId": "hc1_b11",
        "chunkId": "hc1_ch_to_be_fair"
      },
      {
        "blankId": "hc1_b12",
        "chunkId": "hc1_ch_all_over_the_place"
      },
      {
        "blankId": "hc1_b13",
        "chunkId": "hc1_ch_feed_into"
      },
      {
        "blankId": "hc1_b14",
        "chunkId": "hc1_ch_addressing_stress_levels"
      },
      {
        "blankId": "hc1_b15",
        "chunkId": "hc1_ch_quite_challenging"
      },
      {
        "blankId": "hc1_b16",
        "chunkId": "hc1_ch_not_brush_aside"
      },
      {
        "blankId": "hc1_b17",
        "chunkId": "hc1_ch_investigations"
      },
      {
        "blankId": "hc1_b18",
        "chunkId": "hc1_ch_rule_out"
      },
      {
        "blankId": "hc1_b19",
        "chunkId": "hc1_ch_referral"
      },
      {
        "blankId": "hc1_b20",
        "chunkId": "hc1_ch_referral_process"
      },
      {
        "blankId": "hc1_b21",
        "chunkId": "hc1_ch_hear_back"
      },
      {
        "blankId": "hc1_b22",
        "chunkId": "hc1_ch_fortnight"
      },
      {
        "blankId": "hc1_b23",
        "chunkId": "hc1_ch_follow_it_up"
      },
      {
        "blankId": "hc1_b24",
        "chunkId": "hc1_ch_keep_a_diary"
      },
      {
        "blankId": "hc1_b25",
        "chunkId": "hc1_ch_issue_prescription"
      },
      {
        "blankId": "hc1_b26",
        "chunkId": "hc1_ch_step_up"
      },
      {
        "blankId": "hc1_b27",
        "chunkId": "hc1_ch_take_it_from_there"
      }
    ],
    "patternSummary": {
      "categoryBreakdown": [
        {
          "category": "Repair",
    "customLabel": "Clear symptom reporting",
          "count": 8,
          "exampleChunkIds": [
            "hc1_ch_suffering_from",
            "hc1_ch_three_months",
            "hc1_ch_feel_sick",
            "hc1_ch_on_and_off",
            "hc1_ch_drag_on",
            "hc1_ch_all_over_the_place",
            "hc1_ch_if_im_honest",
            "hc1_ch_to_be_fair"
          ],
          "insight": "You practise giving a clean timeline, describing variation, and adding honest details in a natural UK tone without over-explaining."
        },
        {
          "category": "Idioms",
    "customLabel": "Triggers and practical changes",
          "count": 5,
          "exampleChunkIds": [
            "hc1_ch_under_stress",
            "hc1_ch_feed_into",
            "hc1_ch_addressing_stress_levels",
            "hc1_ch_cutting_down",
            "hc1_ch_keep_a_diary"
          ],
          "insight": "You learn to connect stress, sleep, and screens to symptoms, and talk about practical tracking and small lifestyle steps."
        },
        {
          "category": "Exit",
    "customLabel": "Next steps and NHS language",
          "count": 6,
          "exampleChunkIds": [
            "hc1_ch_not_brush_aside",
            "hc1_ch_investigations",
            "hc1_ch_rule_out",
            "hc1_ch_referral",
            "hc1_ch_referral_process",
            "hc1_ch_fortnight"
          ],
          "insight": "You get comfortable asking about checks and timelines, and you hear how tests and referrals are explained in a calm, normal way."
        }
      ],
      "overallInsight": "This package trains you to handle a GP appointment without rambling or sounding unsure. You practise stating duration, frequency, and triggers, then you learn how a GP sets expectations: do basic checks, explain why they are being done, and outline the usual timeline. The chunks are chosen so you can speak naturally about symptoms and process, ask sensible questions, and understand what happens next.",
      "keyPatterns": [
        {
          "pattern": "Honest detail, calm tone",
          "explanation": "Small softeners like \"if I'm honest\" and \"to be fair\" help you share real concerns without sounding dramatic. This keeps the conversation practical and helps the GP focus on details.",
          "chunkIds": [
            "hc1_ch_if_im_honest",
            "hc1_ch_to_be_fair",
            "hc1_ch_quite_challenging"
          ]
        },
        {
          "pattern": "Tests framed as reassurance",
          "explanation": "A GP often explains checks as a way to exclude serious causes, not as a sign something is wrong. When you understand \"investigations\" and \"rule out,\" the plan sounds sensible rather than scary.",
          "chunkIds": [
            "hc1_ch_investigations",
            "hc1_ch_rule_out",
            "hc1_ch_not_brush_aside"
          ]
        },
        {
          "pattern": "Process questions that sound natural",
          "explanation": "Knowing how to talk about results and referrals lets you ask clear questions. Phrases like \"hear back,\" \"referral process,\" and \"follow it up\" keep the plan simple and actionable.",
          "chunkIds": [
            "hc1_ch_hear_back",
            "hc1_ch_referral_process",
            "hc1_ch_follow_it_up",
            "hc1_ch_fortnight"
          ]
        },
        {
          "pattern": "Close the plan cleanly",
          "explanation": "Doctors often finish with a simple next-step close. \"Step up\" and \"take it from there\" make the plan sound organised and calm.",
          "chunkIds": [
            "hc1_ch_step_up",
            "hc1_ch_take_it_from_there",
            "hc1_ch_issue_prescription"
          ]
        }
      ]
    },
    "activeRecall": [
      {
        "id": "hc1_ar_1",
        "prompt": "Choose the chunk that clearly states an ongoing symptom in a GP appointment.",
        "targetChunkIds": [
          "hc1_ch_suffering_from"
        ]
      },
      {
        "id": "hc1_ar_2",
        "prompt": "Fill the gap: 'It's been going on for ________.'",
        "targetChunkIds": [
          "hc1_ch_three_months"
        ]
      },
      {
        "id": "hc1_ar_3",
        "prompt": "Choose the chunk that means 'it comes and goes.'",
        "targetChunkIds": [
          "hc1_ch_on_and_off"
        ]
      },
      {
        "id": "hc1_ar_4",
        "prompt": "Fill the gap: 'Stress and sleep can ________ headaches.'",
        "targetChunkIds": [
          "hc1_ch_feed_into"
        ]
      },
      {
        "id": "hc1_ar_5",
        "prompt": "Choose the chunk a GP uses for medical tests and checks.",
        "targetChunkIds": [
          "hc1_ch_investigations"
        ]
      },
      {
        "id": "hc1_ar_6",
        "prompt": "Choose the chunk that means 'exclude a serious cause.'",
        "targetChunkIds": [
          "hc1_ch_rule_out"
        ]
      },
      {
        "id": "hc1_ar_7",
        "prompt": "Fill the gap: 'You should ________ within a ________.'",
        "targetChunkIds": [
          "hc1_ch_hear_back"
        ]
      },
      {
        "id": "hc1_ar_8",
        "prompt": "Choose the chunk that means 'check the status and chase an update.'",
        "targetChunkIds": [
          "hc1_ch_follow_it_up"
        ]
      },
      {
        "id": "hc1_ar_9",
        "prompt": "Choose the chunk that means 'record symptoms regularly.'",
        "targetChunkIds": [
          "hc1_ch_keep_a_diary"
        ]
      },
      {
        "id": "hc1_ar_10",
        "prompt": "Choose the chunk that means 'increase to a stronger option if needed.'",
        "targetChunkIds": [
          "hc1_ch_step_up"
        ]
      },
      {
        "id": "hc1_ar_11",
        "prompt": "Fill the gap: 'We'll review once the results are back and ________.'",
        "targetChunkIds": [
          "hc1_ch_take_it_from_there"
        ]
      }
    ]
  },
  {
    "id": "cultural-1-theatre-booking",
    "category": "Cultural",
    "topic": "Theatre Box Office - Complex Seating Request",
    "context": "Booking premium West End theatre tickets with specific accessibility and group requirements.",
    "characters": [
      {
        "name": "Sophie",
        "description": "Theatre box office clerk",
        "avatarUrl": "/avatars/theatre.png"
      },
      {
        "name": "You",
        "description": "Theatre patron with detailed requirements"
      }
    ],
    "dialogue": [
      {
        "speaker": "Sophie",
        "text": "Good afternoon. How can I assist you today?"
      },
      {
        "speaker": "You",
        "text": "I'd like to ________ four seats for the Saturday matinée performance."
      },
      {
        "speaker": "Sophie",
        "text": "Splendid. And which production are you ________ in?"
      },
      {
        "speaker": "You",
        "text": "The revival of \"Waiting for Godot\". I'm rather ________ on the cast."
      },
      {
        "speaker": "Sophie",
        "text": "Excellent choice. Now, the thing ________, we've a group booking discount if you're a party of six or more."
      },
      {
        "speaker": "You",
        "text": "We're only four, I'm afraid. But one audience member has ________ mobility, so we need accessible seating."
      },
      {
        "speaker": "Sophie",
        "text": "Of ________ . We have specially designated spaces with ample room for wheelchairs."
      },
      {
        "speaker": "You",
        "text": "That's brilliant. Would you ________ us the best available options?"
      },
      {
        "speaker": "Sophie",
        "text": "Let me ________ our system. We have two excellent seats in the dress circle, orchestra level access..."
      },
      {
        "speaker": "You",
        "text": "The dress circle sounds ________ , actually."
      },
      {
        "speaker": "Sophie",
        "text": "Marvellous. That will be £156 total, including the booking ________ ."
      },
      {
        "speaker": "You",
        "text": "Can I ________ my card details over the phone?"
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "book",
        "alternatives": [
          "reserve",
          "secure",
          "arrange"
        ]
      },
      {
        "index": 2,
        "answer": "interested",
        "alternatives": [
          "keen",
          "focused",
          "absorbed"
        ]
      },
      {
        "index": 3,
        "answer": "keen",
        "alternatives": [
          "interested",
          "enthusiastic",
          "delighted"
        ]
      },
      {
        "index": 4,
        "answer": "is",
        "alternatives": [
          "goes",
          "stands",
          "works"
        ]
      },
      {
        "index": 5,
        "answer": "limited",
        "alternatives": [
          "restricted",
          "reduced",
          "compromised"
        ]
      },
      {
        "index": 6,
        "answer": "course",
        "alternatives": [
          "problem",
          "question",
          "issue"
        ]
      },
      {
        "index": 7,
        "answer": "show",
        "alternatives": [
          "share",
          "present",
          "outline"
        ]
      },
      {
        "index": 8,
        "answer": "check",
        "alternatives": [
          "look at",
          "pull up",
          "access"
        ]
      },
      {
        "index": 9,
        "answer": "perfect",
        "alternatives": [
          "ideal",
          "marvellous",
          "splendid"
        ]
      },
      {
        "index": 10,
        "answer": "fee",
        "alternatives": [
          "charge",
          "cost",
          "expense"
        ]
      },
      {
        "index": 11,
        "answer": "provide",
        "alternatives": [
          "give",
          "offer",
          "submit"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 2,
        "phrase": "keen on",
        "insight": "Native British idiom expressing genuine enthusiasm. More conversational than \"interested in\" and signals refined taste (Band 8)."
      },
      {
        "index": 3,
        "phrase": "the thing is",
        "insight": "Conversational discourse marker unique to British English. Signals transition whilst maintaining rapport. Essential for Band 7.5+ natural speech."
      },
      {
        "index": 5,
        "phrase": "Of course",
        "insight": "British politeness convention. Sophie uses it to indicate helpful professionalism, not condescension. Register-critical for service interactions."
      },
      {
        "index": 8,
        "phrase": "check our system",
        "insight": "Professional phrasal verb in service context. \"Look at\" is too casual, \"access\" too technical. Demonstrates operational familiarity."
      }
    ]
  },
  {
    "id": "community-1-council-meeting",
    "category": "Community",
    "topic": "Council Meeting - Local Development Proposal",
    "context": "You're speaking at a town council meeting to oppose a proposed development that would affect your community. Your goal is to present residents' concerns clearly, reference supporting evidence (petition), and make a formal request to the council. Keep your tone respectful but firm—this is public record.",
    "characters": [
      {
        "name": "Councillor Ahmed",
        "description": "Council chair"
      },
      {
        "name": "You",
        "description": "Community representative and resident"
      }
    ],
    "dialogue": [
      {
        "speaker": "Councillor Ahmed",
        "text": "Right then, the floor is yours. Please ________ your concerns about the planning application.  "
      },
      {
        "speaker": "You",
        "text": "Thank you for the ________.  "
      },
      {
        "speaker": "You",
        "text": "Residents are ________ concerned about the scale of this development.  "
      },
      {
        "speaker": "You",
        "text": "We've ________ a petition with 387 signatures objecting to the proposal.  "
      },
      {
        "speaker": "Councillor Ahmed",
        "text": "That's ________ community engagement.  "
      },
      {
        "speaker": "Councillor Ahmed",
        "text": "We take public ________ seriously. What are your main objections?  "
      },
      {
        "speaker": "You",
        "text": "First, ________ would fundamentally alter our neighbourhood character.  "
      },
      {
        "speaker": "You",
        "text": "The ________ simply doesn't fit the area.  "
      },
      {
        "speaker": "You",
        "text": "Second, the ________ impact is unacceptable.  "
      },
      {
        "speaker": "You",
        "text": "Our infrastructure can't ________ the additional load.  "
      },
      {
        "speaker": "Councillor Ahmed",
        "text": "I see your ________.  "
      },
      {
        "speaker": "Councillor Ahmed",
        "text": "Could you elaborate on the traffic concern?  "
      },
      {
        "speaker": "You",
        "text": "Certainly. The development will ________ traffic by an estimated 40%.  "
      },
      {
        "speaker": "You",
        "text": "Our roads simply can't ________ this volume.  "
      },
      {
        "speaker": "You",
        "text": "We're also worried about ________ during construction.  "
      },
      {
        "speaker": "You",
        "text": "It'll ________ for at least 18 months.  "
      },
      {
        "speaker": "Councillor Ahmed",
        "text": "That's a fair ________.  "
      },
      {
        "speaker": "Councillor Ahmed",
        "text": "Have you ________ these concerns during the consultation period?  "
      },
      {
        "speaker": "You",
        "text": "We have. We ________ our objections in writing.  "
      },
      {
        "speaker": "You",
        "text": "But the developers ________ our requests.  "
      },
      {
        "speaker": "Councillor Ahmed",
        "text": "And what was their response?  "
      },
      {
        "speaker": "You",
        "text": "They're not ________ to compromise on scale.  "
      },
      {
        "speaker": "You",
        "text": "They ________ minor adjustments to the parking, but that doesn't ________ our core concerns.  "
      },
      {
        "speaker": "Councillor Ahmed",
        "text": "I understand your ________.  "
      },
      {
        "speaker": "Councillor Ahmed",
        "text": "What outcome are you seeking today?  "
      },
      {
        "speaker": "You",
        "text": "We'd be grateful if the council would ________ the proposal ________.  "
      },
      {
        "speaker": "You",
        "text": "Alternatively, if that's not possible, we'd ask that you ________ it back to the developers for substantial ________.  "
      },
      {
        "speaker": "Councillor Ahmed",
        "text": "Your ________ is noted for the official record.  "
      },
      {
        "speaker": "Councillor Ahmed",
        "text": "We'll ________ all viewpoints before making a decision.  "
      },
      {
        "speaker": "You",
        "text": "Thank you. Could you ________ when we might hear the council's decision?  "
      },
      {
        "speaker": "Councillor Ahmed",
        "text": "We ________ to make a decision within six weeks.  "
      },
      {
        "speaker": "Councillor Ahmed",
        "text": "You'll be ________ by post.  "
      },
      {
        "speaker": "You",
        "text": "That's ________.  "
      },
      {
        "speaker": "You",
        "text": "We ________ the council taking our concerns seriously."
      }
    ],
    "answerVariations": [
      {
        "index": 0,
        "answer": "outline",
        "alternatives": [
          "set out",
          "present",
          "explain"
        ]
      },
      {
        "index": 1,
        "answer": "opportunity",
        "alternatives": [
          "chance",
          "time"
        ]
      },
      {
        "index": 2,
        "answer": "extremely",
        "alternatives": [
          "genuinely",
          "deeply",
          "very"
        ]
      },
      {
        "index": 3,
        "answer": "organised",
        "alternatives": [
          "gathered",
          "compiled",
          "collected"
        ]
      },
      {
        "index": 4,
        "answer": "impressive",
        "alternatives": [
          "significant",
          "notable",
          "commendable"
        ]
      },
      {
        "index": 5,
        "answer": "feedback",
        "alternatives": [
          "input",
          "opinion",
          "comments"
        ]
      },
      {
        "index": 6,
        "answer": "this development",
        "alternatives": [
          "the proposal",
          "this project",
          "the plan"
        ]
      },
      {
        "index": 7,
        "answer": "scale",
        "alternatives": [
          "size",
          "density",
          "scope"
        ]
      },
      {
        "index": 8,
        "answer": "traffic",
        "alternatives": [
          "transport",
          "congestion"
        ]
      },
      {
        "index": 9,
        "answer": "cope with",
        "alternatives": [
          "handle",
          "manage",
          "support"
        ]
      },
      {
        "index": 10,
        "answer": "point",
        "alternatives": [
          "concern",
          "objection"
        ]
      },
      {
        "index": 11,
        "answer": "increase",
        "alternatives": [
          "raise",
          "add to",
          "worsen"
        ]
      },
      {
        "index": 12,
        "answer": "handle",
        "alternatives": [
          "accommodate",
          "support",
          "manage"
        ]
      },
      {
        "index": 13,
        "answer": "disruption",
        "alternatives": [
          "disturbance",
          "upheaval",
          "chaos"
        ]
      },
      {
        "index": 14,
        "answer": "drag on",
        "alternatives": [
          "last",
          "continue",
          "go on"
        ]
      },
      {
        "index": 15,
        "answer": "point",
        "alternatives": [
          "concern",
          "argument",
          "observation"
        ]
      },
      {
        "index": 16,
        "answer": "raised",
        "alternatives": [
          "put forward",
          "flagged",
          "voiced"
        ]
      },
      {
        "index": 17,
        "answer": "submitted",
        "alternatives": [
          "lodged",
          "filed",
          "put in"
        ]
      },
      {
        "index": 18,
        "answer": "dismissed",
        "alternatives": [
          "rejected",
          "ignored",
          "brushed aside"
        ]
      },
      {
        "index": 19,
        "answer": "willing",
        "alternatives": [
          "open",
          "prepared",
          "ready"
        ]
      },
      {
        "index": 20,
        "answer": "offered",
        "alternatives": [
          "proposed",
          "suggested",
          "put forward"
        ]
      },
      {
        "index": 21,
        "answer": "address",
        "alternatives": [
          "tackle",
          "resolve",
          "deal with"
        ]
      },
      {
        "index": 22,
        "answer": "frustration",
        "alternatives": [
          "disappointment",
          "concern",
          "position"
        ]
      },
      {
        "index": 23,
        "answer": "reject",
        "alternatives": [
          "refuse",
          "block",
          "decline"
        ]
      },
      {
        "index": 24,
        "answer": "outright",
        "alternatives": [
          "completely",
          "entirely",
          "altogether"
        ]
      },
      {
        "index": 25,
        "answer": "send",
        "alternatives": [
          "refer",
          "return",
          "pass"
        ]
      },
      {
        "index": 26,
        "answer": "revisions",
        "alternatives": [
          "modifications",
          "changes",
          "amendments"
        ]
      },
      {
        "index": 27,
        "answer": "objection",
        "alternatives": [
          "concern",
          "complaint",
          "opposition"
        ]
      },
      {
        "index": 28,
        "answer": "weigh",
        "alternatives": [
          "consider",
          "evaluate",
          "assess"
        ]
      },
      {
        "index": 29,
        "answer": "clarify",
        "alternatives": [
          "confirm",
          "indicate",
          "let us know"
        ]
      },
      {
        "index": 30,
        "answer": "aim",
        "alternatives": [
          "expect",
          "plan",
          "intend"
        ]
      },
      {
        "index": 31,
        "answer": "notified",
        "alternatives": [
          "informed",
          "contacted",
          "updated"
        ]
      },
      {
        "index": 32,
        "answer": "helpful",
        "alternatives": [
          "good to know",
          "reassuring",
          "appreciated"
        ]
      },
      {
        "index": 33,
        "answer": "appreciate",
        "alternatives": [
          "value",
          "are grateful for",
          "welcome"
        ]
      }
    ],
    "chunkFeedbackV2": [
      {
        "chunkId": "com1_ch_outline",
        "native": "outline",
        "learner": {
          "meaning": "Present the main points in a structured way.",
          "useWhen": "When a council or formal meeting asks you to explain your position.",
          "commonWrong": "I will tell you my concerns about the planning.",
          "fix": "Please outline your concerns about the planning application.",
          "whyOdd": "'Tell' is too casual for formal council settings; 'outline' signals a structured presentation expected in official contexts."
        },
        "examples": [
          "Could you outline the main issues for the committee?",
          "I'd like to outline three key objections today."
        ]
      },
      {
        "chunkId": "com1_ch_opportunity",
        "native": "opportunity",
        "learner": {
          "meaning": "The chance to speak or participate.",
          "useWhen": "When thanking a council for allowing you to address them formally.",
          "commonWrong": "Thank you for the chance to speak.",
          "fix": "Thank you for the opportunity.",
          "whyOdd": "'Chance' is too casual for formal civic settings; 'opportunity' is the respectful, professional term that shows you understand the formality of the occasion."
        },
        "examples": [
          "We appreciate the opportunity to present our case.",
          "Thank you for this opportunity to raise our concerns."
        ]
      },
      {
        "chunkId": "com1_ch_extremely",
        "native": "extremely",
        "learner": {
          "meaning": "Very much; to a high degree.",
          "useWhen": "When emphasising the strength of residents' feelings in formal settings.",
          "commonWrong": "Residents are very much concerned about this.",
          "fix": "Residents are extremely concerned about the scale of this development.",
          "whyOdd": "'Very much' sounds clumsy in formal speech; 'extremely' is clean and carries weight in council discourse."
        },
        "examples": [
          "We are extremely worried about the impact.",
          "The community is extremely opposed to this change."
        ]
      },
      {
        "chunkId": "com1_ch_organised",
        "native": "organised",
        "learner": {
          "meaning": "Gathered and arranged systematically (British spelling).",
          "useWhen": "When showing you have formal community support through a petition.",
          "commonWrong": "We organized a petition with 387 signatures.",
          "fix": "We've organised a petition with 387 signatures.",
          "whyOdd": "In British English, 'organised' uses 's', not 'z'. This is civic engagement vocabulary that signals coordinated community action."
        },
        "examples": [
          "We've organised a residents' meeting to discuss this.",
          "The group organised a campaign against the proposal."
        ]
      },
      {
        "chunkId": "com1_ch_impressive",
        "native": "impressive",
        "learner": {
          "meaning": "Noteworthy; showing significant effort or support.",
          "useWhen": "When a councillor acknowledges strong community engagement.",
          "commonWrong": "That's good community engagement.",
          "fix": "That's impressive community engagement.",
          "whyOdd": "'Good' is too weak for 387 signatures; 'impressive' shows the councillor recognises the scale of organisation, which validates your effort and signals respect."
        },
        "examples": [
          "That's an impressive turnout for the consultation.",
          "The level of detail in your submission is impressive."
        ]
      },
      {
        "chunkId": "com1_ch_feedback",
        "native": "feedback",
        "learner": {
          "meaning": "Comments or opinions from the public.",
          "useWhen": "When a council acknowledges public input in formal meetings.",
          "commonWrong": "We take public opinion serious.",
          "fix": "We take public feedback seriously.",
          "whyOdd": "Without 'seriously' and using 'serious', it sounds incomplete. 'Feedback' is the standard term for council consultation processes."
        },
        "examples": [
          "We welcome all public feedback on this matter.",
          "Your feedback will be recorded in the minutes."
        ]
      },
      {
        "chunkId": "com1_ch_this_development",
        "native": "this development",
        "learner": {
          "meaning": "The specific building project or proposal being discussed.",
          "useWhen": "When making a formal statement about the proposal without being overly technical.",
          "commonWrong": "It would fundamentally alter our neighbourhood character.",
          "fix": "This development would fundamentally alter our neighbourhood character.",
          "whyOdd": "Starting with 'it' is vague in formal speech; 'this development' is clear and maintains formality for the council record."
        },
        "examples": [
          "This development poses serious risks to the area.",
          "We believe this development is inappropriate for our community."
        ]
      },
      {
        "chunkId": "com1_ch_scale",
        "native": "scale",
        "learner": {
          "meaning": "The size or extent of something.",
          "useWhen": "When discussing the physical size or density of a development in planning contexts.",
          "commonWrong": "The size simply doesn't fit the area.",
          "fix": "The scale simply doesn't fit the area.",
          "whyOdd": "'Size' is more casual; 'scale' is the formal planning term that includes not just physical dimensions but also density, height, and overall impact—it's the professional vocabulary councillors expect."
        },
        "examples": [
          "The scale of the proposal is completely out of proportion.",
          "We're concerned about the scale and density."
        ]
      },
      {
        "chunkId": "com1_ch_traffic",
        "native": "traffic",
        "learner": {
          "meaning": "Vehicles on the road; congestion concerns.",
          "useWhen": "When discussing the transport impact of a development.",
          "commonWrong": "The car impact is unacceptable.",
          "fix": "The traffic impact is unacceptable.",
          "whyOdd": "'Car impact' is not standard planning language; 'traffic' or 'traffic impact' is the expected term in council objections."
        },
        "examples": [
          "Traffic on our street has already doubled this year.",
          "The traffic survey underestimates the real volume."
        ]
      },
      {
        "chunkId": "com1_ch_cope_with",
        "native": "cope with",
        "learner": {
          "meaning": "Manage or deal with a difficult situation or load.",
          "useWhen": "When explaining that infrastructure cannot handle additional demand.",
          "commonWrong": "Our infrastructure can't deal the additional load.",
          "fix": "Our infrastructure can't cope with the additional load.",
          "whyOdd": "'Deal' needs 'with' to be complete; 'cope with' is the natural phrase for infrastructure capacity concerns and sounds more formal than 'handle' in this context."
        },
        "examples": [
          "The drainage system can't cope with heavy rainfall.",
          "Local services are struggling to cope with current demand."
        ]
      },
      {
        "chunkId": "com1_ch_point",
        "native": "point",
        "learner": {
          "meaning": "A specific concern or argument you've raised.",
          "useWhen": "When a councillor acknowledges something you've said.",
          "commonWrong": "I see your concern.",
          "fix": "I see your point.",
          "whyOdd": "While 'concern' works, 'point' is the standard way councillors acknowledge an argument in formal meetings—it's neutral and procedural."
        },
        "examples": [
          "That's a fair point about parking.",
          "I take your point, but we must also consider the benefits."
        ]
      },
      {
        "chunkId": "com1_ch_increase",
        "native": "increase",
        "learner": {
          "meaning": "Make larger or greater in amount.",
          "useWhen": "When quantifying the negative impact of a development.",
          "commonWrong": "The development will make traffic bigger by 40%.",
          "fix": "The development will increase traffic by an estimated 40%.",
          "whyOdd": "'Make bigger' is informal and childish; 'increase' is the precise, formal term for quantifiable impacts."
        },
        "examples": [
          "This will increase congestion during rush hour.",
          "Noise levels will increase significantly."
        ]
      },
      {
        "chunkId": "com1_ch_handle",
        "native": "handle",
        "learner": {
          "meaning": "Manage or cope with a volume or load.",
          "useWhen": "When explaining that infrastructure can't support additional demand.",
          "commonWrong": "Our roads simply cannot take this volume.",
          "fix": "Our roads simply can't handle this volume.",
          "whyOdd": "'Take' is too general; 'handle' specifically means cope with capacity, which is the standard phrasing for infrastructure concerns."
        },
        "examples": [
          "The local schools can't handle more students.",
          "Our drainage system cannot handle heavy rainfall."
        ]
      },
      {
        "chunkId": "com1_ch_disruption",
        "native": "disruption",
        "learner": {
          "meaning": "Disturbance or interruption of normal life or activity.",
          "useWhen": "When raising concerns about construction impact on daily life.",
          "commonWrong": "We're also worried about the noise during construction.",
          "fix": "We're also worried about disruption during construction.",
          "whyOdd": "'Noise' is just one element; 'disruption' captures the full impact—noise, dust, road closures, safety concerns—and is the comprehensive planning term councils expect."
        },
        "examples": [
          "The disruption to local businesses will be severe.",
          "Residents will face significant disruption for months."
        ]
      },
      {
        "chunkId": "com1_ch_drag_on",
        "native": "drag on",
        "learner": {
          "meaning": "Continue for an uncomfortably long time.",
          "useWhen": "When emphasising that construction will last longer than tolerable.",
          "commonWrong": "It'll continue for at least 18 months.",
          "fix": "It'll drag on for at least 18 months.",
          "whyOdd": "'Continue' is neutral; 'drag on' conveys the burden and tedium of prolonged disruption, which strengthens your objection by showing impact on quality of life."
        },
        "examples": [
          "These works could drag on for years.",
          "The uncertainty will just drag on indefinitely."
        ]
      },
      {
        "chunkId": "com1_ch_raised",
        "native": "raised",
        "learner": {
          "meaning": "Brought up or mentioned formally.",
          "useWhen": "When referring to concerns you presented during official consultation.",
          "commonWrong": "Have you said these concerns during the consultation period?",
          "fix": "Have you raised these concerns during the consultation period?",
          "whyOdd": "'Said' is too casual; 'raised' is the formal term for bringing issues to official attention during consultation processes."
        },
        "examples": [
          "We raised this issue at the last meeting.",
          "Several residents raised similar concerns."
        ]
      },
      {
        "chunkId": "com1_ch_submitted",
        "native": "submitted",
        "learner": {
          "meaning": "Formally sent in or lodged.",
          "useWhen": "When explaining you provided official written objections.",
          "commonWrong": "We gave our objections in writing.",
          "fix": "We submitted our objections in writing.",
          "whyOdd": "'Gave' sounds informal; 'submitted' is the formal bureaucratic term for providing documents to councils and carries legal weight."
        },
        "examples": [
          "We submitted a detailed response to the consultation.",
          "The objection was submitted before the deadline."
        ]
      },
      {
        "chunkId": "com1_ch_dismissed",
        "native": "dismissed",
        "learner": {
          "meaning": "Rejected or refused to consider seriously.",
          "useWhen": "When explaining that the other party ignored your legitimate concerns.",
          "commonWrong": "The developers ignored our requests.",
          "fix": "The developers dismissed our requests.",
          "whyOdd": "'Ignored' is weaker and more personal; 'dismissed' is stronger and more formal, implying the developers actively rejected valid concerns rather than just overlooking them."
        },
        "examples": [
          "Our concerns were dismissed out of hand.",
          "They dismissed the environmental impact as minimal."
        ]
      },
      {
        "chunkId": "com1_ch_willing",
        "native": "willing",
        "learner": {
          "meaning": "Ready or prepared to do something.",
          "useWhen": "When diplomatically stating that the other party won't compromise.",
          "commonWrong": "They are not ready to compromise on scale.",
          "fix": "They're not willing to compromise on scale.",
          "whyOdd": "'Ready' sounds like they lack ability; 'willing' signals choice and implies they could compromise but won't—this is diplomatic language for adversarial contexts."
        },
        "examples": [
          "The developer is not willing to reduce the height.",
          "Are they willing to meet us halfway?"
        ]
      },
      {
        "chunkId": "com1_ch_offered",
        "native": "offered",
        "learner": {
          "meaning": "Proposed or put forward as a concession.",
          "useWhen": "When explaining what minor changes the other party suggested.",
          "commonWrong": "They gave minor adjustments to the parking.",
          "fix": "They offered minor adjustments to the parking.",
          "whyOdd": "'Gave' sounds like a completed action; 'offered' shows it was proposed but not necessarily accepted, which is important in negotiation contexts."
        },
        "examples": [
          "They offered a small reduction in height.",
          "The only concession they offered was more landscaping."
        ]
      },
      {
        "chunkId": "com1_ch_address",
        "native": "address",
        "learner": {
          "meaning": "Deal with or tackle a problem.",
          "useWhen": "When explaining that proposed changes don't solve your main concerns.",
          "commonWrong": "That doesn't solve our core concerns.",
          "fix": "That doesn't address our core concerns.",
          "whyOdd": "'Solve' implies complete resolution; 'address' is the formal planning term meaning 'properly tackle or respond to'—it's what councils expect when discussing whether proposals meet objections."
        },
        "examples": [
          "The revised plans don't address the traffic issue.",
          "We need solutions that genuinely address these problems."
        ]
      },
      {
        "chunkId": "com1_ch_frustration",
        "native": "frustration",
        "learner": {
          "meaning": "Disappointment or annoyance when things don't work out.",
          "useWhen": "When acknowledging your feelings while staying professional.",
          "commonWrong": "I understand your anger.",
          "fix": "I understand your frustration.",
          "whyOdd": "'Anger' is too strong and emotional for formal council settings; 'frustration' is diplomatic—it validates feelings while keeping the tone professional."
        },
        "examples": [
          "I can appreciate your frustration with the process.",
          "The frustration in the community is palpable."
        ]
      },
      {
        "chunkId": "com1_ch_reject",
        "native": "reject",
        "learner": {
          "meaning": "Formally refuse or turn down a proposal.",
          "useWhen": "When making a formal request for the council to block the development.",
          "commonWrong": "We'd be grateful if the council would say no to the proposal.",
          "fix": "We'd be grateful if the council would reject the proposal.",
          "whyOdd": "'Say no' is too casual for a formal request; 'reject' is the official term for council decisions and matches the gravity of the ask."
        },
        "examples": [
          "We urge the council to reject this application.",
          "The planning committee voted to reject the scheme."
        ]
      },
      {
        "chunkId": "com1_ch_outright",
        "native": "outright",
        "learner": {
          "meaning": "Completely; totally; without conditions.",
          "useWhen": "When emphasising you want full rejection, not partial approval.",
          "commonWrong": "Reject the proposal completely.",
          "fix": "Reject the proposal outright.",
          "whyOdd": "'Completely' works but 'outright' is the stronger, more formal planning term that signals no compromise—it's the natural intensifier in council objection language."
        },
        "examples": [
          "We're asking for outright refusal.",
          "The application should be rejected outright."
        ]
      },
      {
        "chunkId": "com1_ch_send",
        "native": "send",
        "learner": {
          "meaning": "Refer back or return to.",
          "useWhen": "When proposing an alternative outcome if full rejection isn't possible.",
          "commonWrong": "We'd ask that you give it back to the developers.",
          "fix": "We'd ask that you send it back to the developers.",
          "whyOdd": "'Give it back' sounds childish; 'send it back' is the formal procedural language for returning applications for revision."
        },
        "examples": [
          "Could you send it back for further consultation?",
          "The committee decided to send the plans back."
        ]
      },
      {
        "chunkId": "com1_ch_revisions",
        "native": "revisions",
        "learner": {
          "meaning": "Changes or modifications to a plan.",
          "useWhen": "When requesting substantial changes to the development proposal.",
          "commonWrong": "Send it back to the developers for big changes.",
          "fix": "Send it back to the developers for substantial revisions.",
          "whyOdd": "'Big changes' is too casual; 'substantial revisions' is the formal planning terminology that signals major alterations are needed, not just tweaks."
        },
        "examples": [
          "The plans need significant revisions before approval.",
          "We expect to see major revisions to the scheme."
        ]
      },
      {
        "chunkId": "com1_ch_objection",
        "native": "objection",
        "learner": {
          "meaning": "A formal statement of disagreement or opposition.",
          "useWhen": "When a council records your formal opposition to a proposal.",
          "commonWrong": "Your complaint is noted for the official record.",
          "fix": "Your objection is noted for the official record.",
          "whyOdd": "'Complaint' sounds petty and personal; 'objection' is the formal planning term that carries legal weight in council records."
        },
        "examples": [
          "We have lodged an objection with the planning office.",
          "Five objections were raised during the consultation."
        ]
      },
      {
        "chunkId": "com1_ch_weigh",
        "native": "weigh",
        "learner": {
          "meaning": "Consider carefully and balance different views.",
          "useWhen": "When a council signals they will review all perspectives before deciding.",
          "commonWrong": "We'll look at all viewpoints before making a decision.",
          "fix": "We'll weigh all viewpoints before making a decision.",
          "whyOdd": "'Look at' is too casual and sounds uncommitted; 'weigh' is the formal bureaucratic phrasing that shows impartial evaluation—essential for understanding civic discourse."
        },
        "examples": [
          "The committee will weigh the evidence carefully.",
          "We must weigh the benefits against the risks."
        ]
      },
      {
        "chunkId": "com1_ch_clarify",
        "native": "clarify",
        "learner": {
          "meaning": "Make clear or confirm.",
          "useWhen": "When politely asking for specific information about process or timeline.",
          "commonWrong": "Could you tell us when we might hear the council's decision?",
          "fix": "Could you clarify when we might hear the council's decision?",
          "whyOdd": "'Tell us' sounds demanding; 'clarify' is the polite, formal way to request procedural information from officials."
        },
        "examples": [
          "Could you clarify the next steps in the process?",
          "I'd like to clarify what happens after today's meeting."
        ]
      },
      {
        "chunkId": "com1_ch_aim",
        "native": "aim",
        "learner": {
          "meaning": "Intend or plan to (with some flexibility implied).",
          "useWhen": "When councils give indicative timelines without making hard promises.",
          "commonWrong": "We will make a decision within six weeks.",
          "fix": "We aim to make a decision within six weeks.",
          "whyOdd": "'Will' is too definitive and councils avoid firm commitments; 'aim' is the standard bureaucratic hedge that signals intention without legal commitment."
        },
        "examples": [
          "We aim to respond within 28 days.",
          "The council aims to complete the review by March."
        ]
      },
      {
        "chunkId": "com1_ch_notified",
        "native": "notified",
        "learner": {
          "meaning": "Officially informed.",
          "useWhen": "When explaining how residents will receive formal communication.",
          "commonWrong": "You'll be told by post.",
          "fix": "You'll be notified by post.",
          "whyOdd": "'Told' is too casual for official communications; 'notified' is the formal bureaucratic term for receiving official updates from councils."
        },
        "examples": [
          "You'll be notified of the outcome in writing.",
          "All objectors will be notified when a decision is made."
        ]
      },
      {
        "chunkId": "com1_ch_helpful",
        "native": "helpful",
        "learner": {
          "meaning": "Useful; good to know.",
          "useWhen": "When acknowledging procedural information from officials politely.",
          "commonWrong": "That's good.",
          "fix": "That's helpful.",
          "whyOdd": "'Good' is too vague; 'helpful' specifically acknowledges that the information is useful for planning next steps, which shows engagement and professionalism."
        },
        "examples": [
          "That's very helpful, thank you.",
          "Those timelines are helpful to know."
        ]
      },
      {
        "chunkId": "com1_ch_appreciate",
        "native": "appreciate",
        "learner": {
          "meaning": "Value or be grateful for.",
          "useWhen": "When closing respectfully and acknowledging the council's process.",
          "commonWrong": "We thank the council taking our concerns seriously.",
          "fix": "We appreciate the council taking our concerns seriously.",
          "whyOdd": "'Thank' needs a preposition ('thank you for'); 'appreciate' works directly with the object and sounds more formal and professional in closing statements."
        },
        "examples": [
          "We appreciate your time today.",
          "I appreciate the council's careful consideration."
        ]
      },
      {
        "chunkId": "com1_ch_fair_point",
        "native": "point",
        "learner": {
          "meaning": "A valid argument or relevant observation.",
          "useWhen": "When a council acknowledges a concern you've raised is reasonable or well-founded.",
          "commonWrong": "That's a fair concern.",
          "fix": "That's a fair point.",
          "whyOdd": "'Concern' is your worry; 'point' refers to your argument itself. 'That's a fair point' is the diplomatic way to validate someone's reasoning in formal settings."
        },
        "examples": [
          "I take that point.",
          "That's a very fair point indeed."
        ]
      }
    ],
    "blanksInOrder": [
      {
        "blankId": "com1_b1",
        "chunkId": "com1_ch_outline"
      },
      {
        "blankId": "com1_b2",
        "chunkId": "com1_ch_opportunity"
      },
      {
        "blankId": "com1_b3",
        "chunkId": "com1_ch_extremely"
      },
      {
        "blankId": "com1_b4",
        "chunkId": "com1_ch_organised"
      },
      {
        "blankId": "com1_b5",
        "chunkId": "com1_ch_impressive"
      },
      {
        "blankId": "com1_b6",
        "chunkId": "com1_ch_feedback"
      },
      {
        "blankId": "com1_b7",
        "chunkId": "com1_ch_this_development"
      },
      {
        "blankId": "com1_b8",
        "chunkId": "com1_ch_scale"
      },
      {
        "blankId": "com1_b9",
        "chunkId": "com1_ch_traffic"
      },
      {
        "blankId": "com1_b10",
        "chunkId": "com1_ch_cope_with"
      },
      {
        "blankId": "com1_b11",
        "chunkId": "com1_ch_point"
      },
      {
        "blankId": "com1_b12",
        "chunkId": "com1_ch_increase"
      },
      {
        "blankId": "com1_b13",
        "chunkId": "com1_ch_handle"
      },
      {
        "blankId": "com1_b14",
        "chunkId": "com1_ch_disruption"
      },
      {
        "blankId": "com1_b15",
        "chunkId": "com1_ch_drag_on"
      },
      {
        "blankId": "com1_b16",
        "chunkId": "com1_ch_fair_point"
      },
      {
        "blankId": "com1_b17",
        "chunkId": "com1_ch_raised"
      },
      {
        "blankId": "com1_b18",
        "chunkId": "com1_ch_submitted"
      },
      {
        "blankId": "com1_b19",
        "chunkId": "com1_ch_dismissed"
      },
      {
        "blankId": "com1_b20",
        "chunkId": "com1_ch_willing"
      },
      {
        "blankId": "com1_b21",
        "chunkId": "com1_ch_offered"
      },
      {
        "blankId": "com1_b22",
        "chunkId": "com1_ch_address"
      },
      {
        "blankId": "com1_b23",
        "chunkId": "com1_ch_frustration"
      },
      {
        "blankId": "com1_b24",
        "chunkId": "com1_ch_reject"
      },
      {
        "blankId": "com1_b25",
        "chunkId": "com1_ch_outright"
      },
      {
        "blankId": "com1_b26",
        "chunkId": "com1_ch_send"
      },
      {
        "blankId": "com1_b27",
        "chunkId": "com1_ch_revisions"
      },
      {
        "blankId": "com1_b28",
        "chunkId": "com1_ch_objection"
      },
      {
        "blankId": "com1_b29",
        "chunkId": "com1_ch_weigh"
      },
      {
        "blankId": "com1_b30",
        "chunkId": "com1_ch_clarify"
      },
      {
        "blankId": "com1_b31",
        "chunkId": "com1_ch_aim"
      },
      {
        "blankId": "com1_b32",
        "chunkId": "com1_ch_notified"
      },
      {
        "blankId": "com1_b33",
        "chunkId": "com1_ch_helpful"
      },
      {
        "blankId": "com1_b34",
        "chunkId": "com1_ch_appreciate"
      }
    ],
    "patternSummary": {
      "categoryBreakdown": [
        {
          "category": "Openers",
    "customLabel": "Formal opening and establishing credibility",
          "count": 5,
          "exampleChunkIds": [
            "com1_ch_outline",
            "com1_ch_opportunity",
            "com1_ch_extremely",
            "com1_ch_organised",
            "com1_ch_impressive"
          ],
          "insight": "You learn how to open a formal objection professionally: thank the council for the chance to speak (opportunity), structure your presentation (outline), calibrate emotional language to formal register (extremely), and provide tangible evidence of support (organised a petition). When the chair acknowledges this with 'impressive', you understand they recognise your credibility as a representative, not just a complainant."
        },
        {
          "category": "Repair",
    "customLabel": "Council procedural and acknowledgment language",
          "count": 5,
          "exampleChunkIds": [
            "com1_ch_feedback",
            "com1_ch_point",
            "com1_ch_weigh",
            "com1_ch_aim",
            "com1_ch_notified"
          ],
          "insight": "You practise recognising how councils signal they are listening and following due process. Terms like 'feedback', 'point' (used twice in different contexts), 'weigh', 'aim', and 'notified' are bureaucratic phrases that show impartiality and official procedure. Understanding when councils are genuinely considering versus just being polite helps you calibrate follow-up actions and manage expectations about timelines."
        },
        {
          "category": "Idioms",
    "customLabel": "Planning impact vocabulary",
          "count": 8,
          "exampleChunkIds": [
            "com1_ch_this_development",
            "com1_ch_scale",
            "com1_ch_traffic",
            "com1_ch_cope_with",
            "com1_ch_increase",
            "com1_ch_handle",
            "com1_ch_disruption",
            "com1_ch_drag_on"
          ],
          "insight": "You learn precise planning terminology for articulating harm: name the proposal clearly (this development), use formal size language (scale not size), identify specific impacts (traffic, disruption), explain infrastructure failure (cope with, handle), and quantify changes (increase by 40%). 'Drag on' adds emotional weight to factual construction timelines, showing impact on quality of life, not just numbers."
        },
        {
          "category": "Disagreement",
    "customLabel": "Consultation and negotiation vocabulary",
          "count": 7,
          "exampleChunkIds": [
            "com1_ch_raised",
            "com1_ch_submitted",
            "com1_ch_dismissed",
            "com1_ch_willing",
            "com1_ch_offered",
            "com1_ch_address",
            "com1_ch_frustration"
          ],
          "insight": "You practise the language of failed negotiation: how to formally report that you followed proper process (raised concerns, submitted objections), explain why it failed (dismissed, not willing to compromise), evaluate inadequate concessions (offered minor changes that don't address core issues), and acknowledge feelings diplomatically (frustration, not anger). This shows councils you tried dialogue before asking for their intervention."
        },
        {
          "category": "Exit",
    "customLabel": "Formal requests and closing",
          "count": 8,
          "exampleChunkIds": [
            "com1_ch_reject",
            "com1_ch_outright",
            "com1_ch_send",
            "com1_ch_revisions",
            "com1_ch_objection",
            "com1_ch_clarify",
            "com1_ch_helpful",
            "com1_ch_appreciate"
          ],
          "insight": "You learn how to make clear asks and close professionally: request full refusal (reject outright), offer alternative outcomes (send back for substantial revisions), confirm your objection is on record, ask about process (clarify timelines), and acknowledge the council's role respectfully (helpful, appreciate). This balances firmness with procedural courtesy, which maintains credibility even when making hard requests."
        }
      ],
      "overallInsight": "This expanded package trains you to handle a full UK council meeting from opening to close. You learn how to establish credibility through evidence and formal framing, use precise planning vocabulary to articulate quantified impacts, recognise and respond to council procedural language, report failed negotiation attempts diplomatically, and make clear formal requests while maintaining professional courtesy. The 34 chunks cover the complete arc: opening with thanks and structure, presenting technical objections with data, engaging with council acknowledgments, explaining why developer dialogue failed, requesting specific outcomes (outright rejection or substantial revisions), confirming your objection is recorded, asking about next steps, and closing with appreciation. This is Band 7.5-9 civic discourse—knowing when 'complaint' lacks legal weight but 'objection' gets officially recorded, when 'look at viewpoints' sounds uncommitted but 'weigh viewpoints' signals due process, or when 'size' is casual but 'scale' is professional planning language. After this scenario, learners can participate confidently in planning meetings, understand bureaucratic signals, navigate consultation processes, and use language that gets taken seriously rather than dismissed.",
      "keyPatterns": [
        {
          "pattern": "Credibility through evidence and formality",
          "explanation": "Opening strong at a council meeting requires you to signal organisation, not just emotion. Thank them for the \"opportunity\" (not just \"chance\"), \"outline\" your points (structured, not rambling), say residents are \"extremely\" concerned (calibrated formality, not \"very much\"), and show you \"organised\" a petition with numbers. When the chair responds with \"impressive community engagement,\" you know your framing worked—you are being treated as a legitimate representative. This pattern establishes you are following civic procedure and deserve to be heard.",
          "chunkIds": [
            "com1_ch_outline",
            "com1_ch_opportunity",
            "com1_ch_extremely",
            "com1_ch_organised",
            "com1_ch_impressive"
          ]
        },
        {
          "pattern": "Bureaucratic signals of impartial process",
          "explanation": "Councils use specific neutral language to show they are recording and considering without committing. \"We take public feedback seriously,\" \"I see your point\" (repeated in two contexts), \"we'll weigh all viewpoints,\" and \"we aim to decide within six weeks\" are bureaucratic phrases signaling impartiality and due process. \"Notified by post\" confirms official communication. Recognising these patterns helps you distinguish genuine consideration from polite dismissal, which informs whether to escalate further or trust the process. This is essential civic literacy.",
          "chunkIds": [
            "com1_ch_feedback",
            "com1_ch_point",
            "com1_ch_weigh",
            "com1_ch_aim",
            "com1_ch_notified"
          ]
        },
        {
          "pattern": "Quantified technical objection with impact language",
          "explanation": "Planning objections are strongest when combining precise measurement with impact vocabulary. Name the proposal clearly (this development), use professional size language (scale, not size), identify specific harms (traffic impact, disruption during construction), quantify them (increase by 40%), explain infrastructure failure (can't cope with, can't handle), and add quality-of-life burden (drag on for 18 months). Together these chunks turn vague concerns into evidence-based objections that councils must formally address. This is the difference between \"we don't like it\" and \"here's why it fails planning standards.\"",
          "chunkIds": [
            "com1_ch_this_development",
            "com1_ch_scale",
            "com1_ch_traffic",
            "com1_ch_cope_with",
            "com1_ch_increase",
            "com1_ch_handle",
            "com1_ch_disruption",
            "com1_ch_drag_on"
          ]
        },
        {
          "pattern": "Diplomatic reporting of failed negotiation",
          "explanation": "Before asking councils to block a development, you must show you tried dialogue. The pattern: formally report that you \"raised\" and \"submitted\" concerns during consultation, explain the developer \"dismissed\" them and is \"not willing\" to compromise on core issues, note they only \"offered\" minor changes that don't \"address\" the real problems, and acknowledge your \"frustration\" (not anger) with the process. This sequence proves you followed proper procedure and exhausted negotiation, which gives councils justification to intervene. It frames refusal as the developer's choice, not your unreasonableness.",
          "chunkIds": [
            "com1_ch_raised",
            "com1_ch_submitted",
            "com1_ch_dismissed",
            "com1_ch_willing",
            "com1_ch_offered",
            "com1_ch_address",
            "com1_ch_frustration"
          ]
        },
        {
          "pattern": "Formal ask with procedural courtesy",
          "explanation": "Making hard requests requires balancing firmness with respect. Ask to \"reject the proposal outright\" (clear, unambiguous), offer an alternative (\"send it back for substantial revisions\"), confirm your \"objection\" is on record (legal weight), \"clarify\" timelines (shows engagement with process), acknowledge information as \"helpful\" (validates their role), and close by saying you \"appreciate\" them taking concerns seriously. This pattern shows you understand adversarial procedure—you can ask for full refusal while maintaining the courtesy that keeps you credible, not dismissed as unreasonable.",
          "chunkIds": [
            "com1_ch_reject",
            "com1_ch_outright",
            "com1_ch_send",
            "com1_ch_revisions",
            "com1_ch_objection",
            "com1_ch_clarify",
            "com1_ch_helpful",
            "com1_ch_appreciate"
          ]
        }
      ]
    },
    "activeRecall": [
      {
        "id": "com1_ar_1",
        "prompt": "Choose the chunk used to present your concerns in a structured way at the start of a council meeting.",
        "targetChunkIds": [
          "com1_ch_outline"
        ]
      },
      {
        "id": "com1_ar_2",
        "prompt": "Fill the gap: 'Thank you for the ________.'",
        "targetChunkIds": [
          "com1_ch_opportunity"
        ]
      },
      {
        "id": "com1_ar_3",
        "prompt": "Fill the gap: 'We've ________ a petition with 387 signatures objecting to the proposal.'",
        "targetChunkIds": [
          "com1_ch_organised"
        ]
      },
      {
        "id": "com1_ar_4",
        "prompt": "Fill the gap: 'First, ________ would fundamentally alter our neighbourhood character.'",
        "targetChunkIds": [
          "com1_ch_this_development"
        ]
      },
      {
        "id": "com1_ar_5",
        "prompt": "Choose the chunk that means the physical size or density in planning contexts.",
        "targetChunkIds": [
          "com1_ch_scale"
        ]
      },
      {
        "id": "com1_ar_6",
        "prompt": "Fill the gap: 'The development will ________ traffic by an estimated 40%.'",
        "targetChunkIds": [
          "com1_ch_increase"
        ]
      },
      {
        "id": "com1_ar_7",
        "prompt": "Fill the gap: 'We ________ our objections in writing.'",
        "targetChunkIds": [
          "com1_ch_submitted"
        ]
      },
      {
        "id": "com1_ar_8",
        "prompt": "Fill the gap: 'They're not ________ to compromise on scale.'",
        "targetChunkIds": [
          "com1_ch_willing"
        ]
      },
      {
        "id": "com1_ar_9",
        "prompt": "Fill the gap: 'That doesn't ________ our core concerns.'",
        "targetChunkIds": [
          "com1_ch_address"
        ]
      },
      {
        "id": "com1_ar_10",
        "prompt": "Fill the gap: 'We'd be grateful if the council would ________ the proposal ________.'",
        "targetChunkIds": [
          "com1_ch_reject",
          "com1_ch_outright"
        ]
      },
      {
        "id": "com1_ar_11",
        "prompt": "Choose the chunk that means the council will carefully consider all perspectives.",
        "targetChunkIds": [
          "com1_ch_weigh"
        ]
      },
      {
        "id": "com1_ar_12",
        "prompt": "Fill the gap: 'We ________ the council taking our concerns seriously.'",
        "targetChunkIds": [
          "com1_ch_appreciate"
        ]
      }
    ]
  },
  {
    "id": "workplace-1-performance-review",
    "category": "Workplace",
    "topic": "Annual Performance Review - Career Development Discussion",
    "context": "Meeting with line manager for annual appraisal, discussing performance, development, and career aspirations.",
    "characters": [
      {
        "name": "Margaret",
        "description": "Senior manager",
        "avatarUrl": "/avatars/manager.png"
      },
      {
        "name": "You",
        "description": "Employee undergoing review"
      }
    ],
    "dialogue": [
      {
        "speaker": "Margaret",
        "text": "Right, let's ________ your performance over the past year."
      },
      {
        "speaker": "You",
        "text": "I've endeavoured to ________ measurable results on the Taylor account."
      },
      {
        "speaker": "Margaret",
        "text": "Absolutely. The client feedback has been ________ . You've clearly made considerable progress."
      },
      {
        "speaker": "You",
        "text": "Thank you. I've had to ________ my approach to account management, which was quite demanding."
      },
      {
        "speaker": "Margaret",
        "text": "That adaptability is precisely what we ________ here. However, I'd like to flag one area for development."
      },
      {
        "speaker": "You",
        "text": "Right, I'm ________ to hear that. What concerns you?"
      },
      {
        "speaker": "Margaret",
        "text": "Delegation. You tend to ________ too much responsibility rather than ________ your team."
      },
      {
        "speaker": "You",
        "text": "That's ________ feedback. I'll endeavour to be more conscious of ________ junior colleagues."
      },
      {
        "speaker": "Margaret",
        "text": "Good. Looking ahead, where would you like to ________ your career?"
      },
      {
        "speaker": "You",
        "text": "I'm keen on ________ my expertise in project leadership and possibly moving into a team lead position."
      },
      {
        "speaker": "Margaret",
        "text": "We'd be delighted to ________ that progression. I'll ________ some management training for you."
      },
      {
        "speaker": "You",
        "text": "That's brilliant. Thank you for the opportunity."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "review",
        "alternatives": [
          "assess",
          "evaluate",
          "discuss"
        ]
      },
      {
        "index": 2,
        "answer": "deliver",
        "alternatives": [
          "achieve",
          "produce",
          "generate"
        ]
      },
      {
        "index": 3,
        "answer": "exemplary",
        "alternatives": [
          "excellent",
          "outstanding",
          "superb"
        ]
      },
      {
        "index": 4,
        "answer": "refine",
        "alternatives": [
          "adjust",
          "modify",
          "revise"
        ]
      },
      {
        "index": 5,
        "answer": "value",
        "alternatives": [
          "appreciate",
          "need",
          "require"
        ]
      },
      {
        "index": 6,
        "answer": "keen",
        "alternatives": [
          "interested",
          "open",
          "glad"
        ]
      },
      {
        "index": 7,
        "answer": "shoulder",
        "alternatives": [
          "take on",
          "carry",
          "assume"
        ]
      },
      {
        "index": 8,
        "answer": "empower",
        "alternatives": [
          "enable",
          "support",
          "develop"
        ]
      },
      {
        "index": 9,
        "answer": "fair",
        "alternatives": [
          "valid",
          "constructive",
          "helpful"
        ]
      },
      {
        "index": 10,
        "answer": "mentoring",
        "alternatives": [
          "supporting",
          "coaching",
          "developing"
        ]
      },
      {
        "index": 11,
        "answer": "take",
        "alternatives": [
          "pursue",
          "chart",
          "map"
        ]
      },
      {
        "index": 12,
        "answer": "consolidating",
        "alternatives": [
          "deepening",
          "strengthening",
          "advancing"
        ]
      },
      {
        "index": 13,
        "answer": "facilitate",
        "alternatives": [
          "support",
          "enable",
          "arrange"
        ]
      },
      {
        "index": 14,
        "answer": "arrange",
        "alternatives": [
          "organise",
          "book",
          "schedule"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "endeavoured to deliver",
        "insight": "Formal British register uses \"endeavour\" (s spelling) for professional effort. Shows conscientiousness and formal tone (Band 8)."
      },
      {
        "index": 5,
        "phrase": "keen to hear",
        "insight": "Native idiom signaling receptiveness to feedback. More sophisticated than \"interested to hear\" in professional context."
      },
      {
        "index": 8,
        "phrase": "fair feedback",
        "insight": "British understatement: accepting critical feedback as \"fair\" shows professional maturity and psychological safety awareness."
      },
      {
        "index": 10,
        "phrase": "keen on deepening",
        "insight": "Repeated use of \"keen\" shows authenticity. Different from \"keen to hear\" - demonstrates consistent personal motivation (Band 8-9)."
      }
    ]
  },
  {
    "id": "service-1-estate-agent-viewing",
    "category": "Service/Logistics",
    "topic": "Estate Agent Property Viewing - Negotiating Terms",
    "context": "Viewing a residential property with estate agent, discussing price, condition, and moving forward with offer.",
    "characters": [
      {
        "name": "Victoria",
        "description": "Estate agent",
        "avatarUrl": "/avatars/estate-agent.png"
      },
      {
        "name": "You",
        "description": "Prospective buyer"
      }
    ],
    "dialogue": [
      {
        "speaker": "Victoria",
        "text": "Lovely to have you here. This property is really quite ________ , isn't it?"
      },
      {
        "speaker": "You",
        "text": "It certainly has ________ . However, I'm a bit concerned about the survey findings."
      },
      {
        "speaker": "Victoria",
        "text": "Those issues are largely cosmetic. The structure is absolutely ________ ."
      },
      {
        "speaker": "You",
        "text": "I understand, but the damp issue is rather ________ . That'll require specialist treatment."
      },
      {
        "speaker": "Victoria",
        "text": "Fair point. The vendors would be ________ to negotiate on price to reflect remedial costs."
      },
      {
        "speaker": "You",
        "text": "I appreciate that. Could they ________ a discount of around £25,000?"
      },
      {
        "speaker": "Victoria",
        "text": "That's quite ________ . The asking price is already very competitive. Let me ________ with the vendors."
      },
      {
        "speaker": "You",
        "text": "When do you reckon you'll ________ from them?"
      },
      {
        "speaker": "Victoria",
        "text": "By tomorrow evening, I should think. In the meantime, would you ________ putting an offer in writing?"
      },
      {
        "speaker": "You",
        "text": "Yes, I'm prepared to ________ an offer subject to a satisfactory final survey."
      },
      {
        "speaker": "Victoria",
        "text": "Excellent. We'll ________ the paperwork today and submit by close of business."
      },
      {
        "speaker": "You",
        "text": "Splendid. What's the timeline if the vendors ________ ?"
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "charming",
        "alternatives": [
          "attractive",
          "lovely",
          "delightful"
        ]
      },
      {
        "index": 2,
        "answer": "potential",
        "alternatives": [
          "promise",
          "charm",
          "appeal"
        ]
      },
      {
        "index": 3,
        "answer": "sound",
        "alternatives": [
          "solid",
          "secure",
          "intact"
        ]
      },
      {
        "index": 4,
        "answer": "problematic",
        "alternatives": [
          "troublesome",
          "concerning",
          "serious"
        ]
      },
      {
        "index": 5,
        "answer": "willing",
        "alternatives": [
          "open",
          "amenable",
          "prepared"
        ]
      },
      {
        "index": 6,
        "answer": "entertain",
        "alternatives": [
          "consider",
          "accept",
          "allow"
        ]
      },
      {
        "index": 7,
        "answer": "steep",
        "alternatives": [
          "substantial",
          "considerable",
          "ambitious"
        ]
      },
      {
        "index": 8,
        "answer": "run this past",
        "alternatives": [
          "discuss with",
          "put to",
          "speak to"
        ]
      },
      {
        "index": 9,
        "answer": "hear",
        "alternatives": [
          "get back",
          "find out",
          "learn"
        ]
      },
      {
        "index": 10,
        "answer": "consider",
        "alternatives": [
          "think of",
          "be interested in",
          "mind"
        ]
      },
      {
        "index": 11,
        "answer": "lodge",
        "alternatives": [
          "submit",
          "put forward",
          "make"
        ]
      },
      {
        "index": 12,
        "answer": "prepare",
        "alternatives": [
          "draw up",
          "arrange",
          "process"
        ]
      },
      {
        "index": 13,
        "answer": "accept",
        "alternatives": [
          "agree",
          "take",
          "proceed with"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 1,
        "phrase": "charming",
        "insight": "Sophisticated property vocabulary. Preferred by British estate agents over \"nice\" or \"pretty\" for premium properties (Band 8)."
      },
      {
        "index": 4,
        "phrase": "rather problematic",
        "insight": "British understatement with \"rather\". Softens serious issue diplomatically whilst remaining clear. Essential register for negotiations."
      },
      {
        "index": 7,
        "phrase": "quite steep",
        "insight": "Euphemistic British phrasing for \"expensive\" or \"unreasonable\". Shows negotiation expertise through strategic word choice (Band 8)."
      },
      {
        "index": 11,
        "phrase": "lodge an offer",
        "insight": "Formal property transaction terminology. \"Make an offer\" is too casual, \"submit\" too bureaucratic. Demonstrates property market familiarity (Band 8-9)."
      }
    ]
  },
  {
    "id": "service-35-landlord-repairs",
    "category": "Service/Logistics",
    "topic": "Negotiating Home Repairs with Your Landlord",
    "context": "You've noticed several issues in your rented flat that need immediate attention. You're calling your landlord to report problems and negotiate repair timelines.",
    "characters": [
      {
        "name": "Landlord",
        "description": "Property owner, professional but sometimes resistant."
      },
      {
        "name": "You",
        "description": "Tenant, firm but polite."
      }
    ],
    "dialogue": [
      {
        "speaker": "Landlord",
        "text": "Hello? Who's calling?"
      },
      {
        "speaker": "You",
        "text": "Hi, it's ________ from [property address]. I'm sorry to ________ you, but I have some concerns about the property that I wanted to discuss."
      },
      {
        "speaker": "Landlord",
        "text": "Oh, hello. What seems to be the ________?"
      },
      {
        "speaker": "You",
        "text": "Well, there are actually a ________ of issues that have come up recently. The most urgent is that there's water ________ from the ceiling in the bedroom. It appears to have been going on for a while."
      },
      {
        "speaker": "Landlord",
        "text": "A water leak? That's not good. How ________ is it?"
      },
      {
        "speaker": "You",
        "text": "It's fairly ________. The ceiling is starting to show ________, and I'm concerned about potential ________ damage."
      },
      {
        "speaker": "Landlord",
        "text": "I see. What else?"
      },
      {
        "speaker": "You",
        "text": "Additionally, the heating system isn't working ________, so it's quite cold in the flat. And the bathroom window has a ________ in it, which is affecting my ________."
      },
      {
        "speaker": "Landlord",
        "text": "A crack in the window? That's ________ to deal with. Look, these things take ________."
      },
      {
        "speaker": "You",
        "text": "I appreciate that, but as you know, you're ________ to ensure the property is in a ________ condition. The water leak is a health and safety ________."
      },
      {
        "speaker": "Landlord",
        "text": "Yes, yes, I understand. But I need to ________ contractors. These things don't happen ________."
      },
      {
        "speaker": "You",
        "text": "I completely ________ that, but I'd like to propose a ________ for getting these fixed. Could we arrange for someone to look at the water leak within the next ________ days?"
      },
      {
        "speaker": "Landlord",
        "text": "That might be difficult. These things are ________. I'll need to ________ my handyman and see when he's ________."
      },
      {
        "speaker": "You",
        "text": "I'd really ________ it if you could prioritize this. It's affecting my ________ to enjoy the property. Would ________ days be more realistic?"
      },
      {
        "speaker": "Landlord",
        "text": "Let me ________ into it and get back to you. I can probably arrange something in ________ weeks."
      },
      {
        "speaker": "You",
        "text": "That's a bit longer than I was ________, but I appreciate your ________ to resolve this. Could you at least confirm by ________ of this week?"
      },
      {
        "speaker": "Landlord",
        "text": "Yes, I can ________ that. I'll speak to my contractor and confirm by Friday."
      },
      {
        "speaker": "You",
        "text": "Thank you. And regarding the other ________, the heating and the window—can we ________ a timeline for those as well?"
      },
      {
        "speaker": "Landlord",
        "text": "I'll look into those too. The window is probably ________ urgent than the heating, but I'll get back to you with a complete ________ of repairs needed."
      },
      {
        "speaker": "You",
        "text": "I'd be ________ if you could send me a ________ email with the proposed timeline for all three ________."
      },
      {
        "speaker": "Landlord",
        "text": "Of course. I'll do that by ________ of the week."
      },
      {
        "speaker": "You",
        "text": "Perfect. Thank you for being so ________ about this."
      }
    ],
    "answerVariations": [
      {
        "index": 1,
        "answer": "name",
        "alternatives": [
          "Sarah",
          "John",
          "introduction"
        ]
      },
      {
        "index": 2,
        "answer": "bother",
        "alternatives": [
          "trouble",
          "disturb",
          "interrupt"
        ]
      },
      {
        "index": 3,
        "answer": "problem",
        "alternatives": [
          "issue",
          "matter",
          "concern"
        ]
      },
      {
        "index": 4,
        "answer": "couple",
        "alternatives": [
          "number",
          "few",
          "several"
        ]
      },
      {
        "index": 5,
        "answer": "leaking",
        "alternatives": [
          "dripping",
          "coming",
          "flowing"
        ]
      },
      {
        "index": 6,
        "answer": "bad",
        "alternatives": [
          "serious",
          "urgent",
          "critical"
        ]
      },
      {
        "index": 7,
        "answer": "serious",
        "alternatives": [
          "urgent",
          "critical",
          "concerning"
        ]
      },
      {
        "index": 8,
        "answer": "damage",
        "alternatives": [
          "marks",
          "stains",
          "discoloration"
        ]
      },
      {
        "index": 9,
        "answer": "water",
        "alternatives": [
          "structural",
          "mold",
          "mould"
        ]
      },
      {
        "index": 10,
        "answer": "properly",
        "alternatives": [
          "correctly",
          "well",
          "as it should"
        ]
      },
      {
        "index": 11,
        "answer": "crack",
        "alternatives": [
          "fracture",
          "break",
          "split"
        ]
      },
      {
        "index": 12,
        "answer": "privacy",
        "alternatives": [
          "comfort",
          "security",
          "well-being"
        ]
      },
      {
        "index": 13,
        "answer": "difficult",
        "alternatives": [
          "challenging",
          "complicated",
          "tricky"
        ]
      },
      {
        "index": 14,
        "answer": "time",
        "alternatives": [
          "patience",
          "effort",
          "coordination"
        ]
      },
      {
        "index": 15,
        "answer": "legally obligated",
        "alternatives": [
          "responsible",
          "required",
          "obligated"
        ]
      },
      {
        "index": 16,
        "answer": "habitable",
        "alternatives": [
          "good",
          "safe",
          "proper"
        ]
      },
      {
        "index": 17,
        "answer": "issue",
        "alternatives": [
          "concern",
          "problem",
          "hazard"
        ]
      },
      {
        "index": 18,
        "answer": "contact",
        "alternatives": [
          "call",
          "arrange",
          "find"
        ]
      },
      {
        "index": 19,
        "answer": "overnight",
        "alternatives": [
          "instantly",
          "quickly",
          "at once"
        ]
      },
      {
        "index": 20,
        "answer": "understand",
        "alternatives": [
          "appreciate",
          "get",
          "recognize"
        ]
      },
      {
        "index": 21,
        "answer": "timeline",
        "alternatives": [
          "schedule",
          "plan",
          "timetable"
        ]
      },
      {
        "index": 22,
        "answer": "7",
        "alternatives": [
          "seven",
          "10",
          "14"
        ]
      },
      {
        "index": 23,
        "answer": "complicated",
        "alternatives": [
          "complex",
          "intricate",
          "tricky"
        ]
      },
      {
        "index": 24,
        "answer": "contact",
        "alternatives": [
          "speak to",
          "call",
          "ring"
        ]
      },
      {
        "index": 25,
        "answer": "available",
        "alternatives": [
          "free",
          "around",
          "accessible"
        ]
      },
      {
        "index": 26,
        "answer": "appreciate",
        "alternatives": [
          "value",
          "prefer",
          "need"
        ]
      },
      {
        "index": 27,
        "answer": "ability",
        "alternatives": [
          "capacity",
          "opportunity",
          "chance"
        ]
      },
      {
        "index": 28,
        "answer": "10",
        "alternatives": [
          "14",
          "two weeks",
          "21"
        ]
      },
      {
        "index": 29,
        "answer": "look into",
        "alternatives": [
          "check",
          "investigate",
          "explore"
        ]
      },
      {
        "index": 30,
        "answer": "2-3",
        "alternatives": [
          "one",
          "two",
          "three"
        ]
      },
      {
        "index": 31,
        "answer": "hoping",
        "alternatives": [
          "expecting",
          "anticipating",
          "wanting"
        ]
      },
      {
        "index": 32,
        "answer": "commitment",
        "alternatives": [
          "willingness",
          "effort",
          "cooperation"
        ]
      },
      {
        "index": 33,
        "answer": "end",
        "alternatives": [
          "close",
          "finish",
          "weekend"
        ]
      },
      {
        "index": 34,
        "answer": "confirm",
        "alternatives": [
          "promise",
          "guarantee",
          "assure"
        ]
      },
      {
        "index": 35,
        "answer": "issues",
        "alternatives": [
          "matters",
          "things",
          "concerns"
        ]
      },
      {
        "index": 36,
        "answer": "establish",
        "alternatives": [
          "set",
          "arrange",
          "agree on"
        ]
      },
      {
        "index": 37,
        "answer": "less",
        "alternatives": [
          "not as",
          "fewer",
          "lower"
        ]
      },
      {
        "index": 38,
        "answer": "assessment",
        "alternatives": [
          "list",
          "schedule",
          "inventory"
        ]
      },
      {
        "index": 39,
        "answer": "grateful",
        "alternatives": [
          "delighted",
          "appreciative",
          "pleased"
        ]
      },
      {
        "index": 40,
        "answer": "written",
        "alternatives": [
          "formal",
          "detailed",
          "summary"
        ]
      },
      {
        "index": 41,
        "answer": "issues",
        "alternatives": [
          "problems",
          "matters",
          "concerns"
        ]
      },
      {
        "index": 42,
        "answer": "end",
        "alternatives": [
          "close",
          "finish",
          "weekend"
        ]
      },
      {
        "index": 43,
        "answer": "understanding",
        "alternatives": [
          "cooperative",
          "helpful",
          "receptive"
        ]
      }
    ],
    "deepDive": [
      {
        "index": 15,
        "phrase": "legally obligated",
        "insight": "Formal term used in landlord-tenant disputes. Signals knowledge of rights and responsibilities. Shows confident, assertive communication at B2-C1 level."
      },
      {
        "index": 16,
        "phrase": "habitable condition",
        "insight": "Legal/formal property terminology. More sophisticated than \"good condition\". Shows tenant awareness of legal standards and rights."
      },
      {
        "index": 17,
        "phrase": "health and safety issue",
        "insight": "Bureaucratic phrasing that carries weight in property disputes. Signals seriousness and potential legal implications. Shows strategic communication."
      },
      {
        "index": 21,
        "phrase": "propose a timeline",
        "insight": "Professional negotiation language. Shows initiative and collaboration rather than complaint. Moves from problem-reporting to solution-building."
      },
      {
        "index": 32,
        "phrase": "appreciate your commitment",
        "insight": "Diplomatic phrasing that acknowledges goodwill. Maintains positive relationship while remaining firm on expectations."
      },
      {
        "index": 36,
        "phrase": "establish a timeline",
        "insight": "More formal than \"set a date\". Demonstrates professional communication in formal contexts. Essential for B2+ property negotiations."
      }
    ],
    "chunkFeedback": [
      {
        "chunkId": "service-35-landlord-repairs-b2",
        "blankIndex": 2,
        "chunk": "bother",
        "category": "Repair",
        "coreFunction": "Softens interruption by expressing concern; maintains rapport before raising issues.",
        "situations": [
          {
            "context": "Interrupting someone important",
            "example": "I'm sorry to bother you, but I have concerns to discuss."
          },
          {
            "context": "Making a request",
            "example": "Sorry to bother you, but when can you call back?"
          },
          {
            "context": "Needing immediate attention",
            "example": "I hate to bother you, but it's quite urgent."
          }
        ],
        "nativeUsageNotes": [
          "Standard politeness marker for interruptions",
          "Shows respect and awareness of other person's time",
          "Makes requests feel less demanding"
        ],
        "nonNativeContrast": [
          {
            "nonNative": "I need to talk to you.",
            "native": "I'm sorry to bother you, but I need to discuss something.",
            "explanation": "Native version is considerate; direct approach can sound rude."
          },
          {
            "nonNative": "You must call me immediately.",
            "native": "Sorry to bother you, but could you call me when you're free?",
            "explanation": "Native version is respectful; command form is impolite."
          }
        ]
      },
      {
        "blankIndex": 21,
        "chunk": "propose a timeline",
        "category": "Disagreement",
        "coreFunction": "Offers solution collaboratively; shifts from complaining to problem-solving mode.",
        "situations": [
          {
            "context": "Negotiating repairs",
            "example": "I'd like to propose a timeline for getting these fixed."
          },
          {
            "context": "Project discussion",
            "example": "Can we propose a timeline for the next phase?"
          },
          {
            "context": "Service issues",
            "example": "I'd like to propose a timeline for resolution."
          }
        ],
        "nativeUsageNotes": [
          "Professional negotiation phrase",
          "Shows initiative and collaboration",
          "Moves conversation from problems to solutions"
        ],
        "nonNativeContrast": [
          {
            "nonNative": "You must fix this in 5 days.",
            "native": "Could we propose a timeline? Within 5 days would be ideal.",
            "explanation": "Native version is collaborative; demand form is confrontational."
          },
          {
            "nonNative": "When will you fix it?",
            "native": "I'd like to propose a timeline for this repair.",
            "explanation": "Native version is solution-focused; question alone sounds impatient."
          }
        ]
      },
      {
        "blankIndex": 32,
        "chunk": "appreciate",
        "category": "Softening",
        "coreFunction": "Acknowledges efforts warmly; maintains positive relationship while being firm.",
        "situations": [
          {
            "context": "After someone agrees to help",
            "example": "I appreciate your commitment to resolve this."
          },
          {
            "context": "Thanking for understanding",
            "example": "I appreciate that you understand the urgency."
          },
          {
            "context": "Valuing cooperation",
            "example": "I really appreciate your willingness to help."
          }
        ],
        "nativeUsageNotes": [
          "More genuine than \"thank you\" in diplomatic contexts",
          "Builds goodwill without losing firmness",
          "Shows emotional intelligence in difficult situations"
        ],
        "nonNativeContrast": [
          {
            "nonNative": "I thank you for helping.",
            "native": "I appreciate your commitment to this.",
            "explanation": "Native version is warmer and more sincere."
          },
          {
            "nonNative": "It is good that you will help.",
            "native": "I appreciate your willingness to help with this.",
            "explanation": "Native version is personal and grateful; non-native is impersonal."
          }
        ]
      }
    ]
  },
  {
    "id": "bbc-learning-6-dreams",
    "category": "Social",
    "topic": "Dreams & Life Regrets",
    "context": "A conversation between two friends about childhood dreams, life regrets, and following your aspirations. Features stories from Daisy (Riverside community) and Herman Zapp (world traveler).",
    "characters": [
      { "name": "Alex", "description": "Friend reflecting on life choices." },
      { "name": "Sam", "description": "Friend sharing stories and insights." }
    ],
    "dialogue": [
      { "speaker": "ALEX", "text": "Hey Sam! ________ you been up to these days? It feels like forever since we last caught up." },
      { "speaker": "SAM", "text": "I know, right? Honestly, work has been crazy. But I'm glad we're doing this. How about you? ________ going on?" },
      { "speaker": "ALEX", "text": "Yeah, ________ been pretty hectic actually. But you know what? ________ I was thinking about something the other day. When we were kids, we had all these big dreams, didn't we?" },
      { "speaker": "SAM", "text": "Oh, ________ your point. I remember! You wanted to be an astronaut, right?" },
      { "speaker": "ALEX", "text": "________ I did! And you were going to be a fireman, or something like that?" },
      { "speaker": "SAM", "text": "Ha! Yeah, I had big plans. But ________, as we grew up all that just kind of... disappeared. Between university, getting a job, paying bills... you know how it is." },
      { "speaker": "ALEX", "text": "I know. That's what I've been struggling with lately, actually. ________ how all those childhood dreams just get lost in the adult world. Jobs, money, family responsibilities... ________" },
      { "speaker": "SAM", "text": "Yeah, ________ is quite sad when you think about it. But not for everyone though. Actually, I read this interesting book recently about people's life regrets." },
      { "speaker": "ALEX", "text": "________ about that? Tell me more." },
      { "speaker": "SAM", "text": "Well, there's this Australian nurse called Bronnie Ware who interviewed terminally ill patients about their biggest regrets. And you know what the number one regret was?" },
      { "speaker": "ALEX", "text": "Hmm... was it something about money? Like, wishing they'd earned more?" },
      { "speaker": "SAM", "text": "No, actually. The biggest regret was not having the courage to ________ their dreams. Not following your passions – that's what people regret the most." },
      { "speaker": "ALEX", "text": "Wow. That's... actually quite powerful. ________ makes sense, I suppose. Following your dreams can be tough though, right?" },
      { "speaker": "SAM", "text": "True. But there are people who actually did it. Have you ever heard of the Zapp family? They're from Argentina." },
      { "speaker": "ALEX", "text": "No, can't say I have. ________ about them?" },
      { "speaker": "SAM", "text": "In 2000, this couple – Herman and Candelaria – bought an old car with barely any money and just drove off to travel the world." },
      { "speaker": "ALEX", "text": "________ you serious? How long did they travel for?" },
      { "speaker": "SAM", "text": "Twenty-two years! Can you imagine? And they took their three kids with them. Visited over a hundred countries, met countless people along the way. Just completely transformed their lives." },
      { "speaker": "ALEX", "text": "That's ________ incredible. How did they end up doing that? I mean, wasn't that quite... I don't know... outlandish?" },
      { "speaker": "SAM", "text": "Well, hermandina and Candelaria, they had this dream as childhood sweethearts, and they ________ the bullet. But here's the interesting part – what changed him wasn't about ________ the world anymore." },
      { "speaker": "ALEX", "text": "What do you mean?" },
      { "speaker": "SAM", "text": "He said something really beautiful. He was no longer the man who wanted to conquer the world – you know, like dominating it by force – but instead the world had ________ him. All these experiences, all the people he met... it made him much more humble." },
      { "speaker": "ALEX", "text": "That's actually really profound. So he learned something about himself through all that travelling?" },
      { "speaker": "SAM", "text": "Exactly. He said something like... he's a beautiful but tiny ________ of sand. An important piece, but still just one tiny part of something much bigger." },
      { "speaker": "ALEX", "text": "________, that actually puts things in perspective. ________ what I mean. Life isn't just about conquering everything or achieving huge goals. It's about ________ and experiences, isn't it?" },
      { "speaker": "SAM", "text": "Right! And there's another story about Daisy. She moved to this community in New Zealand called Riverside where everything is shared. All the money, all the resources." },
      { "speaker": "ALEX", "text": "________ on earth! They share ________ ? That seems pretty unusual to me." },
      { "speaker": "SAM", "text": "I know, right? Most people think it's quite strange. But Daisy believes in it because she thinks sharing resources can give people a real advantage in life." },
      { "speaker": "ALEX", "text": "________ that with that though? I mean, doesn't everyone just want to keep what they earn?" },
      { "speaker": "SAM", "text": "That's what she said – people outside ________ community struggle with the idea. They can't really accept it or even think about it properly. It's just ________ so different from how most of us are brought up." },
      { "speaker": "ALEX", "text": "Fair ________. It takes courage to live that way, I suppose." },
      { "speaker": "SAM", "text": "________ true. But the point is, both Daisy and Herman – they followed their dreams, and they ________ without regret. They didn't just talk about it; they actually did it." },
      { "speaker": "ALEX", "text": "You know, I'm starting to think ________ maybe I should assess my own life a bit. What am I actually doing with my time?" },
      { "speaker": "SAM", "text": "That's the spirit! It doesn't ________ you have to travel the world or join a commune. It's about being true to yourself, right?" },
      { "speaker": "ALEX", "text": "________ your point. ________ what would you do if you could do anything right now? Seriously, what ________ your dream?" },
      { "speaker": "SAM", "text": "Oh man, that's a tough question. I think I'd want to ________ more creative work. Maybe something with design or art. But I don't know... seems risky." },
      { "speaker": "ALEX", "text": "But isn't that what the book was saying? That people regret not taking risks?" },
      { "speaker": "SAM", "text": "True. ________ I guess you're right. By the way, you've really got me thinking about this stuff." },
      { "speaker": "ALEX", "text": "Good! ________ keep in touch more often and actually talk about these things, yeah? I don't want to get to the end of my life and regret not having these conversations with you." },
      { "speaker": "SAM", "text": "________ a deal. Let's make this a regular thing. And let's actually do something about our dreams instead of just talking." },
      { "speaker": "ALEX", "text": "I like that. Come on, let's grab another coffee and ________ it over properly. I want to hear more about this creative work idea of yours." },
      { "speaker": "SAM", "text": "Sounds good. ________ changing the subject, but do you remember that café we used to go to?" },
      { "speaker": "ALEX", "text": "Yeah, down by the river? Why?" },
      { "speaker": "SAM", "text": "They're ________ for people now. One of the owners is opening a new spot. I've been thinking maybe I should ________ if they need help with the design." },
      { "speaker": "ALEX", "text": "________ do it! ________ mentioned it – you should actually follow through." },
      { "speaker": "SAM", "text": "You know what? ________ the conversation, I think I will. Better now than regretting it later, right?" }
    ],
    "answerVariations": [
      {
          "index": 0,
          "answer": "What have you been up to",
          "alternatives": ["What have you been doing", "How have you been", "What's been going on"]
        },
      {
          "index": 1,
          "answer": "Not much",
          "alternatives": ["Nothing special", "Not really", "Same as usual"]
        },
      {
          "index": 2,
          "answer": "It's",
          "alternatives": ["Work's", "Things have", "There's"]
        },
      {
          "index": 3,
          "answer": "Actually",
          "alternatives": ["You know", "The thing is", "The truth is"]
        },
      {
          "index": 4,
          "answer": "I see",
          "alternatives": ["Yeah I remember", "That's right", "Oh yeah"]
        },
      {
          "index": 5,
          "answer": "Yeah",
          "alternatives": ["That's right", "Exactly", "Yep"]
        },
      {
          "index": 6,
          "answer": "a shame",
          "alternatives": ["sad", "a pity", "quite sad"]
        },
      {
          "index": 7,
          "answer": "sad",
          "alternatives": ["a shame", "quite sad", "unfortunate"]
        },
      {
          "index": 8,
          "answer": "all that stuff",
          "alternatives": ["you know how it is", "and so on", "it all adds up"]
        },
      {
          "index": 9,
          "answer": "it",
          "alternatives": ["that", "that's", "it's"]
        },
      {
          "index": 10,
          "answer": "Are",
          "alternatives": ["Is", "Were", "Would you be"]
        },
      {
          "index": 11,
          "answer": "It's quite",
          "alternatives": ["It's really", "That's so", "It's pretty"]
        },
      {
          "index": 12,
          "answer": "I understand",
          "alternatives": ["I know", "I get it", "Fair point"]
        },
      {
          "index": 13,
          "answer": "To be honest",
          "alternatives": ["Honestly", "In all honesty", "To tell you the truth"]
        },
      {
          "index": 14,
          "answer": "Tell me more",
          "alternatives": ["Go on", "I'm interested", "Say more"]
        },
      {
          "index": 15,
          "answer": "follow",
          "alternatives": ["pursue", "chase", "go for"]
        },
      {
          "index": 16,
          "answer": "That's actually quite powerful",
          "alternatives": ["That's really impactful", "That really hits home", "That's profound"]
        },
      {
          "index": 17,
          "answer": "Did you hear",
          "alternatives": ["Have you heard", "Do you know", "Are you aware"]
        },
      {
          "index": 18,
          "answer": "bit the",
          "alternatives": ["took the", "made the", "took their"]
        },
      {
          "index": 19,
          "answer": "were dreaming of",
          "alternatives": ["wanted to be doing", "wanted to do", "aimed to do"]
        },
      {
          "index": 20,
          "answer": "conquered",
          "alternatives": ["changed", "transformed", "overwhelmed"]
        },
      {
          "index": 21,
          "answer": "grain",
          "alternatives": ["speck", "piece", "drop"]
        },
      {
          "index": 22,
          "answer": "I see",
          "alternatives": ["I get it", "I understand", "That's true"]
        },
      {
          "index": 23,
          "answer": "it's about people",
          "alternatives": ["it involves people", "it's about experiences", "that's what matters"]
        },
      {
          "index": 24,
          "answer": "On earth",
          "alternatives": ["Seriously", "Really", "What"]
        },
      {
          "index": 25,
          "answer": "everything",
          "alternatives": ["anything", "all", "stuff"]
        },
      {
          "index": 26,
          "answer": "How do you struggle",
          "alternatives": ["How do you deal with", "Do you find", "Isn't it hard"]
        },
      {
          "index": 27,
          "answer": "the",
          "alternatives": ["that", "their", "this"]
        },
      {
          "index": 28,
          "answer": "seems",
          "alternatives": ["sounds", "feels", "appears"]
        },
      {
          "index": 29,
          "answer": "lived",
          "alternatives": ["went through", "experienced", "had"]
        },
      {
          "index": 30,
          "answer": "take",
          "alternatives": ["require", "demand", "need"]
        },
      {
          "index": 31,
          "answer": "What would you",
          "alternatives": ["What would be", "What would you do if", "What do you think you"]
        },
      {
          "index": 32,
          "answer": "was",
          "alternatives": ["is", "could be", "might be"]
        },
      {
          "index": 33,
          "answer": "do more",
          "alternatives": ["be more", "pursue", "engage in"]
        },
      {
          "index": 34,
          "answer": "seems risky",
          "alternatives": ["feels risky", "sounds risky", "might be risky"]
        },
      {
          "index": 35,
          "answer": "You're",
          "alternatives": ["You are", "That's", "I suppose you're"]
        },
      {
          "index": 36,
          "answer": "Let's",
          "alternatives": ["We should", "Let us", "How about we"]
        },
      {
          "index": 37,
          "answer": "through",
          "alternatives": ["about", "over", "out"]
        },
      {
          "index": 38,
          "answer": "You're",
          "alternatives": ["You are", "You've got the", "That's a"]
        },
      {
          "index": 39,
          "answer": "Do it",
          "alternatives": ["Go for it", "Try it", "Make the leap"]
        },
      {
          "index": 40,
          "answer": "You've got",
          "alternatives": ["That's", "We've got", "Here's"]
        },
      {
          "index": 41,
          "answer": "think about",
          "alternatives": ["go through", "discuss", "talk through"]
        },
      {
          "index": 42,
          "answer": "By the way",
          "alternatives": ["Sorry for", "I'm sorry", "One thing though"]
        },
      {
          "index": 43,
          "answer": "looking",
          "alternatives": ["hiring", "seeking", "advertising"]
        },
      {
          "index": 44,
          "answer": "ask",
          "alternatives": ["check", "inquire", "find out"]
        },
      {
          "index": 45,
          "answer": "Just",
          "alternatives": ["Go", "Come on", "Hey"]
        },
      {
          "index": 46,
          "answer": "You've",
          "alternatives": ["I've", "We've", "That"]
        }
    ]
  }
];
