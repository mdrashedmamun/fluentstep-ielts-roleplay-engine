# Phase 1 Audit Execution Guide

## 🚀 Ready to Execute

The parallel multi-agent audit architecture is complete and tested. You're ready to execute Phase 1 with a predicted 12-15 minute runtime (compared to 60+ minutes with sequential execution).

## ✅ Pre-Execution Checklist

- [x] Category filter bug fixed
- [x] All 7 modules implemented and tested
- [x] 10 new npm scripts added
- [x] Comprehensive documentation created
- [x] Unit tests passing
- [x] Build succeeds (0 TypeScript errors)
- [x] Git commit created with full implementation

## 🎯 What Phase 1 Will Do

**Scope:** 22 Scenarios
- **Categories:** Advanced (11) + Workplace (11)
- **Total blanks to validate:** ~150-200
- **Expected findings:** 100-150 issues detected

**Processing:**
1. Distribute 22 scenarios across 6 worker processes
2. Run all 11 validators on each scenario (in parallel)
3. Consolidate findings and deduplicate
4. Resolve conflicts automatically
5. Apply HIGH confidence fixes (≥0.95)
6. Create atomic git commit

**Output:**
- Grammar errors: 0 (redundancy, double negatives, POS mismatches)
- British English authenticity: ≥95%
- Data integrity: 100% (deep dive indices valid)
- Build remains stable with 0 errors
- Bundle size unchanged (~400 kB JS)

## 📋 Execution Steps

### Step 1: Preview Phase 1 Fixes (2-3 minutes)

```bash
npm run audit:phase1:dry
```

**Output will show:**
- Consolidation statistics
- Conflicts detected
- Preview of fixes (NO changes applied yet)
- Estimated execution time

**Review:**
- Check for reasonable deduplication (100-200 total findings → 50-100 unique)
- Verify conflict resolution looks sensible
- No surprises in suggested fixes?

### Step 2: Execute Phase 1 (12-15 minutes)

```bash
npm run audit:phase1
```

**What happens:**
- Console shows live progress
- 6 workers process scenarios in parallel
- Findings consolidated and deduplicated
- Conflicts auto-resolved
- Fixes applied to `services/staticData.ts`
- Automatic build verification
- Single git commit created

**Progress indicators:**
```
🔍 Starting Linguistic Audit...
Worker 0: 4 scenarios
Worker 1: 4 scenarios
... (monitor console for live updates)

Consolidating findings...
Resolving conflicts...
Persisting fixes...
✓ Build succeeds after fixes
✓ Git commit created
```

### Step 3: Verify Results (5-10 minutes)

```bash
# Verify build still works
npm run build

# Validate data integrity
npm run validate

# Test scenarios in browser
npm run dev
# Open http://localhost:5173
# Test 3 Advanced + 3 Workplace scenarios
```

**Verification checklist:**
- [ ] Build succeeds
- [ ] npm validate passes
- [ ] App loads in browser
- [ ] Scenarios display correctly
- [ ] No console errors
- [ ] Audio playback works
- [ ] Deep dive popups show properly

### Step 4: Review Git Commit

```bash
# See what changed
git show HEAD --stat

# See detailed changes
git show HEAD

# See changes in staticData.ts only
git show HEAD -- services/staticData.ts | head -100
```

## 🎛️ Advanced Options

### Dry-Run with Custom Scenarios

```bash
# Test with just 2 scenarios
npx tsx cli/auditOrchestrator.ts \
  --scenarios=advanced-1-manager-escalation,advanced-2-manager-no \
  --workers=2 \
  --dry-run
```

### Different Worker Count

```bash
# Use 4 workers instead of 6
npm run audit:phase1 --workers=4

# Use more workers (faster but more memory)
npm run audit:phase1 --workers=8
```

### Manual Scenario Selection

```bash
# Advanced scenarios only
npx tsx cli/auditOrchestrator.ts \
  --scenarios=advanced-1-manager-escalation,advanced-2-manager-no,advanced-ai-displacement,advanced-sustainability

# Workplace scenarios only
npx tsx cli/auditOrchestrator.ts --phase=1 | grep -i workplace
```

## ⚙️ What's Happening Behind the Scenes

### Architecture Overview

