# .claude Directory

Claude Code agent configurations, skills, and tooling for the FluentStep IELTS Roleplay Engine.

## Quick Navigation

- **agents/** - All 11 agent definitions (6 core + 5 Cambridge layer)
- **hooks/** - Git hooks for validation and workflow automation
- **settings.json** - Main agent registry and configuration
- **settings.json.backup-*** - Daily backups (auto-created)

---

## Architecture Overview

### Project Status
- **Name**: FluentStep IELTS Roleplay Engine
- **Description**: Content extraction pipeline for educational dialogue scenarios
- **Current Phase**: Phase 7: Reusable Extraction Infrastructure
- **Target**: 50-60+ high-quality scenarios by Mar 2026

### 11 Total Agents (7 Main + 4 Cambridge Layer)

#### Core Agents (7)
1. **pdf-extractor** - Extract dialogue from educational PDF sources
2. **blank-inserter** - Convert dialogue to fill-in-the-blank format with pedagogical scoring
3. **content-validator** - Run 7 linguistic validators with auto-fix capabilities
4. **scenario-transformer** - Convert validated dialogue to RoleplayScript TypeScript code
5. **orchestrator-qa** - Coordinate entire extraction pipeline + enforce quality gates
6. **scenario-creator** - Interactive guided scenario creation with automatic validation
7. _(Reserved for future expansion)_

#### Cambridge Design Layer (4)
These agents implement Cambridge English methodology for high-quality task design:

1. **learning-architect** - Define learning outcomes + success criteria
2. **task-designer** - Design roleplay tasks with communicative tension + pragmatic functions
3. **chunk-curator** - Validate core repertoire using corpus linguistics (BNC Spoken, COCA)
4. **system-builder** - Implement scaffolding logic + blank placement + adaptive progression
5. **design-orchestrator** - Coordinate all 4 Cambridge agents + validation + approvals

---

## Quality Gates (5 Stages)

### Extraction
- **Confidence**: ≥70% pattern confidence required
- **Dialogue Turns**: Minimum 8 turns per dialogue (viable for practice)

### Blank Insertion
- **BUCKET_A Compliance**: ≥75-80% high-value vocabulary targeted

### Validation
- **Overall Confidence**: ≥85% combined score across all 7 validators
- **TypeScript Validity**: 100% syntactically valid code

### Data Integrity
- **Build Success**: Zero TypeScript errors
- **Zero Errors**: 100% validation pass rate

---

## 7 Linguistic Validators

Each validator runs independently and provides confidence scoring:

1. **chunk-compliance** - Verify LOCKED_CHUNKS compliance (BUCKET_A/B distribution)
2. **uk-spelling** - Enforce British English spelling (-ise, -our, -re, double-L)
3. **uk-vocabulary** - Ensure British terminology (lift, flat, queue, etc.)
4. **tonality** - Check formal/casual consistency throughout dialogue
5. **natural-patterns** - Detect awkward, textbook-like phrasing
6. **dialogue-flow** - Verify logical flow and speaker consistency
7. **alternatives-quality** - Ensure alternatives are genuine variations, not synonyms

### Confidence Thresholds

| Range | Action | Use Case |
|-------|--------|----------|
| ≥95% | auto-apply | Automatically apply fixes without approval |
| 70-94% | flag-for-review | Flag findings for human approval |
| <70% | report-only | Report findings without suggesting fixes |

---

## 10-Stage Extraction Pipeline

### Flow Diagram
```
1. Intake & Scoping (orchestrator-qa)
   ↓
2. PDF Extraction (pdf-extractor)
   ↓
3. Blank Insertion (blank-inserter)
   ↓
4. Content Validation (content-validator) [Quality Gate #1]
   ↓
5. Fix Loop (orchestrator-qa) [if MEDIUM/LOW findings]
   ↓
6. Scenario Transformation (scenario-transformer)
   ↓
7. Human Final Approval (orchestrator-qa) [Quality Gate #2]
   ↓
8. Data Integration (orchestrator-qa) [merge to staticData.ts]
   ↓
9. Build Verification (orchestrator-qa) [Quality Gate #3]
   ↓
10. Final QA Report (orchestrator-qa) [Quality Gate #4]
```

### Detailed Steps

| Step | Agent | Action | Gate |
|------|-------|--------|------|
| 1 | orchestrator-qa | Estimate scope, get approval | Intake |
| 2 | pdf-extractor | Extract dialogue from PDF | Extraction Confidence ≥70% |
| 3 | blank-inserter | Insert blanks with pedagogical scoring | BUCKET_A ≥75-80% |
| 4 | content-validator | Run 7 validators, apply HIGH confidence fixes | Overall ≥85% |
| 5 | orchestrator-qa | Address MEDIUM/LOW findings if needed | Fix Loop |
| 6 | scenario-transformer | Generate RoleplayScript code | Transform |
| 7 | orchestrator-qa | Get explicit approval before merge | Human Approval |
| 8 | orchestrator-qa | Merge to staticData.ts | Integration |
| 9 | orchestrator-qa | Run npm run build, verify bundle size | Build ✓ |
| 10 | orchestrator-qa | Generate metrics and completion report | Final QA |

---

## Performance Targets

- **Human Intervention**: ≤20% of scenarios
- **Build Time**: <2 minutes
- **Validation Time**: <30 seconds per scenario
- **Data Integrity**: 100% zero errors
- **Bundle Size**:
  - JavaScript: <350 KB (gzipped)
  - CSS: <45 KB (gzipped)

---

## Supported Content Sources

| Source | Format | Status | Patterns |
|--------|--------|--------|----------|
| New Headway Advanced | Oxford | ✓ Tested | "Person A:", "Person B:" |
| Cambridge IELTS | Generic | ⏳ Ready | "Examiner:", "Candidate:" |
| Oxford English File | Generic | ⏳ Ready | "Speaker 1:", "Speaker 2:" |
| Custom PDFs | Auto-detect | ⏳ Ready | Any consistent speaker format |
| AI-Generated | JSON | ⏳ Ready | dialogue array format |

---

## Scaling Roadmap

### Phase 7 (Current)
- **Target**: 50-60 scenarios
- **Timeframe**: Feb 2026
- **Focus**: Infrastructure + smoke test
- **Status**: In progress

### Phase 8
- **Target**: Extract 10-20 Headway scenarios
- **Timeframe**: Feb-Mar 2026
- **Focus**: Extraction sprint with quality gates

### Phase 9
- **Target**: Ship production build
- **Timeframe**: Mar 2026
- **Focus**: Final validation + deployment

### Future (Q2-Q3 2026)
- **Target**: 100+ scenarios from multiple sources
- **Focus**: Cambridge, Oxford, AI-generated, team collaboration

---

## Key Files & Documentation

### Agent Specifications
Each agent has a SKILL.md file with complete specification:
- `agents/pdf-extractor/SKILL.md` (350 lines)
- `agents/blank-inserter/SKILL.md` (380 lines)
- `agents/content-validator/SKILL.md` (450 lines)
- `agents/scenario-transformer/SKILL.md` (400 lines)
- `agents/orchestrator-qa/SKILL.md` (500 lines)
- `agents/scenario-creator/SKILL.md` (350+ lines)
- `agents/cambridge-layer/learning-architect/SKILL.md`
- `agents/cambridge-layer/task-designer/SKILL.md`
- `agents/cambridge-layer/chunk-curator/SKILL.md`
- `agents/cambridge-layer/system-builder/SKILL.md`
- `agents/cambridge-layer/design-orchestrator/SKILL.md`

### Master Documentation
- `agents/README.md` - Complete agent architecture and integration guide (1,200+ lines)
- `.claude/README.md` - This file (overview and navigation)

### Reference Documentation
- `RULES.md` - Project coding standards and patterns
- `QUICK_REFERENCE.md` - Quick access to common commands
- `docs/implementation-reports/` - Historical implementation details
- `docs/test-reports/` - Historical test and verification reports

---

## Hooks & Automation

### Available Hooks

#### PostToolUse: validate-output
Automatically validates data integrity after Write operations to critical files.

**Triggers on**:
- `staticData.ts` - Main scenario database
- `answerVariations` - Answer data structures
- `deepDiveInsights` - Feedback content
- `services/*.ts` - Service layer files
- `scripts/extract*.ts` - Extraction scripts

**Execution**:
- Script: `./.claude/hooks/validate-output.sh`
- Block on Failure: Yes (prevents bad commits)
- Timeout: 60 seconds

#### SessionStart: session-context
Displays project context and status at session start.

**Execution**:
- Script: `./.claude/hooks/session-start.sh`
- Block on Failure: No (informational only)
- Timeout: 10 seconds

---

## Configuration Files

### settings.json Structure
The main configuration file contains:
- Project metadata (name, description, current phase)
- Agent registry with model and tool assignments
- Skill registrations
- Hook definitions
- Development npm script mappings
- (See `settings.json.backup-*` for full archive)

### settings.local.json (Optional)
Create this file for local overrides without affecting shared settings.

---

## Common Commands

```bash
# Validate all scenarios
npm run validate

# Build production bundle
npm run build

# Audit language across scenarios
npm run audit

# Start development server
npm run dev

# Extract dialogue from PDF
/extract-dialogue [file-path] [options]

# Validate scenario quality
/validate-scenario [scenario-file] [options]

# Transform validated content to code
/transform-content [input-file] [options]
```

---

## Troubleshooting

### Build Failures
- Check `npm run build` output for TypeScript errors
- Validate all newly added scenarios with `npm run validate`
- Ensure blank indices align with answer variations count

### Validation Failures
- Run individual validators to isolate issues (check agent specs)
- Review validator output in orchestrator-qa reports
- Fix MEDIUM confidence issues before proceeding to transformation

### Data Integration Issues
- Ensure scenario IDs are globally unique
- Verify RoleplayScript schema matches `src/services/staticData.ts`
- Check for duplicate chunk IDs or blank indices

---

## Contacts & Approvals

- **Architect**: Claude Code - Phase 7 Implementation
- **Operational Owner**: Orchestrator-QA Agent
- **Human Approver**: Project Team Lead

---

## Version History

- **Feb 14, 2026**: Phase 2 - Directory standardization and settings.json slim
- **Feb 13, 2026**: Phase 7 - Reusable extraction infrastructure complete
- **Feb 12, 2026**: Scenario Creator Agent implementation
- **Feb 11, 2026**: E2E testing infrastructure complete

---

**Last Updated**: Feb 14, 2026
**Status**: Production Ready
**Maintenance**: Active (daily backups of settings.json)
