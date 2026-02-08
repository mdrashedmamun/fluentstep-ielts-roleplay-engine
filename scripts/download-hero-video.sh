#!/bin/bash

# Hero Video Download Script
# Downloads a free nature/forest video from Pexels and optimizes it

set -e

VIDEOS_DIR="public/videos"
TEMP_DIR="/tmp/hero-video"

# Create directories
mkdir -p "$VIDEOS_DIR"
mkdir -p "$TEMP_DIR"

echo "🎬 Hero Video Setup Assistant"
echo "================================"
echo ""
echo "This script will help you download and set up a forest/nature video."
echo ""
echo "Option 1: Download from Pexels (Recommended)"
echo "Option 2: Use local file"
echo "Option 3: Create placeholder (testing only)"
echo ""
read -p "Choose option (1-3): " choice

case $choice in
  1)
    echo ""
    echo "Visit: https://www.pexels.com/videos/"
    echo "Search for: 'forest path walking' or 'hiking trail pov'"
    echo "Download the MP4 file"
    echo ""
    read -p "Enter the path to your downloaded MP4 file: " video_file
    
    if [ ! -f "$video_file" ]; then
      echo "❌ File not found: $video_file"
      exit 1
    fi
    
    echo "📝 Optimizing video (this may take a few minutes)..."
    
    # Check if ffmpeg is available
    if ! command -v ffmpeg &> /dev/null; then
      echo ""
      echo "⚠️  FFmpeg not found. Please install it:"
      echo "   macOS: brew install ffmpeg"
      echo "   Ubuntu: sudo apt-get install ffmpeg"
      echo "   Windows: Download from ffmpeg.org"
      echo ""
      echo "For now, copying video as-is..."
      cp "$video_file" "$VIDEOS_DIR/nature-journey.mp4"
    else
      # Compress video
      ffmpeg -i "$video_file" \
        -vcodec h264 \
        -crf 28 \
        -preset slow \
        -acodec aac \
        -b:a 128k \
        "$VIDEOS_DIR/nature-journey.mp4"
      
      # Extract poster
      ffmpeg -i "$VIDEOS_DIR/nature-journey.mp4" \
        -ss 00:00:01 \
        -vframes 1 \
        "$VIDEOS_DIR/nature-journey-poster.jpg"
    fi
    ;;
    
  2)
    read -p "Enter the path to your MP4 file: " video_file
    
    if [ ! -f "$video_file" ]; then
      echo "❌ File not found: $video_file"
      exit 1
    fi
    
    cp "$video_file" "$VIDEOS_DIR/nature-journey.mp4"
    echo "✅ Video copied to $VIDEOS_DIR/"
    ;;
    
  3)
    echo "📝 Creating placeholder video (1 second, for testing)..."
    
    if ! command -v ffmpeg &> /dev/null; then
      echo "⚠️  FFmpeg not found. Skipping placeholder creation."
      echo "Install FFmpeg to create test video."
      exit 1
    fi
    
    # Create a simple color video (fast)
    ffmpeg -f lavfi \
      -i "color=c=000000:s=1920x1080:d=1" \
      -f lavfi \
      -i "anullsrc=r=44100:cl=mono" \
      -c:v h264 \
      -c:a aac \
      -pix_fmt yuv420p \
      "$VIDEOS_DIR/nature-journey.mp4"
    
    # Create poster
    ffmpeg -f lavfi \
      -i "color=c=1a1a1a:s=1920x1080:d=0.1" \
      "$VIDEOS_DIR/nature-journey-poster.jpg"
    
    echo "✅ Placeholder video created (for testing only)"
    ;;
    
  *)
    echo "❌ Invalid option"
    exit 1
    ;;
esac

echo ""
echo "✅ Setup complete!"
echo ""
echo "Files created:"
ls -lh "$VIDEOS_DIR/"
echo ""
echo "Next steps:"
echo "1. npm run dev"
echo "2. Visit http://localhost:5173"
echo "3. Hero video should appear on page load"
