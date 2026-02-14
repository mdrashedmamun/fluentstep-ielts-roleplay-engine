# Workflow Rules: Development Strategy & Scope Management

## The Strategic Error Pattern (To Prevent)

**User asks**: "Fix scenario X"
**Wrong response**: Run validation on all 52 scenarios, build infrastructure, think about scaling
**Right response**: Focus exclusively on scenario X until 100% working

## Single-Scenario Focus Principle

### Rule 1: Prove One Before Scaling

**Before working on multiple scenarios simultaneously, you MUST:**
- ✅ Complete ONE scenario end-to-end (creation → import → rendering)
- ✅ Validate it passes all 4 quality gates (Build → Validate → Test → QA)
- ✅ Verify E2E tests pass for THAT specific scenario
- ✅ Confirm it renders correctly in UI (npm run dev + manual check)
- ✅ Document what went wrong and create validation rules
- ❌ Do NOT start work on other scenarios until first is 100% complete

**Definition of "100% Complete" for a Scenario:**
1. Content created (dialogue, blanks, V2 schema)
2. Validated (Gates 1-2 PASS, ≥85% confidence)
3. Imported to `staticData.ts`
4. Build passes (0 TypeScript errors)
5. E2E test passes for that scenario
6. Renders in UI without errors
7. Failures documented
8. Validation rules created to prevent that failure

**Examples:**

**✅ Good: Single-scenario focus**
```
User: "Import BBC scenario"
→ Read BBC from .staging/approved/
→ Merge to staticData.ts
→ Run build on THAT scenario
→ Test THAT scenario locally
→ Document failures
→ Create validation rules
→ DONE
```

**❌ Bad: Scope creep**
```
User: "Import BBC scenario"
→ Validate all 52 scenarios
→ Build staging infrastructure
→ Think about batch processing 5 scenarios
→ Design multi-agent coordination
→ Run full E2E suite (71 tests)
→ BBC scenario STILL not working
```

### Rule 2: Targeted Validation Scope

**When validating changes:**

**✅ CORRECT Validation Scope:**
- Working on 1 scenario → Validate THAT scenario only
- Changed validation logic → Run on 2-3 test scenarios to verify fix
- Schema change affecting all scenarios → Run on ALL (with explicit justification)
- Pre-deployment QA → Run full suite (Gate 4 requirement)

**❌ INCORRECT Validation Scope:**
- Fixing 1 scenario → Running `npm run validate:feedback` (all 52 scenarios)
- Testing import workflow → Validating all scenarios instead of pilot scenario
- Any scenario work → Automatically running full test suite

**Commands by Scope:**

| Scope | Command | When to Use |
|-------|---------|-------------|
| Single scenario | `npm run test:e2e -- tests/e2e/scenarios/test_{scenario}.py` | Working on specific scenario |
| Quick check (6 scenarios) | `npm run test:e2e:tier1` | Verifying no regressions |
| Full suite (71 tests) | `npm run test:e2e` | Pre-deployment QA only |
| All 52 scenarios validation | `npm run validate:feedback` | Schema changes or pre-deployment |

### Rule 3: Batch Work Requires Explicit Approval

**Parallel batch enhancement (5+ scenarios) is ONLY allowed when:**
1. ✅ Single-scenario workflow proven to work (template exists)
2. ✅ User explicitly requests batch work ("enhance scenarios 8-12")
3. ✅ Orchestrator-Dev creates TaskList with clear dependencies
4. ✅ Each scenario in batch is independent (no shared state)
5. ❌ Do NOT batch without proving single workflow first

**Approval Decision Tree:**

```
User request: "Fix scenario X"
  → Is X a single scenario? YES
    → Focus mode: Work only on X
  → Did they say "and scenarios Y, Z"? NO
    → Focus mode: Work only on X
  → Am I thinking "might as well fix Y too"? YES
    → STOP: Scope creep detected
    → Ask user: "Should I also work on Y, or just X?"
```

**Batch Work Example (REQUIRES APPROVAL):**
```
User: "Enhance social scenarios 8 through 12 using the template from social-7"
→ ✅ Template proven (social-7 complete)
→ ✅ Explicit batch request (5 scenarios)
→ ✅ Create TaskList:
     #1: Enhance social-8 (content-gen-agent)
     #2: Enhance social-9 (content-gen-agent)
     #3: Enhance social-10 (content-gen-agent)
     #4: Enhance social-11 (content-gen-agent)
     #5: Enhance social-12 (content-gen-agent)
     #6: Validate all 5 (content-validator-agent)
→ ✅ Run in parallel (multi-agent coordination)
→ Expected: 8-15x speedup vs sequential
```

### Rule 4: Scope Creep Prevention

