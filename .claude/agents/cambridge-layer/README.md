# Cambridge Design Layer

## Overview

The Cambridge Design Layer is a **strategic learning design system** that sits above the existing operational extraction pipeline. It embodies Cambridge learning expertise across 4 specialized agents.

**Philosophy:** "Define what to teach (strategy), then execute with precision (operations)."

---

## Architecture

### Two Layers

```
┌─────────────────────────────────────────────┐
│     STRATEGIC LAYER (Cambridge Design)      │
│              (You are here)                 │
│                                             │
│  - Learning Architect (outcomes)            │
│  - Task Designer (scenarios)                │
│  - Chunk Curator (vocabulary)               │
│  - System Builder (scaffolding)             │
│  - Design Orchestrator (coordinator)        │
└─────────────────────────────────────────────┘
                      ↓
         [master_specification.json]
                      ↓
┌─────────────────────────────────────────────┐
│   OPERATIONAL LAYER (Extraction Pipeline)   │
│              (Existing system)              │
│                                             │
│  - PDF Extractor                           │
│  - Blank Inserter                          │
│  - Content Validator                       │
│  - Scenario Transformer                    │
│  - Orchestrator QA                         │
└─────────────────────────────────────────────┘
```

### Why Two Layers?

**Strategic Layer (New):**
- Runs **once per topic/CEFR level**
- Defines "what to teach" (learning design)
- Produces reusable specifications
- Involves **human expertise** (Cambridge methodology)

**Operational Layer (Existing):**
- Runs **per scenario** (many times)
- Executes "how to teach it" (PDF extraction → code)
- Automates repetitive extraction tasks
- Involves **minimal human approval**

**Example:** Design a B2 workplace negotiation course once, then use the design to extract 20 different scenarios.

---

## The 5 Agents

### 1. Learning Architect
**Purpose:** Define learning outcomes and success criteria

**Input:**
- Topic (e.g., "workplace negotiation")
- CEFR level (B2)
- Context

**Output:** `learning_outcomes.json`
- Communicative outcomes (observable behaviors)
- Success criteria (measurable)
- 4-stage progression model (Stage 1→4)
- Pragmatic functions needed

**Key Insight:** Focus on **what learners can DO**, not what they know.

**Example Output:**
```json
{
  "outcome": "Learner can soften disagreement without hostility",
  "success_criteria": "Uses softening phrase in ≥75% of disagreements",
  "progression": {
    "stage_1": "Recognize softeners (multiple choice)",
    "stage_4": "Use softeners spontaneously in authentic negotiation"
  }
}
```

**Start Here:** If you want to define what learners should achieve.

---

### 2. Task Designer
**Purpose:** Design authentic roleplay tasks with tension

**Input:**
- Learning outcomes (from learning-architect)
- Topic context

**Output:** `task_specification.json`
- Scenario details (setting, speakers, duration)
- Tension trigger (what creates conflict)
- Valid solution paths (multiple ways to succeed)
- Exit conditions (when task is complete)
- Pragmatic functions required

**Key Insight:** Good tasks have **unequal information** or **preference conflict** that forces genuine communication.

**Example Output:**
```json
{
  "scenario": "Negotiate project deadline",
  "tension": "Manager wants 1 week, you need 3 weeks",
  "valid_paths": [
    "Soften → propose timeline → agree",
    "Soften → ask questions → understand constraints → agree",
    "Soften → propose compromise → negotiate"
  ],
  "pragmatic_functions": ["soften_disagreement", "propose_alternative"]
}
```

**Start Here:** If you want to design realistic practice scenarios.

---

### 3. Chunk Curator
**Purpose:** Validate vocabulary using corpus linguistics

**Input:**
- Pragmatic functions (from task-designer)
- Register/context

**Output:** `core_repertoire.json`
- High-frequency chunks (>100/million from BNC Spoken)
- Organized by pragmatic function
- Closed set (~200-300 chunks total)
- BUCKET_A mapping for blank insertion

**Key Insight:** Teach **what real English speakers actually say**, not textbook artificial phrases.

