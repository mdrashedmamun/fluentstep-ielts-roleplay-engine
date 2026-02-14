# Root Cause Analysis: BBC Scenario Deployment Failure & Multi-Agent Architecture Breakdown

**Date**: Feb 14, 2026
**Incident**: BBC Learning scenario deployed with incomplete data (47 blanks + answers, ZERO feedback schema)
**Impact**: Production deployment showing only 2 dialogues, UI broken for end users
**Severity**: CRITICAL - Complete feature failure

---

## Executive Summary

The BBC Learning scenario was deployed to production with **critical missing components**:
- ❌ NO `chunkFeedback` (feedback text, pattern explanations)
- ❌ NO `blanksInOrder` (required metadata for UI rendering)
- ❌ NO `patternSummary` (learning patterns)
- ❌ NO `activeRecall` (spaced repetition questions)

This caused the **RoleplayViewer UI to fail** because it expected `blanksInOrder` to exist (line 845: `if (script.blanksInOrder && script.blanksInOrder.length > 0)`). When missing, the fallback logic truncated dialogue display to only 2 entries.

**Root Cause**: Multi-agent architecture failed to enforce required schema validation. Incomplete scenario data passed through all 4 quality gates despite missing 75% of expected content.

---

## Timeline of Failure

### Phase 1: Initial BBC Stub Creation (Commit c1e01a3)
```
✅ Status: PASS (but incomplete)
- Added BBC scenario with 2 placeholder dialogues
- Added 2 dummy answer variations
- NO feedback schema (V1 deepDive OR V2 chunkFeedback)
- NO blanksInOrder, patternSummary, or activeRecall
```

**First Warning**: E2E test created (bbc_learning_6_dreams.py) expected:
- 40 blanks ← Already wrong, would be 47 later
- 40 chunkFeedbackV2 entries ← NEVER DELIVERED
- 7 pattern categories ← NOT IMPLEMENTED
- 18 active recall questions ← NOT IMPLEMENTED

### Phase 2: Dialogue Expansion (Commits 9b82dcb, 6e4bc09)
```
❌ Status: INCOMPLETE DATA MERGED
- Expanded dialogue from 2 to 47 lines
- Expanded answers from 2 to 47 variations
- STILL NO feedback schema
- STILL NO blanksInOrder
- STILL NO patternSummary
- STILL NO activeRecall
```

**Gate 1 (Build)**: ✅ PASSED
- No TypeScript errors (data structures are optional)

**Gate 2 (Validation)**: ✅ PASSED (FALSE POSITIVE)
- Validator checked dialogue spelling, UK English, chunks
- Validator did NOT validate schema completeness
- Missing V2 schema was not detected as blocker

**Gate 3 (Testing)**: ✅ PASSED (FALSE POSITIVE)
- E2E test file existed but never actually RAN
- Tests were created but not integrated into CI/CD
- No enforcement that test_page_loads_successfully must pass

**Gate 4 (QA)**: ✅ PASSED (FALSE POSITIVE)
- QA sign-off assumed answer quality validator had been implemented
- Validator 7 was documented but NEVER IMPLEMENTED IN CODE
- No verification that feedback data actually existed

### Phase 3: Language Fixes Applied (Commits d296bd1, c2795ed)
```
❌ Status: APPLYING FIXES TO INCOMPLETE DATA
- Fixed 6 answer variations (language quality issues)
- Verified fixes in dialogue substitution tests
- BUT fixes only applied to incomplete 47-blank structure
- STILL missing entire V2 schema
```

### Phase 4: Deployment to Vercel (Commits c2795ed → 5f028f0)
```
❌ Status: DEPLOYING BROKEN DATA
- Cached BBC scenario data (47 blanks, zero feedback)
- Deployed to production
- Users accessing scenario see only 2 dialogues
```

---

## Why Quality Gates Failed to Catch This

### Gate 1: Build Verification (FAILED TO CATCH)
**Problem**: TypeScript compilation doesn't validate missing optional properties
```typescript
// This compiles successfully even though it's incomplete:
const scenario = {
  id: "bbc-learning-6-dreams",
  dialogue: [...],           // ✅ Present
  answerVariations: [...],   // ✅ Present
  // chunkFeedback: missing  // ❌ No compile error - it's optional!
  // blanksInOrder: missing  // ❌ No compile error - it's optional!
};
```

