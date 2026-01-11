import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E2B4D",
          light: "#2D3F66",
          dark: "#141D36",
        },
        secondary: {
          DEFAULT: "#F8F6F3",
          dark: "#EDE9E3",
        },
        accent: {
          DEFAULT: "#C9A962",
          light: "#D4B875",
          dark: "#B89A52",
        },
        cream: "#F8F6F3",
        navy: "#1E2B4D",
        gold: "#C9A962",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        script: ["var(--font-dancing)", "cursive"],
      },
      boxShadow: {
        book: "8px 8px 24px -4px rgb(0 0 0 / 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
