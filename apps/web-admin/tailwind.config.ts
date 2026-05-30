import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f7f7f4',
          100: '#efefe9',
          200: '#deded2',
          300: '#c5c5b0',
          400: '#a2a28a',
          500: '#7d7d65',
          600: '#5e5e4a',
          700: '#484837',
          800: '#323226',
          900: '#1c1c16',
        },
        copper: {
          50: '#fdf3ec',
          100: '#fae2d3',
          200: '#f3bfa0',
          300: '#ec9c6d',
          400: '#e5793b',
          500: '#cc6222',
          600: '#a64c1b',
          700: '#7f3714',
          800: '#58230d',
          900: '#311207',
        },
        tide: {
          50: '#ecfaf8',
          100: '#cff3ee',
          200: '#9ee7dc',
          300: '#6dd9c9',
          400: '#3cccb6',
          500: '#22b39e',
          600: '#178979',
          700: '#0f5f54',
          800: '#08352f',
          900: '#02110d',
        },
      },
      boxShadow: {
        glow: '0 12px 40px rgba(12, 68, 56, 0.25)',
        soft: '0 12px 24px rgba(9, 21, 24, 0.12)',
      },
      backgroundImage: {
        'grainy': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
} satisfies Config;
