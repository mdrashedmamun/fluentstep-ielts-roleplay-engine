# E2E Testing - Quick Start Guide

**Status**: ✅ Complete and ready to use

---

## 1️⃣ Start Development Server

```bash
npm run dev
```

Wait for the server to start (you'll see "ready in Xs").

---

## 2️⃣ Run the E2E Tests

In another terminal:

```bash
# Validate test setup (quick, 10 seconds)
npm run test:e2e:meta

# Run one scenario (15 seconds)
npm run test:e2e:single social-1-flatmate

# Run full Tier 1 (6 scenarios, ~30 seconds)
npm run test:e2e:tier1

# Run ALL 52 scenarios (11 agents parallel, ~60 seconds)
npm run test:e2e
```

---

## 3️⃣ View Results

```bash
# Open HTML report in browser
npm run test:e2e:report
```

The report shows:
- ✅ Pass/Fail summary
- 📊 Per-scenario results
- 📸 Screenshots of failures

---

## 🔍 What Gets Tested

### Tier 1 (6 scenarios with chunkFeedback) - 480 checks
- Page loads without errors
- Blanks reveal with alternatives
- Chunk feedback modal works correctly
- **🔴 REGRESSION: Modal doesn't show empty state after revealing blanks**

### Tier 2 (46 scenarios) - 690 checks
- Page loads
- Blanks reveal and close
- Continue button works
- Completion modal appears
- Progress is saved

---

## 🚨 If Tests Fail

### Check dev server is running
```bash
# Should show "ready in Xs" and listening on port 3001
npm run dev
```

### Run with more verbose output
```bash
python -m pytest tests/e2e/scenarios/tier1_with_feedback.py -vvs
```

### Check for console errors
Look for `page.console_errors` in test output

---

## 📝 Key Scripts

```bash
npm run test:e2e              # Run all 52 scenarios (parallel)
npm run test:e2e:tier1        # Run 6 scenarios with full validation
npm run test:e2e:single       # Run single scenario
npm run test:e2e:meta         # Validate test suite structure
npm run test:e2e:report       # Open HTML report
```

---

## 📂 Reports

After tests run:

```
tests/reports/
├── final_report.html          # Aggregated HTML report
├── json/
│   ├── agent_1.json           # Tier 1 results (6 scenarios)
│   ├── agent_2.json           # Tier 2 batch 1 (5 scenarios)
│   ... (agent_3 through agent_11)
└── screenshots/
    └── *.png                  # Failure screenshots
```

---

## 🎯 Expected Output

```
Scenario: social-1-flatmate
  ✅ Page loads
  ✅ Blanks reveal
  ✅ Modal shows feedback (not empty state)
  ✅ Completion appears
  Status: PASSED (80/80 checks)

Scenario: service-1-cafe
  ✅ Page loads
  ✅ 21 blanks found
  ✅ Feedback modal works
  ✅ Progress saved
  Status: PASSED (80/80 checks)

...

Summary:
  52/52 scenarios passed
  1,170/1,170 checks passed
  Duration: 60 seconds
```

---

## ⚡ Performance

| Test | Duration | Speed |
|------|----------|-------|
| Meta tests | 10 sec | Fast |
| Single scenario | 15 sec | Fast |
| Tier 1 (6 scenarios) | 30 sec | Fast |
| All 52 scenarios | 60 sec | ⚡ Parallel |

---

## 🔧 Customization

Edit `tests/e2e/config.py` to adjust:

```python
BASE_URL = "http://localhost:3001"  # Change if server on different port
TIMEOUT_LOAD = 5000  # Increase if slow network
HEADLESS = False  # Show browser while testing
SLOW_MO = 500  # Slow down 500ms per action (for debugging)
```

---

## 📚 Full Documentation

See `tests/README.md` for comprehensive guide including:
- Architecture overview
- Selector strategies
- Regression test details
- CI/CD integration
- Debugging tips

---

## ✅ Checklist Before Running

- [ ] Dev server running (`npm run dev`)
- [ ] In different terminal
- [ ] Run `npm run test:e2e:meta` first
- [ ] Check that no errors appear
- [ ] Run `npm run test:e2e:tier1` for quick feedback
- [ ] View report with `npm run test:e2e:report`

---

## 🚀 That's it!

You now have 1,170+ automated checks running across all 52 scenarios, with special focus on preventing regression of the recently fixed chunk feedback modal bug.

Good luck! 🎉
