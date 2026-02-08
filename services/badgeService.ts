/**
 * Badge Service
 * Manages achievement badges for gamification and motivation
 */

export type BadgeId =
  | 'first-steps'
  | 'explorer'
  | 'dedicated-learner'
  | 'master-student'
  | 'perfectionist'
  | 'listener'
  | 'week-warrior'
  | 'month-master'
  | 'habit-builder'
  | 'early-bird'
  | 'pattern-recognizer'
  | 'vocabulary-builder'
  | 'native-speaker'
  | 'quick-learner'
  | 'deep-diver';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  category: 'completion' | 'consistency' | 'skill';
  icon: string; // emoji or icon name
  unlockedColor: string; // tailwind color
  criteria: string; // Human readable description
}

export const BADGES: Record<BadgeId, Badge> = {
  // Completion Milestones
  'first-steps': {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first scenario',
    category: 'completion',
    icon: '👣',
    unlockedColor: 'from-orange-400 to-orange-500',
    criteria: 'Complete 1 scenario'
  },
  'explorer': {
    id: 'explorer',
    name: 'Explorer',
    description: 'Complete 5 scenarios',
    category: 'completion',
    icon: '🗺️',
    unlockedColor: 'from-primary-400 to-primary-500',
    criteria: 'Complete 5 scenarios'
  },
  'dedicated-learner': {
    id: 'dedicated-learner',
    name: 'Dedicated Learner',
    description: 'Complete 15 scenarios',
    category: 'completion',
    icon: '📚',
    unlockedColor: 'from-accent-400 to-accent-500',
    criteria: 'Complete 15 scenarios'
  },
  'master-student': {
    id: 'master-student',
    name: 'Master Student',
    description: 'Complete all 36 scenarios',
    category: 'completion',
    icon: '🎓',
    unlockedColor: 'from-success-400 to-success-500',
    criteria: 'Complete all 36 scenarios'
  },
  'perfectionist': {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Reveal all blanks in every scenario',
    category: 'completion',
    icon: '💎',
    unlockedColor: 'from-primary-300 to-primary-600',
    criteria: 'Reveal all blanks in every scenario'
  },
  'listener': {
    id: 'listener',
    name: 'Active Listener',
    description: 'Use speech synthesis 50 times',
    category: 'completion',
    icon: '🎧',
    unlockedColor: 'from-accent-300 to-accent-600',
    criteria: 'Listen to dialogues 50 times'
  },

  // Consistency Badges
  'week-warrior': {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    category: 'consistency',
    icon: '🔥',
    unlockedColor: 'from-orange-400 to-primary-500',
    criteria: 'Learn for 7 consecutive days'
  },
  'month-master': {
    id: 'month-master',
    name: 'Month Master',
    description: 'Maintain a 30-day learning streak',
    category: 'consistency',
    icon: '🏆',
    unlockedColor: 'from-primary-400 to-primary-600',
    criteria: 'Learn for 30 consecutive days'
  },
  'habit-builder': {
    id: 'habit-builder',
    name: 'Habit Builder',
    description: 'Learn 3 times per week for 4 weeks',
    category: 'consistency',
    icon: '⭐',
    unlockedColor: 'from-yellow-400 to-yellow-500',
    criteria: 'Consistent weekly learner'
  },
  'early-bird': {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete 10 scenarios before 9 AM',
    category: 'consistency',
    icon: '🌅',
    unlockedColor: 'from-orange-300 to-orange-500',
    criteria: 'Learn in the morning'
  },

  // Skill Development
  'pattern-recognizer': {
    id: 'pattern-recognizer',
    name: 'Pattern Recognizer',
    description: 'Reveal 100 LOCKED CHUNKS blanks',
    category: 'skill',
    icon: '🧩',
    unlockedColor: 'from-accent-400 to-accent-600',
    criteria: 'Master 100 native phrases'
  },
  'vocabulary-builder': {
    id: 'vocabulary-builder',
    name: 'Vocabulary Builder',
    description: 'Learn 200 unique phrases',
    category: 'skill',
    icon: '📖',
    unlockedColor: 'from-primary-400 to-accent-500',
    criteria: 'Discover 200 phrases'
  },
  'native-speaker': {
    id: 'native-speaker',
    name: 'Native Speaker',
    description: 'Listen to all dialogue audio',
    category: 'skill',
    icon: '🎙️',
    unlockedColor: 'from-accent-400 to-primary-500',
    criteria: 'Listen to native pronunciation'
  },
  'quick-learner': {
    id: 'quick-learner',
    name: 'Quick Learner',
    description: 'Complete 3 scenarios in one session',
    category: 'skill',
    icon: '⚡',
    unlockedColor: 'from-primary-400 to-orange-500',
    criteria: 'Rapid progress in one session'
  },
  'deep-diver': {
    id: 'deep-diver',
    name: 'Deep Diver',
    description: 'Read all deep dive insights',
    category: 'skill',
    icon: '🤿',
    unlockedColor: 'from-accent-400 to-accent-600',
    criteria: 'Read all deep dive insights'
  }
};

interface UnlockedBadges {
  badges: BadgeId[];
  unlockedDates: Record<BadgeId, string>; // ISO date string
}

const BADGE_STORAGE_KEY = 'fluentstep:badges';

/**
 * Get unlocked badges
 */
export function getUnlockedBadges(): UnlockedBadges {
  try {
    const stored = localStorage.getItem(BADGE_STORAGE_KEY);
    if (!stored) {
      return { badges: [], unlockedDates: {} };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading badge data:', error);
    return { badges: [], unlockedDates: {} };
  }
}

/**
 * Unlock a badge
 */
export function unlockBadge(badgeId: BadgeId): boolean {
  try {
    const data = getUnlockedBadges();

    if (data.badges.includes(badgeId)) {
      return false; // Already unlocked
    }

    data.badges.push(badgeId);
    data.unlockedDates[badgeId] = new Date().toISOString();

    localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(data));
    return true; // Newly unlocked
  } catch (error) {
    console.error('Error unlocking badge:', error);
    return false;
  }
}

/**
 * Check if badge is unlocked
 */
export function isBadgeUnlocked(badgeId: BadgeId): boolean {
  return getUnlockedBadges().badges.includes(badgeId);
}

/**
 * Get all badges with unlock status
 */
export function getAllBadgesWithStatus(): (Badge & { unlocked: boolean; unlockedDate?: string })[] {
  const unlockedData = getUnlockedBadges();

  return Object.values(BADGES).map(badge => ({
    ...badge,
    unlocked: unlockedData.badges.includes(badge.id),
    unlockedDate: unlockedData.unlockedDates[badge.id]
  }));
}

/**
 * Get badges by category
 */
export function getBadgesByCategory(category: 'completion' | 'consistency' | 'skill') {
  return getAllBadgesWithStatus().filter(b => b.category === category);
}

/**
 * Get count of unlocked badges
 */
export function getUnlockedBadgeCount(): number {
  return getUnlockedBadges().badges.length;
}

/**
 * Get recently unlocked badges (last 7 days)
 */
export function getRecentlyUnlockedBadges(): (Badge & { unlockedDate: string })[] {
  const unlockedData = getUnlockedBadges();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return unlockedData.badges
    .filter(id => {
      const unlockedDate = unlockedData.unlockedDates[id];
      return new Date(unlockedDate) >= sevenDaysAgo;
    })
    .map(id => ({
      ...BADGES[id],
      unlockedDate: unlockedData.unlockedDates[id]
    }));
}

/**
 * Reset all badges (for testing)
 */
export function resetBadges(): void {
  try {
    localStorage.removeItem(BADGE_STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting badges:', error);
  }
}
