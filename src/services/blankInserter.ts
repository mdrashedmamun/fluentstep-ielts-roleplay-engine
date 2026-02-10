/**
 * Intelligent Blank Inserter
 * Converts natural dialogue to fill-in-the-blank format targeting LOCKED_CHUNKS
 * Strategy: Match against UNIVERSAL_CHUNKS, prioritize BUCKET_A, then BUCKET_B
 */

import { UNIVERSAL_CHUNKS } from '../constants';

export interface BlankInsertionResult {
  dialogue: Array<{ speaker: string; text: string }>;
  answers: Array<{ index: number; answer: string; alternatives: string[] }>;
  chunkComplianceScore: number;
  blanksInserted: number;
  chunkMatches: { bucketA: number; bucketB: number; novel: number };
}

export interface ScoredPhrase {
  phrase: string;
  score: number;
  bucket: 'A' | 'B' | 'NOVEL';
  lineIndex: number;
  speakerIndex: number;
  startPos: number;
  endPos: number;
}

/**
 * Parse LOCKED_CHUNKS to create lookup maps
 */
function buildChunkMaps() {
  const bucketA = new Set<string>();
  const bucketB = new Set<string>();

  const lines = UNIVERSAL_CHUNKS.split('\n');
  let inBucketA = true;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.includes('BUCKET B') || trimmed.includes('Topic-Specific')) {
      inBucketA = false;
      continue;
    }

    if (trimmed.startsWith('•') || trimmed.startsWith('●')) {
      const phrase = trimmed
        .replace(/^[•●]\s*/, '')
        .replace(/\s*–.*$/, '')
        .toLowerCase()
        .trim();

      if (phrase && phrase.length > 1) {
        if (inBucketA) bucketA.add(phrase);
        else bucketB.add(phrase);
      }
    }

    const quoted = trimmed.match(/"([^"]+)"/g);
    if (quoted) {
      quoted.forEach(q => {
        const phrase = q.replace(/"/g, '').toLowerCase().trim();
        if (inBucketA) bucketA.add(phrase);
        else bucketB.add(phrase);
      });
    }
  }

  return { bucketA, bucketB };
}

/**
 * Score a phrase for blank suitability (0-100 scale)
 * Factors: LOCKED_CHUNKS match, length, phrasal verbs, idioms
 */
function scorePhraseForBlank(
  phrase: string,
  bucketA: Set<string>,
  bucketB: Set<string>
): { score: number; bucket: 'A' | 'B' | 'NOVEL' } {
  const lower = phrase.toLowerCase().trim();
  let score = 0;
  let bucket: 'A' | 'B' | 'NOVEL' = 'NOVEL';

  // Check if in BUCKET A (universal chunks)
  if (bucketA.has(lower)) {
    score += 50;
    bucket = 'A';
  } else {
    // Try substring matching for multi-word chunks
    for (const chunk of bucketA) {
      if (lower.includes(chunk) || chunk.includes(lower)) {
        score += 35;
        bucket = 'A';
        break;
      }
    }
  }

  // Check if in BUCKET B (topic-specific)
  if (bucket === 'NOVEL' && bucketB.has(lower)) {
    score += 30;
    bucket = 'B';
  } else if (bucket === 'NOVEL') {
    for (const chunk of bucketB) {
      if (lower.includes(chunk) || chunk.includes(lower)) {
        score += 20;
        bucket = 'B';
        break;
      }
    }
  }

  // Bonus for phrasal verbs (contains space + verb pattern)
  if (/\b(?:get|put|take|come|go|look|bring|turn|run|give|set|hold|keep|let|make|play|break)\s+(?:up|down|off|out|in|on|over|back|about|by|for|from|to|with)\b/i.test(
    lower
  )) {
    score += 15;
  }

  // Bonus for idioms/expressions (2-4 words)
  const wordCount = lower.split(/\s+/).length;
  if (wordCount >= 2 && wordCount <= 4) {
    score += 10;
  }

  // Check for optimal length (not too short, not too long)
  if (lower.length >= 5 && lower.length <= 40) {
    score += 5;
  }

  // Penalize for articles/prepositions alone
  if (/^(a|an|the|in|on|at|by|to|for|with|and|or|but|is|are|was|were)$/i.test(lower)) {
    score = Math.max(0, score - 30);
  }

  return { score: Math.min(100, Math.max(0, score)), bucket };
}

/**
 * Extract candidate phrases from dialogue lines
 * Returns phrases that could be good blanks with their positions
 */
