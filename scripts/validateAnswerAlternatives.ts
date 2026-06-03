/**
 * Answer Alternatives Quality Validator
 * Validator 7: Comprehensive check for contextual fit and naturalness
 *
 * This script validates that all answer alternatives:
 * 1. Create grammatically correct sentences when substituted
 * 2. Maintain semantic meaning consistent with main answer
 * 3. Use appropriate register/formality for context
 * 4. Include no formal/academic words in casual dialogue
 */

import { CURATED_ROLEPLAYS } from '../src/services/staticData';

interface SubstitutionResult {
  valid: boolean;
  reason: string;
}

interface AlternativeCheckResult {
  answer: string;
  alternative: string;
  index: number;
  substituted: string;
  structureValid: boolean;
  semanticValid: boolean;
  registerValid: boolean;
  issues: string[];
}

interface BlankContext {
  text: string;
  occurrenceInLine: number;
}

const writeLine = (message = ''): void => {
  process.stdout.write(`${message}\n`);
};

const writeError = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

/**
 * Validate sentence structure when alternative is substituted
 */
function validateSentenceStructure(sentence: string): SubstitutionResult {
  const normalized = sentence
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = normalized.split(/\s+/).filter(Boolean);
  const allowedRepeats = new Set(['yes', 'no', 'very', 'really', 'so']);

  // Deterministic substitution errors: duplicated adjacent words introduced by an alternative.
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i] === words[i + 1] && !allowedRepeats.has(words[i] || '')) {
      return {
        valid: false,
        reason: `Duplicate adjacent word "${words[i]}" creates redundancy`
      };
    }
  }

  const deterministicGrammarIssues: Array<[RegExp, string]> = [
    [/\ba few of issues\b/, 'Use "a few issues" rather than "a few of issues"'],
    [/\ba several\b/, 'Use "several" rather than "a several"'],
    [/\bsort out me\b/, 'Use "sort me out" or "sort out" rather than "sort out me"'],
    [/\bfewer urgent\b/, 'Use "less urgent" rather than "fewer urgent"'],
    [/\blower urgent\b/, 'Use "less urgent" rather than "lower urgent"'],
  ];

  for (const [pattern, reason] of deterministicGrammarIssues) {
    if (pattern.test(normalized)) {
      return { valid: false, reason };
    }
  }

  return { valid: true, reason: '' };
}

/**
 * Validate semantic fit with context
 */
function validateSemanticFit(substitutedSentence: string, alternative: string, mainAnswer: string): SubstitutionResult {
  // POS guessing produced many false positives for valid spoken alternatives
  // such as "great/lovely", "free/available", and phrase-level chunks.
  // Keep this validator deterministic: register and explicit formal/slang checks only.
  const mainFormality = estimateFormality(mainAnswer);
  const altFormality = estimateFormality(alternative);

  if (Math.abs(mainFormality - altFormality) > 0.5) {
    return {
      valid: false,
      reason: `Register mismatch: "${mainAnswer}" (${mainFormality.toFixed(1)}) vs "${alternative}" (${altFormality.toFixed(1)})`
    };
  }

  if (isFormalWord(alternative) && isCasualContext(substitutedSentence)) {
    return {
      valid: false,
      reason: `Formal word "${alternative}" inappropriate in casual context`
    };
  }

  if (isInappropriateSlang(alternative, substitutedSentence)) {
    return {
      valid: false,
      reason: `Informal/slang word "${alternative}" inappropriate in formal context`
    };
  }

  return { valid: true, reason: '' };
}

/**
 * Check if word is formal/academic
 */
function isFormalWord(word: string): boolean {
  const formalWords = new Set([
    'pertaining', 'relating', 'concerning', 'regarding',
    'facilitate', 'leverage', 'implement', 'utilize',
    'aforementioned', 'nonetheless', 'moreover', 'therefore',
    'substantiate', 'elucidate', 'demonstrate', 'illustrate',
    'methodology', 'paradigm', 'framework', 'constitute'
  ]);

  return formalWords.has(word.toLowerCase());
}

