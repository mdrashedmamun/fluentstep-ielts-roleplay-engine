# FluentStep Specialized Subagents

This directory contains multiple specialized subagents:

- **Scenario Creator Agent** (NEW) - Interactive guided scenario creation with automatic validation
- **Content Extraction Pipeline** (5 agents) - PDF extraction, blank insertion, validation, transformation

## Quick Start: Create a New Scenario

**For Non-Technical Users:**
```bash
# In Claude Code, simply type:
"create a new scenario"

# The Scenario Creator Agent will guide you through:
# 1. Select category (Social, Workplace, Healthcare, etc.)
# 2. Describe the context (e.g., "Performance review")
# 3. Number of dialogue turns (8-20)
# 4. Difficulty level (B1-C2)

# The agent then automatically:
# • Generates natural dialogue
# • Creates blanks and feedback
# • Runs validation
# • Merges to staticData.ts
# • Verifies build succeeds
```

**For Experienced Users:**
```bash
npm run create:scenario
# Shows detailed instructions and next steps
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│              Orchestrator-QA (Project Lead)                      │
│         Coordinates pipeline, manages approvals, builds           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   ┌─────────────┐  ┌──────────────┐  ┌────────────────┐
   │  PDF        │  │ Blank        │  │ Content        │
   │  Extractor  │─▶│ Inserter     │─▶│ Validator      │
   └─────────────┘  └──────────────┘  └────────────────┘
   (Extract        (Insert blanks    (Validate UK
    dialogue)       & answer vars)    English, tonality)
        │
        │
        ▼
   ┌──────────────────────┐
   │  Scenario            │
   │  Transformer         │
   └──────────────────────┘
   (Generate RoleplayScript
    TypeScript code)
```

## The 5 Subagents

### 1. **PDF Extractor Agent**
**File:** `pdf-extractor/SKILL.md`

**Purpose:** Extract structured dialogue from any educational PDF (Headway, Cambridge, Oxford, custom).

**Input:** PDF file path
**Output:** dialogue.json with speaker-text pairs, metadata, confidence scores

**Key Features:**
- Universal pattern detection (Oxford, Cambridge, custom formats)
- Chunk by units (15-30 pages per extraction)
- Dialogue richness scoring
- Low-confidence flagging for human review

**Quality Gates:**
- ✓ Confidence ≥70%
- ✓ Dialogue turns ≥8
- ✓ Richness score ≥5%

---

### 2. **Blank Inserter Agent**
**File:** `blank-inserter/SKILL.md`

**Purpose:** Convert dialogue to fill-in-the-blank format using LOCKED_CHUNKS scoring and pedagogical ranking.

**Input:** dialogue.json
**Output:** dialogue_blanked.json with blanks + answer variations + pedagogical metadata

**Key Features:**
- Intelligent phrase extraction (2-4 word optimal length)
- BUCKET_A/B/NOVEL scoring system
- Multi-factor pedagogical scoring (phrasal verbs, idioms, contextual importance)
- Compliance thresholds (80%+ BUCKET_A for casual, 60%+ for academic C1-C2)

**Quality Gates:**
- ✓ Compliance meets target threshold
- ✓ Pedagogical score ≥55
- ✓ Natural flow with blanks filled

---

### 3. **Content Validator Agent**
**File:** `content-validator/SKILL.md`

**Purpose:** Run all 7 linguistic validators. Machine-grade quality control.

**Input:** dialogue_blanked.json
**Output:** validation_report.json with all 7 validator results

**The 7 Validators:**
1. **LOCKED_CHUNKS Compliance** - Verify BUCKET_A/B distribution
2. **UK English Spelling** - Enforce -ise, -our, -re, double-L patterns
3. **UK English Vocabulary** - Ensure British terminology (lift, flat, queue)
4. **Tonality & Register** - Check formal/casual consistency
5. **Natural Patterns** - Detect awkward, textbook-like phrasing
6. **Dialogue Flow** - Verify logical flow, speaker consistency
7. **Alternatives Quality** - Ensure alternatives are variations, not synonyms

**Confidence Thresholds:**
- **HIGH (≥95%)**: Auto-apply fixes
- **MEDIUM (70-94%)**: Flag for human approval
- **LOW (<70%)**: Report findings only

**Quality Gates:**
- ✓ All validators PASS or acceptable
- ✓ Overall confidence ≥85%
- ✓ <3 flags for human review

---

### 4. **Scenario Transformer Agent**
**File:** `scenario-transformer/SKILL.md`

**Purpose:** Convert validated dialogue into production-ready RoleplayScript TypeScript format.

**Input:** validation_report.json + validated dialogue
**Output:** RoleplayScript TypeScript code ready for staticData.ts

