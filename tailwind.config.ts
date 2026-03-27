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
          DEFAULT: "#2563eb", // blue-600
          dark: "#1d4ed8", // blue-700
          light: "#3b82f6", // blue-500
        },
        secondary: {
          DEFAULT: "#64748b", // slate-500
          light: "#94a3b8", // slate-400
        },
        accent: {
          DEFAULT: "#f59e0b", // amber-500
          light: "#fbbf24", // amber-400
        },
        background: "#f8fafc", // slate-50
        surface: {
          DEFAULT: "#ffffff",
          hover: "#f1f5f9", // slate-100
        },
        text: {
          primary: "#0f172a", // slate-900
          secondary: "#475569", // slate-600
          muted: "#94a3b8", // slate-400
        },
        border: "#e2e8f0", // slate-200
        divider: "#f1f5f9", // slate-100
        success: "#16a34a", // green-600
        warning: "#d97706", // amber-600
        error: "#dc2626", // red-600
        info: "#0ea5e9", // sky-500
      },
      boxShadow: {
        sm: "0 1px 3px rgba(15, 23, 42, 0.06)",
        md: "0 4px 12px rgba(15, 23, 42, 0.10)",
        lg: "0 8px 24px rgba(15, 23, 42, 0.14)",
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
