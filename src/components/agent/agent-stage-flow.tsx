import type { ToolStage } from "@/lib/tools/types";

/**
 * The stages an agent reports while a run is in progress, in order. Wraps onto
 * as many lines as the width allows instead of scrolling sideways.
 */
export function AgentStageFlow({ stages }: { readonly stages: readonly ToolStage[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {stages.map((stage, index) => (
        <li key={stage.id} className="flex items-center gap-2">
          <span className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface pl-1.5 pr-3.5 text-sm text-ink">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-raised font-mono text-[0.6875rem] font-medium text-ink-muted">
              {index + 1}
            </span>
            {stage.label}
          </span>
          {index < stages.length - 1 ? (
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-ink-subtle" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/** Only multi-stage runtimes have a progress sequence worth showing. */
export function hasStageFlow(stages: readonly ToolStage[] | undefined): stages is readonly ToolStage[] {
  return (stages?.length ?? 0) > 1;
}
