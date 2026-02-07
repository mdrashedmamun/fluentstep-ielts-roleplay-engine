/**
 * Scenario Parser
 * Parses raw PDF text into structured dialogue, blanks, and answers
 */

export interface ParsedDialogue {
  speaker: string;
  text: string;
}

export interface ParsedAnswer {
  index: number;
  lineIndex: number; // Which dialogue line contains this blank
  blankPosition: number; // Position within the line
  answer: string;
  alternatives: string[];
}

export interface ParsedScenario {
  title: string;
  context: string;
  characters: string[];
  dialogue: ParsedDialogue[];
  answers: ParsedAnswer[];
  rawText: string;
}

/**
 * Extract scenario title (usually prefixed with emoji or "Role-Play"/"Mini-Story")
 */
function extractTitle(text: string): string {
  // Try "Mini-Story X: Title" format
  const miniStoryMatch = text.match(/Mini-Story\s+\d+:\s*([^\n]+)/i);
  if (miniStoryMatch) {
    return miniStoryMatch[1].trim();
  }

  // Try "Role-Play: Title" format
  const roleplayMatch = text.match(/(?:^|\n)([\p{Emoji}]*\s*)?Role-?Play:?\s*([^\n]+)/iu);
  if (roleplayMatch) {
    return roleplayMatch[2].trim();
  }

  // Try emoji + title format
  const emojiTitleMatch = text.match(/[\p{Emoji}]+\s+([^\n]+)/u);
  if (emojiTitleMatch) {
    return emojiTitleMatch[1].trim();
  }

  // Fallback: grab the first line
  const firstLine = text.split('\n')[0].trim();
  return firstLine.length > 5 ? firstLine : 'Untitled Scenario';
}

/**
 * Extract context/description
 */
function extractContext(text: string): string {
  const contextMatch = text.match(/Context\s*[:\n]+([^\n]+)/i);
  if (contextMatch) {
    return contextMatch[1].trim();
  }

  // Look for description before dialogue
  const beforeDialogue = text.split(/\n[A-Z][^:]*:\s/)[0];
  return beforeDialogue.substring(0, 150).trim();
}

/**
 * Extract speaker names from dialogue
 */
function extractCharacters(dialogue: ParsedDialogue[]): string[] {
  const speakers = new Set<string>();
  dialogue.forEach(d => {
    if (d.speaker && d.speaker !== 'You') {
      speakers.add(d.speaker);
    }
  });
  speakers.add('You'); // Always include "You"
  return Array.from(speakers);
}

/**
 * Parse dialogue lines: "Speaker: Text with ________ blanks"
 */
function parseDialogue(text: string): ParsedDialogue[] {
  const dialogue: ParsedDialogue[] = [];

  // Split by speaker patterns: "Speaker:" or emoji + Speaker:
  const lines = text.split(/\n+/);

  for (const line of lines) {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const speaker = match[1].trim();
      const text = match[2].trim();

      // Skip non-dialogue lines
      if (speaker.length > 0 && text.length > 2 && !speaker.includes('Tab') && !speaker.match(/\d+\s*⃣/)) {
        dialogue.push({ speaker, text });
      }
    }
  }

  return dialogue;
}

/**
 * Count blanks in a text and map to answers
 */
function extractBlanks(dialogueLines: string[]): Array<{ lineIndex: number; position: number; blankCount: number }> {
  const blanks: Array<{ lineIndex: number; position: number; blankCount: number }> = [];
  let globalPosition = 0;

  dialogueLines.forEach((line, lineIndex) => {
    const blankMatches = Array.from(line.matchAll(/________/g));
    blankMatches.forEach((match, posInLine) => {
      blanks.push({
        lineIndex,
        position: posInLine,
        blankCount: posInLine + 1
      });
      globalPosition++;
    });
  });

  return blanks;
}

/**
 * Parse answer variations from "Answers" section
 * Format: "1 ⃣ "text" options: • option1 • option2"
 */
function parseAnswers(text: string): ParsedAnswer[] {
  const answers: ParsedAnswer[] = [];
  let answerIndex = 1;

  // Split by numbered patterns: "1 ⃣", "1️⃣", "1.", etc.
  const answerSections = text.split(/\d+\s*[⃣️.•]/);

  for (let i = 1; i < answerSections.length; i++) {
    const section = answerSections[i];
    if (section.trim().length < 2) continue;

    // Extract the primary answer and alternatives
    const lines = section.split('\n');
    let primaryAnswer = '';
    const alternatives: string[] = [];
    let inOptions = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.match(/^[•●●]/)) {
        // This is an option
        const option = trimmed
          .replace(/^[•●]\s*/, '')
          .replace(/\s*–.*$/, '') // Remove explanation
          .trim();

        if (option && option.length > 0) {
          if (!primaryAnswer) {
            primaryAnswer = option;
          } else {
            alternatives.push(option);
          }
        }
        inOptions = true;
      } else if (!inOptions && trimmed.length > 0 && !trimmed.startsWith('(')) {
        // Grab first non-explanation text as primary answer
        const clean = trimmed
          .replace(/.*"([^"]+)".*/g, '$1')
          .replace(/\s*–.*$/, '')
          .trim();
        if (clean && !primaryAnswer) {
          primaryAnswer = clean;
        }
      }
    }

    if (primaryAnswer) {
      answers.push({
        index: answerIndex,
        lineIndex: -1, // Will be mapped later
        blankPosition: -1,
        answer: primaryAnswer,
        alternatives
      });
      answerIndex++;
    }
  }

  return answers;
}

/**
 * Main parsing function
 */
export function parseScenario(text: string): ParsedScenario {
  // Split scenario from answers section
  const answerSectionMatch = text.match(/Answers?[\s:]*([\s\S]*?)(?=\n\n(?:Tab|\d+|Role-|☕|✈|🏨|🛍|👛|👟))/i);
  const scenarioText = text.substring(0, answerSectionMatch?.index ?? text.length);
  const answerText = answerSectionMatch?.[0] ?? '';

  const title = extractTitle(scenarioText);
  const context = extractContext(scenarioText);
  const dialogue = parseDialogue(scenarioText);
  const characters = extractCharacters(dialogue);
  const answers = parseAnswers(answerText);

  return {
    title,
    context,
    characters,
    dialogue,
    answers,
    rawText: text
  };
}

/**
 * Parse multiple scenarios from full PDF text
 */
export function parseAllScenarios(fullText: string): ParsedScenario[] {
  // Split by scenario markers: "Mini-Story", "Role-Play", "Roleplay", emojis+heading
  const scenarioRegex = /(?:[\p{Emoji}]*\s*)?(?:Mini-Story|Role-?Play|Roleplay)[:\s]+[^\n]*\n[\s\S]*?(?=(?:[\p{Emoji}]*\s*)?(?:Mini-Story|Role-?Play|Roleplay|🛒|✈|🏨|🛍|👛|👟):|$)/gu;

  const scenarios: ParsedScenario[] = [];
  let match;

  while ((match = scenarioRegex.exec(fullText)) !== null) {
    const scenarioText = match[0];
    if (scenarioText.trim().length > 50) {
      // Minimum length check to avoid noise
      try {
        const parsed = parseScenario(scenarioText);
        if (parsed.dialogue.length > 0) {
          scenarios.push(parsed);
        }
      } catch (error) {
        console.warn(`Failed to parse scenario: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  return scenarios;
}
