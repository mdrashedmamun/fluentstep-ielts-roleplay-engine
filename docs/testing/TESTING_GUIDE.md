# Testing Guide - FluentStep IELTS Roleplay Engine

This guide provides instructions for running all tests and verifying the application works correctly.

---

## Prerequisites

```bash
# Install dependencies
npm install

# Verify Node.js version (v20+ recommended)
node --version
```

---

## Test Execution Guide

### Phase 1: Automated Tests

#### Test Case 1: Data Validation Script
Validate all 36 scenarios for data integrity issues.

```bash
# Run validation script
npm run validate

# Expected output:
# === Scenario Data Validation Report ===
# ✅ All scenarios passed validation!
# Validated 36 scenarios with zero errors.
```

**What it checks:**
- Chinese characters or emoji in answers
- Invalid RoleplayScript structure
- Missing required fields (index, answer, alternatives)
- Answer indices exceeding dialogue length
- Deep dive insight validity

---

#### Test Case 9: Build & TypeScript Compilation
Build the production bundle and verify TypeScript compilation.

```bash
# Build production bundle
npm run build

# Expected output:
# vite v6.4.1 building for production...
# ✓ 42 modules transformed.
# ✓ built in Xms
# dist/index.html                   1.36 kB │ gzip:  0.70 kB
# dist/assets/index-*.js          298.87 kB │ gzip: 88.88 kB
# dist/assets/index-*.css          30.97 kB │ gzip:  5.91 kB
```

**Success criteria:**
- Exit code 0
- 42 modules transformed
- No TypeScript errors
- Bundle sizes within expected range

---

### Phase 2: Manual Browser Tests

#### Setup: Start Development Server

```bash
# Start dev server
npm run dev

# Expected output:
# ➜  Local:   http://localhost:3000/
# ➜  Network: http://192.168.0.199:3000/

# Keep this running while performing manual tests
```

#### Test Case 2: Interactive Blank Popup - Race Condition Fix

**Steps:**
1. Open http://localhost:3000 in browser
2. Click "Enter Story" on "Meeting a New Flatmate"
3. Click first blank to open popup
4. Verify popup displays answer text
5. Click X button to close popup
6. **CRITICAL:** Verify popup stays closed (wait 2 seconds)
7. Click another blank to open popup
8. Click outside popup on dark overlay
9. Verify popup closes and stays closed

