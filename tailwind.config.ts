import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "rl-base": "#1e2025",
        "rl-surface": "#2a2d35",
        "rl-yellow": "#f7ca5e",
        "rl-yellow-light": "#ffecb3",
        "rl-yellow-shadow": "#c99b3a",
        "rl-orange": "#e6915c",
        "rl-border": "#2e1a11",
        "rl-text": "#2e1a11",
        "rl-text-light": "#f5f5f4",
        "rl-muted": "#6b5a4a",
        "rl-danger": "#DC2626",
      },
      fontFamily: {
        sans: ["var(--font-space-mono)", "monospace"],
        pixel: ["var(--font-press-start)", "monospace"],
        display: ["var(--font-vt323)", "monospace"],
      },
      boxShadow: {
        pixel: "0 6px 0 #c99b3a",
        "pixel-sm": "0 4px 0 #c99b3a",
        "pixel-dark": "0 6px 0 #2e1a11",
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "6px",
        lg: "8px",
      },
      keyframes: {
        pulseAmber: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "pulse-amber": "pulseAmber 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