function extractCandidatePhrases(
  dialogue: Array<{ speaker: string; text: string }>,
  bucketA: Set<string>,
  bucketB: Set<string>
): ScoredPhrase[] {
  const candidates: ScoredPhrase[] = [];

  // Simple approach: split by common delimiters and score all meaningful segments
  dialogue.forEach((line, lineIndex) => {
    const text = line.text;

    // Split on common punctuation but preserve phrases
    const phrases = text.split(/[.,;!?]/);

    let charPos = 0;
    for (let i = 0; i < phrases.length; i++) {
      const phrase = phrases[i]!.trim();
      const startPos = charPos;
      const endPos = startPos + phrase.length;

      if (phrase.length > 0) {
        const { score, bucket } = scorePhraseForBlank(phrase, bucketA, bucketB);

        // Only consider phrases with some value
        if (score > 0) {
          candidates.push({
            phrase,
            score,
            bucket,
            lineIndex,
            speakerIndex: dialogue.findIndex((l, idx) => idx === lineIndex),
            startPos,
            endPos
          });
        }
      }

      charPos = endPos + 1; // Account for delimiter
    }

    // Also look for phrases between different punctuation/word boundaries
    // Extract multi-word expressions (2-4 words)
    const wordMatches = text.matchAll(/\b(\w+(?:\s+\w+){1,3})\b/g);
    for (const match of wordMatches) {
      const phrase = match[0]!.trim();
      if (phrase.length > 3) {
        const { score, bucket } = scorePhraseForBlank(phrase, bucketA, bucketB);
        if (score > 5) {
          candidates.push({
            phrase,
            score,
            bucket,
            lineIndex,
            speakerIndex: dialogue.findIndex((l, idx) => idx === lineIndex),
            startPos: (match.index || 0),
            endPos: (match.index || 0) + phrase.length
          });
        }
      }
    }
  });

  // Deduplicate and sort by score
  const deduped = new Map<string, ScoredPhrase>();
  for (const candidate of candidates) {
    const key = candidate.phrase.toLowerCase();
    if (!deduped.has(key) || (deduped.get(key)?.score ?? 0) < candidate.score) {
      deduped.set(key, candidate);
    }
  }

  return Array.from(deduped.values()).sort((a, b) => b.score - a.score);
}

/**
 * Insert blanks intelligently into dialogue
 * Strategy:
 * 1. Extract candidate phrases from dialogue
 * 2. Score each phrase (BUCKET_A priority > BUCKET_B > novel)
 * 3. Select top-scoring phrases up to targetBlanks
 * 4. Replace in dialogue and create answer variations
 */
export function insertBlanksIntelligently(
  dialogue: Array<{ speaker: string; text: string }>,
  targetBlanks: number = 12
): BlankInsertionResult {
  const { bucketA, bucketB } = buildChunkMaps();

  // Extract and score all candidates
  const candidates = extractCandidatePhrases(dialogue, bucketA, bucketB);

  // Select top blanks with priority to BUCKET_A, then BUCKET_B
  const bucketABlanks = candidates.filter(c => c.bucket === 'A').slice(0, Math.ceil(targetBlanks * 0.6));
  const bucketBBlanks = candidates.filter(c => c.bucket === 'B').slice(0, Math.ceil(targetBlanks * 0.3));
  const novelBlanks = candidates.filter(c => c.bucket === 'NOVEL').slice(0, targetBlanks - bucketABlanks.length - bucketBBlanks.length);

  const selectedBlanks = [...bucketABlanks, ...bucketBBlanks, ...novelBlanks]!.slice(0, targetBlanks);

  // Sort selected blanks by position in dialogue (to maintain order)
  selectedBlanks.sort((a, b) => {
    if (a.lineIndex !== b.lineIndex) return a.lineIndex - b.lineIndex;
    return a.startPos - b.startPos;
  });

  // Create modified dialogue with blanks
  const modifiedDialogue = JSON.parse(JSON.stringify(dialogue)) as Array<{ speaker: string; text: string }>;
  const answers: Array<{ index: number; answer: string; alternatives: string[] }> = [];

  // Track which phrases we've already blanked to avoid duplicates
  const blankPhrases = new Set<string>();

  for (let i = 0; i < selectedBlanks.length; i++) {
    const blank = selectedBlanks[i];
    const key = blank.phrase.toLowerCase();

    // Skip if we've already blanked this phrase
    if (blankPhrases.has(key)) continue;
    blankPhrases.add(key);

    const lineIndex = blank.lineIndex;
    const originalText = modifiedDialogue[lineIndex]!.text;

    // Replace the phrase with a blank marker (escaped for use in strings)
    const replacement = '________';
    const newText = originalText.replace(new RegExp(`\\b${escapeRegex(blank.phrase)}\\b`, 'i'), replacement);

    if (newText !== originalText) {
      modifiedDialogue[lineIndex]!.text = newText;

      // Create answer entry
      answers.push({
        index: answers.length + 1,
        answer: blank.phrase,
        alternatives: [blank.phrase] // Could expand with synonyms later
      });
    }
  }

  // Calculate compliance score
  const bucketACount = selectedBlanks.filter(b => b.bucket === 'A').length;
  const bucketBCount = selectedBlanks.filter(b => b.bucket === 'B').length;
  const novelCount = selectedBlanks.filter(b => b.bucket === 'NOVEL').length;
  const totalBlanks = answers.length;

  const chunkComplianceScore =
    totalBlanks > 0
      ? Math.round(((bucketACount * 1.0 + bucketBCount * 0.7) / totalBlanks) * 100)
      : 0;

  return {
    dialogue: modifiedDialogue,
    answers,
    chunkComplianceScore,
    blanksInserted: answers.length,
    chunkMatches: {
      bucketA: bucketACount,
      bucketB: bucketBCount,
      novel: novelCount
    }
  };
}

/**
 * Escape regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Simple scoring function for quick evaluation
 */
export function quickScoreDialogue(dialogue: Array<{ speaker: string; text: string }>): number {
  const text = dialogue.map(d => d.text).join(' ');
  const wordCount = text.split(/\s+/).length;
  const speakerCount = new Set(dialogue.map(d => d.speaker)).size;
  const turnCount = dialogue.length;

  let score = 0;
  if (wordCount >= 50 && wordCount <= 500) score += 30;
  else if (wordCount >= 30) score += 15;

  if (speakerCount >= 2 && speakerCount <= 5) score += 35;
  else if (speakerCount >= 1) score += 15;

  if (turnCount >= 5 && turnCount <= 20) score += 35;
  else if (turnCount >= 3) score += 15;

  return Math.min(100, score);
}
