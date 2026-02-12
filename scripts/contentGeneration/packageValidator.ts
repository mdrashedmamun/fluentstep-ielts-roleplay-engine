import YAML from 'yaml';

/**
 * Comprehensive validation system for content packages
 * 7 HARD rules (block import) + 3 SOFT rules (warnings only)
 */

export interface ValidationError {
    rule: string;
    severity: 'critical' | 'warning';
    message: string;
    location?: string;  // e.g., "Blank 5", "chunkId: hc1_ch_test"
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

export interface DialogueLine {
    speaker: string;
    text: string;
}

export interface Answer {
    index: number;
    answer: string;
    alternatives: string[];
}

export interface ParsedPackage {
    category: string;
    context: string;
    characters: Array<{ name: string; description: string }>;
    dialogue: DialogueLine[];
    answers: Answer[];
    blanksInOrder: Array<{ blankId: string; chunkId: string }>;
    chunkFeedback: Array<{
        chunkId: string;
        native: string;
        learner: {
            meaning: string;
            useWhen: string;
            commonWrong: string;
            fix: string;
            whyOdd: string;
        };
        examples: string[];
    }>;
    patternSummary: any;
    activeRecall: Array<{ id: string; prompt: string; targetChunkIds: string[] }>;
    yamlBlock: string;
}

/**
 * Count blanks (________ sequences) in dialogue
 */
function countBlanksInDialogue(dialogue: DialogueLine[]): number {
    return dialogue.reduce((count, line) => {
        const matches = line.text.match(/________/g);
        return count + (matches ? matches.length : 0);
    }, 0);
}

/**
 * HARD RULE 1: Blank count consistency
 * Dialogue blanks == Answers count == blanksInOrder count
 */
export function validateBlankCountConsistency(pkg: ParsedPackage): ValidationError[] {
    const dialogueBlanks = countBlanksInDialogue(pkg.dialogue);
    const answerCount = pkg.answers.length;
    const blankMappingCount = pkg.blanksInOrder.length;

    const errors: ValidationError[] = [];

    if (dialogueBlanks !== answerCount) {
        errors.push({
            rule: 'blank-count-consistency',
            severity: 'critical',
            message: `Dialogue has ${dialogueBlanks} blanks but ${answerCount} answers provided`,
            location: 'Roleplay dialogue vs Answers section'
        });
    }

    if (answerCount !== blankMappingCount) {
        errors.push({
            rule: 'blank-count-consistency',
            severity: 'critical',
            message: `${answerCount} answers but ${blankMappingCount} blank mappings in blanksInOrder`,
            location: 'Answers vs blanksInOrder'
        });
    }

    return errors;
}

/**
 * HARD RULE 2: YAML syntax valid
 */
export function validateYamlSyntax(yamlBlock: string): ValidationError[] {
    try {
        YAML.parse(yamlBlock);
        return [];
    } catch (e: any) {
        return [
            {
                rule: 'yaml-syntax',
                severity: 'critical',
                message: `YAML parsing failed: ${e.message}`,
                location: `Line ${e.linePos?.[0]?.line || 'unknown'}`
            }
        ];
    }
}

/**
 * HARD RULE 3: Blank-chunk mapping valid
 * Every blankId references a valid chunkId
 */
export function validateBlankChunkMapping(pkg: ParsedPackage): ValidationError[] {
    const chunkIds = new Set(pkg.chunkFeedback.map(c => c.chunkId));
    const errors: ValidationError[] = [];

    for (const mapping of pkg.blanksInOrder) {
        if (!chunkIds.has(mapping.chunkId)) {
            errors.push({
                rule: 'blank-chunk-mapping',
                severity: 'critical',
                message: `blankId "${mapping.blankId}" references non-existent chunkId "${mapping.chunkId}"`,
                location: 'blanksInOrder'
            });
        }
    }

    return errors;
}

/**
 * HARD RULE 4: Speaker count + dialogue lines
 * Exactly 2 speakers, ≥30 dialogue lines
 */
export function validateDialogueStructure(dialogue: DialogueLine[]): ValidationError[] {
    const speakers = new Set(dialogue.map(d => d.speaker));
    const errors: ValidationError[] = [];

    if (speakers.size !== 2) {
        errors.push({
            rule: 'dialogue-structure',
            severity: 'critical',
            message: `Expected exactly 2 speakers, found ${speakers.size}: ${Array.from(speakers).join(', ')}`,
            location: 'Roleplay dialogue'
        });
    }

    if (dialogue.length < 30) {
        errors.push({
            rule: 'dialogue-structure',
            severity: 'critical',
            message: `Expected ≥30 dialogue lines, found ${dialogue.length}`,
            location: 'Roleplay dialogue'
        });
    }

    return errors;
}

/**
 * HARD RULE 5: Valid chunkId references in patternSummary/activeRecall
 */
export function validateChunkIdReferences(pkg: ParsedPackage): ValidationError[] {
    const validChunkIds = new Set(pkg.chunkFeedback.map(c => c.chunkId));
    const errors: ValidationError[] = [];

    // Check patternSummary.categoryBreakdown
    if (pkg.patternSummary?.categoryBreakdown) {
        for (const cat of pkg.patternSummary.categoryBreakdown) {
            for (const exampleId of cat.exampleChunkIds || []) {
                if (!validChunkIds.has(exampleId)) {
                    errors.push({
                        rule: 'chunkid-references',
                        severity: 'critical',
                        message: `categoryBreakdown references non-existent chunkId "${exampleId}"`,
                        location: `patternSummary.categoryBreakdown[${cat.category}]`
                    });
                }
            }
        }
    }

    // Check patternSummary.keyPatterns
    if (pkg.patternSummary?.keyPatterns) {
        for (const pattern of pkg.patternSummary.keyPatterns) {
            for (const chunkId of pattern.chunkIds || []) {
                if (!validChunkIds.has(chunkId)) {
                    errors.push({
                        rule: 'chunkid-references',
                        severity: 'critical',
                        message: `keyPatterns references non-existent chunkId "${chunkId}"`,
                        location: `patternSummary.keyPatterns[${pattern.pattern}]`
                    });
                }
            }
        }
    }

    // Check activeRecall
    for (const item of pkg.activeRecall) {
        for (const chunkId of item.targetChunkIds) {
            if (!validChunkIds.has(chunkId)) {
                errors.push({
                    rule: 'chunkid-references',
                    severity: 'critical',
                    message: `activeRecall item "${item.id}" references non-existent chunkId "${chunkId}"`,
                    location: `activeRecall[${item.id}]`
                });
            }
        }
    }

    return errors;
}

/**
 * HARD RULE 6: No partial blanks
 * Answer text must equal chunkFeedback.native exactly (no mismatches)
 */
export function validateFullChunkBlanks(pkg: ParsedPackage): ValidationError[] {
    const errors: ValidationError[] = [];

    for (let i = 0; i < pkg.answers.length; i++) {
        const answer = pkg.answers[i];
        const mapping = pkg.blanksInOrder[i];
        const chunk = pkg.chunkFeedback.find(c => c.chunkId === mapping.chunkId);

        if (chunk && answer.answer !== chunk.native) {
            errors.push({
                rule: 'full-chunk-blanks',
                severity: 'critical',
                message: `Answer "${answer.answer}" != chunk.native "${chunk.native}" (possible partial blank)`,
                location: `Blank ${i + 1} / ${chunk.chunkId}`
            });
        }
    }

    return errors;
}

/**
 * HARD RULE 7: Healthcare safety
 * No emergency language (cardiac arrest, severe bleeding, unconscious, etc.)
 */
export function validateHealthcareSafety(pkg: ParsedPackage): ValidationError[] {
    if (!pkg.category || pkg.category !== 'Healthcare') return [];

    const emergencyPhrases = [
        'cardiac arrest',
        'heart attack',
        'stroke',
        'severe bleeding',
        'unconscious',
        'anaphylaxis',
        'choking',
        'seizure',
        'life-threatening',
        'emergency'
    ];

    const allText = [
        ...pkg.dialogue.map(d => d.text),
        pkg.context || '',
        ...pkg.answers.map(a => a.answer),
        JSON.stringify(pkg.chunkFeedback)
    ]
        .join(' ')
        .toLowerCase();

    const errors: ValidationError[] = [];

    for (const phrase of emergencyPhrases) {
        if (allText.includes(phrase)) {
            errors.push({
                rule: 'healthcare-safety',
                severity: 'critical',
                message: `Healthcare scenarios must NOT contain emergency language: "${phrase}"`,
                location: 'Context or Dialogue or Answers'
            });
        }
    }

    return errors;
}

/**
 * HARD RULE 10: Chunk slug uniqueness
 * No duplicate slugs within scenario
 */
export function validateChunkSlugUniqueness(feedback: ParsedPackage['chunkFeedback']): ValidationError[] {
    const slugs = new Map<string, string[]>(); // slug → chunkIds[]

    for (const chunk of feedback) {
        const slug = chunk.chunkId.split('_ch_')[1]; // Extract slug
        if (!slug) continue;

        if (!slugs.has(slug)) slugs.set(slug, []);
        slugs.get(slug)!.push(chunk.chunkId);
    }

    const errors: ValidationError[] = [];

    for (const [slug, chunkIds] of slugs) {
        if (chunkIds.length > 1) {
            errors.push({
                rule: 'chunk-slug-uniqueness',
                severity: 'critical',
                message: `Duplicate slug "${slug}" used in: ${chunkIds.join(', ')}`,
                location: 'chunkFeedback'
            });
        }
    }

    return errors;
}

/**
 * SOFT RULE 8: Alternatives quality
 * 0-4 natural alternatives per blank (warn if 0)
 */
export function validateAlternativesQuality(answers: Answer[]): ValidationError[] {
    const warnings: ValidationError[] = [];

    for (const answer of answers) {
        if (answer.alternatives.length === 0) {
            warnings.push({
                rule: 'alternatives-quality',
                severity: 'warning',
                message: `No alternatives provided for "${answer.answer}" (consider adding 2-4)`,
                location: `Blank ${answer.index}`
            });
        }

        if (answer.alternatives.length > 4) {
            warnings.push({
                rule: 'alternatives-quality',
                severity: 'warning',
                message: `${answer.alternatives.length} alternatives for "${answer.answer}" (max 4 recommended)`,
                location: `Blank ${answer.index}`
            });
        }
    }

    return warnings;
}

/**
 * SOFT RULE 9: WhyOdd specificity
 * Detect vague phrases and encourage specific explanations
 */
export function validateWhyOddSpecificity(feedback: ParsedPackage['chunkFeedback']): ValidationError[] {
    const vaguePhrases = [
        'sounds wrong',
        'not natural',
        'incorrect',
        "doesn't sound right",
        'weird',
        'odd',
        'strange',
        'awkward',
        'bad'
    ];

    const warnings: ValidationError[] = [];

    for (const chunk of feedback) {
        const whyOdd = chunk.learner.whyOdd.toLowerCase();
        const wordCount = chunk.learner.whyOdd.split(' ').length;

        for (const vague of vaguePhrases) {
            if (whyOdd.includes(vague) && wordCount < 10) {
                warnings.push({
                    rule: 'whyodd-specificity',
                    severity: 'warning',
                    message: `whyOdd is vague: "${chunk.learner.whyOdd}" (be specific about WHY it's odd, not just that it is)`,
                    location: chunk.chunkId
                });
                break;
            }
        }
    }

    return warnings;
}

/**
 * SOFT RULE 10 (alternative): Pattern insight specificity
 * Ensure insights focus on functional outcomes, not definitions
 */
export function validatePatternInsights(pkg: ParsedPackage): ValidationError[] {
    const warnings: ValidationError[] = [];

    if (!pkg.patternSummary?.overallInsight) return warnings;

    const definitionKeywords = [
        'is a',
        'means',
        'definition',
        'refers to',
        'describe[s]?',
        'noun',
        'verb',
        'adjective'
    ];

    const insightLower = pkg.patternSummary.overallInsight.toLowerCase();

    for (const keyword of definitionKeywords) {
        if (new RegExp(keyword).test(insightLower)) {
            warnings.push({
                rule: 'pattern-insight-specificity',
                severity: 'warning',
                message: `overallInsight focuses on definitions ("${keyword}"), focus on functional/pedagogical outcomes instead`,
                location: 'patternSummary.overallInsight'
            });
            break;
        }
    }

    return warnings;
}

/**
 * Main validation orchestrator
 * Runs all HARD rules (must pass) + SOFT rules (warnings)
 */
export function validatePackage(pkg: ParsedPackage): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationError[] = [];

