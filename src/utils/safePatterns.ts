/**
 * Safe Pattern Utilities - Prevent recurring crashes and schema mismatches
 *
 * These functions encode patterns learned from 8 recurring mistakes:
 * 1. Undefined array access crashes
 * 2. Schema version confusion (V1 vs V2)
 * 3. Hardcoded timeout/config values
 * 4. Off-by-one indexing
 *
 * Use these instead of defensive checks scattered across components.
 */

import { RoleplayScript } from '../services/staticData';

/**
 * Safe array access - prevents .includes/.map crashes on undefined values
 *
 * @example
 * const items = safeArray(data.unknownField);  // [] if undefined
 * items.map(x => x.id);  // Always works, never crashes
 */
export function safeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Type guard for array validation
 * Use in conditional logic to safely access array methods
 *
 * @example
 * if (isValidArray<string>(feedback.notes)) {
 *   feedback.notes.forEach(note => ...);
 * }
 */
export function isValidArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length >= 0;
}

/**
 * Detect which field contains blank positions
 * Prevents V1/V2 schema confusion
 *
 * Returns 'blanksInOrder' if V2 scenario detected, 'answerVariations' otherwise
 *
 * @example
 * const source = getBlanksSource(script);  // 'blanksInOrder' | 'answerVariations'
 * const count = source === 'blanksInOrder'
 *   ? script.blanksInOrder?.length
 *   : script.answerVariations.length;
 */
export function getBlanksSource(script: RoleplayScript): 'blanksInOrder' | 'answerVariations' {
  return safeArray(script.blanksInOrder).length > 0 ? 'blanksInOrder' : 'answerVariations';
}

/**
 * Detect which feedback schema is in use
 * Prevents trying to access V1 properties on V2 data (and vice versa)
 *
 * Returns 'v2' if chunkFeedbackV2 exists, 'v1' if chunkFeedback exists, 'none' otherwise
 *
 * @example
 * const source = getChunkFeedbackSource(script);
 * if (source === 'v2') {
 *   feedback.forEach(item => console.log(item.native));
 * }
 */
export function getChunkFeedbackSource(
  script: RoleplayScript
): 'v2' | 'v1' | 'none' {
  if (safeArray(script.chunkFeedbackV2).length > 0) return 'v2';
  if (safeArray(script.chunkFeedback).length > 0) return 'v1';
  return 'none';
}

/**
 * Get accurate blank count for ANY scenario (V1 or V2)
 * Handles both old and new schemas automatically
 *
 * @example
 * const count = getBlankCount(script);  // Always returns correct number
 */
export function getBlankCount(script: RoleplayScript): number {
  const source = getBlanksSource(script);
  if (source === 'blanksInOrder') {
    return safeArray(script.blanksInOrder).length;
  }
  return script.answerVariations.length;
}

/**
 * Configuration constants - Single source of truth for all timeouts/thresholds
 * Use these instead of hardcoded values
 *
 * @example
 * import { TIMEOUTS } from '../utils/safePatterns';
 * await page.goto(url, { timeout: TIMEOUTS.LOAD });
 */
export const TIMEOUTS = {
  LOAD: 20000,        // Page navigation timeout (ms)
  ELEMENT: 5000,      // Element interaction timeout (ms)
  ANIMATION: 300,     // UI animation duration (ms)
} as const;

/**
 * Performance thresholds - Use for realistic assertions
 * Accounts for network latency + React rendering on live sites
 *
 * @example
 * const loadTime = performance.now() - startTime;
 * expect(loadTime).toBeLessThan(THRESHOLDS.LIVE_PAGE_LOAD);
 */
export const THRESHOLDS = {
  LIVE_PAGE_LOAD: 30000,    // Live Vercel page load (includes network latency)
  LOCAL_PAGE_LOAD: 5000,    // Local dev server
  INTERACTION: 1000,         // User interaction response time
} as const;

/**
 * Prevent hardcoded environment assumptions
 * Different behavior for localhost vs production
 */
export const ENVIRONMENT = {
  isDevelopment: !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;