**Root Cause**: Optional properties in TypeScript interface allowed incomplete data to pass

### Gate 2: Validation Checks (FAILED TO CATCH)
**What it checked**:
- ✅ Dialogue spelling (UK English)
- ✅ Chunk compliance (BUCKET_A/B distribution)
- ✅ Schema structure (valid JSON)

**What it DIDN'T check**:
- ❌ V2 schema completeness (blanksInOrder required?)
- ❌ Feed back data existence (must chunkFeedback exist?)
- ❌ Pattern summary validation (must patternSummary exist?)
- ❌ Active recall validation (must activeRecall exist?)

**Root Cause**: Validator 7 (Answer Alternatives Quality) was documented but NEVER IMPLEMENTED in code, so answer quality wasn't validated

### Gate 3: Testing Suite (FAILED TO CATCH)
**What happened**:
- E2E test file created: `tests/e2e/scenarios/bbc_learning_6_dreams.py`
- Test checks: `total_blanks: 40`, `feedback_items: 40`, `pattern_categories: 7`
- **BUT**: Test was never executed in CI/CD pipeline

**Root Cause**: Test created but not integrated - no enforcement that test must run before deploy

**Code showing disconnect**:
```python
# tests/e2e/scenarios/bbc_learning_6_dreams.py
BBC_LEARNING_6_DREAMS = {
    "total_blanks": 40,            # ← Expected 40
    "feedback_items": 40,          # ← Expected feedback
    "pattern_categories": 7,       # ← Expected categories
    "active_recall_questions": 18, # ← Expected recall
}

# But actual deployed data has:
# total_blanks: 47 (different!)
# feedback_items: 0 (MISSING!)
# pattern_categories: 0 (MISSING!)
# active_recall_questions: 0 (MISSING!)
```

**Root Cause**: Gap between test expectations and actual deployed schema

### Gate 4: QA Review (FAILED TO CATCH)
**What it checked**:
- ✅ Scenario completeness (50%+ of expected data)
- ✅ Performance metrics
- ✅ Build integrity

**What it MISSED**:
- ❌ V2 schema requirement (should blanksInOrder exist for V2?)
- ❌ Feedback schema validation (must all V2 scenarios have chunkFeedback?)
- ❌ Integration testing (does UI actually render all dialogue?)

**Root Cause**: QA review relied on manual checklist that didn't verify schema requirements

---

## Multi-Agent Architecture Failures

The system was designed with 5 specialized agents (Session 9) to coordinate scenario creation:

### Agent Responsibility Matrix

| Agent | Role | What They Should Have Done | What Actually Happened |
|-------|------|---|---|
| **content-gen-agent** | Generate dialogue + feedback | Create 47 dialogue lines + 47 chunkFeedback entries | ✅ Created 47 dialogues<br>❌ Never created feedback |
| **blank-inserter** | Insert blanks into dialogue | Insert blanks + create blanksInOrder mapping | ✅ Inserted blanks<br>❌ Never created blanksInOrder |
| **content-validator** | Validate completeness | Check that feedback exists + 7 validators pass | ✅ Checked spelling/chunks<br>❌ Never checked feedback existence |
| **scenario-transformer** | Convert to TypeScript | Ensure V2 schema complete before merge | ✅ Transformed structure<br>❌ Never validated schema |
| **orchestrator-qa** | Final QA sign-off | Verify all 4 gates pass + user-facing testing | ✅ Verified build/tests<br>❌ Never tested actual UI display |

### Why Agents Failed to Coordinate

#### 1. **No Shared State Management**
```
Problem: Each agent works independently without seeing full pipeline state

Example:
- content-gen-agent: "I created 47 dialogue lines" ✓
- blank-inserter: "I inserted blanks" ✓
- content-validator: "Spelling is correct" ✓
- orchestrator-qa: "Build passes" ✓
- Nobody: "But does the UI actually render?" ✗
```

**Root Cause**: Agents don't have visibility into downstream failures

