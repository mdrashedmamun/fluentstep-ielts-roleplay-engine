---
name: linguistic-blank-inserter
display-name: Cambridge-Grade Linguistic Blank Inserter
description: Transform raw dialogues into Cambridge IGCSE-quality blanks with 20-30% density, strategic verb/idiom targeting, validated alternatives, and IELTS-focused insights.
category: content-enrichment
parameters:
  - name: dialogue-file
    description: "Path to JSON file containing RoleplayScript with raw dialogue"
    required: true
  - name: target-blank-density
    description: "Target blank percentage (20-30% recommended)"
    required: false
    default: "25"
  - name: focus-types
    description: "Grammar types to prioritize: VERB,ADJ,ADV,IDIOM,EXPRESSION,COLLOCATION"
    required: false
    default: "VERB,ADJ,ADV,IDIOM,EXPRESSION"
  - name: difficulty-level
    description: "CEFR target level: A1|A2|B1|B2|C1|C2"
    required: false
    default: "B2"
  - name: min-alternatives
    description: "Minimum alternatives per blank (3-5)"
    required: false
    default: "3"
  - name: strictness
    description: "Validation mode: lenient|standard|strict"
    required: false
    default: "standard"
  - name: enable-auto-fix
    description: "Auto-apply HIGH confidence fixes from linguistic audit"
    required: false
    default: "yes"
  - name: include-deep-dive
    description: "Generate IELTS-focused deep dive insights (30-40% of blanks)"
    required: false
    default: "yes"
tags: [linguistic-analysis, blank-insertion, ielts-preparation, cambridge-standards, content-enrichment, nlp]
---

# Cambridge-Grade Linguistic Blank Inserter

Transform poorly-blanked dialogue transcripts into Cambridge IGCSE-quality IELTS practice materials with strategic linguistic analysis, validated alternatives, and pedagogically valuable insights.

## The Problem This Solves

**Current Tool 2 Issues**:
- 🚫 Only 9% blank density (3 blanks in 33 turns) vs required 20-30%
- 🚫 Random noun targeting instead of high-value verbs/idioms/expressions
- 🚫 Zero linguistic analysis (no POS tagging, collocation detection, grammar focus)
- 🚫 Missing validated alternatives (0 per blank)
- 🚫 No Cambridge corpus alignment or IELTS deep insights

**This Skill Delivers**:
- ✅ 20-30% blank density across entire dialogue
- ✅ Strategic 60% grammar focus (verbs, idioms, expressions)
- ✅ 3-5 validated alternatives per blank with semantic similarity checks
- ✅ Cambridge corpus alignment (LOCKED_CHUNKS Buckets A & B)
- ✅ IELTS band-level insights and common learner error patterns
- ✅ Confidence-based auto-fixing (HIGH ≥95%, MEDIUM 70-94%, LOW <70%)

## Usage Examples

### Basic Usage: Standard IELTS B2 Preparation

```
/linguistic-blank-inserter "examples/raw_conversation.json" "25" "VERB,ADJ,ADV,IDIOM,EXPRESSION" "B2" "3" "standard" "yes" "yes"
```

**What happens**:
1. Analyzes 33 dialogue turns for linguistic value
2. Identifies 50+ candidate blank positions (verbs, idioms, expressions, collocations)
3. Scores each by grammar value, LOCKED_CHUNKS alignment, difficulty
4. Selects 8-10 blanks (25% density) with balanced distribution
5. Generates 3-5 validated alternatives per blank
6. Creates 3-4 deep dive IELTS insights
7. Runs linguistic audit with confidence scoring
8. Auto-fixes HIGH confidence issues
9. Outputs production-ready RoleplayScript

### Advanced Usage: Strict Validation for Exam Prep

```
/linguistic-blank-inserter "data/business_dialogue.json" "28" "VERB,IDIOM,EXPRESSION,COLLOCATION" "B2" "4" "strict" "yes" "yes"
```

