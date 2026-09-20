import type { Metadata } from "next";

import { FaqList } from "@/components/faq/faq-list";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { allFaqEntries, faqGroups } from "@/lib/faq/entries";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = buildPageMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers about Code Nativex Tools: how the audits work, what the scores mean, what we store, and how plans and billing are handled.",
  path: "/faq",
  keywords: ["code nativex faq", "website audit faq", "seo tool questions"],
});

export default function FaqPage() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <Container width="narrow" className="py-14 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">FAQ</p>
          <h1 className="mt-4 text-[1.875rem] font-semibold leading-tight sm:text-4xl">
            Questions, answered plainly
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            How the tools work, what they can and cannot see, what happens to your data, and how plans are handled.
            If something is missing, ask us.
          </p>

          <nav aria-label="FAQ sections" className="mt-8 flex flex-wrap gap-2">
            {faqGroups.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-sm text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
              >
                {group.name}
              </a>
            ))}
          </nav>
        </Container>
      </section>

      <Container width="narrow" className="py-12 sm:py-16">
        <div className="space-y-12">
          {faqGroups.map((group) => (
            <section key={group.id} id={group.id} className="scroll-mt-24">
              <SectionHeading as="h2" title={group.name} />
              <div className="mt-5">
                <FaqList entries={group.entries} />
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-card border border-line bg-surface p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-ink">Still stuck?</h2>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
            Send us the question. Real answers from the people who built the tools, usually within a working day.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contact">Contact us</ButtonLink>
            <ButtonLink href="/learning" variant="secondary">
              Read the Learning Center
            </ButtonLink>
          </div>
        </div>
      </Container>

      <JsonLd
        data={[
          faqJsonLd(allFaqEntries),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        ]}
      />
    </>
  );
}