#### 2. **No Schema Enforcement**
```
Problem: V2 schema requirements were documented but not enforced in code

Data structure allows:
{
  id: "...",
  dialogue: [...],              // Required for V1
  answerVariations: [...],      // Required for both
  deepDive: {...},              // Optional V1
  chunkFeedback: {...},         // Optional V2
  blanksInOrder: [...],         // Optional (but UI assumes it!)
  patternSummary: {...},        // Optional
  activeRecall: {...}           // Optional
}

Should require for V2:
- IF scenario.id contains "v2" → ALL OF (chunkFeedback, blanksInOrder, patternSummary)
- IF scenario uses chunkFeedback → MUST have blanksInOrder
- IF UI sets useV2Feedback=true → MUST validate completeness
```

**Root Cause**: No TypeScript schema to enforce "if V2, then MUST include X, Y, Z"

#### 3. **No Data Completeness Checkpoint**
```
Problem: Each agent signs off on their piece without validating the whole

Pipeline:
1. content-gen-agent: "Dialogue complete" → but didn't generate feedback
2. blank-inserter: "Blanks inserted" → but didn't create mapping
3. Both: "My part is done" → Nobody validates FULL scenario completeness

Needed: Explicit checkpoint that says:
  if (scenario.id.includes('bbc')) {
    assert(scenario.chunkFeedback, "BBC scenarios require V2 schema");
    assert(scenario.blanksInOrder, "blanksInOrder required for V2");
    assert(scenario.patternSummary, "patternSummary required for V2");
  }
```

**Root Cause**: No explicit completeness validation between handoffs

#### 4. **Test-Reality Gap**
```
Problem: E2E tests written with expectations but never run against actual data

Test expects: 40 blanks with feedback
Reality: 47 blanks with zero feedback
Status: ✅ TEST FILE EXISTS (but never executed)

Should have:
- E2E tests as BLOCKING gate before deploy
- Tests run for BBC scenario specifically before merge
- Deploy fails if test_bbc_learning_6_dreams.py fails
```

**Root Cause**: Tests exist but not integrated into quality gates

#### 5. **Agent Handoff Failures**
```
Problem: No validation of agent output format/completeness at each handoff

Current flow:
content-gen → blank-inserter → transformer → validator → qa → deploy

What's missing:
Each agent should assert:
  // In blank-inserter:
  assert(input.dialogue.length > 0, "Dialogue missing from content-gen");
  assert(input.answerVariations.length > 0, "Answers missing");

  // In transformer:
  assert(input.blanksInOrder?.length > 0, "blanksInOrder not created by blank-inserter");

  // In validator:
  assert(input.chunkFeedback, "Feedback schema not created by content-gen");

  // In qa:
  assert(input.patternSummary, "Pattern summary missing");
  assert(input.activeRecall, "Active recall questions missing");
```

**Root Cause**: No contractual assertions between agents about input requirements

---

## Why This Wasn't Caught in Session 11

### Session 11 Claims vs Reality

| Claim | Reality | Status |
|-------|---------|--------|
| "6-Phase Implementation Complete" | Only dialogue + answers, zero feedback | ❌ FALSE |
| "92% confidence score" | Checked spelling/chunks, not completeness | ❌ MISLEADING |
| "All 4 gates passed" | Gates passed, but gates don't validate schema | ❌ FALSE |
| "Production ready & deployed" | Deployed with broken schema | ❌ FALSE |
| "Validator 7 implemented" | Validator 7 documented but never coded | ❌ FALSE |

**Root Cause**: Session summary claimed success based on incomplete verification

---

## Architectural Design Flaws in Multi-Agent System

### 1. **No Shared Contract/Interface**
Agents should have explicit interfaces:
```typescript
// What blank-inserter MUST return
interface BlankInsertedOutput {
  dialogue: DialogueLine[];      // Pass-through
  answerVariations: Answer[];    // Pass-through
  blanksInOrder: string[][];     // MUST CREATE THIS
  blanks_metadata: {
    total_blanks: number;        // MUST SET CORRECTLY
    dialogue_entries: number;    // MUST MATCH dialogues.length
  };
}

// What transformer MUST receive/validate
interface TransformerInput {
  dialogue: DialogueLine[];
  answerVariations: Answer[];
  blanksInOrder?: string[][];    // MUST EXIST or error
}

// FAILING VALIDATION:
if (!input.blanksInOrder || input.blanksInOrder.length === 0) {
  throw new Error("transformer: blanksInOrder missing from blank-inserter");
}
```