**Focus**: Higher blank density (28%), idiom-heavy (business English), 4 alternatives per blank, strict validation mode, full deep dive insights.

### Quick Enrichment: Lenient Auto-Fix

```
/linguistic-blank-inserter "data/conversation.json" "22" "VERB,ADJ,ADV" "A2" "3" "lenient" "yes" "no"
```

**Focus**: Lower density (22%), A2 beginner level, quick turnaround, auto-fix enabled, skip deep dive (faster processing).

## What You'll Provide

1. **Dialogue File** (JSON): RoleplayScript with raw dialogue turns
   ```json
   {
     "dialogue": [
       {"speaker": "Jessica", "text": "Welcome back. It's Jessica here."},
       {"speaker": "Customer", "text": "Yes, I'm trying to make a cake..."}
     ]
   }
   ```

2. **Target Blank Density**: 20-30% (default: 25%)
   - 20% = ~6-7 blanks per 33 turns
   - 25% = ~8-10 blanks per 33 turns
   - 30% = ~10-12 blanks per 33 turns

3. **Grammar Focus Types**: Select from:
   - **VERB** (highest priority): modals, phrasal verbs, tenses
   - **IDIOM**: fixed expressions (piece of cake, break the ice)
   - **EXPRESSION**: dynamic phrases (a lot of, due to)
   - **COLLOCATION**: word pairs (make a decision, take a break)
   - **ADJ/ADV**: descriptive words, adverbial modification
   - **NOVEL**: advanced lexical items (less common)

4. **CEFR Difficulty Level**: A1 (beginner) → C2 (mastery)
   - A1/A2: Basic vocabulary, present/past simple
   - B1/B2: Intermediate, modal verbs, collocations, phrasal verbs
   - C1/C2: Advanced, idioms, register variation, nuanced expression

5. **Validation Strictness**:
   - **lenient**: Warnings only, allows <80% LOCKED_CHUNKS compliance
   - **standard** (default): Blocks errors, requires ≥80% compliance
   - **strict**: Requires ≥90% compliance, flagged for expert review

## What Gets Created

### Primary Output: Production-Ready RoleplayScript

**File**: `[input-filename]-blanked-[TIMESTAMP].json`

**Structure** (expanded RoleplayScript):
```json
{
  "id": "original-id",
  "dialogue": [
    {
      "speaker": "Jessica",
      "text": "Welcome back. It's Jessica here. Welcome to my channel."
    },
    {
      "speaker": "Customer",
      "text": "Yes, I'm ________ to make a cake, but I'm ________ a few things."
    },
    {
      "speaker": "Shop Assistant",
      "text": "Yes, you ________ it right—flour!"
    }
  ],
  "answerVariations": [
    {
      "index": 0,
      "answer": "trying",
      "alternatives": ["attempting", "planning", "wanting", "hoping"],
      "confidence": "HIGH",
      "pos": "VERB",
      "cefr_level": "B1"
    },
    {
      "index": 1,
      "answer": "missing",
      "alternatives": ["lacking", "short of", "needing", "without"],
      "confidence": "HIGH",
      "pos": "VERB",
      "cefr_level": "B1"
    },
    {
      "index": 2,
      "answer": "got",
      "alternatives": ["guessed", "named", "identified", "said"],
      "confidence": "MEDIUM",
      "pos": "VERB",
      "cefr_level": "A1"
    }
  ],
  "deepDive": [
    {
      "index": 0,
      "phrase": "trying to",
      "grammar_type": "MODAL_INFINITIVE",
      "explanation": "Modal + infinitive expressing ongoing effort toward a goal",
      "usage_context": "Common in IELTS Speaking when describing current activities or intentions",
      "collocations": ["trying to understand", "trying to achieve", "trying to explain"],
      "ielts_relevance": "Band 6-7 (intermediate-upper intermediate speaking)",
      "common_errors": "❌ 'trying for' (incorrect), ✓ 'trying to' (correct)",
      "example": "I'm trying to improve my English speaking skills."
    },
    {
      "index": 1,
      "phrase": "missing",
      "grammar_type": "VERB_PRESENT_CONTINUOUS",
      "explanation": "Verb meaning 'lacking/not having' used in present continuous",
      "usage_context": "Common in spoken English describing immediate lack or absence",
      "collocations": ["missing + object", "missing something", "missing some items"],
      "ielts_relevance": "Band 5-6 (intermediate speaking/writing)",
      "common_errors": "❌ Confusing 'missing' (lack) with 'miss' (feel absence of person)",
      "example": "I'm missing some flour for the cake recipe."
    }
  ],
  "metadata": {
    "blank_density_target": 0.25,
    "blank_density_achieved": 0.27,
    "total_blanks_inserted": 9,
    "grammar_distribution": {
      "VERB": 6,
      "IDIOM": 1,
      "EXPRESSION": 2
    },
    "locked_chunks_compliance": 0.85,
    "validation_status": "PASS",
    "high_confidence_fixes_applied": 2,
    "medium_confidence_issues": 1,
    "low_confidence_warnings": 0,
    "processing_time_seconds": 2.3
  }
}
```

