import type { Metadata } from "next";

import { absoluteUrl, siteConfig } from "@/lib/site";

interface PageMetadataInput {
  readonly title: string;
  readonly description: string;
  /** Route path, e.g. `/tools/website-audit`. */
  readonly path: string;
  readonly keywords?: readonly string[];
  readonly noIndex?: boolean;
}

/**
 * Single entry point for page metadata so titles, canonicals and social cards
 * stay consistent across every route.
 */
export function buildPageMetadata({ title, description, path, keywords, noIndex }: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    ...(keywords && keywords.length > 0 ? { keywords: [...keywords] } : {}),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: siteConfig.twitterHandle,
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
