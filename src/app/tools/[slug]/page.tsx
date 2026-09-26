import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AgentAtAGlance } from "@/components/agent/agent-at-a-glance";
import { AgentHero } from "@/components/agent/agent-hero";
import { AgentTimeline } from "@/components/agent/agent-timeline";
import { AgentWorkspace } from "@/components/agent/agent-workspace";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, howToJsonLd, toolJsonLd } from "@/lib/seo/structured-data";
import { getToolBySlug, tools } from "@/lib/tools/registry";

interface ToolPageProps {
  readonly params: Promise<{ readonly slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return buildPageMetadata({
      title: "Tool not found",
      description: "This tool does not exist in the Code Nativex catalogue.",
      path: `/tools/${slug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: tool.name,
    description: tool.summary,
    path: `/tools/${tool.slug}`,
    keywords: tool.keywords,
  });
}

function SidebarCard({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PlainList({ items }: { readonly items: readonly string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-ink-muted">
          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-subtle" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const { learning } = tool;
  const isRunnable = tool.runtime !== undefined;
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: tool.name, path: `/tools/${tool.slug}` },
  ];

  return (
    <>
      <AgentHero
        tool={tool}
        breadcrumbs={breadcrumbs}
        title={tool.name}
        lead={tool.description}
        actions={
          <ButtonLink href={`/learning/${tool.slug}`} variant="secondary">
            {isRunnable ? "Read full details" : "Read the specification"}
          </ButtonLink>
        }
      />

      <Container width="wide" className="py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <div className="min-w-0">
            <AgentWorkspace tool={tool} />
          </div>

          <aside className="min-w-0 space-y-5">
            <AgentAtAGlance tool={tool} />

            <SidebarCard title={isRunnable ? "How it works" : "Planned steps"}>
              <AgentTimeline steps={learning.howItWorks} density="compact" />
            </SidebarCard>

            {learning.requirements?.length ? (
              <SidebarCard title="Before you start">
                <PlainList items={learning.requirements} />
              </SidebarCard>
            ) : null}

            {learning.limitations?.length ? (
              <SidebarCard title="Scope and limitations">
                <PlainList items={learning.limitations} />
              </SidebarCard>
            ) : null}
          </aside>
        </div>
      </Container>

      <JsonLd data={[toolJsonLd(tool), howToJsonLd(tool), breadcrumbJsonLd(breadcrumbs)]} />
    </>
  );
}
