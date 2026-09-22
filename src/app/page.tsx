import type { Metadata } from "next";
import Link from "next/link";

import { FaqList } from "@/components/faq/faq-list";
import { HeroPreview } from "@/components/home/hero-preview";
import { ToolGrid } from "@/components/tools/tool-grid";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqGroups } from "@/lib/faq/entries";
import { STANDARD_OPTIONS } from "@/lib/audit-agent/presets";
import { plans } from "@/lib/pricing/plans";
import { siteConfig } from "@/lib/site";
import { getRunnableTools, tools } from "@/lib/tools/registry";

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

/** Lighthouse reports these four categories; kept in step with the hero panel. */
const lighthouseCategoryCount = 4;

/** The three things the platform does, summarised for the hero. */
const capabilities = [
  { label: "Audit", detail: "Crawl a site in a real browser and see what is broken." },
  { label: "Prospect", detail: "Find, verify and score qualified leads from public sources." },
  { label: "Automate", detail: "Scheduled runs and change alerts — in development." },
] as const;

const howItWorks = [
  { step: "Pick a tool", body: "Every tool page says what it needs and what it returns before you type anything." },
  { step: "Give it one input", body: "A URL, or a short form. No account, no card, no onboarding flow to get through." },
  { step: "It runs on our servers", body: "Real work, not a simulation. The stages you see match what the backend is doing." },
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
  const platformFaq = faqGroups.find((group) => group.id === "platform");

  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden border-b border-line bg-surface">
        <Container width="wide" className="py-14 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-sand-line bg-sand-soft px-3 py-1 text-xs font-medium text-ink">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-positive" />
                Tools and automation platform · {liveTools.length} live, {upcomingTools.length} in development
              </p>

              <h1 className="mt-5 text-[2.125rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                {siteConfig.tagline}
              </h1>

              <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
                Code Nativex Tools is where the repetitive parts of building and growing a website get automated.
                Crawl a site in a real browser and run Lighthouse, accessibility, responsive and link checks across
                every page it finds — or put an agent to work sourcing and scoring qualified leads.
              </p>

              <ul className="mt-7 grid gap-4 sm:grid-cols-3">
                {capabilities.map((capability) => (
                  <li key={capability.label} className="border-t border-line pt-3">
                    <p className="text-sm font-semibold text-ink">{capability.label}</p>
                    <p className="mt-1 text-sm leading-snug text-ink-muted">{capability.detail}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/tools/website-audit" size="lg">
                  Run a website audit
                </ButtonLink>
                <ButtonLink href="/tools" variant="secondary" size="lg">
                  Browse all {tools.length} tools
                </ButtonLink>
              </div>

              <p className="mt-4 text-sm text-ink-subtle">
                Free to start · No account required · Results in seconds
              </p>
            </div>

            <div className="relative lg:pl-4">
              {/* Warm band behind the panel, bleeding off the right edge. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-y-10 left-[-2.5rem] right-[-50vw] hidden bg-sand-soft lg:block"
              />
              <div className="relative">
                <HeroPreview />
              </div>
            </div>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-line pt-8 sm:grid-cols-4 lg:mt-16">
            {[
              { label: "Tools you can run now", value: String(liveTools.length) },
              { label: "In the catalogue", value: String(tools.length) },
              { label: "Pages per standard audit", value: String(STANDARD_OPTIONS.max_pages) },
              { label: "Lighthouse categories", value: String(lighthouseCategoryCount) },
            ].map((stat) => (
              // Reversed so the figures share a baseline when a label wraps.
              <div key={stat.label} className="flex flex-col-reverse gap-1">
                <dt className="text-xs leading-snug text-ink-subtle">{stat.label}</dt>
                <dd className="font-mono text-2xl font-semibold tabular-nums text-ink sm:text-3xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Live tools */}
      <Container width="wide" className="py-16 sm:py-20">
        <SectionHeading
          eyebrow="Available now"
          title="Tools you can run today"
          description="These run on our servers and return what they actually observed. Try now opens the tool; Read more explains exactly how it works."
        />
        <div className="mt-8">
          <ToolGrid tools={liveTools} columns={2} />
        </div>
      </Container>

      {/* How it works */}
      <section className="border-y border-line bg-sand-soft">
        <Container width="wide" className="py-16 sm:py-20">
          <SectionHeading
            eyebrow="How it works"
            title="One input, a real run, a report you can act on"
            description="The same four steps apply to every tool on the platform."
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
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {auditCoverage.map((category) => (
            <li key={category.name} className="rounded-card border border-line bg-surface p-5">
              <h3 className="text-sm font-semibold text-ink">{category.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{category.detail}</p>
            </li>
          ))}
        </ul>
        <ButtonLink href="/tools/website-audit" className="mt-6">
          Run an audit now
        </ButtonLink>
      </Container>

      {/* Full catalogue */}
      <section className="border-y border-line bg-surface">
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
      <section className="border-y border-line bg-sand-soft">
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
