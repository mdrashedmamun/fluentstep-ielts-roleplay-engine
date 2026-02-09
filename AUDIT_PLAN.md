# Comprehensive British English Quality Audit - Execution Plan

**Status**: Phase 1 - Infrastructure Ready ✅
**Date**: February 10, 2026
**Scope**: 51 scenarios, 554 blanks, 11 validators (3 new + 8 existing)

---

## Overview

The FluentStep IELTS Roleplay Engine has completed Phase 12 (Google Cloud TTS) and added a new Advanced scenario ("Shifting to a New House"). Before global launch, this document outlines a comprehensive quality audit to identify and fix all grammar, spelling, and British English issues across all 51 scenarios.

### Why This Matters

Recent manual review of the "Shifting to New House" scenario found 3 critical issues that automated validators missed:
- **Redundancy**: "little little teething problems"
- **Double negative**: "none of that's not urgent"
- **Grammar mismatch**: "particularly" (adverb) with adjective coordination

These issues indicate systematic gaps in validation. This audit closes those gaps before launch.

---

## Infrastructure Changes

### 3 New Validators Created

**1. Grammar Context Validator** (`grammarContextValidator.ts`)
- **Purpose**: Detects grammar errors that only emerge in sentence context
- **Detects**:
  - Redundancy (word repetition within 3-word window)
  - Double negatives (2+ negation markers)
  - POS mismatches (adverb/adjective coordination errors)
- **Confidence Scoring**:
  - Redundancy: 98% (HIGH - auto-fix)
  - Double negatives: 100% (HIGH - auto-fix)
  - POS mismatches: 90% (MEDIUM - review)

**2. Contextual Substitution Validator** (`contextualSubstitutionValidator.ts`)
- **Purpose**: Verify all answer alternatives work grammatically in context
- **Checks**:
  - Sentence structure validity after substitution
  - Semantic fit (POS consistency, formality alignment)
  - Contextual appropriateness
- **Confidence Scoring**: 75% (MEDIUM - subjective assessment)

**3. Blank-Answer Pairing Validator** (`blankAnswerPairingValidator.ts`)
- **Purpose**: Ensure deep dive insights correctly reference and explain blanks
- **Checks**:
  - Deep dive index exists and maps to valid blank
  - Answer is mentioned in phrase or insight
  - Alternatives are not duplicates
  - Categories are valid
  - Insights are not empty
- **Confidence Scoring**: 95-100% (HIGH - data integrity)

### Updated Confidence Scoring

Enhanced `confidenceScorer.ts` with new issue types:
- `redundancy`: 0.98 score
- `double-negative`: 1.0 score
- `pos-mismatch`: 0.90 score
- `data-integrity`: 1.0 score
- `invalid-category`: 0.95 score
- `duplicate-alternative`: 1.0 score
- `contextual-fit`: 0.75 score
- `semantic-alignment`: 0.80 score
- `low-diversity`: 0.85 score

---

## Current Validation Baseline

Initial audit run on all 51 scenarios shows:

| Validator | Findings | Severity |
|-----------|----------|----------|
| Chunk Compliance | 339 | ⚠ Advisory |
| UK English Spelling | 20 | ⚠ Review |
| UK English Vocabulary | 1 | ⚠ Review |
| Tonality & Register | 0 | ✓ PASS |
| Natural Patterns | 0 | ✓ PASS |
| Dialogue Flow | 154 | ⚠ Advisory |
| Alternatives Quality | 156 | ⚠ Advisory |
| Deep Dive Quality | 26 | ⚠ Review |
| **Grammar Context** | **125** | **⚠ NEW** |
| **Contextual Substitution** | **331** | **⚠ NEW** |
| **Blank-Answer Pairing** | **189** | **⚠ NEW** |
| **TOTAL** | **1,341** | |

---

## Execution Strategy

