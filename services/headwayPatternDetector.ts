/**
 * Headway Pattern Detector
 * Detects Everyday English, Listening transcripts, Speaking activities using Oxford patterns
 * Specialized for New Headway Advanced Student's Book formatting
 */

export interface DetectedDialogue {
  type: 'everyday_english' | 'listening_transcript' | 'speaking_pairwork';
  title: string;
  rawText: string;
  confidence: number; // 0-1 scale
  pageRange: { start: number; end: number };
  speakers: string[];
  estimatedTurns: number;
  contextBefore?: string;
}

/**
 * Main patterns for Oxford Headway Advanced format
 */

// Everyday English: "Everyday English: Example title" followed by dialogue
const EVERYDAY_ENGLISH_PATTERN =
  /Everyday\s+English[:\s]*\n?([^\n]+?)\n+((?:(?:Person|Speaker|[A-Z][a-z]+)\s+[A-Z]?:\s+[^\n]+\n?)+)/gi;

// Listening: "Listening" or "Listen to" with transcript
const LISTENING_PATTERN =
  /(?:Listen(?:ing)?(?:\s+to)?|Track\s+\d+)[:\s]*\n?([^\n]+?)\n+((?:(?:Person|Speaker|[A-Z][a-z]+)\s+[A-Z]?:\s+[^\n]+\n?)+)/gi;

// Speaking/Pairwork: "Speaking" or "Pairwork" with role scenarios
const SPEAKING_PATTERN =
  /(?:Speaking|Speak|Pairwork)[:\s]*\n?([^\n]+?)\n+((?:Student\s+[A-Z]|Partner|Person\s+[A-Z]|You):\s+[^\n]+\n?)+/gi;

