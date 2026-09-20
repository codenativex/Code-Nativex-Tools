import type { ToolDefinition } from "../types";

export const metaTagGeneratorTool: ToolDefinition = {
  id: "meta-tag-generator",
  slug: "meta-tag-generator",
  name: "Meta Tag Generator",
  category: "seo",
  status: "live",
  summary: "Produce a complete, validated set of title, description, Open Graph and Twitter tags.",
  description:
    "Enter your page details and receive a ready-to-paste block of meta tags covering search, Open Graph and Twitter cards, with length warnings for anything search engines are likely to truncate.",
  keywords: ["meta tags", "open graph", "twitter card", "seo metadata", "html head"],
  featured: true,
  addedAt: "2026-09-19",
  fields: [
    { name: "title", label: "Page title", type: "text", placeholder: "Code Nativex Tools", help: "Aim for 50–60 characters.", example: "Website Audit Agent — Code Nativex Tools", required: true, maxLength: 200 },
    { name: "description", label: "Meta description", type: "textarea", placeholder: "What this page offers, in one or two sentences.", help: "Aim for 120–160 characters.", example: "Audit any public URL for SEO, accessibility and technical issues, and get a prioritised fix list in seconds.", required: true, maxLength: 400 },
    { name: "url", label: "Canonical URL", type: "url", placeholder: "https://example.com/page", example: "https://example.com/tools/website-audit", required: true, maxLength: 2048 },
    { name: "imageUrl", label: "Social share image URL", type: "url", placeholder: "https://example.com/og.png", help: "Optional. 1200×630 works best.", required: false, maxLength: 2048 },
    { name: "siteName", label: "Site name", type: "text", placeholder: "Code Nativex", required: false, maxLength: 120 },
    {
      name: "twitterCard",
      label: "Twitter card type",
      type: "select",
      required: true,
      options: [
        { value: "summary_large_image", label: "Summary with large image" },
        { value: "summary", label: "Summary" },
      ],
    },
  ],
  runtime: {
    endpoint: "/api/tools/meta-tag-generator",
    stages: [
      { id: "validate", label: "Validating input" },
      { id: "generate", label: "Generating tags" },
    ],
    resultView: "code-output",
  },
  learning: {
    problem:
      "Hand-written head markup drifts: titles get too long, Open Graph tags go missing, and share previews break without anyone noticing.",
    audience: ["Developers", "SEO specialists", "Content and marketing teams"],
    input: "Page title, description, canonical URL, and optionally a share image and site name.",
    output: "A copy-ready HTML block plus warnings for any value likely to be truncated or ignored.",
    howItWorks: [
      "You fill in the page details.",
      "Values are validated and escaped on the server.",
      "Search, Open Graph and Twitter tags are assembled from one source of truth.",
      "Length warnings are returned alongside the markup.",
    ],
    exampleUseCase:
      "A content team generates the head block for each new landing page and pastes it straight into the CMS.",
  },
};
