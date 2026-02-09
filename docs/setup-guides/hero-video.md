# Hero Video Setup Guide

## Video Files Required

The hero section requires two files in `/public/videos/`:

1. **nature-journey.mp4** (Main video)
   - Format: MP4 (H.264 codec)
   - Resolution: 1920x1080 (1080p) or 1280x720 (720p)
   - Duration: 10-20 seconds (looping recommended)
   - File size: 2-5 MB (after compression)
   - Frame rate: 30fps
   - Aspect ratio: 16:9

2. **nature-journey-poster.jpg** (Fallback image)
   - Format: JPEG
   - Resolution: 1920x1080 or 1280x720
   - File size: ~200-400 KB
   - Shows while video loads

## Video Specifications

**Theme**: Forest path POV / hiking trail / woodland walk / mountain journey
- Walking through woods/forest
- First-person perspective (POV)
- Natural, cinematic quality
- Loopable (no abrupt start/end)

## How to Get Videos

### Option 1: Download from Pexels (Recommended)

1. Go to https://www.pexels.com/videos/
2. Search for:
   - "forest path walking"
   - "hiking trail pov"
   - "nature journey"
   - "woodland walk"
   - "mountain hiking"

3. Download the highest quality MP4 available
4. Extract poster image from video (see Optimization below)

### Option 2: Download from Pixabay

1. Go to https://pixabay.com/videos/
2. Use same search terms as above
3. Download MP4 format

### Option 3: Use Your Own Video

Record a walking video through nature/forest and convert to MP4

---

## Video Optimization

### Using FFmpeg

```bash
# Install FFmpeg (if needed)
# macOS: brew install ffmpeg
# Ubuntu: sudo apt-get install ffmpeg
# Windows: Download from ffmpeg.org

# Compress video (keep quality, reduce file size)
ffmpeg -i input.mp4 \
  -vcodec h264 \
  -crf 28 \
  -preset slow \
  -acodec aac \
  -b:a 128k \
  output.mp4

# Extract poster image (first frame)
ffmpeg -i output.mp4 -ss 00:00:01 -vframes 1 poster.jpg
```

### Parameters Explained

- **-crf 28**: Quality (lower = better, 18-28 recommended, smaller files at 28)
- **-preset slow**: Compression speed (slow = smaller file, takes longer)
- **-b:a 128k**: Audio bitrate (lower = smaller file, still acceptable quality)

### Expected Results

```
Input: 50 MB @ 1080p (original)
↓ (with ffmpeg optimization)
Output: 2-3 MB @ 1080p (compressed)
```

---

## Installation Steps

1. **Download video from Pexels or similar**
   ```bash
   # Videos downloaded to your Downloads folder
   ```

2. **Optimize with FFmpeg**
   ```bash
   cd ~/Downloads
   ffmpeg -i "Forest Path Walking.mp4" -vcodec h264 -crf 28 -preset slow -acodec aac -b:a 128k nature-journey.mp4
   ffmpeg -i nature-journey.mp4 -ss 00:00:01 -vframes 1 nature-journey-poster.jpg
   ```

3. **Copy to project**
   ```bash
   cp ~/Downloads/nature-journey.mp4 /path/to/project/public/videos/
   cp ~/Downloads/nature-journey-poster.jpg /path/to/project/public/videos/
   ```

4. **Verify files exist**
   ```bash
   ls -lh public/videos/
   # Should show:
   # -rw-r--r--  nature-journey.mp4 (2-5 MB)
   # -rw-r--r--  nature-journey-poster.jpg (200-400 KB)
   ```

5. **Test in browser**
   ```bash
   npm run dev
   # Visit http://localhost:5173
   # Hero video should appear and autoplay
   ```

---

## Testing Checklist

- [ ] Video autoplays on page load (muted)
- [ ] Video loops smoothly (no visible restart)
- [ ] Poster image loads instantly (fallback)
- [ ] Text overlay is readable (high contrast)
- [ ] CTA button is clickable and functional
- [ ] Scroll to scenarios works smoothly
- [ ] Works on mobile (smaller height)
- [ ] Works with reduced motion enabled (shows static image)
- [ ] Works on slow connections (poster shows while loading)

---

## Troubleshooting

### Video doesn't play
- Check file is in `/public/videos/nature-journey.mp4`
- Verify file format is MP4 with H.264 codec
- Try different browser (Chrome, Firefox, Safari)
- Check browser console for errors

### Video plays but no sound
- This is expected! Video is muted for autoplay (best UX practice)
- Sound can be added with volume control if needed

### Poster image doesn't show
- Extract with FFmpeg: `ffmpeg -i nature-journey.mp4 -ss 00:00:01 -vframes 1 poster.jpg`
- Ensure file is in `/public/videos/nature-journey-poster.jpg`
- Try JPEG instead of PNG

### Video file too large
- Reduce quality: increase `-crf` to 30 or 32
- Reduce resolution: `-vf scale=1280:-1` for 720p
- Reduce duration: cut video to 10-15 seconds

### Bundle size impact
- Video files are NOT bundled (served separately)
- Compression reduces initial load from 50 MB → 2-3 MB
- Minimal impact on initial page load

---

## Free Video Sources

### Pexels
- Website: https://www.pexels.com/videos/
- License: Free, no attribution required
- Quality: High (1080p+)
- Categories: Nature, Travel, Outdoors

### Pixabay
- Website: https://pixabay.com/videos/
- License: Free, no attribution required
- Quality: Good (720p-1080p)
- Diverse categories

### Unsplash Videos
- Website: https://unsplash.com/napi/videos/
- License: Free, no attribution required
- Quality: Excellent

### Coverr
- Website: https://coverr.co/
- License: Free, no attribution required
- Quality: Cinematic (good for hero videos)

---

## Current Status

✅ HeroVideo component created (`components/HeroVideo.tsx`)
✅ Integrated into TopicSelector (`components/TopicSelector.tsx`)
✅ Default view changed to list (with hero video)
✅ CSS enhancements added (`index.css`)
✅ Build verified (0 TypeScript errors)

⏳ **NEXT STEP**: Download video from Pexels and place in `/public/videos/`

---

## Video Component API

```typescript
<HeroVideo
  videoSrc="/videos/nature-journey.mp4"           // Required: path to MP4
  posterSrc="/videos/nature-journey-poster.jpg"  // Optional: fallback image
  headline="Your Journey to English Fluency"      // Optional: h1 text
  subtitle="Master IELTS speaking..."             // Optional: subtitle
  ctaText="Explore Scenarios"                     // Optional: button text
  onCtaClick={() => { /* scroll to list */ }}    // Optional: button click handler
  height="three-quarter"                          // Optional: 'full' or 'three-quarter'
/>
```

**Props**:
- `videoSrc`: MP4 video file path
- `posterSrc`: JPEG fallback image
- `headline`: Main heading (supports HTML)
- `subtitle`: Subheading text
- `ctaText`: Call-to-action button text
- `onCtaClick`: Callback when CTA clicked
- `height`: 'full' (100vh) or 'three-quarter' (60-80vh responsive)

---

## Performance Notes

- Video is not bundled, served as static asset
- Lazy loading of below-fold content
- Reduced motion support (pauses video)
- High contrast mode support
- Mobile-optimized (shorter height on small screens)
- Loading spinner while video buffering
- Fallback poster image for instant display

---

## Next Steps

1. Download a nature/forest video from Pexels
2. Optimize with FFmpeg (2-3 MB target)
3. Extract poster image
4. Copy both files to `/public/videos/`
5. Test in browser
6. Push to production

Estimated time: 10-15 minutes
