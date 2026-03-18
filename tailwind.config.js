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
        "surface-light": "var(--color-surface-light)"
      },
      fontFamily: {
        display: "Manrope"
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
