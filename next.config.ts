import type { NextConfig } from "next";

/** Security headers applied to every route. */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/**
 * Alternative names a tool is linked to from elsewhere — the main Code Nativex
 * site, older posts, or a tool that has been renamed. Each alias resolves to
 * the canonical slug under both /tools and /learning, so an inbound link never
 * lands on a 404.
 */
const slugAliases: Readonly<Record<string, string>> = {
  "site-audit": "website-audit",
  "site-audit-agent": "website-audit",
  "website-audit-agent": "website-audit",
  "content-writer": "content-writer-agent",
  "seo-agent-tool": "seo-agent",
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Linting runs as its own step (`npm run lint`) against the flat config in
  // eslint.config.mjs, which Next's build-time detector does not recognise.
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return Object.entries(slugAliases).flatMap(([alias, slug]) => [
      { source: `/tools/${alias}`, destination: `/tools/${slug}`, permanent: true },
      { source: `/learning/${alias}`, destination: `/learning/${slug}`, permanent: true },
    ]);
  },
};

export default nextConfig;
