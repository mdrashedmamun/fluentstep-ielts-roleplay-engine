/**
 * Streak Service
 * Tracks daily learning streaks and provides streak-related functionality
 */

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // ISO date string
  totalDaysActive: number;
  history: {
    date: string;
    completed: boolean;
  }[];
}

const STREAK_STORAGE_KEY = 'fluentstep:streak';

/**
 * Initialize or retrieve streak data
 */
export function getStreakData(): StreakData {
  try {
    const stored = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!stored) {
      return initializeStreak();
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading streak data:', error);
    return initializeStreak();
  }
}

/**
 * Initialize new streak data
 */
function initializeStreak(): StreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
    totalDaysActive: 0,
    history: []
  };
}

/**
 * Get today's date in ISO format
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get yesterday's date in ISO format
 */
function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Record activity for today (mark as visited)
 */
export function recordDailyActivity(): void {
  try {
    const data = getStreakData();
    const today = getTodayDate();

    // If already recorded today, don't update
    if (data.lastActivityDate === today) {
      return;
    }

    const yesterday = getYesterdayDate();

    // Check if this is a continuation of streak
    if (data.lastActivityDate === yesterday) {
      // Streak continues
      data.currentStreak += 1;
    } else if (data.lastActivityDate === '') {
      // First activity ever
      data.currentStreak = 1;
    } else {
      // Streak broken, start new one
      data.currentStreak = 1;
    }

    // Update longest streak
    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }

    // Record in history
    data.lastActivityDate = today;
    data.totalDaysActive += 1;
    data.history.push({
      date: today,
      completed: true
    });

    // Keep only last 365 days of history
    if (data.history.length > 365) {
      data.history = data.history.slice(-365);
    }

    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error recording daily activity:', error);
  }
}

/**
 * Get current streak count
 */
export function getCurrentStreak(): number {
  const data = getStreakData();

  // Check if streak should be reset (no activity yesterday or today)
  const today = getTodayDate();
  const yesterday = getYesterdayDate();

  if (data.lastActivityDate === today || data.lastActivityDate === yesterday) {
    return data.currentStreak;
  }

  // Streak expired, return 0
  return 0;
}

/**
 * Get longest streak count
 */
export function getLongestStreak(): number {
  return getStreakData().longestStreak;
}

/**
 * Get total days active
 */
export function getTotalDaysActive(): number {
  return getStreakData().totalDaysActive;
}

/**
 * Get streak status message
 */
export function getStreakMessage(): string {
  const streak = getCurrentStreak();

  if (streak === 0) {
    return 'Start your first streak today!';
  } else if (streak === 1) {
    return '🔥 Day 1! You\'ve started your journey.';
  } else if (streak === 7) {
    return '🔥 Week Warrior! 7-day streak achievement unlocked!';
  } else if (streak === 14) {
    return '🔥 On fire! 14-day streak - Keep it going!';
  } else if (streak === 30) {
    return '🔥 Month Master! 30-day streak - Incredible dedication!';
  } else if (streak === 100) {
    return '🔥💎 Diamond Streak! 100 days of learning!';
  } else {
    return `🔥 ${streak}-day streak! Keep learning!`;
  }
}

/**
 * Get streak emoji based on count
 */
export function getStreakEmoji(): string {
  const streak = getCurrentStreak();

  if (streak === 0) return '🌟';
  if (streak < 7) return '🔥';
  if (streak < 30) return '🔥';
  if (streak < 100) return '🔥';
  return '💎';
}

/**
 * Check if user qualifies for specific badges
 */
export function checkStreakBadges(): {
  weekWarrior: boolean;
  monthMaster: boolean;
  diamondStreak: boolean;
  consistent: boolean;
} {
  const streak = getCurrentStreak();
  const total = getTotalDaysActive();

  return {
    weekWarrior: streak >= 7,
    monthMaster: streak >= 30,
    diamondStreak: streak >= 100,
    consistent: total >= 50 // For consistent learner badge
  };
}

/**
 * Reset streak data (for testing or user reset)
 */
export function resetStreakData(): void {
  try {
    localStorage.removeItem(STREAK_STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting streak:', error);
  }
}
