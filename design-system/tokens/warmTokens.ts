/**
 * Warm Design Tokens
 * Fresh, encouraging color palette with orange/teal/green for adult learners
 */

export const warmTokens = {
  colors: {
    // Primary: Sunset Gradient (warm, optimistic, energizing)
    primary: {
      50: '#FFF4ED',    // Soft peach
      100: '#FFE6D5',   // Light cream
      200: '#FECFB9',   // Peachy
      300: '#FDBA8C',   // Warm coral
      400: '#FB923C',   // Orange
      500: '#F97316',   // Vibrant orange (CTA)
      600: '#EA580C',   // Deep tangerine
      700: '#C2410C',   // Rich terracotta
      800: '#92220E',   // Deep orange
      900: '#7C2D12'    // Dark earth
    },

    // Accent: Ocean Teal (fresh, calming, communicative)
    accent: {
      50: '#ECFEFF',    // Ice teal
      100: '#CFFAFE',   // Light cyan
      200: '#A5F3FC',   // Soft teal
      300: '#5EEAD4',   // Bright teal
      400: '#22D3EE',   // Cyan
      500: '#14B8A6',   // Primary teal
      600: '#0D9488',   // Deep teal
      700: '#0F766E',   // Darker teal
      800: '#134E4A',   // Forest teal
      900: '#0C4A48'    // Deep forest
    },

    // Success: Meadow Green (growth, achievement, celebration)
    success: {
      50: '#F0FDF4',    // Pale green
      100: '#DCFCE7',   // Light green
      200: '#BBEF63',   // Bright green
      300: '#86EFAC',   // Light green
      400: '#4ADE80',   // Green
      500: '#22C55E',   // Vibrant green
      600: '#16A34A',   // Deep green
      700: '#15803D',   // Forest green
      800: '#166534',   // Dark forest
      900: '#14532D'    // Very dark green
    },

    // Neutral: Warm Grays (sophisticated warmth, not cold)
    neutral: {
      50: '#FAFAF9',    // Warm white
      100: '#F5F5F4',   // Soft gray
      200: '#E7E5E4',   // Light taupe
      300: '#D6D3D1',   // Taupe
      400: '#A8A29E',   // Medium stone
      500: '#78716C',   // Stone
      600: '#57534E',   // Warm charcoal
      700: '#44403C',   // Dark charcoal
      800: '#292524',   // Very dark
      900: '#1C1917'    // Almost black
    },

    // Semantic colors
    semantic: {
      success: '#22C55E',      // Vibrant green
      error: '#EF4444',        // Red (kept for errors)
      warning: '#F97316',      // Orange (warm warning)
      info: '#14B8A6'          // Teal (informational)
    },

    // Gradients for visual interest
    gradients: {
      sunrise: 'linear-gradient(135deg, #F97316 0%, #FDBA8C 50%, #FFF4ED 100%)',
      ocean: 'linear-gradient(135deg, #14B8A6 0%, #5EEAD4 100%)',
      success: 'linear-gradient(135deg, #22C55E 0%, #86EFAC 100%)',
      warm: 'linear-gradient(135deg, #FFF4ED 0%, #ECFEFF 100%)',
      peachy: 'linear-gradient(to bottom, #FFF4ED, #FFE6D5)',
      tealy: 'linear-gradient(to bottom, #ECFEFF, #E0F2FE)'
    }
  },

  // Warm-tinted shadows (orange tint instead of cold black)
  shadows: {
    sm: '0 1px 3px rgba(249, 115, 22, 0.08)',
    md: '0 4px 6px rgba(249, 115, 22, 0.12)',
    lg: '0 10px 25px rgba(249, 115, 22, 0.15)',
    xl: '0 20px 40px rgba(249, 115, 22, 0.18)',
    '2xl': '0 25px 50px rgba(249, 115, 22, 0.20)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(249, 115, 22, 0.3)',
    glowBright: '0 0 30px rgba(249, 115, 22, 0.4)',
    glowTeal: '0 0 20px rgba(20, 184, 166, 0.2)',
    glowGreen: '0 0 20px rgba(34, 197, 94, 0.2)',
    // Editorial shadows for premium feel
    editorial: {
      soft: '0 2px 8px rgba(249, 115, 22, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
      medium: '0 4px 16px rgba(249, 115, 22, 0.08), 0 2px 6px rgba(0, 0, 0, 0.06)',
      large: '0 12px 32px rgba(249, 115, 22, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)',
      dramatic: '0 20px 48px rgba(249, 115, 22, 0.15), 0 8px 20px rgba(0, 0, 0, 0.10)'
    }
  },

  // Enhanced typography with warmer, friendlier feel
  typography: {
    fontFamily: {
      // Outfit: Geometric, friendly sans-serif
      // Caveat: Handwritten for celebrations and personality
      display: ['"Outfit"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      accent: ['"Caveat"', 'cursive'],
      sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif']
    },
    fontSize: {
      xs: ['0.8125rem', { lineHeight: '1.125rem' }],  // 13px
      sm: ['0.9375rem', { lineHeight: '1.375rem' }],  // 15px
      base: ['1.0625rem', { lineHeight: '1.625rem' }],// 17px (slightly larger)
      lg: ['1.1875rem', { lineHeight: '1.75rem' }],   // 19px
      xl: ['1.3125rem', { lineHeight: '1.875rem' }],  // 21px
      '2xl': ['1.625rem', { lineHeight: '2rem' }],    // 26px
      '3xl': ['2rem', { lineHeight: '2.5rem' }],      // 32px
      '4xl': ['2.5rem', { lineHeight: '3rem' }],      // 40px
      '5xl': ['3.25rem', { lineHeight: '1.2' }]       // 52px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 800
    }
  },

  // Smooth, encouraging transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '250ms cubic-bezier(0.34, 1.56, 0.64, 1)'
  },

  // Radius: Organic, friendly curves
  radius: {
    sm: '0.5rem',      // 8px
    md: '0.75rem',     // 12px
    lg: '1rem',        // 16px
    xl: '1.5rem',      // 24px
    '2xl': '2rem',     // 32px
    '3xl': '1.875rem', // 30px
    full: '9999px'
  }
};

export type WarmToken = typeof warmTokens;
