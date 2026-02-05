
/**
 * Utility for Web Speech API synthesis with en-GB focus.
 */

export interface SpeechOptions {
    rate?: number;
    pitch?: number;
    volume?: number;
    onEnd?: () => void;
}

export const speakText = (text: string, options: SpeechOptions = {}) => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (options.onEnd) utterance.onend = options.onEnd;

    // Try to find a high-quality British voice
    const voices = window.speechSynthesis.getVoices();
    const britishVoice = voices.find(v => v.lang === 'en-GB' && (v.name.includes('Daniel') || v.name.includes('Serena')))
        || voices.find(v => v.lang === 'en-GB')
        || voices.find(v => v.lang.startsWith('en'));

    if (britishVoice) {
        utterance.voice = britishVoice;
    }

    utterance.rate = options.rate || 0.9; // Slightly slower for clarity
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    window.speechSynthesis.speak(utterance);
};

// Pre-load voices (some browsers need this)
if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
}
