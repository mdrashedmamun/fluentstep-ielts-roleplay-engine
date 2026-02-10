/**
 * Design System Tokens
 * Centralized design values for colors, spacing, typography, and shadows
 */

import { warmTokens } from './warmTokens';

// Use warm tokens as the primary design system
export const tokens = warmTokens;

// Keep legacy tokens export for backwards compatibility
export const legacyTokens = {
  colors: {
    primary: {
      50: '#eef2ff',    // indigo-50
      100: '#e0e7ff',   // indigo-100
      500: '#6366f1',   // indigo-500
      600: '#4f46e5',   // indigo-600
      700: '#4338ca',   // indigo-700
      900: '#312e81',   // indigo-900
      950: '#1e1b4b'    // indigo-950
    },
    neutral: {
      50: '#f8fafc',    // slate-50
      100: '#f1f5f9',   // slate-100
      200: '#e2e8f0',   // slate-200
      400: '#94a3b8',   // slate-400
      500: '#64748b',   // slate-500
      600: '#475569',   // slate-600
      700: '#334155',   // slate-700
      900: '#0f172a'    // slate-900
    },
    semantic: {
      success: '#10b981',   // emerald-500
      error: '#ef4444',     // red-500
      warning: '#f59e0b'    // amber-500
    }
  },
  radius: {
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    primary: '0 10px 25px -5px rgb(99 102 241 / 0.25)' // indigo glow
  },
  typography: {
    fontFamily: {
      sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      display: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif']
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],       // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],      // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],// 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px
      '5xl': ['3rem', { lineHeight: '1.2' }]         // 48px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900
    }
  },
  transitions: {
    fast: '150ms ease-out',
    base: '200ms ease-out',
    slow: '300ms ease-out'
  }
};

export type Token = typeof tokens;
