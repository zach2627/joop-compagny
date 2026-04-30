/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jost)", "sans-serif"],
        serif: ["var(--font-cormorant)", "serif"],
        display: ["var(--font-cormorant)", "serif"],
        mono: ['"SF Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        apple: {
          blue: "#b88a54",
          "blue-dark": "#9f7242",
          gray: {
            50: "#fffaf6",
            100: "#f8efe8",
            200: "#ebddd0",
            300: "#dbc6b5",
            400: "#baa390",
            500: "#917867",
            600: "#6f594b",
            700: "#4d3c33",
            800: "#2f2621",
            900: "#1d1613",
          },
        },
        az: {
          gold: "#b88a54",
          "gold-light": "#d6b27f",
          "gold-pale": "#ead7bb",
          "gold-dark": "#8f663d",
          dark: "#2f2621",
          "dark-2": "#4d3c33",
          "dark-3": "#6f594b",
        },
        brand: {
          primary: "#b88a54",
          dark: "#2f2621",
          light: "#fffaf6",
          surface: "#fffaf6",
          panel: "#f3e4db",
          blush: "#ddbeb6",
        },
        senegal: {
          green: "#00853F",
          yellow: "#FDEF42",
          red: "#E31B23",
        },
      },
      fontSize: {
        "display-2xl": ["4.5rem", { lineHeight: "1.02", letterSpacing: "-0.05em" }],
        "display-xl": ["3.75rem", { lineHeight: "1.03", letterSpacing: "-0.05em" }],
        "display-lg": ["3rem", { lineHeight: "1.05", letterSpacing: "-0.04em" }],
        "display-md": ["2.25rem", { lineHeight: "1.08", letterSpacing: "-0.03em" }],
        "display-sm": ["1.875rem", { lineHeight: "1.12", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        "apple-sm": "0 12px 28px rgba(118, 92, 73, 0.08)",
        "apple-md": "0 24px 48px rgba(118, 92, 73, 0.1)",
        "apple-lg": "0 32px 72px rgba(118, 92, 73, 0.13)",
        "apple-xl": "0 42px 100px rgba(118, 92, 73, 0.16)",
        "apple-card": "0 28px 72px rgba(118, 92, 73, 0.12), 0 0 0 1px rgba(184, 138, 84, 0.08)",
        "gold-sm": "0 10px 24px rgba(184, 138, 84, 0.18)",
        "gold-md": "0 18px 36px rgba(184, 138, 84, 0.2)",
        "gold-glow": "0 0 36px rgba(214, 178, 127, 0.28)",
      },
      borderRadius: {
        "apple-sm": "10px",
        "apple-md": "16px",
        "apple-lg": "26px",
        "apple-xl": "36px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { transform: "translateY(20px)", opacity: 0 },
          to: { transform: "translateY(0)", opacity: 1 },
        },
        scaleIn: {
          from: { transform: "scale(0.96)", opacity: 0 },
          to: { transform: "scale(1)", opacity: 1 },
        },
      },
      spacing: {
        "nav-height": "74px",
        "banner-height": "42px",
      },
    },
  },
  plugins: [],
};
