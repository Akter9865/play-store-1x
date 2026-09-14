/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        play: {
          green: '#01875f',
          'green-hover': '#00704f',
          'green-light': '#e6f4ea',
          'green-dark': '#0f5239',
          surface: '#ffffff',
          'surface-variant': '#f8f9fa',
          border: '#e0e0e0',
          'text-primary': '#1f1f1f',
          'text-secondary': '#5f6368',
          'text-tertiary': '#80868b',
          star: '#01875f',
          starYellow: '#fbbc04',
          badge: '#4285f4',
        }
      },
      fontFamily: {
        sans: ['Google Sans', 'Roboto', 'Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'play-card': '0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.24)',
        'play-modal': '0 8px 24px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1)',
        'play-elevated': '0 2px 6px 2px rgba(60,64,67,0.15)',
      },
      borderRadius: {
        'play': '8px',
        'play-lg': '16px',
        'play-xl': '24px',
        'play-pill': '9999px',
      }
    },
  },
  plugins: [],
}
