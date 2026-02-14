# Core Rules: Language & Pedagogical Principles

## The Goal
The goal of this engine is **Fluency Acquisition** through the repetition of core patterns (Chunks), NOT vocabulary expansion.

## Global Rules (Non-Negotiable)

### Rule 1: Train Patterns, Not Vocab
The system focuses on the automatic deployment of conversational moves.
- Chunks are repeated intentionally within and across scenarios
- Vocabulary expansion is secondary to pattern acquisition
- Blank answers should reinforce chunk patterns, not introduce new vocabulary

### Rule 2: Novelty is a Bug
Repetition is intentional. New phrasing is avoided unless absolutely unavoidable.
- Reuse established phrasings consistently
- Flag new vocabulary as requiring approval
- When novel phrasing is necessary, document the exception

### Rule 3: Locked Chunk Priority
The `LOCKED_UNIVERSAL_CHUNKS` set takes priority over all other phrasing.
- Always prefer chunks from the locked set
- Topic-specific chunks are secondary
- Custom phrasing only when locked set cannot express the meaning

### Rule 4: Style Guidelines
UK native, day-to-day English. Calm, understated, adult tone.
- No formal textbook language
- Natural conversational flow
- Avoid artificial or overly polite phrasing

---

## Language Constraints

### Markdown Restriction
**NO markdown bolding in dialogue** (asterisks or underscores).
- ❌ `"I **see** your point"`
- ✅ `"I see your point"`
- ❌ `"Let me _explain_"`
- ✅ `"Let me explain"`

### Chunk Prioritization
- Treat the locked set as the primary language inventory
- Chunks must reappear intentionally within a single roleplay
- Establish predictable patterns that learners can recognize and replicate

### UK Context
Ensure the style is natural for a UK native speaker.
- British spelling: colour, realise, favour, centre
- British vocabulary: lift (not elevator), flat (not apartment), queue (not line)
- British idioms and conversational conventions

---

## Locked Universal Chunks (Reference)

### Bucket A: Universal Chunks
These chunks appear across all scenarios and topics.

**Conversation Starters**
- "Nice to meet you"
- "How is it going?"
- "What have you been up to?"
- "By the way..."
- "Let's change the subject"
- "Go straight to the point"
- "Am I making sense?"
- "Let's keep in touch"

**Agreements & Opinions**
- "I see your point"
- "Fair enough"
- "That makes sense"
- "I beg to differ"
- "I'm not sure I agree with that"
- "I'd rather not"
- "Sounds good"
- "From my perspective..."

**Requests & Help**
- "Could you do me a favor?"
- "Give us a hand"
- "Do you mind if I...?"
- "Go ahead"
- "I appreciate your help/time"
- "Don't mention it"

**Problems & Plans**
- "Something has come up"
- "I'm in a hurry"
- "It's a shame"
- "These things happen"
- "Lesson learned"

**Idioms**
- "To be honest..."
- "Play it by ear"
- "On the spur of the moment"
- "Get off on the wrong foot"
- "A breath of fresh air"
- "Spill the beans"
- "Between you and me"

### Bucket B: Topic-Specific Chunks
See `src/constants.ts` for the full expanded list of contextual chunks by topic:
- Travel (flight, hotel, destination-related)
- Shopping (pricing, preferences, recommendations)
- Hotels (booking, amenities, complaints)
- Dining (reservation, menu, service)
- Work (meetings, projects, collaboration)
- Health (symptoms, treatment, prevention)

---

## Chunk Usage Requirements

### Minimum Frequency
- At least 3 Bucket A chunks per dialogue (at minimum)
- At least 1 Bucket B chunk per scenario (topic-specific)

### Pattern Reinforcement
- Chunks should appear in natural contexts
- Repetition should feel organic, not forced
- Vary the chunk position within turns (start, middle, end)

### Variation Allowance
- Contractions are allowed: "I'm" vs "I am", "don't" vs "do not"
- Pronoun variations are allowed: "you" vs "one", "we" vs "us"
- BUT: Core chunk vocabulary must remain consistent

---

## Note on Pedagogy

This document serves as the "Source of Truth" for the AI's behavior and the pedagogical goal of the application. All dialogue generation, blank insertion, and feedback must align with these core principles.

**Last Updated**: Feb 14, 2026
