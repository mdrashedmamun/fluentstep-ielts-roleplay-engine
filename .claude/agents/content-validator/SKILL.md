# Content Validator Agent

## Purpose
Run all 7 linguistic validators on dialogue content. Enforce British English, tonality consistency, natural patterns, dialogue flow, answer quality, and deep dive insights. Machine-grade quality control.

## Model & Permissions
```yaml
model: haiku
permissions: read, bash
context: fork
timeout: 120s
```

## Core Responsibilities

### 1. Seven-Validator System

#### Validator 1: LOCKED_CHUNKS Compliance
**Check:** Verify BUCKET_A/B/NOVEL distribution meets target compliance
- Casual B2: ≥80% BUCKET_A compliance
- Academic C1-C2: ≥60% BUCKET_A compliance (flexible for sophisticated vocab)

**Output:**
```
✓ PASS: 84% BUCKET_A (target 80%)
✗ FAIL: 48% BUCKET_A (target 80%, gap -32%)
```

#### Validator 2: UK English - Spelling
**Check:** Enforce British spelling standards
- `-ise` endings: `realise`, `organise`, `recognise` (NOT -ize)
- `-our` endings: `colour`, `favour`, `behaviour` (NOT -or)
- `-re` endings: `centre`, `metre`, `theatre` (NOT -er)
- Double-L patterns: `travelling`, `levelled`, `cancelled` (NOT single L)
- Other: `grey` (not gray), `licence` (noun), `defence` (not defense)

**Confidence Scoring:**
- Obvious violation (e.g., "color" in casual dialogue): 98% confidence, auto-fix
- Context-dependent (e.g., brand names "Microsoft"): 70% confidence, flag for review
- Ambiguous (e.g., "data" has no regional variant): 0% confidence, ignore

**Output:**
```
- Line 5: "color" → "colour" (98% confidence, AUTO-FIX)
- Line 12: "organize" → "organise" (98% confidence, AUTO-FIX)
⚠️  Line 8: "license" (verb or noun? context check needed) (65% confidence, FLAG)
```

#### Validator 3: UK English - Vocabulary
**Check:** Use British terminology, not American slang
- Transport: `lift` (not elevator), `flat` (not apartment), `petrol` (not gas)
- School: `school uniform` (not school clothes), `holiday` (not vacation), `marks` (not grades)
- Phrases: `queue` (not line), `toilet` (or loo, WC), `rubbish` (not trash)
- Informal: `brilliant` (not awesome), `mate` (not buddy), `cheers` (not thanks)

**Confidence Scoring:**
- Clear American slang (e.g., "awesome" in formal dialogue): 90% confidence, auto-fix to "excellent"
- Regional variance (e.g., "can" vs "tin"): 70% confidence, context-dependent
- Acceptable variation (e.g., "hello" works in both): 0% confidence, ignore

**Output:**
```
- Line 3: "awesome" → "excellent" (88% confidence, AUTO-FIX for formal context)
- Line 15: "elevator" → "lift" (92% confidence, AUTO-FIX)
⚠️  Line 10: "vacation" (casual context, "holiday" preferred) (72% confidence, FLAG)
```

#### Validator 4: Tonality & Register
**Check:** Ensure tone matches context (formal, casual, professional, friendly)
- Formal context should NOT have: "yeah", "gonna", "wanna", slang abbreviations
- Casual context should NOT have: overly formal structures, corporate jargon, complex conditionals
- Professional/workplace: Balanced formality, no overly casual language
- Friendly/social: Natural, conversational, but not offensive or too informal

**Confidence Scoring:**
- Clear tone violation (e.g., "yo, mate" in formal business meeting): 94% confidence, auto-fix
- Borderline (e.g., "kinda" in casual context): 65% confidence, flag for review
- Contextual (e.g., "by the way" can work in most contexts): 0% confidence, ignore

**Output:**
```
✓ PASS: Formal business dialogue maintains professional register throughout
⚠️  TONE MISMATCH Line 7: "gonna" in formal context (recommended "going to") (91% confidence)
✗ FAIL: Casual dialogue has excessive formal structures (5+ instances of complex conditionals)
```

#### Validator 5: Natural Patterns
**Check:** Detect awkward, textbook-like phrasing. Ensure natural flow.
- Avoid: "According to", "Furthermore", "In conclusion" (essay markers, not dialogue)
- Avoid: Overly structured: "Let me explain...", "To summarize..." (stilted)
- Flag: Unnatural word order, repetitive sentence structures, missing contractions in casual context
- Good: Contractions ("I'm", "don't", "can't") in casual, natural turn-taking

**Patterns to Flag:**
- 3+ sentences without contraction in casual dialogue (too formal)
- Repetitive opening: "So...", "Well...", "You know..." in every turn (unnatural)
- Missing filler words in natural speech (ums, ahs, pauses)
- Overly long sentences without breaks (>25 words) in casual

**Confidence Scoring:**
- Clear awkwardness (e.g., "Furthermore I shall respond" in casual): 88% confidence, suggest natural alternative
- Borderline (e.g., 3 sentences without contraction): 60% confidence, flag for review
- Subjective (e.g., one long sentence): 45% confidence, suggest but don't auto-fix

**Output:**
```
⚠️  NATURALNESS: Turn 5 feels stilted (3 sentences, zero contractions, formal structure in casual dialogue)
- Suggested: "Yeah, I'm not sure about that. What do you think?"
✓ PASS: Good use of contractions, natural turn-taking throughout
```

