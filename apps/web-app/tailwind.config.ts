import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D27A2D',
          light: '#ff9f50',
          dark: '#ff6b1a',
        },
        dark: {
          100: '#1a1f35',
          200: '#151b2e',
          300: '#0f172a',
          400: '#0a0e1a',
        },
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #D27A2D 0%, #ff9f50 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0a0e1a 0%, #1a1f35 100%)',
        'gradient-dark-alt': 'linear-gradient(180deg, #0a0e1a 0%, #151b2e 100%)',
      },
      boxShadow: {
        'primary': '0 10px 30px rgba(210, 122, 45, 0.4)',
        'primary-lg': '0 15px 50px rgba(210, 122, 45, 0.6)',
        'primary-hover': '0 30px 60px rgba(210, 122, 45, 0.3)',
      },
      animation: {
        'float-around': 'float-around 20s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
        'bounce-icon': 'bounce-icon 2s ease-in-out infinite',
        'countdown-pulse': 'countdown-pulse 1s ease-in-out infinite',
        'float-particle': 'float-particle 3s ease-in-out infinite',
      },
      keyframes: {
        'float-around': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(30px, -40px) rotate(120deg)' },
          '66%': { transform: 'translate(-20px, 30px) rotate(240deg)' },
        },
        'pulse-ring': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
          '50%': { transform: 'scale(1.05)', opacity: '0.6' },
        },
        'bounce-icon': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'countdown-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'float-particle': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.6' },
          '50%': { transform: 'translateY(-20px)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;