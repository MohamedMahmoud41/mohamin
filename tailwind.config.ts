/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      // ─── Design Tokens (mirrored from the old React project's index.css @theme) ───
      colors: {
        primary: {
          DEFAULT: "#6b4423",
          dark: "#4a2f19",
          light: "#8b6239",
        },
        secondary: {
          DEFAULT: "#9c7856",
          light: "#b59274",
        },
        accent: {
          DEFAULT: "#c9a76b",
          light: "#d4b784",
        },
        beige: {
          DEFAULT: "#e8dcc8",
          light: "#f5f0e8",
        },
        background: "#fdfbf8",
        surface: {
          DEFAULT: "#ffffff",
          hover: "#f9f6f2",
        },
        text: {
          primary: "#2c1810",
          secondary: "#6b4423",
          muted: "#8b7865",
        },
        border: "#e8dcc8",
        divider: "#f0e6d6",
        success: "#5a8b5f",
        warning: "#d4a24d",
        error: "#b85c4f",
        info: "#6b7fa8",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(107, 68, 35, 0.08)",
        md: "0 4px 12px rgba(107, 68, 35, 0.12)",
        lg: "0 8px 24px rgba(107, 68, 35, 0.16)",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      fontFamily: {
        // Match the old project's Arabic font stack
        sans: ["Cairo", "Tajawal", "ui-sans-serif", "system-ui", "sans-serif"],
        cairo: ["Cairo", "sans-serif"],
        tajawal: ["Tajawal", "sans-serif"],
      },
      keyframes: {
        "bounce-custom": {
          "0%, 100%": {
            transform: "translateY(-25%)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
      },
      animation: {
        "bounce-custom": "bounce-custom 1s infinite",
      },
    },
  },
  plugins: [],
};
