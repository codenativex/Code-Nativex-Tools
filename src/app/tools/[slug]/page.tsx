import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { ToolRunner } from "@/components/tools/tool-runner";
import { WebsiteAuditRunner } from "@/components/audit-agent/website-audit-runner";
import { LeadGenerationRunner } from "@/components/lead-agent/lead-generation-runner";
import { GmailReplyAgentRunner } from "@/components/gmail-agent/gmail-reply-agent-runner";
import { SocialMediaPostAgentRunner } from "@/components/social-agent/social-media-post-agent-runner";
import { ToolStatusBadge } from "@/components/tools/tool-status-badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, howToJsonLd, toolJsonLd } from "@/lib/seo/structured-data";
import { getCategory } from "@/lib/tools/categories";
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

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const category = getCategory(tool.category);

  return (
    <>
      <section className="border-b border-line bg-page-header">
        <Container width="wide" className="py-8 sm:py-12">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Tools", path: "/tools" },
              { name: tool.name, path: `/tools/${tool.slug}` },
            ]}
          />

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/tools?category=${category.id}`}
                  className="rounded-full border border-line bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
                >
                  {category.name}
                </Link>
                <ToolStatusBadge status={tool.status} />
              </div>
              <h1 className="mt-4 text-[1.75rem] font-semibold leading-tight sm:text-4xl">{tool.name}</h1>
              <p className="mt-4 text-base leading-relaxed text-ink-muted">{tool.description}</p>
            </div>

            <ButtonLink href={`/learning/${tool.slug}`} variant="secondary" className="shrink-0">
              How this tool works
            </ButtonLink>
          </div>
        </Container>
      </section>

      <Container width="wide" className="py-10 sm:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <div className="min-w-0">
            {tool.slug === "website-audit" ? (
              <WebsiteAuditRunner />
            ) : tool.slug === "lead-generation" ? (
              <LeadGenerationRunner />
            ) : tool.slug === "gmail-reply-agent" ? (
              <GmailReplyAgentRunner />
            ) : tool.slug === "social-media-post-agent" ? (
              <SocialMediaPostAgentRunner />
            ) : tool.runtime ? (
              <ToolRunner tool={tool} submitLabel="Generate" />
            ) : (
              <div className="rounded-card border border-line bg-surface p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-ink">This tool is still in development</h2>
                <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-ink-muted">
                  The specification is published so you can see exactly what it will do before it ships. We do not
                  publish interfaces that return placeholder results — when the engine is live, this page becomes
                  runnable and nothing else changes.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href={`/learning/${tool.slug}`}>Read the full overview</ButtonLink>
                  <ButtonLink href="/tools" variant="secondary">
                    See what is live today
                  </ButtonLink>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-card border border-line bg-surface p-5">
              <h2 className="text-sm font-semibold text-ink">What you provide</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{tool.learning.input}</p>
              <h2 className="mt-5 text-sm font-semibold text-ink">What you get back</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{tool.learning.output}</p>
            </section>

            <section className="rounded-card border border-line bg-surface p-5">
              <h2 className="text-sm font-semibold text-ink">How it works</h2>
              <ol className="mt-3 space-y-2.5">
                {tool.learning.howItWorks.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
                    <span aria-hidden="true" className="font-mono text-xs text-ink-subtle">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-card border border-line bg-surface p-5">
              <h2 className="text-sm font-semibold text-ink">Who it is for</h2>
              <ul className="mt-3 space-y-2">
                {tool.learning.audience.map((item) => (
                  <li key={item} className="text-sm leading-relaxed text-ink-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </Container>

      <JsonLd
        data={[
          toolJsonLd(tool),
          howToJsonLd(tool),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Tools", path: "/tools" },
            { name: tool.name, path: `/tools/${tool.slug}` },
          ]),
        ]}
      />
    </>
  );
}
