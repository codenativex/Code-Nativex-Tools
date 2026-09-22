import type { ToolDefinition } from "../types";

export const websiteAuditTool: ToolDefinition = {
  id: "website-audit",
  slug: "website-audit",
  name: "Website Audit Agent",
  category: "website-auditing",
  status: "live",
  summary: "Run a real multi-page website audit with browser testing, Lighthouse, accessibility checks and downloadable reports.",
  description:
    "The Website Audit Agent sends your scan to the Code Nativex live audit worker, discovers public pages and evaluates responsive behavior, Lighthouse performance, SEO, accessibility, best practices, links and evidence. Progress is tracked live and completed runs can publish PDF, HTML, JSON and evidence artifacts.",
  keywords: ["website audit", "seo audit", "lighthouse", "accessibility", "responsive testing", "site checker"],
  featured: true,
  addedAt: "2026-09-21",
  fields: [],
  runtime: {
    endpoint: "/api/tools/website-audit",
    stages: [
      { id: "discover", label: "Discovering pages" },
      { id: "viewport", label: "Testing responsive layouts" },
      { id: "accessibility", label: "Checking accessibility" },
      { id: "lighthouse", label: "Running Lighthouse" },
      { id: "links", label: "Checking links" },
      { id: "report", label: "Generating report" },
    ],
    resultView: "audit-report",
  },
  learning: {
    problem:
      "A single-page HTML check misses the issues that appear only in browsers, across multiple routes, during Lighthouse runs, or at responsive breakpoints.",
    audience: [
      "Developers validating a website before launch",
      "Agencies auditing client sites",
      "Businesses comparing website quality before a redesign",
      "Technical SEO and accessibility teams",
    ],
    input: "A public website URL plus a scan preset. Quick, Standard and Custom modes control the page budget and deeper browser checks.",
    output:
      "Live audit progress followed by evidence-backed findings, audited-page coverage, Lighthouse results and downloadable report artifacts when the worker publishes them.",
    howItWorks: [
      "Choose Quick, Standard or Custom and submit a public URL.",
      "The Code Nativex Tools server securely forwards the job to the separate audit worker.",
      "The worker discovers pages and runs browser, responsive, accessibility and technical checks.",
      "Lighthouse runs on the configured page coverage and link checks run within the selected budget.",
      "The progress page polls the real worker status without inventing completion percentages.",
      "When the worker finishes, report.json is rendered in Tools and available artifacts can be downloaded.",
    ],
    exampleUseCase:
      "Before a client website launches, an agency runs a Standard Audit, reviews high-severity findings, downloads the PDF report and hands the evidence package to engineering.",
    sections: [
      {
        heading: "Scan presets",
        body: "Quick Test is intended for fast verification. Standard Audit covers up to 50 pages and runs Lighthouse on every audited page. Custom exposes the worker's supported limits.",
      },
      {
        heading: "Live progress",
        body: "The progress screen reports the worker's real status and stage. Because page discovery can grow during a crawl, the interface does not invent a fake percentage or ETA.",
      },
      {
        heading: "Reports and evidence",
        body: "Completed audits render report.json directly in Code Nativex Tools. PDF, HTML, JSON and evidence ZIP downloads appear only when the worker actually advertises those files.",
      },
    ],
  },
};
