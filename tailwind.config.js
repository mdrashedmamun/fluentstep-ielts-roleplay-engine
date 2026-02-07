import { tokens } from './design-system/tokens/index.ts';

export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
    './design-system/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: tokens.colors.primary,
        neutral: tokens.colors.neutral,
        success: tokens.colors.semantic.success,
        error: tokens.colors.semantic.error,
        warning: tokens.colors.semantic.warning
      },
      borderRadius: {
        ...Object.entries(tokens.radius).reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {})
      },
      boxShadow: {
        ...Object.entries(tokens.shadows).reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {})
      },
      fontFamily: {
        sans: tokens.typography.fontFamily.sans,
        display: tokens.typography.fontFamily.display
      },
      fontSize: {
        ...Object.entries(tokens.typography.fontSize).reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {})
      },
      fontWeight: tokens.typography.fontWeight,
      transitionDuration: {
        fast: tokens.transitions.fast,
        base: tokens.transitions.base,
        slow: tokens.transitions.slow
      }
    }
  },
  plugins: []
};
