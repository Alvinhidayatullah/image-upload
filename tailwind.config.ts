import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          yellow: "#FCEE0A",
          cyan: "#00F0FF",
          magenta: "#FF003C",
          emerald: "#00FFA3",
          void: "#05070B",
          surface: "#0A0E17",
          surface2: "#111726",
          border: "#1E293B",
          borderCyan: "rgba(0, 240, 255, 0.24)",
          borderYellow: "rgba(252, 238, 10, 0.28)",
          borderMagenta: "rgba(255, 0, 60, 0.28)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "neon-cyan": "0 0 10px rgba(0,240,255,.5), 0 0 30px rgba(0,240,255,.2)",
        "neon-cyan-sm": "0 0 6px rgba(0,240,255,.4)",
        "neon-magenta": "0 0 10px rgba(255,0,60,.5), 0 0 30px rgba(255,0,60,.2)",
        "neon-yellow": "0 0 10px rgba(252,238,10,.5), 0 0 30px rgba(252,238,10,.2)",
        "neon-emerald": "0 0 10px rgba(0,255,163,.5), 0 0 30px rgba(0,255,163,.2)",
        "tactical-bevel": "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.6)",
      },
      keyframes: {
        "grid-move": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 50px" },
        },
        scan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "radar-sweep": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        flicker: {
          "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": { opacity: "1" },
          "20%, 24%, 55%": { opacity: ".45" },
        },
        glitch: {
          "0%": { clipPath: "inset(40% 0 61% 0)", transform: "translate(-1.5px, 0.5px)" },
          "20%": { clipPath: "inset(92% 0 1% 0)", transform: "translate(1.5px, -0.5px)" },
          "40%": { clipPath: "inset(43% 0 1% 0)", transform: "translate(-0.8px, 1px)" },
          "60%": { clipPath: "inset(25% 0 58% 0)", transform: "translate(0.8px, -1px)" },
          "80%": { clipPath: "inset(54% 0 7% 0)", transform: "translate(-1px, 0)" },
          "100%": { clipPath: "inset(58% 0 43% 0)", transform: "translate(0, 0)" },
        },
      },
      animation: {
        "grid-move": "grid-move 2s linear infinite",
        scan: "scan 1.6s ease-in-out infinite",
        "radar-sweep": "radar-sweep 4s linear infinite",
        flicker: "flicker 4s linear infinite",
        glitch: "glitch .8s steps(2, end) infinite alternate",
      },
    },
  },
  plugins: [],
};

export default config;
