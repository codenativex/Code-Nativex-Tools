"use client";

import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

interface ErrorPageProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Details stay in the server/browser log; users only ever see plain language.
    console.error("Unhandled application error", error);
  }, [error]);

  return (
    <Container width="narrow" className="py-24 text-center sm:py-32">
      <h1 className="text-3xl font-semibold sm:text-4xl">Something went wrong</h1>
      <p className="mx-auto mt-4 max-w-md text-[0.9375rem] leading-relaxed text-ink-muted">
        This page failed to load. Trying again usually resolves it. If it keeps happening, the issue is on our side and
        has been logged.
      </p>
      {error.digest ? <p className="mt-3 font-mono text-xs text-ink-subtle">Reference: {error.digest}</p> : null}
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Go to the homepage
        </ButtonLink>
      </div>
    </Container>
  );
}
