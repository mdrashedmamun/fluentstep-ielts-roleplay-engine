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

/**
 * Validate sentence structure when alternative is substituted
 */
function validateSentenceStructure(sentence: string): SubstitutionResult {
  // Check 1: No duplicate words within 2 positions (except articles, prepositions)
  const words = sentence.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'of', 'is', 'are']);

  for (let i = 0; i < words.length - 1; i++) {
    if (stopWords.has(words[i] || '')) continue;

    for (let j = i + 1; j <= Math.min(i + 2, words.length - 1); j++) {
      if (words[i] === words[j] && (words[i] || '').length > 2) {
        return {
          valid: false,
          reason: `Duplicate word "${words[i]}" creates redundancy`
        };
      }
    }
  }

  // Check 2: No double negatives
  const negatives = ['no', 'not', 'none', "n't", 'never', 'neither', 'nothing', 'nobody'];
  let negativeCount = 0;

  for (const neg of negatives) {
    if (sentence.toLowerCase().includes(neg)) {
      negativeCount++;
    }
  }

  if (negativeCount >= 2) {
    return {
      valid: false,
      reason: `Double negative detected (${negativeCount} negations found)`
    };
  }

  // Check 3: Reasonable sentence length (not too short or too long)
  if (words.length < 3) {
    return {
      valid: false,
      reason: `Sentence too short (${words.length} words)`
    };
  }

  if (words.length > 30) {
    return {
      valid: false,
      reason: `Sentence too long (${words.length} words, consider breaking it up)`
    };
  }

  return { valid: true, reason: '' };
}

/**
 * Validate semantic fit with context
 */