// Speaker line pattern: "Speaker: text" or "Person A: text" or "Speaker 1: text"
const SPEAKER_PATTERN =
  /^(Person\s+[A-Z]|Speaker\s+\d+|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*:\s*(.+)$/gm;

// Helper pattern to find section boundaries
const SECTION_BOUNDARY = /\n\n(?=(?:Grammar|Vocabulary|Writing|Reading|Unit\s+\d+|Everyday|Listening|Speaking))/i;

/**
 * Detect Everyday English sections
 */
export function detectEverydayEnglish(text: string, pageStart: number): DetectedDialogue[] {
  const dialogues: DetectedDialogue[] = [];
  let match;

  // Reset regex
  EVERYDAY_ENGLISH_PATTERN.lastIndex = 0;

  while ((match = EVERYDAY_ENGLISH_PATTERN.exec(text)) !== null) {
    const title = match[1].trim();
    const dialogueText = match[2];

    if (title && dialogueText && dialogueText.trim().length > 30) {
      const speakers = extractSpeakers(dialogueText);
      const turns = countDialogueTurns(dialogueText);
      const confidence = calculateConfidence(dialogueText, 'everyday');

      // Estimate page range (rough, based on character count)
      const pageOffset = Math.floor(text.substring(0, match.index).split('\n').length / 30);

      dialogues.push({
        type: 'everyday_english',
        title,
        rawText: dialogueText,
        confidence,
        pageRange: {
          start: pageStart + pageOffset,
          end: pageStart + pageOffset + 2
        },
        speakers,
        estimatedTurns: turns
      });
    }
  }

  return dialogues;
}

/**
 * Detect Listening transcript sections
 */
export function detectListeningTranscripts(text: string, pageStart: number): DetectedDialogue[] {
  const dialogues: DetectedDialogue[] = [];
  let match;

  LISTENING_PATTERN.lastIndex = 0;

  while ((match = LISTENING_PATTERN.exec(text)) !== null) {
    const title = match[1].trim();
    const dialogueText = match[2];

    if (title && dialogueText && dialogueText.trim().length > 30) {
      const speakers = extractSpeakers(dialogueText);
      const turns = countDialogueTurns(dialogueText);
      const confidence = calculateConfidence(dialogueText, 'listening');

      const pageOffset = Math.floor(text.substring(0, match.index).split('\n').length / 30);

      dialogues.push({
        type: 'listening_transcript',
        title,
        rawText: dialogueText,
        confidence,
        pageRange: {
          start: pageStart + pageOffset,
          end: pageStart + pageOffset + 2
        },
        speakers,
        estimatedTurns: turns
      });
    }
  }

  return dialogues;
}

/**
 * Detect Speaking/Pairwork sections
 */
export function detectSpeakingActivities(text: string, pageStart: number): DetectedDialogue[] {
  const dialogues: DetectedDialogue[] = [];
  let match;

  SPEAKING_PATTERN.lastIndex = 0;

  while ((match = SPEAKING_PATTERN.exec(text)) !== null) {
    const title = match[1].trim();
    const dialogueText = match[2];

    if (title && dialogueText && dialogueText.trim().length > 30) {
      const speakers = extractSpeakers(dialogueText);
      const turns = countDialogueTurns(dialogueText);
      const confidence = calculateConfidence(dialogueText, 'speaking');

      const pageOffset = Math.floor(text.substring(0, match.index).split('\n').length / 30);

      dialogues.push({
        type: 'speaking_pairwork',
        title,
        rawText: dialogueText,
        confidence,
        pageRange: {
          start: pageStart + pageOffset,
          end: pageStart + pageOffset + 2
        },
        speakers,
        estimatedTurns: turns
      });
    }
  }

  return dialogues;
}

/**
 * Extract all speaker names from dialogue text
 */
function extractSpeakers(text: string): string[] {
  const speakers = new Set<string>();

  const matches = text.matchAll(SPEAKER_PATTERN);
  for (const match of matches) {
    const speaker = match[1].trim();
    if (speaker && speaker.length > 0) {
      speakers.add(speaker);
    }
  }

  // Ensure "You" is included if not found
  if (speakers.size === 0 || !Array.from(speakers).some(s => s.includes('Person') || s.includes('Speaker'))) {
    speakers.add('You');
  }

  return Array.from(speakers);
}

/**
 * Count estimated dialogue turns (speaker changes)
 */
function countDialogueTurns(text: string): number {
  const matches = text.match(SPEAKER_PATTERN) || [];
  return matches.length;
}

/**
 * Calculate confidence score for dialogue quality
 * Based on: speaker count, turn count, length, proper formatting
 */
function calculateConfidence(text: string, type: 'everyday' | 'listening' | 'speaking'): number {
  let score = 0.5; // Base score

  // Speaker count (should be 2-5 speakers)
  const speakers = extractSpeakers(text);
  if (speakers.length >= 2 && speakers.length <= 5) score += 0.15;
  else if (speakers.length >= 1 && speakers.length <= 6) score += 0.08;

  // Turn count (should be 5+ turns)
  const turns = countDialogueTurns(text);
  if (turns >= 5 && turns <= 20) score += 0.15;
  else if (turns >= 3) score += 0.08;

  // Text length (should be substantial)
  const length = text.trim().length;
  if (length >= 150 && length <= 2000) score += 0.1;
  else if (length >= 100) score += 0.05;

  // Type-specific bonuses
  if (type === 'listening' && /transcript/i.test(text)) score += 0.05;
  if (type === 'everyday' && /hello|thanks|please/i.test(text)) score += 0.05;
  if (type === 'speaking' && /student|partner/i.test(text)) score += 0.05;

  // Check for proper formatting (clear speaker markers)
  const wellFormatted = (text.match(SPEAKER_PATTERN) || []).length > 0;
  if (wellFormatted) score += 0.05;

  return Math.min(1, score);
}

/**
 * Detect all dialogue types in a chunk
 */
export function detectAllDialogues(text: string, pageStart: number = 1): DetectedDialogue[] {
  const allDialogues: DetectedDialogue[] = [];

  // Try each detection method
  allDialogues.push(...detectEverydayEnglish(text, pageStart));
  allDialogues.push(...detectListeningTranscripts(text, pageStart));
  allDialogues.push(...detectSpeakingActivities(text, pageStart));

  // Sort by confidence (highest first)
  return allDialogues.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Filter dialogues by confidence threshold
 */
export function filterDialoguesByConfidence(
  dialogues: DetectedDialogue[],
  minConfidence: number = 0.7
): DetectedDialogue[] {
  return dialogues.filter(d => d.confidence >= minConfidence);
}

/**
 * Group dialogues by type
 */
export function groupDialoguesByType(
  dialogues: DetectedDialogue[]
): Record<string, DetectedDialogue[]> {
  return dialogues.reduce(
    (acc, dialogue) => {
      if (!acc[dialogue.type]) acc[dialogue.type] = [];
      acc[dialogue.type].push(dialogue);
      return acc;
    },
    {} as Record<string, DetectedDialogue[]>
  );
}