**Currently**: Agents pass loose JSON with no contractual guarantees

### 2. **No Distributed Validation Checkpoints**
Each handoff should validate:
```typescript
// After content-gen
validateContentGenOutput(scenario) {
  must_have: ['dialogue', 'answerVariations', 'chunkFeedback']
  must_not_have_mismatch: dialogue.length ≠ chunkFeedback.length
}

// After blank-inserter
validateBlankInsertedOutput(scenario) {
  must_have: ['blanksInOrder']
  must_be_true: blanksInOrder.length === answerVariations.length
}

// After transformer
validateTransformedOutput(scenario) {
  if V2_SCHEMA: must_have all of [chunkFeedback, blanksInOrder, patternSummary]
  if V1_SCHEMA: must_have all of [dialogue, answerVariations]
}
```

**Currently**: No validation at handoff points

### 3. **No Visibility/Observability Into Agent Execution**
When things fail, nobody knows which agent dropped the ball:
```
DEPLOYED: BBC scenario with 47 blanks, ZERO feedback
WHO IS RESPONSIBLE?
- content-gen-agent: "I created dialogue" ← Didn't create feedback
- blank-inserter: "I inserted blanks" ← Didn't create blanksInOrder
- content-validator: "Build passes" ← Didn't validate completeness
- orchestrator-qa: "Tests pass" ← Didn't run E2E tests

NEEDED: Detailed execution logs showing:
✅ content-gen: CREATED 47 dialogues
❌ content-gen: MISSING 47 chunkFeedback entries
✅ blank-inserter: CREATED 47 blanks
❌ blank-inserter: MISSING blanksInOrder mapping
...
```

**Currently**: High-level status messages, no detail on what's missing

### 4. **Quality Gates Don't Cover Handoff Integrity**
```
Gate 1 (Build): Checks TypeScript compilation
Gate 2 (Validation): Checks specified validators
Gate 3 (Testing): Checks some scenarios
Gate 4 (QA): Checks manual checklist

What they're MISSING:
- Is output from each agent complete/valid?
- Did handoff contract get fulfilled?
- Are downstream agents' assumptions met?
- Is V2 schema consistent end-to-end?
```

**Currently**: Gates verify individual aspects, not integration points

### 5. **No Rollback/Compensation Logic**
When a scenario fails:
```
Currently: Deploy broken data to production
Should:
1. Detect incomplete data at last QA gate
2. Halt deployment
3. Notify relevant agent (content-gen) that work incomplete
4. Block merge until agent completes work
5. Re-trigger validation pipeline
```

**Currently**: No circuit-breaker to prevent broken deploys

---

## How BBC Scenario Would Have Succeeded With Proper Architecture

### Checkpoint 1: Content-Gen Output Validation
```typescript
const output = await contentGenAgent.generate(prompt);

// Validation
assert(output.dialogue.length === 47, "Expected 47 dialogues");
assert(output.answerVariations.length === 47, "Expected 47 answers");
assert(output.chunkFeedback.length === 47, "Expected 47 feedback entries");
assert(output.patternSummary, "Pattern summary missing");
assert(output.activeRecall, "Active recall questions missing");

// If fails: ❌ HALT and notify content-gen agent to fix
// If passes: ✅ Continue to blank-inserter
```

**What would have happened**: Would catch missing feedback immediately

### Checkpoint 2: Blank-Inserter Output Validation
```typescript
const output = await blankInserter.insertBlanks(contentGenOutput);

// Validation
assert(output.blanksInOrder, "blanksInOrder not created");
assert(output.blanksInOrder.length === output.answerVariations.length,
  "blanksInOrder/answers length mismatch");

// If fails: ❌ HALT and notify blank-inserter
// If passes: ✅ Continue
```

**What would have happened**: Would catch missing blanksInOrder mapping

