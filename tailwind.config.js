/* eslint-env node */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-dark": "var(--color-primary-dark)",
        "background-light": "var(--color-bg-light)",
        "background-dark": "var(--color-bg-dark)",
        "surface-dark": "var(--color-surface-dark)",
        "border-dark": "var(--color-border-dark)",
        "input-border": "#55553a",
        "accent-yellow": "#FFD700",
        "dark-charcoal": "#1A1A1A",
        "light-gray-stroke": "#E2E8F0",
        "surface-light": "var(--color-surface-light)",

        // Sci-Fi Scanner Colors
        "glass-stroke": "rgba(255, 255, 255, 0.12)",
        "tertiary": "#97cbff",
        "on-surface-variant": "#dfc0b0",
        "background": "#0b1326",
        "surface-container-highest": "#2d3449",
        "data-focus": "#4F46E5",
        "on-background": "#dae2fd",
        "error": "#ffb4ab",
        "primary-container": "#f2740c",
        "surface-container": "#171f33",
        "surface-tint": "#ffb68c",
        "on-tertiary": "#003354",
        "surface-container-lowest": "#060e20",
        "ai-active": "#10B981",
        "surface-container-high": "#222a3d",
        "neon-glow": "rgba(242, 116, 12, 0.4)"
      },
      fontFamily: {
        display: ["Manrope", "IBM Plex Sans Arabic", "sans-serif"],
        "headline-md": ["Space Grotesk", "IBM Plex Sans Arabic", "sans-serif"],
        "headline-lg": ["Space Grotesk", "IBM Plex Sans Arabic", "sans-serif"],
        "body-lg": ["Inter", "IBM Plex Sans Arabic", "sans-serif"],
        "display-lg": ["Space Grotesk", "IBM Plex Sans Arabic", "sans-serif"],
        "data-mono": ["JetBrains Mono", "IBM Plex Sans Arabic", "monospace"],
        "label-caps": ["JetBrains Mono", "IBM Plex Sans Arabic", "monospace"],
        "headline-lg-mobile": ["Space Grotesk", "IBM Plex Sans Arabic", "sans-serif"],
        "body-md": ["Inter", "IBM Plex Sans Arabic", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
