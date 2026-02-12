/**
 * LLM prompts for the three-stage content package generation
 */

export interface Stage1Input {
    category: string;
    topic: string;
    targetChunks: number;  // 15-30
}

/**
 * STAGE 1 PROMPT: Generate roleplay dialogue with blanks
 * Output: Context + Characters + Roleplay dialogue
 */
export function buildStage1Prompt(input: Stage1Input): string {
    return `You are an IELTS roleplay scenario creator with 10+ years of test design experience.

Your task: Generate a roleplay dialogue for the IELTS speaking exam, following CRITICAL RULES below.

=== CONTEXT ===
Category: ${input.category}
Topic: ${input.topic}
Target blanks: ${input.targetChunks}

=== THE IRON LAWS (NEVER BREAK THESE) ===

1. **FULL CHUNK BLANKS** - Each blank must cover a COMPLETE linguistic chunk, not partial phrases
   ✅ GOOD: "I'm ________ from headaches" (chunk: "suffering")
   ❌ BAD: "I'm suffering ________" (partial - missing "from")
   ✅ GOOD: "I would ________ it" (chunk: "really appreciate")
   ❌ BAD: "I really ________ it" (partial - missing "really")

2. **EXACTLY 2 SPEAKERS** - One main character + "You" (the learner)
   ${input.category === 'Healthcare' ? '   Example: Doctor/GP + You' : '   Example: Shop Assistant + You'}

3. **MINIMUM 30 DIALOGUE LINES** - Ensure natural, flowing conversation with depth

4. **8 UNDERSCORES FOR BLANKS** - Use exactly: ________

5. **${input.category === 'Healthcare' ? 'NO EMERGENCY LANGUAGE' : 'NATURAL CONVERSATIONAL FLOW'}**
   ${input.category === 'Healthcare' ? '   ❌ FORBIDDEN: cardiac arrest, severe bleeding, unconscious, anaphylaxis, emergency, ambulance\\n   ✅ ALLOWED: regular appointment, checkup, symptoms, treatment advice' : '   Focus on realistic, everyday communication patterns'}

6. **CHUNK DIVERSITY** - Blanks should cover 4-6 different functional categories:
   - Openers (greetings, conversation starters)
   - Softening (hedging, politeness)
   - Disagreement (polite disagreement)
   - Repair (clarification, fixing misunderstandings)
   - Exit (closing, goodbyes)
   - Idioms (collocations, fixed expressions)

=== OUTPUT FORMAT ===

### Context (pre-roleplay popup)
[2-3 sentences: Where? Why? What goal? What tone?]

### Characters
- **[Main Character Name]**: [1-2 word description of personality/role]
- **You**: [Your role description in this scenario]

### Roleplay (during)
**[Main Character]**: [Opening line - natural and engaging]
**You**: [Your response, may contain ________ blanks]

[Continue alternating for 30+ lines with ${input.targetChunks} total blanks spread throughout]

**[Main Character]**: [Closing line]

=== QUALITY CHECKLIST ===
Before generating, verify you'll include:
- [ ] ${input.targetChunks} total blanks (each a COMPLETE chunk, not partial)
- [ ] At least 30 dialogue lines
- [ ] 2 distinct speakers with consistent voices
- [ ] Mix of functional categories (openers, softening, repair, disagreement, exit, idioms)
- [ ] Realistic, natural dialogue (sounds like real IELTS speaking section)
- [ ] ${input.category === 'Healthcare' ? 'NO emergency language' : 'Contextually appropriate tone'}

Now generate the scenario:`;
}

/**
 * STAGE 2 PROMPT: Generate answers + chunkFeedback + blanksInOrder
 * Output: Answers, YAML block with chunkFeedback and blanksInOrder
 */
