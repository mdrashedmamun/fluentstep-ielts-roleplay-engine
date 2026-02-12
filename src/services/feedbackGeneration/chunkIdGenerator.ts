/**
 * ChunkID Generation and Resolution Utilities
 *
 * Provides stable, deterministic chunk identifiers that survive text changes.
 * Format: `{scenarioId}-b{blankIndex}` (e.g., "social-1-flatmate-b1")
 *
 * Why not use text? Text-based references break when chunk content evolves.
 * Why not use blankIndex alone? Index can shift if dialogue structure changes.
 * Why composite key? Deterministic + human-readable + stable.
 */

import { RoleplayScript } from './index';

/**
 * Generate a deterministic chunk ID from scenario ID and blank index.
 * Format: `{scenarioId}-b{blankIndex}`
 * Example: "social-1-flatmate-b1"
 */
export function generateChunkId(scenarioId: string, blankIndex: number): string {
  if (!scenarioId || blankIndex < 0) {
    throw new Error(`Invalid input: scenarioId="${scenarioId}", blankIndex=${blankIndex}`);
  }
  return `${scenarioId}-b${blankIndex}`;
}

/**
 * Parse a chunk ID back into its components.
 * Returns null if format is invalid.
 */
export function parseChunkId(chunkId: string): { scenarioId: string; blankIndex: number } | null {
  const match = chunkId.match(/^(.+)-b(\d+)$/);
  if (!match) return null;

  return {
    scenarioId: match[1],
    blankIndex: parseInt(match[2], 10),
  };
}

/**
 * Validate chunk ID format without requiring a scenario.
 * Useful for pre-import validation.
 */
export function isValidChunkIdFormat(chunkId: string): boolean {
  return /^.+-b\d+$/.test(chunkId);
}

/**
 * Resolve a single chunk ID to its chunk text.
 * Returns null if chunk not found or scenario doesn't match.
 */
export function resolveChunkId(chunkId: string, scenario: RoleplayScript | null): string | null {
  if (!scenario) return null;

  const parsed = parseChunkId(chunkId);
  if (!parsed) return null;

  // Verify scenario matches
  if (parsed.scenarioId !== scenario.id) return null;

  // Find chunk by blank index
  const chunk = scenario.chunkFeedback?.find((f) => f.blankIndex === parsed.blankIndex);
  return chunk?.chunk ?? null;
}

/**
 * Resolve multiple chunk IDs to their texts.
 * Skips any that fail to resolve (graceful degradation).
 */
export function resolveChunkIds(chunkIds: string[], scenario: RoleplayScript | null): string[] {
  if (!scenario) return [];

  return chunkIds
    .map((id) => resolveChunkId(id, scenario))
    .filter((chunk): chunk is string => chunk !== null);
}

/**
 * Check if a chunk ID exists in a scenario.
 * Useful for validation before import.
 */
export function chunkIdExists(chunkId: string, scenario: RoleplayScript | null): boolean {
  if (!scenario) return false;

  const parsed = parseChunkId(chunkId);
  if (!parsed) return false;

  // Must match scenario
  if (parsed.scenarioId !== scenario.id) return false;

  // Must reference existing chunkFeedback
  return scenario.chunkFeedback?.some((f) => f.blankIndex === parsed.blankIndex) ?? false;
}

/**
 * Generate chunk IDs for all feedback items in a scenario.
 * Useful for migration scripts.
 */
export function generateChunkIdsForScenario(scenario: RoleplayScript): string[] {
  return (scenario.chunkFeedback || []).map((f) => generateChunkId(scenario.id, f.blankIndex));
}

/**
 * Create a debug comment mapping chunk IDs to their text.
 * Useful for exported markdown files.
 * Example output: "# Chunks: ["meet", "keep track"]"
 */
export function createChunkIdDebugComment(chunkIds: string[], scenario: RoleplayScript): string {
  const chunks = resolveChunkIds(chunkIds, scenario);
  return `# Chunks: [${chunks.map((c) => `"${c}"`).join(', ')}]`;
}