**Success criteria:**
- Popup closes with X button and stays closed
- Popup closes on outside click and stays closed
- No toggle loop (popup doesn't reopen)

---

#### Test Case 3: Progress Tracking Persistence

**Steps:**
1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Look for `fluentstep:progress` key
4. Select "Meeting a New Flatmate"
5. Progress through 3 steps
6. Reveal 2 blanks (click to open, then close)
7. Check localStorage JSON - should contain:
   ```json
   {
     "status": "in_progress",
     "currentStep": 3,
     "revealedBlanks": [0, 2]
   }
   ```
8. **CRITICAL:** Press F5 to refresh page
9. Navigate back to same scenario
10. Verify same progress restored (step, blanks)

**Success criteria:**
- Progress saves to localStorage after each action
- Page refresh restores exact state
- Time tracking increments correctly

---

#### Test Case 4: Keyboard Navigation (All Shortcuts)

**Steps:**
1. Open any scenario
2. Test Space key: Press Space → next dialogue appears
3. Test Enter key: Press Enter → next dialogue appears
4. Test ? key: Press ? → Keyboard Shortcuts modal opens
5. Verify all 4 shortcuts listed:
   - Space/Enter: Next
   - Escape: Close/Back
   - Cmd/Ctrl+B: Back to Library
   - ?: Help
6. Press Escape to close modal
7. Test Cmd+B (Mac) or Ctrl+B (Windows)
8. Verify returns to topic selector (browser bookmark dialog doesn't appear)

**Success criteria:**
- All shortcuts work correctly
- preventDefault prevents default browser behavior
- Shortcuts disabled when focused on input field

---

#### Test Case 5: Onboarding Modal (First Visit Only)

**Steps:**
1. Clear localStorage: DevTools → Application → Clear all
2. Refresh page
3. Verify onboarding modal appears with 4 steps
4. Click "Next" through all 4 steps
5. Verify progress dots: 1/4 → 2/4 → 3/4 → 4/4
6. On step 4, check "Don't show this again"
7. Click "Get Started"
8. Refresh page (F5)
9. **CRITICAL:** Verify onboarding does NOT appear
10. Clear localStorage, refresh, verify onboarding shows again
11. Click "Skip Tutorial" button
12. Verify modal closes and flag is set
13. Refresh page - onboarding should NOT appear

**Success criteria:**
- Onboarding appears on first visit only
- "Don't show again" flag prevents re-display
- "Skip Tutorial" works correctly
- localStorage flag: `fluentstep:skipOnboarding = true`

---

#### Test Case 6: Speech Synthesis (British English Voice)

**Steps:**
1. Open any scenario (e.g., service-1 Café)
2. Find "Listen" button on a dialogue bubble
3. Click "Listen" button
4. Verify speech plays (listen for British accent)
5. Verify bubble highlights with border
6. Click "Listen" on different bubble
7. Verify previous speech stops, new speech starts
8. Check DevTools Console for voice information

**Success criteria:**
- Speech plays without errors
- British English voice preferred
- No overlapping audio
- Active bubble highlights during speech

---

#### Test Case 7: Scenario Data Integrity (Random Sampling)

**Test 5 scenarios:**

**1. social-5-running-into**
- Navigate to "Running Into an Old Friend"
- Check blank #4: Should show "going" (English)
- **Verify:** NOT Chinese characters

**2. service-4-return-no-receipt**
- Navigate to "Returning a Faulty Item"
- Check blank #13: Should show "partial" (English)
- **Verify:** NOT Chinese `城镇`

**3. workplace-31-disagreement**
- Navigate to "Professional Disagreement Resolution"
- Verify all blanks display English text

**4. service-31-cafe-full-flow**
- Navigate to "Café Ordering (Full Flow)"
- Verify 36 blanks present
- Verify all answers English

**5. advanced-2-manager-no**
- Navigate to advanced scenario
- Verify dialogue and blanks work correctly

**Success criteria:**
- All 5 scenarios render without errors
- No Chinese characters visible
- All answers English text
- Deep dive modals open correctly

---

#### Test Case 8: Progress Bar and Completion Badges

**Steps:**
1. Clear localStorage
2. Refresh page
3. Verify progress bar shows 0% (0/36)
4. Complete "Meeting a New Flatmate" (social-1)
   - Progress through all dialogue
   - Reveal all blanks
   - Finish scenario
5. Return to topic selector
6. Verify:
   - Progress bar shows 3% (1/36)
   - Card shows "✓ Complete" badge
   - Button text changed to "Review"
7. Complete 2 more scenarios
8. Verify progress bar shows 8% (3/36)
9. Refresh page (F5)
10. Verify progress bar and badges persist

**Success criteria:**
- Progress percentage correct
- Completion badges display on finished scenarios
- Progress persists across refresh

---

#### Test Case 10: Edge Cases & Error Handling

**Test 1: Rapid Popup Toggle**
1. Open popup on blank
2. Immediately click X button (< 100ms)
3. Verify popup closes cleanly without toggle loop
4. Wait 2 seconds - should stay closed

**Test 2: Concurrent Blank Clicks**
1. Open popup on blank #1
2. While open, click blank #2
3. Verify popup switches without corruption

**Test 3: Keyboard + Popup**
1. Open popup
2. Press Escape
3. Verify popup closes correctly

**Test 4: Progress Consistency**
1. Rapidly progress through steps
2. Open/close multiple blanks
3. Refresh page
4. Verify progress preserved exactly

**Success criteria:**
- All edge cases handled gracefully
- No unhandled exceptions
- UI doesn't corrupt

---

## Verification Checklist

### Automated Tests
- [ ] Data validation script runs successfully
- [ ] 36 scenarios pass validation
- [ ] Build completes with exit code 0
- [ ] 42 modules transform
- [ ] Zero TypeScript errors

### Browser Tests
- [ ] Popup closes cleanly (Test 2)
- [ ] Progress persists after refresh (Test 3)
- [ ] All keyboard shortcuts work (Test 4)
- [ ] Onboarding respects flags (Test 5)
- [ ] Speech synthesis plays (Test 6)
- [ ] 5 scenarios data verified (Test 7)
- [ ] Progress bar calculates correctly (Test 8)
- [ ] Edge cases handled (Test 10)

---

## CI/CD Integration

### GitHub Actions
The following tests run automatically on push:

```bash
# In .github/workflows/test.yml (recommended)
- npm run validate
- npm run build
```

### Pre-commit Hook
```bash
# Add to .husky/pre-commit (recommended)
npm run validate
npm run build
```

---

## Troubleshooting

### Validation Script Fails

**Error:** "tsx: command not found"
```bash
# Solution: Install tsx globally or use npx
npm install -g tsx
# OR
npx tsx scripts/validateScenarios.ts
```

**Error:** "All scenarios passed validation!" with errors below
```bash
# Check the error details
# Fix the specific scenario in services/staticData.ts
# Re-run validation until all pass
```

### Build Fails

**Error:** "TypeScript compilation failed"
```bash
# Check error message for file and line number
# Fix the TypeScript error
# Rebuild: npm run build
```

**Error:** Module not found
```bash
# Ensure all dependencies installed
npm install
# Rebuild: npm run build
```

### Browser Tests Fail

**Dev server not running**
```bash
# Start in separate terminal
npm run dev
# Verify: http://localhost:3000 opens in browser
```

**localStorage not clearing**
```bash
# Open DevTools (F12)
# Application → Local Storage
# Right-click → Clear All
# Or use: localStorage.clear() in console
```

**Popup doesn't close**
```bash
# Check DevTools Console for errors
# Verify useCallback is used in RoleplayViewer.tsx
# Check isClosingRef guard is implemented
```

---

## Performance Testing

### Lighthouse Audit
```bash
# Build production bundle
npm run build

# Preview production build
npm run preview

# Open http://localhost:4173 in Chrome
# Run Lighthouse audit (DevTools → Lighthouse)
# Target: >85 on mobile, >90 on desktop
```

### Bundle Analysis
```bash
# Check bundle size
npm run build

# Look for:
# - JS: 298 kB (88 kB gzipped) - OK
# - CSS: 31 kB (6 kB gzipped) - OK
# - HTML: 1.4 kB (0.7 kB gzipped) - OK
```

---

## Additional Resources

- **Test Report:** `/TEST_REPORT.md` - Detailed test results
- **Testing Summary:** `/TESTING_SUMMARY.md` - Quick overview
- **Source Code:** `/services/staticData.ts` - 36 scenarios
- **Validation Script:** `/scripts/validateScenarios.ts` - Data checker

---

## Support

For issues or questions:
1. Check `/TEST_REPORT.md` for detailed test results
2. Review error logs in DevTools Console
3. Check git commit message for recent changes
4. Verify all dependencies installed: `npm install`

---

**Last Updated:** February 7, 2026
**Test Status:** All 10 test cases passing ✅
