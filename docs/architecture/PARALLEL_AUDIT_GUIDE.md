# Parallel Multi-Agent Audit Architecture

## Overview

The parallel audit architecture transforms the sequential audit system (60+ minutes for Phase 1) into a high-performance system that completes the same audit in 12-15 minutes using Node.js worker processes.

**Architecture Design:**
- **Orchestrator**: Coordinates worker processes, consolidates results, applies fixes
- **Workers**: Isolated Node.js processes that validate assigned scenarios independently
- **Consolidator**: Deduplicates findings across workers, detects conflicts
- **Conflict Resolver**: Auto-resolves fix conflicts by confidence score and validator priority
- **Persistence Layer**: Safely applies fixes to `services/staticData.ts` with rollback capability

## Quick Start

### Phase 1 Audit (22 scenarios: Advanced + Workplace)

```bash
# Dry-run (preview fixes without applying)
npm run audit:phase1:dry

# Full audit with fixes applied
npm run audit:phase1
```

### Custom Scenarios

```bash
# Run audit on specific scenarios
npx tsx cli/auditOrchestrator.ts \
  --scenarios=advanced-1-manager-escalation,advanced-2-manager-no \
  --workers=2

# Dry-run mode
npx tsx cli/auditOrchestrator.ts \
  --scenarios=advanced-1-manager-escalation,advanced-2-manager-no \
  --workers=2 \
  --dry-run
```

## Components

### 1. Orchestrator (`cli/auditOrchestrator.ts`)

Main coordinator that:
1. Pre-flight checks (git status, build verification)
2. Distributes scenarios across workers
3. Spawns worker processes in parallel
4. Waits for all workers to complete
5. Consolidates findings
6. Resolves conflicts
7. Applies fixes
8. Commits changes to git

**Key Features:**
- Automatic scenario distribution
- Parallel worker execution
- Progress tracking
- Git integration
- Atomic commits

**Usage:**
```bash
npm run audit:parallel --phase=1
npm run audit:parallel --scenarios=id1,id2 --workers=4
npm run audit:parallel --phase=1 --dry-run
```

### 2. Worker Process (`cli/auditWorker.ts`)

Standalone process that:
1. Receives assigned scenario IDs
2. Loads scenarios from `services/staticData.ts`
3. Runs all 11 validators on each scenario
4. Outputs findings as JSON
5. Handles errors gracefully

**Inputs:** Command-line arguments
```
--worker-id=0
--scenarios=advanced-1,advanced-2
--output-path=/tmp/audit-worker-0.json
```

**Output:** JSON file with findings
```json
{
  "workerId": 0,
  "scenariosProcessed": ["advanced-1", "advanced-2"],
  "findings": [...],
  "executionTime": 2500,
  "errors": [],
  "timestamp": "2026-02-10T14:30:00.000Z"
}
```

### 3. Consolidator (`services/linguisticAudit/consolidator.ts`)

Deduplicates findings across multiple workers:

**Key Function:**
```typescript
consolidateFindings(workerOutputs: WorkerOutput[]): ConsolidatedFinding[]
```

**Algorithm:**
1. Create composite key: `${scenarioId}|${location}|${validatorName}`
2. For each finding from each worker:
   - If key exists: Check if `suggestedValue` differs
     - If different: Mark as conflict
     - Add worker to sources
   - If key new: Add to findings map
3. Return deduplicated findings with conflict information

**Statistics Calculated:**
- Total findings from all workers
- Unique findings after dedup
- Duplicates removed
- Conflicts detected
- Agreement rate (% with multiple sources)

### 4. Conflict Resolver (`services/linguisticAudit/conflictResolver.ts`)

Auto-resolves fix conflicts:

**Resolution Logic:**
1. **Primary:** Highest confidence score wins
2. **Tie-breaker:** Validator priority hierarchy
3. **Last resort:** Earliest worker ID

**Validator Priority (for ties):**
1. Grammar Context (most authoritative)
2. UK English Spelling
3. UK English Vocabulary
4. Contextual Substitution
5. Blank-Answer Pairing
6. Chunk Compliance
7. Dialogue Flow
8. Alternatives Quality
9. Contextual Redundancy

**Example Resolution:**
```
Conflict at advanced-3/answerVariations[2].answer
  - Worker 0: "stroll" (85% confidence)
  - Worker 1: "wander" (90% confidence)
  Result: "wander" wins (higher confidence)
```

### 5. Persistence Layer (`services/linguisticAudit/persistence.ts`)

Safely applies fixes with multiple safety checks:

**Workflow:**
1. Create timestamped backup: `/tmp/staticData.backup.TIMESTAMP.ts`
2. Load original file
3. Apply HIGH confidence fixes (≥0.95) using string replacement
4. Validate TypeScript syntax
5. Verify build succeeds
6. Write to disk (if not dry-run)
7. Return results with backup path

**Safety Features:**
- ✅ Backup before any modifications
- ✅ TypeScript syntax validation
- ✅ Build verification
- ✅ Automatic rollback on failure
- ✅ Dry-run mode for testing

## Workflow Diagram

```
                         ┌─────────────────────┐
                         │  Orchestrator Start │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │     Pre-Flight Checks         │
                    │ • npm run build               │
                    │ • git status check            │
                    │ • git tag creation            │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │   Distribute Scenarios        │
                    │ (22 scenarios → 6 workers)    │
                    └───────────────┬───────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
    ┌───▼───┐  ┌───────┐  ┌───────┐  ┌────────┐  ┌────────┐  ┌──▼────┐
    │Worker0│  │Worker1│  │Worker2│  │Worker 3│  │Worker 4│  │Worker5│
    │ 4 SC  │  │ 4 SC  │  │ 3 SC  │  │ 4 SC   │  │ 4 SC   │  │ 3 SC  │
    └───┬───┘  └───┬───┘  └───┬───┘  └───┬────┘  └────┬───┘  └──┬────┘
        │          │          │          │           │          │
        │     Parallel Execution (5-8 min)          │          │
        │          │          │          │           │          │
        └───┬──────┴──────────┴──────────┴───────────┴──────────┘
            │
    ┌───────▼────────────────┐
    │  Consolidate Findings  │
    │ • Deduplicate          │
    │ • Detect conflicts     │
    │ • Calculate stats      │
    └───────┬────────────────┘
            │
    ┌───────▼──────────────────┐
    │  Resolve Conflicts       │
    │ • Highest confidence wins│
    │ • Validator priority     │
    │ • Log resolutions        │
    └───────┬──────────────────┘
            │
    ┌───────▼──────────────────┐
    │  Persist Fixes           │
    │ • Create backup          │
    │ • Apply HIGH confidence  │
    │ • Validate TypeScript    │
    │ • Verify build           │
    └───────┬──────────────────┘
            │
    ┌───────▼──────────────────┐
    │  Git Commit              │
    │ • Add staticData.ts      │
    │ • Create atomic commit   │
    └───────┬──────────────────┘
            │
    ┌───────▼──────────────────┐
    │  Summary Report          │
    │ • Stats printed          │
    │ • Exit code 0            │
    └──────────────────────────┘
```

## Performance Profile

**Phase 1 (22 Scenarios: Advanced + Workplace)**

| Component | Time | Notes |
|-----------|------|-------|
| Pre-flight checks | 10s | npm build, git operations |
| Worker distribution | 1s | Splitting scenarios |
| Worker execution (6 parallel) | 5-8 min | 11 validators × 22 scenarios |
| Consolidation | 30s | Dedup, conflict detection |
| Conflict resolution | 10s | Auto-resolve by confidence |
| Persistence | 45s | String replacement, validation |
| Git commit | 5s | git add + git commit |
| **Total** | **12-15 min** | 13× faster than sequential |

**Memory Usage:**
- Main process: ~50 MB
- Per worker: ~100 MB
- Total: ~650 MB for 6 workers (acceptable)

## Configuration

### Phase Definitions

**Phase 1: High-Risk (22 scenarios)**
- Categories: Advanced, Workplace
- Estimated time: 12-15 minutes
- Risk level: Requires close review

**Phase 2: Medium-Risk (25 scenarios)**
- Categories: Service/Logistics, Social
- Estimated time: 15-18 minutes
- Risk level: Moderate

**Phase 3: Low-Risk (4 scenarios)**
- Categories: Academic, Healthcare, Cultural, Community
- Estimated time: 3-5 minutes
- Risk level: Low complexity scenarios

### Worker Distribution Strategy

Default: Equal distribution across workers
```
22 scenarios ÷ 6 workers = ~3.7 scenarios/worker
Distribution: [4, 4, 3, 4, 4, 3]
```

Custom: Specify number of workers
```bash
--workers=4  # Distribute across 4 workers instead of 6
--workers=2  # Smaller subset for testing
```

## Error Handling

### Worker Failures

**Scenario:** A worker process crashes
```
Action: Use partial JSON output if available, skip if not
Recovery: Re-run orchestrator (will process only failed scenarios)
```

