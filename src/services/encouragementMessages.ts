/**
 * Encouragement Messages Service
 * Dynamic encouragement based on progress percentage and completed scenarios
 */

export interface EncouragementMessage {
  title: string;
  message: string;
  emoji: string;
  tone: 'excited' | 'proud' | 'motivational' | 'celebratory';
}

export function getEncouragementMessage(
  completionPercentage: number,
  completedCount: number
): EncouragementMessage {
  // 0-10%: Getting Started
  if (completionPercentage < 10) {
    return {
      title: "You're off to a great start!",
      message: "Every journey begins with a single step. You've taken yours!",
      emoji: "🌱",
      tone: "excited"
    };
  }

  // 10-24%: Early Progress
  if (completionPercentage < 25) {
    return {
      title: "Great momentum!",
      message: `${completedCount} scenarios down. You're building real confidence!`,
      emoji: "⚡",
      tone: "motivational"
    };
  }

  // 25%: First Quarter - Milestone
  if (completionPercentage >= 25 && completionPercentage < 30) {
    return {
      title: "🎉 Quarter way there!",
      message: "25% complete! Your fluency is growing with every conversation.",
      emoji: "⛺",
      tone: "proud"
    };
  }

  // 30-49%: Steady Climbing
  if (completionPercentage < 50) {
    return {
      title: "You're doing amazing!",
      message: `${completedCount} scenarios mastered. You're halfway to the peak!`,
      emoji: "🏔️",
      tone: "motivational"
    };
  }

  // 50%: Halfway - Major Milestone
  if (completionPercentage >= 50 && completionPercentage < 55) {
    return {
      title: "🏆 Wow, you're unstoppable!",
      message: "Halfway to the summit! You're building real fluency.",
      emoji: "🎯",
      tone: "motivational"
    };
  }

  // 55-74%: Home Stretch
  if (completionPercentage < 75) {
    return {
      title: "The summit is in sight!",
      message: `${completedCount} scenarios conquered. Just a little more to go!`,
      emoji: "🚀",
      tone: "motivational"
    };
  }

  // 75%: Final Quarter - Last Push
  if (completionPercentage >= 75 && completionPercentage < 100) {
    return {
      title: "🌟 The summit awaits!",
      message: "75% complete! You're in the final stretch. Don't stop now!",
      emoji: "⛰️",
      tone: "motivational"
    };
  }

  // 100%: Summit Conquered
  if (completionPercentage === 100) {
    return {
      title: "You did it! 🎉",
      message: "Summit conquered! You've completed your entire English fluency journey.",
      emoji: "🏆",
      tone: "celebratory"
    };
  }

  // Default fallback
  return {
    title: "Keep going!",
    message: "You're making great progress. Every scenario makes you stronger.",
    emoji: "💪",
    tone: "motivational"
  };
}

/**
 * Get a progress-aware motivational phrase for the stats card
 */
export function getMotivationalPhrase(completionPercentage: number): string {
  if (completionPercentage === 0) return "Ready to climb?";
  if (completionPercentage < 25) return "You've got this!";
  if (completionPercentage < 50) return "Halfway there!";
  if (completionPercentage < 75) return "Almost at the summit!";
  if (completionPercentage < 100) return "Home stretch!";
  return "Peak reached! 🎉";
}

/**
 * Get zone description based on progress
 */
export function getZoneDescription(completionPercentage: number): {
  name: string;
  emoji: string;
  description: string;
} {
  if (completionPercentage === 0) {
    return {
      name: "Valley",
      emoji: "🌳",
      description: "Your journey starts here"
    };
  }
  if (completionPercentage < 50) {
    return {
      name: "Foothills",
      emoji: "⛰️",
      description: "Climbing steadily upward"
    };
  }
  if (completionPercentage < 100) {
    return {
      name: "Peak",
      emoji: "🏔️",
      description: "The summit awaits!"
    };
  }
  return {
    name: "Summit",
    emoji: "🏆",
    description: "You've reached the peak!"
  };
}
