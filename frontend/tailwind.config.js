/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        sans: ["'DM Sans'", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "#BDB0DF",
        foreground: "#660f33",
        "butter-yellow": "#660f33",
        card: {
          DEFAULT: "#BDB0DF",
          foreground: "#660f33",
        },
        popover: {
          DEFAULT: "#B8C0FF",
          foreground: "#660f33",
        },
        primary: {
          DEFAULT: "#FFF4E8",
          foreground: "#B8C0FF",
        },
        secondary: {
          DEFAULT: "#a7b0f0",
          foreground: "#660f33",
        },
        muted: {
          DEFAULT: "#a7b0f0",
          foreground: "#660f33",
        },
        accent: {
          DEFAULT: "#a7b0f0",
          foreground: "#660f33",
        },
        destructive: {
          DEFAULT: "#b3123f",
          foreground: "#FFF4E8",
        },
        border: "rgba(255, 244, 232, 0.2)",
        input: "rgba(255, 244, 232, 0.25)",
        ring: "rgba(255, 244, 232, 0.35)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
