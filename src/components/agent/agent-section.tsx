import type { ReactNode } from "react";

interface AgentSectionProps {
  /** Anchor for the "On this page" navigation. */
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
}

/**
 * One section of an agent page. Every section shares the same heading scale and
 * the same gap between heading and content, which keeps the page rhythm even.
 */
export function AgentSection({ id, title, description, children }: AgentSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <h2 id={`${id}-title`} className="text-xl font-semibold text-ink sm:text-2xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-muted">{description}</p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}