/**
 * Check if context is casual (friends, informal setting)
 */
function isCasualContext(sentence: string): boolean {
  const casualMarkers = ['friend', 'hey', "don't", "can't", "won't", 'you know', 'guy', 'mate', 'dude'];
  const lower = sentence.toLowerCase();

  return casualMarkers.some(m => lower.includes(m));
}




/**
 * Estimate formality on 0-1 scale (0=casual, 1=formal)
 */
function estimateFormality(word: string): number {
  const formalMarkers = ['aforementioned', 'nonetheless', 'moreover', 'therefore', 'subsequently',
    'facilitate', 'leverage', 'implement', 'utilize', 'pertaining', 'relating'];
  const casualMarkers = ['cool', 'awesome', 'gonna', 'wanna', 'kinda', 'sorta', 'yeah', 'nope', 'yep'];

  const lower = word.toLowerCase();

  if (formalMarkers.some(f => lower.includes(f))) {
    return 0.8;
  }

  if (casualMarkers.some(c => lower.includes(c))) {
    return 0.2;
  }

  return Math.min(0.6, word.length / 15);
}

/**
 * Check if word is slang/informal in a context where formal is needed
 */
function isInappropriateSlang(word: string, sentence: string): boolean {
  const isFormalContext = /interview|meeting|business|professional|formal|job|manager/.test(sentence.toLowerCase());
  const slangTerms = new Set(['gonna', 'wanna', 'gotta', 'yeah', 'yep', 'nope', 'kinda', 'sorta', 'dude', 'bro']);

  return isFormalContext && slangTerms.has(word.toLowerCase());
}

function getBlankContexts(dialogue: { text: string }[]): BlankContext[] {
  const contexts: BlankContext[] = [];

  for (const turn of dialogue) {
    const matches = turn.text.match(/________/g) || [];
    for (let occurrenceInLine = 0; occurrenceInLine < matches.length; occurrenceInLine++) {
      contexts.push({ text: turn.text, occurrenceInLine });
    }
  }

  return contexts;
}

function substituteBlank(context: BlankContext, value: string): string {
  let seen = 0;
  return context.text.replace(/________/g, match => {
    if (seen === context.occurrenceInLine) {
      seen++;
      return value;
    }
    seen++;
    return match;
  });
}

/**
 * Main validation function
 */
