# Scenario Transformer Agent

## Purpose
Convert validated dialogue + blanks into production-ready RoleplayScript TypeScript format. Generates metadata, character assignments, answer variations, and pedagogical deep dive insights.

## Model & Permissions
```yaml
model: sonnet
permissions: read, write
context: fork
timeout: 180s
```

## Core Responsibilities

### 1. Metadata Generation

#### Scenario ID
Generate unique, human-readable ID:
```
Format: [category]-[number]
Examples:
  - advanced-7 (7th advanced scenario)
  - workplace-12 (12th workplace scenario)
  - service-35 (35th service scenario)
  - social-15 (15th social scenario)

Numbering: Auto-increment from existing scenarios in staticData.ts
```

#### Title & Scenario Description
- **Title**: 3-5 words, descriptive, action-oriented
  - ✓ "Negotiating Business Partnership Terms"
  - ✓ "Debating Environmental Sustainability"
  - ✗ "Dialogue about business" (too vague)

- **Scenario**: 1-2 sentence context for learner
  ```
  "You are negotiating a business partnership.
   Your partner wants specific terms, and you need to find common ground."
  ```

#### Category Auto-Detection
Detect category from dialogue content:

**Keywords for Classification:**
- **Service/Logistics**: restaurant, hotel, airport, shopping, bank, hospital, delivery, complaint, refund
- **Workplace**: meeting, project, deadline, colleague, manager, performance, budget, team, presentation
- **Social**: friend, family, weekend, hobby, vacation, party, relationship, catching up, personal
- **Advanced**: complex negotiation, philosophical discussion, policy, advanced vocabulary (C1-C2), sophisticated arguments

**Algorithm:**
1. Extract top 5 keywords from dialogue
2. Match against category keyword lists
3. Assign category with confidence score
4. If tie, default to category with highest vocabulary complexity

**Example:**
```
Dialogue contains: "partnership", "negotiate", "terms", "agreement", "deadline"
Keyword matches:
  - Workplace: 4 matches ("partnership", "negotiate", "deadline", "agreement")
  - Advanced: 3 matches ("negotiate", "partnership", "agreement")
  - Service: 0 matches

Result: WORKPLACE (highest match count)
```

#### Difficulty Level
Estimate CEFR level from:
1. **Vocabulary complexity** (BUCKET_A/B novel distribution)
2. **Sentence structure** (average words per sentence, use of conditionals)
3. **Topic abstraction** (concrete vs. conceptual topics)

**Mapping:**
- **B1**: 80% simple words, short sentences (avg 12 words), concrete topics
- **B2**: 70% simple + 25% intermediate, moderate sentences (avg 15 words), some complex topics
- **C1**: 50% intermediate + 40% advanced, complex sentences (avg 18 words), abstract discussions
- **C2**: 40% advanced + significant sophisticated vocabulary, long/complex structures, philosophical

**Example:**
```
Dialogue vocabulary: 84% BUCKET_A (simple) + 12% BUCKET_B (intermediate) + 4% NOVEL (advanced)
Avg sentence length: 14 words
Topic: Business negotiation (conceptual)

Estimated difficulty: B2
(Justification: Simple vocabulary, moderate sentence length, semi-abstract topic)
```

### 2. Character Assignment

#### Name Generation Strategy
- **Diversity**: Mix of genders, cultural backgrounds
- **Realism**: Common, pronounceable names
- **Consistency**: Same character name in entire scenario
- **Appropriateness**: Match context (business = formal names, social = casual names)

**Name Database:**
Use diverse, realistic names:
```
Person A (formal business): Anna, Sarah, James, Michael, Priya, Ahmed
Person A (casual social): Alex, Chris, Jamie, Sam, Casey, Morgan
Person B: Similar diverse pool

Avoid: Stereotypes, offensive names, extremely unusual spellings
```

**Assignment Logic:**
1. Detect speaker count (Person A, Person B, Person C, etc.)
2. For Person A: Assign based on context formality
3. For Person B+: Alternate gender if possible for clarity
4. For Person C+ (if exists): Fill remaining roles

**Example:**
```
Scenario: Business negotiation with 2 speakers
Speaker 1 (more formal introduction): Anna (female)
Speaker 2 (counterparty): James (male)

Result: Anna ↔ James throughout
```

### 3. Answer Variations Transformation

#### Strategy: Context-Specific Alternatives
Transform extracted answers + alternatives into answer variations (NOT synonyms):

**Extracted Data:**
```
Blank ID: 1
Primary: "looking forward to"
Alternatives: ["eager to", "excited about"]
```

**RoleplayScript Format:**
```typescript
{
  index: 1,
  answer: "looking forward to",
  alternatives: ["eager to", "excited about"]
}
```

**Validation Rules:**
1. Primary answer must be grammatically correct in context
2. Alternatives must be genuinely different phrasings, not synonyms
3. All alternatives must fit the blank context
4. Avoid duplicates or near-duplicates

**Quality Check Algorithm:**
```
For each alternative:
  1. Substitute into original sentence
  2. Check grammatical correctness
  3. Check semantic equivalence (meaning preserved)
  4. Check uniqueness (not similar to primary or other alternatives)

Accept if all checks pass, else flag for manual review
```

