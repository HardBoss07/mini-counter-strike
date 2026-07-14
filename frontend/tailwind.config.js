/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        tactical: {
          dark: "#0a0a0b",
          gray: "#1c1c1e",
          accent: "#7d01e3", // Violet accent for items
          t: "#d9a34a", // T-side Orange/Yellow
          ct: "#5d79ae", // CT-side Blue
        },
        rarity: {
          base: "#5E574F",
          consumer: "#B0C3D9",
          industrial: "#5E98D9",
          milspec: "#4B69FF",
          restricted: "#8847FF",
          classified: "#D32CE6",
          covert: "#EB4B4B",
          contraband: "#E4AE39",
        },
        transitionTimingFunction: {
          "cs2-spin": "cubic-bezier(0.15, 0.9, 0.15, 1)",
        },
      },
    },
  },
  plugins: [],
};
