/**
 * Audio Tone Generator
 * Generates simple tones using Web Audio API as fallback when sound files are unavailable
 */

/**
 * Generate a simple success tone using Web Audio API
 * Creates a pleasant "ding" sound
 *
 * @param duration - Duration in milliseconds (default 500ms)
 *
 * @internal
 */
export function generateSuccessTone(duration: number = 500): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;

    // Create oscillator for the tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Success tone: C5 (523.25 Hz) - a pleasant high note
    oscillator.frequency.value = 523.25;
    oscillator.type = 'sine';

    // Envelope: quick attack, slow release
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

    oscillator.start(now);
    oscillator.stop(now + duration / 1000);
  } catch (error) {
    console.warn('Failed to generate success tone:', error);
  }
}

/**
 * Generate a celebration tone using Web Audio API
 * Creates an ascending tone sequence
 *
 * @param duration - Duration in milliseconds (default 1000ms)
 *
 * @internal
 */
export function generateCelebrationTone(duration: number = 1000): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;

    // Create two notes for a celebratory sound
    const frequencies = [
      { freq: 523.25, start: 0, duration: 0.3 },      // C5
      { freq: 659.25, start: 0.35, duration: 0.3 },   // E5
      { freq: 783.99, start: 0.7, duration: 0.5 }     // G5
    ];

    frequencies.forEach(({ freq, start, duration: noteDuration }) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, now + start);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + start + noteDuration);

      oscillator.start(now + start);
      oscillator.stop(now + start + noteDuration);
    });
  } catch (error) {
    console.warn('Failed to generate celebration tone:', error);
  }
}
