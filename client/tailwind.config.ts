import type { Config } from "tailwindcss";

export default {
  darkMode: "media",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "ui-monospace", "monospace"],
        serif: ["Instrument Serif", "ui-serif", "serif"],
      },
      colors: {
        page:   "#faf9f7",
        chrome: "#0a0a0a",
        "chrome-soft": "#161616",
        "chrome-border": "#262626",
        accent: {
          bg:    "#fff0e8",
          tint:  "#ffd4bf",
          fg:    "#9a3a14",
          solid: "#d3501c",
          soft:  "#e8662e",
        },
      },
      boxShadow: {
        hairline: "inset 0 0 0 1px rgba(15,15,15,0.08)",
        "hairline-b": "0 1px 0 0 rgba(15,15,15,0.06)",
        card: "0 0 0 1px rgba(15,15,15,0.06), 0 1px 2px rgba(15,15,15,0.04)",
        pop:  "0 0 0 1px rgba(15,15,15,0.06), 0 10px 24px rgba(15,15,15,0.08)",
        float:"0 0 0 1px rgba(15,15,15,0.08), 0 24px 60px rgba(15,15,15,0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