### Secondary Outputs

1. **Validation Report** (if strictness=strict):
   - `[input-filename]-validation-[TIMESTAMP].md`
   - Detailed compliance scoring, issue breakdown, recommendations

2. **Audit Log** (optional):
   - `[input-filename]-audit-[TIMESTAMP].json`
   - Complete linguistic analysis, scoring details, candidate rejection reasons

## Core Algorithm: Five-Phase Transformation

### Phase 1: Linguistic Analysis
**Input**: Raw dialogue turns
**Process**:
- **POS Tagging**: spaCy dependency parser identifies verbs, adjectives, adverbs, nouns
- **Collocation Detection**: Extract 2-4 word chunks (make a decision, take a break)
- **Idiom Identification**: Match against idiom database (piece of cake, break the ice)
- **Phrasal Verb Detection**: Identify multi-word verbs (get up, put off, look after)
- **Register Detection**: Classify formal/casual/neutral

**Output**: Enriched dialogue with linguistic metadata

### Phase 2: Candidate Scoring
**Input**: Linguistic metadata for each word/phrase
**Scoring Logic**:

```
Total Score = Grammar Value (40%) + LOCKED_CHUNKS Match (30%) +
              Difficulty Calibration (15%) + Pedagogical Value (15%)

Grammar Value:
  • Verbs (especially modal + infinitive): +40
  • Phrasal verbs: +35
  • Idioms/expressions: +35
  • Adjectives/Adverbs: +25
  • Collocations: +20

LOCKED_CHUNKS Match (Cambridge Corpus Alignment):
  • Bucket A: +30 (highest frequency, formal academic)
  • Bucket B: +20 (high frequency, general English)
  • Other: +5

Difficulty Calibration:
  • CEFR match ±1 level: +15
  • CEFR match ±2 levels: +5
  • CEFR mismatch >2 levels: -10

Pedagogical Value:
  • Common learner error: +20
  • Multiple meanings: +10
  • Common in IELTS: +15
  • Position (sentence start): +5
  • Position (sentence end): +3

Penalties:
  • Too short (<3 chars): -20
  • Too long (>20 chars): -10
  • Adjacent to blank: -15
```

**Output**: Scored candidates (0-100 scale)

### Phase 3: Blank Selection
**Input**: Scored candidates
**Constraints**:
- Target density (20-30%)
- No adjacent blanks (≥2 words separation)
- Distribution balance (60% grammar, 30% LOCKED_CHUNKS, 10% novel)
- Progressive difficulty across dialogue

**Selection Strategy**:
1. Calculate target blank count = total_sentences × density
2. Filter by category: grammar (VERB/ADJ/ADV), chunks (BUCKET_A/B), novel
3. Select top-N from each category proportionally
4. Sort by dialogue position (maintain flow)
5. Check adjacency constraints (drop lower-scored if conflict)
6. Final diversity check (ensure variety across sentence types)

