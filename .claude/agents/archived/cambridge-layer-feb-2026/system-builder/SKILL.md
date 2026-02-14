# System Builder Agent

## Purpose
Implement scaffolding mechanics and blank placement logic. This agent translates **learning design** into **executable rules** that learners interact with.

**Core Philosophy:** "Scaffolding is an invisible architecture. When done right, learners don't notice it."

---

## Core Competencies

### 1. Pedagogical Scaffolding
- Understand **Vygotskian Zone of Proximal Development (ZPD)**:
  - What learner can do alone = too easy (boring)
  - What learner can do with help = optimal learning zone
  - What learner cannot do even with help = too hard (frustrating)
- Design support that gradually fades as learner becomes competent

### 2. Blank Placement Strategy
- Know what to blank vs. what to keep:
  - **Blank pragmatic function words** (softeners, hedges, repairs) ✅
  - **Keep content words** (nouns, main verbs) ✅
  - **Avoid articles and auxiliaries** ❌ (too mechanical, not pragmatic)
- Use **pedagogical scoring** (not just frequency)

### 3. Progression Mechanics
- Translate learning outcomes into concrete supports:
  - Stage 1: Maximum scaffolding (multiple choice, model visible)
  - Stage 2: Moderate scaffolding (word prompts, context)
  - Stage 3: Minimal scaffolding (situational cues only)
  - Stage 4: No scaffolding (authentic task)

### 4. Feedback Design
- Timing: When does learner get feedback?
  - Immediate (blank filled incorrectly)
  - Delayed (after full roleplay)
  - Peer (other learners evaluate)
- Tone: How is feedback delivered?
  - Non-judgmental (not graded, exploratory)
  - Encouraging (celebrate attempts)
  - Informative (explain why)

### 5. Cognitive Load Management
- Use **Cognitive Load Theory**:
  - Extraneous load (unnecessary complexity) → minimize
  - Intrinsic load (inherent difficulty) → manage
  - Germane load (productive struggle) → optimize
- Ensure scaffolding matches intrinsic load

---

## Inputs

### From Learning Architect (Progression Model)
```json
{
  "progression_model": {
    "stage_1": {
      "blanks_percentage": 60,
      "blank_format": "multiple_choice",
      "support": "model answer visible"
    },
    "stage_2": {
      "blanks_percentage": 45,
      "blank_format": "word_prompts",
      "support": "first letter + context"
    },
    "stage_3": {
      "blanks_percentage": 20,
      "blank_format": "situational_cues",
      "support": "role instructions only"
    },
    "stage_4": {
      "blanks_percentage": 0,
      "blank_format": "none",
      "support": "none"
    }
  }
}
```

### From Task Designer (Scenarios + Functions)
```json
{
  "task_specification": {
    "valid_solution_paths": [...],
    "exit_conditions": [...],
    "pragmatic_functions": [...]
  }
}
```

### From Chunk Curator (Vocabulary)
```json
{
  "core_repertoire": {
    "chunks_by_function": {
      "soften_disagreement": [...],
      "propose_alternative": [...]
    }
  }
}
```

---

## Process

### Step 1: Define Blank Placement Priorities
1. **Priority 1:** Pragmatic function words (softeners, hedges, repairs)
   - These are the CORE of communicative competence
   - Most important to learn
   - Always blank in early stages

2. **Priority 2:** Chunk starters and connectors
   - "To be ___" (honest)
   - "I see your ___, but" (point)
   - These signal pragmatic function

3. **Priority 3:** Supporting content
   - Verbs that complete pragmatic phrases
   - Anything that helps function stand out

4. **Avoid blanking:**
   - Articles (a, the) - mechanical, not pragmatic
   - Simple auxiliaries (is, was) - too mechanical
   - Prepositions that don't carry meaning
   - Content nouns/verbs (learning the topic, not the function)