function validateSemanticFit(substitutedSentence: string, alternative: string, mainAnswer: string): SubstitutionResult {
  // Check 1: Part of speech consistency
  const mainIsNoun = isLikelyNoun(mainAnswer);
  const altIsNoun = isLikelyNoun(alternative);

  if (mainIsNoun && !altIsNoun && !isLikelyAdjective(alternative) && !isLikelyVerb(alternative)) {
    return {
      valid: false,
      reason: `Part of speech mismatch: "${mainAnswer}" is noun, "${alternative}" is not`
    };
  }

  const mainIsAdjective = isLikelyAdjective(mainAnswer);
  const altIsAdjective = isLikelyAdjective(alternative);

  if (mainIsAdjective && !altIsAdjective) {
    return {
      valid: false,
      reason: `Part of speech mismatch: "${mainAnswer}" is adjective, "${alternative}" is not`
    };
  }

  const mainIsVerb = isLikelyVerb(mainAnswer);
  const altIsVerb = isLikelyVerb(alternative);

  if (mainIsVerb && !altIsVerb) {
    return {
      valid: false,
      reason: `Part of speech mismatch: "${mainAnswer}" is verb, "${alternative}" is not`
    };
  }

  // Check 2: Formality/register alignment
  const mainFormality = estimateFormality(mainAnswer);
  const altFormality = estimateFormality(alternative);

  if (Math.abs(mainFormality - altFormality) > 0.5) {
    return {
      valid: false,
      reason: `Register mismatch: "${mainAnswer}" (${mainFormality.toFixed(1)}) vs "${alternative}" (${altFormality.toFixed(1)})`
    };
  }

  // Check 3: Detect formal/academic words in casual contexts
  if (isFormalWord(alternative) && isCasualContext(substitutedSentence)) {
    return {
      valid: false,
      reason: `Formal word "${alternative}" inappropriate in casual context`
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
 * Simple heuristic: is this word likely a noun?
 */
function isLikelyNoun(word: string): boolean {
  const nounEndings = ['tion', 'ment', 'ness', 'ity', 'er', 'or', 'ist', 'ism', 'ship'];
  const lower = word.toLowerCase();

  if (nounEndings.some(ending => lower.endsWith(ending))) {
    return true;
  }

  const commonVerbs = new Set(['be', 'have', 'do', 'say', 'go', 'know', 'take', 'see', 'come', 'think']);
  const commonAdj = new Set(['good', 'bad', 'big', 'small', 'new', 'old', 'many', 'some', 'more', 'most']);

  if (commonVerbs.has(lower) || commonAdj.has(lower)) {
    return false;
  }

  return true;
}

/**
 * Simple heuristic: is this word likely an adjective?
 */
function isLikelyAdjective(word: string): boolean {
  const lower = word.toLowerCase();
  const adjEndings = ['ful', 'less', 'ous', 'ible', 'able', 'ive', 'al', 'ic', 'ed', 'en'];

  if (adjEndings.some(ending => lower.endsWith(ending))) {
    return true;
  }

  const commonAdj = new Set(['good', 'bad', 'big', 'small', 'new', 'old', 'many', 'some', 'more', 'most',
    'happy', 'sad', 'beautiful', 'ugly', 'bright', 'dark', 'hot', 'cold', 'amazing', 'incredible',
    'stunning', 'surprising', 'shame', 'unfortunate', 'quite']);

  return commonAdj.has(lower);
}

/**
 * Simple heuristic: is this word likely a verb?
 */
function isLikelyVerb(word: string): boolean {
  const lower = word.toLowerCase();

  if (lower.endsWith('ing') || lower.endsWith('ed')) {
    return true;
  }

  const commonVerbs = new Set(['be', 'have', 'do', 'say', 'go', 'know', 'take', 'see', 'come', 'think',
    'make', 'get', 'use', 'find', 'tell', 'ask', 'work', 'seem', 'feel', 'try']);

  return commonVerbs.has(lower);
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

/**
 * Main validation function
 */
function checkAlternatives(): void {
  console.log('\n=== Answer Alternatives Quality Validation (Validator 7) ===\n');

  let totalScenarios = 0;
  let totalBlanks = 0;
  let totalAlternatives = 0;
  let totalIssues = 0;
  let issuesByType: { [key: string]: number } = {
    'structure': 0,
    'semantic': 0,
    'register': 0
  };

  const problemScenarios: string[] = [];

  CURATED_ROLEPLAYS.forEach(scenario => {
    const scenarioIssues: { blank: number; issues: AlternativeCheckResult[] }[] = [];

    scenario.answerVariations.forEach((av, blankIdx) => {
      totalBlanks++;
      totalAlternatives += (av.alternatives?.length || 0) + 1; // +1 for main answer

      // Check main answer
      const dialogueLine = scenario.dialogue[blankIdx]?.text;
      if (!dialogueLine) return;

      const mainSubstituted = dialogueLine.replace('________', av.answer);
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
        const substituted = dialogueLine.replace('________', alt);
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
      console.log(`\n📋 ${scenario.id}`);
      console.log(`   Topic: ${scenario.topic}`);
      console.log(`   Issues found: ${scenarioIssues.length} blank(s) with problems\n`);

      scenarioIssues.forEach(({ blank, issues }) => {
        console.log(`   Blank #${blank + 1}:`);
        console.log(`      Main answer: "${issues[0]!.answer}"`);

        issues.forEach(issue => {
          if (issue.alternative !== issue.answer) {
            console.log(`      Alternative: "${issue.alternative}"`);
          }
          console.log(`         Substituted: "${issue.substituted}"`);

          issue.issues.forEach(err => {
            console.log(`         ❌ ${err}`);
          });
        });
      });
    }
  });

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Total Scenarios: ${totalScenarios}`);
  console.log(`Total Blanks: ${totalBlanks}`);
  console.log(`Total Alternatives (including main): ${totalAlternatives}`);
  console.log(`Total Issues Found: ${totalIssues}`);
  console.log(`Issues by Type:`);
  console.log(`  - Structure: ${issuesByType['structure']}`);
  console.log(`  - Semantic: ${issuesByType['semantic']}`);
  console.log(`  - Register: ${issuesByType['register']}`);

  console.log(`\nScenarios with issues: ${problemScenarios.length}`);
  if (problemScenarios.length > 0) {
    console.log(`  ${problemScenarios.join(', ')}`);
  }

  console.log('\n' + '='.repeat(40) + '\n');

  if (totalIssues > 0) {
    console.error(`❌ Found ${totalIssues} issue(s) in answer alternatives`);
    process.exit(1);
  } else {
    console.log('✅ All answer alternatives are natural and grammatically correct');
    process.exit(0);
  }
}

// Run validation
checkAlternatives();