### Phase 1: High-Risk Categories (22 scenarios)
- **Advanced** (4 scenarios): Highest complexity, requires precision
- **Workplace** (11 scenarios): Professional English, formal register
- **Expected findings**: ~150-200 issues
- **Estimated time**: 60 minutes
- **Human checkpoints**: 2 (after each subcategory)

### Phase 2: Medium-Risk Categories (25 scenarios)
- **Service/Logistics** (13 scenarios): Transactional language, procedures
- **Social** (12 scenarios): Casual/conversational, colloquialisms
- **Expected findings**: ~100-150 issues
- **Estimated time**: 45 minutes
- **Human checkpoints**: 1 (mid-phase)

### Phase 3: Low-Risk Categories (4 scenarios)
- **Academic** (1): High formality, standardized language
- **Healthcare** (1): Technical vocabulary, precision
- **Cultural** (1): Specialized domain
- **Community** (1): Mixed register
- **Expected findings**: ~20-40 issues
- **Estimated time**: 15 minutes
- **Human checkpoints**: 0 (final batch)

### Approval Workflow

1. **HIGH confidence (≥95%)**: Auto-apply fixes
   - British spelling rules
   - Double negatives
   - Redundancy errors
   - Data integrity issues
   - Duplicate alternatives

2. **MEDIUM confidence (70-94%)**: Present for user approval
   - POS mismatches
   - UK vocabulary choice
   - Dialogue flow issues
   - Semantic fit questions
   - **Interactive CLI workflow**: [A]pprove, [S]kip, [E]dit, [V]iew dialogue

3. **LOW confidence (<70%)**: Report only
   - Contextual ambiguities
   - Subjective tonality
   - Alternative diversity assessments

---

## Quality Gates

### Acceptance Criteria

✅ **Grammar**: 0 errors
- No redundancy
- No double negatives
- No POS mismatches
- All alternatives work in context

✅ **British English**: ≥95% authenticity
- Max 27 spelling issues (5% of 554 blanks)
- Max 27 vocabulary issues (5% of 554 blanks)
- Consistent UK terminology

✅ **Data Integrity**: 100%
- All deep dive indices valid
- No duplicate alternatives
- All categories correct
- All insights populated

✅ **Build Quality**:
- 0 TypeScript errors
- 0 build warnings
- Bundle size stable (<410 kB)
- No performance regression

✅ **Browser Testing**:
- Manual testing of 5+ random scenarios
- Audio pronunciation works
- Progress tracking functional
- No console errors

### Rejection Criteria

❌ Any grammar errors remain
❌ British English authenticity <95%
❌ Build fails or errors appear
❌ Data integrity violations found
❌ Audio/playback breaks

---

## Risk Mitigation

### Backup Strategy

1. **Pre-audit commit**: ✅ Created
   - Commit: `e582de2` - "feat: add 3 new linguistic validators..."
   - Tag: `git tag audit-baseline-2026-02-10`

2. **Phase checkpoints**: 3 commits per phase
   - Phase 1a (Advanced): Commit after scenario group
   - Phase 1b (Workplace): Commit after scenario group
   - Phase 2a (Service): Commit after review
   - Phase 2b (Social): Commit after review
   - Phase 3 (Academic+): Commit all together

3. **Rollback commands**:
   ```bash
   git reset --hard audit-baseline-2026-02-10  # Full rollback
   git reset --hard e582de2                     # To validator baseline
   ```

### Confidence Thresholds

- **≥95%**: Auto-fix without approval
- **70-94%**: Interactive review required
- **<70%**: Report as advisory, no changes

### Human Review Checkpoints

1. **After Phase 1 (22 scenarios)**
   - Check: Sample 3 random scenarios in browser
   - Verify: Audio, progress, no console errors
   - Decision: Continue to Phase 2?

2. **After Phase 2 (25 scenarios)**
   - Check: Sample 4 random scenarios in browser
   - Verify: Consistent fixes applied
   - Decision: Continue to Phase 3?