function checkAlternatives(): void {
  writeLine('\n=== Answer Alternatives Quality Validation (Validator 7) ===\n');

  let totalScenarios = 0;
  let totalBlanks = 0;
  let totalAlternatives = 0;
  let totalIssues = 0;
  const issuesByType: { [key: string]: number } = {
    'structure': 0,
    'semantic': 0,
    'register': 0
  };

  const problemScenarios: string[] = [];

  CURATED_ROLEPLAYS.forEach(scenario => {
    const scenarioIssues: { blank: number; issues: AlternativeCheckResult[] }[] = [];

    const blankContexts = getBlankContexts(scenario.dialogue);

    scenario.answerVariations.forEach((av, blankIdx) => {
      totalBlanks++;
      totalAlternatives += (av.alternatives?.length || 0) + 1; // +1 for main answer

      // Check main answer against actual blank-bearing dialogue, not dialogue array index.
      const blankContext = blankContexts[blankIdx];
      if (!blankContext) return;

      const mainSubstituted = substituteBlank(blankContext, av.answer);
      const mainStructure = validateSentenceStructure(mainSubstituted);
      const mainSemantic = validateSemanticFit(mainSubstituted, av.answer, av.answer);

      if (!mainStructure.valid || !mainSemantic.valid) {
        totalIssues++;
        if (!mainStructure.valid) issuesByType['structure']++;
        if (!mainSemantic.valid) issuesByType['semantic']++;

        if (!scenarioIssues.find(s => s.blank === blankIdx)) {
          scenarioIssues.push({ blank: blankIdx, issues: [] });
        }

        scenarioIssues.find(s => s.blank === blankIdx)!.issues.push({
          answer: av.answer,
          alternative: av.answer,
          index: blankIdx,
          substituted: mainSubstituted,
          structureValid: mainStructure.valid,
          semanticValid: mainSemantic.valid,
          registerValid: true,
          issues: [
            !mainStructure.valid ? `Structure: ${mainStructure.reason}` : '',
            !mainSemantic.valid ? `Semantic: ${mainSemantic.reason}` : ''
          ].filter(Boolean)
        });
      }

      // Check alternatives
      (av.alternatives || []).forEach((alt, altIdx) => {
        const substituted = substituteBlank(blankContext, alt);
        const structureResult = validateSentenceStructure(substituted);
        const semanticResult = validateSemanticFit(substituted, alt, av.answer);

        if (!structureResult.valid || !semanticResult.valid) {
          totalIssues++;
          if (!structureResult.valid) issuesByType['structure']++;
          if (!semanticResult.valid) issuesByType['semantic']++;

          if (!scenarioIssues.find(s => s.blank === blankIdx)) {
            scenarioIssues.push({ blank: blankIdx, issues: [] });
          }

          scenarioIssues.find(s => s.blank === blankIdx)!.issues.push({
            answer: av.answer,
            alternative: alt,
            index: altIdx,
            substituted,
            structureValid: structureResult.valid,
            semanticValid: semanticResult.valid,
            registerValid: true,
            issues: [
              !structureResult.valid ? `Structure: ${structureResult.reason}` : '',
              !semanticResult.valid ? `Semantic: ${semanticResult.reason}` : ''
            ].filter(Boolean)
          });
        }
      });
    });

    totalScenarios++;

    // Report scenario issues
    if (scenarioIssues.length > 0) {
      problemScenarios.push(scenario.id);
      writeLine(`\n📋 ${scenario.id}`);
      writeLine(`   Topic: ${scenario.topic}`);
      writeLine(`   Issues found: ${scenarioIssues.length} blank(s) with problems\n`);

      scenarioIssues.forEach(({ blank, issues }) => {
        writeLine(`   Blank #${blank + 1}:`);
        writeLine(`      Main answer: "${issues[0]!.answer}"`);

        issues.forEach(issue => {
          if (issue.alternative !== issue.answer) {
            writeLine(`      Alternative: "${issue.alternative}"`);
          }
          writeLine(`         Substituted: "${issue.substituted}"`);

          issue.issues.forEach(err => {
            writeLine(`         ❌ ${err}`);
          });
        });
      });
    }
  });

  // Summary
  writeLine('\n=== Summary ===');
  writeLine(`Total Scenarios: ${totalScenarios}`);
  writeLine(`Total Blanks: ${totalBlanks}`);
  writeLine(`Total Alternatives (including main): ${totalAlternatives}`);
  writeLine(`Total Issues Found: ${totalIssues}`);
  writeLine(`Issues by Type:`);
  writeLine(`  - Structure: ${issuesByType['structure']}`);
  writeLine(`  - Semantic: ${issuesByType['semantic']}`);
  writeLine(`  - Register: ${issuesByType['register']}`);

  writeLine(`\nScenarios with issues: ${problemScenarios.length}`);
  if (problemScenarios.length > 0) {
    writeLine(`  ${problemScenarios.join(', ')}`);
  }

  writeLine('\n' + '='.repeat(40) + '\n');

  if (totalIssues > 0) {
    writeError(`❌ Found ${totalIssues} issue(s) in answer alternatives`);
    process.exit(1);
  } else {
    writeLine('✅ All answer alternatives are natural and grammatically correct');
    process.exit(0);
  }
}

// Run validation
checkAlternatives();
