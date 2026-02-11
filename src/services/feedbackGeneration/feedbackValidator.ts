import { ChunkFeedback } from '../staticData';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    fixes: Partial<ChunkFeedback>;
}

const GRAMMAR_TERMS = [
    'verb', 'noun', 'adjective', 'tense', 'conjugation',
    'adverb', 'preposition', 'article', 'clause', 'subject',
    'object', 'pronoun', 'conjunction', 'modal', 'infinitive',
    'gerund', 'participle', 'past', 'present', 'future'
];

function countWords(text: string): number {
    return text.trim().split(/\s+/).length;
}

function truncateAtWordBoundary(text: string, maxWords: number): string {
    const words = text.split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ');
}

function detectSimilarityBetweenTexts(text1: string, text2: string): number {
    // Simple similarity: count matching words
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    return intersection.size / Math.max(words1.size, words2.size);
}

function contextsAreSimilar(context1: string, context2: string): boolean {
    // Contexts are similar if they share too many words (should be distinct)
    return detectSimilarityBetweenTexts(context1, context2) > 0.5;
}

function hasGrammarTerminology(text: string): string[] {
    const foundTerms: string[] = [];
    GRAMMAR_TERMS.forEach(term => {
        if (text.toLowerCase().includes(term.toLowerCase())) {
            foundTerms.push(term);
        }
    });
    return foundTerms;
}

function chunkAppearsInExample(chunk: string, example: string): boolean {
    // Check if chunk appears in example (case-insensitive)
    return example.toLowerCase().includes(chunk.toLowerCase());
}

function validateWordCount(text: string, maxWords: number, fieldName: string): {
    isValid: boolean;
    error?: string;
    fix?: string;
} {
    const count = countWords(text);
    if (count <= maxWords) {
        return { isValid: true };
    }
    return {
        isValid: false,
        error: `${fieldName} has ${count} words (max ${maxWords})`,
        fix: truncateAtWordBoundary(text, maxWords)
    };
}

export function validateChunkFeedback(feedback: ChunkFeedback): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fixes: Partial<ChunkFeedback> = {};

    // 1. Core Function validation
    const coreFunctionWordCheck = validateWordCount(feedback.coreFunction, 20, 'coreFunction');
    if (!coreFunctionWordCheck.isValid) {
        errors.push(coreFunctionWordCheck.error!);
        if (coreFunctionWordCheck.fix) {
            fixes.coreFunction = coreFunctionWordCheck.fix;
        }
    }

    const coreGrammarTerms = hasGrammarTerminology(feedback.coreFunction);
    if (coreGrammarTerms.length > 0) {
        errors.push(`coreFunction contains grammar terminology: ${coreGrammarTerms.join(', ')}`);
    }

    // 2. Situations validation
    if (!feedback.situations || feedback.situations.length !== 3) {
        errors.push(`Must have exactly 3 situations (have ${feedback.situations?.length || 0})`);
    }

    feedback.situations?.forEach((sit, idx) => {
        // Check example word count
        const exampleWordCheck = validateWordCount(sit.example, 15, `situation[${idx}].example`);
        if (!exampleWordCheck.isValid) {
            errors.push(exampleWordCheck.error!);
            if (!fixes.situations) fixes.situations = JSON.parse(JSON.stringify(feedback.situations));
            if (exampleWordCheck.fix) {
                fixes.situations![idx].example = exampleWordCheck.fix;
            }
        }

        // Check if chunk appears in example
        if (!chunkAppearsInExample(feedback.chunk, sit.example)) {
            warnings.push(`situation[${idx}]: chunk "${feedback.chunk}" doesn't appear in example`);
        }
    });

    // Check situations have distinct contexts
    if (feedback.situations && feedback.situations.length >= 2) {
        for (let i = 0; i < feedback.situations.length; i++) {
            for (let j = i + 1; j < feedback.situations.length; j++) {
                if (contextsAreSimilar(feedback.situations[i].context, feedback.situations[j].context)) {
                    warnings.push(
                        `situation[${i}] and situation[${j}] contexts are too similar`
                    );
                }
            }
        }
    }

    // 3. Native Usage Notes validation
    if (!feedback.nativeUsageNotes || feedback.nativeUsageNotes.length < 3) {
        errors.push(`Must have at least 3 nativeUsageNotes (have ${feedback.nativeUsageNotes?.length || 0})`);
    }

    feedback.nativeUsageNotes?.forEach((note, idx) => {
        const grammarTerms = hasGrammarTerminology(note);
        if (grammarTerms.length > 0) {
            errors.push(`nativeUsageNotes[${idx}] contains grammar terminology: ${grammarTerms.join(', ')}`);
        }
    });

    // 4. Non-Native Contrast validation
    if (!feedback.nonNativeContrast || feedback.nonNativeContrast.length !== 2) {
        errors.push(`Must have exactly 2 nonNativeContrast pairs (have ${feedback.nonNativeContrast?.length || 0})`);
    }

    feedback.nonNativeContrast?.forEach((contrast, idx) => {
        // Check explanation word count
        const explanationWordCheck = validateWordCount(
            contrast.explanation,
            20,
            `nonNativeContrast[${idx}].explanation`
        );
        if (!explanationWordCheck.isValid) {
            errors.push(explanationWordCheck.error!);
            if (!fixes.nonNativeContrast) {
                fixes.nonNativeContrast = JSON.parse(JSON.stringify(feedback.nonNativeContrast));
            }
            if (explanationWordCheck.fix) {
                fixes.nonNativeContrast![idx].explanation = explanationWordCheck.fix;
            }
        }

        // Check if examples are different
        if (contrast.nonNative.toLowerCase() === contrast.native.toLowerCase()) {
            errors.push(`nonNativeContrast[${idx}]: nonNative and native examples are identical`);
        }

        // Check for grammar terminology
        const grammarTerms = hasGrammarTerminology(contrast.explanation);
        if (grammarTerms.length > 0) {
            errors.push(`nonNativeContrast[${idx}].explanation contains grammar terminology: ${grammarTerms.join(', ')}`);
        }
    });

    // 5. Category validation
    const validCategories = ['Openers', 'Softening', 'Disagreement', 'Repair', 'Exit', 'Idioms'];
    if (!validCategories.includes(feedback.category)) {
        errors.push(`Invalid category: ${feedback.category}`);
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        fixes: Object.keys(fixes).length > 0 ? fixes : {}
    };
}

export function autoFixChunkFeedback(feedback: ChunkFeedback, validation: ValidationResult): ChunkFeedback {
    if (validation.fixes && Object.keys(validation.fixes).length > 0) {
        return {
            ...feedback,
            ...validation.fixes
        };
    }
    return feedback;
}

export function validateAllFeedback(feedbackArray: ChunkFeedback[]): {
    allValid: boolean;
    results: Array<{ feedback: ChunkFeedback; validation: ValidationResult }>;
    summary: { total: number; valid: number; invalid: number };
} {
    const results = feedbackArray.map(feedback => ({
        feedback,
        validation: validateChunkFeedback(feedback)
    }));

    const allValid = results.every(r => r.validation.isValid);
    const validCount = results.filter(r => r.validation.isValid).length;

    return {
        allValid,
        results,
        summary: {
            total: feedbackArray.length,
            valid: validCount,
            invalid: feedbackArray.length - validCount
        }
    };
}
