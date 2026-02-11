/**
 * Shared TypeScript interfaces for UX enhancements
 * Used by all agents to maintain type consistency
 */

// ============================================================================
// Filter State
// ============================================================================

export interface FilterState {
  difficulty: ('B2' | 'C1')[];
  duration: ('short' | 'medium' | 'long')[];
  status: ('not_started' | 'in_progress' | 'completed')[];
}

export interface FilterCounts {
  total: number;
  filtered: number;
}

// ============================================================================
// Sorting
// ============================================================================

export type SortOption = 'recommended' | 'recently_added' | 'alphabetical' | 'duration';

export interface SortConfig {
  option: SortOption;
  label: string;
  icon?: string;
}

// ============================================================================
// Navigation
// ============================================================================

export interface NavigationContext {
  hasPrevious: boolean;
  hasNext: boolean;
  currentIndex: number;
  totalCount: number;
  previousScenarioId?: string;
  nextScenarioId?: string;
}

// ============================================================================
// Search
// ============================================================================

export interface SearchIndex {
  scenarioId: string;
  topic: string;
  context: string;
  category: string;
}

export interface SearchResult {
  scenarioId: string;
  matchedFields: string[];
  relevance: number;
}

// ============================================================================
// Scenario Metadata (Computed)
// ============================================================================

export interface ScenarioMetadata {
  difficulty: 'B2' | 'C1' | 'unknown';
  duration: 'short' | 'medium' | 'long';
  turnCount: number;
}

// ============================================================================
// Celebration
// ============================================================================

export type AchievementType = 'scenario_complete' | 'milestone_25' | 'milestone_50' | 'milestone_75' | 'milestone_100';

export interface CelebrationEvent {
  type: AchievementType;
  scenarioId?: string;
  message: string;
  soundId: 'completion' | 'celebration';
}

// ============================================================================
// URL Parameters
// ============================================================================

export interface URLParams {
  search?: string;
  difficulty?: string;
  duration?: string;
  status?: string;
  sort?: SortOption;
}

// ============================================================================
// Audio
// ============================================================================

export type SoundId = 'completion' | 'celebration';

export interface AudioState {
  isMuted: boolean;
}
