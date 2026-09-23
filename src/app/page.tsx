import type { Metadata } from "next";
import Link from "next/link";

import { FaqList } from "@/components/faq/faq-list";
import { AgentConsole, type ConsoleAgent } from "@/components/home/agent-console";
import { ToolGrid } from "@/components/tools/tool-grid";
import { toolIconName } from "@/components/tools/tool-icon";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqGroups } from "@/lib/faq/entries";
import { STANDARD_OPTIONS } from "@/lib/audit-agent/presets";
import { plans } from "@/lib/pricing/plans";
import { getCategory } from "@/lib/tools/categories";
import { getRunnableTools, tools } from "@/lib/tools/registry";
import type { ToolDefinition } from "@/lib/tools/types";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** What a Standard Audit actually exercises, per the audit worker's contract. */
const auditCoverage = [
  { name: "Page discovery", detail: `Crawls and audits up to ${STANDARD_OPTIONS.max_pages} public pages` },
  { name: "Lighthouse", detail: "Performance, accessibility, SEO and best practices per page" },
  { name: "Responsive testing", detail: "Real browser rendering across viewport sizes" },
  { name: "Accessibility", detail: "Automated checks run against the rendered page" },
  { name: "Link checking", detail: "Internal links plus a configurable external budget" },
  { name: "Evidence", detail: "Findings carry the page and proof they came from" },
  { name: "Reports", detail: "PDF, HTML and JSON artifacts when the worker publishes them" },
] as const;

/** Lighthouse reports performance, accessibility, SEO and best practices. */
const lighthouseCategoryCount = 4;

const assurances = ["Free to start, no account", "Real runs, never simulated", "Evidence with every result"] as const;

/** How many in-development agents the hero console lists beside the live ones. */
const CONSOLE_PLANNED_LIMIT = 4;
const CONSOLE_PLANNED_STEPS = 4;

/** Shapes a registry entry for the client-side console, keeping only serializable fields. */
function toConsoleAgent(tool: ToolDefinition): ConsoleAgent {
  return {
    slug: tool.slug,
    name: tool.name,
    categoryName: getCategory(tool.category).name,
    status: tool.status,
    icon: toolIconName(tool),
    summary: tool.summary,
    steps: tool.runtime
      ? tool.runtime.stages.map((stage) => stage.label)
      : tool.learning.howItWorks.slice(0, CONSOLE_PLANNED_STEPS),
    isRunnable: tool.runtime !== undefined,
  };
}

const howItWorks = [
  { step: "Pick an agent", body: "Every agent page says what it needs and what it returns before you type anything." },
  { step: "Give it a brief", body: "A URL, or a short form. No account, no card, no onboarding flow to get through." },
  { step: "It runs on our infrastructure", body: "Real work, not a simulation. The stages you see are the stages the agent reports." },
  { step: "Act on the report", body: "Issues first, each with the evidence the tool observed and a specific recommendation." },
] as const;

const audiences = [
  { title: "Developers", body: "Check a build before it ships, and hand a reviewer something concrete instead of an opinion." },
  { title: "Agencies", body: "Run the same health check across every client site and export the reports you already produce by hand." },
  { title: "Marketers", body: "Validate a landing page before the spend starts, without waiting on an engineering ticket." },
  { title: "Site owners", body: "Find out what is actually wrong with your site when you have no in-house technical team." },
] as const;

const principles = [
  {
    title: "Real analysis, never filler",
    body: "Every result comes from work the platform actually performed. A tool without a finished engine is published as a specification, not wired to placeholder output.",
  },
  {
    title: "Built to grow",
    body: "Tools are configuration, not bespoke pages. A new agent plugs into the same runner, directory, documentation and SEO surface as the last one.",
  },
  {
    title: "Fast on any device",
    body: "Server-rendered pages, no heavyweight client libraries, and interfaces designed for a phone before a monitor.",
  },
] as const;

