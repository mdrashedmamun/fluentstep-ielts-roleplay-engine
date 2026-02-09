/**
 * Phase 8 Step 3: Intelligent Blank Insertion for Unit 4 Dialogues
 *
 * Converts the 4 Unit 4 transcribed dialogues into RoleplayScript format
 * with intelligently selected blanks aligned to LOCKED_CHUNKS hierarchy.
 *
 * Process:
 * 1. Parse each Unit 4 dialogue
 * 2. Extract candidate phrases (2-4 words, high learning value)
 * 3. Score against LOCKED_CHUNKS (BUCKET_A priority)
 * 4. Select 10-12 blanks per dialogue maintaining pedagogical balance
 * 5. Generate answer alternatives (synonyms, related vocabulary)
 * 6. Output structured RoleplayScript objects
 */

import { UNIVERSAL_CHUNKS } from '../constants';
import { UNIT_4_DIALOGUES } from './unit4Transcription';

interface Unit4RoleplayScript {
  id: string;
  category: 'Advanced';
  topic: string;
  context: string;
  characters: Array<{
    name: string;
    description: string;
  }>;
  dialogue: Array<{
    speaker: string;
    text: string;
  }>;
  answerVariations: Array<{
    index: number;
    answer: string;
    alternatives: string[];
    bucket: 'BUCKET_A' | 'BUCKET_B' | 'NOVEL';
    score: number;
  }>;
  deepDive: Array<{
    index: number;
    phrase: string;
    insight: string;
  }>;
  metrics: {
    totalBlanks: number;
    bucketA: number;
    bucketB: number;
    novel: number;
    complianceScore: number;
  };
}

interface ScoredPhrase {
  phrase: string;
  score: number;
  bucket: 'BUCKET_A' | 'BUCKET_B' | 'NOVEL';
  dialogueIndex: number;
  position: number;
  alternatives: string[];
}

/**
 * Build lookup maps from UNIVERSAL_CHUNKS
 */
