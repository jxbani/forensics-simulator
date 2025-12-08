/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'in': 'in 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in-from-bottom-4': 'slideInFromBottom 0.5s ease-out',
        'slide-in-from-bottom-2': 'slideInFromBottomSmall 0.3s ease-out',
        'zoom-in': 'zoomIn 0.3s ease-out',
        'shrink-width': 'shrinkWidth linear forwards',
        'pulse-ring': 'pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        in: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInFromBottom: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInFromBottomSmall: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shrinkWidth: {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
        pulseRing: {
          '0%': { opacity: '1', transform: 'scale(0.8)' },
          '50%': { opacity: '0.5', transform: 'scale(1.2)' },
          '100%': { opacity: '0', transform: 'scale(1.5)' },
        },
      },
    },
  },
  plugins: [],
}
