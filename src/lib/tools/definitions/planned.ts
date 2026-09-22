import type { ToolDefinition } from "../types";

/**
 * Tools that are specified and documented but not yet runnable. They appear in
 * the directory and learning center marked as planned, and gain a `runtime`
 * once their engine ships — no other change is required.
 */
type PlannedToolInput = Omit<ToolDefinition, "status" | "featured" | "runtime" | "fields"> &
  Partial<Pick<ToolDefinition, "fields">>;

function definePlannedTool(input: PlannedToolInput): ToolDefinition {
  return { ...input, fields: input.fields ?? [], status: "planned", featured: false };
}

export const plannedTools: readonly ToolDefinition[] = [
  definePlannedTool({
    id: "seo-agent",
    slug: "seo-agent",
    name: "SEO Agent",
    category: "ai-agents",
    summary: "Watches your search presence and tells you what to publish next.",
    description:
      "The SEO Agent finds the queries you already show up for but nobody clicks, then drafts the page that would actually win them. It combines impression and position data with on-page analysis, so every recommendation points at a specific query you are already close to ranking for.",
    keywords: ["seo agent", "search console", "content gap", "keyword optimisation", "on-page seo"],
    addedAt: "2026-09-15",
    learning: {
      problem:
        "Most sites already rank on page two for queries nobody has noticed. That demand is invisible without joining search data to the pages that serve it, so teams keep guessing at what to write next.",
      audience: ["SEO specialists", "Content teams", "Agencies", "Founders doing their own marketing"],
      input: "Your site, a connected search data source, and optionally a topic to focus on.",
      output:
        "A ranked publishing queue: the query, where you currently sit, why the existing page falls short, and a draft outline for the page that would win it.",
      howItWorks: [
        "Impressions, clicks and average position are pulled for your property.",
        "Queries with demand but weak click-through are isolated.",
        "The page currently serving each query is fetched and analysed.",
        "Gaps are ranked by expected traffic gain against the effort to fix them.",
        "A draft outline is produced for the highest-value opportunities.",
      ],
      exampleUseCase:
        "A founder finds eleven queries their site already ranks 8th–15th for, and publishes three pages that turn impressions into clicks.",
    },
  }),
  definePlannedTool({
    id: "content-writer-agent",
    slug: "content-writer-agent",
    name: "Content Writer Agent",
    category: "content",
    summary: "Writes from your own material, not the open web.",
    description:
      "The Content Writer Agent reads your case studies, documentation and past posts, so drafts sound like your team and cite work you genuinely did. It is grounded in your material by design — it does not invent claims, clients or results.",
    keywords: ["content writer", "ai writing", "brand voice", "drafting", "content agent"],
    addedAt: "2026-09-18",
    learning: {
      problem:
        "Generic AI drafts read like everyone else's and cite nothing you actually did. Editing them back into your voice takes longer than writing from scratch.",
      audience: ["Content teams", "Agencies", "Founders", "Technical writers"],
      input: "Your existing material — case studies, docs, past posts — plus a brief for the piece you need.",
      output: "A draft in your voice, with every specific claim traced back to the source it came from.",
      howItWorks: [
        "Your material is indexed as the only source the agent may draw on.",
        "The brief is matched against the relevant source passages.",
        "A draft is written from those passages, in the voice they establish.",
        "Each specific claim is returned with a citation to its source, so you can check it.",
      ],
      exampleUseCase:
        "An agency turns three delivered projects into a case-study page that cites real numbers from its own reports, with nothing invented.",
    },
  }),
  definePlannedTool({
    id: "accessibility-agent",
    slug: "accessibility-agent",
    name: "Accessibility Agent",
    category: "ai-agents",
    summary: "WCAG-oriented review of a page with remediation guidance per violation.",
    description:
      "A deeper accessibility pass than the Website Audit Agent's summary checks, mapping findings to specific WCAG 2.2 success criteria.",
    keywords: ["accessibility", "wcag", "a11y audit"],
    addedAt: "2026-09-15",
    learning: {
      problem: "Automated accessibility output is often a wall of rule IDs with no path to a fix.",
      audience: ["Developers", "Design teams", "Compliance owners"],
      input: "A public page URL.",
      output: "Violations grouped by WCAG criterion, each with the offending markup and a suggested fix.",
      howItWorks: [
        "The rendered DOM is inspected.",
        "Findings are mapped to WCAG 2.2 success criteria.",
        "Each violation is returned with its element and a remediation snippet.",
      ],
      exampleUseCase: "A team preparing an accessibility statement establishes a baseline across key templates.",
    },
  }),
  definePlannedTool({
    id: "performance-agent",
    slug: "performance-agent",
    name: "Website Performance Agent",
    category: "ai-agents",
    summary: "Field and lab performance signals explained in terms of what to change.",
    description:
      "Collects performance measurements for a URL and translates them into concrete engineering work rather than raw metric names.",
    keywords: ["core web vitals", "performance", "lighthouse"],
    addedAt: "2026-09-12",
    learning: {
      problem: "Performance reports name metrics but rarely identify the code responsible.",
      audience: ["Frontend developers", "Site owners"],
      input: "A public page URL.",
      output: "Core Web Vitals with the contributing resources and a prioritised fix list.",
      howItWorks: [
        "Performance data is collected for the URL.",
        "Contributing resources are attributed to each metric.",
        "Fixes are ranked by expected gain.",
      ],
      exampleUseCase: "An engineer confirms which third-party script is responsible for a poor LCP.",
    },
  }),
  definePlannedTool({
    id: "schema-generator",
    slug: "schema-generator",
    name: "Schema Generator",
    category: "seo",
    summary: "Build valid JSON-LD structured data for articles, products, organisations and FAQs.",
    description:
      "A guided builder that produces schema.org JSON-LD, validated against the required and recommended properties for each type.",
    keywords: ["json-ld", "structured data", "schema.org", "rich results"],
    addedAt: "2026-09-12",
    learning: {
      problem: "Structured data is easy to get subtly wrong, and invalid markup silently loses rich results.",
      audience: ["Developers", "SEO specialists"],
      input: "A schema type and its properties.",
      output: "A validated JSON-LD script block.",
      howItWorks: [
        "You choose a schema.org type.",
        "The form adapts to that type's properties.",
        "Output is validated before it is returned.",
      ],
      exampleUseCase: "A publisher adds Article markup across a news template.",
    },
  }),
  definePlannedTool({
    id: "sitemap-generator",
    slug: "sitemap-generator",
    name: "Sitemap Generator",
    category: "seo",
    summary: "Crawl a site and produce a clean XML sitemap with priorities and change frequencies.",
    description:
      "Discovers internal URLs from a starting page, filters out non-indexable routes, and emits a submission-ready XML sitemap.",
    keywords: ["sitemap", "xml sitemap", "crawler", "indexing"],
    addedAt: "2026-09-08",
    learning: {
      problem: "Hand-maintained sitemaps drift out of sync with the site they describe.",
      audience: ["Developers", "Site owners", "Agencies"],
      input: "A starting URL and an optional crawl depth.",
      output: "A downloadable XML sitemap plus the list of URLs that were excluded and why.",
      howItWorks: [
        "Internal links are discovered from the starting URL.",
        "Non-indexable and duplicate routes are filtered out.",
        "The remaining URLs are written to XML.",
      ],
      exampleUseCase: "A site without a CMS-generated sitemap produces one before submitting to Search Console.",
    },
  }),
  definePlannedTool({
    id: "competitor-analysis-agent",
    slug: "competitor-analysis-agent",
    name: "Competitor Analysis Agent",
    category: "marketing",
    summary: "Compare your page against competing pages on structure, coverage and metadata.",
    description:
      "Runs the same analysis across your page and a set of competitor URLs, then reports where you differ and where you are behind.",
    keywords: ["competitor analysis", "content gap", "serp"],
    addedAt: "2026-09-08",
    learning: {
      problem: "Competitive research is manual, inconsistent and hard to repeat.",
      audience: ["Marketers", "SEO specialists", "Agencies"],
      input: "Your URL and up to five competitor URLs.",
      output: "A side-by-side comparison with the gaps that matter most.",
      howItWorks: [
        "Each URL is fetched and analysed identically.",
        "Results are aligned into a comparison matrix.",
        "Differences are ranked by likely impact.",
      ],
      exampleUseCase: "A team plans a content refresh by seeing what top-ranking pages cover that theirs does not.",
    },
  }),
  definePlannedTool({
    id: "content-analysis-agent",
    slug: "content-analysis-agent",
    name: "Content Analysis Agent",
    category: "content",
    summary: "Readability, structure and coverage analysis for long-form content.",
    description:
      "Reviews a draft or published page for readability, heading structure, coverage of its topic and internal linking opportunities.",
    keywords: ["readability", "content audit", "editorial"],
    addedAt: "2026-09-04",
    learning: {
      problem: "Editorial feedback is subjective and slow to gather.",
      audience: ["Writers", "Editors", "Content teams"],
      input: "Pasted text or a page URL.",
      output: "Readability scores, structural notes and coverage gaps.",
      howItWorks: [
        "The text is segmented and scored for readability.",
        "Heading structure and section balance are checked.",
        "Topic coverage gaps are surfaced.",
      ],
      exampleUseCase: "An editor triages a backlog of drafts before assigning review time.",
    },
  }),
  definePlannedTool({
    id: "scheduled-audits",
    slug: "scheduled-audits",
    name: "Scheduled Audits",
    category: "automation",
    summary: "Run any Code Nativex audit on a schedule and get alerted when scores move.",
    description:
      "Turns a one-off audit into a monitored check: pick the tool, pick the cadence, and receive a diff when results change.",
    keywords: ["monitoring", "scheduled", "alerts", "automation"],
    addedAt: "2026-09-04",
    learning: {
      problem: "A one-time audit goes stale the moment the next deploy ships.",
      audience: ["Agencies", "In-house teams", "Site owners"],
      input: "A tool, its inputs, and a schedule.",
      output: "A run history with score trends and change alerts.",
      howItWorks: [
        "You configure a tool run and a cadence.",
        "Runs execute on schedule server-side.",
        "Results are diffed against the previous run and alerts are sent on change.",
      ],
      exampleUseCase: "An agency monitors twenty client sites weekly and is notified when a score drops.",
    },
  }),
] as const;