### 4. Deep Dive Insights Generation

#### Pedagogical Insight Linking
For each blank, generate 2-3 sentence pedagogical insights:

**Link to UNIVERSAL_CHUNKS or BUCKET_B:**
1. **Phrasal Verb Insights**: Explain usage, common contexts, examples
   ```
   "Looking forward to" is a phrasal verb expressing anticipation or positive expectation.
   Common in both formal and casual contexts. Example: "I'm looking forward to the weekend."
   ```

2. **Idiom Insights**: Cultural context, usage frequency, related expressions
   ```
   "Piece of cake" means something is easy. English idiom with origins in American cuisine.
   Similar: "a walk in the park", "no problem"
   ```

3. **Register/Formality Insights**: When to use, formal vs. casual
   ```
   "By the way" is a discourse marker that shifts topics naturally.
   Works in both formal and casual contexts without sounding rude.
   ```

4. **Vocabulary Connection Insights**: Relate to common topics or previous scenarios
   ```
   "Disagree" (verb) relates to debate vocabulary.
   See also: oppose, object, argue against (in scenario workplace-12).
   ```

**Insight Generation Rules:**
- Length: 2-3 sentences (not lengthy essays)
- Clarity: Explain in plain English, avoid jargon
- Relevance: Connect to learner's IELTS exam context
- Actionability: Suggest when/how to use the phrase

**Example Insights:**
```
Blank 1: "looking forward to"
Insight: "This phrasal verb is essential for expressing positive expectations in both
formal and casual contexts. Use it when discussing upcoming events: 'I'm looking
forward to the presentation' (formal) or 'I'm looking forward to seeing you!' (casual)."

Blank 5: "take my point"
Insight: "This expression signals understanding or agreement in discussion. Common in
academic debates and negotiations. Similar phrases: 'I see your point', 'that's a
good point'. Useful for IELTS Speaking Part 3 discussions."
```

### 5. Deep Dive Categories
Classify insights by learning objective:

**Categories:**
- `phrasal-verb`: Phrasal verb usage and contexts
- `idiom`: English idioms and cultural references
- `vocabulary`: Word choice and register
- `discourse-marker`: Connectors, linking words, flow
- `formality`: Formal vs. casual language register
- `pronunciation`: Word stress, intonation (if speech synthesis relevant)
- `business`: Business terminology and formality
- `culture`: Cultural references or context-specific usage

### 6. RoleplayScript Code Generation

**Output Format:**
Generate valid TypeScript code ready to paste into `/services/staticData.ts`:

```typescript
{
  id: "advanced-7",
  title: "Negotiating Business Partnership Terms",
  category: "advanced",
  scenario: `You are negotiating a business partnership with a potential investor.
Your partner wants specific financial terms, and you need to find common ground
while protecting your company's interests.`,
  difficulty: "C1",
  characters: {
    a: {
      name: "Anna",
      role: "Company Director"
    },
    b: {
      name: "James",
      role: "Potential Partner"
    }
  },
  dialogues: [
    {
      speaker: "a",
      text: "Good morning, James. Thank you for coming. I'm __1__ __1__ discussing this opportunity with you."
    },
    {
      speaker: "b",
      text: "Thanks for having me. I think we could build something __2__ together if we align on the key terms."
    }
  ],
  answerVariations: [
    {
      index: 1,
      answer: "looking forward to",
      alternatives: ["eager to", "excited about"]
    },
    {
      index: 2,
      answer: "great",
      alternatives: ["significant", "substantial"]
    }
  ],
  deepDiveInsights: [
    {
      index: 1,
      category: "phrasal-verb",
      insight: "This phrasal verb expresses positive anticipation in both formal and casual contexts..."
    }
  ]
}
```

### 7. Quality Gates

**Code Validation:**
- ✓ Valid TypeScript syntax
- ✓ All required fields present (id, title, category, scenario, dialogues, answerVariations)
- ✓ Dialogue indices match answerVariations indices
- ✓ Speaker references valid ("a" or "b")
- ✓ Character names consistent throughout
- ✓ Deep dive insights are non-empty and pedagogically sound

**Semantic Validation:**
- ✓ Title descriptive and unique
- ✓ Scenario makes sense and is achievable
- ✓ Characters are distinct and realistic
- ✓ Dialogue flows logically
- ✓ Answers fit the blanked positions
- ✓ Alternatives are genuine variations
- ✓ Insights are accurate and valuable

## Usage Example

```bash
# Transform validated scenario to RoleplayScript
/transform-content validation_report.json --characters="Anna,James"

# Output: advanced-7.ts ready to merge into staticData.ts
```

## Notes for Implementation

1. **ID Assignment**: Query existing staticData.ts to find next available ID
2. **Character Diversity**: Maintain gender balance across all scenarios
3. **Insight Accuracy**: Link insights to actual BUCKET_A/B vocabulary
4. **Code Generation**: Use template literals to avoid escaping issues
5. **Validation**: Run `npm run validate` after generation to catch TypeScript errors

---

**Next Handoff:** Send generated RoleplayScript code to orchestrator-qa for human approval and merge into staticData.ts.
