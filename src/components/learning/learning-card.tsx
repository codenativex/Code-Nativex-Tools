import { ToolStatusBadge } from "@/components/tools/tool-status-badge";
import { ButtonLink } from "@/components/ui/button";
import { getCategory } from "@/lib/tools/categories";
import type { ToolDefinition } from "@/lib/tools/types";

interface LearningCardProps {
  readonly tool: ToolDefinition;
}

/**
 * The learning-center entry for one tool: what it solves, who it is for, what
 * goes in, what comes out, and how it gets there.
 */
export function LearningCard({ tool }: LearningCardProps) {
  const category = getCategory(tool.category);

  return (
    <article className="flex h-full flex-col rounded-card border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-subtle">{category.name}</p>
        <ToolStatusBadge status={tool.status} />
      </div>

      <h3 className="mt-3 text-lg font-semibold text-ink">{tool.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{tool.summary}</p>

      <dl className="mt-5 space-y-4 border-t border-line pt-5 text-sm">
        <div>
          <dt className="font-medium text-ink">The problem it solves</dt>
          <dd className="mt-1 leading-relaxed text-ink-muted">{tool.learning.problem}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Who should use it</dt>
          <dd className="mt-1.5">
            <ul className="flex flex-wrap gap-1.5">
              {tool.learning.audience.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-line bg-surface-muted px-2.5 py-0.5 text-xs text-ink-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-ink">What you provide</dt>
            <dd className="mt-1 leading-relaxed text-ink-muted">{tool.learning.input}</dd>
          </div>
          <div>
            <dt className="font-medium text-ink">What you get back</dt>
            <dd className="mt-1 leading-relaxed text-ink-muted">{tool.learning.output}</dd>
          </div>
        </div>
      </dl>

      <details className="group mt-4 border-t border-line pt-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-ink">
          How it works, step by step
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 shrink-0 text-ink-subtle transition-transform group-open:rotate-180"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>
        <ol className="mt-3 space-y-2">
          {tool.learning.howItWorks.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
              <span aria-hidden="true" className="font-mono text-xs text-ink-subtle">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 rounded-lg bg-surface-muted px-3.5 py-3 text-sm leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Example: </span>
          {tool.learning.exampleUseCase}
        </p>
      </details>

      <div className="mt-6 flex flex-col gap-2 pt-1 sm:flex-row">
        {tool.runtime ? (
          <ButtonLink href={`/tools/${tool.slug}`} size="sm" className="sm:flex-1">
            Try now
          </ButtonLink>
        ) : null}
        <ButtonLink
          href={`/learning/${tool.slug}`}
          variant={tool.runtime ? "secondary" : "primary"}
          size="sm"
          className="sm:flex-1"
        >
          Read more
        </ButtonLink>
      </div>
    </article>
  );
}
