import { ChunkFeedback, ChunkCategory, RoleplayScript } from '../staticData';

/**
 * Pre-defined feedback templates for common chunks
 * Maps chunks to their category and predefined feedback content
 */
interface FeedbackTemplate {
    chunk: string;
    category: ChunkCategory;
    coreFunction: string;
    situations: Array<{ context: string; example: string }>;
    nativeUsageNotes: string[];
    nonNativeContrast: Array<{ nonNative: string; native: string; explanation: string }>;
}

const FEEDBACK_TEMPLATES: FeedbackTemplate[] = [
    {
        chunk: 'meet',
        category: 'Openers',
        coreFunction: 'Acknowledges first meeting; creates warm, social foundation for conversation.',
        situations: [
            { context: 'Introduction at social event', example: 'Nice to meet you. I\'m Alex.' },
            { context: 'New colleague greeting', example: 'It\'s great to meet you. Welcome to the team.' },
            { context: 'Friend introducing contact', example: 'This is Sam. Sam, nice to meet you.' }
        ],
        nativeUsageNotes: [
            'Always "meet" not "know" for first meetings',
            'Use "too" in response: "Nice to meet you too"',
            'Works in formal and casual contexts equally'
        ],
        nonNativeContrast: [
            {
                nonNative: 'I\'m happy to meet you.',
                native: 'Nice to meet you.',
                explanation: 'Native version is shorter, warmer; avoids "happy" which signals awkwardness.'
            },
            {
                nonNative: 'I\'m pleased to encounter you.',
                native: 'Nice to meet you.',
                explanation: 'Native version is casual; formal version sounds unnatural and distant.'
            }
        ]
    },
    {
        chunk: 'to be honest',
        category: 'Softening',
        coreFunction: 'Signals truthfulness; softens critical opinion by acknowledging honesty upfront.',
        situations: [
            { context: 'Giving feedback', example: 'To be honest, I\'m not sure this approach will work.' },
            { context: 'Expressing disappointment', example: 'To be honest, I expected better results.' },
            { context: 'Adjusting expectations', example: 'To be honest, this might take longer than planned.' }
        ],
        nativeUsageNotes: [
            'Often appears mid-sentence, not at start',
            'Softens criticism without losing directness',
            'Shows contrast with previous assumption or statement'
        ],
        nonNativeContrast: [
            {
                nonNative: 'I strongly disagree with you.',
                native: 'To be honest, I\'m not sure I agree with that.',
                explanation: 'Native version uses softening to reduce confrontation; sounds collaborative.'
            },
            {
                nonNative: 'Your idea is bad.',
                native: 'To be honest, I\'m not confident that approach will work.',
                explanation: 'Native version is tactful, focuses on outcome not judgment of person.'
            }
        ]
    },
    {
        chunk: 'I see your point',
        category: 'Disagreement',
        coreFunction: 'Validates listener before disagreement; shows respect and prevents defensiveness.',
        situations: [
            { context: 'Polite disagreement in meeting', example: 'I see your point, but I think we should try a different approach.' },
            { context: 'Acknowledging valid concern', example: 'I see your point about the budget, though the timeline is tight.' },
            { context: 'Agreeing partially', example: 'I see your point about quality, and we also need speed here.' }
        ],
        nativeUsageNotes: [
            'Used before disagreement to show respect',
            'Prevents argument from becoming personal',
            'Signals "I understand you, but..." without saying it'
        ],
        nonNativeContrast: [
            {
                nonNative: 'I disagree.',
                native: 'I see your point, but I have a different view.',
                explanation: 'Native version acknowledges other perspective first; disagreement feels collaborative.'
            },
            {
                nonNative: 'That\'s wrong.',
                native: 'I see your point, and I understand the concern. Here\'s another angle.',
                explanation: 'Native version prevents conflict; shows emotional intelligence in disagreement.'
            }
        ]
    },
    {
        chunk: 'I appreciate that',
        category: 'Softening',
        coreFunction: 'Acknowledges effort or perspective; builds positive relationship before stating position.',
        situations: [
            { context: 'Thanking for feedback', example: 'I appreciate that you took time to review this.' },
            { context: 'Acknowledging effort', example: 'I appreciate that you\'re trying to help, but I need to handle this myself.' },
            { context: 'Valuing perspective', example: 'I appreciate that perspective. Let me think about it.' }
        ],
        nativeUsageNotes: [
            'Signals gratitude without over-commitment',
            'Creates bridge before gentle rejection',
            'More formal than "thanks" but still warm'
        ],
        nonNativeContrast: [
            {
                nonNative: 'I thank you for that.',
                native: 'I appreciate that.',
                explanation: 'Native version is more natural; grammatically complete form sounds translated.'
            },
            {
                nonNative: 'That is good, but I disagree.',
                native: 'I appreciate that perspective, but I see it differently.',
                explanation: 'Native version is respectful; direct "but disagree" can sound dismissive.'
            }
        ]
    },
    {
        chunk: 'keep track',
        category: 'Idioms',
        coreFunction: 'Means monitor progress or stay updated; practical collocation for management contexts.',
        situations: [
            { context: 'Project management', example: 'I\'ll keep track of the budget throughout the project.' },
            { context: 'Staying informed', example: 'It\'s hard to keep track of all the emails.' },
            { context: 'Monitoring progress', example: 'We need to keep track of deadlines carefully.' }
        ],
        nativeUsageNotes: [
            'Collocation: always "keep track of" (not "keep track on")',
            'Common in work/academic contexts',
            'Implies active monitoring, not passive awareness'
        ],
        nonNativeContrast: [
            {
                nonNative: 'It\'s very difficult to track it.',
                native: 'It\'s hard to keep track of it.',
                explanation: 'Native version uses natural collocation; direct translation sounds robotic.'
            },
            {
                nonNative: 'I will manage the follow-up.',
                native: 'I\'ll keep track of the next steps.',
                explanation: 'Native version is more specific and conversational.'
            }
        ]
    },
    {
        chunk: 'in two minds',
        category: 'Softening',
        coreFunction: 'Expresses mild uncertainty; signals deliberation without committing to either position.',
        situations: [
            { context: 'Making a decision', example: 'I\'m in two minds about whether to apply for that position.' },
            { context: 'Expressing hesitation', example: 'I\'m a bit in two minds about the proposal.' },
            { context: 'Showing genuine reflection', example: 'I was in two minds until you explained it.' }
        ],
        nativeUsageNotes: [
            'Idiom: exact form is "in two minds" (British English)',
            'Signals genuine uncertainty, not indecision',
            'Shows thoughtful deliberation'
        ],
        nonNativeContrast: [
            {
                nonNative: 'I am not sure which is better.',
                native: 'I\'m in two minds about which is better.',
                explanation: 'Native version shows active deliberation; non-native sounds passive.'
            },
            {
                nonNative: 'I have different opinions.',
                native: 'I\'m in two minds about it.',
                explanation: 'Native version uses precise idiom; non-native interpretation is unclear.'
            }
        ]
    },
    {
        chunk: 'bear in mind',
        category: 'Exit',
        coreFunction: 'Reminds listener of important context; softens directive by suggesting rather than commanding.',
        situations: [
            { context: 'Warning before decision', example: 'Bear in mind that we have limited budget.' },
            { context: 'Adding important context', example: 'As you review this, bear in mind the original timeline.' },
            { context: 'Subtle reminder', example: 'Do remember to bear in mind we\'re still in beta.' }
        ],
        nativeUsageNotes: [
            'Formal collocation: "bear in mind" not "keep in mind" (in British English)',
            'Softens instructions without losing authority',
            'Implies respect for listener\'s intelligence'
        ],
        nonNativeContrast: [
            {
                nonNative: 'Remember that we have budget limits.',
                native: 'Bear in mind that budget is tight.',
                explanation: 'Native version uses precise idiom; shows formal but warm communication.'
            },
            {
                nonNative: 'You must remember the deadline.',
                native: 'Bear in mind the deadline is Tuesday.',
                explanation: 'Native version is respectful reminder, not command; involves listener as equal.'
            }
        ]
    },
    {
        chunk: 'by all means',
        category: 'Openers',
        coreFunction: 'Enthusiastically grants permission; signals genuine invitation without hesitation.',
        situations: [
            { context: 'Welcoming suggestion', example: 'By all means, go ahead and share your ideas.' },
            { context: 'Generous permission', example: 'Do you mind if I open the window? By all means!' },
            { context: 'Encouraging action', example: 'By all means, take your time with the decision.' }
        ],
        nativeUsageNotes: [
            'Formal but friendly permission marker',
            'Shows genuine enthusiasm and openness',
            'Prevents listener from feeling uncertain or rejected'
        ],
        nonNativeContrast: [
            {
                nonNative: 'You can do it.',
                native: 'By all means, go ahead.',
                explanation: 'Native version is enthusiastic permission; non-native sounds neutral.'
            },
            {
                nonNative: 'Yes, that is OK.',
                native: 'By all means, proceed.',
                explanation: 'Native version shows warmth; non-native approval seems reluctant.'
            }
        ]
    }
];

