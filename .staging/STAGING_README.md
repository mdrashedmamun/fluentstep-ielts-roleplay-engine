# Content Staging Workflow

Welcome to the FluentStep content staging system! This is where new scenarios go through quality verification before being deployed to the app.

## Quick Start

### For Content Creators

1. **Create a new scenario template:**
   ```bash
   npm run stage:create -- --id=my-scenario-1
   ```
   Creates: `.staging/in-progress/my-scenario-1.md`

2. **Edit your content** in any text editor:
   ```bash
   nano .staging/in-progress/my-scenario-1.md
   ```

3. **Submit for validation:**
   ```bash
   npm run stage:submit -- --id=my-scenario-1
   ```
   Moves to: `.staging/ready-for-review/`

4. **Check validation status:**
   ```bash
   npm run stage:status
   ```

5. **If validation passes**, scenario appears in `approved/` ✅
   **If validation fails**, scenario moves to `rejected/` with error report

6. **Fix errors** in `rejected/` and re-submit:
   ```bash
   npm run stage:submit -- --id=my-scenario-1
   ```

### For Developers/QA

1. **Import all approved scenarios:**
   ```bash
   npm run stage:import
   ```

2. **Preview without committing:**
   ```bash
   npm run stage:import:dry-run
   ```

3. **Force unlock** (emergency only):
   ```bash
   npm run stage:unlock
   ```

## Staging States

```
in-progress/          → ready-for-review/    → approved/       → archived/
  ✏️ Being edited       🔍 Awaiting validation   ✅ All gates pass   📦 Imported
                       ❌ Failed?              (manual QA review)
                       ↓ Rejected
                       rejected/
```

### State Descriptions

- **in-progress**: You're editing the content. No validation yet.
- **ready-for-review**: Awaiting automated validation pipeline (4 gates).
- **approved**: Passed all validation gates, ready to import to app.
- **rejected**: Failed one or more validation gates. Review error report and fix.
- **archived**: Successfully imported to app. Keep for audit trail.

## 4-Gate Validation Pipeline

When you submit a scenario for review, it automatically runs through:

### Gate 1: Structural Validation ✅
- Checks file format (YAML frontmatter, required sections)
- Verifies Markdown structure
- Validates JSON schemas

### Gate 2: Linguistic Validation 🌍
- UK spelling validation
- Chunk compliance (≥75% Bucket A chunks)
- Grammar checking
- Answer alternatives quality
- Feedback quality verification
- Pattern summary validation
- Active recall question validation

### Gate 3: Integration Validation 🔧
- Full TypeScript build (npm run build)
- E2E tests (npm run test:e2e:tier1)
- UI rendering verification
- No JavaScript errors

### Gate 4: QA Review 👨‍💼
- Manual human review
- Content quality check
- Pedagogical appropriateness
- UI/UX verification

**All gates must pass** for a scenario to be approved.

## Understanding Validation Reports

If validation fails, check the error report:

```bash
cat .staging/rejected/my-scenario-1-validation-report.json
```

Example report:
```json
{
  "scenarioId": "my-scenario-1",
  "timestamp": "2026-02-14T10:30:00Z",
  "gates": {
    "gate1_structural": {"status": "PASS", "confidence": 100},
    "gate2_linguistic": {
      "status": "FAIL",
      "confidence": 65,
      "errors": [
        "Blank b2: Wrong word class (noun vs verb)",
        "Answer b5: Ungrammatical when substituted"
      ]
    },
    "gate3_integration": {"status": "PENDING"},
    "gate4_qa": {"status": "PENDING"}
  },
  "overallStatus": "FAILED",
  "nextSteps": "Fix errors in rejected/ and re-submit"
}
```

## Scenario Template

When you create a new scenario, you get this template:

```markdown
---
category: ""              # E.g., "Business", "Social", "Academic"
scenarioId: "my-scenario-1"
topic: ""                 # E.g., "Meeting Preparation"
context: ""               # Brief description of scenario
difficulty: "B2"          # B1, B2, C1, C2
---

# Dialogue

[Speaker 1]: Hello, how can I help you today?
[Speaker 2]: I need some advice about starting a business.

# Answers

Blank 0: Sure
Blank 1: No problem

# V2 Schema

## chunkFeedbackV2

```json
{
  "my-scenario-1-b0": {
    "blanksInOrder": ["Sure", "Actually, I can't"],
    "chunkFeedback": {
      "Sure": {
        "status": "correct",
        "feedback": "✅ 'Sure' works perfectly for agreeing to help."
      },
      "Actually, I can't": {
        "status": "incorrect",
        "feedback": "❌ This refuses help, not agrees to it."
      }
    },
    "patternSummary": {
      "chunk": "Sure (agreement to help)",
      "context": "Responding to a request for advice",
      "commonMistakes": ["Actually, I can't", "Let me think"],
      "keyTakeaway": "Use 'Sure' to quickly agree to help someone"
    },
    "activeRecall": {
      "question": "When would you use 'Sure' in conversation?",
      "expectedAnswer": "To agree to help or a request",
      "hints": ["Think about accepting an offer"]
    }
  }
}
```

## Workflow Tips

### ✅ Do:
- Create clear, natural dialogues in UK English
- Use chunks from LOCKED_UNIVERSAL_CHUNKS (see `.claude/rules/CORE_RULES.md`)
- Add pattern summaries explaining WHY chunks work
- Include active recall questions for spaced repetition
- Test your scenario locally before submitting

### ❌ Don't:
- Include markdown formatting in dialogue (no **bold**, _italic_)
- Create new vocabulary when locked chunks can work
- Forget to provide feedback for all answers
- Submit incomplete scenarios (missing sections)
- Edit content directly in staticData.ts (use staging instead)

## File Structure

```
.staging/
├── in-progress/          # Your drafts
│   └── my-scenario-1.md
├── ready-for-review/     # Awaiting validation
│   └── another-scenario.md
├── approved/             # Passed all gates
│   ├── scenario-1.md
│   └── scenario-1-validation-report.json
├── rejected/             # Failed validation
│   ├── bad-scenario.md
│   └── bad-scenario-validation-report.json
├── archived/             # Successfully imported
│   ├── bbc-learning-6-dreams.md
│   └── bbc-learning-6-dreams-validation-report.json
└── STAGING_README.md     # This file
```

## Safety Features

### File Locking
When importing approved scenarios, the system locks the main `staticData.ts` file to prevent concurrent edits. If a process crashes, the lock auto-expires after 5 minutes.

### Automatic Backups
Before merging scenarios, the system creates timestamped backups:
```
src/services/staticData.ts.backup-2026-02-14T10-30-00-123Z
```

### Automatic Rollback
If any gate fails during import, the system automatically restores from backup. Zero data corruption.

### Validation Reports
Every validation attempt creates a detailed report. Review it to understand what failed.

## Troubleshooting

### "Scenario already in ready-for-review"
The scenario has already been submitted. Run `npm run stage:validate` to validate it.

### "Cannot submit from state: X"
Your scenario is in an invalid state. Check the status:
```bash
npm run stage:status
```

### "Lock acquisition failed"
Another import is running. Wait 5 minutes or force-unlock (emergency only):
```bash
npm run stage:unlock
```

### "Build failed after import"
The merged scenario introduced TypeScript errors. Check the error output and fix in rejected/.

### "E2E tests failed"
The scenario doesn't render correctly in the UI. Check browser console for errors.

## For Developers

### Understanding the Architecture

**Staging Layers**:
1. **CLI Layer** (`stagingCLIHelper.ts`) - User commands
2. **Validation Layer** (`stagingValidateContent.ts`) - 4-gate pipeline
3. **Import Layer** (`stagingImportApproved.ts`) - Merge with safety
4. **State Management** (`utils/stageStateManager.ts`) - Moves files
5. **Safety Layer** (`utils/fileLocking.ts`, `backupUtils.ts`) - Prevents corruption

**Validation Pipeline**:
- Structural → Linguistic → Integration → QA
- Each gate must pass (≥85% confidence)
- Detailed reports generated for failed gates
- Validators run automatically

### Adding New Validators

To add a new validation check:

1. Create validator in `scripts/validation/`
2. Import in `stagingValidateContent.ts`
3. Add to appropriate gate (1-4)
4. Update threshold (confidence required)

Example:
```typescript
async function runMyValidator(): Promise<GateResult> {
  const result = {
    status: 'PASS' as const,
    confidence: 95,
    errors: [],
    warnings: []
  };

  // Your validation logic
  return result;
}
```

### Testing the Workflow

```bash
# Test create
npm run stage:create -- --id=test-scenario

# Test submit
npm run stage:submit -- --id=test-scenario

# Test status
npm run stage:status

# Test validate (with dry content, will likely fail)
npm run stage:validate

# Test import (dry-run)
npm run stage:import:dry-run
```

## Integration with CI/CD

The staging workflow integrates with the 4-gate quality pipeline:

```
git push
  ↓
GitHub Actions
  ↓
Gate 1: Build (npm run build)
Gate 2: Validate (npm run validate)
Gate 3: Test (npm run test:e2e:tier1)
Gate 4: QA (manual review)
  ↓
Deploy to Vercel
```

## Next Steps

1. **Create your first scenario** - `npm run stage:create -- --id=my-first`
2. **Edit and submit** - `npm run stage:submit -- --id=my-first`
3. **Check status** - `npm run stage:status`
4. **Fix any errors** - Edit in rejected/ and re-submit
5. **Import when approved** - `npm run stage:import`

---

**Questions?** See `.claude/CLAUDE.md` and `.claude/rules/QUALITY_GATES.md` for more details.

**Last Updated**: Feb 14, 2026
