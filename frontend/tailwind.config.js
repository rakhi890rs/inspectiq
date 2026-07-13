/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#F97316",
          dark: "#EA580C",
          light: "#FFEDD5",
        },
        sidebar: "#111827",
        surface: "#F8FAFC",
        card: "#FFFFFF",
        border: "#E5E7EB",
        text: {
          DEFAULT: "#111827",
          secondary: "#6B7280",
        },
        success: "#22C55E",
        warning: "#FACC15",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 2px 10px rgba(17, 24, 39, 0.06)",
        card: "0 1px 3px rgba(17, 24, 39, 0.08), 0 1px 2px rgba(17, 24, 39, 0.04)",
      },
    },
  },
  plugins: [],
};