/**
 * Categorize a chunk based on its characteristics
 */
function categorizeChunk(chunk: string): ChunkCategory {
    const lowerChunk = chunk.toLowerCase();

    if (lowerChunk.match(/^(hello|hi|nice|good|meet|how|by all means|welcome)/i)) {
        return 'Openers';
    }
    if (lowerChunk.match(/(honest|sure|think|kind|sort|rather|quite|fairly|perhaps|appreciate|actually|anyway|bit)/i)) {
        return 'Softening';
    }
    if (lowerChunk.match(/(disagree|think|point|see|mean|suggest|sure|see your)/i)) {
        return 'Disagreement';
    }
    if (lowerChunk.match(/(excuse|pardon|sorry|mean|clarify|actually|wait|minute)/i)) {
        return 'Repair';
    }
    if (lowerChunk.match(/(bye|goodbye|take|see|later|thanks|cheers|good|bear|remind|thank)/i)) {
        return 'Exit';
    }

    // Default to Idioms for unknown phrases
    return 'Idioms';
}

/**
 * Generate feedback for a specific chunk
 */
export function generateChunkFeedback(
    chunk: string,
    blankIndex: number,
    script?: RoleplayScript
): ChunkFeedback {
    // Check if we have a predefined template for this chunk
    const template = FEEDBACK_TEMPLATES.find(
        t => t.chunk.toLowerCase() === chunk.toLowerCase()
    );

    if (template) {
        return {
            blankIndex,
            chunk,
            category: template.category,
            coreFunction: template.coreFunction,
            situations: template.situations,
            nativeUsageNotes: template.nativeUsageNotes,
            nonNativeContrast: template.nonNativeContrast
        };
    }

    // Generate feedback for unknown chunks using intelligent patterns
    const category = categorizeChunk(chunk);
    return generateFallbackFeedback(chunk, blankIndex, category);
}

