import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1C1B1F',
        navy: '#1B2A4A',
        navydark: '#101B33',
        gold: '#B8912F',
        goldlight: '#D9C27E',
        parchment: '#F5EFDF',
        sage: '#6E7F6B',
        line: '#DCD2B8',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        arabic: ['var(--font-arabic)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
