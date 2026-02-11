# FluentStep Comprehensive Test Suite

**Last Updated**: February 11, 2026
**Test Scope**: 15 comprehensive tests covering 6 recent features/fixes
**Execution Status**: ⏳ Pending user execution
**Overall Result**: ___ / 15 tests passed

---

## Quick Reference

| Category | Tests | Status |
|----------|-------|--------|
| Deployment & Infrastructure | Tests 1-5 | ⏳ Pending |
| Search & Discovery | Tests 6-10 | ⏳ Pending |
| Quality & Feedback | Tests 11-15 | ⏳ Pending |
| **TOTAL** | **15** | **___ / 15 passed** |

---

## Prerequisites

### System Requirements
- Node.js v18+ installed
- npm v9+ or yarn
- Git access to main branch
- Modern browser (Chrome, Safari, Firefox)
- Vercel account access (for Test 5 only)

### Initial Setup
```bash
# Verify all dependencies installed
npm install

# Verify build works
npm run build

# Verify local preview works
npm run preview
```

### Test Environment
- **Local Testing**: `npm run preview` (http://localhost:4173)
- **Production Testing**: https://fluentstep-ielts-roleplay-engine.vercel.app
- **QA Scripts**: `npm run qa-test`, `npm run qa-test:comprehensive`, `npm run qa-check`

---

# CATEGORY 1: DEPLOYMENT & INFRASTRUCTURE (5 TESTS)

## Test 1: SPA Routing - Direct URL Access

### Feature
Vercel rewrites configuration for client-side routing (SPA support)

### Affected Files
- `vercel.json` (11 lines)
- `src/App.tsx` (React Router setup, lines 92-100)

### Test Steps
1. Open production URL in browser: https://fluentstep-ielts-roleplay-engine.vercel.app
2. Navigate to a specific scenario: https://fluentstep-ielts-roleplay-engine.vercel.app/scenario/social-1-flatmate
3. Wait for page to load completely (≤3 seconds)
4. Verify the scenario page displays with title "Meeting a New Flatmate"
5. Verify no 404 error appears in browser console or page
6. Click "Back to Home" button
7. Verify homepage loads without errors

### Expected Results
✅ Direct URL access loads scenario without 404
✅ Page title and content display correctly
✅ Navigation back to home works
✅ Browser console shows no errors

### Pass/Fail Criteria
- **PASS**: All steps complete without 404 or error messages
- **FAIL**: 404 error appears OR page does not load OR content missing

### Test Result
- [ ] **PASS**
- [ ] **FAIL** - Error: _________________________________

### Evidence
```
Screenshot: [Insert screenshot of scenario page here]
Console Errors: [Paste any errors from Developer Tools]
Time to Load: _______ seconds
```

---

## Test 2: SPA Routing - Page Refresh Persistence

### Feature
SPA state persistence when user refreshes page (Cmd+R / Ctrl+R)

### Affected Files
- `vercel.json` (rewrites rule)
- `src/App.tsx` (React Router)
- `src/components/RoleplayViewer.tsx` (state management)

### Test Steps
1. Open homepage: https://fluentstep-ielts-roleplay-engine.vercel.app
2. **Test Scenario A**: "Meeting a New Flatmate" (social-1-flatmate)
   - Click on this scenario
   - Wait for page to load completely
   - Note the URL changes to `/scenario/social-1-flatmate`
   - Refresh page (Cmd+R on Mac, Ctrl+R on Windows/Linux)
   - Wait for page to load after refresh
   - Verify scenario displays without 404 error
3. **Test Scenario B**: "Booking a Table at a Cafe" (service-1-cafe)
   - Navigate to this scenario
   - Refresh page
   - Verify scenario displays without error
4. **Test Scenario C**: "Disagreement at Work" (workplace-1-disagreement)
   - Navigate to this scenario
   - Refresh page
   - Verify scenario displays without error
5. Open browser DevTools (F12) and check Console tab for any errors

### Expected Results
✅ All 3 scenarios persist after refresh
✅ No 404 errors
✅ Scenario content displays correctly after refresh
✅ Browser console shows no errors

### Pass/Fail Criteria
- **PASS**: All 3 scenarios load after refresh without errors
- **FAIL**: Any scenario shows 404 OR content missing OR errors in console

### Test Result
- [ ] **PASS**
- [ ] **FAIL** - Error: _________________________________

### Evidence

**Scenario A (social-1-flatmate)**
- [ ] Loads without error
- [ ] Content visible
- [ ] Console clear

**Scenario B (service-1-cafe)**
- [ ] Loads without error
- [ ] Content visible
- [ ] Console clear

**Scenario C (workplace-1-disagreement)**
- [ ] Loads without error
- [ ] Content visible
- [ ] Console clear

---

## Test 3: Video Files - Asset Serving

### Feature
Video files properly served from `public/videos/` directory through Vite build

### Affected Files
- `public/videos/nature-journey.mp4`
- `public/videos/nature-journey-poster.jpg`
- `vite.config.ts` (build configuration)

### Test Steps
1. Clean build the app:
   ```bash
   rm -rf dist
   npm run build
   ```
2. Check that build completes successfully (exit code 0)
3. Verify video files copied to dist:
   ```bash
   ls -la dist/videos/
   ```
   - Should see `nature-journey.mp4`
   - Should see `nature-journey-poster.jpg`
4. Start preview server:
   ```bash
   npm run preview
   ```
5. Open browser to http://localhost:4173
6. Check if video files are referenced in any scenario view
   - Search code: `grep -r "nature-journey" src/`
   - If referenced, navigate to that scenario and verify video loads
7. Open DevTools Network tab
8. Look for any 404 errors for video files
9. Verify no `Failed to load resource` messages for .mp4 or .jpg files

### Expected Results
✅ Build completes successfully
✅ Video files exist in `dist/videos/`
✅ No 404 errors in Network tab
✅ Video files (if referenced) load correctly

### Pass/Fail Criteria
- **PASS**: Video files in dist, no 404 errors, build succeeds
- **FAIL**: Video files missing from dist OR 404 errors in Network tab

### Test Result
- [ ] **PASS**
- [ ] **FAIL** - Error: _________________________________

### Evidence
```
Build Output: [Paste last 20 lines of npm run build output]
ls -la dist/videos/ Output:
[Paste output here]

Network Errors: [List any 404s or failed resources]
```

---

## Test 4: URL Routing - Invalid Scenario Handling

### Feature
Graceful error handling for invalid routes with helpful error messages

### Affected Files
- `src/App.tsx` (error boundary, catch-all route)
- `src/components/ErrorPage.tsx` (or similar error component)

### Test Steps
1. Open homepage: https://fluentstep-ielts-roleplay-engine.vercel.app
2. **Test Invalid Scenario**: Navigate to https://fluentstep-ielts-roleplay-engine.vercel.app/scenario/nonexistent-scenario-12345
3. Verify an error page displays with:
   - Friendly error message (not technical error)
   - "Back to Home" button or similar navigation link
4. Click "Back to Home" button
5. Verify returns to homepage without error
6. **Test Random Path**: Navigate to https://fluentstep-ielts-roleplay-engine.vercel.app/random/path/here
7. Verify error page OR automatic redirect to homepage
8. Check browser DevTools for any JavaScript errors

### Expected Results
✅ Invalid route shows error page (not blank page or 404)
✅ Error message is user-friendly
✅ "Back to Home" button works
✅ Returns to homepage successfully
✅ No JavaScript errors in console

### Pass/Fail Criteria
- **PASS**: Error page displays, back button works, console clear
- **FAIL**: Blank page OR technical error OR console errors

### Test Result
- [ ] **PASS**
- [ ] **FAIL** - Error: _________________________________

### Evidence
```
Error Message Text: [Write the error message shown]
Error Page Screenshot: [Insert screenshot here]
Console Errors: [Any errors in DevTools Console?]
```

---

## Test 5: Build & Deployment Pipeline

### Feature
Continuous deployment from GitHub to Vercel with automatic builds

### Affected Files
- `vercel.json` (Vercel configuration)
- `.github/workflows/` (if present)
- All source files (checked on deployment)

### Prerequisites
- GitHub access to repository
- Vercel project linked to GitHub repository
- Permission to merge to main branch

### Test Steps
1. Make a minor, non-breaking change:
   - Edit `src/components/Footer.tsx` or similar visible component
   - Add a comment or change footer text temporarily
   - Example: Add `// Test deployment - Feb 11, 2026` at top of file
2. Stage and commit the change:
   ```bash
   git add src/components/Footer.tsx
   git commit -m "test: Verify deployment pipeline (safe test commit)"
   ```
3. Push to main branch:
   ```bash
   git push origin main
   ```
4. Open Vercel dashboard: https://vercel.com/projects
5. Find "fluentstep_-ielts-roleplay-engine" project
6. Monitor deployment status:
   - Should show "Deploying" status
   - Wait for status to change to "Ready" (typically 2-3 minutes)
7. Click on latest deployment
8. Verify:
   - Build logs show no errors
   - Deployment marked as "Ready"
   - Production URL working
9. Visit production site and verify your change is visible
10. **Cleanup**: Revert the test change:
    ```bash
    git revert HEAD
    git push origin main
    ```

### Expected Results
✅ Deployment starts automatically
✅ Build completes without errors
✅ Status changes to "Ready"
✅ Production site reflects changes
✅ Deployment takes 2-3 minutes

### Pass/Fail Criteria
- **PASS**: Deployment succeeds, changes visible on production, no build errors
- **FAIL**: Build fails OR deployment takes >5 minutes OR changes not live

### Test Result
- [ ] **PASS**
- [ ] **FAIL** - Error: _________________________________

### Evidence
```
Vercel Deployment URL: https://vercel.com/projects/...
Deployment Status: [Screenshot of dashboard]
Build Duration: _______ minutes
Change Visible on Production: [ ] YES  [ ] NO
Build Log (last 30 lines):
[Paste here]
```

---

# CATEGORY 2: SEARCH & DISCOVERY (5 TESTS)

## Test 6: Word Stemming - Irregular Stems Dictionary

### Feature
IRREGULAR_STEMS dictionary maps base forms to variants (negotiate↔negotiation, meet↔meeting, discuss↔discussion)

### Affected Files
- `src/services/searchService.ts` (IRREGULAR_STEMS constant, lines ~50-70)
- `src/components/TopicSelector.tsx` (search UI)

### Test Steps
1. Open homepage: http://localhost:4173 (local preview)
2. Locate search bar at top of page
3. **Test 1: "negotiation"**
   - Type "negotiation" in search box
   - Press Enter or wait for auto-search
   - Count number of results shown
   - Verify results include:
     - "Negotiating Business Partnership Terms" (advanced-5)
     - "Viewing an Estate Agent" (service-34)
     - "Landlord Repairs Negotiation" (service-35)
   - Expected: **3 results**

4. **Test 2: "meeting"**
   - Clear search
   - Type "meeting"
   - Count results
   - Verify includes scenarios with "meet", "meeting", "meets"
   - Expected: **≥8 results** (should include "social-1-flatmate", etc.)

5. **Test 3: "discussion"**
   - Clear search
   - Type "discussion"
   - Count results
   - Verify includes scenarios with "discuss", "discussion", "discussing"
   - Expected: **≥15 results**

6. Verify all results show relevant scenarios (not random matches)

### Expected Results
✅ "negotiation" returns 3 results with "negotiating" variants
✅ "meeting" returns ≥8 results with "meet" variants
✅ "discussion" returns ≥15 results with "discuss" variants
✅ All results are relevant

### Pass/Fail Criteria
- **PASS**: All 3 searches return expected counts and relevant results
- **FAIL**: Any search returns 0 results OR incorrect count

### Test Result
- [ ] **PASS**
- [ ] **FAIL** - Error: _________________________________

### Evidence
```
Search: "negotiation"
  Results Found: ___
  Scenarios Listed: [List them]
  All relevant?: [ ] YES  [ ] NO

Search: "meeting"
  Results Found: ___
  Scenarios Listed (first 5): [List them]
  All relevant?: [ ] YES  [ ] NO

Search: "discussion"
  Results Found: ___
  Scenarios Listed (first 5): [List them]
  All relevant?: [ ] YES  [ ] NO
```

---

## Test 7: Word Stemming - Suffix Removal Rules

### Feature
Algorithmic suffix removal applies rules: -ing, -tion, -ed, -er, -ly, -s, -es (only if word ≥3 chars)

### Affected Files
- `src/services/searchService.ts` (stemWord function, suffix removal logic)

### Test Steps
1. Open homepage with search enabled
2. **Test 1: "-ing" removal**
   - Search "teaching"
   - Verify results include scenarios with "teach", "teacher", "teaching"
   - Expected: Matches found

3. **Test 2: "-ly" removal**
   - Search "quickly"
   - Verify results include scenarios with "quick", "quickly"
   - Expected: Matches found

4. **Test 3: "-ed" removal**
   - Search "walked"
   - Verify results include scenarios with "walk", "walking", "walked"
   - Expected: Matches found

5. **Test 4: "-s/-es" removal**
   - Search "boxes"
   - Verify results include scenarios with "box", "boxes"
   - Expected: Matches found

6. **Test 5: Short word protection (≥3 chars minimum after removal)**
   - Search "be"
   - Verify results show scenarios with "be", "been"
   - Should NOT over-stem "be" to "b"
   - Expected: Valid results, no over-stemming

### Expected Results
✅ "teaching" matches teach/teacher variants
✅ "quickly" matches quick variants
✅ "walked" matches walk/walking variants
✅ "boxes" matches box variants
✅ Short words protected (≥3 char minimum)

### Pass/Fail Criteria
- **PASS**: All 5 suffix rules work correctly, no over-stemming
- **FAIL**: Any rule fails to match OR over-stemming occurs

### Test Result
- [ ] **PASS**
- [ ] **FAIL** - Error: _________________________________

### Evidence
```
Search: "teaching"
  Results Found: ___
  Contains variants?: [ ] YES  [ ] NO

Search: "quickly"
  Results Found: ___
  Contains variants?: [ ] YES  [ ] NO

Search: "walked"
  Results Found: ___
  Contains variants?: [ ] YES  [ ] NO

Search: "boxes"
  Results Found: ___
  Contains variants?: [ ] YES  [ ] NO

Search: "be"
  Results Found: ___
  Over-stemmed?: [ ] YES  [ ] NO
```

---

## Test 8: Word Stemming - Edge Cases

### Feature
Edge case handling: empty queries, uppercase, multi-word AND logic, minimum word length

### Affected Files
- `src/services/searchService.ts` (search function, edge case handling)
- `src/components/TopicSelector.tsx` (search input)

### Test Steps
1. **Test 1: Empty query**
   - Clear search box completely
   - Verify all 52 scenarios display
   - Expected: Full list shows

2. **Test 2: Case insensitivity**
   - Search "NEGOTIATION" (all uppercase)
   - Verify results match "negotiation" search (same 3 results)
   - Expected: Case doesn't matter

3. **Test 3: Multi-word AND logic**
   - Search "negotiate business"
   - Verify only scenarios with BOTH "negotiate" AND "business" show
   - Expected: Only "Negotiating Business Partnership Terms" (advanced-5)
   - Result count should be: **1**

4. **Test 4: No results**
   - Search "xyzabc" (nonsense word)
   - Verify "No scenarios found" message displays
   - Expected: User-friendly message

5. **Test 5: Special characters**
   - Search "don't" or "can't"
   - Verify apostrophe handled correctly
   - Expected: Results found or handled gracefully

### Expected Results
✅ Empty query shows all 52 scenarios
✅ Case-insensitive matching works
✅ Multi-word searches use AND logic
✅ No results shows friendly message
✅ Special characters handled

### Pass/Fail Criteria
- **PASS**: All 5 edge cases handled correctly, no crashes
- **FAIL**: App crashes OR unexpected behavior

### Test Result
- [ ] **PASS**
- [ ] **FAIL** - Error: _________________________________

### Evidence
```
Empty Query Result Count: ___ (should be 52)
UPPERCASE Search Result: ___ (should match lowercase)
Multi-word Search (negotiate business): ___ results (should be 1)
No Results Message: [Describe message shown]
Special Chars Handling: [ ] Graceful  [ ] Error
```

---

## Test 9: TopicSelector - URL Search Params Reactivity

### Feature
`searchQuery` state updates reactively when URL search parameters change without page refresh

### Affected Files
- `src/components/TopicSelector.tsx` (lines 54-67: useEffect for URL params, lines 72-74: URL param update)
- `src/App.tsx` (router setup)

### Test Steps
1. Open homepage: http://localhost:4173
2. **Test 1: Initial URL parameter**
   - Manually change URL to: http://localhost:4173/?search=flatmate
   - Wait 1 second (useEffect triggers)
   - Verify search results update to show "flatmate" scenarios WITHOUT page refresh
   - Expected: Results filtered, no page reload visual

3. **Test 2: Change URL parameter**
   - Change URL to: http://localhost:4173/?search=cafe
   - Wait 1 second
   - Verify results update to "cafe" scenarios WITHOUT page refresh
   - Expected: Smooth transition, results change instantly

4. **Test 3: Combined parameters**
   - Change URL to: http://localhost:4173/?difficulty=C1&search=business
   - Wait 1 second
   - Verify results filtered by BOTH difficulty AND search term
   - Expected: Both filters applied

5. **Test 4: URL parameter cleared**
   - Change URL back to: http://localhost:4173/ (no params)
   - Verify all 52 scenarios display again WITHOUT page refresh
   - Expected: Full list restores

6. Verify page never reloaded during any of these changes
   - Check browser tab title (should not flicker)
   - Should not see page loading spinner

### Expected Results
✅ URL param change updates search results reactively
✅ No page refresh occurs
✅ Multiple parameters work together
✅ Clearing params shows all scenarios
✅ Smooth, instant transitions

### Pass/Fail Criteria
- **PASS**: All changes reactive, no page refresh, all filters work
- **FAIL**: Page refreshes OR parameters don't apply OR results don't update

### Test Result
- [ ] **PASS**
- [ ] **FAIL** - Error: _________________________________

### Evidence
```
Test 1 (?search=flatmate):
  Results Updated?: [ ] YES  [ ] NO
  Page Refreshed?: [ ] YES  [ ] NO (should be NO)

Test 2 (?search=cafe):
  Results Updated?: [ ] YES  [ ] NO
  Page Refreshed?: [ ] YES  [ ] NO (should be NO)

Test 3 (?difficulty=C1&search=business):
  Difficulty Filter Applied?: [ ] YES  [ ] NO
  Search Filter Applied?: [ ] YES  [ ] NO
  Page Refreshed?: [ ] YES  [ ] NO (should be NO)

Test 4 (no params):
  All 52 scenarios showed?: [ ] YES  [ ] NO
  Page Refreshed?: [ ] YES  [ ] NO (should be NO)
```

---

## Test 10: Search Highlighting - Accurate Matching

### Feature
`highlightMatches()` function preserves original character case when highlighting matched text

### Affected Files
- `src/services/searchService.ts` (highlightMatches function)
- `src/components/TopicSelector.tsx` (scenario list rendering)

### Test Steps
1. Open homepage with search
2. **Test 1: Title case preservation**
   - Search "negotiate"
   - Find result "Negotiating Business Partnership Terms"
   - Inspect the HTML (right-click → Inspect or DevTools)
   - Look for the highlighting code around "Negotiating"
   - Verify HTML shows: `<mark>Negotiating</mark>` (capital N preserved)
   - NOT: `<mark>negotiating</mark>` or `<mark>NEGOTIATING</mark>`

3. **Test 2: Multi-word highlighting**
   - Search "meeting flatmate"
   - Find result "Meeting a New Flatmate"
   - Verify HTML shows:
     - `<mark>Meeting</mark>` (capital M)
     - `<mark>Flatmate</mark>` (capital F)
   - Both words should be highlighted, case preserved

4. **Test 3: Visual highlighting display**
   - Search "business"
   - Verify highlighted words appear with background color or underline
   - Verify highlighting only applies to matched words, not entire scenario
   - Expected: Only "business" highlighted, not entire title

5. **Test 4: Mid-word stemming**
   - Search "meeting"
   - Find results with "meets" or "met"
   - Verify highlighting correctly identifies the stemmed root
   - Expected: Correct highlighting of stemmed matches

### Expected Results
✅ Original case preserved in highlighted text
✅ Multi-word queries highlight all matching words
✅ Visual highlighting applied correctly
✅ Only relevant parts highlighted

### Pass/Fail Criteria
- **PASS**: Case preserved, correct words highlighted, visual display works
- **FAIL**: Case changed OR wrong words highlighted OR highlighting missing

### Test Result
- [ ] **PASS**
- [ ] **FAIL** - Error: _________________________________

### Evidence
```
Test 1 ("negotiate" in "Negotiating..."):
  HTML Markup: [Paste the relevant HTML]
  Case Preserved?: [ ] YES  [ ] NO

Test 2 ("meeting flatmate"):
  First Word: [Paste <mark> tag with word]
  Second Word: [Paste <mark> tag with word]
  Both Highlighted?: [ ] YES  [ ] NO

Test 3 ("business"):
  Only "business" highlighted?: [ ] YES  [ ] NO
  Visual highlight visible?: [ ] YES  [ ] NO

Test 4 (Stemmed matches):
  Stemmed words highlighted?: [ ] YES  [ ] NO
```

---

# CATEGORY 3: QUALITY & FEEDBACK (5 TESTS)

## Test 11: QA Agent - 4-Gate Validation System

### Feature
QA Agent validates all 52 scenarios through 4 validation gates: Structural Discipline, Pragmatic Sensitivity, Chunk Awareness, Register Control

### Affected Files
- `scripts/qaAgent.ts` (main orchestrator, ~363 lines)
- `scripts/structuralDisciplineValidator.ts` (~241 lines)
- `scripts/pragmaticSensitivityValidator.ts`
- `scripts/chunkAwarenessValidator.ts`
- `scripts/registerControlValidator.ts`
- 5 other validator files in `src/services/linguisticAudit/validators/`

### Documentation Files
- `QA_AGENT_VERIFICATION_REPORT.md` (test results)
- `QA_AGENT_QUICK_START.md` (usage guide)

### Test Steps
1. **Quick Test (3 scenarios)**
   ```bash
   npm run qa-test
   ```
   - Wait for test to complete (typically 10-15 seconds)
   - Verify output shows testing 3 scenarios:
     - social-1-flatmate
     - service-1-cafe
     - workplace-1-disagreement

2. Check gate results in output:
   - [ ] **Pragmatic Sensitivity**: Should show 100% pass
   - [ ] **Chunk Awareness**: Should show 100% pass
   - [ ] **Register Control**: Should show varied results (50-100%)
   - [ ] **Structural Discipline**: May show 0% (expected for short scenarios)

3. **Comprehensive Test (52 scenarios)**
   ```bash
   npm run qa-test:comprehensive
   ```
   - Wait for test to complete (typically 2-3 minutes)
   - Verify output shows summary statistics:
     - Total scenarios tested: 52
     - Critical issues: [count]
     - Warnings: [count]
     - Suggestions: [count]

4. Verify no crashes or errors during tests
5. Check exit code:
   ```bash
   echo $?  # Should be 0 (success)
   ```

### Expected Results
✅ Quick test completes successfully
✅ All 4 gates report results
✅ Comprehensive test validates 52 scenarios
✅ No crashes or errors
✅ Exit code 0 (success)

### Pass/Fail Criteria
- **PASS**: Both quick and comprehensive tests complete, gates report, exit code 0
- **FAIL**: Test crashes OR no output OR exit code non-zero

### Test Result
- [ ] **PASS**
- [ ] **FAIL** - Error: _________________________________

### Evidence
```
Quick Test Output (last 30 lines):
[Paste output here]

Comprehensive Test Summary:
Total Scenarios Tested: ___
Critical Issues: ___
Warnings: ___
Suggestions: ___

Exit Code: ___ (should be 0)
Any Errors?: [ ] YES  [ ] NO
```

---

## Test 12: QA Agent - Single Scenario Validation

### Feature
CLI tool `qaCheck` validates individual scenarios with detailed reporting

### Affected Files
- `cli/qaCheck.ts` (~177 lines)
- Command: `npm run qa-check`

### Test Steps
1. **Test with help flag**
   ```bash
   npm run qa-check -- --help
   ```
   - Verify help text displays with available options
   - Confirm `--scenario=ID` option documented
   - Expected: Help message visible, no errors

2. **Validate single scenario**
   ```bash
   npm run qa-check -- --scenario=social-1-flatmate
   ```
   - Wait for validation to complete (10-20 seconds)
   - Verify detailed report displays with:
     - ✅ or ⚠️ icons for each gate status
     - Gate names: Pragmatic, Chunk, Register, Structural
     - Issue counts (critical, warnings, suggestions)
     - Line numbers where issues found
     - Suggested fixes

3. **Test another scenario**
   ```bash
   npm run qa-check -- --scenario=workplace-1-disagreement
   ```
   - Verify report shows different issues than first scenario
   - Confirm line numbers point to specific problems

4. **Test with invalid scenario ID**
   ```bash
   npm run qa-check -- --scenario=invalid-id
   ```
   - Verify friendly error message (not crash)
   - Expected: "Scenario not found" message

5. Verify exit codes:
   - Valid scenario: exit code 0 (success)
   - Invalid scenario: exit code 1 (error)

### Expected Results
✅ Help displays with all options
✅ Single scenario validation detailed and accurate
✅ Multiple scenarios have different results
✅ Invalid scenario handled gracefully
✅ Exit codes correct

### Pass/Fail Criteria
- **PASS**: Help works, validation accurate, error handling graceful, exit codes correct
- **FAIL**: Help missing OR validation crashes OR errors not handled

### Test Result
- [ ] **PASS**
- [ ] **FAIL** - Error: _________________________________

### Evidence
```
Help Output:
[Paste last 20 lines]

Single Scenario Report (social-1-flatmate):
[Paste key lines showing gates and issues]

Invalid Scenario Response:
[Paste error message]
```

---

## Test 13: QA Agent - Validation Error Detection

### Feature
QA Agent detects 80+ patterns including essay language, IELTS phrases, American spelling, etc.

### Affected Files
- 9 validators in `src/services/linguisticAudit/validators/`
- Patterns defined in each validator (~200+ patterns total)

### Test Steps
1. **Identify 3 test patterns in existing scenarios**
   - Run comprehensive test first:
     ```bash
     npm run qa-test:comprehensive
     ```
   - Look at output for 3 different detected issues across scenarios
   - Note specific scenarios with different issue types

2. **Verify "Essay Language" pattern detection**
   - Search scenarios for: "Moreover", "Furthermore", "In conclusion"
   - Run QA check on scenario containing these:
     ```bash
     npm run qa-check -- --scenario=[scenario-with-essay-language]
     ```
   - Verify output shows essay language issue detected
   - Check confidence score (should be ≥0.8)

3. **Verify "American Spelling" pattern detection**
   - Search scenarios for: "color", "realize", "organize"
   - Run QA check on scenario containing these
   - Verify issue detected with suggestion (e.g., "colour" instead of "color")

4. **Verify "IELTS Phrase" pattern detection**
   - Search scenarios for: "In my opinion", "I think that", "nowadays"
   - Run QA check on scenario containing these
   - Verify detection with confidence score

5. **Check suggested fixes**
   - Verify each detected issue includes suggested correction
   - Confirm suggestion is pedagogically appropriate (teaches correct UK English)

### Expected Results
✅ All detected patterns have confidence scores ≥0.8
✅ Specific line numbers provided
✅ Suggested fixes are appropriate
✅ Multiple pattern types detected across scenarios

### Pass/Fail Criteria
- **PASS**: 3+ different pattern types detected with confidence scores and fixes
- **FAIL**: Patterns not detected OR no confidence scores OR no fixes

### Test Result
- [ ] **PASS**
- [ ] **FAIL** - Error: _________________________________

### Evidence
```
Pattern 1 - Essay Language:
  Scenario: _____
  Text Found: "_______________"
  Detected?: [ ] YES  [ ] NO
  Confidence Score: ___
  Suggested Fix: _____________________

Pattern 2 - American Spelling:
  Scenario: _____
  Text Found: "_______________"
  Detected?: [ ] YES  [ ] NO
  Confidence Score: ___
  Suggested Fix: _____________________

Pattern 3 - IELTS Phrase:
  Scenario: _____
  Text Found: "_______________"
  Detected?: [ ] YES  [ ] NO
  Confidence Score: ___
  Suggested Fix: _____________________
```

---

## Test 14: Chunk Feedback - Data Structure & Display

### Feature
ChunkFeedback displays in FeedbackCard component with A/B/C/D sections (6 categories: Openers, Softening, Disagreement, Repair, Exit, Idioms)

### Affected Files
- `src/services/staticData.ts` (ChunkFeedback data, ~2700 lines)
- `src/components/FeedbackCard.tsx` (~150 lines)
- `src/components/RoleplayViewer.tsx` (lines 527-544: feedback rendering)

### Test Steps
1. Open production site: https://fluentstep-ielts-roleplay-engine.vercel.app
2. Navigate to scenario with feedback: `/scenario/social-1-flatmate`
3. **Test Blank Reveal**:
   - Fill in blank 1 (first blank in scenario)
   - Expected response appears
   - Click "View Full Roleplay" or completion button
4. **Test Feedback Modal**:
   - Click "Post-Roleplay Insights" button (or similar)
   - Verify modal/section displays feedback for revealed blank
5. **Verify Feedback Structure (A/B/C/D)**:
   - Look for chunk word: "meet"
   - **Section A - Core Function**:
     - Verify text present and ≤20 words
     - Should explain WHY it's used (social function)
     - Example: "Foundation greeting for new acquaintances"
   - **Section B - Real-Life Situations** (should have 3):
     - [ ] Situation 1 ≤15 words, distinct context
     - [ ] Situation 2 ≤15 words, distinct context
     - [ ] Situation 3 ≤15 words, distinct context
   - **Section C - Native Usage Notes** (should have 3-5):
     - [ ] Note 1 about typical usage
     - [ ] Note 2 about formality
     - [ ] Note 3+ about nuances
   - **Section D - Non-Native vs Native** (should have 2 pairs):
     - [ ] Pair 1: Non-native version, Native version, Explanation (≤20 words)
     - [ ] Pair 2: Different mistake pattern

6. **Verify Category Display**:
   - Look for category icon and label (👋 Openers)
   - Verify color coding matches category
   - Expected: "Openers" category for "meet"

7. **Verify Expand/Collapse Animation**:
   - Click on feedback card to expand/collapse
   - Verify smooth animation (not instant snap)
   - All content visible when expanded

### Expected Results
✅ Feedback card displays all 4 sections (A/B/C/D)
✅ Word counts within limits (A≤20, B≤15 each, D≤20 each)
✅ Category icon and color visible
✅ 3-5 situations with diverse contexts
✅ Expand/collapse animation smooth

### Pass/Fail Criteria
- **PASS**: All sections present, word limits met, content quality high, animation smooth
- **FAIL**: Missing sections OR word limits exceeded OR no animation

### Test Result
- [ ] **PASS**
- [ ] **FAIL** - Error: _________________________________

### Evidence
```
Chunk Word: ___________
Category: ___________

Section A - Core Function:
  Word Count: ___ / 20
  Text: "__________________________________________"
  Explains Social Function?: [ ] YES  [ ] NO

Section B - Situations:
  Situation 1 (Word Count: ___ / 15): "___________________________"
  Situation 2 (Word Count: ___ / 15): "___________________________"
  Situation 3 (Word Count: ___ / 15): "___________________________"
  Distinct Contexts?: [ ] YES  [ ] NO

Section C - Usage Notes:
  Note 1: "__________________________"
  Note 2: "__________________________"
  Note 3: "__________________________"
  Count: ___ / 5

Section D - Non-Native vs Native:
  Pair 1:
    Non-native: "___________________"
    Native: "___________________"
    Explanation (Word Count: ___ / 20): "___________________"
  Pair 2:
    Non-native: "___________________"
    Native: "___________________"
    Explanation (Word Count: ___ / 20): "___________________"

Animation Smooth?: [ ] YES  [ ] NO
```

---

## Test 15: Chunk Feedback - Personalization Logic

### Feature
Chunk feedback filters by `revealedBlanks` Set - only showing feedback for revealed blank positions

### Affected Files
- `src/services/staticData.ts` (chunkFeedback array with blankIndex)
- `src/components/RoleplayViewer.tsx` (lines 527-544: filter logic)
- `src/hooks/useRoleplayState.ts` (revealedBlanks Set management)

### Test Steps
1. Open scenario: `/scenario/social-1-flatmate`
   - This scenario has 3 feedback items at blank indices: 1, 3, 8
   - Total blanks in scenario: 10 (approximately)

2. **Test Empty State** (no blanks revealed):
   - Before revealing any blanks
   - Open "Post-Roleplay Insights" modal/section
   - Verify friendly message displays:
     - Example: "Reveal more blanks to unlock chunk feedback"
     - Or: "Complete more interactions to unlock insights"
   - Verify NO feedback cards shown
   - Expected: Empty state, user encouraged to reveal blanks

3. **Test Single Blank** (reveal blank 1):
   - Fill in blank 1 (first interaction)
   - Verify response provided
   - Open feedback section
   - Verify ONLY 1 feedback card appears (for blank 1: "meet")
   - Verify no cards for blanks 3 or 8 yet
   - Expected: Only 1 card visible

4. **Test Two Blanks** (reveal blank 3 additionally):
   - Continue to blank 3
   - Fill in blank 3
   - Open feedback section
   - Verify NOW 2 feedback cards appear:
     - Card 1: "meet" (from blank 1)
     - Card 2: "keep track" or another chunk (from blank 3)
   - Expected: 2 cards, in reveal order

5. **Test All Revealed** (reveal blank 8):
   - Continue to blank 8
   - Fill in blank 8
   - Open feedback section
   - Verify ALL 3 feedback cards appear
   - Expected: 3 cards total

6. **Test Page Reload**:
   - After revealing blanks 1 and 3
   - Reload the page (Cmd+R / Ctrl+R)
   - Check if revealed state persists:
     - [ ] Blanks still marked as revealed → feedback cards visible
     - [ ] Blanks reset to unrevealed → empty state again
   - (Both behaviors acceptable depending on design)

### Expected Results
✅ Empty state shows friendly message
✅ Feedback cards appear only for revealed blanks
✅ Card count matches revealed blank count
✅ Cards appear in correct order
✅ Page reload behavior consistent

### Pass/Fail Criteria
- **PASS**: Empty state correct, personalization filters properly, counts match
- **FAIL**: Cards show for unrevealed blanks OR empty state missing

### Test Result
- [ ] **PASS**
- [ ] **FAIL** - Error: _________________________________

### Evidence
```
Empty State (no blanks revealed):
  Message Shown: "___________________________"
  Feedback Cards Count: ___ (should be 0)

After Revealing Blank 1:
  Feedback Cards Count: ___ (should be 1)
  Card 1 Chunk: ___________
  Card 1 Category: ___________

After Revealing Blank 3:
  Feedback Cards Count: ___ (should be 2)
  Card 1 Chunk: ___________
  Card 2 Chunk: ___________

After Revealing Blank 8:
  Feedback Cards Count: ___ (should be 3)
  Card 1 Chunk: ___________
  Card 2 Chunk: ___________
  Card 3 Chunk: ___________

Page Reload Behavior:
  Revealed State Persisted?: [ ] YES  [ ] NO (either OK)
  Same Feedback Cards?: [ ] YES  [ ] NO
```

---

# SUMMARY & VERIFICATION

## Test Execution Checklist

### Category 1: Deployment & Infrastructure
- [ ] **Test 1**: SPA Routing - Direct URL Access
- [ ] **Test 2**: SPA Routing - Page Refresh Persistence
- [ ] **Test 3**: Video Files - Asset Serving
- [ ] **Test 4**: URL Routing - Invalid Scenario Handling
- [ ] **Test 5**: Build & Deployment Pipeline
- **Category 1 Result**: ___ / 5 tests passed

### Category 2: Search & Discovery
- [ ] **Test 6**: Word Stemming - Irregular Stems Dictionary
- [ ] **Test 7**: Word Stemming - Suffix Removal Rules
- [ ] **Test 8**: Word Stemming - Edge Cases
- [ ] **Test 9**: TopicSelector - URL Search Params Reactivity
- [ ] **Test 10**: Search Highlighting - Accurate Matching
- **Category 2 Result**: ___ / 5 tests passed

### Category 3: Quality & Feedback
- [ ] **Test 11**: QA Agent - 4-Gate Validation System
- [ ] **Test 12**: QA Agent - Single Scenario Validation
- [ ] **Test 13**: QA Agent - Validation Error Detection
- [ ] **Test 14**: Chunk Feedback - Data Structure & Display
- [ ] **Test 15**: Chunk Feedback - Personalization Logic
- **Category 3 Result**: ___ / 5 tests passed

---

## Overall Results

| Category | Tests Passed | Status |
|----------|--------------|--------|
| Deployment & Infrastructure | ___ / 5 | ⏳ |
| Search & Discovery | ___ / 5 | ⏳ |
| Quality & Feedback | ___ / 5 | ⏳ |
| **TOTAL** | **___ / 15** | **⏳** |

### Success Criteria
- **Minimum Pass Rate**: 13/15 (87%)
- **Target Pass Rate**: 15/15 (100%)
- **Blockers**: Any test failure in Categories 1 (routing affects all features)

---

## Failure Documentation

If any test fails, document here for debugging:

### Failed Test #__: [Test Name]
- **Feature**: ___________________
- **Expected**: ___________________
- **Actual**: ___________________
- **Error Message**: ___________________
- **Steps to Reproduce**:
  1. ___________________
  2. ___________________
  3. ___________________
- **Affected File(s)**: ___________________
- **Severity**: [ ] Critical  [ ] High  [ ] Medium  [ ] Low
- **Action**: [ ] Needs Investigation  [ ] Bug Confirmed  [ ] Investigation Complete

---

### Failed Test #__: [Test Name]
- **Feature**: ___________________
- **Expected**: ___________________
- **Actual**: ___________________
- **Error Message**: ___________________
- **Steps to Reproduce**:
  1. ___________________
  2. ___________________
  3. ___________________
- **Affected File(s)**: ___________________
- **Severity**: [ ] Critical  [ ] High  [ ] Medium  [ ] Low
- **Action**: [ ] Needs Investigation  [ ] Bug Confirmed  [ ] Investigation Complete

---

## Notes & Observations

Use this section to document any interesting findings, edge cases discovered, or areas for improvement:

```
[Document observations here]
```

---

## Quick Reference Links

### Source Files
- [vercel.json](../vercel.json) - SPA routing config
- [src/App.tsx](../src/App.tsx) - React Router setup
- [src/components/TopicSelector.tsx](../src/components/TopicSelector.tsx) - Search UI
- [src/services/searchService.ts](../src/services/searchService.ts) - Stemming logic
- [scripts/qaAgent.ts](../scripts/qaAgent.ts) - QA Agent main
- [src/components/FeedbackCard.tsx](../src/components/FeedbackCard.tsx) - Feedback display

### Commands
```bash
# Local preview
npm run preview

# QA Testing
npm run qa-test                          # Quick (3 scenarios)
npm run qa-test:comprehensive           # Full (52 scenarios)
npm run qa-check -- --scenario=ID       # Single scenario
npm run qa-check -- --help              # CLI help
```

### Test Documentation
- [QA_AGENT_QUICK_START.md](../QA_AGENT_QUICK_START.md)
- [QA_AGENT_VERIFICATION_REPORT.md](../QA_AGENT_VERIFICATION_REPORT.md)
- [SEARCH_STEMMING_FIX.md](../SEARCH_STEMMING_FIX.md)

### Production URLs
- **Homepage**: https://fluentstep-ielts-roleplay-engine.vercel.app
- **Example Scenario**: https://fluentstep-ielts-roleplay-engine.vercel.app/scenario/social-1-flatmate
- **Vercel Dashboard**: https://vercel.com/projects

---

## Document Version

| Version | Date | Updated By | Changes |
|---------|------|------------|---------|
| 1.0 | Feb 11, 2026 | Initial | Created comprehensive test suite with 15 tests |
| | | | |

---

**Last Updated**: February 11, 2026
**Next Review**: After test execution completion
