# Task 7.4: Smoke Test Execution Plan

**Date:** February 8, 2026
**Objective:** End-to-end test of extraction pipeline
**Test Subject:** New Headway Advanced Unit 4
**PDF Location:** `Source Materials/New-Headway-Advanced-Student_s-Book.pdf`

---

## Test Scope

### Input
- PDF: New Headway Advanced Student's Book
- Target: Unit 4 dialogue content
- Expected: 1-2 scenarios worth of dialogue

### Expected Pipeline Flow

```
1. INTAKE: Estimate scope
   └─ File: New-Headway-Advanced-Student_s-Book.pdf
   └─ Unit: 4 (Families)
   └─ Pages: Estimate 45-67

2. EXTRACTION: PDF Extractor Agent
   └─ Detect Oxford pattern (Person A/B format)
   └─ Extract dialogue turns
   └─ Score richness & confidence
   └─ Expected: 12-18 dialogue turns, confidence ≥70%

3. BLANK INSERTION: Blank Inserter Agent
   └─ Extract 2-4 word phrases
   └─ Score BUCKET_A/B compliance
   └─ Target: 60% BUCKET_A, 30% BUCKET_B, 10% novel
   └─ Expected: 8-12 blanks with answer variations

4. VALIDATION: Content Validator Agent
   └─ Run 7 validators:
      ├─ LOCKED_CHUNKS compliance
      ├─ UK English spelling
      ├─ UK English vocabulary
      ├─ Tonality & register
      ├─ Natural patterns
      ├─ Dialogue flow
      └─ Alternatives quality
   └─ Apply HIGH confidence (≥95%) auto-fixes
   └─ Expected: All 7 validators PASS, confidence ≥85%

5. TRANSFORMATION: Scenario Transformer Agent
   └─ Generate unique scenario ID
   └─ Auto-detect category
   └─ Estimate CEFR difficulty
   └─ Assign realistic characters
   └─ Generate deep dive insights
   └─ Expected: Valid TypeScript RoleplayScript code

6. APPROVAL: Human Final Approval
   └─ Review generated scenario
   └─ Approve/reject/edit
   └─ Expected: Human approves

7. INTEGRATION: Merge to staticData.ts
   └─ Add to scenario array
   └─ Expected: No conflicts

8. VALIDATION HOOK: Auto-Validation
   └─ Hook triggers: npm run validate
   └─ Expected: Passes, zero errors

9. BUILD: npm run build
   └─ Expected: Succeeds, bundle size <350 KB

10. REPORT: Final QA Report
    └─ Expected: Success metrics documented
```

---

## Success Criteria

### Critical Gates (Must All Pass)
- ✓ Extraction confidence ≥70%
- ✓ Dialogue turns ≥8
- ✓ BUCKET_A compliance ≥75-80%
- ✓ All 7 validators PASS
- ✓ Validation confidence ≥85%
- ✓ TypeScript code valid
- ✓ npm run validate passes
- ✓ npm run build succeeds (<350 KB)

### Secondary Metrics
- ✓ Character names realistic + diverse
- ✓ Deep dive insights substantive (2-3 sentences)
- ✓ Manual intervention ≤20% (approval-only)
- ✓ Hook successfully validates data
- ✓ 1-2 scenarios produced

---

## Test Execution

**Status:** Ready
**Executor:** Orchestrator-QA Agent
**Coordination:** Full 10-step pipeline
**Expected Duration:** 15-20 minutes

---

## Expected Output

### Scenario(s) Generated
- ID: advanced-7 (or similar)
- Title: Descriptive action-oriented title
- Category: Advanced (C1-C2 level dialogue)
- Characters: Realistic, diverse names
- Dialogues: 10+ turns with blanks
- Answer Variations: 10-12 answers with alternatives
- Deep Dive Insights: Pedagogical context for each blank

### Validation Report
- Extraction: PASS (confidence ≥70%)
- Blanks: PASS (compliance ≥75-80%)
- Validators: All 7 PASS (confidence ≥85%)
- Transformation: PASS (valid TypeScript)
- Build: PASS (bundle <350 KB)

### Final Status
- ✓ Smoke test PASSED
- ✓ Infrastructure verified working
- ✓ Quality gates enforced
- ✓ Hooks preventing bad data
- ✓ Ready for Phase 8 extraction sprint

---

## Blockers / Issues to Watch

1. **PDF Extraction Issues**
   - OCR quality low → Might need manual extraction
   - Pattern detection fails → Check format detection logic
   - Confidence <70% → Would flag for human review (expected)

2. **Blank Insertion Issues**
   - BUCKET_A compliance <75% → Might need vocabulary adjustment
   - Pedagogical score too low → May need manual phrase review

3. **Validation Issues**
   - Specific validator failing → Would be investigated
   - Multiple medium-confidence findings → Would require human approval
   - Data integrity error → Would trigger hook block

4. **Build Issues**
   - TypeScript compilation error → Would need fix
   - Bundle size exceeded → Would need code optimization
   - npm run validate failure → Would indicate data issue

---

## Contingency Plans

### If Extraction Fails
→ Fall back to manual dialogue input
→ Use existing Headway scenarios as reference
→ Document what caused failure for improvement

### If Validation Rejects
→ Review which validators failed
→ Decide: fix issues or skip scenario
→ Retry after fixes applied

### If Build Fails
→ Investigate TypeScript errors
→ Fix and retry
→ Validate bundle size

### If Manual Intervention Exceeds 20%
→ Document what required human input
→ Identify opportunities for automation
→ Improve for Phase 8 sprint

---

## Test Execution Status

**READY TO BEGIN** ✓

Awaiting orchestrator-qa agent invocation to coordinate full pipeline.