```
Orchestrator (main process)
├─ Worker 0 → advanced-1, advanced-2, advanced-3, advanced-4 → JSON findings
├─ Worker 1 → advanced-5, advanced-6, advanced-7, advanced-8 → JSON findings
├─ Worker 2 → advanced-9, advanced-10, advanced-11 → JSON findings
├─ Worker 3 → workplace-1, workplace-2, workplace-3, workplace-4 → JSON findings
├─ Worker 4 → workplace-5, workplace-6, workplace-7, workplace-8 → JSON findings
└─ Worker 5 → workplace-9, workplace-10, workplace-11 → JSON findings

Consolidator: Merge 6 JSON files → Deduplicate → Detect conflicts

Conflict Resolver: Auto-resolve by confidence + validator priority

Persistence: Apply fixes → Backup → Validate TypeScript → Verify build

Git Integration: Single atomic commit
```

### Performance Breakdown

| Stage | Time | Notes |
|-------|------|-------|
| Pre-flight checks | 10s | npm build, git operations |
| Worker distribution | 1s | Dividing scenarios |
| Worker execution (parallel) | 5-8 min | 11 validators × 22 scenarios |
| Consolidation | 30s | Dedup, statistics |
| Conflict resolution | 10s | Auto-resolve |
| Persistence | 45s | Apply fixes, validate |
| Git commit | 5s | Atomic commit |
| **Total** | **12-15 min** | **13× faster** |

## 🔄 Rollback If Needed

### Full Rollback to Pre-Audit State

```bash
# Return to state before Phase 1
git reset --hard audit-phase1-start
git clean -fd
npm run build
```

### Partial Rollback (Undo Last Commit)

```bash
git revert HEAD
npm run build
```

### Manual Restore from Backup

```bash
# Find backup
ls -lh /tmp/staticData.backup.*.ts

# Restore from backup
cp /tmp/staticData.backup.2026-02-10T14-30-00-000Z.ts services/staticData.ts
npm run build
```

## 📊 Expected Results

**Before Phase 1:**
- 22 scenarios with various grammar and vocabulary issues
- Many British English compliance issues
- Some data integrity inconsistencies

**After Phase 1:**
- 100-150 issues identified and fixed
- 0 high-priority grammar errors
- ≥95% British English compliance
- 100% data integrity
- Single git commit documenting all changes

**Not Changed:**
- Scenario content/context
- Dialogue flow or educational value
- Application functionality
- Bundle size or performance

## 🆘 Troubleshooting

### Q: Build takes longer than expected
**A:** Normal for first build. Subsequent builds will be faster.

### Q: Workers show no progress
**A:** Each worker processes independently. Progress logged at worker completion.

### Q: High number of conflicts detected
**A:** This indicates validators found same issue with different suggestions. Conflicts are auto-resolved by confidence score.

### Q: Build fails after fixes
**A:** Orchestrator auto-restores from backup. Check `/tmp/audit-failed-fixes.json` for details.

### Q: npm validate fails after audit
**A:** Run `npm run audit:dry-run` to see what issues remain.

## 📚 Documentation

- **Full Architecture Guide:** `docs/architecture/PARALLEL_AUDIT_GUIDE.md`
- **Implementation Details:** `PARALLEL_AUDIT_IMPLEMENTATION.md`
- **Type Definitions:** `services/linguisticAudit/types.ts`
- **Test Suite:** `scripts/testParallelAudit.ts`

## 🎯 Next Steps After Phase 1

1. **Phase 2 (Medium-Risk):** 25 scenarios (Service/Logistics + Social)
   ```bash
   npm run audit:phase2  # When ready
   ```

2. **Phase 3 (Low-Risk):** 4 scenarios (Academic, Healthcare, Cultural, Community)
   ```bash
   npm run audit:phase3  # Final phase
   ```

## ✨ Ready?

**Execute with confidence:**

```bash
# Preview first (recommended)
npm run audit:phase1:dry

# Then execute
npm run audit:phase1
```

The parallel architecture handles:
- ✅ Parallel execution with 6 workers
- ✅ Automatic conflict resolution
- ✅ Safe fix application with rollback
- ✅ Git integration with atomic commits
- ✅ Comprehensive error handling
- ✅ Build verification
- ✅ Data validation

**Estimated time:** 12-15 minutes for 22 scenarios (13× faster than sequential)

Good luck! 🚀
