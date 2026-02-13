# FluentStep Shared Team Context

**Date**: 2026-02-14
**Team Status**: Multi-Agent Development Team Activated
**Phase**: Phase 8: Parallel Batch Enhancement

---

## 🎯 Team Objectives

### Immediate Goals (This Session)
1. **Validate team coordination** - Test single scenario enhancement workflow
2. **Batch enhancement** - Apply Session 7 template to 5+ scenarios in parallel
3. **Pattern summary automation** - 30 min → 2 min per scenario
4. **Active recall automation** - 20 min → 3 min per scenario

### Long-Term Vision
- **10x speedup** on repetitive tasks (25 hrs → 2-3 hrs for 5 scenarios)
- **Zero merge conflicts** (staticData.ts locking protocol)
- **Scalable team** ready to handle 52-scenario production codebase

---

## 📊 Project Snapshot

| Metric | Value | Status |
|--------|-------|--------|
| Total Scenarios | 52 | ✅ All working |
| Test Pass Rate | 97.2% (69/71) | ✅ Production ready |
| Build Status | Zero errors | ✅ TypeScript clean |
| Codebase Files | 98 TypeScript + 47 docs | ✅ Organized |
| Active Team Agents | 5 specialized | ✅ Ready to work |

---

## 🔗 Core Architectural Decisions

### 1. ChunkID Format (Stable Composite Key)
```
{scenarioId}-b{blankIndex}
Example: "social-1-flatmate-b3"
```
- **Immutable** once created (no refactoring needed)
- **Human-readable** (tells you scenario + blank number)
- **Unique** across all 52 scenarios
- **Used in**: chunkFeedbackV2, patternSummary, activeRecall

### 2. Dual Schema Support (V1 Legacy + V2 Modern)
**V1 (Legacy)**: `deepDive` field for old scenarios
**V2 (Production)**:
- `chunkFeedbackV2` - Pattern-focused feedback (why chunks work)
- `blanksInOrder` - Normalized blank list
- `patternSummary` - Category patterns (25 categories)
- `activeRecall` - Spaced repetition questions

### 3. Staging Pattern (Prevent Merge Conflicts)
```
Content Gen Agent writes to: .staging/scenario-X.md
Data/Services Agent reads from: .staging/scenario-X.md
Data/Services Agent merges to: src/services/staticData.ts
```
**Why**: Eliminates race conditions, enables parallel content generation

### 4. File Locking Protocol (staticData.ts Protection)
```
Data/Services Agent:
  1. Acquire exclusive lock
  2. Read .staging/scenario-X.md
  3. Validate data (7 linguistic validators)
  4. Merge to staticData.ts (atomic operation)
  5. Release lock
```
**Why**: Only ONE agent writes to staticData.ts at a time (no conflicts)

### 5. Task Dependency Tracking (Orchestrator-Dev)
```
Task 1: Export scenario → .staging/
Task 2: Generate patterns (blockedBy: Task 1)
Task 3: Validate data (blockedBy: Task 2)
Task 4: Merge to staticData.ts (blockedBy: Task 3)
Task 5: Run E2E tests (blockedBy: Task 4)
```
**Why**: Ensures sequential execution, prevents premature merges

---

## 👥 The Development Team

### 1. Content Generation Agent (Sonnet)
**Role**: Create and enhance scenario content
**Exclusive Write Access**: `.staging/**/*`, `scripts/contentGeneration/**/*`
**Key Tasks**:
- Expand dialogue (+140%)
- Insert blanks (+100%)
- Generate chunk feedback (V2 schema)
- Create pattern summaries (30 min → 2 min)
- Generate active recall questions (20 min → 3 min)

### 2. Data/Services Agent (Sonnet)
**Role**: Guardian of staticData.ts integrity
**Exclusive Write Access**: `src/services/staticData.ts` (ONLY agent)
**Key Tasks**:
- Validate staging content (7 validators)
- Merge to staticData.ts (atomic operations)
- Enforce schema compliance (V1/V2)
- Manage ChunkID consistency
- Apply file locking protocol

### 3. Frontend/UI Agent (Sonnet)
**Role**: React components and user experience
**Exclusive Write Access**: `src/components/**/*`, `src/hooks/**/*`, `src/design-system/**/*`
**Key Tasks**:
- Build React components (30 files)
- Implement feedback rendering (O(1) lookups)
- Optimize UI performance
- Maintain design consistency
- **Never writes to**: staticData.ts