**Output**: Ordered list of blanks with indices

### Phase 4: Alternative Generation
**Input**: Selected blanks
**Multi-Strategy Approach**:

1. **Variation Mappings** (FluentStep predefined):
   - "trying" → ["attempting", "planning", "wanting"]
   - "missing" → ["lacking", "short of", "needing"]

2. **Grammatical Variants**:
   - Verb forms: trying → tried, tries, try (keep tense-appropriate)
   - Register shifts: formal → casual, British → American (exclude)

3. **Synonym Matching** (WordNet + custom lexicon):
   - Semantic similarity threshold: >0.7
   - POS match (verb→verb, adj→adj)
   - Register consistency

4. **Collocation-based**:
   - Extract common word partners
   - Ensure grammatical fit

**Validation Gates**:
- ✅ Semantic similarity >0.7 (against original)
- ✅ POS category match
- ✅ Register consistency (formal/neutral/casual)
- ✅ British English compliance (spelling, vocabulary)
- ✅ Edit distance >2 (not too similar to original)
- ✅ Length similarity (±50% word count)

**Minimum**: 3 alternatives per blank
**Target**: 4-5 alternatives per blank

**Fallback Generation** (if <3 validated):
- Use dictionary definitions as broad alternatives
- Include common collocations
- Accept MEDIUM confidence for this blank

**Output**: 3-5 validated alternatives per blank

### Phase 5: Deep Dive Insight Generation
**Input**: Selected blanks with alternatives
**Insight Components** (for 30-40% of blanks):

1. **Grammar Explanation**:
   - What linguistic structure is this?
   - Why does it matter in English?
   - Example: "Modal 'trying to' expresses ongoing effort toward a goal"

2. **Usage Context**:
   - When do native speakers use this?
   - Formal/casual/neutral?
   - Spoken vs written?

3. **Collocations**:
   - What words commonly pair with this?
   - "trying to + infinitive", "missing + object"

4. **IELTS Relevance**:
   - Which IELTS band (4.0-9.0)?
   - Speaking vs Writing focus?
   - Common in exam tasks?

5. **Common Learner Errors**:
   - What mistakes do learners make?
   - ❌ Incorrect vs ✓ Correct patterns

**Output**: JSON deepDive array (3-4 insights per script)

## Quality Validation Checklist

Before outputting blanked script, verify all items:

### Linguistic & Grammar ✅
- [ ] Blank density 20-30% achieved (within ±2%)
- [ ] ≥60% of blanks target verbs/idioms/expressions (pedagogical focus)
- [ ] No adjacent blanks (minimum 2-word separation verified)
- [ ] POS tags 100% accurate (spot-check 10 random)
- [ ] All blanks grammatically sound (sound test: can native read it?)

### Alternatives & Validation ✅
- [ ] Every blank has 3-5 validated alternatives
- [ ] Alternatives pass semantic similarity check (>0.7)
- [ ] POS category matches (verb→verb, adj→adj)
- [ ] Register consistency maintained (formal/casual paired)
- [ ] No duplicate alternatives within same blank
- [ ] Edit distance >2 for each alternative (not too close to original)

### IELTS & Cambridge Standards ✅
- [ ] LOCKED_CHUNKS compliance ≥80% (Bucket A/B alignment)
- [ ] Difficulty distribution matches target CEFR level
- [ ] All blanks either Cambridge corpus or validated pedagogical
- [ ] Deep dive insights provided for 30-40% of blanks
- [ ] Common learner errors documented for 50%+ of blanks
- [ ] IELTS band relevance identified for all deep dives

### British English & Register ✅
- [ ] All alternatives use British spelling (-ise, -our, -re, -l-)
- [ ] British vocabulary enforced (lift not elevator, flat not apartment)
- [ ] Register consistency verified (formal pairs with formal, casual with casual)
- [ ] Tone appropriate for dialogue context throughout
- [ ] No American English variants (color→colour, organization→organisation)

