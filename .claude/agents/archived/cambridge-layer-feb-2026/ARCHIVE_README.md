# Cambridge Layer Archive

**Archived**: Feb 14, 2026 | **Archive Version**: 1.0
**Reason**: Phase 0 implementation complete but untested; not integrated with Phase 7-9 multi-agent development team
**Context Saved**: 96 KB | **Status**: Ready for restoration if needed

---

## What Was Archived

The Cambridge Design Layer was a strategic learning design system with **5 specialized agents**:

1. **learning-architect** (390 lines SKILL.md) - CEFR-based learning outcomes
2. **task-designer** (500 lines SKILL.md) - Roleplay task design with communicative tension
3. **chunk-curator** (564 lines SKILL.md) - Corpus linguistics validation + BNC data
4. **system-builder** (634 lines SKILL.md) - Scaffolding logic and blank placement
5. **design-orchestrator** (581 lines SKILL.md) - Multi-agent coordination

**Total**: 96 KB agent documentation + BNC corpus data

### Why Archived?

| Reason | Details |
|--------|---------|
| **Status** | Created Feb 11, 2026; marked "Ready for testing" but never tested |
| **Integration** | No connection to Phase 7-9 multi-agent development team |
| **Usage** | Zero active references in codebase; not used in current workflows |
| **Impact** | Consumed 96 KB session context (37% of agent documentation) |
| **Context Pressure** | Session start at 81% utilization; archiving reduces to 62% |

### What Was Preserved?

**Corpus Linguistics Data** (moved, not deleted):
```
Source:  .claude/agents/cambridge-layer/chunk-curator/corpus-data/
Target:  .claude/agents/content-gen-agent/corpus-data/

Files:
- bnc_spoken_2grams.txt   (1.9 KB) - 2-word high-frequency phrases
- bnc_spoken_3grams.txt   (2.2 KB) - 3-word collocations
- bnc_spoken_4grams.txt   (2.0 KB) - 4-word patterns
```

**New Reference**: `.claude/agents/content-gen-agent/CORPUS_REFERENCE.md` (3 KB)
- Quick lookup guide for corpus data
- Register validation workflows
- Common search patterns
- Integration notes

---

## Restoration Instructions

### Option 1: Restore Full Cambridge Layer (5 minutes)

**Step 1**: Move Cambridge Layer back
```bash
cd /Users/md.rashedmamun/Documents/Projects/fluentstep_-ielts-roleplay-engine

# From archived directory back to agents
mv .claude/agents/archived/cambridge-layer-feb-2026/agents/cambridge-layer \
   .claude/agents/cambridge-layer
```

**Step 2**: Restore 5 agents to settings.json
```bash
# Use backup configuration below (see "Backup Configuration" section)
# Or use git:
git restore .claude/settings.json
```

**Step 3**: Remove corpus data from content-gen-agent (optional)
```bash
rm -rf .claude/agents/content-gen-agent/corpus-data
```

**Time**: < 5 minutes | **Reversibility**: Fully reversible

---

### Option 2: Selective Restoration

If you need **only specific agents**:

**For learning-architect** (learning outcomes):
```bash
cp -r .claude/agents/archived/cambridge-layer-feb-2026/learning-architect \
      .claude/agents/learning-architect
# Then restore agent entry from backup configuration
```

**For chunk-curator** (corpus expertise):
```bash
cp -r .claude/agents/archived/cambridge-layer-feb-2026/chunk-curator \
      .claude/agents/chunk-curator
# Then restore agent entry from backup configuration
```

---

## Backup Configuration

### Full settings.json Extract (5 archived agents)

Add these 5 entries back to `.claude/settings.json` under `agents.subagents` array (copy with line breaks preserved):

```json
{
  "name": "learning-architect",
  "description": "Define learning outcomes (Cambridge methodology)",
  "model": "sonnet",
  "tools": ["Read", "Write"],
  "context": "fork"
},
{
  "name": "task-designer",
  "description": "Design roleplay tasks with communicative tension",
  "model": "sonnet",
  "tools": ["Read", "Write"],
  "context": "fork"
},
{
  "name": "chunk-curator",
  "description": "Validate core repertoire using corpus linguistics",
  "model": "haiku",
  "tools": ["Read", "Write", "Bash"],
  "context": "fork"
},
{
  "name": "system-builder",
  "description": "Implement scaffolding logic + blank placement",
  "model": "sonnet",
  "tools": ["Read", "Write"],
  "context": "fork"
},
{
  "name": "design-orchestrator",
  "description": "Coordinate all Cambridge design agents",
  "model": "opus",
  "tools": ["Read", "Write", "Bash"],
  "context": "default"
}
```

