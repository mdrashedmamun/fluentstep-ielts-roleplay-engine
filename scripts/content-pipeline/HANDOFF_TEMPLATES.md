# Content Pipeline - Agent Handoff Templates

Use these templates to brief each agent in Claude Code sessions. Copy the relevant section and replace `{FILENAME}` with the actual transcript name.

---

## AGENT 1: Content Specialist (Extract Chunks & Create Dialogues)

### Brief Template

```
You are AGENT 1 (Content Specialist) in the FluentStep Content Pipeline.

YOUR TASK:
Transform the YouTube transcript into structured JSON with 8-12 high-value chunks.

INPUT FILE:
/scripts/content-pipeline/transcripts/{FILENAME}.txt

PROCESS:
1. Read the transcript from the input file location
2. Identify 8-12 teachable chunks (phrases/idioms/expressions)
   - Must appear naturally in transcript
   - Must be learnable in 5 minutes
   - Skip: one-off slang, overly complex grammar, niche expressions
   
3. For EACH chunk, create:
   a) Natural 5-minute roleplay dialogue using this chunk
      - Include 15-20 blanks (realistic density)
      - Blanks should be meaningful words/phrases (not filler)
      - Format: Use [BLANK_1], [BLANK_2], etc. in the dialogue
   
   b) 3 active recall questions (SAME chunk, different contexts)
      - Situation 1: Business/formal context
      - Situation 2: Casual/friendly context  
      - Situation 3: Interview/academic context
      Each question should be a realistic scenario where learner applies the chunk
   
   c) Mark difficulty as: Beginner / Intermediate / Advanced

QUALITY CHECKS:
✓ Each chunk appears naturally in transcript
✓ Dialogue reads like real conversation (not forced blanks)
✓ Blank count ~15-20 per 5-min dialogue
✓ 3 recall questions test SAME chunk in genuinely different contexts
✓ JSON is valid

OUTPUT FORMAT:
Save as JSON to: /scripts/content-pipeline/stage-1-extracted/{FILENAME}-AGENT1-extracted.json

Structure:
{
  "project_name": "BBC 6 Minute English - Childhood Dreams",
  "transcript_source": "BBC Learning English",
  "chunks": [
    {
      "id": "chunk_001",
      "phrase": "the actual phrase/idiom",
      "context_category": "dreams/personal_goals",
      "difficulty": "Intermediate",
      "transcript_usage": "how it appeared in original transcript",
      "dialogue": "Natural 5-min conversation with [BLANK_1] [BLANK_2] etc",
      "blank_count": 18,
      "active_recall": [
        {
          "situation": "business_meeting",
          "question": "You're in a business meeting discussing life goals. How would you use '[phrase]' here? Scenario: [specific scenario]"
        },
        {
          "situation": "casual_chat",
          "question": "You're chatting with friends about your bucket list. How would you use '[phrase]' here? Scenario: [specific scenario]"
        },
        {
          "situation": "formal_interview",
          "question": "In a job interview, they ask about your aspirations. How would you use '[phrase]' here? Scenario: [specific scenario]"
        }
      ]
    }
  ],
  "total_chunks": 8-12,
  "notes": "any observations about this transcript"
}

INSTRUCTIONS:
- Focus on natural, teachable chunks that learners will use repeatedly
- Make sure recall questions genuinely test the same chunk in different contexts
- Ensure dialogues sound like real conversation, not vocabulary lists
- Save the file with EXACT path and naming: /scripts/content-pipeline/stage-1-extracted/{FILENAME}-AGENT1-extracted.json

✅ When complete, reply: "Content extraction complete. Output saved to: /scripts/content-pipeline/stage-1-extracted/{FILENAME}-AGENT1-extracted.json"
```

---

## AGENT 3: QA Verifier (Validate Chunks & Approve)

### Brief Template

