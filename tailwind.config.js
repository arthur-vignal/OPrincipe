/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#ffffff",
        fg: "#0a0a0a",
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