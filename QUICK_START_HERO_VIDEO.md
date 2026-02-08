# 🎬 Hero Video - Quick Start Guide

## TL;DR - Get Hero Video Working in 20 Minutes

### Step 1: Download Video (10 min)
```
Visit: https://www.pexels.com/videos/
Search: "forest path walking"
Click any result → Download → Select "Download" button
Choose: MP4 format, highest quality available
Saves to: ~/Downloads/
```

### Step 2: Optimize Video (5 min - only if you have FFmpeg)
```bash
# Install FFmpeg (if needed)
brew install ffmpeg

# Navigate to Downloads
cd ~/Downloads

# Compress video (makes file much smaller)
ffmpeg -i downloaded-video.mp4 \
  -vcodec h264 -crf 28 -preset slow \
  -acodec aac -b:a 128k \
  nature-journey.mp4

# Extract poster image
ffmpeg -i nature-journey.mp4 -ss 00:00:01 -vframes 1 nature-journey-poster.jpg
```

**Skip optimization?** No problem! The video will work as-is, just larger file size.

### Step 3: Copy Files (1 min)
```bash
# Copy to project
cp ~/Downloads/nature-journey.mp4 \
   /path/to/project/public/videos/

cp ~/Downloads/nature-journey-poster.jpg \
   /path/to/project/public/videos/

# Verify
ls -lh /path/to/project/public/videos/
```

### Step 4: Test (2 min)
```bash
cd /path/to/project
npm run dev
# Open http://localhost:5173 in browser
# Hero video should appear and autoplay (muted)
```

---

## Don't Have FFmpeg?

No problem! Use the video as-is:
1. Download MP4 from Pexels
2. Copy to `public/videos/nature-journey.mp4`
3. It will work, just with a larger file size
4. Install FFmpeg later to optimize

---

## Files You'll Have After Setup

```
public/videos/
├── nature-journey.mp4          (2-5 MB, or larger if not optimized)
└── nature-journey-poster.jpg   (200-400 KB)
```

That's it! Hero video is live.

---

## What the Hero Video Does

✅ **Full-screen background** - Plays at page load
✅ **Autoplays muted** - Starts automatically (no sound)
✅ **Loops smoothly** - Continuous playback
✅ **Text overlay** - "Your Journey to English Fluency"
✅ **CTA button** - "Explore Scenarios"
✅ **Smooth scroll** - Click button → scrolls to scenarios
✅ **Responsive** - Works on mobile, tablet, desktop
✅ **Accessible** - Respects reduced motion preference

---

## Video Requirements

| Aspect | Spec |
|--------|------|
| Format | MP4 (H.264) |
| Resolution | 1920x1080 or 1280x720 |
| Duration | 10-20 seconds |
| File Size | 2-5 MB (optimized), up to 50 MB (raw) |
| Frame Rate | 30fps |
| Aspect Ratio | 16:9 |
| Content | Forest/hiking/nature/woods |

---

## Where to Download Videos

**Best**: Pexels
- https://www.pexels.com/videos/
- Free, no attribution, high quality
- Search: "forest path", "hiking trail", "woodland"

**Good**: Pixabay
- https://pixabay.com/videos/
- Free, no attribution
- Same search terms

**Also Works**: Unsplash, Coverr
- Similar quality, free

---

## Troubleshooting

**Q: Video won't autoplay**
A: This is normal! Browsers require muted video for autoplay.

**Q: Where do I put the video files?**
A: `public/videos/nature-journey.mp4` and `public/videos/nature-journey-poster.jpg`

**Q: Poster image (JPG) - do I need it?**
A: No, it's optional. Makes video load faster visually, but not required.

**Q: How do I create the poster image?**
A: `ffmpeg -i nature-journey.mp4 -ss 00:00:01 -vframes 1 nature-journey-poster.jpg`

**Q: Do I need to modify any code?**
A: No! The component is pre-configured. Just add the video files.

**Q: Can I use a different video?**
A: Yes, any MP4 will work. Replace the filename if needed.

---

## Optional: Automated Setup

Instead of manual steps:
```bash
bash scripts/download-hero-video.sh
# Follow interactive prompts
```

---

## Build Status

✅ Build successful: 0 errors, 0 warnings
✅ Component ready: HeroVideo.tsx created
✅ Integration done: TopicSelector.tsx updated
✅ CSS added: index.css enhanced
✅ Documentation: Complete

---

## What Changed in Code

**New Files**:
- `components/HeroVideo.tsx` - Hero video component
- `scripts/download-hero-video.sh` - Download script

**Modified Files**:
- `components/TopicSelector.tsx` - Imported hero, changed default view
- `index.css` - CSS animations added

**No Changes Needed**: All services, other components, build config

---

## Next Steps

1. ✅ Code is done
2. ⏳ Download video from Pexels (10 min)
3. ⏳ Optimize with FFmpeg (5 min) - optional
4. ⏳ Copy to `public/videos/` (1 min)
5. ⏳ Test in browser (2 min)

**Total Time**: 20-25 minutes

---

## All Set?

After copying video files to `public/videos/`:

```bash
npm run dev
# Visit http://localhost:5173
# Hero video appears on page load ✅
```

Questions? See full docs in:
- `HERO_VIDEO_SETUP.md` - Detailed setup guide
- `HERO_IMPLEMENTATION_COMPLETE.md` - Full implementation details
- `components/HeroVideo.tsx` - Component source code

---

## Timeline Estimate

| Task | Time |
|------|------|
| Download video | 5-10 min |
| Optimize (FFmpeg) | 5 min (optional) |
| Copy files | 1 min |
| Test | 2-5 min |
| **Total** | **15-20 min** |

That's it! 🎉
