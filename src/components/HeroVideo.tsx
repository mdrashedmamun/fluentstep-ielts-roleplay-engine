import React, { useEffect, useRef, useState } from 'react';

interface HeroVideoProps {
  videoSrc: string;
  posterSrc?: string;
  headline?: string;
  subtitle?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  height?: 'full' | 'three-quarter';
}

export const HeroVideo: React.FC<HeroVideoProps> = ({
  videoSrc,
  posterSrc,
  headline = "Your Journey to English Fluency",
  subtitle = "Master IELTS speaking through 43 immersive conversations",
  ctaText = "Explore Scenarios",
  onCtaClick,
  height = 'three-quarter'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (videoRef.current && !prefersReducedMotion) {
      videoRef.current.play().catch(err => {
        console.log('Autoplay prevented:', err);
      });
    }
  }, [prefersReducedMotion]);

  const heightClass = height === 'full' ? 'h-screen' : 'h-[60vh] sm:h-[70vh] md:h-[80vh]';

  return (
    <div className={`relative ${heightClass} w-full overflow-hidden`}>
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        poster={posterSrc}
        muted
        loop
        playsInline
        onLoadedData={() => setIsLoaded(true)}
        style={{ display: prefersReducedMotion ? 'none' : 'block' }}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Fallback Poster for Reduced Motion */}
      {prefersReducedMotion && posterSrc && (
        <img
          src={posterSrc}
          alt="Nature journey"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70" />

      {/* Content Overlay */}
      <div className="relative h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {headline}
        </h1>

        {/* Subtitle */}
        <p
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {subtitle}
        </p>

        {/* CTA Button */}
        <button
          onClick={onCtaClick}
          className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-base sm:text-lg font-bold rounded-2xl shadow-editorial-dramatic transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400"
        >
          {ctaText}
        </button>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-white/70"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>

      {/* Loading indicator */}
      {!isLoaded && !prefersReducedMotion && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      )}
    </div>
  );
};

export default HeroVideo;
