/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        fg: "#f5f5f0",
        "ink-mute": "#7d7d75",
        red: {
          DEFAULT: "#d82b1c",
          dim: "#a31f12",
        },
        gold: "#b8924a",
        magenta: "#c9148e",
      },
      fontFamily: {
        display: ['"Michroma"', "sans-serif"],
        serif: ['"Playfair Display"', "Georgia", "serif"],
      },
      letterSpacing: {
        "ultra-tight": "-0.06em",
      },
    },
  },
  plugins: [],
};