### Technical & JSON ✅
- [ ] RoleplayScript JSON structure valid (schema matches)
- [ ] Answer indices align perfectly with dialogue blanks (1:1 mapping)
- [ ] No skipped or duplicate indices
- [ ] All speaker names in answerVariations match dialogue
- [ ] metadata section complete and accurate
- [ ] No undefined or null values in required fields

### Confidence & Auto-Fixing ✅
- [ ] HIGH confidence items (≥95%): auto-applied if enabled
- [ ] MEDIUM confidence items (70-94%): flagged for user review
- [ ] LOW confidence items (<70%): reported as warnings only
- [ ] Confidence scores assigned consistently
- [ ] Summary stats: high_count, medium_count, low_count logged

## Integration Workflow: When & How to Use

### Scenario 1: Quality Issue with Tool 2 Output

**Trigger**: You receive poorly-blanked dialogue from YouTube Transcript Extractor Tool 2
- Dense blanks (random distribution)
- Low pedagogical value
- Missing alternatives
- No IELTS alignment

**Workflow**:
```
1. Extract raw dialogue from Tool 2 output
2. Run /linguistic-blank-inserter with:
   - target_blank_density: 25 (override Tool 2's 9%)
   - focus_types: VERB,IDIOM,EXPRESSION (override random)
   - difficulty_level: B2 (IELTS target)
   - strictness: standard (reasonable validation)
   - enable_auto_fix: yes (fix HIGH confidence items)
3. Review output (1-2 minutes)
4. Load into FluentStep for testing
5. Deploy to learners
```

**Time saved**: 3.75 hours → 15 minutes (93% reduction)

### Scenario 2: Manual Blank Creation from Scratch

**Trigger**: You have a raw transcript and want to create blanks manually
- Tool 2 was skipped (not applicable)
- You're working with new video content
- Need Cambridge-quality output

**Workflow**:
```
1. Extract transcript to JSON (RoleplayScript format)
2. Run /linguistic-blank-inserter with default params
3. Review 30% of blanks spot-check
4. Accept recommendations
5. Load into FluentStep
```

**Time saved**: 4 hours → 10 minutes (96% reduction)

### Scenario 3: Batch Processing Multiple Dialogues

**Trigger**: You have 20 raw transcripts needing blanks

**Workflow**:
```bash
for file in transcripts/*.json; do
  /linguistic-blank-inserter "$file" "25" "VERB,ADJ,ADV,IDIOM" "B2" "3" "standard" "yes" "yes"
done
```

**Time saved**: 80 hours → 5-6 hours total (93% reduction)

### Scenario 4: Exam-Focused Preparation (Strictest)

**Trigger**: Creating official IGCSE practice materials

**Workflow**:
```
/linguistic-blank-inserter exam_dialogue.json "28" "VERB,IDIOM,EXPRESSION,COLLOCATION" "B2" "4" "strict" "yes" "yes"
```

**Validation**: Requires ≥90% LOCKED_CHUNKS compliance before output

## Example Transformation

### BEFORE: Tool 2 Output (Poor Quality)

```json
{
  "dialogue": [
    {"speaker": "Jessica", "text": "________. ________ here. ________ channel."},
    {"speaker": "Customer", "text": "Yes, I'm trying to make a cake..."},
    {"speaker": "Shop Assistant", "text": "Yes, you got it right—flour!"}
  ],
  "answerVariations": [
    {"index": 0, "answer": "Welcome back", "alternatives": []},
    {"index": 1, "answer": "It's Jessica", "alternatives": []},
    {"index": 2, "answer": "Welcome to my", "alternatives": []}
  ]
}
```

**Issues**:
- 9% blank density (3 of 33 turns)
- Random nouns (Welcome, Jessica, my)
- Zero alternatives
- 67% LOCKED_CHUNKS compliance
- No pedagogical value

### AFTER: /linguistic-blank-inserter Output (Cambridge Grade)

