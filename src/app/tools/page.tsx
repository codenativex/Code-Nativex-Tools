import type { Metadata } from "next";
import { Suspense } from "react";

import { JsonLd } from "@/components/seo/json-ld";
import { ToolDirectory } from "@/components/tools/tool-directory";
import { ToolGrid } from "@/components/tools/tool-grid";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { getRecentTools, tools } from "@/lib/tools/registry";

export const metadata: Metadata = buildPageMetadata({
  title: "Tools Directory",
  description:
    "Browse every Code Nativex tool: website auditing, SEO, AI agents, developer utilities and automation. Search by name or filter by category.",
  path: "/tools",
  keywords: ["seo tools", "website audit tool", "developer tools", "ai agents", "web automation"],
});

function DirectoryFallback() {
  return (
    <div className="mt-4" aria-hidden="true">
      <div className="h-12 rounded-lg border border-line bg-surface-muted" />
      <ToolGrid tools={tools.slice(0, 6)} />
    </div>
  );
}

export default function ToolsPage() {
  const recent = getRecentTools(3);

  return (
    <>
      <section className="border-b border-line bg-surface">
        <Container width="wide" className="py-14 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Directory</p>
            <h1 className="mt-4 text-[1.875rem] font-semibold leading-tight sm:text-4xl">
              Every Code Nativex tool, in one place
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Tools marked <span className="font-medium text-ink">Live</span> run today. Everything else is documented
              and in development, so you can see where the platform is heading.
            </p>
          </div>
        </Container>
      </section>

      <Container width="wide" className="py-12 sm:py-16">
        <SectionHeading as="h2" title="Recently added" description="The newest entries in the catalogue." />
        <div className="mt-6">
          <ToolGrid tools={recent} />
        </div>
      </Container>

      <Container width="wide" className="pb-20">
        <div className="border-t border-line pt-12">
          <SectionHeading as="h2" title="Browse all tools" description="Search by name, keyword or task, or filter by category." />
          <div className="mt-6">
            <Suspense fallback={<DirectoryFallback />}>
              <ToolDirectory />
            </Suspense>
          </div>
        </div>
      </Container>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools" },
        ])}
      />
    </>
  );
}
