# Google Cloud Text-to-Speech Setup Guide

## Phase 1: Google Cloud Project Setup (30 minutes)

### Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click "Create Project" (or select from dropdown if you have one)
3. Enter project name: `FluentStep-TTS`
4. Click "Create"
5. Wait for project creation (1-2 minutes)

### Step 2: Enable Text-to-Speech API

1. Search for "Text-to-Speech API" in the search bar
2. Click on "Cloud Text-to-Speech API"
3. Click "Enable" button
4. Wait for API to be enabled (may take 30 seconds)

### Step 3: Create API Key

1. Go to "Credentials" (left sidebar)
2. Click "Create Credentials" → "API Key"
3. Copy the API key (looks like `AIza...`)
4. Click "Restrict Key" (important for security)
5. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domain: `fluentstep-ielts-roleplay-engine.vercel.app`
   - Also add `localhost:5173` for local development
6. Under "API restrictions":
   - Select "Restrict key"
   - Search for and select "Cloud Text-to-Speech API"
7. Click "Save"

### Step 4: Add Environment Variable to Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select "fluentstep-ielts-roleplay-engine" project
3. Click "Settings" → "Environment Variables"
4. Click "Add New"
   - **Name**: `GOOGLE_TTS_API_KEY`
   - **Value**: Paste the API key from Step 3
   - **Environments**: Select "Production" and "Preview"
5. Click "Save"

### Step 5: Add to Local Development

1. Create `.env.local` in project root (if it doesn't exist):
   ```bash
   touch .env.local
   ```

2. Add the API key:
   ```
   GOOGLE_TTS_API_KEY=your_api_key_here
   ```

3. Never commit `.env.local` to git (it's in `.gitignore`)

### Step 6: Verify Setup

1. Deploy to Vercel (git push)
2. In browser console, check that network requests to `/api/tts` return base64 audio
3. Test locally: `npm run dev` and check console for errors

## Pricing & Free Tier Details

### Google Cloud Free Tier (Permanent)
- **Free**: 1,000,000 characters per month
- **Included voices**: All WaveNet voices (premium quality)
- **No credit card required** (free tier never expires)

### Your Usage Projection
- **Current**: 39 scenarios × ~1,200 chars = 46,800 chars
- **Monthly growth**: ~10 scenarios × 1,200 chars = 12,000 chars
- **Year 1 total**: 46,800 + (12,000 × 12) = 190,800 chars
- **Free tier percentage**: 19.08% of 1M limit
- **Cost**: **$0.00** (well under free tier)

### If You Exceed Free Tier (Unlikely)
- **Cost**: $16.00 per 1,000,000 characters
- **For 200 scenarios**: ~$3.20 total
- **Still essentially free**

## Troubleshooting

### API Key Errors

**Error: "API key not valid"**
- Check that API key is exactly copied (no extra spaces)
- Verify API key is in `.env.local` AND Vercel environment variables
- Restart `npm run dev` after adding `.env.local`

**Error: "Text-to-Speech API is not enabled"**
- Go to https://console.cloud.google.com/apis/library/texttospeech.googleapis.com
- Click "Enable"

**Error: "Quota exceeded"**
- Unlikely (you have 1M chars/month)
- Check usage at: https://console.cloud.google.com/apis/dashboard
- Quota resets on 1st of each month

### Network Errors

**Error: "Failed to fetch from /api/tts"**
- Check that Vercel Edge Function is deployed (git push + wait for build)
- Verify API key is set in Vercel environment variables
- Check browser console for CORS or 403 errors

**Error: "Audio won't play"**
- Audio blob URL may be revoked
- Check if browser supports Web Audio API (all modern browsers do)
- Try in incognito mode (some browser extensions block audio)

## Testing Checklist

- [ ] Google Cloud project created
- [ ] Text-to-Speech API enabled
- [ ] API key generated and restricted
- [ ] Vercel environment variable set
- [ ] Local `.env.local` created
- [ ] `npm run dev` runs without errors
- [ ] Network tab shows `/api/tts` requests
- [ ] Audio plays in browser (natural British voice)
- [ ] Audio is cached (second click = instant playback)

## Cost Safety Summary

**Bottom line**: You will NEVER pay for Google Cloud TTS with your usage level.

- Free tier: 1M chars/month
- Your usage: ~16k chars/month
- Remaining capacity: 84% unused
- Annual cost at current growth: **$0.00**

Even if you grow to 100 scenarios (very large), you'd still only use:
- 120,000 chars/month
- Still 88% under free tier

The only way to be charged would be to generate:
- **1M+ characters in a single month**
- With 39 scenarios, that would require **800+ scenario plays per month**
- Extremely unlikely for an educational app
