import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: 'rgb(var(--color-bg))',
          card: 'rgb(var(--color-card))',
          border: 'rgb(var(--color-border))',
          primary: 'rgb(var(--color-primary))',
          secondary: 'rgb(var(--color-secondary))',
          text: 'rgb(var(--color-text))',
          muted: 'rgb(var(--color-muted))',
          success: 'rgb(var(--color-success))',
          error: 'rgb(var(--color-error))'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 15px rgba(108, 99, 255, 0.35)',
        glowSecondary: '0 0 15px rgba(0, 212, 255, 0.3)',
        glass: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #6C63FF, #00D4FF)',
        'gradient-glow': 'radial-gradient(circle at center, rgba(108, 99, 255, 0.15), transparent 70%)'
      }
    },
  },
  plugins: [],
} satisfies Config;
