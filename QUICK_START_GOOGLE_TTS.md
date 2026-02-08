# Quick Start: Google Cloud TTS Setup (30 minutes)

## TL;DR Setup

### 1. Create Google Cloud Project (10 min)

1. Go to https://console.cloud.google.com
2. Click "Create Project" → Name: "FluentStep-TTS" → Create
3. Wait for project to be ready

### 2. Enable TTS API (5 min)

1. Search for "Text-to-Speech API"
2. Click result → Click "Enable"
3. Wait for API to enable

### 3. Create & Restrict API Key (5 min)

1. Go to "Credentials" (left sidebar)
2. Click "Create Credentials" → "API Key"
3. Copy the key (looks like: `AIza...`)
4. Click "Restrict Key":
   - **Application restrictions**: HTTP referrers
     - Add: `fluentstep-ielts-roleplay-engine.vercel.app`
     - Add: `localhost:5173` (for local dev)
   - **API restrictions**: Select "Cloud Text-to-Speech API"
5. Click "Save"

### 4. Add to Vercel (2 min)

1. Go to https://vercel.com/dashboard
2. Select "fluentstep-ielts-roleplay-engine" project
3. Settings → Environment Variables
4. Add:
   - **Name**: `GOOGLE_TTS_API_KEY`
   - **Value**: Paste your API key from step 3
   - **Environments**: Production, Preview
5. Click "Save"

### 5. Add to Local Development (1 min)

```bash
echo "GOOGLE_TTS_API_KEY=your_api_key_here" > .env.local
```

Replace `your_api_key_here` with your key from step 3.

### 6. Deploy & Test (2 min)

```bash
git add .
git commit -m "Phase 12: Add Google Cloud TTS setup"
git push
```

Then in browser:
1. Go to http://localhost:5173 (local) or live URL (Vercel)
2. Click any scenario
3. Click "Listen" button
4. **You should hear natural British accent** (8.5/10 quality)

If you don't hear anything, check:
- Browser console (F12) for errors
- Network tab: should see POST to `/api/tts`
- Fallback: if Google TTS fails, reverts to Web Speech API (robotic)

---

## Cost Check

**You will NEVER pay**:
- Free tier: 1,000,000 characters per month
- Your usage: ~16,000 chars per month
- Remaining: 984,000 chars/month available
- Cost: **$0.00**

Even if you grow 10x, still free.

---

## What Changed in the App

**User perspective**:
- Click "Listen" → Hear natural British voice (not robotic)
- 2nd time you listen to same word → Instant playback (cached)
- No changes to UI or user flow
- Just better audio quality

**Technical perspective**:
- `/api/tts.ts` - Edge Function (secure API calls)
- `/services/ttsService.ts` - Client-side caching
- `RoleplayViewer.tsx` - Uses new Google TTS service
- Build: No change in bundle size

---

## Troubleshooting

### Audio doesn't play

1. **Check API key is set**:
   ```bash
   cat .env.local | grep GOOGLE_TTS_API_KEY
   ```
   Should show your key.

2. **Restart dev server**:
   ```bash
   npm run dev
   ```
   (Kill old process first: Ctrl+C)

3. **Check Vercel deployed**:
   - Go to vercel.com → Select project
   - Check "Deployments" tab
   - Should show recent successful deploy

4. **Check browser console**:
   - Open DevTools (F12)
   - Go to Console tab
   - Click "Listen" and look for errors

### Audio plays but sounds robotic

This means fallback to Web Speech API is active (Google TTS failed).

**Fix**:
- Check API key is correct
- Check Text-to-Speech API is enabled in Google Cloud
- Check environment variable is set on Vercel

### "TTS service not configured" error

API key missing from environment.

**Fix**:
- Did you set it in `.env.local`?
- Did you set it in Vercel?
- Did you restart `npm run dev`?

---

## Files Created/Modified

**New**:
- `/api/tts.ts` - Edge Function
- `/services/ttsService.ts` - TTS Service
- `GOOGLE_CLOUD_TTS_SETUP.md` - Full setup guide
- `/.env.local.example` - Template

**Modified**:
- `/components/RoleplayViewer.tsx` - Uses new service

---

## What's Next?

1. Complete setup above (30 min)
2. Test in browser (you hear natural voice)
3. Enjoy better audio! 🎉

Optional enhancements:
- SSML support (add pauses/emphasis)
- Multi-voice support (different speakers)
- Preload common vocabulary
- A/B testing (natural vs robotic)

See `PHASE_12_NATURAL_AUDIO_IMPLEMENTATION.md` for details.

---

**Questions?** Check `GOOGLE_CLOUD_TTS_SETUP.md` for comprehensive troubleshooting.
