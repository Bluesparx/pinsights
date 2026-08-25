/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: {
          DEFAULT: '#fff',
          soft: '#FFF7FA'
        },
        'white-soft': '#FFF7FA',
        'generated-blue': '#1A2B4C',
        ink: {
          DEFAULT: '#534a6d',
          light: '#3D3A78',
          dark: '#1F1D3D',
        },
        candy: {
          pink: '#F6CBDD',
          'pink-dark': '#E6AFC7',
          teal: '#BFDDE6',
          'teal-dark': '#9FC5D1',
          mint: '#CDE8D3',
          coral: '#EBD9B5',
          blue: '#BFDDE6',
          purple: '#D9CBE8',
        },
        'custom-pink': '#F6CBDD',
        'custom-blue': '#BFDDE6',
        'custom-yellow': '#FAE7A1',
        'custom-green': '#CDE8D3',
        'custom-sand': '#EBD9B5',
        'custom-lavender': '#E4D6ED',
        'custom-mint':     '#BCECE0',
        'custom-peach':    '#FADBC8',
        'custom-apricot':  '#F5E2C4',
        'custom-sage':     '#DBE3CD',
        'custom-ice':      '#D2E4EE',
        'custom-lilac':      '#EDD5E7',
        'custom-seafoam':    '#C4F0E1',
        'custom-banana':     '#FFF3B8',
        'custom-clay':       '#E8D0C5',
        'custom-periwinkle': '#D6DBF5',
        'custom-matcha':     '#D2E7C4',
        'custom-sky':        '#CBE3F7',
        'custom-linen':      '#F4EFEB',
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