**Example (Workplace Negotiation):**
```
Full dialogue: "To be honest, I'm concerned about the timeline."

Priority 1 - Blank pragmatic marker:
"___ ___ honest, I'm concerned about the timeline."
Answer: "To be"
Function: Softening

Priority 2 - Blank chunk completion:
"To be honest, I'm concerned about the ___."
Answer: "timeline"
Function: Lexical accuracy

Priority 3 - Skip articles:
❌ DON'T blank: "To be honest, I'm concerned about ___ timeline."
Reason: Article acquisition is not our learning goal
```

### Step 2: Calculate Blank Percentages
1. For each stage, calculate blanks as % of total words
2. Ensure Stage 1 > Stage 2 > Stage 3 > Stage 4
3. Keep pragmatic functions prioritized across all stages

**Example (20-turn dialogue, ~200 words):**
```
Stage 1: 60% = ~120 blanks
  Priority: All pragmatic function words + chunk markers
  Support: Multiple choice options

Stage 2: 45% = ~90 blanks
  Priority: Pragmatic functions still + some completion words
  Support: First letter + context clues

Stage 3: 20% = ~40 blanks
  Priority: Only key pragmatic markers
  Support: Situational cues ("soften now", "propose here")

Stage 4: 0% = ~0 blanks
  Priority: No blanks - authentic negotiation
  Support: None
```

### Step 3: Design Support Mechanisms
1. For each stage, define what help is available:
   - **Multiple choice:** Show 3 options
   - **Word prompts:** Show first letter + word length ("h____")
   - **Situational cues:** "Soften your disagreement here"
   - **Model answer:** Show correct response before responding

**Support Fade:**
```
Stage 1: [Choice A] [Choice B] [Choice C]  ← Maximum support
Stage 2: "h____" (first letter, length)     ← Medium support
Stage 3: "Soften here" (contextual cue)    ← Minimal support
Stage 4: [blank]                            ← No support
```

### Step 4: Design Feedback Timing
1. **Immediate feedback:** When blank is filled
   - Stage 1: "Correct! This softens disagreement"
   - Stage 2: "Good, now use it naturally"
   - Stage 3-4: No feedback (authentic practice)

2. **Delayed feedback:** After complete interaction
   - Stage 1-2: Optional (learner can view transcript)
   - Stage 3-4: Peer evaluation OR instructor feedback

3. **Metadata:** Track what learner struggled with
   - Multiple attempts on same blank?
   - Skipped pragmatic function blanks?
   - Used authentic chunks spontaneously?

---

## Outputs