3. **Final Review (all 51 scenarios)**
   - Check: Full build succeeds
   - Check: Sample 5 random scenarios end-to-end
   - Check: Audio pronunciation natural
   - Decision: Ready for deployment?

---

## Expected Outcomes

### Before Audit
- 51 scenarios, 554 blanks
- Unknown number of issues
- Manual review found 14% error rate in sample
- Estimated 77 blanks with issues (14% of 554)

### After Audit
- 51 scenarios, 554 blanks
- 0 grammar errors
- ≥95% British English authenticity
- ≥90% alternative validity
- 100% data integrity
- Production-ready for global launch

### Success Metrics

| Metric | Target | Method |
|--------|--------|--------|
| Grammar errors | 0 | Validator detection |
| British authenticity | ≥95% | Spelling/vocab checkers |
| Alternative validity | ≥90% | Contextual substitution |
| Data integrity | 100% | Pairing validator |
| Build status | 0 errors | TypeScript compiler |
| Manual testing | 5 scenarios | Browser smoke test |

---

## Timeline

| Phase | Duration | Deliverable | Checkpoint |
|-------|----------|-------------|-----------|
| **Setup** (Already Complete) | 0 min | 3 new validators registered | ✅ |
| **Phase 1a** (Advanced) | 30 min | 4 scenarios audited | ⏳ |
| **Phase 1b** (Workplace) | 30 min | 11 scenarios audited | ⏳ |
| **Checkpoint 1** | 10 min | Browser smoke test (3 scenarios) | ⏳ |
| **Phase 2a** (Service) | 25 min | 13 scenarios audited | ⏳ |
| **Phase 2b** (Social) | 20 min | 12 scenarios audited | ⏳ |
| **Checkpoint 2** | 10 min | Browser smoke test (4 scenarios) | ⏳ |
| **Phase 3** (Academic+) | 15 min | 4 scenarios audited | ⏳ |
| **Final Review** | 15 min | Quality gates verified | ⏳ |
| **Deployment** | 10 min | Git push, verify Vercel | ⏳ |
| **TOTAL** | **3h 15min** | **All 51 scenarios ready** | |

---

## Next Steps

### To Begin Audit

```bash
# 1. Verify build succeeds
npm run build  # Should show 0 errors, ~400kB bundle

# 2. Test validators on known problematic scenario
npm run audit --scenario=advanced-2-moving-house --dry-run

# 3. Run Phase 1a audit (Advanced category)
npm run audit --category=Advanced

# 4. Review findings, approve/skip/edit as prompted
# Follow interactive CLI workflow

# 5. Commit after each phase
git add services/staticData.ts
git commit -m "Audit Phase 1a: Advanced category ..."
```

### To Run Full Audit (Parallel, 3 reviewers)

```bash
# Run in separate terminals/processes
npm run audit --category=Advanced &
npm run audit --category=Workplace &
npm run audit --category=Service/Logistics &
wait

# Review findings together, then continue Phase 2/3
```

### To Generate Final Report

```bash
npm run audit:report --verbose > FINAL_AUDIT_REPORT.md
```

---

## Critical Files

**New validators** (created Feb 10):
- `services/linguisticAudit/validators/grammarContextValidator.ts`
- `services/linguisticAudit/validators/contextualSubstitutionValidator.ts`
- `services/linguisticAudit/validators/blankAnswerPairingValidator.ts`

**Updated files**:
- `cli/auditLanguage.ts` - 3 new registrations
- `services/linguisticAudit/fixers/confidenceScorer.ts` - 9 new issue types

**Target file** (to be modified):
- `services/staticData.ts` - 2,226 lines, all 51 scenarios

**Baseline commit**:
- `e582de2` - Pre-audit infrastructure setup

---

## Notes

- All validators are production-grade with comprehensive error handling
- Confidence scoring balances automation with human judgment
- Phased approach allows course correction
- Multiple rollback options prevent data loss
- Git history preserved for full auditability

**Status**: Ready to begin Phase 1 audit execution ✅
