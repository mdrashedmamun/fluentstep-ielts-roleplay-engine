# Pattern Summary Enrichment Template

This template guides authors through enriching exported scenarios with consolidated pattern insights. Use this as a reference when manually editing exported markdown files before importing them back into `staticData.ts`.

---

## 📋 File Structure Overview

### File Header (REQUIRED AT TOP)
Every enriched markdown file must start with this header:

```markdown
# Category: <CATEGORY_NAME>
# Source file: <FILENAME>.md
# Scenarios included: <count>
```

**Example**:
```markdown
# Category: Social
# Source file: Social.md
# Scenarios included: 5
```

**Valid Categories** (one per file):
- Academic
- Advanced
- Community
- Cultural
- Healthcare
- Service-Logistics
- Social
- Workplace

---

## 🎯 Per-Scenario Enrichment Block

After each scenario's existing exported content (dialogue, answers, feedback), add a YAML enrichment block:

```yaml
patternSummary:
  categoryBreakdown:
    - category: "Openers"
      count: 1
      examples: ["meet"]
      insight: "First impressions prioritize warmth over formality."
    - category: "Idioms"
      count: 1
      examples: ["keep track"]
      insight: "Fixed collocations signal fluency and control."

  overallInsight: "This scenario teaches social English fundamentals: warm greetings, safe descriptors, everyday idioms. Native pattern: prioritize warmth over precision in casual conversations."

  keyPatterns:
    - pattern: "Fixed greetings vs invented phrases"
      explanation: "Natives use 'Nice to meet you' not 'I'm happy to know you' - fixed phrases signal fluency and reduce cognitive load."
      chunks: ["meet"]
    - pattern: "Prepositional collocations"
      explanation: "keep track OF - prepositions are part of the chunk, not optional; this separates natives from learners."
      chunks: ["keep track"]
```

---

## 📐 Field Requirements

### categoryBreakdown (REQUIRED)
**Structure**: Array of 2-6 category items

**Each item must have**:
- **category**: One of `Openers`, `Softening`, `Disagreement`, `Repair`, `Exit`, `Idioms`
- **count**: Number matching `examples.length` (must be exact match)
- **examples**: Array of chunk text strings - must reference actual chunks from `chunkFeedback` in the scenario
- **insight**: 30-100 characters describing why this pattern category matters
  - Pattern-focused (explain WHY it works, not WHAT it means)
  - Example: "Fixed greetings signal fluency" ✅
  - Bad: "A verb is a word" ❌

**Word Count**: 30-100 characters for each insight

### customLabel (OPTIONAL - Domain-Specific Scenarios Only)
**Purpose**: For specialized domains like Healthcare, Community, Legal - use custom display labels instead of standard category names

**When to Use**:
- When the scenario requires domain-specific terminology
- Standard category name would confuse learners
- Pattern still maps to one of the 6 standard categories

**Structure**: String value for `customLabel` field

**Example** (Healthcare):
```yaml
categoryBreakdown:
  - category: "Repair"          # Standard type (determines color/icon)
    customLabel: "Clear symptom reporting"  # Domain-specific display label
    count: 8
    examples: [...]
    insight: "..."
```

**Restrictions**:
- **category** MUST be one of 6 standard types (enforced)
- **customLabel** is optional, display-only
- Prevents non-standard categories that break styling

**Pre-Built Mappings** (already migrated):
- Healthcare scenarios map custom labels to standard categories
- Community scenarios map civic terminology to standard categories
- These prevent crashes and maintain visual consistency

---

### overallInsight (REQUIRED)
**Purpose**: Single consolidated learning outcome for the entire scenario

**Requirements**:
- 100-300 characters
- Must explain WHY these patterns matter together
- Can reference formality, social function, or native behavior
- Should tie category breakdown to user's learning progression

**Example** (150 chars):
"This scenario teaches social English fundamentals: warm greetings, safe descriptors, everyday idioms. Native pattern: prioritize warmth over precision in casual conversations."

**Bad Examples**:
- ❌ "We learned about verbs and nouns" (grammar terminology)
- ❌ "This is a scenario" (too vague, no insight)
- ❌ "BBC News showed..." (no fabricated sources)

---

### keyPatterns (REQUIRED)
**Structure**: Array of 2-4 pattern items

**Each pattern must have**:
- **pattern**: 10-50 characters, clear pattern name
  - Example: "Fixed greetings vs invented phrases" ✅
  - Example: "Prepositional collocations" ✅

- **explanation**: 50-150 characters explaining WHY the pattern works (not WHAT it means)
  - Must show native vs non-native difference
  - Should explain social function or formality impact
  - Example: "Natives use 'Nice to meet you' not 'I'm happy to know you' - fixed phrases signal fluency and reduce cognitive load." ✅
  - Bad: "A collocation is two words together" ❌

- **chunks**: Array of chunk text references
  - All chunks MUST exist in the scenario's `chunkFeedback`
  - No invented chunks
  - Example: `["meet", "thank you"]`

**Word Counts**:
- pattern: 10-50 characters
- explanation: 50-150 characters

---

## ✅ Quality Checklist

Before saving your enriched file, verify:

### Content Quality
- [ ] Category header present at top of file (3 lines exactly)
- [ ] Category name matches one of 8 valid values
- [ ] Scenario count in header matches actual YAML blocks
- [ ] All chunks in categoryBreakdown exist in chunkFeedback
- [ ] All chunks in keyPatterns exist in chunkFeedback
- [ ] No invented chunks (only reference existing ones)
- [ ] No grammar terminology (verb, noun, tense, adjective, etc.)
- [ ] No fabricated sources (BBC, credible outlets, etc.)

