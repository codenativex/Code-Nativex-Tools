import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { ToolStatusBadge } from "@/components/tools/tool-status-badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, howToJsonLd } from "@/lib/seo/structured-data";
import { getCategory } from "@/lib/tools/categories";
import { getToolBySlug, tools } from "@/lib/tools/registry";

interface LearningDetailProps {
  readonly params: Promise<{ readonly slug: string }>;
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

export default async function LearningDetailPage({ params }: LearningDetailProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const category = getCategory(tool.category);

  return (
    <>
      <section className="border-b border-line bg-surface">
        <Container width="narrow" className="py-8 sm:py-12">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Learning Center", path: "/learning" },
              { name: tool.name, path: `/learning/${tool.slug}` },
            ]}
          />
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-line bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-ink-muted">
              {category.name}
            </span>
            <ToolStatusBadge status={tool.status} />
          </div>
          <h1 className="mt-4 text-[1.75rem] font-semibold leading-tight sm:text-4xl">
            {tool.name}: how it works
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">{tool.description}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={`/tools/${tool.slug}`}>{tool.runtime ? "Try the tool" : "View the tool page"}</ButtonLink>
            <ButtonLink href="/learning" variant="secondary">
              Back to the Learning Center
            </ButtonLink>
          </div>
        </Container>
      </section>

      <Container width="narrow" className="py-12 sm:py-16">
        <div className="space-y-12">
          <section aria-labelledby="problem">
            <h2 id="problem" className="text-xl font-semibold text-ink sm:text-2xl">
              The problem it solves
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted">{tool.learning.problem}</p>
          </section>

          <section aria-labelledby="audience">
            <h2 id="audience" className="text-xl font-semibold text-ink sm:text-2xl">
              Who it is for
            </h2>
            <ul className="mt-4 space-y-2.5">
              {tool.learning.audience.map((item) => (
                <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink-muted">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-line-strong" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="io" className="grid gap-6 rounded-card border border-line bg-surface p-6 sm:grid-cols-2">
            <h2 id="io" className="sr-only">
              Input and output
            </h2>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.06em] text-ink-subtle">Input required</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink">{tool.learning.input}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.06em] text-ink-subtle">Output you receive</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink">{tool.learning.output}</p>
            </div>
          </section>

          <section aria-labelledby="steps">
            <h2 id="steps" className="text-xl font-semibold text-ink sm:text-2xl">
              Step by step
            </h2>
            <ol className="mt-5 space-y-4">
              {tool.learning.howItWorks.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line font-mono text-xs text-ink-muted"
                  >
                    {index + 1}
                  </span>
                  <p className="pt-1 text-[0.9375rem] leading-relaxed text-ink-muted">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="example">
            <h2 id="example" className="text-xl font-semibold text-ink sm:text-2xl">
              Example use case
            </h2>
            <p className="mt-3 border-l-2 border-accent pl-4 text-[0.9375rem] leading-relaxed text-ink-muted">
              {tool.learning.exampleUseCase}
            </p>
          </section>

          {tool.learning.sections?.map((section) => (
            <section key={section.heading} aria-labelledby={section.heading.replace(/\s+/g, "-").toLowerCase()}>
              <h2
                id={section.heading.replace(/\s+/g, "-").toLowerCase()}
                className="text-xl font-semibold text-ink sm:text-2xl"
              >
                {section.heading}
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted">{section.body}</p>
              {section.bullets ? (
                <ul className="mt-4 space-y-2.5">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink-muted">
                      <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-line-strong" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <section className="rounded-card border border-line bg-surface p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-ink">
              {tool.runtime ? `Ready to run the ${tool.name}?` : `${tool.name} is not live yet`}
            </h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
              {tool.runtime
                ? "It takes one input and a few seconds. Nothing is stored."
                : "The tool page documents the planned behaviour. We publish the specification before the engine, never placeholder results."}
            </p>
            <ButtonLink href={`/tools/${tool.slug}`} className="mt-6">
              {tool.runtime ? "Open the tool" : "View the tool page"}
            </ButtonLink>
          </section>
        </div>
      </Container>

      <JsonLd
        data={[
          howToJsonLd(tool),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Learning Center", path: "/learning" },
            { name: tool.name, path: `/learning/${tool.slug}` },
          ]),
        ]}
      />
    </>
  );
}
