/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs","*"],
  theme: {
    extend: {
      colors: {
        'light-blue': '#F0F6FA',
        'deep-blue': '#0666B0',
      }
    },
  },
  plugins: [],
}