**Key Features:**
- Metadata generation (ID, title, scenario, category, difficulty)
- Character assignment (realistic, diverse names)
- Answer variations structuring (context-specific, not synonyms)
- Deep dive insights generation (pedagogical value per blank)
- Category auto-detection (Advanced, Workplace, Social, Service)
- CEFR level estimation (B1, B2, C1, C2)

**Quality Gates:**
- ✓ Valid TypeScript syntax
- ✓ All required fields present
- ✓ Consistent character names
- ✓ Indices match answer variations
- ✓ Substantive deep dive insights

---

## Alternative: Scenario Creator Agent (Direct Creation)

**File:** `scenario-creator/SKILL.md`

For users who want to create scenarios directly without PDFs, the **Scenario Creator Agent** provides an interactive wizard:

### Features:
- ✅ **Interactive Dialogue Wizard** - Answer 4 simple questions (category, topic, turns, difficulty)
- ✅ **Automatic Dialogue Generation** - Creates natural UK English dialogue from templates
- ✅ **Complete Data Structure** - Generates blanks, answers, feedback, patterns, questions
- ✅ **Automatic Validation** - Structural, content, and TypeScript checks
- ✅ **Plain English Error Messages** - No technical jargon, clear fixes
- ✅ **Auto-Fix Common Issues** - Blank count mismatches, word limits, formatting
- ✅ **Seamless Integration** - Merges to staticData.ts, runs build, shows test URL

### Usage:
```bash
# Simple (Recommended)
# In Claude Code, type: "create a new scenario"

# Or run helper script
npm run create:scenario
```

### When to Use:
- ✅ Creating new original scenarios (no PDF)
- ✅ Quick prototyping and testing
- ✅ Non-technical users who prefer guided wizard
- ✅ When PDF extraction is overkill

### When to Use PDF Pipeline Instead:
- ✅ Extracting existing published materials (textbooks)
- ✅ Bulk migration from existing sources
- ✅ Content from PDFs with established dialogue

---

### 5. **Orchestrator-QA Agent** (Project Lead)
**File:** `orchestrator-qa/SKILL.md`

**Purpose:** Coordinate the complete pipeline, enforce quality gates, manage human approvals.

**Input:** PDF path or dialogue source
**Output:** Production-ready scenarios merged into staticData.ts

**10-Step Pipeline:**
1. Intake & Scoping - Estimate scope, get approval
2. PDF Extraction - Invoke pdf-extractor
3. Blank Insertion - Invoke blank-inserter
4. Content Validation - Invoke content-validator
5. Fix Loop - Address issues if needed
6. Scenario Transformation - Invoke scenario-transformer
7. Human Final Approval - Get explicit approval
8. Data Integration - Merge into staticData.ts
9. Build Verification - npm run build
10. Final QA Report - Generate metrics

**Key Responsibilities:**
- Enforce all quality gates
- Manage human-in-loop approvals
- Parallel processing coordination (4+ scenarios simultaneously)
- Error handling & recovery
- Build verification and bundle size monitoring
- Metrics & reporting (quality scores, intervention %)

---

## Pipeline Flow & Data Handoff

```
PDF Input
   │
   ▼
┌─────────────────────────────────────┐
│ PDF Extractor Agent                 │
│ (Detect dialogue format, extract)    │
└─────────────────────────────────────┘
   │
   ├─ Output: dialogue.json
   │  ├─ speaker_detected: string
   │  ├─ text: string
   │  ├─ confidence: 0.5-0.95
   │  └─ metadata: {turns, richness, notes}
   │
   ▼ (Orchestrator-QA approval gate)
┌─────────────────────────────────────┐
│ Blank Inserter Agent                │
│ (Extract phrases, score, insert)    │
└─────────────────────────────────────┘
   │
   ├─ Output: dialogue_blanked.json
   │  ├─ text_blanked: with ____
   │  ├─ blanks: [
   │  │    {position, primary_answer, alternatives, score}
   │  │  ]
   │  └─ metadata: {compliance, pedagogical_avg}
   │
   ▼ (Orchestrator-QA compliance gate)
┌─────────────────────────────────────┐
│ Content Validator Agent             │
│ (Run 7 validators, auto-fix HIGH)   │
└─────────────────────────────────────┘
   │
   ├─ Output: validation_report.json
   │  ├─ validators: {compliance, spelling, vocabulary, ...}
   │  ├─ auto_fixes_applied: [list]
   │  ├─ flags_human: [list]
   │  └─ overall_confidence: 0.70-0.99
   │
   ▼ (Orchestrator-QA validation gate)
   │ (If FAIL: return to Blank Inserter)
   │
┌─────────────────────────────────────┐
│ Scenario Transformer Agent          │
│ (Generate RoleplayScript code)       │
└─────────────────────────────────────┘
   │
   ├─ Output: RoleplayScript TypeScript
   │  ├─ id, title, category, scenario
   │  ├─ characters: {a, b}
   │  ├─ dialogues: [{speaker, text}]
   │  ├─ answerVariations: [{index, answer, alternatives}]
   │  └─ deepDiveInsights: [{index, category, insight}]
   │
   ▼ (Orchestrator-QA final approval gate)
┌─────────────────────────────────────┐
│ Orchestrator-QA: Merge & Build      │
│ (Merge to staticData.ts, verify)     │
└─────────────────────────────────────┘
   │
   ├─ npm run validate
   ├─ npm run build
   └─ Final report (metrics, quality scores)

Production-Ready Scenarios ✓
```

