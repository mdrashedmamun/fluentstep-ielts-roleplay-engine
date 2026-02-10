/**
 * Celebration Service
 * Handles celebratory effects like confetti and animations
 */

export interface ConfettiOptions {
  particleCount?: number;
  duration?: number;
  colors?: string[];
  spread?: number;
  startVelocity?: number;
}

/**
 * Trigger confetti celebration
 */
export function celebrateWithConfetti(options: ConfettiOptions = {}): void {
  const {
    particleCount = 30,
    duration = 2000,
    colors = ['#F97316', '#14B8A6', '#22C55E'],
    spread = 60,
    startVelocity = 3
  } = options;

  // Only run if DOM is ready
  if (typeof document === 'undefined') return;

  const particles: HTMLElement[] = [];

  // Create confetti particles
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 4; // 4-12px
    const angle = (Math.random() * spread) - (spread / 2);
    const velocity = (Math.random() * startVelocity) + (startVelocity / 2);

    particle.style.cssText = `
      position: fixed;
      left: 50%;
      top: 50%;
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border-radius: 50%;
      opacity: 1;
      pointer-events: none;
      z-index: 9999;
      --angle: ${angle}deg;
      --velocity: ${velocity};
    `;

    document.body.appendChild(particle);
    particles.push(particle);
  }

  // Animate particles
  const startTime = performance.now();
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = elapsed / duration;

    particles.forEach((particle, idx) => {
      if (progress >= 1) {
        particle.remove();
        return;
      }

      const angle = parseFloat(getComputedStyle(particle).getPropertyValue('--angle')) as any;
      const velocity = parseFloat(getComputedStyle(particle).getPropertyValue('--velocity')) as any;

      // Calculate position
      const radians = (angle * Math.PI) / 180;
      const distance = velocity * 100 * progress;
      const x = Math.cos(radians) * distance;
      const y = Math.sin(radians) * distance + (progress * progress * 200); // Gravity effect

      // Update position and opacity
      particle.style.transform = `translate(${x}px, ${y}px)`;
      particle.style.opacity = String(Math.max(0, 1 - progress));
    });

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Cleanup
      particles.forEach(p => {
        try {
          p.remove();
        } catch (e) {
          // Particle already removed
        }
      });
    }
  };

  requestAnimationFrame(animate);
}

/**
 * Play celebration sound (optional)
 */
export function playSuccessSound(): void {
  try {
    // Use Web Audio API for a simple success tone
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;

    // Create oscillator for a pleasant chime
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    // Pleasant chime frequency (C5: 523.25 Hz)
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // Ramp to E5

    // Short, pleasant envelope
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch (error) {
    // Web Audio API not available, silently fail
    // console.warn('Web Audio API not available');
  }
}

/**
 * Trigger full celebration (confetti + sound + visual feedback)
 */
export function celebrate(): void {
  celebrateWithConfetti({
    particleCount: 30,
    duration: 2000,
    colors: ['#F97316', '#14B8A6', '#22C55E'],
    spread: 75,
    startVelocity: 4
  });

  // Play sound with slight delay for better UX
  setTimeout(() => {
    playSuccessSound();
  }, 200);
}

/**
 * Create particle effect at specific coordinates
 */
export function particleEffect(
  x: number,
  y: number,
  options: ConfettiOptions = {}
): void {
  const {
    particleCount = 20,
    duration = 1500,
    colors = ['#F97316', '#14B8A6'],
    spread = 45,
    startVelocity = 2
  } = options;

  if (typeof document === 'undefined') return;

  const particles: HTMLElement[] = [];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 6 + 2; // 2-8px
    const angle = (Math.random() * spread) - (spread / 2);
    const velocity = (Math.random() * startVelocity) + (startVelocity / 2);

    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border-radius: 50%;
      opacity: 1;
      pointer-events: none;
      z-index: 9999;
      --angle: ${angle}deg;
      --velocity: ${velocity};
    `;

    document.body.appendChild(particle);
    particles.push(particle);
  }

  const startTime = performance.now();
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = elapsed / duration;

    particles.forEach(particle => {
      if (progress >= 1) {
        particle.remove();
        return;
      }

      const angle = parseFloat(getComputedStyle(particle).getPropertyValue('--angle')) as any;
      const velocity = parseFloat(getComputedStyle(particle).getPropertyValue('--velocity')) as any;

      const radians = (angle * Math.PI) / 180;
      const distance = velocity * 100 * progress;
      const moveX = Math.cos(radians) * distance;
      const moveY = Math.sin(radians) * distance + (progress * progress * 150);

      particle.style.transform = `translate(${moveX}px, ${moveY}px)`;
      particle.style.opacity = String(Math.max(0, 1 - progress));
    });

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      particles.forEach(p => {
        try {
          p.remove();
        } catch (e) {
          // Already removed
        }
      });
    }
  };

  requestAnimationFrame(animate);
}
