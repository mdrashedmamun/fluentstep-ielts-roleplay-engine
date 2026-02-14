# FluentStep - Claude Code Configuration

**Project**: IELTS Roleplay Engine with Multi-Agent Content Generation
**Status**: Production Ready ✅ (52 complete scenarios)
**Agents**: 11 active (5 archived to context reduction)
**Last Updated**: Feb 14, 2026 (Session 12 - Post-Mortem & Multi-Agent Fix)

---

## Quick Start

### For Claude Sessions
1. **Team Coordination**: Read [SHARED_CONTEXT.md](./SHARED_CONTEXT.md) (how agents work together)
2. **Quality Gates**: See [rules/QUALITY_GATES.md](./rules/QUALITY_GATES.md) (build → validate → test → QA)
3. **Core Rules**: See [rules/CORE_RULES.md](./rules/CORE_RULES.md) (language, chunks, pedagogy)
4. **Agent Specs**: See [agents/README.md](./agents/README.md) (all agent responsibilities)
5. **Data Safety**: See [rules/DATA_INTEGRITY.md](./rules/DATA_INTEGRITY.md) (defensive patterns, O(1) lookups)

### For Humans
- **Project Overview**: See [README.md](./README.md)
- **Agent Architecture**: See [agents/README.md](./agents/README.md)
- **Recent Work**: See [../docs/sessions/recent-work.md](../docs/sessions/recent-work.md)
- **Implementation Details**: See [../docs/sessions/](../docs/sessions/) folder

---

## Configuration Files

| File | Purpose | Committed? |
|------|---------|------------|
| `CLAUDE.md` | This file - navigation index | ✅ Yes |
| `CLAUDE.local.md` | Personal session notes | ❌ No (.gitignore) |
| `README.md` | Comprehensive overview | ✅ Yes |
| `SHARED_CONTEXT.md` | Multi-agent team coordination | ✅ Yes |
| `settings.json` | Agent registry (11 active agents) | ✅ Yes |
| `settings.local.json` | Personal overrides (543 KB) | ❌ No (.gitignore) |
| `rules/` | Modular rule files (4 topic areas) | ✅ Yes |
| `agents/` | Agent specifications (ROLE.md files) | ✅ Yes |
| `skills/` | Reusable skill definitions | ✅ Yes |
| `hooks/` | Git hooks for validation | ✅ Yes |

---

## Rules (Modular)

Breaking instructions into focused topic files instead of one monolithic document:

### [rules/CORE_RULES.md](./rules/CORE_RULES.md)
Language constraints and pedagogical principles
- Global non-negotiable rules (train patterns, not vocab)
- Language style (UK English, day-to-day tone)
- Locked Universal Chunks reference
- Chunk priority and usage requirements

### [rules/SCHEMA_RULES.md](./rules/SCHEMA_RULES.md)
Data structure and schema compliance
- V1/V2 dual schema support (deepDive + chunkFeedback)
- ChunkID format and validation
- Schema coexistence rules
- Migration procedures

### [rules/QUALITY_GATES.md](./rules/QUALITY_GATES.md)
Quality assurance pipeline and 4-stage enforcement
- Gate 1: Build verification (zero TypeScript errors)
- Gate 2: Validation checks (≥85% confidence)
- Gate 3: Testing suite (≥97% pass rate)
- Gate 4: QA review (human sign-off)
- Gate bypass procedures

### [rules/DATA_INTEGRITY.md](./rules/DATA_INTEGRITY.md)
Code safety and performance guardrails
- Defensive fallback patterns (?.optional-chaining)
- O(1) lookup requirements (Map/Set instead of array search)
- File locking for staticData.ts (prevent race conditions)
- Type safety and input validation
- Performance complexity rules

### [rules/README.md](./rules/README.md)
Index and quick reference for all rules

---

## Agent Specifications

### Core Team (11 Agents)

#### Main Agents (7)
- **content-gen-agent** - Generate dialogues, blanks, enrichments
- **data-services-agent** - Manage staticData.ts and scenario data
- **testing-agent** - E2E testing and validation
- **scenario-creator** - Interactive guided scenario creation
- **orchestrator-dev** - Multi-agent workflow coordination
- **orchestrator-qa** - QA validation and final approval
- **pdf-extractor** - Extract dialogue from PDF sources

#### Supporting Agents (4)
- **blank-inserter** - Convert dialogue to fill-in-blank format
- **content-validator** - Linguistic validation (7 validators)
- **scenario-transformer** - Convert dialogue to TypeScript
- *Reserved for expansion*

See [agents/README.md](./agents/README.md) for complete specifications.

---

## Skills (Reusable)

Formalized, discoverable skills in `.claude/skills/`:

### [skills/README.md](./skills/README.md)
Skill registry and overview

### [skills/extract-dialogue.md](./skills/extract-dialogue.md)
Extract dialogue from PDFs using pdf-extractor agent
- Inputs: PDF file path, optional scenario ID
- Outputs: Structured dialogue array (JSON)
- Agents: pdf-extractor

### [skills/validate-scenario.md](./skills/validate-scenario.md)
Validate scenario structure and content
- Checks: Schema, chunks, UK spelling, alternatives
- Confidence: ≥85% required
- Agents: content-validator

