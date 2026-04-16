// tailwind.config.js
module.exports = {
  content: [
    "./public/**/*.{html,js}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#8d2036",
        accent: "#D4AF37",
        "background-dark": "#1f1315",
      },
      fontFamily: {
        sans: ["Lexend", "system-ui", "sans-serif"],
      }
    }
  },
  plugins: [],
}