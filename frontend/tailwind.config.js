/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pinterest's own palette - keeping the UI in a register users
        // already recognize from the Pinterest app itself.
        pinterest: {
          red: '#E60023',
          'red-dark': '#AD081B',
          'red-light': '#FFEBEE',
          black: '#111111',
          gray: '#767676',
          'gray-light': '#EFEFEF',
          cream: '#F9F9F9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        pin: '0 1px 3px rgba(0,0,0,0.08), 0 6px 16px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}