### [skills/transform-content.md](./skills/transform-content.md)
Transform scenarios from V1 → V2 schemas
- Updates: Dual schema support, new feedback types
- Validation: Post-transform verification
- Agents: scenario-transformer

### [skills/generate-pattern-summary.md](./skills/generate-pattern-summary.md)
Generate pattern summaries for chunk feedback
- Creates: What chunk is taught, common mistakes, key takeaway
- Output: Adds to chunkFeedback.patternSummary
- Agents: content-gen-agent

### [skills/export-scenario.md](./skills/export-scenario.md)
Export scenario to Markdown for human review
- Format: Markdown with frontmatter
- Uses: All scenario metadata and feedback
- Agents: data-services-agent

---

## Project Health Dashboard

| Metric | Value | Status |
|--------|-------|--------|
| Total Scenarios | 52 | ✅ All working |
| Test Pass Rate | 97.2% (69/71) | ✅ Production ready |
| Build Status | Zero TypeScript errors | ✅ Clean |
| Active Agents | 11 (was 16) | ✅ Cambridge archived |
| Agent Context | ~150 KB (was 246 KB) | ✅ 39% reduction |
| Session Utilization | ~62-65% (was 81%) | ✅ +16-19% working context |
| Rules Organization | 4 topic files | ✅ Modular |
| Best Practices Alignment | 95% | ✅ Excellent |

---

## Essential Commands

```bash
# Start development server
npm run dev

# Full build + type-check
npm run build

# Quick E2E (6 scenarios, ~30s)
npm run test:e2e:tier1

# Full E2E suite (71 tests, ~5 min)
npm run test:e2e

# Validate all scenarios
npm run validate:feedback

# Export all scenarios to Markdown
npm run export:scenarios

# QA validation
npm run qa-test

# Type check only
npm run type-check
```

---

## Documentation Index

### Core Documents
- **[SHARED_CONTEXT.md](./SHARED_CONTEXT.md)** - Multi-agent team objectives, file boundaries, workflows
- **[README.md](./README.md)** - Quick navigation, architecture overview

### Rules (Modular)
- **[rules/](./rules/)** - 4 topic-specific rule files

### Agent Specifications
- **[agents/README.md](./agents/README.md)** - Agent architecture and integration
- **[agents/*/ROLE.md](./agents/)** - Individual agent specifications

### Skills
- **[skills/](./skills/)** - Reusable skill definitions

### Sessions & History (in parent docs/)
- **docs/sessions/recent-work.md** - Latest sessions (7-10)
- **docs/sessions/feature-implementations.md** - Feature details
- **docs/sessions/bug-fixes.md** - Critical fixes
- **docs/sessions/testing-infrastructure.md** - Test setup

### Architecture & Design (in parent docs/)
- **docs/architecture/feedback-system.md** - Feedback architecture
- **docs/architecture/data-schemas.md** - V1 vs V2 comparison

### Post-Mortems & Analysis
- **[analysis/](./analysis/)** - Incident reports, root cause analyses
- **analysis/ROOT_CAUSE_ANALYSIS.md** - BBC scenario deployment failure + multi-agent architecture issues
  - Why 4 quality gates failed to catch incomplete data
  - 5 critical design flaws in multi-agent system
  - Actionable recommendations for fixing agent coordination

---

## How to Use This Directory

### For Claude Code Sessions
1. Start with **SHARED_CONTEXT.md** for team coordination
2. Reference **rules/** for decision-making guardrails
3. Consult **agents/ROLE.md** for specialized tasks
4. Check **skills/** for reusable workflows

### For Developers
1. Read **README.md** for project overview
2. Check **agents/README.md** for agent architecture
3. Review **docs/sessions/recent-work.md** for latest changes
4. See **rules/** for implementation guardrails

### For Code Review
1. Validate against **rules/QUALITY_GATES.md** checklist
2. Check **rules/DATA_INTEGRITY.md** for safety patterns
3. Verify schema compliance against **rules/SCHEMA_RULES.md**

---

## Personal Notes

For personal session notes, use `.claude/CLAUDE.local.md` (gitignored):
```bash
# Edit personal notes (not committed)
nano .claude/CLAUDE.local.md
```

This file persists across sessions but is never committed to Git.

---

## Verification Steps

### After Setup
1. **Build check**: `npm run build` (should be clean)
2. **File structure**: All `.claude/rules/` files present
3. **Skills registered**: All `.claude/skills/` files present
4. **Git status**: `.claude/CLAUDE.local.md` untracked (gitignored)

### Before Committing Code
1. **Validate rules**: Check against applicable rules in `rules/`
2. **Quality gates**: Run through 4-stage gates (build → validate → test → qa)
3. **Type safety**: `npm run type-check` passes
4. **Tests pass**: `npm run test:e2e:tier1` succeeds

---

## Rollback Plan

If any issues arise, all changes are additive and easily reversible:

```bash
# Restore original /RULES.md if needed
git checkout HEAD -- RULES.md

# Remove new directories
rm -rf .claude/rules/ .claude/skills/

# Revert .gitignore
git checkout HEAD -- .gitignore

# Time to rollback: <2 minutes
```

---

**Last Updated**: Feb 14, 2026 (Session 12 - Incident Response & Analysis)
**Maintained by**: Claude Code Architecture Team
