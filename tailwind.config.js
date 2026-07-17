/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#020810',
          800: '#040D1C',
          700: '#071428',
          600: '#0D1E38',
          500: '#1B2E4E',
          400: '#2A4070',
        },
        brand: {
          blue: '#2563EB',
          teal: '#06B6D4',
          'blue-dark': '#1D4ED8',
          'teal-dark': '#0891B2',
        },
        dash: {
          bg: '#EEF2F7',
          surface: '#FFFFFF',
          border: '#E2E8F0',
          text: '#0F172A',
          muted: '#64748B',
        },
      },
      fontFamily: {
        heading: ['var(--font-libre)', 'system-ui', 'sans-serif'],
        body: ['var(--font-dm)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'radar-1': 'radar 3s ease-out infinite',
        'radar-2': 'radar 3s ease-out infinite 1s',
        'radar-3': 'radar 3s ease-out infinite 2s',
        'float': 'float 4s ease-in-out infinite',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'scale(0.5)', opacity: '0.8' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0.7' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
