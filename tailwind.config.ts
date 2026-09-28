import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Deep forest green — primary brand color (buttons, links, nav, dark sections)
        brand: {
          50: "#eef5f0",
          100: "#d7e8db",
          400: "#2f6b4a",
          500: "#1f5439",
          600: "#14432c",
          700: "#103522",
          800: "#0d2a1c",
          900: "#0a2016",
          950: "#071810",
        },
        // Chartreuse — accent color for highlights, badges, and pops of energy
        lime: {
          300: "#e2f98f",
          400: "#d4f95a",
          500: "#c6ea3e",
          600: "#aed12a",
        },
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