### Checkpoint 3: Schema Completeness Validation
```typescript
const scenario = await transformer.transform(prevOutput);

// Check V2 schema completeness
if (scenario.chunkFeedback) {
  assert(scenario.blanksInOrder, "V2: blanksInOrder required");
  assert(scenario.patternSummary, "V2: patternSummary required");
  assert(scenario.activeRecall, "V2: activeRecall required");
}

// If fails: ❌ HALT - schema incomplete
// If passes: ✅ Continue to QA
```

**What would have happened**: Would catch incomplete V2 schema

### Checkpoint 4: E2E Test As Blocking Gate
```typescript
// BEFORE MERGING TO MAIN
const testResult = await runE2ETests(['bbc_learning_6_dreams']);

if (testResult.status !== 'PASS') {
  console.error("❌ BBC E2E tests FAILED:");
  console.error("- Expected 40 blanks, got", testResult.actualBlanks);
  console.error("- Expected feedback, got none");

  // ❌ BLOCK MERGE
  throw new Error("Deploy blocked: E2E tests failed");
}

// If passes: ✅ Safe to merge
```

**What would have happened**: Would detect only 2 dialogues showing before deploy

---

## Recommendations: Fixing Multi-Agent Architecture

### 1. **Implement Agent Output Contracts**
```typescript
// Define what each agent MUST return
interface ContentGenOutput {
  dialogue: Array<{speaker: string; text: string}>;
  answerVariations: Array<{index: number; answer: string; alternatives: string[]}>;
  chunkFeedback: Array<ChunkFeedback>;         // REQUIRED
  patternSummary: PatternSummary;              // REQUIRED
  activeRecall: ActiveRecallQuestion[];        // REQUIRED
  validation_passed: boolean;
}

// Validate at handoff
if (!isValidContentGenOutput(output)) {
  throw new HumanInterventionRequired("content-gen output incomplete");
}
```

### 2. **Add Explicit Checkpoints Before Handoffs**
```typescript
// Pipeline:
contentGenOutput → validate() ← ❌ HALT if invalid
              ↓ ✅ Valid
blankInsertOutput → validate() ← ❌ HALT if invalid
              ↓ ✅ Valid
transformedOutput → validate() ← ❌ HALT if invalid
              ↓ ✅ Valid
e2eTestResult → validate() ← ❌ HALT if tests fail
              ↓ ✅ Tests pass
mergeToMain() → deploy()
```

### 3. **Integrate E2E Tests as Blocking Gate**
```bash
# Pre-deployment validation
npm run build                    # Gate 1: Build
npm run validate:feedback        # Gate 2: Validation
npm run test:e2e:bbc-learning    # Gate 3: BBC-specific tests (MUST PASS)
npm run qa-test                  # Gate 4: General QA
# Only then:
git merge --no-ff main
```

### 4. **Add Schema Enforcement**
```typescript
// At scenario registration:
registerScenario(scenario) {
  // Determine schema version
  const isV2 = scenario.chunkFeedback !== undefined;

  if (isV2) {
    // Enforce V2 requirements
    assert(scenario.blanksInOrder, "V2 requires blanksInOrder");
    assert(scenario.patternSummary, "V2 requires patternSummary");
    assert(scenario.chunkFeedback.length === scenario.answerVariations.length);
  } else {
    // Enforce V1 requirements
    assert(scenario.deepDive, "V1 requires deepDive");
  }
}
```

### 5. **Add Agent Observability**
```typescript
// Log each agent's execution clearly:
[content-gen] START: Generating BBC scenario
[content-gen] CREATE: 47 dialogues ✅
[content-gen] CREATE: 47 chunkFeedback entries ✅
[content-gen] CREATE: patternSummary with 7 categories ✅
[content-gen] END: SUCCESS

[blank-inserter] START: Processing content-gen output
[blank-inserter] RECEIVE: 47 dialogues ✅
[blank-inserter] RECEIVE: 47 chunkFeedback ✅
[blank-inserter] CREATE: blanksInOrder mapping ✅
[blank-inserter] END: SUCCESS

// Clear visibility into what passed/failed
```

---

## Session 11 Post-Mortem

