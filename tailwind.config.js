/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        soria: ["soriaFont", "serif"],
        vercetti: ["vercettiFont", "sans-serif"],
      }
    },
  },
  plugins: [],
}