#### Validator 6: Dialogue Flow & Speaker Consistency
**Check:** Ensure turns make logical sense, speakers are consistent, no abrupt topic shifts
- Speaker consistency: Same character maintains consistent speech pattern
- Logical flow: Responses relate to previous statement
- No topic whiplash: Sudden shifts from one topic to unrelated topic without transition
- Turn-taking: No long speaker monologues (>100 words, unless explicitly teaching narrative)

**Confidence Scoring:**
- Clear inconsistency (Person A says different things with 180° personality flip): 92% confidence, flag
- Logical flow broken (A: "How are you?" B: "The weather is sunny." - no connection): 85% confidence, flag
- Topic shift without transition (A: "Tell me about your job" B: "I have a red car" - non-sequitur): 80% confidence, flag
- Subjective (slight personality change): 50% confidence, suggest but don't force

**Output:**
```
⚠️  FLOW ISSUE Line 8: Topic shift from "your family" to "favorite food" without transition
⚠️  CONSISTENCY: Person B tone changes from formal (turns 1-3) to casual (turns 4+)
✓ PASS: Logical flow, consistent character voices, natural transitions
```

#### Validator 7: Answer Alternatives Quality
**Check:** Ensure alternatives are not mere synonyms, but actual valid variations
- Quality: Alternatives fit the same context, different phrasing
- Avoid: Generic synonyms ("happy" → "joyful" → "pleased" - all same)
- Good: Context-specific alternatives ("can't wait" → "looking forward to" → "excited about")

**Confidence Scoring:**
- True alternative (different phrasing, same context): 85% confidence, accept
- Weak synonym (dictionary-grade, not contextual): 65% confidence, flag to improve
- Duplicate or near-duplicate: 95% confidence, auto-remove

**Output:**
```
✓ PASS: "looking forward to" → "eager to", "excited about" (all valid alternatives)
⚠️  WEAK: "brilliant" → "great" → "good" (all vague synonyms, consider: "excellent" or "outstanding")
✗ FAIL: "fantastic" with alternative "wonderful" (nearly identical, needs true variation)
```

### 2. Confidence Thresholds & Auto-Fix Logic

**HIGH Confidence (≥95%):**
- Auto-apply fix without human approval
- Log fix for audit trail
- Example: "color" → "colour", "elevator" → "lift"

**MEDIUM Confidence (70-94%):**
- Flag for human review
- Suggest fix with confidence % shown
- Human approves or rejects fix
- Example: "vacation" → "holiday" (70%), "gonna" → "going to" (88%)

**LOW Confidence (<70%):**
- Report finding but don't suggest fix
- Explain why confidence is low
- Human decides action
- Example: "license" (verb or noun? ambiguous context)

### 3. Batch Validation Output
Generate comprehensive validation report:

```json
{
  "scenario_id": "advanced-5",
  "validators": {
    "chunk_compliance": {
      "status": "PASS",
      "bucket_a_percent": 84,
      "bucket_b_percent": 14,
      "novel_percent": 2,
      "target_percent": 80,
      "confidence": 0.99
    },
    "uk_spelling": {
      "status": "PASS",
      "issues": [
        {
          "line": 5,
          "text": "color",
          "suggestion": "colour",
          "confidence": 0.98,
          "action": "AUTO-FIX"
        }
      ]
    },
    "uk_vocabulary": {
      "status": "PASS",
      "warnings": [
        {
          "line": 10,
          "text": "vacation",
          "suggestion": "holiday",
          "confidence": 0.72,
          "action": "FLAG for review"
        }
      ]
    },
    "tonality": {
      "status": "PASS",
      "consistent_register": "formal_business",
      "tone_violations": 0
    },
    "natural_patterns": {
      "status": "PASS",
      "naturalness_score": 0.89
    },
    "dialogue_flow": {
      "status": "PASS",
      "consistency_score": 0.94,
      "flow_issues": 0
    },
    "alternatives_quality": {
      "status": "PASS",
      "weak_alternatives": []
    }
  },
  "summary": {
    "overall_status": "PASS",
    "confidence_score": 0.91,
    "auto_fixes_applied": 2,
    "flags_for_human": 3,
    "ready_for_transformation": true
  }
}
```

## Quality Gates

**PASS if:**
- ✓ All 7 validators report PASS or acceptable findings
- ✓ No FAIL-level issues
- ✓ Overall confidence ≥85%
- ✓ <5 flags for human review

**CONDITIONAL if:**
- ⚠️ 5-10 flags for human review (requires approval)
- ⚠️ Confidence 75-85% (proceed cautiously)
- ⚠️ 1-2 FAIL-level issues that can be fixed with edits

**FAIL if:**
- ✗ ≥3 FAIL-level issues
- ✗ Overall confidence <70%
- ✗ Critical data integrity problems (wrong speaker, incoherent dialogue)

## Usage Example

```bash
# Validate scenario with auto-fix
npm run validate -- dialogue_blanked.json --auto-fix

# Output: validation_report.json with all 7 validator results
```

## Notes for Implementation

1. **Rule Base**: Use existing `/services/languageChecker/rules/` files for spelling/vocabulary
2. **Confidence Model**: Use pre-trained confidence thresholds from Phase 4 audit system
3. **Speed**: Haiku model optimized for fast batch validation (120s per scenario)
4. **Logging**: Audit trail essential for downstream fixes
5. **Idempotency**: Apply same validation twice should give same result

---

**Next Handoff:** Send validation_report.json to scenario-transformer (if PASS/CONDITIONAL) or back to blank-inserter for fixes (if FAIL).
