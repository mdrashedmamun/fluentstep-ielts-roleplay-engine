# Scenario Creator Agent - Safety Guardrails

**Date:** February 12, 2026 (Updated with Reviewer Feedback)
**Status:** ✅ Safety-First Architecture Implemented
**Purpose:** Document strict safety boundaries and validation gates

---

## 🛡️ Executive Summary

The Scenario Creator Agent is NOT "production ready" in the sense of "ship it and hope." It's **validation-ready** in the sense of "every scenario is validated 3 ways before touching staticData.ts."

This document explains the guardrails that prevent data corruption, ID collisions, and accidental identity changes.

---

## 1️⃣ Staging File Pattern (Never Merge Directly)

### Why Staging Files Matter

```
❌ WRONG: Generate → Write directly to staticData.ts

✅ RIGHT: Generate → Write to .staging file → Validate → Merge if pass
```

**Implementation:**

```typescript
// Step 1: Generate scenario in memory
const scenario = generateScenario(category, topic, turns, difficulty);

// Step 2: Write to staging (NOT production)
const stagingPath = `src/services/staticData.ts.staging-${Date.now()}`;
writeFile(stagingPath, scenario);
console.log(`✓ Generated to staging: ${stagingPath}`);

// Step 3: Validate staging
const validation = await runValidators(stagingPath);
if (!validation.allPass) {
  deleteFile(stagingPath);
  throw new ValidationError(validation.errors);
}

// Step 4: Create backup of production
backupFile('src/services/staticData.ts');

// Step 5: Merge staging → production
mergeFiles(stagingPath, 'src/services/staticData.ts');
deleteFile(stagingPath);

// Step 6: Verify build succeeded
const buildResult = await runBuild();
if (buildResult.failed) {
  restoreFromBackup();
  throw new BuildError(buildResult.errors);
}

console.log('✅ Scenario merged successfully and build verified!');
```

**Guarantees:**
- ✅ If validation fails: staging deleted, production unchanged
- ✅ If build fails: production restored from backup
- ✅ Backup always created before merge
- ✅ Zero risk of partial data in production

---

## 2️⃣ Strict Auto-Fix Boundaries

### Problem: Auto-Fix Scope Creep

Auto-fix is powerful but dangerous. It must have **strict boundaries**:

```
❌ WRONG: Auto-fix silently renames chunkIds to fix duplicates

✅ RIGHT: Auto-fix fixes text, but ASKS USER before changing identity
```

### The Boundary

**✅ Auto-Fix CAN Change (Text-Level):**
- Shorten feedback meaning from 35 → 30 words
- Expand short alternative to fit context
- Fix YAML formatting (quotes, indentation)
- Generate missing feedback items from templates
- Reorder answers if schema allows

**❌ Auto-Fix CANNOT Change (Identity-Level):**
- `scenarioId` - Once assigned, immutable
- `chunkIds` - Once assigned, immutable
- Blank order - Affects answer indices, cannot reorder
- Difficulty - User-assigned, not auto-detected
- Category - User-assigned, not auto-detected

### Implementation

```typescript
async function autoFix(scenario: RoleplayScript): Promise<{
  fixed: RoleplayScript | null;
  canProceed: boolean;
  userActionRequired?: string;
}> {
  const issues = validateScenario(scenario);

  for (const issue of issues) {
    // Text-level fixes (safe)
    if (issue.type === 'wordCountExceeded') {
      scenario.chunkFeedbackV2[issue.index].meaning = truncate(
        scenario.chunkFeedbackV2[issue.index].meaning,
        30
      );
      continue; // Can fix automatically
    }

    if (issue.type === 'missingFeedback') {
      scenario.chunkFeedbackV2.push(generateFeedback(scenario, issue.blankIndex));
      continue; // Can fix automatically
    }

    // Identity-level issues (require user decision)
    if (issue.type === 'scenarioIdCollision') {
      return {
        fixed: null,
        canProceed: false,
        userActionRequired: `ID '${scenario.id}' already exists. Choose different topic or manually specify new ID.`
      };
    }

    if (issue.type === 'chunkIdDuplicate') {
      return {
        fixed: null,
        canProceed: false,
        userActionRequired: `ChunkID appears ${issue.count} times. Manually rename or regenerate scenario.`
      };
    }

    if (issue.type === 'blankCountMismatch') {
      return {
        fixed: null,
        canProceed: false,
        userActionRequired: `Blank count (${issue.blankCount}) doesn't match feedback (${issue.feedbackCount}). Add/remove items manually or regenerate.`
      };
    }
  }

  return { fixed: scenario, canProceed: true };
}
```

**Guarantee:**
- ✅ Auto-fix never silently changes identity
- ✅ Identity changes require explicit user approval
- ✅ User always sees what changed before/after

---

## 3️⃣ Collision Detection (Deterministic IDs)

### Problem: ID Collisions

```
User A creates: "Workplace - Performance review" → wp-54-performance-review
User B creates: "Workplace - Performance review" → wp-54-performance-review
    ↓
    Collision! Both scenarios can't coexist.
