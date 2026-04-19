import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "surface-container": "#fef0df",
        "outline-variant": "#e6d3be",
        "surface-container-low": "#fff6ea",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#fce8d4",
        "surface-container-highest": "#f7dfc6",
        surface: "#fffaf3",
        "surface-tint": "#f56a4a",
        "tertiary-container": "#ffe28d",
        "surface-variant": "#f3e4d1",
        primary: "#f56a4a",
        "primary-dim": "#de5838",
        "primary-container": "#ffd9c8",
        secondary: "#17b6af",
        "secondary-dim": "#13988f",
        tertiary: "#6b3b2b",
        "on-primary": "#ffffff",
        "on-secondary": "#ffffff",
        "on-surface": "#5c3525",
        "on-surface-variant": "#876a52",
        "on-tertiary": "#fff8f0"
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem"
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Be Vietnam Pro", "sans-serif"]
      },
      keyframes: {
        drift: {
          "0%": { transform: "translateX(0%)" },
          "50%": { transform: "translateX(-2%)" },
          "100%": { transform: "translateX(0%)" }
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" }
        }
      },
      animation: {
        drift: "drift 12s ease-in-out infinite",
        floaty: "floaty 5s ease-in-out infinite",
        "fade-up": "fadeUp .6s ease forwards"
      }
    }
  },
  plugins: []
};

export default config;
