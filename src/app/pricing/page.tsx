import type { Metadata } from "next";

import { ComparisonTable } from "@/components/pricing/comparison-table";
import { PricingPlans } from "@/components/pricing/pricing-plans";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqGroups } from "@/lib/faq/entries";
import { FaqList } from "@/components/faq/faq-list";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = buildPageMetadata({
  title: "Pricing",
  description:
    "Simple plans for Code Nativex Tools. Start free with every live tool, upgrade to Pro for scheduling, history and higher limits, or talk to us about Enterprise.",
  path: "/pricing",
  keywords: ["seo tools pricing", "website audit pricing", "code nativex plans"],
});

const billingNotes = [
  "Prices are in US dollars and exclude any applicable taxes.",
  "Change or cancel at any time — cancellation takes effect at the end of the period you have paid for.",
  "Limits are generous by design. If you hit one, the tool tells you plainly instead of failing silently.",
] as const;

export default function PricingPage() {
  const billingFaq = faqGroups.find((group) => group.id === "billing");

  return (
    <>
      <section className="border-b border-line bg-page-header">
        <Container width="wide" className="py-14 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Pricing</p>
            <h1 className="mt-4 text-[1.875rem] font-semibold leading-tight sm:text-4xl">
              Start free. Pay when it saves you time.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Every live tool works on the free plan, with no account and no card. Paid plans add the things teams
              need once a one-off check becomes part of the job.
            </p>
          </div>
        </Container>
      </section>

      <Container width="wide" className="py-12 sm:py-16">
        <PricingPlans />

        <ul className="mx-auto mt-10 max-w-2xl space-y-2">
          {billingNotes.map((note) => (
            <li key={note} className="flex gap-3 text-sm leading-relaxed text-ink-subtle">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-line-strong" />
              {note}
            </li>
          ))}
        </ul>
      </Container>

      <Container width="wide" className="pb-12 sm:pb-16">
        <div className="border-t border-line pt-12">
          <SectionHeading as="h2" title="Compare the plans" description="Everything each plan includes, side by side." />
          <div className="mt-8">
            <ComparisonTable />
          </div>
        </div>
      </Container>

      {billingFaq ? (
        <Container width="narrow" className="pb-12 sm:pb-16">
          <div className="border-t border-line pt-12">
            <SectionHeading as="h2" title="Billing questions" />
            <div className="mt-6">
              <FaqList entries={billingFaq.entries} />
            </div>
            <p className="mt-5 text-sm text-ink-muted">
              More questions are answered in the{" "}
              <a href="/faq" className="font-medium text-accent hover:underline">
                full FAQ
              </a>
              .
            </p>
          </div>
        </Container>
      ) : null}

      <Container width="wide" className="pb-20">
        <div className="rounded-card border border-line bg-surface p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">Not sure which plan fits?</h2>
          <p className="mx-auto mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-ink-muted">
            Tell us how many sites you look after and what you need to catch. We will tell you honestly whether the
            free plan is enough.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/contact">Talk to us</ButtonLink>
            <ButtonLink href="/tools" variant="secondary">
              Try a tool first
            </ButtonLink>
          </div>
        </div>
      </Container>

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Pricing", path: "/pricing" },
          ]),
          ...(billingFaq ? [faqJsonLd(billingFaq.entries)] : []),
        ]}
      />
    </>
  );
}