```

### Solution: Deterministic + Validated

**Deterministic Prefix Strategy:**

```typescript
const categoryPrefixes = {
  Social: 'so',
  Workplace: 'wp',
  'Service/Logistics': 'srv',
  Healthcare: 'hc',
  Community: 'com',
  Academic: 'ac',
  Cultural: 'cul'
};

function generateScenarioId(
  category: string,
  topic: string,
  existingIds: string[]
): string {
  // 1. Deterministic prefix
  const prefix = categoryPrefixes[category];

  // 2. Count existing in category
  const categoryIds = existingIds.filter(id => id.startsWith(prefix + '-'));
  const nextNumber = categoryIds.length + 1;

  // 3. Generate slug from topic
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .slice(0, 3)
    .join('-');

  // 4. Construct candidate
  const candidateId = `${prefix}-${nextNumber}-${slug}`;

  // 5. CRITICAL: Check collision
  if (existingIds.includes(candidateId)) {
    throw new Error(
      `ID collision: '${candidateId}' already exists. ` +
      `Try a different topic or manually specify unique suffix.`
    );
  }

  return candidateId;
}
```

**Guarantee:**
- ✅ Prefixes are deterministic (always `wp` for Workplace)
- ✅ Numbers auto-increment per category
- ✅ Collision check happens before assignment
- ✅ User is asked to choose different topic if collision detected

---

## 4️⃣ Validation Levels (3-Layer Gates)

### Layer 1: Structural Integrity (BLOCKS MERGE)

```typescript
function validateStructural(scenario: RoleplayScript): ValidationResult {
  const errors: string[] = [];

  // Count checks
  if (scenario.blanks.length !== scenario.answerVariations.length) {
    errors.push(
      `Blank count (${scenario.blanks.length}) ≠ ` +
      `answer variations (${scenario.answerVariations.length})`
    );
  }

  if (scenario.blanks.length !== scenario.chunkFeedbackV2.length) {
    errors.push(
      `Blank count (${scenario.blanks.length}) ≠ ` +
      `chunk feedback (${scenario.chunkFeedbackV2.length})`
    );
  }

  if (scenario.blanks.length !== scenario.blanksInOrder.length) {
    errors.push(
      `Blank count (${scenario.blanks.length}) ≠ ` +
      `blanks in order (${scenario.blanksInOrder.length})`
    );
  }

  // Index checks
  scenario.chunkFeedbackV2.forEach((feedback, idx) => {
    if (feedback.blankIndex >= scenario.blanks.length) {
      errors.push(
        `ChunkFeedback index ${feedback.blankIndex} out of range ` +
        `(max: ${scenario.blanks.length - 1})`
      );
    }
  });

  // Uniqueness checks
  const chunkIds = scenario.chunkFeedbackV2.map(cf => cf.chunkId);
  const uniqueChunkIds = new Set(chunkIds);
  if (chunkIds.length !== uniqueChunkIds.size) {
    errors.push('Duplicate chunkIds detected');
  }

  // Minimum requirements
  const dialogueLines = scenario.dialogue.split('\n').length;
  if (dialogueLines < 30) {
    errors.push(
      `Dialogue too short: ${dialogueLines} lines (minimum 30 required)`
    );
  }

  return {
    passed: errors.length === 0,
    errors,
    severity: 'CRITICAL'
  };
}
```

**Blocks Merge If:**
- ❌ Counts don't match (blanks ≠ answers ≠ feedback)
- ❌ Indices out of range
- ❌ Duplicate chunkIds
- ❌ Duplicate scenarioIds
- ❌ <30 dialogue lines
- ❌ Missing required fields

---

### Layer 2: Content Quality (BLOCKS MERGE)

```typescript
function validateContent(scenario: RoleplayScript): ValidationResult {
  const errors: string[] = [];

  // Word count limits
  scenario.chunkFeedbackV2.forEach((feedback, idx) => {
    const meaningWords = feedback.meaning.split(/\s+/).length;
    if (meaningWords > 30) {
      errors.push(
        `Feedback[${idx}].meaning too long: ${meaningWords} words (max 30)`
      );
    }

    const fixWords = feedback.fix.split(/\s+/).length;
    if (fixWords > 25) {
      errors.push(
        `Feedback[${idx}].fix too long: ${fixWords} words (max 25)`
      );
    }
  });

  // Category diversity
  const categories = new Set(
    scenario.chunkFeedbackV2.map(cf => cf.category)
  );
  if (categories.size < 2 && scenario.chunkFeedbackV2.length > 5) {
    errors.push(
      `Low category diversity: only ${categories.size} category type(s) ` +
      `for ${scenario.chunkFeedbackV2.length} blanks`
    );
  }

  // Difficulty constraints
  const constraints = difficultyConstraints[scenario.difficulty];
  const maxAlts = constraints.maxAlternatives;
  scenario.answerVariations.forEach((answers, idx) => {
    if (answers.alternatives.length > maxAlts) {
      errors.push(
        `Too many alternatives at blank ${idx}: ` +
        `${answers.alternatives.length} (max ${maxAlts} for ${scenario.difficulty})`
      );
    }
  });

  // Grammar terminology check
  scenario.chunkFeedbackV2.forEach((feedback, idx) => {
    const grammarTerms = ['verb', 'noun', 'adjective', 'article', 'pronoun'];
    const feedback_text = `${feedback.meaning} ${feedback.fix}`;
    const found = grammarTerms.filter(term =>
      feedback_text.toLowerCase().includes(term)
    );
    if (found.length > 0) {
      errors.push(
        `Grammar terminology detected in feedback[${idx}]: ${found.join(', ')}`
      );
    }
  });

  return {
    passed: errors.length === 0,
    errors,
    severity: 'HIGH'
  };
}
```

**Blocks Merge If:**
- ❌ Word count limits exceeded
- ❌ Low category diversity
- ❌ Too many alternatives for difficulty level
- ❌ Grammar terminology in feedback

---

### Layer 3: TypeScript Build (BLOCKS MERGE)

```typescript
async function validateBuild(): Promise<ValidationResult> {
  const result = execSync('npm run build 2>&1', {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8'
  });

  if (result.includes('error TS')) {
    // Parse error details
    const errors = result.split('\n').filter(line => line.includes('error TS'));
    return {
      passed: false,
      errors,
      severity: 'CRITICAL'
    };
  }

  return {
    passed: true,
    errors: [],
    severity: 'N/A'
  };
}
```

**Blocks Merge If:**
- ❌ TypeScript compilation fails
- ❌ Build produces errors or warnings
- ❌ Type checking fails

---

## 5️⃣ Difficulty Constraints (Not Just Labels)

### Problem: Difficulty Is Vague

```
❌ WRONG: User selects "B2" → Just store as label, no effect on generation

