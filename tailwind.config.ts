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
        // Phase 1 magical overhaul: accent redefined gold → terracotta.
        // .DEFAULT: AA Large only on cream (~4.5:1) — headings, badges, decoratives.
        // .dark: AA Normal on cream (~6.5:1) — inline body links, accents.
        accent: {
          DEFAULT: "#C75D2C",
          light: "#E27A4F",
          dark: "#A04420",
        },
        cobalt: {
          DEFAULT: "#3856B0",
          light: "#5C7AC9",
          dark: "#27408C",
        },
        cream: "#F8F6F3",
        navy: "#1E2B4D",
        ink: "#142849",
        paper: "#FAF6EC",
        // Deprecated — kept one phase as rollback safety. Remove in Phase 4.
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