export default function HomePage() {
  const liveTools = getRunnableTools();
  const upcomingTools = tools.filter((tool) => tool.runtime === undefined);
  const consoleAgents = [...liveTools, ...upcomingTools.slice(0, CONSOLE_PLANNED_LIMIT)].map(toConsoleAgent);
  const platformFaq = faqGroups.find((group) => group.id === "platform");

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-grid" />

        <Container width="wide" className="relative py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 items-center gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,35rem)] xl:gap-14">
            <div className="max-w-3xl xl:max-w-2xl">
              <Link
                href="/tools"
                className="group inline-flex max-w-full items-center gap-2 rounded-full border border-line-strong bg-surface/70 py-1 pl-1 pr-3 text-xs text-ink-muted transition-colors hover:border-ink-subtle hover:text-ink"
              >
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-positive/15 px-2 py-0.5 font-medium text-positive-ink">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-positive" />
                  {liveTools.length} live
                </span>
                <span className="truncate">{upcomingTools.length} more agents in development</span>
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>

              <h1 className="mt-6 text-[2.375rem] font-bold leading-[1.04] sm:text-[3.25rem] xl:text-[3.75rem]">
                Put specialised agents to work <span className="text-ink-subtle">on your website</span>
              </h1>

              <p className="mt-6 text-base leading-relaxed text-ink-muted sm:text-lg">
                Code Nativex runs purpose-built agents for website auditing, lead generation, SEO and content. Each
                one does real work on our infrastructure — crawling in a real browser, verifying sources — and hands
                back evidence your team can act on.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/tools/website-audit" size="lg">
                  Run a website audit
                </ButtonLink>
                <ButtonLink href="/tools" variant="secondary" size="lg">
                  Explore all agents
                </ButtonLink>
              </div>

              <ul className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6">
                {assurances.map((assurance) => (
                  <li key={assurance} className="flex items-center gap-2 text-sm text-ink-muted">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      className="h-4 w-4 shrink-0 text-accent"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m4 10.5 4 4 8-9" />
                    </svg>
                    {assurance}
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0 max-w-3xl xl:max-w-none">
              <AgentConsole agents={consoleAgents} moreCount={tools.length - consoleAgents.length} />
            </div>
          </div>

          <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-4 lg:mt-20">
            {[
              { label: "Agents live now", value: String(liveTools.length) },
              { label: "In the catalogue", value: String(tools.length) },
              { label: "Pages per standard audit", value: String(STANDARD_OPTIONS.max_pages) },
              { label: "Lighthouse categories", value: String(lighthouseCategoryCount) },
            ].map((stat) => (
              // Reversed so the figures share a baseline when a label wraps.
              <div key={stat.label} className="flex flex-col-reverse gap-1 bg-canvas/90 px-5 py-5">
                <dt className="text-xs leading-snug text-ink-subtle">{stat.label}</dt>
                <dd className="font-display text-3xl font-semibold tabular-nums text-ink">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Live tools */}
      <Container width="wide" className="py-16 sm:py-20">
        <SectionHeading
          eyebrow="Available now"
          title="Agents you can run today"
          description="Each runs real work and returns what it actually observed. Try now opens the agent; Read more explains exactly how it works."
        />
        <div className="mt-8">
          <ToolGrid tools={liveTools} columns={2} />
        </div>
      </Container>

      {/* How it works */}
      <section className="border-y border-line bg-band">
        <Container width="wide" className="py-16 sm:py-20">
          <SectionHeading
            eyebrow="How it works"
            title="One input, a real run, a report you can act on"
            description="The same four steps apply to every agent on the platform."
          />
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {howItWorks.map((item, index) => (
              <li key={item.step} className="border-t border-line pt-5">
                <p aria-hidden="true" className="font-mono text-sm text-ink-subtle">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-base font-semibold text-ink">{item.step}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* What the audit covers */}
      <Container width="wide" className="py-16 sm:py-20">
        <SectionHeading
          eyebrow="Inside the Website Audit Agent"
          title="A real crawl, in a real browser, with the evidence attached"
          description={`A Standard Audit discovers up to ${STANDARD_OPTIONS.max_pages} pages and runs Lighthouse on every one of them. Progress reflects the worker\u2019s actual stage — no invented percentages.`}
          action={
            <ButtonLink href="/learning/website-audit" variant="secondary">
              How the audit works
            </ButtonLink>
          }
        />
        {/* Seven capabilities plus the call to action fill two even rows of four. */}
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {auditCoverage.map((category) => (
            <li key={category.name} className="rounded-card border border-line bg-surface p-5">
              <h3 className="text-sm font-semibold text-ink">{category.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{category.detail}</p>
            </li>
          ))}
          <li className="flex flex-col justify-between gap-4 rounded-card border border-accent/30 bg-accent-soft p-5">
            <p className="text-sm font-semibold text-ink">See it on your own site</p>
            <ButtonLink href="/tools/website-audit" size="sm">
              Run an audit now
            </ButtonLink>
          </li>
        </ul>
      </Container>

      {/* Full catalogue */}
      <section className="border-y border-line bg-band">
        <Container width="wide" className="py-16 sm:py-20">
          <SectionHeading
            eyebrow="The catalogue"
            title="Everything we are building"
            description="What is live, and what is specified and on the way. We publish the specification before the engine, so you can tell us if it solves the wrong problem."
            action={
              <ButtonLink href="/tools" variant="secondary">
                Open the directory
              </ButtonLink>
            }
          />

          <h3 className="mt-10 text-sm font-semibold uppercase tracking-[0.08em] text-ink-subtle">
            Live — {liveTools.length} tools
          </h3>
          <div className="mt-4">
            <ToolGrid tools={liveTools} />
          </div>

          <h3 className="mt-12 text-sm font-semibold uppercase tracking-[0.08em] text-ink-subtle">
            In development — {upcomingTools.length} tools
          </h3>
          <div className="mt-4">
            <ToolGrid tools={upcomingTools} />
          </div>
        </Container>
      </section>

      {/* Who it is for */}
      <Container width="wide" className="py-16 sm:py-20">
        <SectionHeading
          eyebrow="Who uses this"
          title="Built for the people who have to fix it"
          description="Different jobs, the same need: find out what is wrong before someone else does."
        />
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {audiences.map((audience) => (
            <li key={audience.title} className="border-t border-line pt-5">
              <h3 className="text-base font-semibold text-ink">{audience.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{audience.body}</p>
            </li>
          ))}
        </ul>
      </Container>

      {/* Principles */}
      <section className="border-y border-line bg-band">
        <Container width="wide" className="py-16 sm:py-20">
          <SectionHeading
            eyebrow="How we build"
            title="A platform, not a pile of one-off pages"
            description="The engineering standard is the product. These are the rules the codebase is held to."
          />
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {principles.map((principle, index) => (
              <li key={principle.title}>
                <p aria-hidden="true" className="font-mono text-sm text-ink-subtle">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-base font-semibold text-ink">{principle.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{principle.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Pricing teaser */}
      <Container width="wide" className="py-16 sm:py-20">
        <SectionHeading
          eyebrow="Pricing"
          title="Start free. Pay when it saves you time."
          description="Every live tool works on the free plan. Paid plans add what teams need once a one-off check becomes part of the job."
          action={
            <ButtonLink href="/pricing" variant="secondary">
              See full pricing
            </ButtonLink>
          }
        />
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <li key={plan.id}>
              <Link
                href="/pricing"
                className="flex h-full flex-col rounded-card border border-line bg-surface p-5 transition-colors hover:border-line-strong"
              >
                <span className="text-sm font-semibold text-ink">{plan.name}</span>
                <span className="mt-3 font-mono text-2xl font-semibold tabular-nums text-ink">
                  {plan.price.monthly === null ? "Custom" : plan.price.monthly === 0 ? "Free" : `$${plan.price.monthly}`}
                  {plan.price.monthly ? <span className="ml-1 font-sans text-xs font-normal text-ink-muted">/ mo</span> : null}
                </span>
                <span className="mt-2 text-sm leading-relaxed text-ink-muted">{plan.tagline}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      {/* FAQ teaser */}
      {platformFaq ? (
        <Container width="narrow" className="pb-16 sm:pb-20">
          <div className="border-t border-line pt-12">
            <SectionHeading as="h2" title="Common questions" />
            <div className="mt-6">
              <FaqList entries={platformFaq.entries} />
            </div>
            <p className="mt-5 text-sm text-ink-muted">
              More answers in the{" "}
              <Link href="/faq" className="font-medium text-accent hover:underline">
                full FAQ
              </Link>
              .
            </p>
          </div>
        </Container>
      ) : null}

      {/* Final CTA */}
      <Container width="wide" className="pb-20">
        <div className="rounded-card border border-line bg-surface p-8 sm:p-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold sm:text-3xl">New to these tools?</h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted">
              The Learning Center explains what every tool does, who it is for, what to give it and what you get back
              — including the ones still in development. Read it before you run anything.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/learning">Open the Learning Center</ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Talk to the team
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
