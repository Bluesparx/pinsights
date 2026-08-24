/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, organic palette pulled from the reference dashboard:
        // deep indigo/navy chrome, a soft cream canvas, a mustard
        // accent border, and a handful of candy-bright pastels used
        // for badges, stickers, and highlights.
        ink: {
          DEFAULT: '#2C2A54',
          light: '#3D3A78',
          dark: '#1F1D3D',
        },
        cream: {
          DEFAULT: '#FFF8EA',
          card: '#FFFDF6',
          deep: '#F3E7CE',
        },
        mustard: {
          DEFAULT: '#F2C230',
          dark: '#D9A81C',
        },
        candy: {
          pink: '#FF6FA0',
          'pink-dark': '#E8548A',
          teal: '#33C9C1',
          'teal-dark': '#1FA79F',
          mint: '#6BCB77',
          coral: '#FF8A5B',
          blue: '#5B8DEF',
          purple: '#8C6FF7',
        },
        'custom-pink': '#F6CBDD',
        'custom-blue': '#BFDDE6',
        'custom-yellow': '#FAE7A1',
        'custom-green': '#CDE8D3',
        'custom-sand': '#EBD9B5',
        ink50: 'rgba(44,42,84,0.5)',
      },
      fontFamily: {
        sans: ['Fraunces', 'Georgia', 'serif'],
        display: ['Caprasimo', 'Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        warm: '0 2px 6px rgba(44,42,84,0.06), 0 10px 24px rgba(44,42,84,0.08)',
        'warm-lg': '0 8px 16px rgba(44,42,84,0.10), 0 20px 40px rgba(44,42,84,0.14)',
        polaroid: '0 3px 8px rgba(44,42,84,0.10), 0 10px 20px rgba(44,42,84,0.10)',
        'polaroid-hover': '0 10px 20px rgba(44,42,84,0.16), 0 24px 48px rgba(44,42,84,0.20)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
      animation: {
        floaty: 'floaty 3.2s ease-in-out infinite',
        'pop-in': 'popIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
        wiggle: 'wiggle 0.6s ease-in-out',
      },
    },
  },
  plugins: [],
}