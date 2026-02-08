/**
 * Adaptive Chunk Validator
 * Adjusts LOCKED_CHUNKS compliance thresholds based on content type
 * Academic content (60-80%), casual (80%+), Advanced C1-C2 (adaptive)
 */

import { UNIVERSAL_CHUNKS } from '../constants';

export interface AdaptiveComplianceConfig {
  contentType: 'everyday_casual' | 'listening_natural' | 'speaking_pairwork' | 'academic_discussion';
  targetCompliance: number; // 60-80% for academic, 80%+ for casual
  allowNovelVocabulary: boolean; // true for C1-C2 Advanced level
  ieltsLevel: 'B2' | 'C1' | 'C2'; // Target proficiency level
}

export interface AdaptiveComplianceReport {
  totalAnswers: number;
  chunkMatches: number;
  novelVocab: number;
  complianceScore: number; // 0-100
  passesAdaptiveThreshold: boolean;
  recommendations: string[];
  novelAnswers: string[];
}

/**
 * Predefined compliance thresholds by content type
 */
const COMPLIANCE_THRESHOLDS: Record<string, number> = {
  everyday_casual: 80, // Conversational should closely match LOCKED_CHUNKS
  listening_natural: 70, // Natural speech allows more variation
  speaking_pairwork: 65, // Pairwork activities often have contextual vocabulary
  academic_discussion: 60 // Advanced discussions expect sophisticated vocabulary
};

/**
 * Parse LOCKED_CHUNKS to build lookup maps
 */
function buildChunkMaps() {
  const bucketA = new Set<string>();
  const bucketB = new Set<string>();
  const allChunks = new Set<string>();

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
        allChunks.add(phrase);
        if (inBucketA) bucketA.add(phrase);
        else bucketB.add(phrase);
      }
    }

    const quoted = trimmed.match(/"([^"]+)"/g);
    if (quoted) {
      quoted.forEach(q => {
        const phrase = q.replace(/"/g, '').toLowerCase().trim();
        allChunks.add(phrase);
        if (inBucketA) bucketA.add(phrase);
        else bucketB.add(phrase);
      });
    }
  }

  return { bucketA, bucketB, allChunks };
}

/**
 * Check if an answer matches LOCKED_CHUNKS with tolerance for C1-C2 vocabulary
 */
function matchesChunk(
  answer: string,
  bucketA: Set<string>,
  bucketB: Set<string>,
  allChunks: Set<string>,
  ieltsLevel: 'B2' | 'C1' | 'C2'
): { matched: boolean; bucket: 'A' | 'B' | 'NOVEL' } {
  const lower = answer.toLowerCase().trim();

  // Direct match
  if (allChunks.has(lower)) {
    if (bucketA.has(lower)) return { matched: true, bucket: 'A' };
    return { matched: true, bucket: 'B' };
  }

  // Substring matching (higher tolerance for C1-C2)
  for (const chunk of allChunks) {
    if (lower.includes(chunk) || chunk.includes(lower)) {
      if (bucketA.has(chunk)) return { matched: true, bucket: 'A' };
      return { matched: true, bucket: 'B' };
    }
  }

  // For C1-C2, check for phrasal verbs and complex expressions
  if (ieltsLevel >= 'C1') {
    // Check for phrasal verb patterns
    if (/\b(?:get|put|take|come|go|look|bring|turn|run|give|set|hold|keep|let|make|play|break|point|work|figure|iron|turn|show|bring|deal)\s+(?:up|down|off|out|in|on|over|back|about|by|for|from|to|with|through)\b/i.test(
      lower
    )) {
      return { matched: true, bucket: 'NOVEL' };
    }
  }

  return { matched: false, bucket: 'NOVEL' };
}

/**
 * Validate answers with adaptive compliance thresholds
 */
