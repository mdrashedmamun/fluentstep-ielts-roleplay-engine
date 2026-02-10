# Cambridge Design Layer - Complete Implementation Guide

## Executive Summary

The Cambridge Design Layer is a **strategic learning design system** that has been integrated into the FluentStep extraction pipeline. It consists of **5 specialized agents** that embody Cambridge learning expertise and work together to create production-ready learning specifications.

**Key Achievement:** You now have a **two-layer system**:
- **Strategic Layer** (Cambridge Design) - Define WHAT to teach
- **Operational Layer** (Extraction Pipeline) - Execute HOW to teach it

---

## What Was Implemented

### 5 New Agents

| Agent | Purpose | Model | Input | Output |
|-------|---------|-------|-------|--------|
| **learning-architect** | Define learning outcomes + success criteria | Sonnet | Topic, CEFR level | `learning_outcomes.json` |
| **task-designer** | Design roleplay tasks with authentic tension | Sonnet | Learning outcomes | `task_specification.json` |
| **chunk-curator** | Validate vocabulary using corpus linguistics | Haiku | Pragmatic functions | `core_repertoire.json` |
| **system-builder** | Design scaffolding + blank placement logic | Sonnet | Progression + task + vocab | `scaffolding_config.json` |
| **design-orchestrator** | Coordinate all agents + validation + approvals | Opus | Scenario specification | `master_specification.json` |

### Supporting Files

- **5 SKILL.md files** - Detailed agent specifications
- **Corpus data files** - BNC Spoken frequency lists (2-, 3-, 4-grams)
- **Example outputs** - Sample JSON from each agent
- **README.md** - Cambridge layer architecture guide

---

## How It Works

### Quick Start: Complete Design Workflow

```
User Request:
"Design a B2 workplace negotiation scenario"
     ↓
Design Orchestrator:
1. Run learning-architect → Define outcomes + progression
2. Run task-designer → Design scenario with tension
3. Run chunk-curator → Find high-frequency vocabulary
4. Run system-builder → Design blank placement + scaffolding
5. Validate alignment across all 4 agents
6. Get human approvals (4 gates, ~2 minutes)
7. Package as master_specification.json
     ↓
Ready for Extraction Pipeline:
- pdf-extractor uses task_specification for quality
- blank-inserter uses core_repertoire.json + scaffolding_config
- scenario-transformer uses learning_outcomes for metadata
- orchestrator-qa executes with design context
     ↓
Production-Ready Scenario:
Complete roleplay with learning design built in
```

### Timeline
- **Design Phase:** ~45 minutes (once per topic/CEFR level)
- **Extraction Phase:** ~15 minutes per scenario (using design)
- **ROI:** Design 1 specification, extract 20+ scenarios

---

## The 5 Agents Explained

### 1. Learning Architect
**Defines:** What learners should achieve

**Example Output:**
```json
{
  "outcomes": [
    "Can soften disagreement without hostility",
    "Can repair conversational tension",
    "Can propose alternatives to reach agreement"
  ],
  "success_criteria": {
    "fluency": "Pauses decrease 30% Stage 1→3",
    "pragmatic_accuracy": "Uses softeners in ≥75% of disagreements"
  },
  "progression": {
    "stage_1": "Recognize softeners (multiple choice)",
    "stage_4": "Use softeners spontaneously (authentic negotiation)"
  }
}
```

**Start Here If:** You want to define learning goals for a course

---

### 2. Task Designer
**Designs:** Realistic scenarios with authentic tension

**Example Output:**
```json
{
  "scenario": "Negotiate project deadline",
  "tension_trigger": "Manager wants 1 week, you need 3 weeks",
  "valid_paths": [
    "Soften → propose → agree",
    "Soften → ask questions → propose",
    "Soften → negotiate compromise"
  ],
  "pragmatic_functions": [
    "soften_disagreement",
    "propose_alternative"
  ]
}
```

**Start Here If:** You want authentic practice scenarios, not artificial dialogues

---

### 3. Chunk Curator
**Validates:** Vocabulary using corpus linguistics

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

**Start Here If:** You want corpus-validated, high-frequency vocabulary

---

### 4. System Builder
**Designs:** Scaffolding + blank placement logic

**Example Output:**
```json
{
  "stage_1": { "blanks": 60, "support": "multiple_choice" },
  "stage_2": { "blanks": 45, "support": "word_prompts" },
  "stage_3": { "blanks": 20, "support": "situational_cues" },
  "stage_4": { "blanks": 0, "support": "none" }
}
```

