import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: "#F5F2EB",
          light: "#F9F6F0",
          dark: "#EDE8DF",
          surface: "#FFFFFF",
        },
        ink: {
          DEFAULT: "#1C1A17",
          light: "#2B2824",
          muted: "#5C5852",
          subtle: "#8C877E",
        },
        terracotta: {
          DEFAULT: "#f97316",
          hover: "#ea580c",
          deep: "#c2410c",
          light: "#fb923c",
          tint: "#fff7ed",
          border: "#fed7aa",
        },
        crimson: {
          DEFAULT: "#f97316",
          hover: "#ea580c",
          deep: "#c2410c",
          light: "#fb923c",
          tint: "#fff7ed",
          border: "#fed7aa",
        },
        maroon: {
          DEFAULT: "#f97316",
          hover: "#ea580c",
          deep: "#c2410c",
          light: "#fb923c",
          tint: "#fff7ed",
          border: "#fed7aa",
        },
        newsprint: {
          DEFAULT: "#E3DED4",
          hairline: "#EAE5DB",
          dark: "#D6D0C4",
        },
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316", // Main amber orange
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        dark: {
          bg: "#F5F2EB",
          surface: "#FFFFFF",
          card: "#FFFFFF",
          border: "#E3DED4",
          muted: "#5C5852",
        },
        light: {
          bg: "#F5F2EB",
          surface: "#FFFFFF",
          card: "#FFFFFF",
          border: "#E3DED4",
          muted: "#5C5852",
        }
      },
      fontFamily: {
        sans: [
          "'Plus Jakarta Sans'",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        "paper-xs": "0 1px 2px rgba(28, 26, 23, 0.04)",
        "paper-sm": "0 1px 3px rgba(28, 26, 23, 0.05), 0 1px 2px rgba(28, 26, 23, 0.03)",
        paper: "0 2px 8px rgba(28, 26, 23, 0.04), 0 1px 2px rgba(28, 26, 23, 0.02)",
        "paper-md": "0 4px 16px rgba(28, 26, 23, 0.06), 0 1px 3px rgba(28, 26, 23, 0.03)",
        "paper-lg": "0 10px 30px rgba(28, 26, 23, 0.07), 0 2px 6px rgba(28, 26, 23, 0.04)",
        "glow-sm": "0 0 15px rgba(249, 115, 22, 0.18)",
        "glow-md": "0 0 30px rgba(249, 115, 22, 0.28)",
        "glow-lg": "0 0 50px rgba(249, 115, 22, 0.38)",
        "glow-xl": "0 0 80px rgba(249, 115, 22, 0.48)",
      },
      maxWidth: {
        container: "1280px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "flow": "flow 2s linear infinite",
        "shimmer": "shimmer 2.5s infinite linear",
        marquee: "marquee var(--duration, 40s) linear infinite",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap, 1rem)))" },
        },
        flow: {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
