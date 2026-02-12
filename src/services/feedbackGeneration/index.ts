/**
 * Feedback Generation System Index
 * Exports all feedback generation utilities
 */

export { selectHighValueChunks } from './chunkSelector';
export { generateChunkFeedback, generateFallbackFeedback, generateFeedbackForChunks } from './feedbackGenerator';
export { validateChunkFeedback, autoFixChunkFeedback, validateAllFeedback } from './feedbackValidator';
export type { ValidationResult } from './feedbackValidator';
export {
  generateChunkId,
  parseChunkId,
  isValidChunkIdFormat,
  resolveChunkId,
  resolveChunkIds,
  chunkIdExists,
  generateChunkIdsForScenario,
  createChunkIdDebugComment,
} from './chunkIdGenerator';

import { RoleplayScript, ChunkFeedback } from '../staticData';
import { selectHighValueChunks } from './chunkSelector';
import { generateChunkFeedback } from './feedbackGenerator';
import { validateChunkFeedback, autoFixChunkFeedback, validateAllFeedback } from './feedbackValidator';

/**
 * End-to-end feedback generation pipeline for a single scenario
 */
export function generateScenarioFeedback(
    script: RoleplayScript,
    config?: {
        targetSelectionRate?: number;
        minChunks?: number;
        maxChunks?: number;
    }
): { feedback: ChunkFeedback[]; selection: ReturnType<typeof selectHighValueChunks> } {
    // Stage 1: Select high-value chunks
    const selection = selectHighValueChunks(script, config);

    // Stage 2: Generate feedback for selected chunks
    const selectedAnswers = script.answerVariations
        .filter(a => selection.selectedIndices.includes(a.index))
        .map(a => ({ index: a.index, answer: a.answer }));

    const feedback = selectedAnswers.map(a =>
        generateChunkFeedback(a.answer, a.index, script)
    );

    // Stage 3: Validate all feedback
    const validation = validateAllFeedback(feedback);

    // Auto-fix any validation issues
    const fixedFeedback = feedback.map((fb, idx) => {
        const result = validation.results[idx];
        if (!result.validation.isValid) {
            return autoFixChunkFeedback(fb, result.validation);
        }
        return fb;
    });

    return {
        feedback: fixedFeedback,
        selection
    };
}

/**
 * Generate feedback for all provided scenarios
 */
export function generateAllScenariosFeedback(
    scripts: RoleplayScript[]
): Array<{
    scenarioId: string;
    feedback: ChunkFeedback[];
    selectionStats: {
        selectedCount: number;
        totalCount: number;
        selectionRate: number;
        categoryDistribution: Record<string, number>;
    };
}> {
    return scripts.map(script => {
        const result = generateScenarioFeedback(script);
        return {
            scenarioId: script.id,
            feedback: result.feedback,
            selectionStats: {
                selectedCount: result.selection.selectedIndices.length,
                totalCount: result.selection.totalBlanks,
                selectionRate: result.selection.selectionRate,
                categoryDistribution: result.selection.categoryDistribution
            }
        };
    });
}
