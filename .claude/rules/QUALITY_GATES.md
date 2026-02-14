# Quality Gates: 4-Stage Enforcement

## 4-Gate Architecture

All scenarios must pass through 4 sequential quality gates:

```
Scenario Input
    ↓
Gate 1: Build Verification
    ↓ (must pass)
Gate 2: Validation Checks
    ↓ (must pass)
Gate 3: Testing Suite
    ↓ (must pass)
Gate 4: QA Review
    ↓ (must pass)
Scenario Ready for Production
```

### Gate 1: Build Verification

**Trigger**: On any change to scenario code

**Requirements**:
- ✅ Zero TypeScript errors (`npm run build`)
- ✅ Zero type mismatches
- ✅ All imports resolve correctly
- ✅ Bundle size growth <100 KB

**Command**:
```bash
npm run build
```

**Pass Criteria**: Exit code 0, no errors in output

**Owner**: Automated (TypeScript compiler)

---

### Gate 2: Validation Checks

**Trigger**: After successful build

**Requirements**:
- ✅ Scenario structure valid (ROLE.md spec)
- ✅ ChunkID format correct (`{scenarioId}-b{n}`)
- ✅ blanksInOrder length = answerVariations length
- ✅ No duplicate answer options
- ✅ UK spelling enforced
- ✅ Chunk compliance ≥75-80% (BUCKET_A)
- ✅ All chunks reference LOCKED_CHUNKS

**Command**:
```bash
npm run validate:feedback
```

**Pass Criteria**: All validators report ≥85% confidence

**Owner**: content-validator agent

**Severity Levels**:
- **HIGH (≥95%)**: Auto-apply fixes, proceed
- **MEDIUM (70-94%)**: Flag for review, require approval
- **LOW (<70%)**: Report only, do not block

---

### Gate 3: Testing Suite

**Trigger**: After validation passes

**Requirements**:
- ✅ E2E tests pass for new scenario
- ✅ No regression in existing tests
- ✅ UI renders without errors
- ✅ Feedback displays correctly
- ✅ Blank randomization works

**Commands**:
```bash
# Quick check (6 scenarios, ~30s)
npm run test:e2e:tier1

# Full suite (71 tests, ~5 min)
npm run test:e2e

# With coverage
npm run test:e2e:coverage
```

**Pass Criteria**: 97%+ pass rate (69/71 minimum)

**Owner**: testing-agent

**Acceptable Flakiness**: 2 tests max (documented known issues)

---

### Gate 4: QA Review

**Trigger**: After all tests pass

**Requirements**:
- ✅ Scenario completeness ≥85%
- ✅ Chunk coverage ≥75-80% BUCKET_A
- ✅ Feedback quality review (by human or QA agent)
- ✅ Performance metrics within targets
- ✅ No duplicate scenarios across database
- ✅ Answer alternatives quality (Validator 7)

**Commands**:
```bash
npm run qa-test
npm run validate:alternatives
```

**Pass Criteria**: QA agent sign-off + Answer alternatives validation passing

**Owner**: orchestrator-qa agent

**Answer Quality Checklist** (Validator 7):
- [ ] All answer variations create grammatically correct sentences when substituted
- [ ] No part-of-speech mismatches (noun answer, adjective alternative, etc.)
- [ ] Register/formality consistency (no formal words in casual dialogue)
- [ ] No textbook/academic phrases ("pertaining", "relating") in conversational contexts
- [ ] Emotional tone matches dialogue context (sad context ≠ "amazing")
- [ ] No sentence fragments or incomplete thoughts
- [ ] No redundant duplicate words when substituted
- [ ] Alternatives maintain semantic meaning of main answer

---

## Gate-Specific Metrics

### Gate 1: Build
| Metric | Threshold | Status |
|--------|-----------|--------|
| TypeScript Errors | 0 | ✅ |
| Bundle Size Delta | <100 KB | ✅ |
| Import Resolution | 100% | ✅ |

### Gate 2: Validation
| Metric | Threshold | Status |
|--------|-----------|--------|
| Chunk Compliance | ≥75-80% | ✅ |
| UK Spelling | 100% | ✅ |
| Schema Validity | 100% | ✅ |
| Overall Confidence | ≥85% | ✅ |

### Gate 3: Testing
| Metric | Threshold | Status |
|--------|-----------|--------|
| E2E Pass Rate | ≥97% | ✅ |
| Regression Tests | 0 new failures | ✅ |
| UI Render | 100% success | ✅ |

### Gate 4: QA
| Metric | Threshold | Status |
|--------|-----------|--------|
| Completeness | ≥85% | ✅ |
| Chunk Coverage | ≥75-80% | ✅ |
| Feedback Quality | Approved | ✅ |

---

## Gate Bypass Procedures

### When Bypasses Are Allowed
- **Emergency patches**: Production bugs affecting users
- **Data corrections**: Fixing errors in existing data (not new features)
- **Documented exceptions**: Explicitly approved by human reviewer

### When Bypasses Are NOT Allowed
- New feature additions
- Bulk scenario imports
- Schema changes
- Code refactoring

### Bypass Request Format
```markdown
# Gate Bypass Request

## Gate(s) to Bypass
- [ ] Gate 1: Build
- [ ] Gate 2: Validation
- [ ] Gate 3: Testing
- [ ] Gate 4: QA

## Justification
[Explain why bypass is necessary]

## Risk Assessment
[What could go wrong?]

## Rollback Plan
[How to undo if problems occur?]

## Approver Signature
[Human reviewer approval]
```

---

## Recovery Procedures

### If Gate 1 Fails (Build Error)
1. Read TypeScript error output
2. Fix code error
3. Re-run `npm run build`
4. Restart at Gate 1

### If Gate 2 Fails (Validation)
1. Run `npm run validate:feedback` to get detailed report
2. Address HIGH/MEDIUM confidence issues
3. Re-submit for validation

### If Gate 3 Fails (Test Failure)
1. Run `npm run test:e2e` to isolate failure
2. Check if failure is in new scenario or existing code
3. Fix code or adjust test expectations
4. Re-run tests

### If Gate 4 Fails (QA Review)
1. Review QA agent feedback
2. Address completeness or chunk coverage issues
3. Update scenario data
4. Re-submit for QA review

---

## Gate Metrics Dashboard

Track gate metrics in CI/CD:
- Build time per scenario
- Validation confidence scores
- Test pass rate trend
- QA sign-off rate

**Targets**:
- Build time: <2 minutes per scenario
- Validation pass rate: 95%+ first attempt
- Test pass rate: 97%+ maintained
- QA sign-off rate: 90%+ first attempt

---

**Last Updated**: Feb 14, 2026
