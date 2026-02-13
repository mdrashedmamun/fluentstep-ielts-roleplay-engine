# Chunk Feedback System - Quick Reference Guide

## Running Validations

### Check all feedback items
```bash
npm run validate:feedback
```
Validates all 6 scenarios with 14 feedback items. Reports errors and warnings.

### During development
```bash
npm run build    # Includes validate:feedback in prebuild
npm run validate # Checks all scenario data
```

---

## Understanding the Defensive Pattern

The chunk feedback system uses defensive fallbacks to prevent crashes:

### 1. Array Fallback Pattern
```typescript
// ❌ UNSAFE - crashes if undefined
feedback.situations.map(...)

// ✅ SAFE - fallback to empty array
(feedback.situations || []).map(...)
```

### 2. Optional Chaining Pattern
```typescript
// ❌ UNSAFE - crashes if situation is undefined
situation.context

// ✅ SAFE - optional chaining with fallback
situation?.context || 'Default Value'
```

### 3. CSS Overflow Protection
```typescript
// Truncates long text with ellipsis
<p className="line-clamp-2">{text}</p>  // Max 2 lines
<p className="line-clamp-3">{text}</p>  // Max 3 lines
```

---

## Adding New Feedback Items

### 1. Create feedback in src/services/staticData.ts

```typescript
export const CURATED_ROLEPLAYS: RoleplayScript[] = [
  {
    id: 'my-scenario',
    // ... existing fields ...
    chunkFeedback: [
      {
        blankIndex: 3,              // Which blank to unlock feedback for
        chunk: 'to be honest',      // The phrase
        category: 'Softening',      // From: Openers|Softening|Disagreement|Repair|Exit|Idioms
        coreFunction: 'Softens opinions...',  // ≤20 words
        situations: [
          {
            context: 'At a meeting',
            example: 'To be honest, I think we should...'
          },
          {
            context: 'With friends',
            example: 'To be honest, I prefer tea to coffee'
          },
          {
            context: 'In exams',
            example: 'To be honest, I found that question difficult'
          }
        ],
        nativeUsageNotes: [
          'Common in conversational English',
          'Shows you\'re being candid',
          'Works in formal and casual contexts'
        ],
        nonNativeContrast: [
          {
            nonNative: 'I think honestly that...',
            native: 'To be honest, I think that...',
            explanation: 'Native speakers put phrase at start, not middle'
          },
          {
            nonNative: 'Being honest, I think...',
            native: 'To be honest, I think...',
            explanation: 'Use full phrase, not gerund form'
          }
        ]
      }
    ]
  }
];
```

### 2. Verify the blankIndex is valid

The `blankIndex` must match an actual blank in the scenario:
- Minimum: 1
- Maximum: Length of `scenario.answerVariations` array

```bash
npm run validate:feedback
# Will report if blankIndex is invalid
```

### 3. Test it

1. Start dev server: `npm run dev`
2. Navigate to scenario
3. Reveal the blank matching your `blankIndex`
4. Feedback card should appear

---

## Common Issues & Solutions

### Issue: "Cannot read properties of undefined (reading 'map')"
**Cause**: Array property is `undefined` during initialization
**Solution**: Add `|| []` fallback before `.map()`

```typescript
// ❌ WRONG
{feedback.situations.map(...)}

// ✅ RIGHT
{(feedback.situations || []).map(...)}
```

### Issue: Feedback never appears after revealing blank
**Cause**: blankIndex doesn't match actual blanks in scenario
**Solution**: Verify blankIndex is within valid range

```bash
npm run validate:feedback
# Check the error message for which scenarios have invalid indices
```

### Issue: Text overflows on mobile
**Cause**: No text truncation limits
**Solution**: Add `line-clamp-N` class

```typescript
// ❌ WRONG
<p>{longText}</p>

// ✅ RIGHT
<p className="line-clamp-2">{longText}</p>  // Max 2 lines
```

---

## Data Structure Reference

### ChunkCategory Type
```typescript
type ChunkCategory = 'Openers' | 'Softening' | 'Disagreement' | 'Repair' | 'Exit' | 'Idioms'
```

**Category Definitions**:
- **Openers**: Starting conversations, greetings
- **Softening**: Making requests/disagreements polite
- **Disagreement**: Expressing different opinions
- **Repair**: Recovering from mistakes or awkwardness
- **Exit**: Ending conversations gracefully
- **Idioms**: Idiomatic expressions and collocations

### ChunkFeedback Interface
```typescript
interface ChunkFeedback {
  blankIndex: number                    // 1-based index of blank
  chunk: string                         // The phrase/word
  category: ChunkCategory               // Category type
  coreFunction: string                  // Why it works (≤20 words)
  situations: Array<{
    context: string                     // Where it's used
    example: string                     // Example (≤15 words)
  }>                                    // Exactly 3 items
  nativeUsageNotes: string[]            // Native patterns (≥3 items, ≤5)
  nonNativeContrast: Array<{
    nonNative: string                   // Wrong way
    native: string                      // Correct way
    explanation: string                 // Why different (≤20 words)
  }>                                    // Exactly 2 items
}
```

---

## Testing Checklist

Before committing new feedback:

- [ ] `npm run validate:feedback` passes with 0 errors
- [ ] `npm run build` succeeds with 0 TypeScript errors
- [ ] Tested in browser: reveal blank, feedback appears
- [ ] Tested on mobile (375px width): no text overflow
- [ ] All situations use the chunk naturally
- [ ] No grammar terminology ("verb", "noun", etc.)
- [ ] All word counts within limits
- [ ] Native usage notes explain WHY, not WHAT

---

## File Locations

| Purpose | File |
|---------|------|
| Feedback data | `src/services/staticData.ts` |
| Feedback component | `src/components/FeedbackCard.tsx` |
| Scenario viewer | `src/components/RoleplayViewer.tsx` |
| Validation script | `scripts/validateChunkFeedback.ts` |
| Full audit report | `CHUNK_FEEDBACK_AUDIT_REPORT.md` |

---

## Questions?

See detailed documentation:
- **Comprehensive audit**: `CHUNK_FEEDBACK_AUDIT_REPORT.md`
- **System design**: `src/services/feedbackGeneration/index.ts`
- **Validation rules**: `scripts/validateChunkFeedback.ts`
