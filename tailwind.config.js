/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

export default withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        oq: "#ffffff",
        sadia_dark: "#5e1b2d",
        sadia_light: "#6e3141",
        dp_of_white: "#090a07",
        dp_of_dark: "#0e0e0e",
      },
    },
  },
  plugins: [],
});