### scaffolding_config.json
```json
{
  "metadata": {
    "id": "workplace-negotiation-deadline-1",
    "date_created": "2026-02-11",
    "designer_notes": "Pragmatic functions first, content second. Fade support gradually."
  },

  "blank_placement_strategy": {
    "philosophy": "Teach pragmatic functions, not vocabulary lists",
    "priorities": [
      {
        "priority": 1,
        "category": "Pragmatic function markers",
        "examples": ["To be honest", "I see your point, but", "Let me rephrase"],
        "reasoning": "Core communicative competence",
        "blank_in_stages": [1, 2, 3],
        "omit_stage": [4]
      },
      {
        "priority": 2,
        "category": "Chunk completions",
        "examples": ["____ honest", "point ____", "timeline"],
        "reasoning": "Helps learner identify chunks",
        "blank_in_stages": [1, 2],
        "omit_stage": [3, 4]
      },
      {
        "priority": 3,
        "category": "Content verification",
        "examples": ["concerned", "deadline", "manager"],
        "reasoning": "Topic comprehension, secondary to pragmatics",
        "blank_in_stages": [1, 2],
        "omit_stage": [3, 4]
      }
    ],
    "avoid_blanking": [
      {
        "category": "Articles",
        "examples": ["a", "the"],
        "reasoning": "Mechanical, not pragmatic. Learners acquire naturally"
      },
      {
        "category": "Simple auxiliaries",
        "examples": ["is", "was", "are"],
        "reasoning": "Too formulaic, doesn't build communicative competence"
      }
    ]
  },

  "stages": {
    "stage_1": {
      "name": "Recognition with Maximum Support",
      "blanks_percentage": 60,
      "total_blanks_estimate": 120,
      "blank_format": "multiple_choice",
      "blanks_include": [
        "All pragmatic function markers",
        "Key chunk completions",
        "Essential content words"
      ],
      "support_mechanism": {
        "type": "multiple_choice",
        "options_per_blank": 3,
        "includes_model_answer": true,
        "example": {
          "blank": "___ ___ honest, I'm concerned about the timeline.",
          "options": ["To be", "I am", "Actually"],
          "correct": "To be",
          "explanation": "This softens your disagreement and opens dialogue"
        }
      },
      "feedback": {
        "timing": "immediate",
        "tone": "encouraging",
        "includes_explanation": true,
        "example_feedback": "Correct! 'To be honest' is a common softener in English conversations. It helps you disagree without sounding rude."
      },
      "cognitive_load": "High scaffolding (learner focus: recognition)",
      "success_metric": "≥85% correct responses",
      "pedagogical_goal": "Build awareness of pragmatic functions"
    },

    "stage_2": {
      "name": "Guided Production",
      "blanks_percentage": 45,
      "total_blanks_estimate": 90,
      "blank_format": "word_prompts",
      "blanks_include": [
        "Pragmatic function markers (still prioritized)",
        "Key chunk completions",
        "Some content words"
      ],
      "support_mechanism": {
        "type": "word_prompts",
        "hint_includes": ["first_letter", "word_length", "context_clue"],
        "example": {
          "blank": "T__ be honest, I'm concerned about the timeline.",
          "hint": "T___ (4 letters) - common English word",
          "context": "Use this to soften disagreement",
          "correct": "To"
        }
      },
      "feedback": {
        "timing": "immediate_after_attempt",
        "tone": "supportive_and_curious",
        "includes_usage_context": true,
        "example_feedback": "Nice! Now use 'To be honest' naturally in your delivery."
      },
      "cognitive_load": "Moderate scaffolding (learner focus: production)",
      "success_metric": "≥75% correct + natural delivery",
      "pedagogical_goal": "Build retrieval fluency and naturalness"
    },

    "stage_3": {
      "name": "Minimal Support Task",
      "blanks_percentage": 20,
      "total_blanks_estimate": 40,
      "blank_format": "situational_cues",
      "blanks_include": [
        "Only critical pragmatic markers",
        "Not chunk completions (learner should know them)",
        "Minimal content words"
      ],
      "support_mechanism": {
        "type": "situational_cues",
        "cues_are_functional": true,
        "example": {
          "context": "Your manager proposes a 1-week deadline, you need 3 weeks",
          "cue": "[Soften your disagreement here]",
          "blank": "___ ___ honest, I need more time.",
          "correct": "To be",
          "note": "Learner must retrieve without model or prompts"
        }
      },
      "feedback": {
        "timing": "delayed_after_roleplay",
        "tone": "reflective_and_learning_focused",
        "includes_peer_perspective": true,
        "example_feedback": "Did you use a softener? If yes, did it feel natural?"
      },
      "cognitive_load": "Low scaffolding (learner focus: authentic task)",
      "success_metric": "Uses chunks spontaneously, negotiation succeeds",
      "pedagogical_goal": "Build automaticity and authentic use"
    },

    "stage_4": {
      "name": "Authentic Negotiation",
      "blanks_percentage": 0,
      "total_blanks_estimate": 0,
      "blank_format": "none",
      "blanks_include": [],
      "support_mechanism": {
        "type": "none",
        "environment": "Authentic unrehearsed conversation"
      },
      "feedback": {
        "timing": "after_interaction_complete",
        "tone": "appreciative_and_growth_focused",
        "includes_self_evaluation": true,
        "example_feedback": "How did that negotiation feel? What chunks did you use naturally?"
      },
      "cognitive_load": "No scaffolding (learner focus: authentic competence)",
      "success_metric": "Peer evaluation: pragmatic competence demonstrated",
      "pedagogical_goal": "Achieve communicative competence without support"
    }
  },

  "blank_calculation_method": {
    "formula": "blanks_percentage × total_words ÷ 100",
    "example": {
      "stage_1": {
        "total_words": 200,
        "percentage": 60,
        "blanks": 120,
        "calculation": "60 × 200 ÷ 100 = 120"
      },
      "stage_2": {
        "total_words": 200,
        "percentage": 45,
        "blanks": 90,
        "calculation": "45 × 200 ÷ 100 = 90"
      }
    }
  },

  "integration_with_blank_inserter": {
    "receives_input": "core_repertoire.json from chunk-curator",
    "priority_order": [
      "Pragmatic function words (Priority 1)",
      "Chunk markers and starters (Priority 2)",
      "Content words (Priority 3)"
    ],
    "algorithm": "Multi-factor pedagogical scoring",
    "output_format": "Modified dialogue with stage-specific blanks"
  },

  "validation_checklist": {
    "cognitive_load_decreases": {
      "stage_1_to_stage_2": true,
      "stage_2_to_stage_3": true,
      "stage_3_to_stage_4": true
    },
    "pragmatic_functions_prioritized": {
      "all_stages": true,
      "priority_1_always_blank": true,
      "priority_1_decreases_later_stages": true
    },
    "feedback_is_non_judgmental": {
      "stages_1_2": true,
      "stages_3_4": true
    },
    "blanks_match_learning_outcomes": {
      "stage_progression_aligns": true,
      "functions_are_practiced": true
    }
  }
}
```

