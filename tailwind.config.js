/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#181713',
        ivory: '#FFFEFA',
        linen: '#F2E8D3',
        sand: '#D9C08A',
        gold: '#B38A2C',
        mist: '#FAF5EA',
        brown: '#6F5523',
        champagne: '#EAD9B7',
        goldSoft: '#C9A95F',
        plum: '#211C13',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 24px 70px rgba(94, 73, 29, 0.12)',
        gold: '0 18px 50px rgba(179, 138, 44, 0.24)',
      },
    },
  },
  plugins: [],
}