export function validateWithAdaptiveCompliance(
  answers: string[],
  config: AdaptiveComplianceConfig
): AdaptiveComplianceReport {
  const { bucketA, bucketB, allChunks } = buildChunkMaps();
  const targetThreshold = config.targetCompliance || COMPLIANCE_THRESHOLDS[config.contentType];

  let chunkMatches = 0;
  const novelAnswers: string[] = [];

  for (const answer of answers) {
    const { matched, bucket } = matchesChunk(answer, bucketA, bucketB, allChunks, config.ieltsLevel);

    if (matched) {
      chunkMatches++;
    } else {
      novelAnswers.push(answer);
    }
  }

  const complianceScore = answers.length > 0 ? Math.round((chunkMatches / answers.length) * 100) : 0;
  const novelVocab = answers.length - chunkMatches;

  // Determine if it passes adaptive threshold
  let passesAdaptiveThreshold = complianceScore >= targetThreshold;

  // For C1-C2 content, allow more flexibility if contextually appropriate
  if (config.allowNovelVocabulary && config.ieltsLevel >= 'C1') {
    // Accept if novel vocabulary is sophisticated (longer words, complex structures)
    const novelSophistication = novelAnswers.filter(
      a => a.split(/\s+/).length >= 2 || a.length > 15
    ).length;

    if (novelSophistication / (novelAnswers.length || 1) > 0.7) {
      passesAdaptiveThreshold = true;
    }
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (!passesAdaptiveThreshold) {
    recommendations.push(
      `⚠️ Compliance below target (${complianceScore}% vs ${targetThreshold}% target)`
    );

    if (novelAnswers.length > 0) {
      recommendations.push(`Consider replacing novel vocab: ${novelAnswers.slice(0, 3).join(', ')}`);
    }
  } else {
    if (config.contentType === 'academic_discussion' || config.contentType === 'speaking_pairwork') {
      recommendations.push('✓ Excellent compliance for advanced content');
    } else {
      recommendations.push('✓ Strong LOCKED_CHUNKS alignment');
    }
  }

  // Add contextual recommendations
  if (config.ieltsLevel === 'C2' && novelAnswers.length > 0) {
    recommendations.push(
      '💡 C2-level novel vocabulary expected; ensure answers demonstrate sophisticated English'
    );
  }

  return {
    totalAnswers: answers.length,
    chunkMatches,
    novelVocab,
    complianceScore,
    passesAdaptiveThreshold,
    recommendations,
    novelAnswers
  };
}

/**
 * Get adaptive threshold for content type
 */
export function getAdaptiveThreshold(contentType: string): number {
  return COMPLIANCE_THRESHOLDS[contentType] || 70;
}

/**
 * Suggest content type based on dialogue characteristics
 */
export function suggestContentType(
  speakers: string[],
  dialogue: Array<{ speaker: string; text: string }>
): string {
  const text = dialogue.map(d => d.text).join(' ').toLowerCase();
  const speakerCount = speakers.length;
  const avgTurnLength = dialogue.length > 0
    ? dialogue.reduce((sum, d) => sum + d.text.length, 0) / dialogue.length
    : 0;

  // Academic/professional: formal tone, complex sentences, specific vocabulary
  if (/professional|meeting|project|report|negotiat|complex|discuss|philosophical/i.test(text)) {
    return 'academic_discussion';
  }

  // Listening/Natural: transcripts, casual, conversational
  if (/listen|transcript|audio|casual|hello|thanks|friend|flatmate/i.test(text)) {
    return speakerCount > 3 ? 'listening_natural' : 'everyday_casual';
  }

  // Speaking/Pairwork: role-play, scenario-based
  if (/pairwork|speaking|role|student|partner|task/i.test(text)) {
    return 'speaking_pairwork';
  }

  // Default based on characteristics
  if (avgTurnLength > 100) return 'academic_discussion';
  if (speakerCount >= 3) return 'listening_natural';
  if (speakerCount === 2) return 'everyday_casual';

  return 'speaking_pairwork';
}

/**
 * Create config for a specific scenario
 */
export function createConfigForScenario(
  contentType: string,
  ieltsLevel: 'B2' | 'C1' | 'C2' = 'C1'
): AdaptiveComplianceConfig {
  const suggestedType = contentType as
    | 'everyday_casual'
    | 'listening_natural'
    | 'speaking_pairwork'
    | 'academic_discussion';

  return {
    contentType: suggestedType,
    targetCompliance: COMPLIANCE_THRESHOLDS[suggestedType],
    allowNovelVocabulary: ieltsLevel >= 'C1',
    ieltsLevel
  };
}
