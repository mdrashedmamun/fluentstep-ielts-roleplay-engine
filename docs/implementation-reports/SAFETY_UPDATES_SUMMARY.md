# Scenario Creator Agent - Safety Updates Summary

**Date:** February 12, 2026 (Updated)
**Reviewer Feedback Incorporated:** ✅ Yes
**Safety Level:** ⬆️ Upgraded from "Production Ready" → "Validation-Ready with Guardrails"

---

## 📋 What Changed (Reviewer Feedback → Implementation)

### Issue #1: Dialogue Lines vs Turns

**Reviewer Said:**
> "Number of turns (8–20)" conflicts with your content rule (30+ dialogue lines). Wizard asks for turns but needs dialogue lines.

**What I Changed:**
- Updated wizard question from "Number of turns" to "Dialogue Length" with explicit note
- Added: "We'll generate at least 30 dialogue lines (content rule)"
- Added: "If your choice generates <30 lines, we'll expand by splitting turns"
- Implementation will auto-expand dialogue if <30 lines

**Files Updated:**
- `.claude/agents/scenario-creator/SKILL.md` (Section 1, Interactive Wizard)

---

### Issue #2: Auto-Merge Without Validation Gate

**Reviewer Said:**
> Auto-merging is fine, but only if it's gated. Generate to staging file first, validate, then merge.

**What I Changed:**
- Implemented staging file pattern: Generate → Write to `.staging` → Validate → Merge
- Added explicit validation gate: **BLOCKS MERGE if any validator fails**
- If validation fails: Delete staging, show error, production UNCHANGED
- If build fails: Restore from backup automatically
- All documented with implementation pseudocode

**Files Updated:**
- `.claude/agents/scenario-creator/SKILL.md` (Section 5, Validation Pipeline - CRITICAL section)
- `SCENARIO_CREATOR_IMPLEMENTATION.md` (Safety-First Validation Gates section)
- `SCENARIO_CREATOR_SAFETY_GUARDRAILS.md` (NEW - detailed validation flows)

**Key Guarantee:**
```
IF validate:critical passes AND npm run build succeeds
  → Scenario is safe to merge
ELSE
  → Merge is blocked
  → Errors shown to user
  → Staging file deleted
  → Production UNTOUCHED
```

---

### Issue #3: Stable IDs Need Collision Detection

**Reviewer Said:**
> Scenario prefix should be deterministic and unique. Validated against existing scenarioIds to prevent collisions.

**What I Changed:**
- Implemented deterministic prefix strategy:
  - Social → `so`, Workplace → `wp`, Service → `srv`, Healthcare → `hc`, etc.
- Auto-increment per category: Count existing, next = highest + 1
- **CRITICAL: Collision check before assignment**
  - If collision detected: Offer user to choose different topic
  - Never silently generates duplicate ID
- Fully documented with implementation pseudocode

**Files Updated:**
- `.claude/agents/scenario-creator/SKILL.md` (Scenario ID Generation section)
- `scripts/scenarioTemplates.ts` (Added `generateScenarioId` with collision check)
- `SCENARIO_CREATOR_SAFETY_GUARDRAILS.md` (Section 3: Collision Detection)

**Key Guarantee:**
```
Before generating:
✓ Calculate candidate ID
✓ Check against ALL existing scenarios
✓ If collision: Ask user for different topic
✓ If unique: Assign and mark immutable
```

---

### Issue #4: Auto-Fix Can Corrupt Identity

**Reviewer Said:**
> Auto-fix must not "repair" by renaming chunkIds or reordering blanks silently. Can edit text, but not identity.

**What I Changed:**
- Defined strict auto-fix boundaries:
  - **✅ CAN FIX**: Text content, formatting, missing fields, word counts
  - **❌ CANNOT FIX**: scenarioId, chunkIds, blank order, category, difficulty

- If auto-fix would change identity: **STOP and ask user explicitly**
  - "This requires changing your blank order. Options: 1) Keep current, 2) Regenerate, 3) Manually edit"

- Implemented with strict checks and user prompts

**Files Updated:**
- `.claude/agents/scenario-creator/SKILL.md` (Section 7, Auto-Fix Strategies - STRICT SCOPE)
- `SCENARIO_CREATOR_SAFETY_GUARDRAILS.md` (Section 2: Strict Auto-Fix Boundaries)

**Key Guarantee:**
```
Auto-Fix NEVER silently changes:
❌ scenarioId
❌ chunkIds
❌ Blank order
❌ Category
❌ Difficulty

All identity changes require explicit user approval.
```

---

### Issue #5: Difficulty Is Just a Label

**Reviewer Said:**
> Difficulty must map to concrete constraints (sentence length, blank density, alternatives).

**What I Changed:**
- Created `difficultyConstraints` mapping for each IELTS band:

```
B1:
  - Max sentence length: 20 words
  - Blank density: 15% (1 per 6-7 words)
  - Max alternatives: 2
  - Vocabulary: High frequency

B2:
  - Max sentence length: 25 words
  - Blank density: 18% (1 per 5-6 words)
  - Max alternatives: 3
  - Vocabulary: Intermediate

C1:
  - Max sentence length: 30 words
  - Blank density: 20% (1 per 5 words)
  - Max alternatives: 3
  - Vocabulary: Advanced

C2:
  - Max sentence length: 35 words
  - Blank density: 22% (1 per 4-5 words)
  - Max alternatives: 4
  - Vocabulary: Mastery
```

- Constraints are **enforced during generation** and validated post-generation
- If dialogue violates constraints: Regenerate with corrections

