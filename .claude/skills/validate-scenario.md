# Skill: Validate Scenario

## Purpose
Validates scenario structure, content quality, and conformance to all project rules.

## Usage

```bash
/validate-scenario [scenario-file] [options]
```

## Inputs

### Required
- **scenario-file** (string): Path to scenario file or scenario ID
  - Formats: `scenario.json`, `scenario.ts`, or scenario ID (`social-7-house-rules`)
  - Looks up in staticData.ts if ID provided

### Optional
- **strict** (boolean): Enable all validators, block on warnings
  - Default: false (allows warnings)
  - true = block on any issue
- **fix** (boolean): Auto-apply HIGH confidence fixes
  - Default: false (report only)
  - true = modify file automatically
- **category** (string): Validate only specific category
  - Example: `social`, `academic`, `business`
  - Default: validate all

## Outputs

### Primary Output
**Validation Report** (JSON):
```json
{
  "scenarioId": "social-7-house-rules",
  "status": "PASS",
  "overallConfidence": 0.87,
  "validators": {
    "chunk-compliance": {
      "status": "PASS",
      "confidence": 0.92,
      "findings": []
    },
    "uk-spelling": {
      "status": "PASS",
      "confidence": 0.98,
      "findings": []
    },
    "dialogue-flow": {
      "status": "PASS",
      "confidence": 0.81,
      "findings": ["Turn 3: Could be more natural"]
    }
  },
  "autoFixes": 3,
  "requiresApproval": 2
}
```

### Secondary Output
**Fixed scenario** (if `--fix` flag used):
- Updates scenario in `.staging/{scenarioId}/`
- Preserves original in staticData.ts until merge

### Quality Score
- **Pass**: ≥85% overall confidence
- **Warn**: 70-84% (requires review)
- **Fail**: <70% (requires fixes before use)

---

## Agent
- **Primary**: content-validator
- **Dependencies**: chunk-curator, content-gen-agent

---

## Validation Rules

### 1. Chunk Compliance
- ✅ BUCKET_A chunk presence ≥75-80%
- ✅ All chunks match LOCKED_UNIVERSAL_CHUNKS
- ✅ Topic chunks from appropriate category

### 2. UK Spelling
- ✅ British spellings: colour, realise, centre
- ✅ No American spellings: color, realize, center
- ✅ British vocabulary: lift, flat, queue

### 3. UK Vocabulary
- ✅ No American idioms
- ✅ Appropriate British conversational style
- ✅ Natural phrasing for UK speaker

### 4. Tonality
- ✅ Consistent formal/casual tone
- ✅ Speaker voices distinct
- ✅ Appropriate register for context

### 5. Natural Patterns
- ✅ No textbook-like phrasing
- ✅ Dialogue flows naturally
- ✅ Realistic speaker behavior

### 6. Dialogue Flow
- ✅ Logical conversation progression
- ✅ Speaker consistency
- ✅ Appropriate turn-taking

### 7. Alternatives Quality
- ✅ Genuine variations, not synonyms
- ✅ All variations valid and acceptable
- ✅ Consistent answer pattern

---

## Examples

### Example 1: Quick validation (report only)
```bash
/validate-scenario social-7-house-rules

# Output: Full report with findings and confidence scores
```

### Example 2: Strict validation (fail on warnings)
```bash
/validate-scenario social-7-house-rules --strict

# Output: FAIL if any warnings found
```

### Example 3: Auto-fix HIGH confidence issues
```bash
/validate-scenario social-7-house-rules --fix

# Output: Auto-applies HIGH confidence fixes, reports MEDIUM/LOW
```

### Example 4: Validate specific category
```bash
/validate-scenario --category academic

# Output: Validates only academic scenarios
```

---

## Confidence Levels

| Range | Action | Use Case |
|-------|--------|----------|
| ≥95% | auto-apply | Automatically apply fixes |
| 70-94% | flag-for-review | Flag for human approval |
| <70% | report-only | Report findings only |

---

## Error Handling

### Common Issues

**Issue**: "Chunk compliance 72% (below threshold 75%)"
- **Fix**: Add more BUCKET_A chunks
- **Example**: Replace "I think..." with "From my perspective..."

**Issue**: "UK spelling: 'realize' (American)"
- **Fix**: Replace with "realise" (British)
- **Auto-fix**: HIGH confidence (auto-applied if --fix)

**Issue**: "Dialogue flow: Turn 5 disconnected"
- **Fix**: Reword turn 4 to provide better context
- **Confidence**: MEDIUM (requires approval)

---

## Pass Criteria

All validators must pass:
- ✅ Overall confidence ≥85%
- ✅ Zero critical issues
- ✅ All MEDIUM/LOW issues reviewed and approved
- ✅ Schema structure valid

---

## Performance

- **Validation time**: <30 seconds per scenario
- **Scenarios per batch**: 10-20 at once
- **Confidence calculation**: Rule-based + ML scoring

---

## Quality Gates Integration

This skill is used in **Gate 2: Validation Checks**:
1. Run validation with all validators active
2. Auto-apply HIGH confidence fixes (≥95%)
3. Flag MEDIUM/LOW findings for review
4. Block if overall confidence <85%

---

## Related Skills

- **[extract-dialogue.md](./extract-dialogue.md)** - Extract raw dialogue
- **[transform-content.md](./transform-content.md)** - Transform validated content
- **[generate-pattern-summary.md](./generate-pattern-summary.md)** - Generate feedback

---

**Last Updated**: Feb 14, 2026
**Agent**: content-validator
**Status**: Active and stable
