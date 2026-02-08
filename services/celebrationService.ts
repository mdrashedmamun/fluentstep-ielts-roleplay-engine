import confetti from 'canvas-confetti';

export const celebrationService = {
  // Scenario completion celebration
  scenarioComplete: () => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
      colors: ['#F97316', '#FDBA8C', '#14B8A6', '#5EEAD4']
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  },

  // Badge unlock celebration
  badgeUnlock: () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F97316', '#14B8A6', '#22C55E', '#FDBA8C'],
      ticks: 200,
      scalar: 1.2
    });
  },

  // Milestone celebration (25%, 50%, 75%, 100%)
  milestone: () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#F97316', '#FDBA8C', '#14B8A6']
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#F97316', '#FDBA8C', '#14B8A6']
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    }());
  },

  // Small pop celebration (for individual blank reveals)
  pop: () => {
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#F97316', '#FDBA8C'],
      scalar: 0.8,
      ticks: 100
    });
  }
};