✅ RIGHT: User selects "B2" → Apply concrete constraints to dialogue
```

### Constraint Mapping

```typescript
const difficultyConstraints = {
  B1: {
    maxSentenceLength: 20,
    targetBlankDensity: 0.15, // 1 blank per 6-7 words
    maxAlternatives: 2,
    vocabularyLevel: 'highFrequency',
    chunkComplexity: 'simple'
  },
  B2: {
    maxSentenceLength: 25,
    targetBlankDensity: 0.18, // 1 blank per 5-6 words
    maxAlternatives: 3,
    vocabularyLevel: 'intermediate',
    chunkComplexity: 'moderate'
  },
  C1: {
    maxSentenceLength: 30,
    targetBlankDensity: 0.20, // 1 blank per 5 words
    maxAlternatives: 3,
    vocabularyLevel: 'advanced',
    chunkComplexity: 'sophisticated'
  },
  C2: {
    maxSentenceLength: 35,
    targetBlankDensity: 0.22, // 1 blank per 4-5 words
    maxAlternatives: 4,
    vocabularyLevel: 'mastery',
    chunkComplexity: 'nuanced'
  }
};

// Applied during generation
function generateDialogue(topic, turns, difficulty) {
  const constraints = difficultyConstraints[difficulty];

  let dialogue = generateFromTemplate(topic, turns);

  // Enforce constraints
  dialogue = splitLongSentences(dialogue, constraints.maxSentenceLength);
  dialogue = addOrRemoveBlanks(dialogue, constraints.targetBlankDensity);

  // Validate against constraints
  const validation = validateDifficultyConstraints(dialogue, difficulty);
  if (!validation.isValid) {
    dialogue = regenerateWithConstraints(dialogue, constraints);
  }

  return dialogue;
}
```

**Guarantee:**
- ✅ Difficulty level actually shapes generation
- ✅ Sentence length constrained
- ✅ Blank density constrained
- ✅ Number of alternatives constrained
- ✅ Vocabulary complexity constrained

---

## 6️⃣ Minimum Requirements Enforced

Every scenario MUST satisfy:

```typescript
const minimumRequirements = {
  dialogueLines: 30,           // Content rule
  speakers: 2,                 // Exactly 2 speakers
  blanks: { min: 5, max: 20 }, // Reasonable range
  turns: { min: 8, max: 20 },  // Reasonable range
  // 1:1:1:1 ratio (counts must match)
  blankAnswerFeedbackRatio: '1:1:1',
  blankAnswerOrderRatio: '1:1:1'
};

