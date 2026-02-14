# Schema Rules: Data Structure Compliance

## V1 vs V2 Dual Schema Support

The system supports two feedback schema versions simultaneously:
- **V1 (Legacy)**: `deepDive` structure for backward compatibility
- **V2 (Current)**: `chunkFeedback` structure (preferred)

### When to Use Each

**Use V1 (deepDive)** for:
- Legacy scenarios (created before Feb 2026)
- Scenarios with existing deepDive data
- Backward compatibility with older code

**Use V2 (chunkFeedback)** for:
- All new scenarios
- Scenarios being enhanced with new feedback
- Pattern-focused analysis

### Schema Coexistence Rule
Both schemas **MUST** coexist without conflicts:
- A scenario can have BOTH `deepDive` and `chunkFeedback`
- Rendering code must check for V2 first, fallback to V1
- Do NOT delete V1 data when adding V2

**Pattern**:
```typescript
// ✅ Correct: Check V2 first, then V1
const feedback = chunkFeedback || deepDive || null;

// ❌ Incorrect: Replacing V1 with V2
delete scenario.deepDive; // DON'T DO THIS
```

---

## chunkFeedback V2 Schema

### Core Structure
```typescript
chunkFeedback?: {
  [blankId: string]: ChunkFeedbackEntry;
};

interface ChunkFeedbackEntry {
  chunkId: string;           // "{scenarioId}-b{blankIndex}"
  blanksInOrder: string[];   // Answer options in presentation order
  chunkFeedback: {
    [answerId: string]: {
      status: 'correct' | 'good_try' | 'incorrect';
      feedback: string;      // Concise, pattern-focused feedback
      whyItWorks?: string;   // Explanation of chunk effectiveness
      alternative?: string;  // Alternative acceptable answer
    };
  };
  patternSummary?: {
    chunk: string;           // The core chunk being taught
    context: string;         // How it appears in this scenario
    commonMistakes: string[]; // What learners often get wrong
    keyTakeaway: string;     // One-sentence learning outcome
  };
  activeRecall?: {
    question: string;        // Recall question for spaced repetition
    expectedAnswer: string;  // Expected recall answer
    hints: string[];         // Optional hints if stuck
  };
}
```

### Data Validation Requirements

#### ChunkID Format
- Format: `{scenarioId}-b{blankIndex}`
- Example: `social-7-house-rules-b0`, `academic-2-weather-b3`
- Must be stable and human-readable
- Index must match 0-based blank position

#### blanksInOrder Array
- Order of presentation in UI (top to bottom)
- Must contain ALL answer options
- No duplicates allowed
- Must match answerVariations length

#### Feedback Properties
- `status`: Exactly one of 'correct', 'good_try', 'incorrect'
- `feedback`: Concise (1-2 sentences), pattern-focused
- `whyItWorks`: Explains WHY the chunk works (optional)
- `alternative`: For acceptable near-matches (optional)

#### Pattern Summary
- Must reference locked chunks when applicable
- `commonMistakes`: Based on learner testing (not hypothetical)
- `keyTakeaway`: Actionable, memorable (not verbose)

---

## deepDive V1 Schema (Legacy)

### Core Structure
```typescript
deepDive?: {
  [blankId: string]: string;  // Simple text explanation
};
```

### Migration Rule
When converting V1 → V2:
1. Preserve original deepDive content
2. Transform to chunkFeedback structure
3. Test V2 rendering
4. Keep deepDive as fallback

---

## Breaking Changes & Migration

### What Requires Migration
- New feedback types (patternSummary, activeRecall)
- New validation requirements
- New field additions to existing structures

### What Does NOT Require Migration
- Additional optional fields (backward compatible)
- New scenarios (start with V2 only)
- Code refactoring that doesn't change schema

### Migration Process
1. **Validate current data**: Run `npm run validate:feedback`
2. **Transform structure**: Use transform scripts
3. **Test rendering**: Verify UI displays correctly
4. **Verify fallbacks**: Ensure V1 fallback works
5. **Document changes**: Update CHANGELOG.md

---

## Schema Validation Checklist

- [ ] All blankIds match `{scenarioId}-b{n}` format
- [ ] blanksInOrder length = answerVariations length
- [ ] No duplicate answers in blanksInOrder
- [ ] All feedback statuses are valid ('correct', 'good_try', 'incorrect')
- [ ] Exactly one 'correct' status per blank (if any)
- [ ] chunkId references exist in LOCKED_CHUNKS
- [ ] Pattern summary references locked chunks
- [ ] No null/undefined values in required fields
- [ ] V1 fallback data exists (for legacy scenarios)

---

## Code Safety Rules for Schemas

### Defensive Property Access
Always use defensive patterns:
```typescript
// ✅ Correct: Defensive with fallback
const feedback = entry?.chunkFeedback?.[answerId]?.feedback || 'No feedback';
const summary = entry?.patternSummary || null;

// ❌ Incorrect: Can crash if property missing
const feedback = entry.chunkFeedback[answerId].feedback;
```

### Type Guards
Use type guards before processing:
```typescript
// ✅ Correct: Type check before use
if (chunkFeedback && typeof chunkFeedback === 'object') {
  // Process chunkFeedback
}

// ❌ Incorrect: No type check
Object.keys(chunkFeedback).map(...); // Crashes if null
```

### Empty Collection Handling
```typescript
// ✅ Correct: Default to empty array
const blanks = entry?.blanksInOrder || [];

// ❌ Incorrect: Assume array exists
entry.blanksInOrder.map(...); // Crashes if missing
```

---

**Last Updated**: Feb 14, 2026
