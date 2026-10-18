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
        dark: {
          950: '#0b0f19',
          900: '#111827',
          850: '#161f30',
          800: '#1f293d',
          700: '#334155',
          600: '#475569'
        }
      }
    },
  },
  plugins: [],
}