**Corpus Data Files:**
- `bnc_spoken_2grams.txt` (2-word phrases)
- `bnc_spoken_3grams.txt` (3-word phrases)
- `bnc_spoken_4grams.txt` (4-word phrases)

**Example Output:**
```json
{
  "soften_disagreement": [
    { "text": "To be honest", "frequency": 487.3 },
    { "text": "I see your point, but", "frequency": 156.4 },
    { "text": "That's true, however", "frequency": 102.1 }
  ]
}
```

**Start Here:** If you want corpus-validated, high-frequency vocabulary.

---

### 4. System Builder
**Purpose:** Design scaffolding and blank placement logic

**Input:**
- Progression model (from learning-architect)
- Task specification (from task-designer)
- Core vocabulary (from chunk-curator)

**Output:** `scaffolding_config.json`
- Blank placement priorities (pragmatic functions first)
- Stage-specific support (fade from Stage 1→4)
- Feedback timing and tone
- Cognitive load management

**Key Insight:** **Scaffolding is invisible architecture.** When done right, learners don't notice the support.

**Example Output:**
```json
{
  "stage_1": {
    "blanks_percentage": 60,
    "blank_format": "multiple_choice",
    "support": "Model answer visible",
    "cognitive_load": "High scaffolding"
  },
  "stage_4": {
    "blanks_percentage": 0,
    "blank_format": "none",
    "support": "None",
    "cognitive_load": "No scaffolding"
  }
}
```

**Start Here:** If you want to design how support fades as learners improve.

---

### 5. Design Orchestrator
**Purpose:** Coordinate all 4 agents + validation + approvals

**Input:**
- Scenario specification
- Topic + CEFR level + context

**Output:** `master_specification.json`
- All 4 agent outputs packaged together
- Integration validation (everything is aligned)
- Approval gates (human sign-offs)
- Instructions for extraction pipeline

**Process:**
1. Run learning-architect → get learning_outcomes.json
2. Run task-designer → get task_specification.json
3. Run chunk-curator → get core_repertoire.json
4. Run system-builder → get scaffolding_config.json
5. Validate all 4 are aligned (no conflicts)
6. Get human approvals (4 gates, ~2 minutes total)
7. Package everything for extraction pipeline

**Example Workflow:**
```
User: "Design B2 workplace negotiation"
   ↓
Orchestrator: "Planning design..."
   ↓
Learning-architect: "Outcomes defined ✓"
   ↓
Task-designer: "Scenarios designed ✓"
   ↓
Chunk-curator: "Vocabulary curated ✓"
   ↓
System-builder: "Scaffolding planned ✓"
   ↓
Orchestrator: "All aligned ✓"
   ↓
User approvals: Gate 1 ✓, Gate 2 ✓, Gate 3 ✓, Gate 4 ✓
   ↓
Output: master_specification.json (ready for extraction)
```

**Start Here:** If you want a complete learning design for a topic.

---

## How to Use

### Quick Start: Full Design Workflow

```bash
# 1. Run the design orchestrator
# This coordinates all 4 agents automatically

User Request:
"Design a B2 workplace negotiation scenario.
Topic: Negotiate deadlines.
Duration: 5-10 minutes per roleplay.
Success: Both speakers reach agreement authentically."

Design Orchestrator Process:
1. Intake approval ("Proceed?") → User: Yes
2. Learning-architect executes → learning_outcomes.json created
3. Approval Gate 2 ("Good outcomes?") → User: Yes
4. Task-designer executes → task_specification.json created
5. Chunk-curator executes → core_repertoire.json created
6. Approval Gate 3 ("Good task + vocabulary?") → User: Yes
7. System-builder executes → scaffolding_config.json created
8. Approval Gate 4 ("Good scaffolding?") → User: Yes
9. Master specification created → master_specification.json
10. Ready for extraction pipeline

Output: All specifications ready for pdf-extractor → blank-inserter → etc.
```

### Using Individual Agents

**If you only need learning outcomes:**
```
→ Run learning-architect alone
→ Output: learning_outcomes.json
→ Use for: Course curriculum planning
```

