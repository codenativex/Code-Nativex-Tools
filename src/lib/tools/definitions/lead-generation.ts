import type { ToolDefinition } from "../types";

export const leadGenerationTool: ToolDefinition = {
  id: "lead-generation",
  slug: "lead-generation",
  name: "Lead Generation Agent",
  category: "ai-agents",
  icon: "leads",
  status: "live",
  summary: "Find, verify and score qualified business leads from multiple public sources.",
  description:
    "Launch a targeted lead search by source, location, business category and service. The connected Code Nativex lead agent discovers businesses, verifies websites and contact details, removes duplicates, scores opportunities and returns the strongest leads with live progress.",
  keywords: [
    "lead generation",
    "ai lead generation",
    "google maps leads",
    "linkedin leads",
    "business leads",
    "prospecting",
  ],
  featured: true,
  addedAt: "2026-09-22",
  fields: [],
  runtime: {
    endpoint: "/api/tools/lead-generation",
    stages: [
      { id: "request_queued", label: "Request queued" },
      { id: "lead_discovery", label: "Discovering businesses" },
      { id: "website_verification", label: "Verifying websites" },
      { id: "lead_intake_cleaning", label: "Cleaning and deduplicating" },
      { id: "lead_research_scoring", label: "Researching and scoring" },
      { id: "finished", label: "Preparing results" },
    ],
    resultView: "code-output",
  },
  learning: {
    problem:
      "Manual prospecting takes hours and mixes weak, duplicate and unverifiable businesses with genuinely useful opportunities.",
    audience: ["Agencies", "Sales teams", "Freelancers", "Business development teams"],
    input:
      "Lead source, target country/region/city, search radius, business categories, service to offer, requested lead count and quality requirements.",
    output:
      "Live pipeline progress followed by verified, scored leads with company, location, website, contact data, opportunity signals and recommended service.",
    howItWorks: [
      "Choose a public discovery source and target market.",
      "The request is securely forwarded to the Code Nativex lead generation agent.",
      "The agent discovers candidate businesses and verifies their public website/contact data.",
      "Duplicates and weak records are removed and remaining leads are researched and scored.",
      "Progress and final lead results are shown directly inside Code Nativex Tools.",
    ],
    exampleUseCase:
      "An agency requests 25 dentists in Dallas that may need a website redesign, then reviews only the verified high-scoring opportunities returned by the agent.",
    capabilities: [
      {
        title: "Five discovery sources",
        body: "Local businesses in an area, LinkedIn posts with requirements, public client projects, agency partners and businesses actively looking for help.",
      },
      {
        title: "Verified websites and contacts",
        body: "Candidate businesses have their public website and contact details verified before they reach you.",
      },
      {
        title: "Deduplication and filtering",
        body: "Duplicate and weak records are removed, so the list holds opportunities rather than noise.",
      },
      {
        title: "Scored opportunities",
        body: "Each lead is researched and scored, with opportunity signals and a recommended service to pitch.",
      },
    ],
    requirements: [
      "A discovery source and a target market: country, region or city.",
      "The business categories to target and the service you want to offer.",
      "How many leads you need and the minimum quality you will accept.",
    ],
    limitations: [
      "Leads come from public sources, so coverage depends on what businesses publish about themselves.",
      "Runs execute on the connected Code Nativex lead agent. This page submits the request and shows its live progress.",
    ],
  },
};
