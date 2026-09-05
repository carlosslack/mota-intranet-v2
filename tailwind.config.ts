import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#060d1f",
          800: "#0c1731",
          700: "#12203f",
          500: "#3d4a6b",
        },
        gold: {
          50: "#f5e9c8",
          100: "#e9d59a",
          300: "#d4af37",
          500: "#b8912a",
          700: "#9a7c26",
        },
      },
      fontFamily: {
        display: ['"Instrument Sans"', "system-ui", "sans-serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
