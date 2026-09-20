import type { Metadata } from "next";

import { LearningCard } from "@/components/learning/learning-card";
import { JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { getCategory } from "@/lib/tools/categories";
import { getPopulatedCategoryIds, getToolsByCategory } from "@/lib/tools/registry";

export const metadata: Metadata = buildPageMetadata({
  title: "Learning Center",
  description:
    "Understand every Code Nativex tool before you run it: what problem it solves, who it is for, what to provide, what you get back, and how it works step by step.",
  path: "/learning",
  keywords: ["learn seo tools", "website audit guide", "how website audits work", "developer tool documentation"],
});

const gettingStarted = [
  {
    step: "Read the card",
    body: "Each tool below states the problem it solves, the input it needs and the output it returns. Two minutes here saves a wasted run.",
  },
  {
    step: "Run it on something you own",
    body: "Start with a page you know well. Findings are easier to judge when you can verify them against the markup yourself.",
  },
  {
    step: "Work the report top down",
    body: "Issues first, then warnings. Every finding carries the evidence the tool observed and a concrete recommendation.",
  },
] as const;

export default function LearningPage() {
  const categoryIds = getPopulatedCategoryIds();

  return (
    <>
      <section className="border-b border-line bg-surface">
        <Container width="wide" className="py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Learning Center</p>
            <h1 className="mt-4 text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Learn. Automate. Analyze. Build Better.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
              Code Nativex Tools provides practical tools and AI-powered workflows for developers, businesses,
              marketers, agencies and website owners. This is the plain-language guide to all of them — what each one
              does, when to reach for it, and exactly what happens when you press run.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/tools/website-audit" size="lg">
                Try the Website Audit Agent
              </ButtonLink>
              <ButtonLink href="/tools" variant="secondary" size="lg">
                Browse the directory
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <Container width="wide" className="py-14 sm:py-16">
        <SectionHeading
          as="h2"
          eyebrow="Getting started"
          title="How to get value on your first run"
          description="The same three habits apply to every tool on the platform."
        />
        <ol className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-10">
          {gettingStarted.map((item, index) => (
            <li key={item.step} className="border-t border-line pt-5">
              <p aria-hidden="true" className="font-mono text-sm text-ink-subtle">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-base font-semibold text-ink">{item.step}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </Container>

      {categoryIds.map((categoryId) => {
        const category = getCategory(categoryId);
        const categoryTools = getToolsByCategory(categoryId);

        return (
          <Container key={categoryId} width="wide" className="pb-14 sm:pb-16">
            <div className="border-t border-line pt-12">
              <SectionHeading as="h2" title={category.name} description={category.description} />
              <ul className="mt-8 grid gap-4 lg:grid-cols-2">
                {categoryTools.map((tool) => (
                  <li key={tool.id} className="h-full">
                    <LearningCard tool={tool} />
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        );
      })}

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Learning Center", path: "/learning" },
        ])}
      />
    </>
  );
}
