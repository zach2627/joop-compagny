/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Performance ──────────────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,

  // ── Webpack — cache mémoire en dev pour éviter la corruption filesystem ──
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
  { protocol: "https", hostname: "**.vercel.app" },
  { protocol: "https", hostname: "res.cloudinary.com" },
  { protocol: "https", hostname: "**.cloudinary.com" },
],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache images 30 jours
  },

  experimental: {
    serverComponentsExternalPackages: ["nodemailer"],
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "joop-compagny.vercel.app",
        "joop-compagny.com",
        "www.joop-compagny.com",
      ],
    },
  },

  // ── Headers HTTP ─────────────────────────────────────────────────────────
  headers: async () => [
    // Cache statique (JS, CSS, fonts, images)
    {
      source: "/_next/static/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    // Cache images publiques
    {
      source: "/images/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=86400, stale-while-revalidate=604800",
        },
      ],
    },
    // Sécurité sur toutes les routes
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https:",
            "font-src 'self'",
            "connect-src 'self' https://app.paydunya.com https://paydunya.com https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://connect.facebook.net https://www.facebook.com",
            "frame-ancestors 'none'",
          ].join("; "),
        },
      ],
    },
  ],

  // ── Redirections ─────────────────────────────────────────────────────────
  redirects: async () => [
    {
      source: "/register",
      destination: "/auth/register",
      permanent: true,
    },
    {
      source: "/login",
      destination: "/auth/login",
      permanent: true,
    },
    {
      source: "/account",
      destination: "/store/account",
      permanent: true,
    },
  ],
};

module.exports = nextConfig;