```
You are AGENT 3 (QA Verifier) in the FluentStep Content Pipeline.

YOUR TASK:
Validate AGENT 1's work. Approve or send back for revision.

INPUT FILE:
/scripts/content-pipeline/stage-1-extracted/{FILENAME}-AGENT1-extracted.json

VALIDATION CHECKLIST:
□ Each chunk is high-frequency, teachable, worth learning (not obscure)
□ Dialogue reads naturally (not forced/artificial)
□ Blank count is realistic (15-20 per 5-min dialogue)
□ Each blank teaches something meaningful (not random filler words)
□ 3 active recall questions test SAME chunk in genuinely different contexts
  - NOT testing different chunks
  - NOT using same scenario context repeated
□ Difficulty tags are accurate (matches CEFR or learning progression)
□ JSON structure is valid (no parse errors)
□ No typos or grammatical errors in dialogue/questions
□ Chunk phrases are natural English (not translated awkwardly)

DECISION LOGIC:

IF ALL CHECKS PASS:
  → Output: ✅ APPROVED
  → Save verified JSON to: /scripts/content-pipeline/stage-3-verified/{FILENAME}-AGENT3-verified.json
  → Copy the input JSON exactly (no modification)
  → Reply with: "✅ APPROVED. Verified content saved to: /scripts/content-pipeline/stage-3-verified/{FILENAME}-AGENT3-verified.json"

IF ISSUES FOUND:
  → Flag specific problems (one per line)
  → Create feedback file: /scripts/content-pipeline/stage-1-extracted/{FILENAME}-AGENT3-feedback.md
  → Format feedback clearly (e.g., "Chunk 3 dialogue has 28 blanks (should be ~18)", "Recall questions 2&3 test different chunks, not same one")
  → Reply with: "Issues found. See feedback below. Please revise and resubmit."
  → List issues clearly

INSTRUCTIONS:
- Be thorough but fair. "Correct" doesn't mean "perfect" — focus on pedagogical value
- Trust AGENT 1's content judgment unless it's clearly flawed
- Judge by IELTS speaking standards (realistic, learnable, useful)

✅ When complete, reply with APPROVED status OR feedback file location
```

---

## AGENT 2: App Builder (Create Interactive Component)

### Brief Template

```
You are AGENT 2 (App Builder) in the FluentStep Content Pipeline.

YOUR TASK:
Build interactive roleplay app from verified JSON content.

INPUT FILE:
/scripts/content-pipeline/stage-3-verified/{FILENAME}-AGENT3-verified.json

PROCESS:
1. Parse the JSON file
2. Build interactive app where users:
   - See the roleplay dialogue with blanks to fill
   - Type or select answers
   - Get immediate feedback (✓ correct / ✗ incorrect)
   - See the 3 contextual active recall questions for each chunk
   - Move through chunks sequentially
   - Track progress (e.g., "3/10 chunks completed")

DESIGN REQUIREMENTS (v1):
□ Clean, minimal UI (no clutter)
□ Mobile-friendly (responsive design)
□ Works locally (no backend needed)
□ Single-page app (no page reloads)
□ Pleasant typography and spacing
□ Accessible (good contrast, readable fonts)

RECOMMENDED TECH:
- HTML + React component (fits existing app)
- Or: Plain HTML + vanilla JS (standalone)
- Use Tailwind CSS for styling (consistent with FluentStep theme)

WORKFLOW:
1. Read verified JSON
2. Create component structure:
   - ChunkCard (displays dialogue with blanks)
   - BlankInput (fill-in field)
   - FeedbackMessage (correct/incorrect alert)
   - RecallQuestion (review questions section)
   - ProgressBar (current chunk / total)
3. Implement blank-filling logic (case-insensitive matching recommended)
4. Implement recall questions (free-text input + feedback)
5. Track user progress through all chunks
6. Test all flows (happy path + errors)

OUTPUT:
Save to: /scripts/content-pipeline/stage-2-apps/{FILENAME}-AGENT2-app.html

For React component: Save as .tsx and note the component export path

INSTRUCTIONS:
- Keep it simple for v1 (no fancy animations, no backend)
- Focus on usability over complexity
- Make it look like professional educational app
- Test: Can a user complete a full run-through without errors?

✅ When complete, reply: "App builder complete. Output saved to: /scripts/content-pipeline/stage-2-apps/{FILENAME}-AGENT2-app.html"
```

---

## HANDOFF FLOW SUMMARY

```
AGENT 1 → Extracts chunks, creates dialogue + recall questions
          Output: stage-1-extracted/{FILENAME}-AGENT1-extracted.json
          ↓
AGENT 3 → Validates content + approves
          Output: stage-3-verified/{FILENAME}-AGENT3-verified.json
            (or) stage-1-extracted/{FILENAME}-AGENT3-feedback.md (if issues)
          ↓
AGENT 2 → Builds interactive app
          Output: stage-2-apps/{FILENAME}-AGENT2-app.html
          ↓
DATA-SERVICES-AGENT → Reviews + Integrates to staticData.ts
```

---

## Status Tracking Commands

```bash
# Check pipeline status
npm run pipeline:status

# Watch for changes (runs in background)
npm run pipeline:watch
```

Check the `_queue/` folder to see all pending transcripts.