**When user requests scenario work, ALWAYS clarify scope:**

**Clarification Questions (if ambiguous):**
- "Should I focus exclusively on {scenario-name}, or work on multiple scenarios?"
- "Do you want me to validate just this scenario, or run validation on all scenarios?"
- "Should I prove this works for one scenario first, then batch, or go straight to batch?"

**Default to Single-Scenario Mode unless:**
- User explicitly says "all scenarios", "batch", "scenarios X through Y"
- Task requires system-wide changes (schema migration, validation logic fix)

**Scope Boundaries:**

| User Request | Scope Interpretation | Default Action |
|--------------|---------------------|----------------|
| "Fix BBC scenario" | Single scenario | Work ONLY on BBC |
| "Import BBC scenario" | Single scenario | Import ONLY BBC |
| "Test BBC scenario" | Single scenario | Test ONLY BBC |
| "Validate scenarios" | Ambiguous | ASK: "Which scenario(s)?" |
| "Fix all social scenarios" | Batch (explicit) | Clarify: "All 12 social scenarios?" |
| "Enhance social-8 to social-12" | Batch (explicit) | Confirm: 5 scenarios, prove template first |

## Incremental Development

### Rule 5: Small Commits, Fast Feedback

**Development Cycle:**
1. Make ONE logical change
2. Test that change immediately
3. Commit if successful
4. Move to next change

**✅ CORRECT Incremental Flow:**
```
1. Import BBC to staticData.ts
2. Run build → verify no TypeScript errors
3. Run npm run dev → check BBC renders
4. Commit: "feat: Import BBC scenario"
5. THEN: Document failures
6. THEN: Create validation rules
```

**❌ INCORRECT Bundle Flow:**
```
1. Import BBC + Build staging infrastructure + Design 4-gate pipeline + Document workflow
2. Run all 71 E2E tests
3. Create massive commit with unrelated changes
4. BBC scenario still not working
```

### Rule 6: Definition of Done

**Every scenario task must have clear "done" criteria BEFORE starting work.**

**Template:**
```markdown
## Task: {Scenario Name}

**Done Criteria:**
- [ ] Content created/imported
- [ ] Build passes (0 errors)
- [ ] Renders in UI (http://localhost:5173/scenarios/{id})
- [ ] E2E test passes for this scenario
- [ ] Failures documented (what went wrong)
- [ ] Validation rules created (to prevent future failures)
- [ ] Git commit created with descriptive message
```

**Example: BBC Scenario Done Criteria**
```markdown
## Task: BBC Learning 6 Dreams Import

**Done Criteria:**
- [x] Content exists in .staging/approved/bbc-learning-6-dreams.md
- [ ] Imported to src/services/staticData.ts
- [ ] npm run build passes (0 TypeScript errors)
- [ ] npm run dev → navigate to /scenarios/bbc-learning-6-dreams → UI renders 40 blanks
- [ ] E2E test passes: npm run test:e2e -- tests/e2e/scenarios/test_bbc_learning_6_dreams.py
- [ ] Import failure documented (why E2E tests timed out)
- [ ] Validation rule created (catch Vercel timeout before deployment)
- [ ] Git commit: "feat: Import BBC Learning 6 Dreams scenario"

**Status**: 1/8 complete (14.3%)
**Blocker**: Import script exited on E2E timeout, scenario not merged
```

### Rule 7: Rollback Safety

**Every change must be independently reversible.**

**✅ CORRECT Reversible Changes:**
- Single scenario import → Can delete from staticData.ts
- Validation rule added → Can remove from validator
- Single feature flag → Can toggle off

**❌ INCORRECT Irreversible Bulk:**
- Batch import 10 scenarios → Hard to identify which failed
- Schema migration without backup → Can't rollback
- Bulk deletion without archive → Lost data

## Success Metrics (By Scope)

### Single-Scenario Metrics
- Time to 100% complete: ≤4 hours (proven template)
- E2E test pass rate: 100% for that scenario
- Build success: First attempt (if following template)
- Rollback time: <5 minutes

### Batch Metrics (Only After Single Proven)
- Scenarios completed per session: 3-5 (with template)
- Parallel speedup: 8-15x vs sequential
- Error rate: ≤10% (1 failure per 10 scenarios)

## Checklist: Before Starting Any Scenario Work

- [ ] Is this a single scenario or batch request?
- [ ] If single: Have I defined "100% done" criteria?
- [ ] If batch: Has single-scenario template been proven?
- [ ] What is my validation scope? (This scenario only, or all?)
- [ ] Am I tempted to "also fix X"? (Scope creep alert)
- [ ] Do I have user approval for scope?

---

**Last Updated**: Feb 14, 2026 (Session 13 - Post-Mortem)