**Start Here If:** You want to design how support fades as learners improve

---

### 5. Design Orchestrator
**Coordinates:** All 4 agents + validation + approvals

**Example Output:**
```json
{
  "components": [
    "learning_outcomes.json ✓",
    "task_specification.json ✓",
    "core_repertoire.json ✓",
    "scaffolding_config.json ✓"
  ],
  "alignment_checks": "ALL PASS ✓",
  "approval_gates": "1/1/1/1 APPROVED ✓",
  "ready_for_extraction": true
}
```

**Start Here If:** You want a complete learning design for a topic

---

## Using the System

### Option 1: Full Design (Recommended)
```bash
# Run design-orchestrator
# Provides: Complete learning specification + all 4 components + approvals
# Time: ~45 minutes
# Output: master_specification.json (ready for extraction)
```

### Option 2: Individual Agents
```bash
# If you only need learning outcomes:
→ Run learning-architect alone

# If you only need task design:
→ Run task-designer alone (provide learning_outcomes.json)

# If you only need corpus validation:
→ Run chunk-curator alone (provide pragmatic functions)

# If you only need scaffolding:
→ Run system-builder alone (provide all inputs)
```

---

## Integration with Extraction Pipeline

### How the Two Layers Work Together

```
STRATEGIC LAYER (Cambridge Design)
↓
master_specification.json (4 files)
├── learning_outcomes.json
├── task_specification.json
├── core_repertoire.json
└── scaffolding_config.json
↓
OPERATIONAL LAYER (Extraction Pipeline)
↓
pdf-extractor
  ↓ (uses task_specification for quality)
blank-inserter
  ↓ (uses core_repertoire + scaffolding_config)
content-validator
  ↓ (runs 7 validators)
scenario-transformer
  ↓ (uses learning_outcomes for metadata)
orchestrator-qa
  ↓
Production-Ready Scenario
  ↓
staticData.ts
```

### Modified Files

**blank-inserter** - Now loads vocabulary from chunk-curator instead of hardcoded
**scenario-transformer** - Now includes learning metadata from learning-architect
**orchestrator-qa** - Can now reference task_specification for validation

---

## Example Workflow

### Scenario: Design B2 Workplace Negotiation

**Step 1: Intake (User)**
```
User: "Design a B2 workplace negotiation scenario.
Topic: Negotiate deadlines. Duration: 5-10 min per stage.
Success: Both speakers reach authentic agreement."

Orchestrator: "Got it. Proceeding with design."
```

**Step 2: Learning Design (5 min)**
```
learning-architect generates:
- 3 communicative outcomes (soften, repair, propose)
- 4-stage progression (recognition → authentic task)
- Success metrics (fluency, pragmatics, retention)
```

**Step 3: Task Design (10 min)**
```
task-designer generates:
- Scenario: Manager wants 1 week, learner needs 3 weeks
- Tension: Real preference conflict
- Valid paths: 4 different negotiation strategies
- Functions: Softening, proposing, asking, repairing
```

**Step 4: Vocabulary Curation (5 min)**
```
chunk-curator generates:
- 15 softening phrases (all >100/million frequency)
- 12 proposing phrases
- 11 clarifying phrases
- 10 repair phrases
Total: 48 high-frequency chunks (corpus-validated)
```

**Step 5: Scaffolding Design (10 min)**
```
system-builder generates:
- Stage 1: 60% blanks (multiple choice)
- Stage 2: 45% blanks (word prompts)
- Stage 3: 20% blanks (situational cues)
- Stage 4: 0% blanks (authentic task)
- Feedback timing: Immediate → Delayed
```

**Step 6: Validation & Approvals (5 min)**
```
design-orchestrator validates:
- Outcomes ↔ Task ✓
- Task ↔ Vocabulary ✓
- Vocabulary ↔ Scaffolding ✓
- Scaffolding ↔ Outcomes ✓

User approvals:
- Gate 2: Learning outcomes? "Yes" ✓
- Gate 3: Task & vocabulary? "Yes" ✓
- Gate 4: Scaffolding? "Yes" ✓

Orchestrator: "All approved. Ready for extraction."
```

**Step 7: Extraction Pipeline**
```
Now run existing pipeline:
1. pdf-extractor - Extract dialogue
2. blank-inserter - Use core_repertoire.json + scaffolding
3. content-validator - Run validators
4. scenario-transformer - Add learning metadata
5. orchestrator-qa - Final approval & merge
```

