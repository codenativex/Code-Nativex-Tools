import type { ToolDefinition } from "../types";

export const websiteAuditTool: ToolDefinition = {
  id: "website-audit",
  slug: "website-audit",
  name: "Website Audit Agent",
  category: "website-auditing",
  status: "live",
  summary: "Fetch any public page and get a structured SEO, accessibility and technical health report.",
  description:
    "The Website Audit Agent requests a public URL from our servers, parses the returned HTML and grades it across SEO, content structure, accessibility, technical setup, links, images and mobile readiness. Every finding points at markup the agent actually observed.",
  keywords: ["website audit", "seo audit", "site checker", "technical seo", "accessibility audit"],
  featured: true,
  addedAt: "2026-09-21",
  fields: [
    {
      name: "url",
      label: "Website URL",
      type: "url",
      placeholder: "https://example.com",
      help: "Public pages only. The agent follows redirects and reads the returned HTML.",
      example: "https://example.com",
      required: true,
      maxLength: 2048,
    },
  ],
  runtime: {
    endpoint: "/api/tools/website-audit",
    stages: [
      { id: "validate", label: "Validating URL" },
      { id: "fetch", label: "Fetching website" },
      { id: "parse", label: "Analyzing page structure" },
      { id: "seo", label: "Checking SEO and metadata" },
      { id: "technical", label: "Evaluating technical and accessibility signals" },
      { id: "report", label: "Generating recommendations" },
    ],
    resultView: "audit-report",
  },
  learning: {
    problem:
      "Site problems are invisible until traffic drops. Most owners have no quick way to see whether their markup, metadata and accessibility basics are in order.",
    audience: [
      "Developers shipping or inheriting a site",
      "Agencies running client health checks",
      "Marketers validating a page before a campaign",
      "Site owners without an in-house technical team",
    ],
    input: "One public URL, for example https://example.com.",
    output:
      "An overall score, per-category scores, and a list of passed checks, warnings and issues, each with the evidence found in the page and a concrete recommendation.",
    howItWorks: [
      "You paste a URL and run the audit.",
      "Our server requests the page directly — nothing is fetched from your browser.",
      "The returned HTML is parsed into a document model.",
      "Deterministic checks run over metadata, headings, links, images, accessibility attributes and transport security.",
      "Scores are computed per category and rolled up into an overall grade.",
      "Findings are returned with the exact values the agent observed.",
    ],
    exampleUseCase:
      "Before a redesign goes live, an agency audits every template URL, exports the reports, and hands the engineering team a prioritised fix list.",
    sections: [
      {
        heading: "What the report covers",
        body: "Checks are grouped into seven categories. Each one is scored independently, then rolled into the overall grade so a single weak area never hides behind strong ones.",
        bullets: [
          "SEO and metadata — title, description, canonical, Open Graph, indexability",
          "Content and structure — heading hierarchy and content volume",
          "Accessibility — document language, image alternatives, form labels, landmarks",
          "Technical and security — HTTPS, redirects, document size, render-blocking scripts, structured data",
          "Links — internal linking, descriptive link text, new-tab safety",
          "Images — explicit dimensions, lazy loading, responsive sources",
          "Mobile readiness — viewport configuration, pinch zoom, fixed pixel widths",
        ],
      },
      {
        heading: "How scoring works",
        body: "A passed check scores full marks, a warning scores half and an issue scores zero. A category score is the average across its checks, and the overall score is the average across every check on the page. There is no weighting or curve — the number is reproducible from the findings list.",
      },
      {
        heading: "What it does not do",
        body: "The agent reads the HTML the server returns. It does not execute JavaScript, so content rendered entirely on the client is not visible to it, and it does not measure real-user performance, crawl your whole site, or log in behind authentication. Those belong to tools listed as in development.",
      },
      {
        heading: "Privacy and limits",
        body: "Audits run server-side against public URLs only; requests to private or internal addresses are rejected. Reports are returned to your browser and are not stored. Runs are rate limited per connection to keep the service available.",
      },
    ],
  },
};
