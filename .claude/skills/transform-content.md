# Skill: Transform Content

## Purpose
Transforms scenarios between schema versions (V1 ↔ V2) and generates TypeScript code for new scenarios.

## Usage

```bash
/transform-content [input-file] [options]
```

## Inputs

### Required
- **input-file** (string): Path to input file
  - Formats: `.json` (validated dialogue), `.ts` (existing code)
  - Example: `.staging/social-7-house-rules/dialogue.json`

### Optional
- **target-version** (string): Target schema version
  - Values: `v1`, `v2`, `both` (dual schema)
  - Default: `v2` (preferred)
- **preserve-v1** (boolean): Keep V1 deepDive when transforming to V2
  - Default: true (both schemas coexist)
- **output-format** (string): Output format
  - Values: `typescript`, `json`, `markdown`
  - Default: `typescript`

## Outputs

### Primary Output
**RoleplayScript TypeScript code** (for target version):

**V2 Format**:
```typescript
export const socialSevenHouseRules: RoleplayScript = {
  scenarioId: 'social-7-house-rules',
  title: 'House Rules Negotiation',
  category: 'social',
  difficulty: 'intermediate',

  dialogue: [
    { speaker: 'Person A', text: 'Nice to meet you.' },
    { speaker: 'Person B', text: 'How is it going?' },
  ],

  blanks: [
    { index: 0, scenario: 'A greets B', alternatives: ['Hi', 'Hello'] },
  ],

  chunkFeedback: {
    'social-7-house-rules-b0': {
      chunkId: 'social-7-house-rules-b0',
      blanksInOrder: ['Hi', 'Hello', 'Hey'],
      chunkFeedback: {
        'Hi': { status: 'correct', feedback: '...' },
      },
      patternSummary: { /* ... */ },
    },
  },
};
```

### Secondary Outputs
- **Staging file**: `.staging/{scenarioId}/transformed.ts`
- **Validation report**: Confidence scores for transformation
- **Migration log**: Details of any schema changes

### Quality Metrics
- **Transform Confidence**: ≥85% required
- **Code Validity**: 100% TypeScript syntax
- **Schema Compliance**: Full validation pass

---

## Agent
- **Primary**: scenario-transformer
- **Dependencies**: content-validator, scenario-creator

---

## Transform Types

### Type 1: JSON Dialogue → TypeScript Code
**Input**: Validated dialogue JSON (from extract-dialogue)
**Output**: Complete RoleplayScript code (V2 schema)
**Process**:
1. Parse dialogue structure
2. Generate blank positions
3. Create answer variations
4. Format as TypeScript

### Type 2: V1 → V2 Schema Migration
**Input**: Existing V1 scenario (deepDive only)
**Output**: Dual schema (deepDive + chunkFeedback)
**Process**:
1. Transform deepDive to chunkFeedback
2. Generate patternSummary
3. Preserve original deepDive (fallback)
4. Validate dual schema

### Type 3: Refresh Existing Scenario
**Input**: Existing scenario (V1 or V2)
**Output**: Updated scenario with new enrichments
**Process**:
1. Preserve dialogue and blanks
2. Update feedback data
3. Add new enrichments
4. Validate changes

---

## Examples

### Example 1: Transform dialogue to code
```bash
/transform-content .staging/social-7-house-rules/dialogue.json

# Output: .staging/social-7-house-rules/transformed.ts
# Schema: V2 only
```

### Example 2: Migrate V1 to V2 (dual schema)
```bash
/transform-content src/services/staticData.ts \
  --target-version v2 \
  --preserve-v1 true

# Output: Updated staticData.ts with both deepDive + chunkFeedback
```

### Example 3: Output as JSON (for review)
```bash
/transform-content .staging/social-7-house-rules/dialogue.json \
  --output-format json

# Output: .staging/social-7-house-rules/transformed.json
```

---

## Validation After Transform

After transformation, the output must pass:

1. **Schema Validation**
   - ✅ ChunkID format: `{scenarioId}-b{n}`
   - ✅ blanksInOrder length = answers length
   - ✅ All chunks reference LOCKED_CHUNKS

2. **Code Validation** (if TypeScript output)
   - ✅ Syntax valid
   - ✅ Types correct
   - ✅ No import errors

3. **Quality Validation**
   - ✅ Chunk compliance ≥75-80%
   - ✅ UK spelling 100%
   - ✅ Dialogue flow natural

---

## Error Handling

### Common Errors

**Error**: "Invalid dialogue format"
- **Cause**: Input JSON doesn't match expected structure
- **Fix**: Validate with `npm run validate:feedback` first

**Error**: "Cannot map blanks to answers"
- **Cause**: Blank count ≠ answer variation count
- **Fix**: Ensure dialogue has consistent answer options

**Error**: "Unknown chunks in feedback"
- **Cause**: Chunk references don't match LOCKED_CHUNKS
- **Fix**: Replace with valid chunks from CORE_RULES.md

### Recovery

All transforms go to `.staging/` first:
1. Review transformed file
2. Fix any issues manually
3. Validate with quality checks
4. Merge to staticData.ts when ready

---

## Dual Schema Coexistence

When transforming to V2 with `--preserve-v1 true`:

```typescript
// ✅ Both schemas present (coexist peacefully)
export const scenario: RoleplayScript = {
  // Existing V1 data
  deepDive: { /* ... */ },

  // New V2 data
  chunkFeedback: { /* ... */ },
};

// Rendering code: Check V2 first, fallback to V1
const feedback = scenario.chunkFeedback?.[blankId]
  || scenario.deepDive?.[blankId]
  || null;
```

---

## Performance

- **Dialogue → Code**: 5-10 seconds per scenario
- **V1 → V2 Migration**: 2-3 seconds per scenario
- **Batch transforms**: 50+ scenarios/minute

---

## Quality Gates Integration

This skill is used in **Step 6 of the Pipeline**:
1. Input: Validated dialogue (from content-validator)
2. Process: Transform to TypeScript code
3. Output: Generated RoleplayScript code
4. Gate 1: Build verification (TypeScript syntax)
5. Gate 2: Validation (schema compliance)

---

## Related Skills

- **[validate-scenario.md](./validate-scenario.md)** - Validate before transform
- **[extract-dialogue.md](./extract-dialogue.md)** - Extract source dialogue
- **[generate-pattern-summary.md](./generate-pattern-summary.md)** - Generate V2 feedback
- **[export-scenario.md](./export-scenario.md)** - Export transformed scenario

---

**Last Updated**: Feb 14, 2026
**Agent**: scenario-transformer
**Status**: Production ready