**Scenario:** Worker timeout (>15 min)
```
Action: Kill process, treat as failed
Recovery: Increase timeout or reduce scenarios per worker
```

### Build Failures

**Scenario:** staticData.ts syntax invalid after fixes
```
Action: Restore from backup
Recovery: Review failed fixes, apply manually
Log: /tmp/audit-failed-fixes.json
```

**Scenario:** npm run build fails
```
Action: Abort, restore backup
Recovery: Investigate build error, fix root cause
```

### Git Conflicts

**Scenario:** Git working directory dirty
```
Action: Abort with error message
Recovery: Commit or stash changes, retry
```

## Testing

### Unit Tests

```bash
# Test consolidator and conflict resolver
npx tsx scripts/testParallelAudit.ts
```

### Integration Test

```bash
# Test with 2 small scenarios
npx tsx cli/auditOrchestrator.ts \
  --scenarios=advanced-1-manager-escalation,advanced-2-manager-no \
  --workers=2 \
  --dry-run
```

### Full Phase 1 Test

```bash
# Full Phase 1 with all safety checks
npm run audit:phase1:dry

# Review changes, then apply
npm run audit:phase1
```

## Rollback Strategy

### Full Rollback

Return to git state before audit:
```bash
git reset --hard audit-phase1-start
git clean -fd
npm run build
```

### Partial Rollback

Revert last commit:
```bash
git revert HEAD
npm run build
```

### Manual Recovery

Restore from backup:
```bash
cp /tmp/staticData.backup.*.ts services/staticData.ts
npm run build
```

## Monitoring & Logging

### Progress Tracking

Console output shows:
- Worker distribution
- Parallel execution progress
- Consolidation statistics
- Conflict resolutions
- Persistence results
- Final summary

### Detailed Logs

**Worker outputs:**
```
/tmp/audit-worker-{0..5}.json
```

**Conflict log:**
```
Printed to stdout during execution
```

**Backup locations:**
```
/tmp/staticData.backup.TIMESTAMP.ts
```

## Advanced Usage

### Custom Scenario Selection

```bash
# Audit single scenario
npx tsx cli/auditOrchestrator.ts --scenarios=advanced-1-manager-escalation

# Audit multiple specific scenarios
npx tsx cli/auditOrchestrator.ts \
  --scenarios=advanced-1,advanced-2,workplace-1,workplace-2

# Audit by category (with fixed filter)
npm run audit -- --category=Advanced --dry-run
```

### Performance Tuning

```bash
# Use more workers (faster but more memory)
npm run audit:parallel --phase=1 --workers=8

# Use fewer workers (slower but less memory)
npm run audit:parallel --phase=1 --workers=3
```

### Dry-Run Testing

```bash
# Preview all fixes without applying
npm run audit:phase1:dry

# Check specific scenarios
npx tsx cli/auditOrchestrator.ts \
  --scenarios=advanced-1,advanced-2 \
  --dry-run
```

## Troubleshooting

### Q: Worker process fails to start
**A:** Check stderr output, verify tsx is installed, check file paths

### Q: Findings show very high redundancy
**A:** This is expected - multiple validators may find same issue, consolidator deduplicates

### Q: Conflict resolution keeps "worse" fix
**A:** Check validator priority, enable verbose mode to see confidence scores

### Q: Build fails after applying fixes
**A:** Orchestrator auto-restores from backup, check `/tmp/audit-failed-fixes.json`

### Q: Git commit fails
**A:** Check git status, resolve conflicts, commit manually before retry

## Next Steps

1. **Execute Phase 1:** `npm run audit:phase1`
2. **Review Consolidation Report:** Check dedup stats and conflicts
3. **Verify Fixes:** `npm run build && npm run validate`
4. **Test in Browser:** Open app, test fixed scenarios
5. **Commit Changes:** Audit creates atomic git commit
6. **Execute Phase 2:** `npm run audit:phase2` (when ready)
7. **Execute Phase 3:** `npm run audit:phase3` (final low-risk scenarios)

## References

- **Module Documentation:**
  - Consolidator: `services/linguisticAudit/consolidator.ts`
  - Conflict Resolver: `services/linguisticAudit/conflictResolver.ts`
  - Persistence: `services/linguisticAudit/persistence.ts`

- **Architecture Files:**
  - Orchestrator: `cli/auditOrchestrator.ts`
  - Worker: `cli/auditWorker.ts`
  - Type Definitions: `services/linguisticAudit/types.ts`

- **Testing:**
  - Test Suite: `scripts/testParallelAudit.ts`
  - Manual Tests: See "Testing" section above