### 4. Testing Agent (Haiku)
**Role**: Quality assurance and test validation
**Read-Only Access**: All source files
**Key Tasks**:
- Run E2E tests (pytest, Playwright)
- Validate 97.2%+ pass rate
- Generate test reports
- Monitor test flakiness
- **Never writes to**: Source code

### 5. Orchestrator-Dev Agent (Opus)
**Role**: Team coordinator and quality gate enforcer
**Global Access**: `.claude/**/*`, `docs/**/*`
**Key Tasks**:
- Create TaskList with dependencies
- Assign tasks to specialized agents
- Monitor progress and blockers
- Enforce quality gates (build + validation + tests)
- Present human approval workflows
- **Never writes code directly**: Delegates to specialized agents

---

## 🔐 File Access Boundaries

### Shared Read-Only (All Agents)
```
✓ src/services/staticData.ts (context only)
✓ src/types.ts (type definitions)
✓ package.json (npm scripts)
✓ docs/**/*.md (documentation)
✓ .claude/**/*.md (shared context)
```

### Exclusive Write Access
```
Content Gen Agent:
  → .staging/**/*
  → scripts/contentGeneration/**/*
  → exported-scenarios/**/*

Data/Services Agent:
  → src/services/staticData.ts (EXCLUSIVE)
  → src/services/linguisticAudit/**/*

Frontend/UI Agent:
  → src/components/**/*
  → src/hooks/**/*
  → src/design-system/**/*

Testing Agent:
  → tests/reports/**/* (read-only source)

Orchestrator-Dev Agent:
  → docs/**/*
  → .claude/**/*
```

**Critical**: No overlapping write access. Prevents merge conflicts.

---

## 🚀 Communication Patterns

### Pattern 1: Content Generation → Validation → Integration
```
1. Content Gen Agent:
   ✓ Writes to .staging/social-8.md
   ✓ Marks Task "Export social-8" as completed

2. Data/Services Agent (monitors completion):
   ✓ Claims Task "Validate social-8"
   ✓ Reads .staging/social-8.md
   ✓ Runs 7 linguistic validators
   ✓ Marks Task completed

3. Data/Services Agent (when validation passes):
   ✓ Claims Task "Merge social-8"
   ✓ Acquires lock on staticData.ts
   ✓ Performs atomic merge
   ✓ Releases lock
   ✓ Marks Task completed
```

### Pattern 2: Merge → Test Validation
```
1. Data/Services Agent:
   ✓ Merges to staticData.ts
   ✓ Marks Task completed

2. Testing Agent (monitors merge):
   ✓ Claims Task "Test social-8"
   ✓ Runs pytest for scenario
   ✓ Reports pass/fail
   ✓ Marks Task completed
```

### Pattern 3: Human Approval Gate
```
1. Data/Services Agent:
   ✗ Detects validation warnings
   ⚠ Marks Task as "blocked"

2. Orchestrator-Dev Agent:
   ℹ Presents warnings to human user
   ⏸ Waits for approval

3. Human approves/rejects
   → Task continues or gets deleted
```

---

## ✅ Quality Gates (Every Change Must Pass)

### Gate 1: TypeScript Build
```bash
npm run build
# Must complete with zero errors
```

### Gate 2: Data Validation
```bash
npm run validate:critical
# Blocks on production-breaking errors
```

### Gate 3: E2E Tests (Quick)
```bash
npm run test:e2e:tier1
# 30 seconds, 6 scenarios
# Must maintain 97.2%+ pass rate
```

### Gate 4: Full Validation
```bash
npm run validate:feedback
# Validates chunk feedback across all scenarios
```

**Enforcement**: Orchestrator-Dev blocks completion until ALL gates pass.

---

## 📈 Expected Performance

### Time Savings per Task
| Task | Manual | With Team | Speedup |
|------|--------|-----------|---------|
| Dialogue expansion | 30-45 min | 5 min | 7x |
| Blank insertion | 20-30 min | 5 min | 5x |
| Pattern summary | 30 min | 2 min | 15x |
| Active recall | 20-30 min | 3 min | 8x |
| **Batch 5 scenarios** | **25 hours** | **2-3 hours** | **10x** |

