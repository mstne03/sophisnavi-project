import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sharp solo lo usa scripts/notion-pull.ts antes del build; Next lo traza en cada función por estar instalado
  // (~19 MB de libvips de ~27 MB). En Vercel la optimización de imágenes no corre en las funciones.
  outputFileTracingExcludes: {
    "/**": ["node_modules/sharp/**", "node_modules/@img/**", "node_modules/.pnpm/sharp@*/**", "node_modules/.pnpm/@img+*/**"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
