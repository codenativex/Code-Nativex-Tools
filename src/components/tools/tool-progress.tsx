"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils/cn";
import type { ToolStage } from "@/lib/tools/types";

/** Indicative pacing: the final stage stays active until the response lands. */
const STAGE_INTERVAL_MS = 900;

interface ToolProgressProps {
  readonly stages: readonly ToolStage[];
}

export function ToolProgress({ stages }: ToolProgressProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    const interval = setInterval(() => {
      setActiveIndex((current) => Math.min(current + 1, stages.length - 1));
    }, STAGE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [stages.length]);

  return (
    <section
      aria-label="Progress"
      aria-busy="true"
      className="rounded-card border border-line bg-surface p-5 sm:p-6"
    >
      <h2 className="text-sm font-semibold text-ink">Running the pipeline</h2>
      <ol className="mt-4 space-y-3">
        {stages.map((stage, index) => {
          const isDone = index < activeIndex;
          const isActive = index === activeIndex;

          return (
            <li key={stage.id} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[0.625rem] font-semibold",
                  isDone && "border-positive bg-positive text-white",
                  isActive && "border-accent text-accent",
                  !isDone && !isActive && "border-line text-ink-subtle",
                )}
              >
                {isDone ? "✓" : index + 1}
              </span>
              <span
                className={cn(
                  "text-sm",
                  isActive ? "font-medium text-ink" : isDone ? "text-ink-muted" : "text-ink-subtle",
                )}
              >
                {stage.label}
              </span>
              {isActive ? (
                <span aria-hidden="true" className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-ink-subtle">
        These stages describe the work the server performs in a single request. The step timings shown here are
        indicative, not measured.
      </p>
    </section>
  );
}
