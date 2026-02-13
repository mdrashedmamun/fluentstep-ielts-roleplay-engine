# Active Recall System Testing Playbook
## Reusable Guide for Testing Additional Scenarios

Created: Feb 12, 2026 | For: Community Council & Future Scenarios

---

## Quick Reference

This document provides a repeatable testing procedure for verifying Active Recall functionality on any scenario. Successfully tested on **healthcare-1-gp-appointment** on live Vercel deployment.

---

## Pre-Testing Checklist

Before starting tests, verify:

- [ ] Scenario has 11 activeRecall questions imported to `src/services/staticData.ts`
- [ ] All questions have required fields: `id`, `prompt`, `targetChunkIds`
- [ ] All `targetChunkIds` reference valid chunks in `chunkFeedbackV2`
- [ ] Build succeeds: `npm run build` ✅
- [ ] Validation passes: `npm run validate:feedback` ✅

---

## Test Procedure

### Step 1: Data Verification (5 min)

```bash
# Check activeRecall exists in scenario
grep -n "\"id\": \"community-1" src/services/staticData.ts

# Count questions
grep -A 50 "\"activeRecall\":" src/services/staticData.ts | grep "\"id\":" | wc -l
# Should show: 11
```

**Expected Output**: 11 questions with IDs like `c1_ar_1` through `c1_ar_11`

### Step 2: Build Verification (2 min)

```bash
npm run build
# ✅ Expected: "✓ built in X.XXs" with zero TypeScript errors
```

### Step 3: Scenario Navigation Test (15 min)

1. **Navigate to live Vercel URL**
   - `https://fluentstep-ielts-roleplay-engine.vercel.app/scenario/SCENARIO_ID`
   - Example: `...community-1-council-meeting`

2. **Complete the scenario**
   - Use Space bar to advance through turns (fastest method)
   - Alternatively: Click "Next Turn →" button for each turn
   - Continue until you reach the final turn

3. **Verify "Complete Mastery" button appears**
   - Should appear at the very end
   - Click it to trigger completion modal

**Checkpoint**: Completion modal opens with "🎉 Mastery Unlocked" header

### Step 4: Feedback Modal Verification (5 min)

1. **Check Chunk Feedback Tab**
   - ✅ Shows all revealed chunks as cards
   - ✅ Cards display with pin icon and category badge
   - ✅ Expandable/collapsible sections

2. **Check Pattern Summary Tab**
   - Click "📊 Pattern Summary" button
   - ✅ Should show:
     - "🎯 Learning Outcome" section
     - "📊 Pattern Categories" section (3-4 categories typical)
     - "🔗 Cross-Chunk Patterns" section
     - "💡 How to Use This" section

3. **Look for Active Recall CTA**
   - Scroll to bottom of Pattern Summary
   - ✅ Should see "🧠 Test Your Knowledge" section
   - ✅ Text: "Reinforce what you learned with 11 active recall questions"
   - ✅ Button: "Start Active Recall →"

**Checkpoint**: CTA button found and clickable

### Step 5: Active Recall Modal Launch (2 min)

1. **Click "Start Active Recall →" button**

2. **Verify modal opens with**:
   - ✅ Orange header: "ACTIVE RECALL TEST"
   - ✅ Question counter: "Question 1 of 11"
   - ✅ Progress bar showing 1/11
   - ✅ Question prompt in main area
   - ✅ "Select Answer:" section with options
   - ✅ Navigation buttons: "← Back" | "Next Question →"

**Checkpoint**: Modal displays correctly

### Step 6: Question Testing (10 min)

1. **Test 3-5 questions**:
   - Question 1: Observe format
   - Question 2: Click Next, verify new question loads
   - Question 3: Test Back button, verify previous question reloads
   - Question 4: Select answer, verify Next button enables
   - Question 5: Navigate freely to confirm state management

2. **For each question verify**:
   - [ ] Question prompt is clear
   - [ ] Answer options visible (8-12 buttons)
   - [ ] Each option shows: chunk name + definition
   - [ ] Selection highlights in orange
   - [ ] Navigation buttons function correctly
   - [ ] No console errors (open DevTools)

3. **Answer Selection Process**:
   - Click any answer option
   - Wait 300ms for highlight to appear
   - Verify "Next Question →" button becomes enabled

**Checkpoint**: Questions load and interact correctly

### Step 7: Quiz Completion (10 min)

