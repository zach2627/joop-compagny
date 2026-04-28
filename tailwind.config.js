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
          blue: "#C9A84C",
          "blue-dark": "#E8C97A",
          gray: {
            50: "#111109",
            100: "#1A1A14",
            200: "rgba(255,255,255,0.08)",
            300: "rgba(255,255,255,0.14)",
            400: "rgba(255,255,255,0.4)",
            500: "rgba(255,255,255,0.6)",
            600: "rgba(255,255,255,0.72)",
            700: "rgba(255,255,255,0.84)",
            800: "#F5F5F5",
            900: "#FFFFFF",
          },
        },
        az: {
          gold: "#C9A84C",
          "gold-light": "#E8C97A",
          "gold-pale": "#F3DFA6",
          "gold-dark": "#A88935",
          dark: "#0A0A08",
          "dark-2": "#111109",
          "dark-3": "#1A1A14",
        },
        brand: {
          primary: "#C9A84C",
          dark: "#0A0A08",
          light: "#FFFFFF",
          surface: "#111109",
          panel: "#1A1A14",
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
        "apple-sm": "0 8px 18px rgba(0,0,0,0.18)",
        "apple-md": "0 14px 28px rgba(0,0,0,0.24)",
        "apple-lg": "0 20px 44px rgba(0,0,0,0.3)",
        "apple-xl": "0 28px 64px rgba(0,0,0,0.34)",
        "apple-card": "0 18px 40px rgba(0,0,0,0.28), 0 0 0 1px rgba(201,168,76,0.08)",
        "gold-sm": "0 6px 16px rgba(201,168,76,0.2)",
        "gold-md": "0 12px 28px rgba(201,168,76,0.26)",
        "gold-glow": "0 0 24px rgba(201,168,76,0.28)",
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
