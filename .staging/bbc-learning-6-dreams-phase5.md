# Phase 5: Active Recall Questions
## BBC Learning English - Dreams & Life Regrets
**Scenario ID**: bbc-learning-6-dreams
**Total Questions**: 18 (1 per 2-3 blanks)
**Difficulty Distribution**: Easy (6) | Intermediate (8) | Hard (4)

---

## Active Recall Questions (TypeScript Ready)

```typescript
const activeRecallQuestions = [

  // ============================================================================
  // EASY TIER (6 questions) - Direct fill-in-the-gap from dialogue context
  // ============================================================================

  {
    "id": "bbc-learning-6-ar-1",
    "difficulty": "easy",
    "type": "fill-gap",
    "prompt": "Fill the gap: 'Hey Sam! ________ you been up to these days?'",
    "targetChunkIds": ["bbc-learning-6-dreams-b0"],
    "expectedAnswer": "What have",
    "hints": [
      "Think about asking someone what they've been doing recently",
      "It's a common casual greeting in English",
      "Hint: This is how you reconnect with a friend after time apart"
    ],
    "explanation": "This is THE standard casual conversation opener. 'What have you been up to?' asks about someone's recent activities. It's warm and natural, not formal."
  },

  {
    "id": "bbc-learning-6-ar-2",
    "difficulty": "easy",
    "type": "fill-gap",
    "prompt": "Fill the gap: 'That ________ sense—following your dreams is important.'",
    "targetChunkIds": ["bbc-learning-6-dreams-b9"],
    "expectedAnswer": "makes",
    "hints": [
      "This phrase means 'your reasoning is logical'",
      "It shows you understand and validate someone's point",
      "Grammar: 'That ________ sense' (what verb?)"
    ],
    "explanation": "'That makes sense' is essential validation language. You're saying 'I understand your logic and I think it's sound.' Critical for showing you're listening."
  },

  {
    "id": "bbc-learning-6-ar-3",
    "difficulty": "easy",
    "type": "fill-gap",
    "prompt": "Fill the gap: 'Fair ________ , everyone's situation is different.'",
    "targetChunkIds": ["bbc-learning-6-dreams-b5"],
    "expectedAnswer": "enough",
    "hints": [
      "This is an idiom—a fixed expression",
      "It means 'you've made a reasonable point, I accept it'",
      "Word order: Fair [blank] = acceptance phrase"
    ],
    "explanation": "'Fair enough' shows you accept someone's perspective as reasonable without necessarily fully agreeing. It's diplomatic and warm."
  },

  {
    "id": "bbc-learning-6-ar-4",
    "difficulty": "easy",
    "type": "fill-gap",
    "prompt": "Fill the gap: 'To be ________ , I think they took a real risk doing that.'",
    "targetChunkIds": ["bbc-learning-6-dreams-b13"],
    "expectedAnswer": "honest",
    "hints": [
      "This is a classic English idiom for candid sharing",
      "It signals 'I'm about to tell you something truthful'",
      "Complete phrase: 'To be ________ '"
    ],
    "explanation": "'To be honest' is an idiom that creates psychological permission for vulnerability. When you hear it, you know something real is coming."
  },

  {
    "id": "bbc-learning-6-ar-5",
    "difficulty": "easy",
    "type": "fill-gap",
    "prompt": "Fill the gap: 'Not following your dreams was the top life ________ .'",
    "targetChunkIds": ["bbc-learning-6-dreams-b15"],
    "expectedAnswer": "regret",
    "hints": [
      "What do people feel when they didn't do something they wish they'd done?",
      "This is the core theme of Bronnie Ware's research",
      "Word: Something you wish hadn't happened"
    ],
    "explanation": "The word 'regret' is central to this scenario. Bronnie Ware found that NOT following dreams was people's #1 life regret."
  },

  {
    "id": "bbc-learning-6-ar-6",
    "difficulty": "easy",
    "type": "multiple-choice",
    "prompt": "What does 'What have you been up to?' mean?",
    "options": [
      "What are you currently doing right now?",
      "What have you been doing recently? (a period of time)",
      "What did you do yesterday?"
    ],
    "correctAnswer": 1,
    "targetChunkIds": ["bbc-learning-6-dreams-b0"],
    "explanation": "'Up to' refers to a PERIOD of recent time, not a single action. It's how you ask for a catch-up on someone's recent life, not their current moment."
  },

  // ============================================================================
  // INTERMEDIATE TIER (8 questions) - Context-based understanding
  // ============================================================================

  {
    "id": "bbc-learning-6-ar-7",
    "difficulty": "intermediate",
    "type": "contextual",
    "prompt": "In the dialogue, when Alex says 'Actually, I've been thinking about something...' they're about to share something important. Why is 'Actually' the right word here, not 'So anyway'?",
    "targetChunkIds": ["bbc-learning-6-dreams-b3"],
    "expectedAnswer": "Because 'Actually' signals something important is coming. 'So anyway' signals you're moving past something. The context shows Alex IS shifting focus to something meaningful.",
    "hints": [
      "Think about the difference between: opening a new topic vs closing an old topic",
      "Discourse markers set psychological expectations",
      "'Actually' says 'wait, this matters'",
      "'So anyway' says 'anyway, never mind'"
    ],
    "explanation": "Discourse markers aren't just fillers—they structure conversation psychologically. 'Actually' prepares listeners for something important."
  },

  {
    "id": "bbc-learning-6-ar-8",
    "difficulty": "intermediate",
    "type": "contextual",
    "prompt": "Why does Herman use the metaphor 'a grain of sand' instead of just saying 'I'm insignificant'?",
    "targetChunkIds": ["bbc-learning-6-dreams-b21"],
    "expectedAnswer": "Because 'grain of sand' carries both meanings at once: TINY (insignificant alone) AND ESSENTIAL (necessary for the whole beach). Just saying 'insignificant' loses that paradox and the wisdom.",
    "hints": [
      "A metaphor teaches more than literal language",
      "What does a grain of sand represent in a beach?",
      "It's small but also part of something bigger",
      "What feeling does 'grain of sand' create that 'insignificant' doesn't?"
    ],
    "explanation": "Poetic language like 'grain of sand' communicates emotional/philosophical truth more effectively than literal words. It's learning wisdom, not just vocabulary."
  },

  {
    "id": "bbc-learning-6-ar-9",
    "difficulty": "intermediate",
    "type": "pattern-match",
    "prompt": "Match the chunk to its CATEGORY: 'Fair enough' belongs to which group?\n\nA) Conversation Openers\nB) Validation & Understanding\nC) Topic-Specific Dreams Vocabulary\nD) Grammar & Function Words",
    "options": [
      "Conversation Openers",
      "Validation & Understanding",
      "Topic-Specific Dreams Vocabulary",
      "Grammar & Function Words"
    ],
    "correctAnswer": 1,
    "targetChunkIds": ["bbc-learning-6-dreams-b5"],
    "explanation": "'Fair enough' is validation language—you're accepting what someone said, showing you understand and respect their point. It keeps relationships smooth in conversations about different life choices."
  },

  {
    "id": "bbc-learning-6-ar-10",
    "difficulty": "intermediate",
    "type": "fill-context",
    "prompt": "Complete the phrase and explain: 'Herman wanted to ________ the world, but instead was ________ by it.'",
    "targetChunkIds": ["bbc-learning-6-dreams-b20"],
    "expectedAnswer": "conquer... conquered",
    "hints": [
      "There's wordplay here—the same root word appears twice",
      "First: wanting to dominate/control something",
      "Second: being transformed/changed by something",
      "Herman's transformation story uses this contrast"
    ],
    "explanation": "The conquer/conquered contrast IS the insight: he went from wanting to DOMINATE to being TRANSFORMED. This wordplay captures his entire journey."
  },

  {
    "id": "bbc-learning-6-ar-11",
    "difficulty": "intermediate",
    "type": "contextual",
    "prompt": "In the context of following dreams, why is 'seems risky' better advice-giving language than 'is risky'?",
    "targetChunkIds": ["bbc-learning-6-dreams-b34"],
    "expectedAnswer": "'Seems risky' (perception) leaves room for hope and courage. 'Is risky' (fact) sounds inevitable and hopeless. The perception-based language allows for 'yes, it seems risky AND we do it anyway.'",
    "hints": [
      "What's the difference between 'seems' and 'is' in meaning?",
      "How does each phrasing affect someone's motivation?",
      "In motivational conversations, which word choice is more empowering?"
    ],
    "explanation": "Word choice matters in emotional conversations. 'Seems' creates agency; 'is' creates fate. When helping others pursue dreams, 'seems' is psychologically better."
  },

  {
    "id": "bbc-learning-6-ar-12",
    "difficulty": "intermediate",
    "type": "fill-context",
    "prompt": "Why does Sam ask 'What would you do if you could do anything right now?' instead of just asking 'What's your dream?'",
    "targetChunkIds": ["bbc-learning-6-dreams-b31"],
    "expectedAnswer": "Conditional questions ('What would you...if...') create psychological safety. They feel like imagination games, not interrogation. Direct questions ('What's your dream?') can feel demanding or judgmental.",
    "hints": [
      "Think about which feels safer: hypothetical or direct question",
      "Conditionals create distance (imagination space)",
      "Direct questions can feel evaluative",
      "Which phrasing makes you more willing to be vulnerable?"
    ],
    "explanation": "Question phrasing determines whether people feel safe sharing dreams. Conditionals work better than direct questions in vulnerable conversations."
  },

  {
    "id": "bbc-learning-6-ar-13",
    "difficulty": "intermediate",
    "type": "identify-chunk",
    "prompt": "Which chunk from this scenario is an idiom (fixed expression that can't be translated word-for-word)?",
    "options": [
      "'I understand'",
      "'To be honest'",
      "'That makes sense'",
      "'I see'"
    ],
    "correctAnswer": 1,
    "targetChunkIds": ["bbc-learning-6-dreams-b13"],
    "explanation": "'To be honest' is idiomatic—you must learn it as a whole unit. 'I understand', 'That makes sense', and 'I see' are logical combinations of words, not idioms."
  },

  {
    "id": "bbc-learning-6-ar-14",
    "difficulty": "intermediate",
    "type": "identify-chunk",
    "prompt": "Complete: 'Following your ________ can be tough, but not following them can leave you ________ all the things you wanted to do.'",
    "targetChunkIds": ["bbc-learning-6-dreams-b15"],
    "expectedAnswer": "dreams... regretting",
    "hints": [
      "This is about the cost of NOT pursuing aspirations",
      "The second blank describes what happens emotionally",
      "This connects directly to Bronnie Ware's research"
    ],
    "explanation": "This collocation ('follow your dreams' + 'regretting all the things') expresses the core theme: dream-pursuing is worth the risk because not pursuing them creates regret."
  },

  // ============================================================================
  // HARD TIER (4 questions) - Deep pattern understanding & transfer
  // ============================================================================

  {
    "id": "bbc-learning-6-ar-15",
    "difficulty": "hard",
    "type": "synthesis",
    "prompt": "How do the chunks 'Fair enough', 'That makes sense', and 'I understand' work TOGETHER to show you're listening in a conversation about life regrets? What does each add?",
    "targetChunkIds": ["bbc-learning-6-dreams-b5", "bbc-learning-6-dreams-b9", "bbc-learning-6-dreams-b12"],
    "expectedAnswer": "'Fair enough' accepts their choice as reasonable (non-judgmental). 'That makes sense' validates their logic (intellectual understanding). 'I understand' validates their feelings (emotional empathy). Together, they say: 'I accept your choices, your reasoning is sound, and I feel what you're feeling.'",
    "hints": [
      "Each chunk validates a different layer: acceptance, logic, emotion",
      "Why would you need all three?",
      "What would happen if you only used one?",
      "What's the cumulative effect of all three in sequence?"
    ],
    "explanation": "Master listeners use all three validation types. Using only logic ('That makes sense') without emotion ('I understand') sounds cold. This scenario teaches integrated listening."
  },

  {
    "id": "bbc-learning-6-ar-16",
    "difficulty": "hard",
    "type": "transfer",
    "prompt": "You're having a conversation with a friend who just lost their job and is feeling scared about their future. Which chunks from this scenario would you use, and WHY? (Select and explain at least 3)",
    "targetChunkIds": ["bbc-learning-6-dreams-b31", "bbc-learning-6-dreams-b34", "bbc-learning-6-dreams-b36"],
    "expectedAnswer": "'What would you...?' (invite them to imagine what they WANT, not just fear), 'seems risky' (acknowledge real obstacles without despair), 'Let's' (offer support together). NOT 'conquer the world' (wrong context), NOT 'grain of sand' (too philosophical right now).",
    "hints": [
      "Which chunks create safety for vulnerability?",
      "Which acknowledge obstacles without crushing hope?",
      "Which chunks are universal (work in any serious conversation)?",
      "Which are too specific to dreams/regrets?"
    ],
    "explanation": "Transfer learning: Take the chunks from this scenario and apply them to NEW contexts. This tests whether you understand WHY chunks work, not just WHEN they work."
  },

  {
    "id": "bbc-learning-6-ar-17",
    "difficulty": "hard",
    "type": "deconstruction",
    "prompt": "Herman says: 'I am so happy with the Herman there is now, that I know now – not the one who wanted to conquer the world, but the one who was conquered by the world. I learn so much from people, and it's amazing how the more you meet people, the more you know stories, how much more humble you become...'",
    "followUp": "Identify all the CHUNKS (transformation language) that show his change of perspective. How do they work together to tell his story?",
    "targetChunkIds": ["bbc-learning-6-dreams-b20", "bbc-learning-6-dreams-b21"],
    "expectedAnswer": "'conquer' vs 'conquered' (wants domination → transformed by experience), 'humble' (ego reduced by meeting people), metaphor builds throughout (specific stories → general wisdom). The chunks form a narrative arc: from arrogant to humble.",
    "hints": [
      "Look for words that suggest transformation or change",
      "How do 'conquer' and 'conquered' frame the story?",
      "What does 'humble' add after the humbling experiences?",
      "How does the metaphor 'grain of sand' complete the arc?"
    ],
    "explanation": "Advanced learning: Chunks don't exist in isolation—they combine to tell stories. Understanding narrative structure in English is crucial for longer, more sophisticated dialogues."
  },

  {
    "id": "bbc-learning-6-ar-18",
    "difficulty": "hard",
    "type": "analysis",
    "prompt": "In this scenario, why is the SEQUENCE of validation chunks important? (Why does Sam say 'I understand' AFTER 'That makes sense', not before?)",
    "targetChunkIds": ["bbc-learning-6-dreams-b9", "bbc-learning-6-dreams-b12"],
    "expectedAnswer": "Logic first ('makes sense') establishes common ground. THEN emotion ('I understand') adds empathy. Reversing them would feel like false empathy on an illogical foundation. The sequence mirrors natural human understanding: first 'I get it intellectually', then 'I get it emotionally'.",
    "hints": [
      "What's the natural order of understanding something complex?",
      "Do people accept emotional support before logical understanding?",
      "How does conversation flow guide chunk usage?",
      "What would happen if you reversed the order?"
    ],
    "explanation": "Native speakers don't use chunks randomly—they sequence them for psychological effectiveness. Understanding this sequencing is what separates fluent speakers from textbook speakers."
  }
];
```

