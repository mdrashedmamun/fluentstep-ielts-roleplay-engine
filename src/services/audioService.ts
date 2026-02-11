/**
 * Audio Service
 * Provides sound playback and mute state management
 * Pure logic, no UI dependencies
 */

import { SoundId } from '../types/ux-enhancements';
import { generateSuccessTone, generateCelebrationTone } from './audioToneGenerator';

/**
 * Storage key for mute state persistence
 */
const AUDIO_MUTE_KEY = 'fluentstep:audioMuted';

/**
 * Sound file paths
 * Maps sound IDs to their file locations
 */
const SOUND_PATHS: Record<SoundId, string> = {
  completion: '/sounds/completion.mp3',
  celebration: '/sounds/celebration.mp3'
};

/**
 * Cache for loaded audio elements
 * Preloaded audio files for fast playback
 */
const audioCache: Record<SoundId, HTMLAudioElement | null> = {
  completion: null,
  celebration: null
};

/**
 * Get mute state from localStorage
 * Returns true if audio is muted
 *
 * @returns Mute state (true = muted, false = unmuted)
 *
 * @internal
 */
function getMuteStateFromStorage(): boolean {
  try {
    if (typeof localStorage === 'undefined') {
      return false;
    }

    const stored = localStorage.getItem(AUDIO_MUTE_KEY);
    return stored === 'true';
  } catch {
    // localStorage may not be available in some environments
    return false;
  }
}

/**
 * Save mute state to localStorage
 *
 * @param isMuted - Mute state to save
 *
 * @internal
 */
function saveMuteStateToStorage(isMuted: boolean): void {
  try {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(AUDIO_MUTE_KEY, isMuted ? 'true' : 'false');
  } catch {
    // localStorage may not be available in some environments
    // Silently fail
  }
}

/**
 * Get mute state
 * Returns true if audio is currently muted
 *
 * @returns Mute state (true = muted)
 *
 * @example
 * const muted = isMuted();
 * // Returns: false
 */
export function isMuted(): boolean {
  return getMuteStateFromStorage();
}

/**
 * Toggle mute state
 * Switches between muted and unmuted, persists to localStorage
 *
 * @returns New mute state after toggle
 *
 * @example
 * const newMuteState = toggleMute();
 * // Returns: true (now muted)
 */
export function toggleMute(): boolean {
  const currentMuteState = getMuteStateFromStorage();
  const newMuteState = !currentMuteState;
  saveMuteStateToStorage(newMuteState);
  return newMuteState;
}

/**
 * Set mute state
 * Explicitly set muted or unmuted state
 *
 * @param muted - True to mute, false to unmute
 *
 * @example
 * setMuteState(true);
 * // Audio is now muted
 */
export function setMuteState(muted: boolean): void {
  saveMuteStateToStorage(muted);
}

/**
 * Create and cache an audio element
 * Safely creates HTML audio element with error handling
 * Falls back to Web Audio API tone generation if file not found
 *
 * @param soundId - Sound ID to load
 * @returns HTMLAudioElement or null if creation fails
 *
 * @internal
 */
function createAudioElement(soundId: SoundId): HTMLAudioElement | null {
  try {
    const audio = new Audio();
    audio.src = SOUND_PATHS[soundId];
    audio.preload = 'auto';

    // Handle errors gracefully - use tone generator as fallback
    audio.addEventListener('error', () => {
      console.warn(`Failed to load audio file: ${soundId}, will use Web Audio API tone generator`);
    });

    return audio;
  } catch {
    console.warn(`Failed to create audio element for: ${soundId}`);
    return null;
  }
}

/**
 * Play a sound
 * Plays audio if not muted, handles missing files gracefully
 * Falls back to Web Audio API tone generation if audio file unavailable
 *
 * @param soundId - ID of sound to play
 *
 * @example
 * play('completion');
 * // Plays completion sound if not muted
 *
 * @example
 * play('celebration');
 * // Plays celebration sound if not muted
 */
export function play(soundId: SoundId): void {
  // Don't play if muted
  if (isMuted()) {
    return;
  }

  try {
    // Use cached element or create new one
    let audio = audioCache[soundId];

    if (!audio) {
      audio = createAudioElement(soundId);
      if (audio) {
        audioCache[soundId] = audio;
      }
    }

    // Try to play audio if element exists
    if (audio && audio.src) {
      // Reset to beginning and play
      audio.currentTime = 0;
      const playPromise = audio.play();

      // Handle play promise (some browsers require this)
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn(`Failed to play audio ${soundId}, using fallback tone:`, error);
          // Use tone generator as fallback
          useToneFallback(soundId);
        });
      }
    } else {
      // No audio element, use tone generator fallback
      useToneFallback(soundId);
    }
  } catch (error) {
    console.warn(`Error playing audio ${soundId}, using fallback tone:`, error);
    useToneFallback(soundId);
  }
}

/**
 * Use Web Audio API tone generator as fallback
 * Called when audio files are unavailable
 *
 * @param soundId - Sound ID to generate
 *
 * @internal
 */
function useToneFallback(soundId: SoundId): void {
  try {
    switch (soundId) {
      case 'completion':
        generateSuccessTone(500);
        break;
      case 'celebration':
        generateCelebrationTone(1000);
        break;
    }
  } catch (error) {
    console.warn(`Failed to generate fallback tone for ${soundId}:`, error);
  }
}

/**
 * Preload all sounds
 * Loads audio files into cache on app initialization
 * Handles missing files gracefully
 *
 * @example
 * preloadSounds();
 * // Sounds are now cached and ready
 */
export function preloadSounds(): void {
  try {
    for (const soundId of Object.keys(SOUND_PATHS) as SoundId[]) {
      if (!audioCache[soundId]) {
        const audio = createAudioElement(soundId);
        if (audio) {
          audioCache[soundId] = audio;
        }
      }
    }
  } catch (error) {
    console.warn('Error preloading sounds:', error);
  }
}

/**
 * Get audio cache status
 * Returns which sounds are loaded in cache
 *
 * @returns Object showing cache status for each sound
 *
 * @internal
 */
export function getAudioCacheStatus(): Record<SoundId, boolean> {
  return {
    completion: audioCache.completion !== null,
    celebration: audioCache.celebration !== null
  };
}

/**
 * Clear audio cache
 * Removes all cached audio elements
 * Useful for cleanup or memory management
 *
 * @internal
 */
export function clearAudioCache(): void {
  for (const soundId of Object.keys(audioCache) as SoundId[]) {
    if (audioCache[soundId]) {
      audioCache[soundId]?.pause();
      audioCache[soundId] = null;
    }
  }
}

/**
 * Check if Web Audio API is supported
 * Returns true if audio playback is available
 *
 * @returns True if audio is supported in the environment
 *
 * @internal
 */
export function isAudioSupported(): boolean {
  try {
    return typeof Audio !== 'undefined' && typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

// Export service as a single object for functional style
export const audioService = {
  play,
  toggleMute,
  setMuteState,
  isMuted,
  preloadSounds,
  isAudioSupported,
  getAudioCacheStatus,
  clearAudioCache
};