export function buildStage2Prompt(roleplayMarkdown: string): string {
    return `You've generated this roleplay:

${roleplayMarkdown}

Now generate the ANSWERS section + detailed YAML block with chunk feedback and blank mappings.

=== CRITICAL RULES FOR STAGE 2 ===

1. **ANSWERS COMPLETENESS** - Provide 2-4 natural alternatives for each blank
   Example format:
   **Blank 1**: \`suffering\`
   - Alternatives: \`struggling\`, \`suffering from\`, \`affected by\`

2. **CHUNK FEEDBACK STRUCTURE** - Native/Learner/Examples format
   - \`native\`: Exact match to answer (MUST BE IDENTICAL)
   - \`learner.meaning\`: Simple explanation (what it means in 1 sentence)
   - \`learner.useWhen\`: When/why natives use it (situational context)
   - \`learner.commonWrong\`: Full learner sentence showing typical mistake
   - \`learner.fix\`: Corrected version of learner mistake
   - \`learner.whyOdd\`: SPECIFIC reason why mistake sounds unnatural (not "sounds wrong" - explain WHY)
   - \`examples\`: 1-2 natural usage examples from real contexts

3. **CHUNK ID NAMING CONVENTION**
   Format: {category}{num}_ch_{slug}
   Examples:
   - \`hc1_ch_suffering_from\` (healthcare-1, chunk: suffering from)
   - \`social2_ch_nice_to_meet\` (social-2, chunk: nice to meet)
   Use lowercase, underscores, max 3-4 words in slug

4. **BLANK ID MAPPING**
   Format: {category}{num}_b{index}
   Example: \`hc1_b1\`, \`hc1_b2\`, etc.

5. **NO PARTIAL BLANKS** - Answer text MUST EQUAL chunk.native exactly
   ❌ Answer: "suffering" but chunk.native: "suffering from" (MISMATCH)
   ✅ Answer: "suffering from" and chunk.native: "suffering from" (PERFECT MATCH)

6. **AVOID VAGUE EXPLANATIONS**
   ❌ whyOdd: "sounds wrong"
   ✅ whyOdd: "Direct translation sounds mechanical; native speakers use 'from' after 'suffer' to indicate the source"

=== OUTPUT FORMAT ===

### Answers (blank-by-blank, in order of appearance)

**Blank 1**: \`[answer]\`
- Alternatives: \`[alt1]\`, \`[alt2]\`, \`[alt3]\`

**Blank 2**: \`[answer]\`
- Alternatives: \`[alt1]\`, \`[alt2]\`

[Continue for all blanks...]

---

\`\`\`yaml
chunkFeedback:
  hc1_ch_suffering_from:
    native: "suffering from"
    learner:
      meaning: "Experiencing or undergoing something negative (illness, pain, problem)"
      useWhen: "When describing what medical issue or condition affects someone"
      commonWrong: "I am suffering of headaches"
      fix: "I am suffering from headaches"
      whyOdd: "The preposition matters: 'suffering from' indicates the cause/source; 'suffering of' is grammatically incorrect in modern English"
    examples:
      - "Many patients suffer from chronic pain after surgery"
      - "She's been suffering from migraines for weeks"

  hc1_ch_check_up:
    native: "check-up"
    learner:
      meaning: "A medical examination to assess overall health"
      useWhen: "When discussing routine health visits or preventive care"
      commonWrong: "I need to go for a health check"
      fix: "I need to go for a check-up"
      whyOdd: "While 'health check' is understandable, 'check-up' is the colloquial native choice; 'health check' sounds more formal/corporate"
    examples:
      - "Regular check-ups help catch health issues early"
      - "I haven't had a check-up in two years"

blanksInOrder:
  - blankId: hc1_b1
    chunkId: hc1_ch_suffering_from
  - blankId: hc1_b2
    chunkId: hc1_ch_check_up
  [Continue for all blanks...]
\`\`\`

Now generate the answers + YAML block:`;
}

/**
 * STAGE 3 PROMPT: Generate patternSummary + activeRecall
 * Output: YAML block with patternSummary and activeRecall test items
 */
