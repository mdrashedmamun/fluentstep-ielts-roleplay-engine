/**
 * LOCKED CHUNKS Matcher Service
 * Enforces pedagogical principle: Bucket A (Universal) >> Bucket B (Topic) >> Novel vocab
 * Target: 80%+ of blanks use LOCKED CHUNKS
 */

import { UNIVERSAL_CHUNKS } from '../constants';

export interface ChunkMatch {
  answer: string;
  bucket: 'A' | 'B' | 'NOVEL';
  source: string;
  confidence: number;
}

export interface ComplianceReport {
  totalBlanks: number;
  chunkMatches: number;
  novelVocab: number;
  complianceScore: number; // 0-100, target 80+
  novelAnswers: string[]; // Flag for manual review
  recommendations: string[];
}

/**
 * Parse LOCKED CHUNKS from constants and organize by bucket
 */
function parseLOCKEDChunks() {
  const bucketA: Set<string> = new Set();
  const bucketB: Set<string> = new Set();

  const lines = UNIVERSAL_CHUNKS.split('\n');
  let currentSection = '';
  let inBucketA = true;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.includes('BUCKET B') || trimmed.includes('Topic-Specific')) {
      inBucketA = false;
      continue;
    }

    // Extract bullet points and phrases
    if (trimmed.startsWith('•') || trimmed.startsWith('●')) {
      const phrase = trimmed
        .replace(/^[•●]\s*/, '')
        .replace(/\s*–.*$/, '') // Remove explanations
        .toLowerCase()
        .trim();

      if (phrase && phrase.length > 1) {
        if (inBucketA) {
          bucketA.add(phrase);
        } else {
          bucketB.add(phrase);
        }
      }
    }

    // Also extract single-word chunks from "word" quoted patterns
    const quoted = trimmed.match(/"([^"]+)"/g);
    if (quoted) {
      quoted.forEach(q => {
        const phrase = q.replace(/"/g, '').toLowerCase().trim();
        if (inBucketA) {
          bucketA.add(phrase);
        } else {
          bucketB.add(phrase);
        }
      });
    }
  }

  return { bucketA, bucketB };
}

/**
 * Attempt to match an answer against LOCKED CHUNKS
 */
export function matchToChunk(answer: string): ChunkMatch {
  const { bucketA, bucketB } = parseLOCKEDChunks();
  const lowerAnswer = answer.toLowerCase().trim();

  // Try exact matches first
  if (bucketA.has(lowerAnswer)) {
    return {
      answer,
      bucket: 'A',
      source: 'Universal chunk (Bucket A)',
      confidence: 1.0
    };
  }

  if (bucketB.has(lowerAnswer)) {
    return {
      answer,
      bucket: 'B',
      source: 'Topic-specific chunk (Bucket B)',
      confidence: 1.0
    };
  }

  // Try substring matches for multi-word phrases
  for (const chunk of bucketA) {
    if (lowerAnswer.includes(chunk) || chunk.includes(lowerAnswer)) {
      return {
        answer,
        bucket: 'A',
        source: `Universal chunk: "${chunk}"`,
        confidence: 0.7
      };
    }
  }

  for (const chunk of bucketB) {
    if (lowerAnswer.includes(chunk) || chunk.includes(lowerAnswer)) {
      return {
        answer,
        bucket: 'B',
        source: `Topic-specific chunk: "${chunk}"`,
        confidence: 0.7
      };
    }
  }

  // Novel vocabulary
  return {
    answer,
    bucket: 'NOVEL',
    source: 'No matching chunk found',
    confidence: 0
  };
}

/**
 * Validate a scenario's answers for LOCKED CHUNKS compliance
 */
export function validateAnswerCompliance(answers: string[]): ComplianceReport {
  const matches = answers.map(ans => matchToChunk(ans));

  const chunkMatches = matches.filter(m => m.bucket !== 'NOVEL').length;
  const novelVocab = matches.filter(m => m.bucket === 'NOVEL').length;
  const complianceScore = Math.round((chunkMatches / answers.length) * 100);

  const novelAnswers = matches
    .filter(m => m.bucket === 'NOVEL')
    .map(m => m.answer);

  const recommendations: string[] = [];
  if (complianceScore < 80) {
    recommendations.push(
      `⚠️ Compliance score is ${complianceScore}%, target is 80%+`
    );
    if (novelAnswers.length > 0) {
      recommendations.push(
        `Consider replacing: ${novelAnswers.slice(0, 3).join(', ')}`
      );
    }
  } else {
    recommendations.push(`✓ Excellent compliance score: ${complianceScore}%`);
  }

  return {
    totalBlanks: answers.length,
    chunkMatches,
    novelVocab,
    complianceScore,
    novelAnswers,
    recommendations
  };
}

/**
 * Generate suggestions for improving answer compliance
 */
export function suggestChunkAlternatives(answer: string): string[] {
  const { bucketA, bucketB } = parseLOCKEDChunks();
  const candidates: string[] = [];

  // Find similar chunks that could replace this answer
  const allChunks = Array.from(bucketA).concat(Array.from(bucketB));

  const answerWords = answer.toLowerCase().split(/\s+/);
  for (const chunk of allChunks) {
    const chunkWords = chunk.split(/\s+/);

    // Check for semantic overlap
    const overlap = answerWords.filter(w => chunk.includes(w)).length;
    if (overlap > 0 && chunk !== answer.toLowerCase()) {
      candidates.push(chunk);
    }
  }

  return candidates.slice(0, 3); // Return top 3 suggestions
}
