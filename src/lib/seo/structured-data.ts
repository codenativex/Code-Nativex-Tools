import { absoluteUrl, siteConfig } from "@/lib/site";
import type { ToolDefinition } from "@/lib/tools/types";

type JsonLdObject = Record<string, unknown>;

export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Code Nativex",
    url: siteConfig.mainSiteUrl,
    description: siteConfig.description,
  };
}

export function websiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteConfig.url}/tools?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function toolJsonLd(tool: ToolDefinition): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web browser",
    url: absoluteUrl(`/tools/${tool.slug}`),
    description: tool.description,
    provider: { "@type": "Organization", name: "Code Nativex", url: siteConfig.mainSiteUrl },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

export function breadcrumbJsonLd(items: readonly { name: string; path: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(entries: readonly { question: string; answer: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}

export function howToJsonLd(tool: ToolDefinition): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How the ${tool.name} works`,
    description: tool.learning.problem,
    step: tool.learning.howItWorks.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text,
    })),
  };
}