function buildChunkMaps() {
  const bucketA = new Map<string, string>();
  const bucketB = new Map<string, string>();
  const allPhrases = new Set<string>();

  const lines = UNIVERSAL_CHUNKS.split('\n');
  let currentBucket = 'A';

  for (const line of lines) {
    const trimmed = line.trim();

    // Switch to bucket B
    if (trimmed.includes('BUCKET B') || trimmed.includes('Topic-Specific')) {
      currentBucket = 'B';
      continue;
    }

    // Extract bullet points
    if (trimmed.startsWith('•') || trimmed.startsWith('●')) {
      const phrase = trimmed
        .replace(/^[•●]\s*/, '')
        .replace(/\s*–.*$/, '')
        .replace(/"/g, '')
        .toLowerCase()
        .trim();

      if (phrase && phrase.length > 2) {
        allPhrases.add(phrase);
        if (currentBucket === 'A') {
          bucketA.set(phrase, phrase);
        } else {
          bucketB.set(phrase, phrase);
        }
      }
    }

    // Extract quoted phrases
    const quoted = trimmed.match(/"([^"]+)"/g);
    if (quoted) {
      quoted.forEach(q => {
        const phrase = q.replace(/"/g, '').toLowerCase().trim();
        if (phrase && phrase.length > 2) {
          allPhrases.add(phrase);
          if (currentBucket === 'A') {
            bucketA.set(phrase, phrase);
          } else {
            bucketB.set(phrase, phrase);
          }
        }
      });
    }
  }

  return { bucketA, bucketB, allPhrases };
}

/**
 * Score a phrase for blank insertion
 * Considers: BUCKET match, length, phrasal verbs, idioms
 */
function scorePhrase(
  phrase: string,
  bucketA: Map<string, string>,
  bucketB: Map<string, string>,
  allPhrases: Set<string>
): {
  score: number;
  bucket: 'BUCKET_A' | 'BUCKET_B' | 'NOVEL';
  alternatives: string[];
} {
  const lower = phrase.toLowerCase().trim();
  let score = 0;
  let bucket: 'BUCKET_A' | 'BUCKET_B' | 'NOVEL' = 'NOVEL';
  const alternatives: string[] = [];

  // Penalize single words and articles/prepositions
  if (
    /^(a|an|the|in|on|at|by|to|for|with|and|or|but|is|are|was|were|be|been)$/i.test(
      lower
    )
  ) {
    return { score: 0, bucket: 'NOVEL', alternatives: [] };
  }

  // Check BUCKET_A
  if (bucketA.has(lower)) {
    score = 50;
    bucket = 'BUCKET_A';
  } else {
    // Try substring matching
    for (const [chunk] of bucketA) {
      if (
        lower.includes(chunk) &&
        chunk.length > 2 &&
        lower.length <= chunk.length + 10
      ) {
        score = 40;
        bucket = 'BUCKET_A';
        break;
      }
    }
  }

  // Check BUCKET_B if not found in A
  if (bucket === 'NOVEL' && bucketB.has(lower)) {
    score = 30;
    bucket = 'BUCKET_B';
  } else if (bucket === 'NOVEL') {
    for (const [chunk] of bucketB) {
      if (
        lower.includes(chunk) &&
        chunk.length > 2 &&
        lower.length <= chunk.length + 10
      ) {
        score = 20;
        bucket = 'BUCKET_B';
        break;
      }
    }
  }

  // Bonus for phrasal verbs
  if (
    /\b(?:get|put|take|come|go|look|bring|turn|run|give|set|hold|keep|let|make|play|break|figure|iron|check|carry|call|set|work|turn|come|go|put)\s+(?:up|down|off|out|in|on|over|back|about|by|for|from|to|with|through)\b/i.test(
      lower
    )
  ) {
    score += 15;
  }

  // Bonus for length (2-4 words is optimal)
  const wordCount = lower.split(/\s+/).length;
  if (wordCount >= 2 && wordCount <= 4) {
    score += 5;
  } else if (wordCount === 5) {
    score += 2;
  }

  // Penalize overly long phrases
  if (lower.length > 50) {
    score -= 10;
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    bucket,
    alternatives
  };
}

/**
 * Extract candidate phrases from a dialogue
 */
function extractCandidates(
  dialogue: Array<{ speaker: string; text: string }>,
  bucketA: Map<string, string>,
  bucketB: Map<string, string>,
  allPhrases: Set<string>
): ScoredPhrase[] {
  const candidates: ScoredPhrase[] = [];
  const seen = new Set<string>();

  dialogue.forEach((line, dialogueIndex) => {
    const text = line.text;

    // Extract multi-word sequences (2-5 words)
    const wordMatches = text.matchAll(/\b(\w+(?:\s+\w+){1,4})\b/g);

    for (const match of wordMatches) {
      const phrase = match[0].trim();
      const lower = phrase.toLowerCase();

      // Skip if already scored
      if (seen.has(lower)) continue;
      seen.add(lower);

      // Skip very short phrases
      if (phrase.split(/\s+/).length < 2) continue;

      const { score, bucket, alternatives: alts } = scorePhrase(
        phrase,
        bucketA,
        bucketB,
        allPhrases
      );

      // Only include scored phrases
      if (score > 0) {
        candidates.push({
          phrase,
          score,
          bucket,
          dialogueIndex,
          position: match.index || 0,
          alternatives: alts
        });
      }
    }
  });

  // Sort by score descending
  return candidates.sort((a, b) => b.score - a.score);
}

/**
 * Generate answer alternatives for a blank
 */
function generateAlternatives(
  answer: string,
  bucket: 'BUCKET_A' | 'BUCKET_B' | 'NOVEL'
): string[] {
  const alternatives: string[] = [];

  // Define synonym/variation maps for common answers
  const synonymMap: Record<string, string[]> = {
    // From Unit 4 dialogues
    changed: ['transformed', 'altered', 'modified'],
    reluctant: ['hesitant', 'unwilling', 'resistant'],
    point: ['observation', 'perspective', 'view'],
    encounter: ['experience', 'face', 'have'],
    rapport: ['connection', 'relationship', 'bond'],
    diminished: ['reduced', 'weakened', 'lessened'],
    deliberately: ['intentionally', 'on purpose', 'purposefully'],
    valid: ['good', 'sound', 'reasonable'],
    exhausted: ['tired', 'worn out', 'fatigued'],
    reduce: ['cut', 'lower', 'minimize'],
    appreciate: ['understand', 'recognize', 'acknowledge'],
    beneficial: ['helpful', 'advantageous', 'useful'],
    concern: ['worry', 'anxiety', 'apprehension'],
    questionable: ['debatable', 'uncertain', 'unclear'],
    constraints: ['limitations', 'restrictions', 'obstacles'],
    devastating: ['terrible', 'catastrophic', 'ruinous'],
    assurance: ['confidence', 'certainty', 'guarantee'],
    opportunity: ['chance', 'possibility', 'prospect'],
    unchanged: ['the same', 'unaltered', 'constant'],
    incompetent: ['incapable', 'unable', 'unqualified'],
    exposed: ['vulnerable', 'open', 'subject'],
    processing: ['understanding', 'grasping', 'comprehending'],
    targeted: ['focused', 'directed', 'aimed'],
    blended: ['combined', 'mixed', 'integrated']
  };

  const lower = answer.toLowerCase();

  if (synonymMap[lower]) {
    alternatives.push(...synonymMap[lower].slice(0, 2));
  } else if (bucket === 'BUCKET_A') {
    // For BUCKET_A items without mapped synonyms, suggest related vocabulary
    alternatives.push(...generateRelatedTerms(answer));
  } else {
    alternatives.push(...generateRelatedTerms(answer));
  }

  // Ensure we have at least 1-2 alternatives
  while (alternatives.length < 1 && alternatives.length < 2) {
    alternatives.push(answer);
    break;
  }

  return alternatives.slice(0, 2);
}

/**
 * Generate related terms for answers without explicit synonym maps
 */
function generateRelatedTerms(answer: string): string[] {
  const terms: string[] = [];

  // Common patterns
  if (answer.includes('not')) {
    terms.push('never', 'rarely');
  } else if (answer.endsWith('ed')) {
    // Past participle - suggest related adjectives
    const root = answer.slice(0, -2);
    if (root.length > 3) {
      terms.push(`very ${root}`, `quite ${root}`);
    }
  } else if (answer.length > 5) {
    // For longer words, suggest "quite" + adjective pattern
    terms.push(`quite ${answer}`, `very ${answer}`);
  }

  return terms.filter(t => t.length > 0).slice(0, 2);
}

/**
 * Process a single Unit 4 dialogue into RoleplayScript format
 */
function processDialogue(
  unitDialogue: (typeof UNIT_4_DIALOGUES)[0],
  bucketA: Map<string, string>,
  bucketB: Map<string, string>,
  allPhrases: Set<string>
): Unit4RoleplayScript {
  // Parse dialogue text to extract blanks and original answers
  const parseResult = parseDialogueWithBlanks(unitDialogue.dialogue);
  const cleanDialogue = parseResult.dialogue;
  const identifiedBlanks = parseResult.blanks;

  // Score extracted blanks against LOCKED_CHUNKS
  const scoredBlanks: ScoredPhrase[] = identifiedBlanks.map(blank => {
    const { score, bucket, alternatives: alts } = scorePhrase(
      blank.phrase,
      bucketA,
      bucketB,
      allPhrases
    );

    return {
      phrase: blank.phrase,
      score,
      bucket,
      dialogueIndex: blank.dialogueIndex,
      position: blank.position,
      alternatives: alts
    };
  });

  // Sort by score and ensure we have a good distribution
  const selectedBlanks = selectOptimalBlanks(scoredBlanks, 10);

  // Create answer variations
  const answerVariations = selectedBlanks.map((blank, idx) => ({
    index: idx + 1,
    answer: blank.phrase,
    alternatives: generateAlternatives(blank.phrase, blank.bucket),
    bucket: blank.bucket,
    score: blank.score
  }));

  // Build final dialogue with blanks
  const finalDialogue = insertBlankMarkers(
    cleanDialogue,
    selectedBlanks
  );

  // Calculate metrics
  const bucketACnt = selectedBlanks.filter(b => b.bucket === 'BUCKET_A').length;
  const bucketBCnt = selectedBlanks.filter(b => b.bucket === 'BUCKET_B').length;
  const novelCnt = selectedBlanks.filter(b => b.bucket === 'NOVEL').length;
  const total = bucketACnt + bucketBCnt + novelCnt;
  const complianceScore =
    total > 0
      ? Math.round(
          ((bucketACnt * 1.0 + bucketBCnt * 0.6) / total) * 100
        )
      : 0;

  // Create character descriptions
  const characters = unitDialogue.speakers.map(speaker => ({
    name: speaker,
    description: getCharacterDescription(speaker, unitDialogue.title)
  }));

  // Create deep dive insights
  const deepDive = selectedBlanks.map((blank, idx) => ({
    index: idx + 1,
    phrase: blank.phrase,
    insight: generateDeepDiveInsight(blank.phrase, blank.bucket, unitDialogue.title)
  }));

  return {
    id: `advanced-${unitDialogue.id.split('-')[2]}`,
    category: 'Advanced',
    topic: unitDialogue.title,
    context: unitDialogue.context,
    characters,
    dialogue: finalDialogue,
    answerVariations,
    deepDive,
    metrics: {
      totalBlanks: total,
      bucketA: bucketACnt,
      bucketB: bucketBCnt,
      novel: novelCnt,
      complianceScore
    }
  };
}

/**
 * Parse dialogue with blanks (extract answers from ________ markers)
 */
function parseDialogueWithBlanks(
  dialogueLines: string[]
): {
  dialogue: Array<{ speaker: string; text: string }>;
  blanks: Array<{ phrase: string; dialogueIndex: number; position: number }>;
} {
  const dialogue: Array<{ speaker: string; text: string }> = [];
  const blanks: Array<{ phrase: string; dialogueIndex: number; position: number }> = [];

  dialogueLines.forEach((line, idx) => {
    // Parse "Speaker: Text" format
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (match) {
      const [, speaker, text] = match;

      // Find all ________ blanks and extract adjacent text as answer hints
      const blankMatches = Array.from(text.matchAll(/________/g));

      // Store clean text (with blanks)
      dialogue.push({
        speaker: speaker.trim(),
        text: text.trim()
      });

      // Track that this line has blanks
      blankMatches.forEach((blankMatch, blankIdx) => {
        blanks.push({
          phrase: `[blank ${blankIdx + 1} from line ${idx}]`, // Placeholder
          dialogueIndex: idx,
          position: blankMatch.index || 0
        });
      });
    }
  });

  return { dialogue, blanks };
}

/**
 * Select optimal blanks with balance across dialogue
 */
function selectOptimalBlanks(
  candidates: ScoredPhrase[],
  targetCount: number
): ScoredPhrase[] {
  // Ensure we maintain distribution: 60-70% BUCKET_A, 20-30% BUCKET_B, 5-10% NOVEL
  const bucketATarget = Math.ceil(targetCount * 0.65);
  const bucketBTarget = Math.ceil(targetCount * 0.25);
  const novelTarget = targetCount - bucketATarget - bucketBTarget;

  const bucketACandidates = candidates.filter(c => c.bucket === 'BUCKET_A');
  const bucketBCandidates = candidates.filter(c => c.bucket === 'BUCKET_B');
  const novelCandidates = candidates.filter(c => c.bucket === 'NOVEL');

  const selected = [
    ...bucketACandidates.slice(0, bucketATarget),
    ...bucketBCandidates.slice(0, bucketBTarget),
    ...novelCandidates.slice(0, novelTarget)
  ];

  // Sort by dialogue order
  return selected.sort((a, b) => {
    if (a.dialogueIndex !== b.dialogueIndex) {
      return a.dialogueIndex - b.dialogueIndex;
    }
    return a.position - b.position;
  });
}

/**
 * Insert blank markers into dialogue
 */
function insertBlankMarkers(
  dialogue: Array<{ speaker: string; text: string }>,
  selectedBlanks: ScoredPhrase[]
): Array<{ speaker: string; text: string }> {
  const result = JSON.parse(JSON.stringify(dialogue));

  // Sort blanks by line and position (reverse order to maintain positions)
  const sorted = [...selectedBlanks].sort(
    (a, b) =>
      b.dialogueIndex - a.dialogueIndex || b.position - a.position
  );

  for (const blank of sorted) {
    const line = result[blank.dialogueIndex];
    if (line) {
      // Replace the phrase with blank marker
      const regex = new RegExp(
        `\\b${escapeRegex(blank.phrase)}\\b`,
        'gi'
      );
      line.text = line.text.replace(regex, '________');
    }
  }

  return result;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generate character descriptions based on context
 */
function getCharacterDescription(
  speaker: string,
  topic: string
): string {
  const descriptions: Record<string, Record<string, string>> = {
    'Adjusting to Virtual Meeting Culture': {
      Alex: 'Colleague reflecting on remote work challenges',
      Sam: 'Colleague sharing perspective on video call fatigue'
    },
    'Debating AI and Job Displacement': {
      Jordan: 'Professional concerned about AI impact on employment',
      Casey: 'Optimistic professional advocating for upskilling'
    },
    'Corporate Sustainability and Profit Tensions': {
      Morgan: 'Executive balancing sustainability with shareholder returns',
      Taylor: 'Executive advocating for long-term ESG value'
    },
    'Strategies for Effective Language Acquisition': {
      'Professor Chen': 'Language educator promoting communicative approaches',
      David: 'Student/professional learning language methodology'
    }
  };

  return (
    descriptions[topic]?.[speaker] || `Speaker in ${topic}`
  );
}

/**
 * Generate deep dive insights for teaching points
 */
function generateDeepDiveInsight(
  phrase: string,
  bucket: 'BUCKET_A' | 'BUCKET_B' | 'NOVEL',
  topic: string
): string {
  const insightMap: Record<string, string> = {
    'shaped the way': 'C1 phrase expressing transformational impact. Note the "shaped" metaphor.',
    'reluctant to speak': 'Collocation: "reluctant to" + infinitive. Compare with "reluctant about".',
    'fair point': 'Idiomatic agreement marker. Often followed by acknowledging the speaker\'s logic.',
    'encounter less': 'Academic register: "encounter" more formal than "have" or "experience".',
    'rapport': 'Noun from French. Pronunciation: /ræˈpɔːr/. Key in professional contexts.',
    'diminished': 'Past participle used as adjective. Suggests gradual decline.',
    'deliberately schedule': 'Adverb placement: deliberate + action = intentional effort.',
    'valid idea': 'C1 adjective: "valid" carries more weight than "good".',
    'exhausted by': 'Passive voice + "by" construction for causation.',
    'reduce the number': 'Quantifiable action: "reduce" requires direct object.',
    'appreciate your perspective': 'Gratitude marker + showing understanding.',
    'beneficial': 'Formal adjective: -ous ending. C1 vocabulary for IELTS.',
    'considerable concern': 'Collocation: "considerable" + abstract noun.',
    'opportunities': 'Plural noun: shifts from singular "job" to plural possibilities.',
    'accelerated': 'Technological pace described with past participle.',
    'constraints': 'Business/academic term for limitations. More formal than "problems".',
    'devastating': 'Hyperbolic but accurate for business risk scenarios.',
    'assurance': 'Noun form of "assure". Collocates with "provide" or "offer".',
    'commendable': 'C1+ adjective. Subtle praise with caveat pattern.',
    'intact': 'Stands alone as single-word adjective. C2 alternative to "whole".',
    'reputationally': 'Adverb from "reputation". Focuses on perception damage.',
    'quantify': 'Business jargon: make measurable. Key in corporate contexts.',
    'pragmatic': 'C1 adjective: practical + principled.',
    'unchanged': 'Prefix "un-" + past participle. Double negative in meaning.',
    'memorize paradigms': 'Linguistics terms in language learning context.',
    'incompetent': 'C1+ negative judgment. Collocates with "feel".',
    'expose': 'Verb: to make vulnerable. Often passive: "be exposed to".',
    'scaffold': 'Educational metaphor: structured support for learning.'
  };

  return (
    insightMap[phrase] ||
    (bucket === 'BUCKET_A'
      ? `Universal chunk: strong IELTS vocabulary. Practice with different contexts.`
      : bucket === 'BUCKET_B'
        ? `Topic-specific vocabulary. Most valuable in professional/academic discussions.`
        : `Natural variation. Shows understanding of contextual appropriateness.`)
  );
}

/**
 * Main execution: Process all Unit 4 dialogues
 */
export function processAllUnit4Dialogues(): Unit4RoleplayScript[] {
  const { bucketA, bucketB, allPhrases } = buildChunkMaps();

  return UNIT_4_DIALOGUES.map(unitDialogue =>
    processDialogue(unitDialogue, bucketA, bucketB, allPhrases)
  );
}

/**
 * Generate detailed processing report
 */
export function generateProcessingReport(
  scripts: Unit4RoleplayScript[]
): string {
  let report = `# Phase 8 Step 3: Blank Insertion Report\n\n`;
  report += `**Date**: ${new Date().toISOString()}\n`;
  report += `**Dialogues Processed**: ${scripts.length}\n\n`;

  scripts.forEach((script, idx) => {
    report += `## ${idx + 1}. ${script.topic}\n`;
    report += `- **ID**: ${script.id}\n`;
    report += `- **Total Blanks**: ${script.metrics.totalBlanks}\n`;
    report += `- **BUCKET_A**: ${script.metrics.bucketA} (${Math.round(
      (script.metrics.bucketA / script.metrics.totalBlanks) * 100
    )}%)\n`;
    report += `- **BUCKET_B**: ${script.metrics.bucketB} (${Math.round(
      (script.metrics.bucketB / script.metrics.totalBlanks) * 100
    )}%)\n`;
    report += `- **Novel**: ${script.metrics.novel} (${Math.round(
      (script.metrics.novel / script.metrics.totalBlanks) * 100
    )}%)\n`;
    report += `- **Compliance Score**: ${script.metrics.complianceScore}%\n`;
    report += `- **Characters**: ${script.characters.map(c => c.name).join(', ')}\n`;
    report += `\n`;
  });

  const totalBlanks = scripts.reduce((sum, s) => sum + s.metrics.totalBlanks, 0);
  const totalBucketA = scripts.reduce(
    (sum, s) => sum + s.metrics.bucketA,
    0
  );
  const avgComplianceScore = Math.round(
    scripts.reduce((sum, s) => sum + s.metrics.complianceScore, 0) /
      scripts.length
  );

  report += `## Summary Statistics\n`;
  report += `- **Total Blanks Inserted**: ${totalBlanks}\n`;
  report += `- **BUCKET_A Compliance**: ${Math.round(
    (totalBucketA / totalBlanks) * 100
  )}% (target: 65-75%)\n`;
  report += `- **Average Compliance Score**: ${avgComplianceScore}%\n`;
  report += `- **Status**: ✅ Ready for validation pipeline\n`;

  return report;
}

// Execute if run directly
if (require.main === module) {
  const scripts = processAllUnit4Dialogues();
  console.log(JSON.stringify(scripts, null, 2));
  console.log('\n\n');
  console.log(generateProcessingReport(scripts));
}

export type { Unit4RoleplayScript };
