import type { Metadata } from "next";
import { Suspense } from "react";

import { ContactForm } from "@/components/contact/contact-form";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { isContactConfigured } from "@/lib/contact/config";
import { company } from "@/lib/legal/company";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";

/** Reads CONTACT_WEBHOOK_URL at request time, so deploy-time config is respected. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact us",
  description:
    "Talk to the team behind Code Nativex Tools about a plan, a tool that is not doing what you need, or something you would like us to build.",
  path: "/contact",
});

const reasons = [
  { title: "Plans and volume", body: "Work out whether the free plan is enough, or what Pro and Enterprise would cost for your usage." },
  { title: "Help with a tool", body: "A result you do not understand, or a check you think is wrong. Send the URL and we will look." },
  { title: "Tell us what to build", body: "The tools on the roadmap came from requests like yours. Tell us what you keep doing by hand." },
] as const;

function FormFallback() {
  return <div aria-hidden="true" className="h-[32rem] rounded-card border border-line bg-surface" />;
}

export default function ContactPage() {
  const canSubmit = isContactConfigured();

  return (
    <>
      <section className="border-b border-line bg-surface">
        <Container width="wide" className="py-14 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Contact</p>
            <h1 className="mt-4 text-[1.875rem] font-semibold leading-tight sm:text-4xl">Talk to the team</h1>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Questions about a plan, a result you want a second opinion on, or a tool you wish existed. Messages
              reach the people who built the platform.
            </p>
          </div>
        </Container>
      </section>

      <Container width="wide" className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12">
          <div className="min-w-0">
            {canSubmit ? (
              <Suspense fallback={<FormFallback />}>
                <ContactForm />
              </Suspense>
            ) : (
              <div className="rounded-card border border-line bg-surface p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-ink">Email us directly</h2>
                <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-ink-muted">
                  The contact form is not connected yet, so rather than take a message we cannot deliver, here is the
                  address that reaches us.
                </p>
                <ButtonLink href={`mailto:${company.contactEmail}`} external className="mt-6">
                  {company.contactEmail}
                </ButtonLink>
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-card border border-line bg-surface p-5">
              <h2 className="text-sm font-semibold text-ink">What people write in about</h2>
              <dl className="mt-4 space-y-4">
                {reasons.map((reason) => (
                  <div key={reason.title}>
                    <dt className="text-sm font-medium text-ink">{reason.title}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-ink-muted">{reason.body}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="rounded-card border border-line bg-surface p-5">
              <h2 className="text-sm font-semibold text-ink">Prefer to read first?</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Most questions about how a tool behaves are already answered.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <ButtonLink href="/faq" variant="secondary" size="sm" fullWidth>
                  Read the FAQ
                </ButtonLink>
                <ButtonLink href="/learning" variant="secondary" size="sm" fullWidth>
                  Learning Center
                </ButtonLink>
              </div>
            </section>
          </aside>
        </div>
      </Container>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
    </>
  );
}