## Quality Metrics at Each Stage

| Stage | Metric | Target | Notes |
|-------|--------|--------|-------|
| Extraction | Confidence | ≥70% | Aim for ≥85% |
| Extraction | Dialogue Turns | ≥8 | Minimum viable |
| Blank Insertion | BUCKET_A Compliance | ≥80% (casual), ≥60% (academic) | Core pedagogical metric |
| Validation | Overall Confidence | ≥85% | All 7 validators passing |
| Validation | Flags for Human | <3 | Keep auto-fixes safe |
| Transformation | TypeScript Valid | 100% | Zero syntax errors |
| Pipeline | Human Intervention | ≤20% | Approval-only, not execution |
| Final | Data Integrity | 100% | Zero errors in npm run validate |
| Final | Bundle Size | <350 kB JS, <45 kB CSS (gzipped) | Performance gate |

## Integration with Existing Infrastructure

**Reuses:**
- `/services/staticData.ts` - Scenario storage
- `/services/constants.ts` - LOCKED_CHUNKS vocabulary
- `/services/languageChecker/` - Validation rules
- `npm run validate` - Data integrity hook
- `npm run build` - Production build

**Extends:**
- `/services/pdfChunker.ts` - Made universal (not just Headway)
- `/services/headwayPatternDetector.ts` → `/services/universalPatternDetector.ts` (generic)
- `/services/blankInserter.ts` - Already generic
- `/services/adaptiveChunkValidator.ts` - Configurable thresholds

## Usage Patterns

### Single Scenario Extraction
```bash
# Extract 1 unit from PDF (interactive, with approvals)
<invoke orchestrator-qa>

Input: "Source Materials/New Headway Advanced Unit 4.pdf"
Output: 1 scenario approved and merged
```

### Batch Extraction (Sequential)
```bash
# Extract 3 units one-by-one
<invoke orchestrator-qa>

Input: "Source Materials/New Headway Advanced Units 4-6.pdf"
Output: 3-8 scenarios (depending on richness)
```

### Parallel Extraction (Advanced)
```bash
# Extract 4 units in parallel
<invoke orchestrator-qa with parallel=4>

Workstream 1: Unit 4 (pdf-extractor → blank-inserter → validator → transformer)
Workstream 2: Unit 5 (same pipeline)
Workstream 3: Unit 6 (same pipeline)
Workstream 4: Unit 7 (same pipeline)

Orchestrator-QA: Collect results, batch approval, merge all
```

## Scalability & Reusability

### Works With
- ✓ New Headway Advanced PDFs (tested)
- ✓ Cambridge IELTS textbooks (universal pattern detection)
- ✓ Oxford English File (same architecture)
- ✓ Custom educational PDFs (any dialogue format)
- ✓ AI-generated dialogue (Claude, GPT-4)
- ✓ Manual dialogue input (use blank-inserter onward)

### Future Expansion
- **Phase 8**: Extract 10-20 scenarios from Headway (50-60 total)
- **Phase 9**: Ship production build with full QA
- **Future**: Add Cambridge, Oxford sources (100+ scenarios)
- **Roadmap**: Team collaboration, continuous improvement

## Notes & Troubleshooting

**If extraction fails:**
- Check PDF is readable (not encrypted)
- Verify dialogue has clear speaker labels
- Consider OCR fallback for scanned PDFs
- Contact human for manual input if all else fails

**If validation rejects scenario:**
- Review validation report carefully
- Check which validator(s) failed
- Decide: fix issues or skip scenario
- Don't force bad data into production

**If build fails post-merge:**
- Review TypeScript errors
- Check indices match answer variations
- Verify no Chinese characters or emoji in text
- Revert if necessary, investigate

**Performance:**
- Single scenario: ~5-10 minutes (end-to-end)
- 4 scenarios parallel: ~15-20 minutes (not 40+ minutes sequential)
- Build time: <2 minutes
- Validation: <30 seconds

---

**Questions?** See individual agent SKILL.md files for detailed specifications.
