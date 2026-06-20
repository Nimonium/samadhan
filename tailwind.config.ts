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
        primary: "#00288E",
        "primary-container": "#1E40AF",
        secondary: "#0058BE",
        surface: "#FBF8FF",
        "surface-container-low": "#F4F2FC",
        "surface-container": "#EEEDF7",
        error: "#BA1A1A",
        "error-container": "#FFDAD6",
        "on-surface": "#1A1B22",
        "on-surface-variant": "#444653",
        "outline-variant": "#C4C5D5",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        full: "9999px",
      },
      spacing: {
        base: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        gutter: "24px",
      },
    },
  },
  plugins: [],
};
export default config;
