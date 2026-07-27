/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#2B1524',
        ivory: '#FFF9FC',
        linen: '#FFE3EF',
        sand: '#F8B8D1',
        gold: '#E84F8A',
        mist: '#FFF0F7',
        brown: '#A52E5D',
        blush: '#FFCAE0',
        rose: '#EF76A7',
        plum: '#4A1731',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 24px 70px rgba(174, 43, 96, 0.12)',
        rose: '0 18px 50px rgba(232, 79, 138, 0.26)',
      },
    },
  },
  plugins: [],
}