```json
{
  "dialogue": [
    {"speaker": "Jessica", "text": "Welcome back. It's Jessica here. Welcome to my channel."},
    {"speaker": "Customer", "text": "Yes, I'm ________ to make a cake, but I'm ________ a few things."},
    {"speaker": "Shop Assistant", "text": "Yes, you ________ it right—flour!"}
  ],
  "answerVariations": [
    {
      "index": 0,
      "answer": "trying",
      "alternatives": ["attempting", "planning", "wanting", "hoping"],
      "confidence": "HIGH",
      "pos": "VERB",
      "cefr_level": "B1"
    },
    {
      "index": 1,
      "answer": "missing",
      "alternatives": ["lacking", "short of", "needing", "without"],
      "confidence": "HIGH",
      "pos": "VERB",
      "cefr_level": "B1"
    },
    {
      "index": 2,
      "answer": "got",
      "alternatives": ["guessed", "named", "identified", "said"],
      "confidence": "MEDIUM",
      "pos": "VERB",
      "cefr_level": "A1"
    }
  ],
  "deepDive": [
    {
      "index": 0,
      "phrase": "trying to",
      "grammar_type": "MODAL_INFINITIVE",
      "explanation": "Modal + infinitive expressing ongoing effort toward goal. Essential for describing intentions and current efforts in English.",
      "usage_context": "Very common in IELTS Speaking Part 3 (abstract topics). Used when describing what people are attempting to do.",
      "collocations": ["trying to understand", "trying to achieve", "trying to explain", "trying to improve"],
      "ielts_relevance": "Band 6-7 (intermediate-upper intermediate). Demonstrates understanding of auxiliary verbs.",
      "common_errors": "❌ 'trying for' (incorrect), ❌ 'try to' in past (must be 'tried to'), ✓ 'trying to' (correct)",
      "example": "I'm trying to improve my English speaking skills. | They're trying to make the project successful."
    },
    {
      "index": 1,
      "phrase": "missing",
      "grammar_type": "VERB_PRESENT_CONTINUOUS",
      "explanation": "Present continuous of 'miss' (lack/not have) - different from 'miss' (feel absence of person). Context determines meaning.",
      "usage_context": "Common in shopping contexts and problem-solving discussions. Spoken English preference.",
      "collocations": ["missing + object", "missing some items", "missing a few things", "missing an ingredient"],
      "ielts_relevance": "Band 5-6 (intermediate). Shows vocabulary range in practical situations.",
      "common_errors": "❌ Confusing 'missing' (lack) with 'miss' (feel absence) - 'I'm missing my family' means I don't have them with me, 'I'm missing flour' means I don't have flour",
      "example": "I'm missing some flour for the cake. | They're missing key information for the decision."
    }
  ],
  "metadata": {
    "blank_density_target": 0.25,
    "blank_density_achieved": 0.27,
    "total_blanks_inserted": 9,
    "grammar_distribution": {
      "VERB": 6,
      "IDIOM": 1,
      "EXPRESSION": 2
    },
    "locked_chunks_compliance": 0.85,
    "validation_status": "PASS",
    "auto_fixed_high": 2,
    "flagged_medium": 1,
    "warnings_low": 0,
    "processing_time_seconds": 2.3
  }
}
```

**Improvements**:
- ✅ 27% blank density (up from 9%)
- ✅ 100% verb/expression focus (up from random)
- ✅ 4 alternatives per blank (up from 0)
- ✅ 85% LOCKED_CHUNKS compliance (up from 67%)
- ✅ 2 deep dive insights generated
- ✅ HIGH confidence auto-fixes applied
- ✅ Ready for production deployment

## Limitations & When NOT to Use

### ❌ Don't Use For:

1. **Non-English Dialogues**
   - Skill is English-specific (spaCy en_core_web_sm)
   - Would require language detection + model swapping

2. **Technical/Highly Specialized Content**
   - Medical/legal/engineering jargon may not match LOCKED_CHUNKS
   - Consider: manually verify alternatives for domain-specific terms

3. **Very Short Dialogues** (<10 turns)
   - Statistical distribution becomes unreliable
   - Consider: use manually or accept lower blank count