1. **Advance through all 11 questions**
   - For each remaining question:
     - Click any answer (for testing, selection doesn't need to be "correct")
     - Click "Next Question →"
     - Observe progress bar update

2. **Final question (11 of 11)**:
   - Select answer
   - Look for either:
     - A "Submit" or "See Results" button
     - A results screen appearing

3. **Document final state**:
   - Screenshot the results if available
   - Note any "complete" button or back navigation option

**Checkpoint**: Quiz completes without errors

---

## Documentation Template

After testing, fill in this template and save as `ACTIVE_RECALL_TESTING_REPORT_[SCENARIO]_FEB12.md`:

```markdown
# Active Recall Testing Report - [SCENARIO NAME]
Date: 2026-02-12
Scenario ID: [scenario-1-name]
Status: [PASSED / NEEDS INVESTIGATION]

## Pre-Testing Verification
- [ ] Data imported (count: ___ questions)
- [ ] Build succeeds
- [ ] Validation passes

## Phase 1: Scenario Navigation
- [ ] All turns load
- [ ] Completion screen reached
- [ ] No errors observed

## Phase 2: Feedback Modal
- [ ] Chunk Feedback tab displays
- [ ] Pattern Summary tab displays
- [ ] All content renders correctly

## Phase 3: Active Recall CTA
- [ ] CTA button found: YES / NO
- [ ] Button text: "_______________"
- [ ] Button location: Pattern Summary tab / Other: ____

## Phase 4: Quiz Modal
- [ ] Modal opens successfully
- [ ] Header: "ACTIVE RECALL TEST" ✓
- [ ] Question counter visible ✓
- [ ] Progress bar shows ✓

## Phase 5: Questions Testing
Questions tested: ___ out of 11
- Question 1: ✓ Loaded / Answer selected
- Question 2: ✓ Navigation works
- Question 3: ✓ Back button works
- Questions 4-11: ✓ All advance without errors

## Phase 6: Issues Found
- [ ] No issues - READY FOR PRODUCTION
- [ ] Issues found (list below):
  1. _______________
  2. _______________

## Screenshots Generated
- ar_test_01_[scenario]_start.png
- ar_test_02_[scenario]_questions.png
- etc.

## Conclusion
**Status**: ✅ PRODUCTION READY / ⚠️ NEEDS FIXES
```

---

## Quick Troubleshooting

### Issue: "Start Active Recall" button not found
**Solution**:
1. Check if activeRecall questions exist: `grep "activeRecall" src/services/staticData.ts`
2. Verify questions have correct structure
3. Rebuild: `npm run build`

### Issue: Quiz modal opens but no questions show
**Solution**:
1. Open browser DevTools (F12)
2. Check Console for JavaScript errors
3. Verify chunkFeedbackV2 data exists for scenario
4. Check network tab for failed API calls

### Issue: Next Question button disabled after selecting answer
**Solution**:
1. Check that answer click is registering (should see orange highlight)
2. Try clicking different answer option
3. Check browser console for click handler errors
4. Refresh page and try again

### Issue: Page loads slowly (>30 sec)
**Solution**:
1. Expected on live Vercel (network latency 2-5s + React rendering 3-5s)
2. Total 15-25s is normal for production
3. If consistently >30s, check network throttling in DevTools

---

## Performance Benchmarks (from healthcare-1 testing)

| Operation | Time | Status |
|-----------|------|--------|
| Page load | 18-21 sec | ✅ Acceptable |
| Modal open | <1 sec | ✅ Good |
| Question load | <500ms | ✅ Good |
| Navigation | <300ms | ✅ Good |
| Answer highlight | <100ms | ✅ Excellent |

---

## Test Execution Timeline

```
Total time per scenario: ~45 minutes

Step 1 (Pre-check): 5 min
Step 2 (Build): 2 min
Step 3 (Navigate): 15 min
Step 4 (Feedback): 5 min
Step 5 (Launch): 2 min
Step 6 (Questions): 10 min
Step 7 (Complete): 10 min
Documentation: 5 min
```

---

## Browser DevTools Inspection

If you encounter issues, inspect these areas:

### Console Tab
- Look for red errors (not warnings)
- Check for network errors
- Verify no "Cannot read properties" errors

### Network Tab
- Filter by "Fetch/XHR"
- Check all requests return 200-299 status
- Look for failed image/asset loads

### Elements Tab
- Inspect "Start Active Recall" button
- Verify button is visible (not hidden by CSS)
- Check if button has click handlers attached

### Application Tab
- Check localStorage for any error messages
- Verify sessionStorage contains quiz data

---

## Success Criteria

### ✅ System Passes If:
1. All 11 questions load without errors
2. Answer selection highlights correctly
3. Navigation between questions works
4. Progress bar updates accurately
5. No JavaScript console errors
6. Modal opens/closes smoothly
7. Responsive on desktop viewport

### ❌ System Fails If:
1. Modal won't open
2. Questions don't load
3. Answer selection doesn't work
4. Navigation buttons broken
5. Console shows JavaScript errors
6. Quiz hangs/freezes
7. Data mismatches (questions vs chunks)

---

## Next Steps After Testing

### If ✅ PASSED:
1. Document in test report
2. Note any UX improvements observed
3. Commit test report to git
4. Push to remote
5. Mark scenario as "Active Recall Ready" in project dashboard

### If ⚠️ ISSUES FOUND:
1. Document issues with screenshots
2. Create GitHub issues for each problem
3. Note reproduction steps
4. Check if same issue affects healthcare scenario
5. Escalate to development team

---

## Additional Resources

**Related Test Reports**:
- `ACTIVE_RECALL_VERIFICATION_REPORT_FEB12.md` - Data layer verification
- `ACTIVE_RECALL_END_TO_END_TEST_FEB12.md` - Full healthcare testing report

**Code References**:
- Data: `src/services/staticData.ts` (activeRecall array)
- UI: `src/components/RoleplayViewer.tsx` (Modal logic)
- Content: `exports/Content Packages_02122026/` (YAML sources)

**npm Commands**:
```bash
npm run build              # Verify build
npm run validate:feedback  # Validate data
npm run dev              # Local testing
```

---

## Version History

| Date | Scenario | Tested By | Status | Notes |
|------|----------|-----------|--------|-------|
| 2026-02-12 | healthcare-1 | Claude Code | ✅ PASSED | All systems operational, 11/11 questions working |
| 2026-02-12 | community-1 | [TO BE TESTED] | ⏳ PENDING | Use this playbook for testing |

---

**Created by**: Claude Code
**Last Updated**: 2026-02-12
**For use by**: Development Team
**Next test target**: community-1-council-meeting scenario
