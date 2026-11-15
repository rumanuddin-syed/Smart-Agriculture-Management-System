/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          emerald: '#059669',
          forest: '#064e3b',
          mint: '#10b981',
          light: '#f0fdf4',
          dark: '#022c22'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif']
      }
    },
  },
  plugins: [],
}