**Result:** Production-ready B2 workplace negotiation scenario with:
- Authentic task design
- Corpus-validated vocabulary
- Pedagogical scaffolding
- Learning outcomes built-in

---

## File Structure

```
fluentstep_-ielts-roleplay-engine/
├── .claude/
│   ├── agents/
│   │   ├── cambridge-layer/
│   │   │   ├── README.md                                    [Architecture guide]
│   │   │   ├── learning-architect/
│   │   │   │   ├── SKILL.md                                [Agent specification]
│   │   │   │   └── example_learning_outcomes.json          [Sample output]
│   │   │   ├── task-designer/
│   │   │   │   ├── SKILL.md
│   │   │   │   └── example_task_specification.json
│   │   │   ├── chunk-curator/
│   │   │   │   ├── SKILL.md
│   │   │   │   ├── corpus-data/
│   │   │   │   │   ├── bnc_spoken_2grams.txt               [Corpus data]
│   │   │   │   │   ├── bnc_spoken_3grams.txt
│   │   │   │   │   └── bnc_spoken_4grams.txt
│   │   │   │   └── example_core_repertoire.json
│   │   │   ├── system-builder/
│   │   │   │   ├── SKILL.md
│   │   │   │   └── examples/
│   │   │   └── design-orchestrator/
│   │   │       ├── SKILL.md
│   │   │       └── example_master_specification.json       [Master output]
│   │   ├── pdf-extractor/                                   [Existing - unchanged]
│   │   ├── blank-inserter/                                  [Existing - modified for new vocab]
│   │   └── orchestrator-qa/                                 [Existing - unchanged]
│   └── settings.json                                        [Updated with 5 new agents]
├── CAMBRIDGE_DESIGN_LAYER.md                               [This file]
└── ... rest of project
```

---

## Core Principles

### 1. Learning Design First, Vocabulary Second
- Define **communicative outcomes**, not vocabulary lists
- Vocabulary serves the outcomes
- Example: "Practice softening disagreement" (not "Learn 50 softening phrases")

### 2. Authentic Tension, Not Contrived Tasks
- Real information gaps or preference conflicts
- Would a native speaker recognize this scenario?
- Example: Manager-employee deadline conflict (not "Order coffee")

### 3. Corpus-Validated Vocabulary
- Teach what real English speakers actually say
- High frequency (>100/million from BNC Spoken)
- Evidence-based, not intuition
- Example: "To be honest" (487/million) vs. "I must respectfully demur" (5/million)

### 4. Scaffolding as Invisible Architecture
- Support fades as learners improve
- Feedback is encouraging, non-judgmental
- Goal: Authentic competence, not test scores
- Example: Stage 1 (multiple choice) → Stage 4 (unrehearsed negotiation)

### 5. Strategic + Operational Separation
- Design once (strategic layer) → Execute many times (operational layer)
- Clean separation of concerns
- Reusable specifications
- Example: Design 1 B2 negotiation → Extract 20+ workplace scenarios

---

## Success Metrics

### Learning Layer Success
- ✅ All outcomes are observable (not vague)
- ✅ All success criteria are measurable
- ✅ Progression reduces cognitive load Stage 1→4
- ✅ Pragmatic functions align with CEFR level

### Task Layer Success
- ✅ Task has authentic tension
- ✅ Task requires negotiation
- ✅ Exit condition is clear
- ✅ Native speaker recognizes as authentic

### Vocabulary Layer Success
- ✅ All chunks >100/million
- ✅ Chunks pragmatically appropriate
- ✅ Register matches context
- ✅ Core repertoire is closed set (200-300 chunks)

### Scaffolding Layer Success
- ✅ Cognitive load decreases Stage 1→4
- ✅ Pragmatic functions prioritized
- ✅ Feedback is non-judgmental
- ✅ Blank placement is linguistically sensible

### Integration Success
- ✅ No conflicts between components
- ✅ All alignments validated
- ✅ All approvals obtained
- ✅ Extraction pipeline consumes specifications

---

## Quality Assurance

### Alignment Checks
The design-orchestrator validates:
1. **Outcomes ↔ Task** - All outcomes required for task success
2. **Task ↔ Vocabulary** - All task functions have vocabulary
3. **Vocabulary ↔ Scaffolding** - Core chunks prioritized in blanks
4. **Scaffolding ↔ Outcomes** - Progression supports outcome achievement

