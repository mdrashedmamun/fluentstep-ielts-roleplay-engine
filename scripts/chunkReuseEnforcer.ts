/**
 * Chunk Reuse Enforcer
 *
 * Validates cross-scenario chunk consistency:
 * - Locked chunks should be reused, not replaced with synonyms
 * - Detects "flashy vocabulary creep" (Band 9 words in B1 contexts)
 * - Ensures consistent chunk usage across scenarios
 */

import { RoleplayScript } from '../src/services/staticData';

export interface ChunkReuseAnalysis {
  scenarioId: string;
  blankIndex: number;
  chunk: string;
  isSynonymReplacement: boolean;
  potentialSynonym?: string;
  bandLevel?: 'B1' | 'B2' | 'B2+' | 'C1';
}

export interface ChunkReuseReport {
  totalIssues: number;
  synonymReplacements: ChunkReuseAnalysis[];
  flashyVocabularyCreep: ChunkReuseAnalysis[];
  recommendations: string[];
}

/**
 * Dictionary of common synonyms that indicate chunk replacement
 * Rather than true replacements, these are alternative patterns that
 * should have stuck with the original chunk for consistency
 */
const SYNONYM_GROUPS = [
  {
    primary: 'to be honest',
    synonyms: ['honestly', 'frankly', 'candidly', 'to tell you the truth'],
    reason: 'Lock to "to be honest" - most natural, consistent across scenarios'
  },
  {
    primary: 'I think',
    synonyms: ['I believe', 'in my opinion', 'I suppose'],
    reason: 'Lock to "I think" - simpler, more conversational'
  },
  {
    primary: 'a bit',
    synonyms: ['a little', 'somewhat', 'slightly'],
    reason: 'Lock to "a bit" - most conversational, British English'
  },
  {
    primary: 'really',
    synonyms: ['very', 'extremely', 'incredibly'],
    reason: 'Lock to "really" - most natural in speech'
  },
  {
    primary: 'kind of',
    synonyms: ['sort of', 'somewhat', 'kind of like'],
    reason: 'Lock to "kind of" - most conversational'
  },
  {
    primary: 'sort of',
    synonyms: ['kind of', 'somewhat', 'rather'],
    reason: 'Lock to "sort of" - British English preference'
  },
  {
    primary: 'quite',
    synonyms: ['rather', 'fairly', 'quite a bit'],
    reason: 'Lock to "quite" - British English, precise meaning'
  },
  {
    primary: 'anyway',
    synonyms: ['anyhow', 'in any case', 'regardless'],
    reason: 'Lock to "anyway" - most conversational'
  },
  {
    primary: 'actually',
    synonyms: ['in fact', 'as a matter of fact', 'really'],
    reason: 'Lock to "actually" - British English, conversational'
  },
  {
    primary: 'you know',
    synonyms: ['you see', 'you know what', 'I mean'],
    reason: 'Lock to "you know" - most natural filler'
  }
];

/**
 * Band level assessment for vocabulary items
 * (Simplified - based on IELTS vocabulary lists)
 */
const VOCABULARY_BAND_LEVELS: Record<string, string> = {
  // B1 level vocabulary
  'think': 'B1',
  'know': 'B1',
  'good': 'B1',
  'bad': 'B1',
  'happy': 'B1',
  'sad': 'B1',
  'big': 'B1',
  'small': 'B1',
  'different': 'B1',
  'same': 'B1',

  // B2 level vocabulary
  'appear': 'B2',
  'suggest': 'B2',
  'indicate': 'B2',
  'imply': 'B2',
  'concerning': 'B2',
  'regarding': 'B2',
  'moreover': 'B2',
  'nevertheless': 'B2',
  'significant': 'B2',

  // B2+ / C1 level vocabulary
  'facilitate': 'C1',
  'meticulous': 'C1',
  'elucidate': 'C1',
  'ameliorate': 'C1',
  'ubiquitous': 'C1',
  'perspicacious': 'C1',
  'propitious': 'C1'
};

/**
 * Analyze chunk reuse consistency across a scenario
 */
