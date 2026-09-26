import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AgentAtAGlance } from "@/components/agent/agent-at-a-glance";
import { AgentHero } from "@/components/agent/agent-hero";
import { AgentSection } from "@/components/agent/agent-section";
import { AgentStageFlow, hasStageFlow } from "@/components/agent/agent-stage-flow";
import { AgentTimeline } from "@/components/agent/agent-timeline";
import { JsonLd } from "@/components/seo/json-ld";
import { ToolGrid } from "@/components/tools/tool-grid";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, howToJsonLd } from "@/lib/seo/structured-data";
import { getRelatedTools, getToolBySlug, tools } from "@/lib/tools/registry";
import type { ToolDefinition } from "@/lib/tools/types";

interface LearningDetailProps {
  readonly params: Promise<{ readonly slug: string }>;
}

interface PageSection {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly content: ReactNode;
}

export function generateStaticParams(): { slug: string }[] {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: LearningDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return buildPageMetadata({
      title: "Guide not found",
      description: "This guide does not exist in the Code Nativex Learning Center.",
      path: `/learning/${slug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `${tool.name} — how it works`,
    description: `${tool.learning.problem} Learn what the ${tool.name} needs, what it returns and how to read its output.`,
    path: `/learning/${tool.slug}`,
    keywords: [...tool.keywords, `${tool.name} guide`],
  });
}

function Bullet() {
  return <span aria-hidden="true" className="mt-[0.5625rem] h-1.5 w-1.5 shrink-0 rounded-full bg-ink-subtle" />;
}

function CheckMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-positive" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 10.5 3.5 3.5 6.5-7.5" />
    </svg>
  );
}

/**
 * The page's sections, in reading order. Optional content only produces a
 * section when the agent actually has it, and the "On this page" navigation is
 * built from the same list, so the two never drift apart.
 */
function buildSections(tool: ToolDefinition): readonly PageSection[] {
  const { learning } = tool;
  const isRunnable = tool.runtime !== undefined;
  const stages = tool.runtime?.stages;

  const sections: (PageSection | null)[] = [
    {
      id: "overview",
      title: "Overview",
      content: (
        <div className="space-y-5">
          <p className="max-w-3xl text-base leading-relaxed text-ink">{learning.problem}</p>
          {isRunnable ? null : (
            <p className="max-w-3xl rounded-card border border-line bg-surface-muted px-5 py-4 text-sm leading-relaxed text-ink-muted">
              <span className="font-semibold text-ink">In development.</span> This page documents the planned
              behaviour. The agent can&rsquo;t be run yet, and nothing here describes results it has produced.
            </p>
          )}
        </div>
      ),
    },
    learning.capabilities?.length
      ? {
          id: "capabilities",
          title: "What it does",
          content: (
            <ul className="grid gap-4 sm:grid-cols-2">
              {learning.capabilities.map((capability) => (
                <li key={capability.title} className="rounded-card border border-line bg-surface p-5">
                  <h3 className="text-[0.9375rem] font-semibold text-ink">{capability.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{capability.body}</p>
                </li>
              ))}
            </ul>
          ),
        }
      : null,
    {
      id: "how-it-works",
      title: "How it works",
      description: isRunnable ? undefined : "The planned sequence, as specified.",
      content: (
        <>
          <AgentTimeline steps={learning.howItWorks} />
          {hasStageFlow(stages) ? (
            <div className="mt-10 rounded-card border border-line bg-surface-muted p-5 sm:p-6">
              <h3 className="text-[0.9375rem] font-semibold text-ink">What you see while it runs</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                The stages the agent reports during a run, in order. Progress comes from the agent itself.
              </p>
              <div className="mt-5">
                <AgentStageFlow stages={stages} />
              </div>
            </div>
          ) : null}
        </>
      ),
    },
    {
      id: "inputs-outputs",
      title: "What goes in, what comes out",
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "You provide", body: learning.input },
            { label: "You get back", body: learning.output },
          ].map((item) => (
            <div key={item.label} className="rounded-card border border-line bg-surface p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-subtle">{item.label}</h3>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink">{item.body}</p>
            </div>
          ))}
        </div>
      ),
    },
    learning.requirements?.length
      ? {
          id: "requirements",
          title: "Before you start",
          description: "What needs to be in place for a run to succeed.",
          content: (
            <ul className="space-y-3">
              {learning.requirements.map((requirement) => (
                <li key={requirement} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink">
                  <CheckMark />
                  {requirement}
                </li>
              ))}
            </ul>
          ),
        }
      : null,
    {
      id: "audience",
      title: "Who it's for",
      content: (
        <ul className="grid gap-3 sm:grid-cols-2">
          {learning.audience.map((audience) => (
            <li
              key={audience}
              className="flex gap-3 rounded-card border border-line bg-surface px-4 py-3.5 text-[0.9375rem] leading-relaxed text-ink"
            >
              <Bullet />
              {audience}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "example",
      title: "Example use case",
      content: (
        <figure className="rounded-card border border-line bg-surface p-6 sm:p-7">
          <blockquote className="text-base leading-relaxed text-ink sm:text-lg">{learning.exampleUseCase}</blockquote>
          <figcaption className="mt-4 text-xs font-medium uppercase tracking-[0.06em] text-ink-subtle">
            {isRunnable ? "Typical scenario" : "Intended scenario"}
          </figcaption>
        </figure>
      ),
    },
    learning.sections?.length
      ? {
          id: "in-depth",
          title: "In depth",
          content: (
            <div className="space-y-8">
              {learning.sections.map((section) => (
                <div key={section.heading}>
                  <h3 className="text-base font-semibold text-ink">{section.heading}</h3>
                  <p className="mt-2 max-w-3xl text-[0.9375rem] leading-relaxed text-ink-muted">{section.body}</p>
                  {section.bullets ? (
                    <ul className="mt-4 space-y-2.5">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink-muted">
                          <Bullet />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          ),
        }
      : null,
    learning.limitations?.length
      ? {
          id: "limitations",
          title: "Scope and limitations",
          description: "Current boundaries of this version, so you know them before relying on it.",
          content: (
            <ul className="space-y-3 rounded-card border border-line bg-surface-muted p-5 sm:p-6">
              {learning.limitations.map((limitation) => (
                <li key={limitation} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink">
                  <Bullet />
                  {limitation}
                </li>
              ))}
            </ul>
          ),
        }
      : null,
  ];

  return sections.filter((section): section is PageSection => section !== null);
}

export default async function LearningDetailPage({ params }: LearningDetailProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const isRunnable = tool.runtime !== undefined;
  const sections = buildSections(tool);
  const related = getRelatedTools(tool);
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Learning Center", path: "/learning" },
    { name: tool.name, path: `/learning/${tool.slug}` },
  ];

  return (
    <>
      <AgentHero
        tool={tool}
        breadcrumbs={breadcrumbs}
        title={tool.name}
        lead={tool.description}
        actions={
          isRunnable ? (
            <>
              <ButtonLink href={`/tools/${tool.slug}`} size="lg">
                Try now
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary" size="lg">
                Talk to us
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href="/contact" size="lg">
                Tell us what you need
              </ButtonLink>
              <ButtonLink href="/tools" variant="secondary" size="lg">
                Browse all agents
              </ButtonLink>
            </>
          )
        }
      />

      <Container width="wide" className="py-12 sm:py-16">
        {/* The facts card comes first in the DOM so phones read it before the long-form content. */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <aside className="min-w-0 lg:col-start-2 lg:row-start-1">
            <AgentAtAGlance
              tool={tool}
              showInputsOutputs={false}
              actions={
                isRunnable ? (
                  <ButtonLink href={`/tools/${tool.slug}`} fullWidth>
                    Try now
                  </ButtonLink>
                ) : (
                  <ButtonLink href="/contact" variant="secondary" fullWidth>
                    Tell us what you need
                  </ButtonLink>
                )
              }
            />

            <nav aria-labelledby="on-this-page" className="mt-8 hidden lg:sticky lg:top-24 lg:block">
              <h2 id="on-this-page" className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-subtle">
                On this page
              </h2>
              <ul className="mt-3 space-y-0.5 border-l border-line">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-ink-muted transition-colors hover:border-ink hover:text-ink"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="min-w-0 space-y-16 lg:col-start-1 lg:row-start-1">
            {sections.map((section) => (
              <AgentSection key={section.id} id={section.id} title={section.title} description={section.description}>
                {section.content}
              </AgentSection>
            ))}
          </div>
        </div>
      </Container>

      {related.length > 0 ? (
        <section aria-label="Related agents" className="border-t border-line bg-band">
          <Container width="wide" className="py-14 sm:py-16">
            <SectionHeading
              title="Related agents"
              description="Other agents that work in the same area or pair well with this one."
              action={
                <ButtonLink href="/tools" variant="secondary">
                  Browse all agents
                </ButtonLink>
              }
            />
            <div className="mt-8">
              <ToolGrid tools={related} />
            </div>
          </Container>
        </section>
      ) : null}

      <JsonLd
        data={[
          howToJsonLd(tool),
          breadcrumbJsonLd(breadcrumbs),
        ]}
      />
    </>
  );
}
