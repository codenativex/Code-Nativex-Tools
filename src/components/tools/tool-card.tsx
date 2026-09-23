import { ToolIcon, toolIconName } from "@/components/tools/tool-icon";
import { ToolStatusBadge } from "@/components/tools/tool-status-badge";
import { ButtonLink } from "@/components/ui/button";
import { getCategory } from "@/lib/tools/categories";
import type { ToolDefinition } from "@/lib/tools/types";
import { cn } from "@/lib/utils/cn";

interface ToolCardProps {
  readonly tool: ToolDefinition;
}

/**
 * Directory card with two real destinations:
 *   Try now   → /tools/<slug>, where the tool actually runs
 *   Read more → /learning/<slug>, the full write-up
 *
 * Tools without a runtime show only "Read more" — we never offer to run
 * something that cannot run.
 */
export function ToolCard({ tool }: ToolCardProps) {
  const category = getCategory(tool.category);
  const isRunnable = tool.runtime !== undefined;

  return (
    <article className="flex h-full flex-col rounded-card border border-line bg-surface p-5 transition-colors duration-150 hover:border-line-strong sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-control border",
            isRunnable ? "border-accent bg-accent text-on-accent" : "border-line bg-surface-muted text-ink-subtle",
          )}
        >
          <ToolIcon name={toolIconName(tool)} />
        </span>
        <ToolStatusBadge status={tool.status} />
      </div>

      <h3 className="mt-4 text-base font-semibold text-ink sm:text-[1.0625rem]">{tool.name}</h3>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-ink-subtle">{category.name}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">{tool.summary}</p>

      <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row">
        {isRunnable ? (
          <>
            <ButtonLink href={`/tools/${tool.slug}`} size="sm" className="sm:flex-1">
              Try now
            </ButtonLink>
            <ButtonLink href={`/learning/${tool.slug}`} variant="secondary" size="sm" className="sm:flex-1">
              Read more
            </ButtonLink>
          </>
        ) : (
          <ButtonLink href={`/learning/${tool.slug}`} variant="secondary" size="sm" fullWidth>
            Read more
          </ButtonLink>
        )}
      </div>
    </article>
  );
}
