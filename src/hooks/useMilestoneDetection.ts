/**
 * useMilestoneDetection Hook
 * Auto-triggers celebration effects when reaching progress milestones
 * Tracks 25%, 50%, 75%, and 100% completion
 */

import { useEffect, useRef } from 'react';
import { celebrateWithConfetti, celebrate } from '../services/celebrationService';

export interface MilestoneOptions {
  onMilestoneReached?: (milestone: number) => void;
  particleCount?: number;
  spread?: number;
  duration?: number;
}

/**
 * Hook to detect and celebrate milestone achievements
 * Only triggers once per milestone to prevent repeated celebrations
 */
export function useMilestoneDetection(
  completionPercentage: number,
  options: MilestoneOptions = {}
) {
  const {
    onMilestoneReached,
    particleCount = 25,
    spread = 60,
    duration = 2000
  } = options;

  const previousPercentageRef = useRef<number>(0);
  const celebratedMilestonesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    const previousPercentage = previousPercentageRef.current;

    milestones.forEach(milestone => {
      const reachedMilestone =
        completionPercentage >= milestone &&
        previousPercentage < milestone &&
        !celebratedMilestonesRef.current.has(milestone);

      if (reachedMilestone) {
        // Mark this milestone as celebrated
        celebratedMilestonesRef.current.add(milestone);

        // Trigger appropriate celebration
        if (milestone === 100) {
          // Full celebration for summit
          celebrate();
          // Second celebration burst for extra impact
          setTimeout(() => celebrate(), 500);
        } else {
          // Scaled confetti based on milestone importance
          celebrateWithConfetti({
            particleCount: particleCount + (milestone / 4),
            duration,
            spread: spread + (milestone / 10),
            startVelocity: 2 + (milestone / 50)
          });
        }

        // Notify parent component
        onMilestoneReached?.(milestone);
      }
    });

    previousPercentageRef.current = completionPercentage;
  }, [completionPercentage, onMilestoneReached, particleCount, spread, duration]);

  /**
   * Reset milestones if user somehow goes backwards (shouldn't happen in practice)
   */
  useEffect(() => {
    if (completionPercentage === 0) {
      celebratedMilestonesRef.current.clear();
      previousPercentageRef.current = 0;
    }
  }, [completionPercentage]);
}

export default useMilestoneDetection;