**If you only need vocabulary validation:**
```
→ Run chunk-curator alone with pragmatic functions
→ Output: core_repertoire.json
→ Use for: Updating BUCKET_A vocabulary
```

**If you only need scaffolding strategy:**
```
→ Run system-builder alone with progression model + vocabulary
→ Output: scaffolding_config.json
→ Use for: Blank insertion strategy
```

---

## Integration with Extraction Pipeline

### Data Flow

```
master_specification.json (from Cambridge layer)
         ↓
    (contains 4 files)
         ↓
    ├── learning_outcomes.json
    │      ↓
    │   scenario-transformer uses for metadata
    │
    ├── task_specification.json
    │      ↓
    │   pdf-extractor uses for quality evaluation
    │
    ├── core_repertoire.json
    │      ↓
    │   blank-inserter uses as BUCKET_A source
    │      ↓
    │   (replaces hardcoded LOCKED_CHUNKS)
    │
    └── scaffolding_config.json
           ↓
        blank-inserter uses for stage-specific blanks
           ↓
        (applies pedagogical priorities)
```

### Modified Files

**1. blank-inserter** (MODIFIED)
- Instead of: Use LOCKED_CHUNKS (hardcoded)
- Now: Load core_repertoire.json from chunk-curator
- Instead of: Use generic pedagogical scoring
- Now: Apply stage-specific priorities from scaffolding_config.json

**2. scenario-transformer** (MODIFIED)
- Instead of: Auto-detect metadata
- Now: Populate from learning_outcomes.json
- Includes: Learning outcomes, success criteria, CEFR alignment

**3. pdf-extractor** (UNCHANGED)
- Still extracts dialogue from PDFs
- Can now use tension patterns from task_specification.json to score dialogue quality

---

## Quality Assurance

### Alignment Checks

The design-orchestrator validates:

1. **Outcomes ↔ Task:**
   - All outcomes required for task success? ✓
   - Task tests all outcomes? ✓

2. **Task ↔ Vocabulary:**
   - All task functions have vocabulary? ✓
   - Vocabulary covers all functions? ✓

3. **Vocabulary ↔ Scaffolding:**
   - Core chunks prioritized in blanks? ✓
   - Support fades appropriately? ✓

4. **Scaffolding ↔ Outcomes:**
   - Progression supports outcome achievement? ✓
   - Stage 4 allows authentic performance? ✓

**If any check FAILS:** Agent is asked to revise.

### Approval Gates

| Gate | Name | Approver | Approval Time |
|------|------|----------|---------------|
| 1 | Intake | User | Yes/No |
| 2 | Learning Design | User | 30 sec |
| 3 | Task & Vocabulary | User | 1 min |
| 4 | Scaffolding | User | 30 sec |
| **Total** | | | **~2 min** |

---

## Success Metrics

### Learning Layer Success
- ✅ All outcomes are observable (not vague)
- ✅ All success criteria are measurable
- ✅ Progression reduces cognitive load Stage 1→4
- ✅ Pragmatic functions align with CEFR level

### Task Layer Success
- ✅ Task has authentic tension (unequal info or preference conflict)
- ✅ Task requires negotiation (not yes/no response)
- ✅ Exit condition is natural and objective
- ✅ Native speaker would recognize as authentic

### Vocabulary Layer Success
- ✅ All chunks >100/million frequency
- ✅ All chunks pragmatically appropriate
- ✅ Register matches context
- ✅ Core repertoire is closed set (200-300 chunks)

### Scaffolding Layer Success
- ✅ Cognitive load decreases Stage 1→4
- ✅ Pragmatic functions always prioritized
- ✅ Feedback is non-judgmental
- ✅ Blank placement makes linguistic sense

### Integration Success
- ✅ No conflicts between components
- ✅ All 4 outputs aligned
- ✅ All approval gates passed
- ✅ Extraction pipeline can consume specifications

---

## File Structure