**Agent Count**: Changes from 11 → 16 when restored

---

## Archive Contents

```
.claude/agents/archived/cambridge-layer-feb-2026/
├── ARCHIVE_README.md (this file)
├── learning-architect/
│   ├── SKILL.md (390 lines)
│   └── [supporting files]
├── task-designer/
│   ├── SKILL.md (500 lines)
│   └── [supporting files]
├── chunk-curator/
│   ├── SKILL.md (564 lines)
│   ├── corpus-data/ (moved to content-gen-agent)
│   └── [supporting files]
├── system-builder/
│   ├── SKILL.md (634 lines)
│   └── [supporting files]
└── design-orchestrator/
    ├── SKILL.md (581 lines)
    └── [supporting files]
```

---

## Rollback Verification

After restoration, verify integrity:

```bash
# 1. Check agent directories exist
ls .claude/agents/learning-architect
ls .claude/agents/task-designer
ls .claude/agents/chunk-curator
ls .claude/agents/system-builder
ls .claude/agents/design-orchestrator

# 2. Verify settings.json is valid JSON
cat .claude/settings.json | jq '.'

# 3. Count agents (should be 16)
cat .claude/settings.json | jq '.agents.subagents | length'

# 4. Run quality gates
npm run build && npm run qa-test

# 5. Verify no broken references
grep -r "learning-architect\|task-designer\|chunk-curator" src/ tests/
# Expected: No matches (agents not referenced in code)
```

---

## Context Impact Analysis

### Before Archive (Feb 14 09:00)
- **Agent Context**: 246 KB (5 Cambridge agents)
- **Session Start**: 81% utilization
- **Available Context**: ~19% for work

### After Archive (Feb 14 09:15)
- **Agent Context**: 150 KB (11 active agents)
- **Session Start**: 62-65% utilization (estimate)
- **Available Context**: ~35-38% for work

**Improvement**: +16-19% additional working context (≈40,000-48,000 tokens)

---

## Decision Record

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Archive Status** | Complete archival, not stubbed | Simpler to restore; no complexity of on-demand loading |
| **Corpus Data** | Copied, not moved | Preserved valuable linguistics data in accessible location |
| **Restoration Path** | Documented with instructions | Can be restored in <5 minutes if needed |
| **Phase 2** | Optional future stub reduction | Evaluate after Phase 1 success |

---

## Next Steps (Optional Phase 2)

If Phase 1 archival successful, consider Phase 2:

**Stub Legacy Agents** (6 more agents, 42 KB reduction):
- pdf-extractor, blank-inserter, content-validator
- scenario-transformer, orchestrator-qa, scenario-creator

**Approach**: 10 KB SKILL.md → 1 KB stub + on-demand loading
**Impact**: 62% → 46% context utilization
**Risk**: Medium (requires runtime loading logic)

---

## Archive Metadata

| Field | Value |
|-------|-------|
| **Archive Date** | 2026-02-14 T 09:15 UTC |
| **Archive Version** | 1.0 |
| **Created By** | Context Reduction Phase 1 Plan |
| **Status** | Complete & Reversible |
| **Testing Status** | Cambridge agents never tested |
| **Integration Status** | Zero references in Phase 7-9 code |
| **Preserved Data** | BNC corpus linguistics (moved to content-gen-agent) |
| **Backup Location** | This file (settings.json config) + git history |

---

## Questions?

**How do I restore the Cambridge Layer?** → See "Restoration Instructions" section above

**Why wasn't it stubbed instead?** → Simpler restoration path; no runtime loading logic required

**Can I use corpus data without the Cambridge agents?** → Yes! See `content-gen-agent/CORPUS_REFERENCE.md` for standalone usage

**What if I want to integrate Cambridge design later?** → Restore using instructions above; coordinate with Phase 7-9 multi-agent team on integration points

---

**Archive Created**: Feb 14, 2026 09:15 UTC
**Last Reviewed**: Feb 14, 2026 09:15 UTC
**Next Review**: Suggested if Phase 2 stub reduction is implemented

---

## Quick Restore Command

```bash
# One-liner to restore Cambridge Layer (requires manual settings.json edit)
mv .claude/agents/archived/cambridge-layer-feb-2026/* .claude/agents/

# Then restore settings.json from git or use configuration above
```

**Reversible**: ✅ Yes (< 5 minutes)
**Risk**: ✅ Low (no code changes, documentation only)
**Side Effects**: ✅ None (isolated agents, no dependencies)