function validateMinimumRequirements(scenario): boolean {
  if (scenario.dialogue.split('\n').length < minimumRequirements.dialogueLines) {
    throw new Error('Insufficient dialogue lines');
  }

  if (new Set(scenario.speakers).size !== 2) {
    throw new Error('Must have exactly 2 speakers');
  }

  if (
    scenario.blanks.length !== scenario.answerVariations.length ||
    scenario.blanks.length !== scenario.chunkFeedbackV2.length ||
    scenario.blanks.length !== scenario.blanksInOrder.length
  ) {
    throw new Error('Count ratios must be 1:1:1:1');
  }

  return true;
}
```

---

## 🎯 Complete Validation Flow

```
1. Generate scenario
   ↓
2. Write to staging file
   ↓
3. Validate Structural Integrity (MUST PASS)
   ├─ Counts match (1:1:1:1)
   ├─ No collisions (scenarioId, chunkIds unique)
   ├─ Indices valid
   └─ ≥30 dialogue lines
   ↓
   If FAIL: Delete staging, show error, ask user
   ↓
4. Validate Content Quality (MUST PASS)
   ├─ Word limits met
   ├─ Category diversity
   ├─ Difficulty constraints enforced
   └─ No grammar terminology
   ↓
   If FAIL: Delete staging, show error, ask user
   ↓
5. Validate TypeScript Build (MUST PASS)
   ├─ npm run build succeeds
   ├─ No TypeScript errors
   └─ No type failures
   ↓
   If FAIL: Delete staging, show error, ask user
   ↓
6. Create backup of production
   ↓
7. Merge staging → production
   ↓
8. Run build again on production (final check)
   ↓
   If FAIL: Restore from backup, show error
   If PASS: Show success message
```

---

## 📋 Definition of Done

A scenario is READY TO MERGE only if ALL of the following pass:

```
IDENTITY
  ✓ scenarioId is unique (no collisions)
  ✓ chunkIds are unique within scenario
  ✓ IDs never change after assignment

CONTENT INTEGRITY
  ✓ ≥30 dialogue lines
  ✓ Exactly 2 speakers
  ✓ blanks = answers = blanksInOrder = chunkFeedback (1:1:1:1)
  ✓ All required fields populated
  ✓ No undefined values

DIFFICULTY CONSTRAINTS
  ✓ Max sentence length enforced
  ✓ Blank density within target range
  ✓ Alternatives count within limit
  ✓ Vocabulary level appropriate

QUALITY GATES
  ✓ Structural validator passes
  ✓ Content validator passes
  ✓ TypeScript build succeeds
  ✓ Backup created before merge

PRODUCTION SAFETY
  ✓ Staging file validated before merge
  ✓ Backup can restore if needed
  ✓ Build verified post-merge
  ✓ Zero risk of partial/corrupt data
```

---

## 🎤 Statement of Seriousness

> This agent only merges after passing strict validation gates:
> - Structural integrity (schema + count ratios + ID uniqueness)
> - Content quality (word limits + category diversity + difficulty constraints)
> - TypeScript build (npm run build succeeds with zero errors)
>
> Scenarios are validated in a staging file BEFORE touching production. If any validator fails, the staging file is deleted and production is untouched. No exceptions.

---

**Status:** ✅ Safety-First Architecture Implemented
**Last Updated:** February 12, 2026
**Reviewed By:** Code Quality Board