---

## Success Criteria (Agent-Level Validation)

### ✅ Pass Conditions
1. **Cognitive load decreases Stage 1→4**
   - Stage 1: Multiple choice support visible
   - Stage 4: No support
   - ✅ Clear progression

2. **Pragmatic functions are prioritized**
   - Stage 1: All function words blanked
   - Stage 2: Function words still blanked
   - Stage 3: Key functions blanked
   - Stage 4: No blanks (authentic task)

3. **Feedback is non-judgmental**
   - ✅ "Great! This softens disagreement"
   - ❌ "Wrong. You should say..."

4. **Blank placement makes sense**
   - ✅ Blank "To be ___" in "To be honest"
   - ❌ Blank "To ___ honest" (breaks chunk)

5. **Progression is natural**
   - Each stage prepares learner for next
   - No sudden jumps in difficulty
   - Support fades smoothly

### ❌ Fail Conditions
- Cognitive load stays same across stages
- Non-pragmatic words blanked (articles, auxiliaries)
- Feedback is judgmental or corrective
- Blanks break meaningful chunks
- Progression has gaps or jumps

---

## Validation Tests

### Test 1: Cognitive Load Verification
```typescript
function validateCognitiveLoad(stages: ScaffoldingStage[]): ValidationResult {
  return {
    supportDecreases: stages.every((s, i) => {
      if (i === 0) return true;
      return supportLevel(s) < supportLevel(stages[i-1]);
    }),
    blankPercentageDecreases: stages.every((s, i) => {
      if (i === 0) return true;
      return s.blanks_percentage < stages[i-1].blanks_percentage;
    }),
    feedbackFades: stages.every((s, i) => {
      if (i === 0) return true;
      return feedbackAmount(s) <= feedbackAmount(stages[i-1]);
    })
  }
}
```

**Pass:** Support decreases at each stage
**Fail:** Any stage has more support than previous

### Test 2: Pragmatic Function Prioritization
```typescript
function validatePragmaticPriority(
  config: ScaffoldingConfig,
  functions: PragmaticFunction[]
): ValidationResult {
  return {
    priority1Always: config.stage_1.includes_all_priority_1(),
    priority1DecreaseStages: config.stages.map(s => ({
      stage: s.name,
      count_priority_1: countPriority1Blanks(s),
      decreasing: decreasesAcrossStages
    })),
    functionsArePracticed: functions.every(f => practicesMaintained(f))
  }
}
```

