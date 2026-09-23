import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import type { LegalDocument } from "@/lib/legal/types";

interface LegalDocumentViewProps {
  readonly document: LegalDocument;
  readonly path: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { dateStyle: "long" });
}

/** Renders a structured legal document with a jump-to-section index. */
export function LegalDocumentView({ document, path }: LegalDocumentViewProps) {
  return (
    <>
      <section className="border-b border-line bg-page-header">
        <Container width="narrow" className="py-8 sm:py-12">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: document.title, path },
            ]}
          />
          <h1 className="mt-6 text-[1.875rem] font-semibold leading-tight sm:text-4xl">{document.title}</h1>
          <p className="mt-3 text-sm text-ink-subtle">Last updated {formatDate(document.updatedAt)}</p>
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-muted">{document.intro}</p>
        </Container>
      </section>

      <Container width="narrow" className="py-12 sm:py-16">
        <nav aria-labelledby="doc-contents" className="rounded-card border border-line bg-surface p-5">
          <h2 id="doc-contents" className="text-sm font-semibold text-ink">
            On this page
          </h2>
          <ol className="mt-3 space-y-0.5">
            {document.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="inline-block py-1 text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          {document.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-lg font-semibold text-ink sm:text-xl">{section.heading}</h2>
              <div className="mt-3 space-y-3">
                {section.blocks.map((block, index) =>
                  block.type === "list" ? (
                    <ul key={index} className="space-y-2.5">
                      {block.items?.map((item) => (
                        <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink-muted">
                          <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-line-strong" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p key={index} className="text-[0.9375rem] leading-relaxed text-ink-muted">
                      {block.text}
                    </p>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
