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
                // Charte graphique client - Thème clair
                primary: {
                    DEFAULT: '#D27A2D',
                    light: '#e8924a',
                    dark: '#b5681f',
                },
                navy: '#172E42',
                charcoal: '#2A262A',
                // Couleurs de fond
                background: '#FFFFFF',
                surface: '#F8F9FA',
                // Texte
                text: {
                    primary: '#172E42',
                    secondary: '#2A262A',
                    muted: '#6B7280',
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                foreground: "hsl(var(--foreground))",
            },
            fontFamily: {
                nunito: ['Nunito', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #D27A2D 0%, #e8924a 100%)',
                'gradient-hero': 'linear-gradient(135deg, #172E42 0%, #2A262A 100%)',
                'gradient-light': 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)',
            },
            boxShadow: {
                'primary': '0 10px 30px rgba(210, 122, 45, 0.3)',
                'primary-lg': '0 15px 50px rgba(210, 122, 45, 0.4)',
                'soft': '0 4px 20px rgba(23, 46, 66, 0.08)',
                'card': '0 8px 30px rgba(23, 46, 66, 0.1)',
            },
            animation: {
                'float-around': 'float-around 20s ease-in-out infinite',
                'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
                'bounce-icon': 'bounce-icon 2s ease-in-out infinite',
                'countdown-pulse': 'countdown-pulse 1s ease-in-out infinite',
                'float-particle': 'float-particle 3s ease-in-out infinite',
                'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
                'fade-in-down': 'fade-in-down 0.6s ease-out forwards',
                'fade-in-left': 'fade-in-left 0.6s ease-out forwards',
                'fade-in-right': 'fade-in-right 0.6s ease-out forwards',
                'scale-in': 'scale-in 0.5s ease-out forwards',
                'slide-up': 'slide-up 0.5s ease-out forwards',
                'shimmer': 'shimmer 2s linear infinite',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'rotate-slow': 'rotate-slow 20s linear infinite',
                'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
                'wiggle': 'wiggle 1s ease-in-out infinite',
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
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in-down': {
                    '0%': { opacity: '0', transform: 'translateY(-30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in-left': {
                    '0%': { opacity: '0', transform: 'translateX(-30px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                'fade-in-right': {
                    '0%': { opacity: '0', transform: 'translateX(30px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                'scale-in': {
                    '0%': { opacity: '0', transform: 'scale(0.9)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                'slide-up': {
                    '0%': { opacity: '0', transform: 'translateY(100%)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(210, 122, 45, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(210, 122, 45, 0.6)' },
                },
                'rotate-slow': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                'bounce-soft': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                'wiggle': {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
            },
        },
    },
    plugins: [],
};

export default config;