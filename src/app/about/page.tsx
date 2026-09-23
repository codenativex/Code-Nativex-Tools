import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "About the platform",
  description:
    "How Code Nativex Tools is built: honest results, a configuration-driven architecture, and a standard that every new tool has to meet.",
  path: "/about",
});

const commitments = [
  {
    title: "Results are earned, not generated",
    body: "A report only ever describes work that ran. If a page could not be fetched, the tool says so. Tools without an engine are labelled as in development rather than shipped with placeholder output.",
  },
  {
    title: "One architecture, many tools",
    body: "Every tool is a typed definition: inputs, validation, processing stages, result view, documentation and SEO metadata. The directory, tool pages, learning center and sitemap are all derived from it, so the hundredth tool costs the same to add as the third.",
  },
  {
    title: "Server-side by default",
    body: "Analysis, validation and secrets stay on the server. The browser receives rendered HTML and a small amount of interactive JavaScript — nothing more.",
  },
  {
    title: "Accessible and responsive from the first commit",
    body: "Semantic structure, labelled controls, visible focus, adequate touch targets and layouts designed for a phone before a monitor. These are build-time requirements, not a pre-launch checklist.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-line bg-page-header">
        <Container width="narrow" className="py-16 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">About</p>
          <h1 className="mt-4 text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            A tools platform built like a product
          </h1>
          <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
            {siteConfig.name} is the tools arm of Code Nativex. It exists to turn the repetitive parts of building and
            maintaining websites into something you can run in a few seconds and trust the output of.
          </p>
        </Container>
      </section>

      <Container width="narrow" className="py-14 sm:py-20">
        <div className="space-y-12">
          {commitments.map((item, index) => (
            <section key={item.title}>
              <p aria-hidden="true" className="font-mono text-sm text-ink-subtle">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ink sm:text-2xl">{item.title}</h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted">{item.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-card border border-line bg-surface p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-ink">Start with the Website Audit Agent</h2>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
            It is the clearest example of how everything here is meant to work: one input, real analysis, and a report
            that shows its evidence.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/tools/website-audit">Run an audit</ButtonLink>
            <ButtonLink href={siteConfig.mainSiteUrl} external variant="secondary">
              Visit Code Nativex
            </ButtonLink>
          </div>
        </div>
      </Container>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
    </>
  );
}
