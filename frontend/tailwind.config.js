/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tactical: {
          dark: '#0a0a0b',
          gray: '#1c1c1e',
          accent: '#7d01e3', // Violet accent for items
          t: '#d9a34a',      // T-side Orange/Yellow
          ct: '#5d79ae',     // CT-side Blue
        }
      }
    },
  },
  plugins: [],
}
