"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";

import { ToolIcon } from "@/components/tools/tool-icon";
import { ToolStatusBadge } from "@/components/tools/tool-status-badge";
import { ButtonLink } from "@/components/ui/button";
import type { ToolIconName, ToolStatus } from "@/lib/tools/types";
import { cn } from "@/lib/utils/cn";

/** Serializable view of a registry entry, prepared on the server. */
export interface ConsoleAgent {
  readonly slug: string;
  readonly name: string;
  readonly categoryName: string;
  readonly status: ToolStatus;
  readonly icon: ToolIconName;
  readonly summary: string;
  /** Runtime stages for runnable agents; the published plan for the rest. */
  readonly steps: readonly string[];
  readonly isRunnable: boolean;
}

interface AgentConsoleProps {
  readonly agents: readonly ConsoleAgent[];
  /** Catalogue entries not shown in the rail. */
  readonly moreCount: number;
}

/**
 * The hero's product illustration: a console listing the platform's agents.
 * Selecting one shows the pipeline it is configured to run. It never shows a
 * run in progress or a result, because none is happening.
 */
export function AgentConsole({ agents, moreCount }: AgentConsoleProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const selected = agents[selectedIndex];

  if (!selected) return null;

  const liveCount = agents.filter((agent) => agent.isRunnable).length;

  // Arrow keys move between agents, per the WAI-ARIA tabs pattern.
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next: number | null = null;
    if (event.key in keys) next = (selectedIndex + (keys[event.key] ?? 0) + agents.length) % agents.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = agents.length - 1;
    if (next === null) return;
    event.preventDefault();
    setSelectedIndex(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <figure className="relative overflow-hidden rounded-card border border-line bg-surface shadow-[0_1px_2px_rgb(17_24_39/0.04),0_24px_48px_-24px_rgb(17_24_39/0.18)]">
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        </span>
        <span className="text-xs font-medium text-ink-muted">Agent console</span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-ink-subtle">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-positive" />
          {liveCount} live
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[13.5rem_minmax(0,1fr)]">
        {/* Agent list: a horizontal strip on phones, a rail from `sm` up. */}
        <div className="min-w-0 border-b border-line sm:border-b-0 sm:border-r">
          <div
            role="tablist"
            aria-label="Agents"
            className="flex gap-1 overflow-x-auto p-2 sm:flex-col sm:overflow-visible"
          >
            {agents.map((agent, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={agent.slug}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  id={`${baseId}-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setSelectedIndex(index)}
                  onKeyDown={onKeyDown}
                  className={cn(
                    "flex min-h-10 shrink-0 items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-[0.8125rem] transition-colors",
                    isSelected ? "bg-surface-raised text-ink" : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                  )}
                >
                  <span className={cn("shrink-0", agent.isRunnable ? "text-accent" : "text-ink-subtle")}>
                    <ToolIcon name={agent.icon} className="h-4 w-4" />
                  </span>
                  <span className="whitespace-nowrap sm:min-w-0 sm:flex-1 sm:whitespace-normal sm:leading-snug">{agent.name}</span>
                  {agent.isRunnable ? (
                    <span aria-hidden="true" className="hidden h-1.5 w-1.5 shrink-0 rounded-full bg-positive sm:block" />
                  ) : null}
                </button>
              );
            })}
            {moreCount > 0 ? (
              <Link
                href="/tools"
                className="flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-control px-2.5 py-2 text-[0.8125rem] text-ink-subtle transition-colors hover:text-accent"
              >
                +{moreCount} more agents
              </Link>
            ) : null}
          </div>
        </div>

        {/* Selected agent */}
        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${selectedIndex}`}
          className="flex min-h-[23rem] flex-col p-4 sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-control border",
                  selected.isRunnable
                    ? "border-accent bg-accent text-on-accent"
                    : "border-line bg-surface-muted text-ink-subtle",
                )}
              >
                <ToolIcon name={selected.icon} className="h-[1.125rem] w-[1.125rem]" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{selected.name}</p>
                <p className="truncate text-xs text-ink-subtle">{selected.categoryName}</p>
              </div>
            </div>
            <ToolStatusBadge status={selected.status} />
          </div>

          <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-muted">{selected.summary}</p>

          <p className="mt-5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
            {selected.isRunnable ? "Pipeline" : "Planned pipeline"}
          </p>
          <ol className="mt-2.5 flex-1">
            {selected.steps.map((step, index) => {
              const isLast = index === selected.steps.length - 1;
              return (
                <li key={step} className="relative flex gap-3 pb-3 last:pb-0">
                  {/* Connector to the next step */}
                  {isLast ? null : (
                    <span aria-hidden="true" className="absolute left-[0.6875rem] top-6 h-[calc(100%-1.25rem)] w-px bg-line-strong" />
                  )}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[0.625rem]",
                      selected.isRunnable
                        ? "border-line-strong bg-surface text-ink"
                        : "border-dashed border-line-strong text-ink-subtle",
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-[0.8125rem] leading-snug text-ink">{step}</span>
                </li>
              );
            })}
          </ol>

          <div className="mt-4 flex gap-2 border-t border-line pt-4">
            {selected.isRunnable ? (
              <ButtonLink href={`/tools/${selected.slug}`} size="sm" className="flex-1">
                Try now
              </ButtonLink>
            ) : null}
            <ButtonLink href={`/learning/${selected.slug}`} variant="secondary" size="sm" className="flex-1">
              Read more
            </ButtonLink>
          </div>
        </div>
      </div>

      <figcaption className="border-t border-line px-4 py-2.5 text-[0.6875rem] text-ink-subtle">
        Each agent&rsquo;s configured pipeline, read from the platform registry — not a live run.
      </figcaption>
    </figure>
  );
}
