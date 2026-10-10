/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "twitter-blue": "#1d9bf0",
        "twitter-hover": "#1a8cd8",
        darkBg: "#000000",
        darkCard: "#0d0f12",
        darkElevated: "#16181c",
        darkBorder: "#24272c",
        darkText: "#e7e9ea",
        darkMuted: "#71767b",
      },
      fontFamily: {
        Inter: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px -3px rgba(29, 155, 240, 0.25)",
        card: "0 8px 30px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
