import type { NextConfig } from "next";

/**
 * Security headers for every response (11-guvenlik §8). The panel and account area get a
 * stricter nonce-based CSP from src/proxy.ts, so the static CSP below skips those paths
 * (two CSP headers would be combined into the stricter intersection).
 * Add every third party you embed (analytics, maps, video, Turnstile) to the lists below
 * in the same PR, trying it first with Content-Security-Policy-Report-Only.
 */
const publicCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'", // static pages cannot carry a per-request nonce (GV-03)
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https:",
  "font-src 'self'",
  "connect-src 'self' https://tiles.openfreemap.org",
  "frame-src 'self'",
  "worker-src 'self' blob:", // MapLibre
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  // Keep what create-next-app generated (React Compiler, Tailwind's Turbopack loader) and add below.
  reactCompiler: true,
  // plan §10: true for public-content-heavy sites (static shell + streamed dynamic parts), false
  // when most screens are behind login. create-next-app turns it on by default.
  cacheComponents: true,
  partialPrefetching: true,
  typedRoutes: true,
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  // output: "standalone", // only for the Docker / VPS hosting variant (16-ortamlar-ve-yayin §6)
  images: {
    qualities: [60, 75, 90],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  poweredByHeader: false,
  headers() {
    return Promise.resolve([
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/((?!panel|hesabim|api).*)",
        headers: [{ key: "Content-Security-Policy", value: publicCsp }],
      },
    ]);
  },
};

export default nextConfig;
