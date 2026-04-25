/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ['"SF Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        apple: {
          blue: "#C9A84C",        // Or principal → remplace le bleu
          "blue-dark": "#B8922E", // Or foncé pour hover
          gray: {
            50: "#f5f5f7",
            100: "#e8e8ed",
            200: "#d2d2d7",
            300: "#b0b0b8",
            400: "#86868b",
            500: "#6e6e73",
            600: "#515154",
            700: "#3d3d3f",
            800: "#2d2d2f",
            900: "#1d1d1f",
          },
        },
        // Couleurs JOOP
        az: {
          gold: "#C9A84C",
          "gold-light": "#E8C97A",
          "gold-pale": "#F5E6B8",
          "gold-dark": "#B8922E",
          dark: "#1A1A1A",
          "dark-2": "#242424",
          "dark-3": "#2E2E2E",
        },
        brand: {
          primary: "#C9A84C",
          dark: "#1A1A1A",
          light: "#f5f5f7",
        },
        senegal: {
          green: "#00853F",
          yellow: "#FDEF42",
          red: "#E31B23",
        },
      },
      fontSize: {
        "display-2xl": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        "display-xl": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        "display-lg": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-sm": ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      boxShadow: {
        "apple-sm": "0 2px 8px rgba(0,0,0,0.08)",
        "apple-md": "0 4px 16px rgba(0,0,0,0.1)",
        "apple-lg": "0 8px 32px rgba(0,0,0,0.12)",
        "apple-xl": "0 16px 48px rgba(0,0,0,0.15)",
        "apple-card": "0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
        "gold-sm": "0 2px 8px rgba(201,168,76,0.2)",
        "gold-md": "0 4px 16px rgba(201,168,76,0.3)",
        "gold-glow": "0 0 20px rgba(201,168,76,0.4)",
      },
      borderRadius: {
        "apple-sm": "8px",
        "apple-md": "12px",
        "apple-lg": "18px",
        "apple-xl": "24px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { transform: "translateY(16px)", opacity: 0 },
          to: { transform: "translateY(0)", opacity: 1 },
        },
        scaleIn: {
          from: { transform: "scale(0.95)", opacity: 0 },
          to: { transform: "scale(1)", opacity: 1 },
        },
      },
      spacing: {
        "nav-height": "52px",
        "banner-height": "44px",
      },
    },
  },
  plugins: [],
};