export function buildStage3Prompt(fullPackageSoFar: string): string {
    return `You've created this package so far:

${fullPackageSoFar}

Now generate the final sections: patternSummary + activeRecall for spaced repetition practice.

=== CRITICAL RULES FOR STAGE 3 ===

1. **USE CHUNK IDs IN ALL REFERENCES** - Never use text references
   ❌ WRONG: examples: ["suffering", "check-up"]
   ✅ CORRECT: exampleChunkIds: ["hc1_ch_suffering_from", "hc1_ch_check_up"]

2. **PATTERN SUMMARY STRUCTURE**
   - \`categoryBreakdown\`: 2-4 semantic groups of chunks
     - \`category\`: Label (e.g., "Medical Terminology", "Politeness Softeners")
     - \`count\`: Number of chunks in this group
     - \`exampleChunkIds\`: 2-3 chunk IDs from this group
     - \`insight\`: What learners practice (30-100 words, focus on function not definition)

   - \`overallInsight\`: Main learning outcome (100-300 words)
     - Must explain WHAT learners will accomplish (functional outcomes)
     - NOT definitions ("This chunk means...")
     - Focus on why these chunks matter for native communication

   - \`keyPatterns\`: 3-5 cross-chunk connections
     - \`pattern\`: Name of the pattern (10-50 chars)
     - \`explanation\`: Why this pattern matters (50-150 words)
     - \`chunkIds\`: Which chunks exemplify this pattern (2-3 minimum)

3. **ACTIVE RECALL ITEMS** - 8-12 spaced repetition test items
   Two types:

   **Type A**: "Choose the chunk that means X"
   \`\`\`yaml
   - id: hc1_ar_1
     prompt: "Choose the chunk that means 'to examine health status'"
     targetChunkIds: ["hc1_ch_check_up"]
   \`\`\`

   **Type B**: "Fill the gap with chunk"
   \`\`\`yaml
   - id: hc1_ar_2
     prompt: "Fill the gap: 'I've been ________ back pain for months'"
     targetChunkIds: ["hc1_ch_suffering_from"]
   \`\`\`

   For Type B, COPY-PASTE directly from roleplay dialogue, replacing chunk with ________

4. **AVOID VAGUE LANGUAGE**
   ❌ insight: "These chunks are important"
   ✅ insight: "These chunks help learners soften difficult messages, making disagreement less confrontational"

5. **SINGLE QUOTES IN YAML** - Escape apostrophes if needed
   ✅ insight: 'I''m here' (escaped apostrophe)
   ✅ insight: "I'm here" (use double quotes instead)

6. **CHUNK ID VALIDATION**
   - Every chunkId MUST exist in the chunkFeedback section above
   - No typos, exact case match required

=== OUTPUT FORMAT ===

\`\`\`yaml
patternSummary:
  categoryBreakdown:
    - category: "Medical Terminology"
      count: 3
      exampleChunkIds:
        - "hc1_ch_suffering_from"
        - "hc1_ch_check_up"
        - "hc1_ch_prescription"
      insight: "Learners practice expressing health issues using accurate medical vocabulary that nurses and doctors expect to hear"

    - category: "Politeness in Healthcare"
      count: 2
      exampleChunkIds:
        - "hc1_ch_could_you"
        - "hc1_ch_would_it_be_possible"
      insight: "Learners practice polite request forms that show respect in healthcare interactions and avoid sounding demanding"

  overallInsight: "This scenario teaches learners how to navigate a healthcare appointment by combining medical terminology with polite communication patterns. Key outcome: Learners can describe health concerns clearly and understand doctor responses, while maintaining appropriate register and politeness. This mirrors real Band 8 performance where candidates blend accuracy (correct medical terms) with fluency (natural question patterns)."

  keyPatterns:
    - pattern: "Describing Symptoms Accurately"
      explanation: "Native speakers use consistent structures when describing medical issues: subject + 'suffer from' + specific complaint. This pattern appears across contexts (headaches, allergies, injuries) and signals clear communication to healthcare providers."
      chunkIds:
        - "hc1_ch_suffering_from"
        - "hc1_ch_for_how_long"

    - pattern: "Requesting Information Politely"
      explanation: "Multiple ways to ask questions in healthcare, but natives show careful politeness: 'Could you...', 'Would it be possible...', 'Could you tell me...'. This protects the relationship and ensures understanding."
      chunkIds:
        - "hc1_ch_could_you"
        - "hc1_ch_would_it_be_possible"

activeRecall:
  - id: hc1_ar_1
    prompt: "Choose the chunk that means 'to experience health difficulty'"
    targetChunkIds: ["hc1_ch_suffering_from"]

  - id: hc1_ar_2
    prompt: "Fill the gap: 'I've been ________ this problem for about three weeks'"
    targetChunkIds: ["hc1_ch_suffering_from"]

  - id: hc1_ar_3
    prompt: "Choose the chunk that is a routine health examination"
    targetChunkIds: ["hc1_ch_check_up"]

  - id: hc1_ar_4
    prompt: "Fill the gap: 'When was your last ________?'"
    targetChunkIds: ["hc1_ch_check_up"]

  [Continue with 8-12 total items...]
\`\`\`

Now generate patternSummary + activeRecall:`;
}