---

## Question Distribution Summary

| Difficulty | Count | Type | Focus |
|-----------|-------|------|-------|
| **EASY** | 6 | Fill-gap, multiple-choice | Direct recognition from dialogue |
| **INTERMEDIATE** | 8 | Context, pattern-match, fill-context | Understanding WHY chunks work |
| **HARD** | 4 | Synthesis, transfer, deconstruction | Deep learning & new contexts |
| **TOTAL** | **18** | Mixed | Progressive challenge |

---

## Cognitive Progression (Bloom's Taxonomy)

```
Easy Questions:
  ↓ Remember (What's the word?)
  ↓ Understand (What does it mean?)
    ↓
Intermediate Questions:
      ↓ Apply (Why use THIS chunk in THIS context?)
      ↓ Analyze (How do chunks work together?)
        ↓
Hard Questions:
           ↓ Evaluate (When would you use this? Why that, not this?)
           ↓ Create (How would this chunk work in a completely new scenario?)
```

---

## Spacing & Recall Schedule

Recommended timing for spaced repetition:

1. **First encounter**: During scenario playthrough (automatic)
2. **Immediate recall** (5 min after): Easy questions (ar-1 through ar-6)
3. **Short-term recall** (1 day after): Intermediate questions (ar-7 through ar-14)
4. **Long-term recall** (1 week after): Hard questions (ar-15 through ar-18)
5. **Transfer learning** (ongoing): Use these chunks in new conversations

---

## Success Criteria

Learner demonstrates mastery when they can:

- [x] Complete easy gap-fills from memory (90%+ accuracy)
- [x] Explain WHY chunks work in context (understanding, not guessing)
- [x] Apply chunks to NEW scenarios (transfer)
- [x] Identify chunk categories and their functions
- [x] Recognize psychological/emotional purposes of validation language
- [x] Understand idioms as fixed units, not word-by-word
- [x] Sequence chunks for maximum conversational effectiveness

---

## Notes for Integration

These 18 questions will be rendered in:
- **Modal format** in the RoleplayViewer (click chunk → see feedback + 1-2 active recall questions)
- **Quiz mode** for batch practice (all 18 questions back-to-back)
- **Spaced repetition** tracking (system remembers when user last answered each)
- **Performance analytics** (which questions trip up learners? where's the common struggle?)