    // Run HARD rules (7 rules)
    allErrors.push(...validateBlankCountConsistency(pkg));
    allErrors.push(...validateYamlSyntax(pkg.yamlBlock));
    allErrors.push(...validateBlankChunkMapping(pkg));
    allErrors.push(...validateDialogueStructure(pkg.dialogue));
    allErrors.push(...validateChunkIdReferences(pkg));
    allErrors.push(...validateFullChunkBlanks(pkg));
    allErrors.push(...validateHealthcareSafety(pkg));
    allErrors.push(...validateChunkSlugUniqueness(pkg.chunkFeedback));

    // Run SOFT rules (warnings only)
    allWarnings.push(...validateAlternativesQuality(pkg.answers));
    allWarnings.push(...validateWhyOddSpecificity(pkg.chunkFeedback));
    allWarnings.push(...validatePatternInsights(pkg));

    return {
        valid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings
    };
}

/**
 * Format validation errors for console display
 */
export function formatValidationReport(result: ValidationResult): string {
    let report = '';

    if (result.valid) {
        report += '✅ All validations passed!\n';
    } else {
        report += `❌ Validation failed with ${result.errors.length} critical errors:\n\n`;

        for (const error of result.errors) {
            report += `  [${error.rule}] ${error.message}\n`;
            if (error.location) {
                report += `    └─ ${error.location}\n`;
            }
        }
    }

    if (result.warnings.length > 0) {
        report += `\n⚠️  ${result.warnings.length} warnings:\n\n`;

        for (const warning of result.warnings) {
            report += `  [${warning.rule}] ${warning.message}\n`;
            if (warning.location) {
                report += `    └─ ${warning.location}\n`;
            }
        }
    }

    return report;
}
