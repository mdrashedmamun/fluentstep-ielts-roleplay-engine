# Content Pipeline Setup Guide

Welcome to the **Single Source of Truth** content pipeline for FluentStep.

This system manages the entire journey from YouTube transcript → Agent 1 → Agent 3 → Agent 2 → Production app.

---

## Folder Structure

```
scripts/content-pipeline/
├── transcripts/              ← PUT YOUR .txt FILES HERE
│   └── bbc-6-minute-english-childhood-dreams.txt (example)
├── stage-1-extracted/        ← Agent 1 outputs JSON here
├── stage-3-verified/         ← Agent 3 saves approved JSON here
├── stage-2-apps/             ← Agent 2 saves final apps here
├── _queue/                   ← Tracking metadata (auto-generated)
├── cli.ts                    ← Pipeline watcher & status CLI
├── HANDOFF_TEMPLATES.md      ← Copy-paste prompts for agents
└── README.md                 ← This file
```

---

## Quick Start

### Step 1: Add a Transcript

Drop a `.txt` file in `scripts/content-pipeline/transcripts/`:

```bash
# Already done! Your BBC transcript is here:
scripts/content-pipeline/transcripts/bbc-6-minute-english-childhood-dreams.txt
```

### Step 2: Start the Watcher (Optional)

```bash
npm run pipeline:watch
```

This monitors the `transcripts/` folder and alerts you when each stage completes. Runs in background, checks every 5 seconds.

**Note:** You can also manually check progress:
```bash
npm run pipeline:status
```

### Step 3: Brief Agent 1 (Content Specialist)

1. Open [HANDOFF_TEMPLATES.md](./HANDOFF_TEMPLATES.md)
2. Copy the **AGENT 1** template
3. Replace `{FILENAME}` with: `bbc-6-minute-english-childhood-dreams`
4. Open Claude Code and paste the brief
5. Agent 1 extracts 8-12 chunks and saves JSON to `stage-1-extracted/`

**Expected output:**
```
scripts/content-pipeline/stage-1-extracted/
└── bbc-6-minute-english-childhood-dreams-AGENT1-extracted.json
```

### Step 4: Brief Agent 3 (QA Verifier)

1. Open [HANDOFF_TEMPLATES.md](./HANDOFF_TEMPLATES.md)
2. Copy the **AGENT 3** template  
3. Replace `{FILENAME}` with: `bbc-6-minute-english-childhood-dreams`
4. Paste to Claude Code
5. Agent 3 validates and either:
   - ✅ APPROVES → Saves to `stage-3-verified/`
   - ❌ ISSUES → Saves feedback to `stage-1-extracted/` with revision notes

**If approved:**
```
scripts/content-pipeline/stage-3-verified/
└── bbc-6-minute-english-childhood-dreams-AGENT3-verified.json
```

**If issues:**
```
scripts/content-pipeline/stage-1-extracted/
└── bbc-6-minute-english-childhood-dreams-AGENT3-feedback.md
```

→ **If feedback:** Brief Agent 1 again with the feedback file, ask them to revise. Then brief Agent 3 again.

### Step 5: Brief Agent 2 (App Builder)

1. Open [HANDOFF_TEMPLATES.md](./HANDOFF_TEMPLATES.md)
2. Copy the **AGENT 2** template
3. Replace `{FILENAME}` with: `bbc-6-minute-english-childhood-dreams`
4. Paste to Claude Code  
5. Agent 2 builds interactive app, saves to `stage-2-apps/`

**Expected output:**
```
scripts/content-pipeline/stage-2-apps/
└── bbc-6-minute-english-childhood-dreams-AGENT2-app.html
```

### Step 6: Review & Deploy

The final app is ready in `stage-2-apps/`. You can:

- **Test locally:** Open the `.html` or React component in browser
- **Review:** Check quality, test all blanks and recall questions
- **Deploy:** Pass to data-services-agent for integration to staticData.ts and Vercel

---

## File Naming Convention

All outputs follow this pattern:
- **Agent 1:** `{transcript_name}-AGENT1-extracted.json`
- **Agent 3:** `{transcript_name}-AGENT3-verified.json`  
- **Agent 3 (if issues):** `{transcript_name}-AGENT3-feedback.md`
- **Agent 2:** `{transcript_name}-AGENT2-app.html`

This makes it easy to track which agent created each file.

---

## Commands

```bash
# Check status of all transcripts
npm run pipeline:status

# Watch for changes (runs continuously)
npm run pipeline:watch

# Stop watcher
# Ctrl+C in terminal where watcher is running
```

---

## Example Data Flow

```
1. You add: bbc-6-minute-english-childhood-dreams.txt
   ↓ (runs npm run pipeline:watch)
   CLI alerts: "NEW TRANSCRIPT DETECTED - Ready for Agent 1"

2. You brief Agent 1 with template
   ↓ Agent 1 processes, saves output
   stage-1-extracted/bbc-6-minute-english-childhood-dreams-AGENT1-extracted.json
   CLI alerts: "AGENT 1 COMPLETE - Ready for Agent 3"

3. You brief Agent 3 with template  
   ↓ Agent 3 validates, saves output
   stage-3-verified/bbc-6-minute-english-childhood-dreams-AGENT3-verified.json
   CLI alerts: "AGENT 3 COMPLETE - Ready for Agent 2"

4. You brief Agent 2 with template
   ↓ Agent 2 builds app, saves output
   stage-2-apps/bbc-6-minute-english-childhood-dreams-AGENT2-app.html
   CLI alerts: "PIPELINE COMPLETE - Ready for review"

5. You review app locally, then pass to data-services-agent for production integration
```

---

## Troubleshooting

### "No transcripts found"
- Make sure your `.txt` file is in `scripts/content-pipeline/transcripts/`
- File must have `.txt` extension
- Run `npm run pipeline:status` to verify

### Agent 1 didn't save output
- Check that they saved to EXACT path: `scripts/content-pipeline/stage-1-extracted/{filename}-AGENT1-extracted.json`
- JSON must be valid (not malformed)
- File must be readable (check permissions)

### Agent 3 says "Issues found"
- Read the feedback file: `stage-1-extracted/{filename}-AGENT3-feedback.md`
- Brief Agent 1 again with the specific revision notes
- After revision, brief Agent 3 again to re-validate

### Can't run CLI commands
- Make sure you're in project root: `/fluentstep_-ielts-roleplay-engine/`
- Build CLI: `npm run build` first
- Run watcher: `npm run pipeline:watch`

---

## Next Steps After Pipeline

Once Agent 2 completes and you've reviewed the app:

1. **Test the interactive component**
   - Open the HTML file in browser
   - Fill in blanks
   - Check recall questions
   - Verify feedback works

2. **Pass to data-services-agent**
   - Provide path: `scripts/content-pipeline/stage-2-apps/{filename}-AGENT2-app.html`
   - They'll integrate scenarios to `src/services/staticData.ts`
   - They'll handle Vercel deployment

3. **Track in .staging/**
   - Content will be moved to: `.staging/approved/`
   - Then imported to staticData.ts with file locking
   - Then archived to `.staging/archived/`

---

## File Locking & Safety

- ✅ **No conflicts:** Agents work sequentially, not parallel
- ✅ **Single source of truth:** All files in `/scripts/content-pipeline/`
- ✅ **Version tracking:** File names show which agent created them
- ✅ **Atomic integration:** data-services-agent uses file locking when merging to staticData.ts

---

**Status:** ✅ Pipeline ready to use. Transcript saved. Start with Agent 1!