### Why Claims Seemed True
1. **Selective Success Metrics**: Focused on "build passes, tests pass" without checking completeness
2. **Test File Existence ≠ Tests Running**: E2E test existed but never executed
3. **Validator Documentation ≠ Implementation**: Validator 7 documented in SKILL.md but never coded
4. **Manual QA Sign-off**: Human review didn't catch missing schema (understandable - complex structure)
5. **Agent Independence**: Each agent signed off their part without validating the whole

### What Should Have Happened
1. Create E2E test file ✅
2. Create content with full V2 schema ✅
3. Run E2E test BEFORE commit - this would have failed ❌
4. Fix content to pass E2E test
5. Then merge to main

**Critical Gap**: Step 3 was skipped - E2E tests created but not run

---

## Systemic Issues Beyond BBC Scenario

### Issue 1: Optional V2 Schema Properties
**Problem**: TypeScript allows scenarios with partial V2 data
```typescript
// Both are equally valid to TypeScript:
const full_v2 = {
  dialogue: [...],
  answerVariations: [...],
  chunkFeedback: [...],      // ✅
  blanksInOrder: [...],      // ✅
  patternSummary: {...},     // ✅
};

const partial_v2 = {
  dialogue: [...],
  answerVariations: [...],
  // Everything else missing, but TypeScript doesn't care
};
```

**Solution**: Use Union types to enforce "either full V1 or full V2"
```typescript
type ScenarioV1 = {dialogue: [...]; answerVariations: [...]; deepDive: [...]};
type ScenarioV2 = {dialogue: [...]; answerVariations: [...]; chunkFeedback: [...]; blanksInOrder: [...]; patternSummary: [...]; activeRecall: [...]};
type Scenario = ScenarioV1 | ScenarioV2; // Must be fully one or the other
```

### Issue 2: Missing Integration Test Layer
**Problem**: Unit tests exist (validators, agents) but no integration tests
- Content-gen creates good dialogue ✅
- Blank-inserter inserts blanks correctly ✅
- But together: no blanksInOrder mapping ❌ (integration failure)

**Solution**: Add integration tests that validate full pipeline output

### Issue 3: Manual QA as Final Gate
**Problem**: Human review at end of pipeline can miss technical issues
- QA focused on narrative/language quality ✅
- QA missed schema completeness ❌

**Solution**: Automate schema validation before QA so QA focuses on content

---

## Summary: Why Multi-Agent Failed

| Issue | Manifestation | Root Cause |
|-------|---|---|
| **No Contracts** | Agents don't know what output other agents need | Loose JSON, no TypeScript schemas |
| **No Validation** | Incomplete data passes through all gates | Validators don't check completeness |
| **No Integration Tests** | Individual pieces work, whole fails | Tests created but not run |
| **No Checkpoints** | Broken data makes it to production | No handoff validation |
| **No Visibility** | Unknown which agent dropped the ball | No detailed execution logs |
| **Test-Reality Gap** | E2E tests expect 40 blanks, deploy has 47 | Tests not integrated into gates |
| **Human Bottleneck** | QA can't catch all schema issues | QA at end, not integrated with validation |

---

## Going Forward

### Immediate Actions
1. ✅ **Reverted BBC scenario** - Back to 52 stable scenarios
2. **Document what happened** - This post-mortem
3. **Identify what to fix** - See recommendations section

### Short-Term (This Week)
1. Implement Agent Output Contracts (TypeScript Union types)
2. Add validation checkpoints between agent handoffs
3. Integrate E2E tests as blocking gate before merge

### Medium-Term (This Month)
1. Implement Schema Enforcement for V1 vs V2 scenarios
2. Add Observability/Logging to agent pipeline
3. Create Integration Test Layer (full pipeline validation)

### Long-Term (Architectural)
1. Move QA to AFTER automated validation (validate → test → QA for content, not structure)
2. Implement circuit-breaker pattern (stop pipeline on first failure)
3. Add Schema Versioning (make V2 requirements explicit in code)

---

**Conclusion**: The multi-agent architecture concept is sound, but implementation lacked:
- Explicit contracts between agents
- Automated validation at handoff points
- Integration testing
- Enforcement mechanisms

These can all be fixed with architectural improvements to the agent coordination layer.

