/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0212",
        sidebar: "#0f0212",
        navbar: "rgba(15, 2, 18, 0.75)",
        card: "#1F2937",
        cardHover: "#273449",
        accentGold: "#D4AF37",
        hoverGold: "#F5D76E",
        aquaBlue: "#26D0F4",
        purpleGlow: "#7C3AED",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        mainText: "#FFFFFF",
        secondaryText: "#CBD5E1",
        mutedText: "#94A3B8",
        'accent-pink': '#ec4899',
        'accent-purple': '#a855f7',
        'text-muted': '#94A3B8',
      },
      borderRadius: {
        'luxury': '18px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(212, 175, 55, 0.2)',
        'blue-glow': '0 0 20px rgba(38, 208, 244, 0.3)',
      },
    },
  },
  plugins: [],
}
