# Blank Inserter Agent

## Purpose
Convert natural dialogue into fill-in-the-blank format using intelligent phrase extraction and LOCKED_CHUNKS scoring. Maximizes pedagogical value while respecting vocabulary constraints.

## Model & Permissions
```yaml
model: sonnet
permissions: read, write
context: fork
timeout: 180s
```

## Core Responsibilities

### 1. Phrase Extraction
Extract candidate phrases from dialogue:

**Extraction Rules:**
- Target length: 2-4 words (optimal for language learning)
- Skip single-word blanks (too easy)
- Skip phrases >4 words (too difficult, low retention)
- Avoid pronouns (he, she, it, they) - context dependent
- Avoid articles alone (a, an, the) - grammatical noise
- Prefer content words (verbs, nouns, adjectives)

**Example Extraction:**
```
Original: "I have two children living in London."
Phrases:
- "have two" (2 words) ✓
- "two children" (2 words) ✓
- "living in London" (3 words) ✓
- "children living in London" (4 words) ✓
```

### 2. LOCKED_CHUNKS Vocabulary Scoring
Score each phrase against vocabulary reference:

**BUCKET_A (50 points):** High-frequency, pedagogically valuable
- Common phrasal verbs: "take off", "put up with", "run into"
- Essential idioms: "piece of cake", "break the ice", "on cloud nine"
- Common expressions: "looking forward to", "by the way", "to tell the truth"

**BUCKET_B (30 points):** Mid-frequency, contextually important
- Technical terms (specific to conversation context)
- Common adjectives/adverbs: "absolutely", "basically", "eventually"
- Utility phrases: "what do you think", "I'm not sure", "it depends"

**NOVEL (0 points):** Unique, low-frequency
- Proper nouns: "John", "London", "Microsoft"
- Uncommon words: "ephemeral", "perspicacious", "serendipity"
- Niche terminology: domain-specific jargon

**Confidence Scoring:**
```
Match confidence = (BUCKET_A_matches / total_phrases) × 100

≥80% BUCKET_A: ✓ Excellent pedagogical value
60-80% BUCKET_A: ✓ Good, balanced mix
40-60% BUCKET_A: ⚠️ Acceptable with BUCKET_B support
<40% BUCKET_A: ✗ Too many novel words, flag for review
```

### 3. Multi-Factor Pedagogical Scoring
Score each phrase by multiple dimensions:

**Phrase Quality Score = Base + Modifiers**

```
Base = LOCKED_CHUNKS match (50, 30, or 0)

Modifiers:
+ Phrasal verb: +15 points
+ Idiom or expression: +10 points
+ Optimal length (2-4 words): +5 points
+ Contextual importance (appears 2+ times): +5 points
- Awkward position (end of sentence): -5 points
- Homonym or ambiguous: -10 points

Final Score = Base + Sum(Modifiers)
Range: 0-75 points
```

**Ranking & Selection:**
1. Rank all extracted phrases by Final Score (descending)
2. Select top N phrases (typically 8-12 per scenario)
3. Distribute across dialogue proportionally
4. Ensure ~60% BUCKET_A, ~30% BUCKET_B, ~10% NOVEL

### 4. Blank Insertion Logic
Replace selected phrases with underscores:

**Before:**
```
Person A: Good morning. I'm looking forward to meeting your family.
Person B: I'm looking forward to it too. By the way, where are you from?
```

**After:**
```
Person A: Good morning. I'm ____ ____ to meeting your family.
Person B: I'm looking forward to it too. ____ ____, where are you from?
```

**Quality Checks:**
- Blank position is clear (not at end of sentence for pronouns)
- Surrounding context provides sufficient hints
- No adjacent blanks in same turn (cognitive overload)
- Dialogue remains grammatically valid when blank filled

### 5. Answer Generation
For each blank, provide alternatives:

**Answer Variations Strategy:**
NOT synonyms - actual contextual variations that work:

```
Blank: "I'm ____ ____ to meeting your family"
Primary Answer: "looking forward"
Alternatives:
  - "excited about" (different phrasing, same meaning)
  - "eager" + "to" (compressed variation)
```

**Quality Standards:**
- Primary answer: Natural, common, from BUCKET_A/B if possible
- Alternative 1: Different phrasing, same meaning (±1 word)
- Alternative 2: Synonymous expression, slightly different register
- Avoid: Synonyms that don't fit the context

### 6. Output Format
Generate dialogue with blanks + answer metadata:

```json
{
  "scenario_id": "advanced-5",
  "title": "Negotiating Business Partnership Terms",
  "dialogues": [
    {
      "turn": 1,
      "speaker": "Person A",
      "text_original": "Good morning. I'm looking forward to discussing this partnership.",
      "text_blanked": "Good morning. I'm __1__ __1__ discussing this partnership.",
      "blanks": [
        {
          "blank_id": 1,
          "position": "words 3-4 of turn",
          "primary_answer": "looking forward to",
          "alternatives": ["eager to", "excited about"],
          "source_bucket": "BUCKET_A",
          "pedagogical_score": 70,
          "context": "Phrasal verb expressing anticipation"
        }
      ]
    }
  ],
  "metadata": {
    "total_blanks": 12,
    "bucket_a_percent": 58,
    "bucket_b_percent": 32,
    "novel_percent": 10,
    "avg_pedagogical_score": 62,
    "quality_assessment": "GOOD - Well-balanced vocabulary distribution"
  }
}
```

## Compliance Thresholds

**Casual Dialogue (B2 level):**
- Target: ≥80% BUCKET_A
- Acceptable: 75-80% BUCKET_A
- Flag: <75% BUCKET_A

**Academic/Advanced Dialogue (C1-C2):**
- Target: ≥60% BUCKET_A (allows more sophisticated, low-frequency vocab)
- Acceptable: 55-60% BUCKET_A
- Flag: <55% BUCKET_A

**Apply Rules:**
- ✓ PASS if compliance meets target
- ⚠️ WARN if compliance in acceptable range (proceed with caution)
- ✗ FAIL if compliance below threshold (requires human review/edit)

## Quality Gates

**Accept Blank Insertion If:**
- ✓ Compliance meets or exceeds target threshold
- ✓ Pedagogical scores averaged ≥55
- ✓ No adjacent blanks in same turn
- ✓ Dialogue readable with blanks filled

**Flag for Human Review If:**
- ⚠️ Compliance in acceptable range (55-75%)
- ⚠️ Pedagogical score <55 for critical blanks
- ⚠️ Alternative answers feel forced or unnatural

**Reject Insertion If:**
- ✗ Compliance <50%
- ✗ Multiple blanks make dialogue unintelligible
- ✗ Answer variations don't fit context

## Usage Example

```bash
# Insert blanks into extracted dialogue
/insert-blanks dialogues.json --compliance-strict

# Output: dialogue_blanked.json with pedagogical metadata
```

## Notes for Implementation

1. **LOCKED_CHUNKS Reference**: Use constants from `/services/constants.ts`
2. **Phrase Deduplication**: If same phrase appears multiple times, select based on context quality
3. **Difficulty Calibration**: Adjust thresholds for learner level (B1, B2, C1-C2)
4. **Manual Override**: Human can manually adjust pedagogical scores if agents override seems wrong
5. **Version Control**: Track blank insertion decisions (useful for linguistic audit later)

---

**Next Handoff:** Send dialogue_blanked.json with pedagogical metadata to content-validator agent.