```
.claude/agents/cambridge-layer/
├── README.md (this file)
├── learning-architect/
│   ├── SKILL.md
│   └── examples/
├── task-designer/
│   ├── SKILL.md
│   └── examples/
├── chunk-curator/
│   ├── SKILL.md
│   ├── corpus-data/
│   │   ├── bnc_spoken_2grams.txt
│   │   ├── bnc_spoken_3grams.txt
│   │   └── bnc_spoken_4grams.txt
│   └── examples/
├── system-builder/
│   ├── SKILL.md
│   └── examples/
└── design-orchestrator/
    ├── SKILL.md
    └── examples/
```

---

## Outputs

Each agent produces a JSON specification:

| Agent | Output File | Purpose |
|-------|------------|---------|
| Learning Architect | `learning_outcomes.json` | Learning design specification |
| Task Designer | `task_specification.json` | Scenario + tension + functions |
| Chunk Curator | `core_repertoire.json` | Vocabulary + BUCKET_A mapping |
| System Builder | `scaffolding_config.json` | Blank placement + support logic |
| Design Orchestrator | `master_specification.json` | All 4 + validation + approvals |

All outputs are **JSON** (machine-readable) with embedded **documentation** (human-readable).

---

## Workflow Timing

| Phase | Agent | Duration | Bottleneck |
|-------|-------|----------|-----------|
| 1 | Intake | 5 min | User |
| 2 | Learning-architect | 5 min | Agent |
| 3 | Task-designer | 10 min | Agent |
| 4 | Chunk-curator | 5 min | Agent |
| 5 | System-builder | 10 min | Agent |
| 6 | Integration validation | 5 min | Agent |
| 7 | Approvals (Gates 2-4) | 2 min | User |
| 8 | Master specification | 5 min | Agent |
| **Total** | | **~45 minutes** | **Agent** |

**Key:** Design layer is fast enough for strategic planning (once per topic). Extraction pipeline runs frequently (once per scenario).

---

## Design Philosophy

### Core Principles

1. **Learning Design First, Vocabulary Second**
   - Define communicative outcomes, not vocabulary lists
   - Vocabulary serves outcomes, not the reverse

2. **Authentic Tension, Not Contrived Tasks**
   - Use real information gaps or preference conflicts
   - Would a native speaker recognize this scenario?

3. **Corpus-Validated Vocabulary**
   - Teach what real English speakers say
   - High frequency (>100/million), evidence-based
   - No made-up textbook phrases

4. **Scaffolding as Invisible Architecture**
   - Support fades as learners improve
   - Feedback is encouraging, non-judgmental
   - Goal: Authentic competence, not test scores

5. **Strategic Layer + Operational Layer**
   - Design once (strategic), execute many times (operational)
   - Clean separation of concerns
   - Reusable specifications across scenarios

---

## Troubleshooting

### Issue: Agent produces misaligned output
**Solution:** Design-orchestrator detects and requests revision

### Issue: Task needs function not in vocabulary
**Solution:** Chunk-curator re-analyzes corpus OR task-designer adjusts task

### Issue: Scaffolding doesn't reduce cognitive load
**Solution:** System-builder revises support fading OR learning-architect adjusts progression

### Issue: User rejects outcomes
**Solution:** Learning-architect revises, all downstream agents update

**General Process:**
1. Detect misalignment
2. Identify responsible agent
3. Request revision
4. Re-validate
5. Continue workflow

---

## Related Documentation

- `../.../SKILL.md` - Individual agent specifications
- `../.../README.md` (main agents folder) - Entire agent system
- `.claude/settings.json` - Agent registration + configuration
- `.../corpus-data/` - BNC Spoken frequency data

---

## Questions?

Each agent has detailed SKILL.md documentation:
- **learning-architect/SKILL.md** - Learning design methodology
- **task-designer/SKILL.md** - Task-based language teaching
- **chunk-curator/SKILL.md** - Corpus linguistics validation
- **system-builder/SKILL.md** - Pedagogical scaffolding
- **design-orchestrator/SKILL.md** - Workflow coordination

Start with the agent most relevant to your question.
