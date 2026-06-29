import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#D27A2D',
                    light: '#e8924a',
                    dark: '#b5681f',
                },
                navy: '#172E42',
                charcoal: '#2A262A',
                background: '#FFFFFF',
                surface: '#F8F9FA',
            },
            fontFamily: {
                nunito: ['Nunito', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #D27A2D 0%, #e8924a 100%)',
            },
            boxShadow: {
                'primary': '0 10px 30px rgba(210, 122, 45, 0.3)',
                'primary-lg': '0 15px 50px rgba(210, 122, 45, 0.4)',
                'soft': '0 4px 20px rgba(23, 46, 66, 0.08)',
                'card': '0 8px 30px rgba(23, 46, 66, 0.1)',
            },
            animation: {
                'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
                'fade-in-down': 'fade-in-down 0.6s ease-out forwards',
                'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
                'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
            },
            keyframes: {
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in-down': {
                    '0%': { opacity: '0', transform: 'translateY(-30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'bounce-soft': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-6px)' },
                },
                'pulse-ring': {
                    '0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
                    '50%': { transform: 'scale(1.05)', opacity: '0.6' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