export function analyzeChunkReuseInScenario(scenario: RoleplayScript): ChunkReuseAnalysis[] {
  const issues: ChunkReuseAnalysis[] = [];

  for (const av of scenario.answerVariations) {
    const chunk = av.answer.toLowerCase();

    // Check for synonym replacements
    const synonymIssue = SYNONYM_GROUPS.find(
      group => group.synonyms.some(syn => syn.toLowerCase() === chunk)
    );

    if (synonymIssue) {
      issues.push({
        scenarioId: scenario.id,
        blankIndex: av.index,
        chunk: av.answer,
        isSynonymReplacement: true,
        potentialSynonym: synonymIssue.primary,
        bandLevel: getBandLevel(av.answer)
      });
    }
  }

  return issues;
}

/**
 * Get band level for a vocabulary item (simplified)
 */
function getBandLevel(word: string): 'B1' | 'B2' | 'B2+' | 'C1' {
  const key = word.toLowerCase().split(/\s+/)[0];
  return (VOCABULARY_BAND_LEVELS[key] as any) || 'B1';
}

/**
 * Analyze chunk reuse across multiple scenarios
 */
export function analyzeChunkReuseAcrossScenarios(
  scenarios: RoleplayScript[]
): ChunkReuseReport {
  const allIssues: ChunkReuseAnalysis[] = [];
  const synonymReplacements: ChunkReuseAnalysis[] = [];

  for (const scenario of scenarios) {
    const issues = analyzeChunkReuseInScenario(scenario);
    allIssues.push(...issues);
    synonymReplacements.push(...issues.filter(i => i.isSynonymReplacement));
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (synonymReplacements.length > 0) {
    const grouped = groupBySynonym(synonymReplacements);
    for (const [original, alternatives] of Object.entries(grouped)) {
      recommendations.push(
        `Consolidate "${original}" - found ${alternatives.length} synonym variant(s): ${alternatives.join(', ')}`
      );
    }
  }

  return {
    totalIssues: allIssues.length,
    synonymReplacements,
    flashyVocabularyCreep: [],  // Would need deeper analysis
    recommendations
  };
}

/**
 * Group synonym replacements by their primary chunk
 */
function groupBySynonym(
  replacements: ChunkReuseAnalysis[]
): Record<string, string[]> {
  const groups: Record<string, string[]> = {};

  for (const item of replacements) {
    const original = item.potentialSynonym || item.chunk;
    if (!groups[original]) {
      groups[original] = [];
    }
    if (!groups[original].includes(item.chunk)) {
      groups[original].push(item.chunk);
    }
  }

  return groups;
}

/**
 * Generate a detailed report
 */
export function getChunkReuseReport(scenarios: RoleplayScript[]): string {
  const report = analyzeChunkReuseAcrossScenarios(scenarios);
  const lines = [
    '═'.repeat(60),
    'CHUNK REUSE ANALYSIS',
    '═'.repeat(60),
    '',
    `Total Issues: ${report.totalIssues}`,
    `Synonym Replacements: ${report.synonymReplacements.length}`,
    ''
  ];

  if (report.recommendations.length > 0) {
    lines.push('RECOMMENDATIONS:');
    lines.push('─'.repeat(60));
    for (const rec of report.recommendations) {
      lines.push(`• ${rec}`);
    }
    lines.push('');
  }

  if (report.synonymReplacements.length > 0) {
    lines.push('DETAILS:');
    lines.push('─'.repeat(60));
    for (const item of report.synonymReplacements.slice(0, 10)) {
      lines.push(`  Scenario: ${item.scenarioId}`);
      lines.push(`    Current: "${item.chunk}"`);
      lines.push(`    Recommendation: Use "${item.potentialSynonym}" instead`);
      lines.push('');
    }

    if (report.synonymReplacements.length > 10) {
      lines.push(`... and ${report.synonymReplacements.length - 10} more`);
      lines.push('');
    }
  } else {
    lines.push('✓ No chunk reuse issues detected');
    lines.push('');
  }

  return lines.join('\n');
}