/**
 * REVISION PROMPT: Fix specific validation errors
 */
export function buildRevisionPrompt(issues: Array<{ rule: string; message: string; location?: string }>, previousAttempt: string): string {
    const errorList = issues
        .map(e => `- **${e.rule}**: ${e.message}${e.location ? ` (${e.location})` : ''}`)
        .join('\n');

    return `Your previous package had validation errors. Fix ONLY these issues:

=== ERRORS TO FIX ===
${errorList}

=== PREVIOUS ATTEMPT ===
${previousAttempt}

=== FIX GUIDANCE ===

${issues.some(e => e.rule === 'blank-count-consistency')
        ? `**blank-count-consistency**: Ensure dialogue blanks == answers count == blanksInOrder count
  - Count ________ in dialogue
  - Verify each answer has a mapping in blanksInOrder
  - Add missing answers or remove extra mappings`
        : ''
}

${issues.some(e => e.rule === 'full-chunk-blanks')
        ? `**full-chunk-blanks**: Answer text must equal chunk.native exactly
  - If Answer: "suffering" but chunk.native: "suffering from", they don't match
  - Fix by changing answer to match the full chunk: "suffering from"
  - Remember: NO PARTIAL BLANKS`
        : ''
}

${issues.some(e => e.rule === 'chunk-slug-uniqueness')
        ? `**chunk-slug-uniqueness**: Change duplicate slugs in chunkId
  - Example: Two chunks named "hc1_ch_test" → change to "hc1_ch_test_1" and "hc1_ch_test_2"`
        : ''
}

${issues.some(e => e.rule === 'whyodd-specificity')
        ? `**whyodd-specificity**: Make whyOdd SPECIFIC, not vague
  - Don't say: "sounds wrong"
  - DO say: "Direct translation sounds stiff; native speakers use 'from' after 'suffer' to indicate the source of the problem"`
        : ''
}

${issues.some(e => e.rule === 'chunkid-references')
        ? `**chunkid-references**: Verify all chunkIds in patternSummary/activeRecall exist in chunkFeedback
  - Check spelling and case (must match exactly)
  - Don't add new chunkIds; use only what exists`
        : ''
}

${issues.some(e => e.rule === 'blank-chunk-mapping')
        ? `**blank-chunk-mapping**: Each blankId in blanksInOrder must reference a valid chunkId
  - Verify no typos in chunkId names`
        : ''
}

${issues.some(e => e.rule === 'dialogue-structure')
        ? `**dialogue-structure**: Ensure exactly 2 speakers and 30+ lines
  - Add more dialogue if needed
  - Make sure speaker names don't vary (e.g., "You" not "I" as speaker)`
        : ''
}

=== REGENERATE THE FULL PACKAGE ===

Use the format from previous stages:
1. Context, Characters, Roleplay
2. Answers + YAML chunkFeedback + blanksInOrder
3. YAML patternSummary + activeRecall

Keep all content from previous attempt, but FIX the listed errors.

Regenerate now:`;
}
