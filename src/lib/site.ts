/** Static, environment-aware configuration for the whole platform. */

const DEFAULT_SITE_URL = "http://localhost:3000";

export const siteConfig = {
  name: "Code Nativex Tools",
  shortName: "Nativex Tools",
  tagline: "Learn. Automate. Analyze. Build Better.",
  description:
    "A growing suite of web development, SEO, auditing and AI-agent tools from Code Nativex — built for developers, agencies, marketers and website owners.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, ""),
  mainSiteUrl: process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? "https://codenativex.com",
  twitterHandle: "@codenativex",
} as const;

export const primaryNav = [
  { href: "/tools", label: "Tools" },
  { href: "/learning", label: "Learning Center" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
] as const;

export const footerNav = {
  platform: [
    { href: "/tools", label: "All tools" },
    { href: "/learning", label: "Learning Center" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About the platform" },
  ],
  support: [
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact us" },
  ],
  legal: [
    { href: "/terms", label: "Terms and Conditions" },
    { href: "/privacy", label: "Privacy Policy" },
  ],
} as const;

/** Builds an absolute URL for canonicals, sitemaps and Open Graph tags. */
export function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