/**
 * Generate fallback feedback for chunks without predefined templates
 */
function generateFallbackFeedback(
    chunk: string,
    blankIndex: number,
    category: ChunkCategory
): ChunkFeedback {
    const lowerChunk = chunk.toLowerCase();

    // Generate core function based on category
    const coreFunctions: Record<ChunkCategory, string> = {
        'Openers': `Initiates conversation about "${chunk}"; establishes friendly, open tone.`,
        'Softening': `Softens statement about "${chunk}"; reduces directness and increases warmth.`,
        'Disagreement': `Respectfully challenges or reframes "${chunk}"; maintains relationship while disagreeing.`,
        'Repair': `Clarifies or corrects understanding of "${chunk}"; prevents miscommunication.`,
        'Exit': `Concludes discussion about "${chunk}"; signals completion or transition.`,
        'Idioms': `Common collocation: "${chunk}"; expresses meaning through fixed phrase pattern.`
    };

    // Generate situations based on category and chunk
    const situations: Array<{ context: string; example: string }> = [
        {
            context: 'General professional context',
            example: `${chunk} is useful in business discussions.`
        },
        {
            context: 'Casual conversation',
            example: `In everyday chat, people often say "${chunk}".`
        },
        {
            context: 'Formal interaction',
            example: `Even in formal settings, "${chunk}" conveys the right tone.`
        }
    ];

    // Generate usage notes
    const nativeUsageNotes = [
        `"${chunk}" is natural in native speech`,
        `Works across different social contexts`,
        `Conveys appropriate tone and register`
    ];

    // Generate contrast pairs
    const nonNativeContrast = [
        {
            nonNative: `I will use the word "${chunk}".`,
            native: `I'll use "${chunk}" naturally.`,
            explanation: 'Native speakers use phrases intuitively without stating it explicitly.'
        },
        {
            nonNative: `"${chunk}" means this exact thing.`,
            native: `"${chunk}" varies depending on context and speaker.`,
            explanation: 'Native phrases have flexible meanings based on conversation context.'
        }
    ];

    return {
        blankIndex,
        chunk,
        category,
        coreFunction: coreFunctions[category],
        situations,
        nativeUsageNotes,
        nonNativeContrast
    };
}

/**
 * Generate feedback for multiple chunks from a script
 */
export function generateFeedbackForChunks(
    chunks: Array<{ index: number; answer: string }>,
    script?: RoleplayScript
): ChunkFeedback[] {
    return chunks.map(c => generateChunkFeedback(c.answer, c.index, script));
}
