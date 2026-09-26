import Link from "next/link";
import type { ReactNode } from "react";

import { hasStageFlow } from "@/components/agent/agent-stage-flow";
import { ToolStatusBadge } from "@/components/tools/tool-status-badge";
import { getCategory } from "@/lib/tools/categories";
import type { ToolDefinition } from "@/lib/tools/types";

interface AgentAtAGlanceProps {
  readonly tool: ToolDefinition;
  /** Optional call to action rendered at the foot of the card. */
  readonly actions?: ReactNode;
  /**
   * Include what the agent takes and returns. The details page turns this off
   * because it gives inputs and outputs a section of their own.
   */
  readonly showInputsOutputs?: boolean;
}

function Fact({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <div className="py-3.5">
      <dt className="text-xs font-medium uppercase tracking-[0.06em] text-ink-subtle">{label}</dt>
      <dd className="mt-1.5 text-sm leading-relaxed text-ink">{children}</dd>
    </div>
  );
}

/** The agent's key facts, presented identically on its details and run pages. */
export function AgentAtAGlance({ tool, actions, showInputsOutputs = true }: AgentAtAGlanceProps) {
  const category = getCategory(tool.category);
  const stages = tool.runtime?.stages;

  return (
    <section aria-labelledby={`${tool.slug}-glance`} className="rounded-card border border-line bg-surface">
      <h2 id={`${tool.slug}-glance`} className="px-5 pt-5 text-sm font-semibold text-ink">
        At a glance
      </h2>

      <dl className="divide-y divide-line px-5">
        <div className="grid grid-cols-2 gap-4 py-3.5">
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.06em] text-ink-subtle">Status</dt>
            <dd className="mt-1.5">
              <ToolStatusBadge status={tool.status} />
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-[0.06em] text-ink-subtle">Category</dt>
            <dd className="mt-1.5 text-sm">
              <Link
                href={`/tools?category=${category.id}`}
                className="inline-block py-0.5 font-medium text-ink underline-offset-4 hover:underline"
              >
                {category.name}
              </Link>
            </dd>
          </div>
        </div>
        <Fact label="Best for">
          <ul className="space-y-1.5">
            {tool.learning.audience.map((audience) => (
              <li key={audience} className="flex gap-2.5">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-subtle" />
                {audience}
              </li>
            ))}
          </ul>
        </Fact>
        {showInputsOutputs ? (
          <>
            <Fact label="You provide">{tool.learning.input}</Fact>
            <Fact label="You get back">{tool.learning.output}</Fact>
          </>
        ) : null}
        {hasStageFlow(stages) ? <Fact label="Live progress">{stages.length} stages reported while it runs</Fact> : null}
      </dl>

      {actions ? <div className="flex flex-col gap-2 border-t border-line p-5">{actions}</div> : null}
    </section>
  );
}
