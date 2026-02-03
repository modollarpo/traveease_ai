import type { Config } from "tailwindcss"
import plugin from "tailwindcss/plugin"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Clash Display", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "traveease-blue": "#0A2540",
        "neo-mint": "#4FFFB0",
        "heritage-clay": "#D97706",
        "ghost-white": "#F8FAFC",
        primary: {
          DEFAULT: "#0A2540",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "#4FFFB0",
        },
      },
      borderRadius: {
        lg: "18px",
        xl: "24px",
        "2xl": "32px",
      },
      boxShadow: {
        "gummy-sm": "0 8px 20px rgba(15,23,42,0.35)",
        "gummy": "0 16px 40px rgba(15,23,42,0.5)",
      },
      backdropBlur: {
        glass: "12px",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities, theme }) {
      addUtilities(
        {
          ".glass-panel": {
            backgroundColor: "rgba(15,23,42,0.72)",
            borderRadius: theme("borderRadius.xl"),
            border: "1px solid rgba(248,250,252,0.08)",
            backdropFilter: "blur(12px)",
            boxShadow: theme("boxShadow.gummy"),
          },
          ".glass-soft": {
            backgroundColor: "rgba(15,23,42,0.6)",
            borderRadius: theme("borderRadius.lg"),
            border: "1px solid rgba(248,250,252,0.06)",
            backdropFilter: "blur(12px)",
            boxShadow: theme("boxShadow['gummy-sm']"),
          },
          ".gummy-button": {
            borderRadius: theme("borderRadius.full"),
            boxShadow: theme("boxShadow.gummy"),
          },
        },
        ["responsive"]
      )
    }),
  ],
} satisfies Config

export default config
