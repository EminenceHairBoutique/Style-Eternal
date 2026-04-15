/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SE brand colors (also defined via @theme in index.css for Tailwind v4)
        "se-black": "#0A0A0A",
        "se-charcoal": "#1A1A1A",
        "se-asphalt": "#2A2A2A",
        "se-concrete": "#3A3A3A",
        "se-steel": "#6B6B6B",
        "se-bone": "#E8E4DE",
        "se-cream": "#F5F2EC",
        "se-white": "#FAFAF8",
        "se-gold": "#C4A35A",
        "se-gold-muted": "#A08A4A",
        "se-red": "#8B2020",
        "se-red-bright": "#C43030",
        // Legacy aliases (keep for any remaining references)
        gold: "#C4A35A",
        ivory: "#F5F2EC",
        charcoal: "#1A1A1A",
        softGray: "#E8E4DE",
      },
      fontFamily: {
        display: ["Oswald", "sans-serif"],
        body: ["Inter", "sans-serif"],
        accent: ["Space Grotesk", "sans-serif"],
        signature: ["Great Vibes", "cursive"],
      },
      boxShadow: {
        goldGlow: "0 0 25px rgba(196,163,90,0.25)",
      },
      borderRadius: {
        card: "1rem",
      },
    },
  },
  plugins: [],
};
