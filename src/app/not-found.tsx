import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Container width="narrow" className="py-24 text-center sm:py-32">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-accent">404</p>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">We could not find that page</h1>
      <p className="mx-auto mt-4 max-w-md text-[0.9375rem] leading-relaxed text-ink-muted">
        The link may be out of date, or the tool may have moved. The directory has everything currently available.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href="/tools">Browse all tools</ButtonLink>
        <ButtonLink href="/learning" variant="secondary">
          Visit the Learning Center
        </ButtonLink>
      </div>
    </Container>
  );
}