### Quality Improvements
- **Zero merge conflicts** (staticData.ts locking)
- **97.2%+ test pass rate** (Testing Agent validation)
- **Consistent patterns** (Session 7 template)
- **Preventive validation** (7 linguistic validators)

---

## 📋 Current Tasks (TaskList)

See TaskList for real-time task assignments, blockers, and completion status.

**Types of tasks you may see**:
- `[Content Gen] Export scenario-X to staging`
- `[Data/Services] Validate scenario-X`
- `[Data/Services] Merge scenario-X to staticData.ts`
- `[Frontend/UI] Build component for scenario-X`
- `[Testing] Run E2E tests for scenario-X`
- `[Orchestrator-Dev] Enforce quality gates`

---

## 🔄 Session Workflow (Typical)

### Single Scenario Enhancement
```
1. User: "Enhance social-1-flatmate to 90% completeness"
2. Orchestrator-Dev: Creates TaskList (6 tasks with dependencies)
3. Content Gen: Exports to .staging/, generates patterns, active recall
4. Data/Services: Validates, merges to staticData.ts
5. Testing: Runs E2E tests
6. Orchestrator-Dev: Verifies quality gates
7. ✅ Scenario complete, ready for production
```

**Expected time**: 45 min - 1 hour

### Batch Enhancement (5 Scenarios)
```
1. User: "Enhance social-8 through social-12"
2. Orchestrator-Dev: Creates TaskList (30 tasks, parallel dependencies)
3. Content Gen: Works on all 5 simultaneously
   - Exports all to .staging/
   - Generates patterns for all 5
   - Generates active recall for all 5
4. Data/Services: Validates and merges sequentially
   - Lock acquired for social-8
   - Validate, merge, release lock
   - Repeat for social-9, social-10, social-11, social-12
5. Testing: Runs E2E tests after each merge
6. Orchestrator-Dev: Final quality gate verification
7. ✅ Batch complete, 5 scenarios enhanced in 2-3 hours
```

**Expected time**: 2-3 hours (vs 25 hours manual)

---

## 🛠️ Common Commands (Reference)

```bash
# Development
npm run dev                          # Start dev server

# Building & Validation
npm run build                        # Full build + type-check
npm run validate:critical            # Production-breaking errors
npm run validate:feedback            # Chunk feedback validation

# Testing
npm run test:e2e:tier1              # Quick tests (30s, 6 scenarios)
npm run test:e2e                    # Full tests (60s, 71 tests)

# Pre-commit checklist
npm run type-check && npm run qa-test
```

---

## 🚨 Critical Rules

1. **One writer per file**: Only designated agent can write to each file
2. **Staging first**: Content Gen always writes to `.staging/`, never directly to staticData.ts
3. **Lock before merge**: Data/Services acquires lock before staticData.ts writes
4. **Quality gates on everything**: NO changes without passing build + validation + tests
5. **Task dependencies**: Always use TaskList blocking (no concurrent writes)
6. **Schema compliance**: V1/V2 dual support - never break legacy scenarios

---

## 📚 Documentation

- **Architecture**: See `docs/architecture/feedback-system.md`
- **Data Schemas**: See `docs/architecture/data-schemas.md`
- **Session History**: See `docs/sessions/recent-work.md`
- **Quick Reference**: See `docs/reference/quick-start.md`

---

## 💡 For New Team Members

1. **Read this file first** ← You are here
2. **Read your ROLE.md** in `.claude/agents/[agent-name]/ROLE.md`
3. **Understand file boundaries** - Check the "File Access Boundaries" section above
4. **Follow patterns** - See "Communication Patterns" section
5. **Respect quality gates** - Every change must pass all 4 gates

---

## 🎯 Next Immediate Steps

1. **Validate team setup**: Check `.claude/settings.json` (verify 5 new agents added)
2. **Test single scenario**: Enhance social-1 as proof-of-concept
3. **Test batch scenarios**: Enhance social-8 through social-12 in parallel
4. **Monitor metrics**: Verify 97.2%+ test pass rate maintained
5. **Document learnings**: Update MEMORY.md with team patterns

---

**Last Updated**: 2026-02-14
**Status**: 🟢 Team activated and ready to work
**Contact**: Orchestrator-Dev Agent (team lead)
