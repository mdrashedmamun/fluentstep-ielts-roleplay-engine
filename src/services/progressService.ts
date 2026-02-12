/**
 * Progress Tracking Service
 * Manages scenario completion state and progress persistence via localStorage
 */

export interface ScenarioProgress {
  scenarioId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  currentStep: number;
  revealedBlanks: number[];
  completedAt?: number;
  timeSpent: number; // seconds
  lastVisitedAt: number;
  // FIX 6: Active Recall tracking (optional, backward compatible)
  activeRecallAttempts?: Array<{
    attemptedAt: number;
    score: number;
    totalQuestions: number;
    timeSpentSeconds: number;
  }>;
}

export interface UserProgress {
  completedScenarios: string[];
  scenarioProgress: Record<string, ScenarioProgress>;
  lastVisited: string | null;
  totalTimeSpent: number;
}

const STORAGE_KEY = 'fluentstep:progress';

/**
 * Initialize default progress object
 */
const getDefaultProgress = (): UserProgress => ({
  completedScenarios: [],
  scenarioProgress: {},
  lastVisited: null,
  totalTimeSpent: 0
});

/**
 * Safely retrieve progress from localStorage
 */
export const progressService = {
  getProgress(): UserProgress {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return getDefaultProgress();

      const parsed = JSON.parse(stored);
      // Validate structure
      if (parsed && typeof parsed === 'object' && 'scenarioProgress' in parsed) {
        return parsed as UserProgress;
      }
      return getDefaultProgress();
    } catch {
      console.warn('Failed to parse progress from localStorage, starting fresh');
      return getDefaultProgress();
    }
  },

  /**
   * Save progress to localStorage with error handling
   */
  saveProgress(progress: UserProgress): void {
    try {
      // Check localStorage quota (rough estimate: 5MB limit)
      const serialized = JSON.stringify(progress);
      if (serialized.length > 5242880) {
        console.warn('Progress data exceeds safe localStorage size');
        return;
      }
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (e) {
      if (e instanceof DOMException && e.code === 22) {
        console.warn('localStorage quota exceeded');
      } else {
        console.warn('Failed to save progress to localStorage', e);
      }
    }
  },

  /**
   * Mark scenario as started (in progress)
   */
  markScenarioStarted(scenarioId: string): void {
    const progress = this.getProgress();
    progress.scenarioProgress[scenarioId] = {
      scenarioId,
      status: 'in_progress',
      currentStep: 0,
      revealedBlanks: [],
      timeSpent: 0,
      lastVisitedAt: Date.now()
    };
    progress.lastVisited = scenarioId;
    this.saveProgress(progress);
  },

  /**
   * Mark scenario as completed
   */
  markScenarioCompleted(scenarioId: string): void {
    const progress = this.getProgress();
    if (!progress || !progress.completedScenarios) {
      return;
    }

    const scenarioProgress = progress.scenarioProgress[scenarioId];

    if (scenarioProgress) {
      scenarioProgress.status = 'completed';
      scenarioProgress.completedAt = Date.now();

      if (!progress.completedScenarios.includes(scenarioId)) {
        progress.completedScenarios.push(scenarioId);
      }
    }

    this.saveProgress(progress);
  },

  /**
   * Update scenario progress (step and revealed blanks)
   */
  updateScenarioProgress(scenarioId: string, step: number, blanks: number[], timeSpent: number): void {
    const progress = this.getProgress();

    if (progress.scenarioProgress[scenarioId]) {
      progress.scenarioProgress[scenarioId]!.currentStep = step;
      progress.scenarioProgress[scenarioId]!.revealedBlanks = blanks;
      progress.scenarioProgress[scenarioId]!.timeSpent = timeSpent;
      progress.scenarioProgress[scenarioId]!.lastVisitedAt = Date.now();
      progress.totalTimeSpent = Object.values(progress.scenarioProgress).reduce((sum, sp) => sum + sp.timeSpent, 0);
    }

    this.saveProgress(progress);
  },

  /**
   * Get completion status of a scenario
   */
  getScenarioStatus(scenarioId: string): 'not_started' | 'in_progress' | 'completed' {
    const progress = this.getProgress();
    return progress.scenarioProgress[scenarioId]?.status || 'not_started';
  },

  /**
   * Get completion percentage
   */
  getCompletionPercentage(totalScenarios: number): number {
    const progress = this.getProgress();
    if (totalScenarios === 0) return 0;
    return Math.round((progress.completedScenarios.length / totalScenarios) * 100);
  },

  /**
   * Get last visited scenario ID
   */
  getLastVisitedScenario(): string | null {
    const progress = this.getProgress();
    return progress.lastVisited;
  },

  /**
   * Clear all progress
   */
  clearProgress(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Get scenario progress details
   */
  getScenarioDetails(scenarioId: string): ScenarioProgress | null {
    const progress = this.getProgress();
    return progress.scenarioProgress[scenarioId] || null;
  }
};