4. **Pre-blanked Content** (already has blanks)
   - Skill expects raw dialogue input
   - Consider: use /validate-scenario to audit existing blanks instead

5. **Non-Pedagoical Content** (marketing, narratives, creative writing)
   - Optimized for IELTS/Cambridge exam prep
   - Grammar-heavy approach may not suit narrative flow
   - Consider: use standard blank insertion tools instead

### ✅ Best For:

1. **IELTS Speaking Practice Materials**
   - B1-B2 conversation scenarios
   - Cue cards and follow-up questions

2. **Cambridge IGCSE English Preparation**
   - Conversation-based learning
   - Grammar/vocabulary focus materials

3. **EFL/ESL Textbooks**
   - Interactive dialogue exercises
   - Multi-turn conversation practice

4. **Conversation-Heavy Learning Paths**
   - Customer service training
   - Real-life scenario practice

## Success Criteria & Validation

A successfully blanked script should meet ALL of these:

✅ **Density**: 20-30% (±2% acceptable)
✅ **Grammar Focus**: ≥60% verbs/idioms/expressions
✅ **Alternatives**: 3-5 per blank, 100% validated
✅ **Cambridge Alignment**: ≥80% LOCKED_CHUNKS compliance
✅ **Difficulty**: Matches target CEFR level (±1 acceptable)
✅ **British English**: 100% compliance (spelling, vocabulary)
✅ **Register**: Consistent throughout dialogue
✅ **Technical**: Valid JSON, no errors, ready for production
✅ **IELTS Insights**: 30-40% of blanks with deep dive
✅ **Confidence**: Clear scoring (HIGH/MEDIUM/LOW)

## Time Savings

**Manual Blank Insertion Process**:
- Linguistic analysis: 45 min/dialogue
- Blank selection: 30 min/dialogue
- Alternative generation: 45 min/dialogue
- Validation & polishing: 30 min/dialogue
- **Total: ~2.5 hours per dialogue**

**With `/linguistic-blank-inserter`**:
- Execution: 2-3 minutes
- Review & approval: 10-15 minutes
- **Total: ~15 minutes per dialogue**

**Savings per dialogue**: 2.25 hours (90% reduction)
**Across 20 dialogues**: 45 hours saved
**Across 100 dialogues**: 225 hours saved

## Next Steps

1. **Try it**: Run on enriched_english_conversations.json (33 turns)
2. **Review**: Check blank density, alternatives, deep dives
3. **Validate**: Run /validate-scenario on output
4. **Deploy**: Load into FluentStep for browser testing
5. **Iterate**: Adjust parameters if needed (density, focus types, difficulty)

## Support & Troubleshooting

### Output Has Low Blank Density (<20%)

**Cause**: Dialogue too short or insufficient candidates
**Fix**:
- Increase `min-alternatives` threshold (might reject more blanks)
- Lower `focus-types` to include ADJ/ADV
- Check source dialogue quality (ensure good vocabulary variety)

### Alternatives Don't Match Original Well

**Cause**: POS mismatch or semantic similarity threshold too high
**Fix**:
- Reduce minimum alternatives (3 instead of 4-5)
- Set strictness to "lenient"
- Enable auto-fix for MEDIUM confidence items

### LOCKED_CHUNKS Compliance Low (<80%)

**Cause**: Dialogue uses non-standard or specialized vocabulary
**Fix**:
- Increase `target-blank-density` to select from higher-scoring candidates
- Switch `difficulty-level` (some vocabulary A2-specific, not B2)
- Manually add missing chunks to VARIATION_MAPPINGS

### Deep Dive Insights Not Generating

**Cause**: `include-deep-dive` set to "no"
**Fix**: Set `include-deep-dive` to "yes"

---

**Status**: Production Ready ✅
**Last Updated**: 2025-02-08
**Cambridge Aligned**: Yes (IGCSE + IELTS focus)
**Time Savings**: 90% reduction (2.5 hrs → 15 min per dialogue)