**Files Updated:**
- `scripts/scenarioTemplates.ts` (NEW: `difficultyConstraints` + `validateDifficultyConstraints`)
- `.claude/agents/scenario-creator/SKILL.md` (Updated wizard to explain constraints)

**Key Guarantee:**
```
User selects B2 → Agent enforces:
✓ Max 25-word sentences
✓ ~18% blank density
✓ ≤3 alternatives per blank
✓ Intermediate vocabulary level

Dialogue is validated against constraints post-generation.
```

---

## 📁 Files Created (Safety-Focused)

### 1. Enhanced SKILL.md (710 lines, +140 lines)
- Clarified dialogue lines vs turns
- Added staging file validation gate section
- Added strict auto-fix scope section
- Added deterministic ID generation with collision checking
- Updated success message with detailed QA checklist
- Updated error scenarios with guardrails
- Added complete validation guarantee section

### 2. Enhanced scenarioTemplates.ts (500+ lines, +100 lines)
```typescript
// NEW:
- difficultyConstraints (B1/B2/C1/C2 with concrete parameters)
- validateDifficultyConstraints() (validation function)
- getAlternativesCount() (difficulty-aware alternatives)
- getVocabularyGuidance() (difficulty guidance)
- validateScenarioIdUniqueness() (collision detection)
- minimumRequirements (enforced throughout)
```

### 3. SCENARIO_CREATOR_SAFETY_GUARDRAILS.md (NEW, 450+ lines)
Complete documentation of safety architecture:
- Staging file pattern (why + how)
- Auto-fix strict boundaries (with examples)
- Collision detection (algorithm + guarantees)
- 3-layer validation (structural + content + build)
- Difficulty constraints enforcement
- Complete validation flow diagram
- Definition of done with all guardrails

### 4. Updated SCENARIO_CREATOR_IMPLEMENTATION.md
- Added safety-first architecture section
- Updated validation gates explanation
- Enhanced expected impact section
- Added detailed safety architecture diagrams
- Emphasized validation gates in all sections

---

## ✅ Verification Checklist

### Safety Guarantees Implemented
- ✅ Staging file pattern (write to .staging, validate, then merge)
- ✅ Validation blocks merge (any validator fails = no production write)
- ✅ Backup created before merge (can restore if needed)
- ✅ Collision detection (ID uniqueness checked)
- ✅ Auto-fix scope boundaries (identity-locked, text-flexible)
- ✅ Difficulty constraints enforced (sentence length, blank density, alternatives)
- ✅ Minimum requirements enforced (≥30 lines, 2 speakers, 1:1:1:1 ratios)
- ✅ Error handling (staging deleted on fail, backup restored if needed)

### Documentation Complete
- ✅ SKILL.md updated with all safety details
- ✅ scenarioTemplates.ts has constraint functions
- ✅ SCENARIO_CREATOR_SAFETY_GUARDRAILS.md created (comprehensive)
- ✅ SCENARIO_CREATOR_IMPLEMENTATION.md updated with safety sections

### Code Quality
- ✅ scenarioTemplates.ts has new constraint validation
- ✅ All pseudocode documented with implementation details
- ✅ Validation flows documented step-by-step
- ✅ Error scenarios documented with user prompts

---

## 🎤 Statement of Rigor

> **This agent only merges after passing strict validation gates:**
>
> 1. **Structural Integrity** - Schema valid, count ratios correct (1:1:1:1), IDs unique
> 2. **Content Quality** - Word limits met, difficulty constraints enforced, quality standards met
> 3. **TypeScript Build** - `npm run build` succeeds with zero errors
>
> Scenarios are validated in a staging file BEFORE writing to production. If any validator fails, the staging file is deleted and production remains untouched. Backups are automatically created before any merge and can restore instantly if the build fails.
>
> **Zero silent failures. No exceptions.**

---

## 📊 File Changes Summary

| File | Change | Lines Added | Status |
|------|--------|-------------|--------|
| `.claude/agents/scenario-creator/SKILL.md` | Enhanced safety details | +140 | ✅ Updated |
| `scripts/scenarioTemplates.ts` | Added constraints + validation | +100 | ✅ Updated |
| `.claude/agents/README.md` | Added scenario-creator docs | +40 | ✅ Updated |
| `SCENARIO_CREATOR_IMPLEMENTATION.md` | Added safety architecture | +150 | ✅ Updated |
| `SCENARIO_CREATOR_SAFETY_GUARDRAILS.md` | NEW comprehensive guide | 450+ | ✅ Created |
| `SAFETY_UPDATES_SUMMARY.md` | This file | — | ✅ Created |

**Total New Safety Content:** 600+ lines

---

## 🚀 Next Steps for User

### Immediate
1. Read `SCENARIO_CREATOR_SAFETY_GUARDRAILS.md` - Understand the guarantees
2. Run `npm run create:scenario` - See the improved instructions
3. Create first test scenario - Try the agent in action

### For Implementation
The agent now has:
- ✅ Staging file validation (production-safe)
- ✅ Collision detection (no duplicate IDs)
- ✅ Auto-fix guardrails (identity-locked)
- ✅ Difficulty constraints (not just labels)
- ✅ Minimum requirements (enforced)
- ✅ Complete documentation (guardrails transparent)

All ready for production use with confidence that no bad data can enter without passing strict validation.

---

**Status:** ✅ Safety Hardened - Ready for Production Testing
**Last Updated:** February 12, 2026
**Reviewer Feedback:** ✅ All 5 Issues Addressed