### Word Counts
- [ ] Each categoryBreakdown insight: 30-100 characters
- [ ] Overall insight: 100-300 characters
- [ ] Each keyPattern.pattern: 10-50 characters
- [ ] Each keyPattern.explanation: 50-150 characters

### YAML Format
- [ ] All YAML blocks valid (test with yaml.org online tool)
- [ ] Proper indentation (2 spaces, consistent)
- [ ] All required fields present (categoryBreakdown, overallInsight, keyPatterns)
- [ ] No duplicate category names in breakdown
- [ ] Exactly 2-6 categories in breakdown
- [ ] Exactly 2-4 patterns in keyPatterns

### Scenario Integrity
- [ ] Dialogue text unchanged (verbatim export)
- [ ] Blanks remain as `________` (8 underscores)
- [ ] Answer variations intact
- [ ] Feedback content unchanged

---

## ❌ Do Not (Critical Boundaries)

These constraints prevent quality issues and maintain data integrity:

### 1. Do not add/invent pattern feedback if locked or missing
- Only enrich with `patternSummary` if scenario already has `chunkFeedback`
- Do not create chunk feedback from scratch (reserved for feedback team)
- Do not fabricate chunk definitions

### 2. Do not fabricate examples from credible sources
- All examples must come from the scenario dialogue or universal knowledge
- No invented "BBC News" examples or fake sources
- No "According to research" claims without proper basis
- Future phase will integrate verified source data

### 3. Do not pull content from other categories
- **One file = one category** (enforced by import script)
- No cross-category pattern explanations
- No mixing scenarios from different categories

### 4. Do not rewrite dialogues during export
- Dialogue must be exported **verbatim** from staticData.ts
- No paraphrasing or "improving" dialogue text
- Blanks must remain exactly as `________`
- Answer variations must be unchanged

### 5. Do not skip validation checks
- Always run `npm run validate:enrichments -- --file=<yourfile>.md` before importing
- Address all validation errors before attempting import
- Never bypass validation or import without checking

---

## 🔄 Complete Workflow Example

### Step 1: Export Scenarios
```bash
npm run export:scenarios  # Creates exports/Social.md with all 52 scenarios
```

### Step 2: Generate Template Summaries
```bash
npm run generate:pattern-summaries -- --category=Social --batch=1
# Creates: exports/generated/Social-batch1-ai.md with AI-generated template summaries
```

### Step 3: Review & Edit
1. Open `exports/generated/Social-batch1-ai.md`
2. For each scenario, review template-generated YAML blocks
3. Refine insights (templates are baseline, add your expertise)
4. Check examples reference correct chunks
5. Verify key patterns show cross-chunk connections
6. Use quality checklist above

### Step 4: Rename & Save
```
Social-batch1-ai.md  →  Social-batch1-enriched.md
(After human review/edits, rename to indicate human approval)
```

### Step 5: Validate Syntax
```bash
npm run validate:enrichments -- --file=Social-batch1-enriched.md
# ✅ Category header valid: Social
# ✅ All 5 YAML blocks parse successfully
# ✅ No cross-category references
```

### Step 6: Import
```bash
npm run import:enrichments -- --file=Social-batch1-enriched.md
# ✅ Merged 5 enrichments into staticData.ts
# ✅ Backup saved to staticData.ts.backup
```

### Step 7: Verify
```bash
npm run validate:feedback      # Comprehensive validation
npm run build                   # TypeScript check
npm run dev                     # Test in browser
```

---

## 📊 Validation Rules (Used by Scripts)

### Category Lock (Import Script)
- All scenario IDs must match declared category
- Example: If header says "Social", all IDs must start with "social-"
- Rejects if mixing categories detected

### Batch Size (Import Script)
- Standard: exactly 5 scenarios per file
- Exception: <5 allowed for single-scenario categories
- Rejects: >5 scenarios (split into multiple batches)

### Field Validation (Pre-Import Script)
- categoryBreakdown.count must equal examples.length
- All categories must be valid ChunkCategory enum values
- All chunks must exist in chunkFeedback (no fabrication)
- Word counts must be within limits
- No grammar terminology allowed

---

## 🎓 Example: Completed Enrichment

See `src/services/staticData.ts` for examples of completed pattern summaries in:
- `social-1-flatmate`
- `service-1-cafe`
- `workplace-1-disagreement`

---

## 🚀 Tips for High-Quality Enrichments

### 1. Pattern Naming
- Use active, clear descriptive names
- "Fixed greetings vs invented phrases" ✅
- "Greeting patterns" ❌ (too vague)

### 2. Insight Writing
- Focus on FUNCTION, not FORM
- "Warmth over precision signals approachability" ✅
- "Uses adjectives and nouns" ❌ (grammar focus)

### 3. Cross-Chunk Connections
- Key patterns should show relationships between chunks
- "When combining Openers + Softening, emphasize warmth first"
- Not single-chunk explanations

### 4. Category Accuracy
- Review scenario dialogue to verify category assignments
- If chunk used for disagreement, label it "Disagreement" not "Softening"
- Let actual usage guide categorization

### 5. Chunk Reference Accuracy
- Always verify chunks exist in chunkFeedback
- Copy exact chunk text (case-sensitive)
- Examples: "meet", "keep track" (from social-1-flatmate)

---

## 📞 Support

- For template questions: Review examples above
- For validation errors: Read error message from `npm run validate:enrichments`
- For import issues: Check category header and batch size

---

## Version History

- v1.0 (Feb 2026): Initial template with category lock and batch size guardrails
