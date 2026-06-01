/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: { ink: { 100: 'rgba(23,46,66,0.1)' } },
      boxShadow: {
        soft: '0 10px 40px -10px rgba(23,46,66,0.1)',
        card: '0 20px 60px -15px rgba(23,46,66,0.12)',
      },
    },
  },
  plugins: [],
}