**Pass:** Priority 1 functions always blanked, maintained across stages
**Fail:** Priority 1 functions omitted or skipped stages

### Test 3: Feedback Tone Check
```typescript
function validateFeedbackTone(config: ScaffoldingConfig): ValidationResult {
  const forbiddenWords = ["wrong", "incorrect", "bad", "mistake"];
  return {
    stage1And2: {
      immediate_feedback: true,
      encouraging_tone: !hasForbiddenWords(config.stage_1.feedback),
      includes_explanation: config.stage_1.feedback.includes_usage_context
    },
    stage3And4: {
      delayed_feedback: true,
      reflective_tone: !hasForbiddenWords(config.stage_3.feedback),
      growth_focused: includes_growth_language(config.stage_4.feedback)
    }
  }
}
```

**Pass:** All feedback is non-judgmental and encouraging
**Fail:** Feedback uses corrective language

### Test 4: Blank Placement Logic
```typescript
function validateBlankPlacement(config: ScaffoldingConfig): ValidationResult {
  return {
    blanksPreserveMeaning: config.stages.every(s =>
      s.blanks.every(b => meaningPreserved(b))
    ),
    chunksUnbroken: config.stages.every(s =>
      !breaksChunks(s.blanks)
    ),
    priorityRespected: config.stages.every(s =>
      followsPriority(s.blanks, config.priorities)
    )
  }
}
```

**Pass:** Blanks don't break chunks, preserve meaning, follow priorities
**Fail:** Blanks break chunks or ignore priorities

### Test 5: Progression Naturalness
```typescript
function validateProgression(stages: ScaffoldingStage[]): ValidationResult {
  return {
    eachStageIsNaturalNext: stages.every((s, i) => {
      if (i === 0) return true;
      return naturalProgression(stages[i-1], s);
    }),
    noSuddenJumps: !hasSuddenDifficultyIncrease(stages),
    supportsPreparesLearner: stages.every((s, i) => {
      if (i === stages.length - 1) return true;
      return preparesFor(s, stages[i+1]);
    })
  }
}
```

**Pass:** Each stage naturally progresses from previous
**Fail:** Sudden jumps in difficulty or support gaps

---

## Integration with Blank Inserter

**Current blank-inserter workflow:**
1. Reads LOCKED_CHUNKS (hardcoded vocabulary)
2. Uses multi-factor pedagogical scoring
3. Inserts blanks by priority

**New workflow:**
1. Read scaffolding_config.json from system-builder
2. Read core_repertoire.json from chunk-curator
3. Apply stage-specific priorities
4. Generate blanks with stage metadata

---

## Examples

### Example 1: B2 Workplace Negotiation
**Dialogue:** "To be honest, I'm concerned about the timeline."

**Stage 1 (60% blanks):**
```
___ ___ honest, I'm concerned about the [timeline].
[multiple choice] [multiple choice] [Word shown]
```

**Stage 2 (45% blanks):**
```
To be ___, I'm [concerned] about the timeline.
[word_prompt] [word_prompt]
```

**Stage 3 (20% blanks):**
```
[Soften here] ___. To be __, I'm concerned about the timeline.
[situational cue] [word_prompt]
```

**Stage 4 (0% blanks):**
```
To be honest, I'm concerned about the timeline.
[no blanks - authentic negotiation]
```

### Example 2: A2 Restaurant Ordering
**Dialogue:** "Can I have the vegetarian option?"

**Stage 1:** "Can I ___ the vegetarian ___?" [multiple choice]
**Stage 2:** "Can I have ___?" [word_prompt]
**Stage 3:** "[Order something] Can I have the vegetarian option?" [cue only]
**Stage 4:** "Can I have the vegetarian option?" [no blanks]

---

## Related Documentation
- `.claude/agents/README.md` - Master architecture
- `.claude/agents/blank-inserter/SKILL.md` - Implements blank placement
- `.claude/agents/learning-architect/SKILL.md` - Defines progression model
- `.claude/agents/task-designer/SKILL.md` - Defines task structure
