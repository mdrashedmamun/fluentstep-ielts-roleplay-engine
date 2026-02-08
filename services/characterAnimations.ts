export const characterMoods = {
  neutral: 'transition-all duration-300',
  speaking: 'animate-pulse scale-105',
  celebrating: 'animate-bounce scale-110',
  thinking: 'animate-pulse opacity-75',
} as const;

export type CharacterMood = keyof typeof characterMoods;
export type CharacterReaction = 'correct' | 'thinking' | 'speaking' | 'welcoming' | 'helpful' | 'friendly' | 'neutral' | 'active';

export const characterReactions = {
  'You': {
    colors: {
      gradient: 'from-primary-400 to-primary-600',
      ring: 'ring-orange-200',
      glow: 'shadow-primary-500/40'
    },
    reactions: {
      correct: '🎉',
      thinking: '💭',
      speaking: '💬',
      welcoming: '👋',
      helpful: '👍',
      friendly: '😊',
      neutral: '💬',
      active: '✨'
    }
  },
  'Agent': {
    colors: {
      gradient: 'from-accent-400 to-accent-600',
      ring: 'ring-teal-200',
      glow: 'shadow-accent-500/40'
    },
    reactions: {
      welcoming: '👋',
      helpful: '👍',
      friendly: '😊',
      correct: '✅',
      thinking: '💭',
      speaking: '💬',
      neutral: '💬',
      active: '✨'
    }
  },
  'Default': {
    colors: {
      gradient: 'from-neutral-400 to-neutral-600',
      ring: 'ring-slate-200',
      glow: 'shadow-neutral-500/40'
    },
    reactions: {
      neutral: '💬',
      active: '✨',
      correct: '✅',
      thinking: '💭',
      speaking: '💬',
      welcoming: '👋',
      helpful: '👍',
      friendly: '😊'
    }
  }
} as const;

export type CharacterName = keyof typeof characterReactions;