**If any check fails:** Agent is requested to revise

### Approval Gates
| Gate | Name | Time | Approver |
|------|------|------|----------|
| 1 | Intake | Yes/No | User |
| 2 | Learning Design | 30 sec | User |
| 3 | Task & Vocabulary | 1 min | User |
| 4 | Scaffolding | 30 sec | User |
| **Total** | | **~2 min** | |

---

## Troubleshooting

### Problem: Agent produces misaligned output
**Solution:** Design-orchestrator detects and requests revision

### Problem: Task needs function not in vocabulary
**Solution:** Chunk-curator re-analyzes corpus OR task-designer adjusts task

### Problem: Scaffolding doesn't reduce cognitive load
**Solution:** System-builder revises support fading OR learning-architect adjusts progression

### Problem: User rejects learning outcomes
**Solution:** Learning-architect revises, all downstream agents automatically update

---

## Next Steps

### To Create Your First Design

```bash
# 1. Request design-orchestrator to coordinate all agents
# Example input:
{
  "topic": "restaurant ordering",
  "cefr_level": "A2",
  "context": "Tourist ordering food at restaurant",
  "success_criteria": "Can order item and handle menu questions"
}

# 2. Design-orchestrator will:
#    - Run learning-architect
#    - Run task-designer
#    - Run chunk-curator
#    - Run system-builder
#    - Validate alignment
#    - Request approvals
#    - Output master_specification.json

# 3. Use master_specification.json with extraction pipeline
#    - pdf-extractor extracts dialogue
#    - blank-inserter uses core_repertoire + scaffolding
#    - scenario-transformer adds learning metadata
#    - orchestrator-qa finalizes
```

### To Learn More

**Detailed Documentation:**
- `.claude/agents/cambridge-layer/README.md` - Layer architecture
- `.claude/agents/cambridge-layer/learning-architect/SKILL.md` - Learning design methodology
- `.claude/agents/cambridge-layer/task-designer/SKILL.md` - TBLT principles
- `.claude/agents/cambridge-layer/chunk-curator/SKILL.md` - Corpus linguistics
- `.claude/agents/cambridge-layer/system-builder/SKILL.md` - Pedagogical scaffolding
- `.claude/agents/cambridge-layer/design-orchestrator/SKILL.md` - Workflow coordination

**Example Outputs:**
- `learning-architect/example_learning_outcomes.json`
- `task-designer/example_task_specification.json`
- `design-orchestrator/example_master_specification.json`

---

## FAQ

### Q: Do I need to use all 5 agents?
**A:** No. Design-orchestrator coordinates all 5, but you can run individual agents if needed. Most common: Run design-orchestrator once for complete design.

### Q: How often do I run the design layer?
**A:** Once per **topic/CEFR level**. Then use the design to extract 20+ scenarios.

### Q: How does this affect the existing pipeline?
**A:** The extraction pipeline (pdf-extractor → blank-inserter → etc.) still works. Design layer provides inputs that make it **smarter** (better vocabulary, better scaffolding).

### Q: Can I use this for other languages?
**A:** The methodology is universal, but corpus data is language-specific. You'd need BNC-equivalent data for your language.

### Q: What if I don't agree with the agent's output?
**A:** Design layer has 4 approval gates. You can reject any component and request revisions.

### Q: How long does design take?
**A:** ~45 minutes for complete design (once per topic). Then extraction takes 15 min per scenario.

---

## Summary

The Cambridge Design Layer transforms your extraction pipeline from **operational** (execute tasks well) to **strategic + operational** (understand learning goals deeply, then execute well).

**You now have:**
- ✅ 5 specialized agents embodying Cambridge expertise
- ✅ 4 validated specification outputs per design
- ✅ Corpus-validated, high-frequency vocabulary
- ✅ Pedagogically sound scaffolding
- ✅ Clear integration with extraction pipeline

**Ready to design learning experiences, not just extract dialogues.**

---

## Support

For questions about specific agents, see their SKILL.md files:
- Learning architect? → `learning-architect/SKILL.md`
- Task design? → `task-designer/SKILL.md`
- Vocabulary? → `chunk-curator/SKILL.md`
- Scaffolding? → `system-builder/SKILL.md`
- Workflow? → `design-orchestrator/SKILL.md`

For architecture questions, see: `.claude/agents/cambridge-layer/README.md`
