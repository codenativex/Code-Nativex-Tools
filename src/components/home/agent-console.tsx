"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";

import { PipelineSteps } from "@/components/home/pipeline-steps";
import { useConsoleAutoplay } from "@/components/home/use-console-autoplay";
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

const ARROW_KEYS: Readonly<Record<string, number>> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

interface IndicatorBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Compact progress readout beside the pipeline heading. Decorative: the list itself carries the content. */
function StageStatus({ current, total }: { readonly current: number; readonly total: number }) {
  const isComplete = current >= total;
  return (
    <span aria-hidden="true" className="inline-flex items-center gap-1.5 text-[0.6875rem] tabular-nums text-ink-subtle">
      {isComplete ? (
        <svg viewBox="0 0 20 20" className="h-3 w-3 text-positive" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m4.5 10.5 3.5 3.5 7.5-8" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" className="h-3 w-3 animate-spin text-ink" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
          <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      {isComplete ? `${total} of ${total} stages` : `Stage ${current + 1} of ${total}`}
    </span>
  );
}

/**
 * The hero's product illustration: a console listing the platform's agents.
 * It plays an animated preview of each live agent's configured pipeline and
 * rotates between agents. It never shows a result, because no run is happening.
 */
export function AgentConsole({ agents, moreCount }: AgentConsoleProps) {
  const baseId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const pipelineRef = useRef<HTMLOListElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState<IndicatorBox | null>(null);

  const { selectedIndex, activeStep, isAnimated, isPaused, lastSource, select, togglePaused, setIsHeld } =
    useConsoleAutoplay({ agents, rootRef, progressRef, pipelineRef });

  // A single highlight that glides to the selected tab. Re-measured on resize,
  // since tab sizes change between the phone strip and the desktop rail.
  useEffect(() => {
    const strip = stripRef.current;
    const tab = tabRefs.current[selectedIndex];
    if (!strip || !tab) return;
    const measure = () =>
      setIndicator({ x: tab.offsetLeft, y: tab.offsetTop, width: tab.offsetWidth, height: tab.offsetHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [selectedIndex]);

  // On phones the agent list is a horizontal strip: keep an auto-selected tab in view
  // by scrolling the strip only, never the page.
  useEffect(() => {
    const strip = stripRef.current;
    const tab = tabRefs.current[selectedIndex];
    if (lastSource.current !== "auto" || !strip || !tab || strip.scrollWidth <= strip.clientWidth) return;
    strip.scrollTo({ left: tab.offsetLeft - 8, behavior: "smooth" });
  }, [lastSource, selectedIndex]);

  const selected = agents[selectedIndex];
  if (!selected) return null;

  const liveCount = agents.filter((agent) => agent.isRunnable).length;

  // Arrow keys move between agents, per the WAI-ARIA tabs pattern.
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let next: number | null = null;
    const step = ARROW_KEYS[event.key];
    if (step !== undefined) next = (selectedIndex + step + agents.length) % agents.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = agents.length - 1;
    if (next === null) return;
    event.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  // Hold the rotation while keyboard focus is anywhere inside the console.
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsHeld(false);
  };

  return (
    <figure
      ref={rootRef}
      onMouseEnter={() => setIsHeld(true)}
      onMouseLeave={() => setIsHeld(false)}
      onFocus={() => setIsHeld(true)}
      onBlur={onBlur}
      className="relative animate-rise-in overflow-hidden rounded-card border border-line bg-surface shadow-[0_1px_2px_rgb(17_24_39/0.04),0_24px_48px_-24px_rgb(17_24_39/0.18)]"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-2">
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
        {isAnimated ? (
          <button
            type="button"
            onClick={togglePaused}
            aria-label={isPaused ? "Play preview animation" : "Pause preview animation"}
            className="-mr-1.5 grid h-7 w-7 place-items-center rounded-md text-ink-subtle transition-colors hover:bg-surface-raised hover:text-ink"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
              {isPaused ? <path d="M6 4.5v11l9-5.5-9-5.5Z" /> : <path d="M5.5 4h3v12h-3zM11.5 4h3v12h-3z" />}
            </svg>
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[13.5rem_minmax(0,1fr)]">
        {/* Agent list: a horizontal strip on phones, a rail from `sm` up. */}
        <div className="min-w-0 border-b border-line sm:border-b-0 sm:border-r">
          <div
            ref={stripRef}
            role="tablist"
            aria-label="Agents"
            className="relative flex gap-1 overflow-x-auto p-2 sm:flex-col sm:overflow-visible"
          >
            {indicator ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 rounded-control bg-surface-raised transition-[transform,width,height] duration-300 ease-out-soft"
                style={{
                  transform: `translate(${indicator.x}px, ${indicator.y}px)`,
                  width: indicator.width,
                  height: indicator.height,
                }}
              />
            ) : null}
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
                  onClick={() => select(index)}
                  onKeyDown={onKeyDown}
                  className={cn(
                    "relative flex min-h-10 shrink-0 items-center gap-2.5 overflow-hidden rounded-control px-2.5 py-2 text-left text-[0.8125rem] transition-colors duration-300",
                    isSelected
                      ? cn("text-ink", !indicator && "bg-surface-raised")
                      : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                  )}
                >
                  <span className={cn("shrink-0", agent.isRunnable ? "text-ink" : "text-ink-subtle")}>
                    <ToolIcon name={agent.icon} className="h-4 w-4" />
                  </span>
                  <span className="whitespace-nowrap sm:min-w-0 sm:flex-1 sm:whitespace-normal sm:leading-snug">
                    {agent.name}
                  </span>
                  {agent.isRunnable ? (
                    <span aria-hidden="true" className="hidden h-1.5 w-1.5 shrink-0 rounded-full bg-positive sm:block" />
                  ) : null}
                  {/* Time until the preview moves on; driven by the autoplay hook through a ref. */}
                  {isSelected && isAnimated ? (
                    <span aria-hidden="true" className="absolute inset-x-2 bottom-0 h-0.5 overflow-hidden rounded-full bg-line">
                      <span
                        ref={progressRef}
                        className="block h-full origin-left bg-accent"
                        // Starting value only: the loop writes transform directly and React never re-sets it.
                        style={{ transform: "scaleX(0)" }}
                      />
                    </span>
                  ) : null}
                </button>
              );
            })}
            {moreCount > 0 ? (
              <Link
                href="/tools"
                className="flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-control px-2.5 py-2 text-[0.8125rem] text-ink-subtle transition-colors hover:text-ink"
              >
                +{moreCount} more agents
              </Link>
            ) : null}
          </div>
        </div>

        {/* Selected agent. Keyed so each agent fades in rather than swapping abruptly. */}
        <div
          key={selected.slug}
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${selectedIndex}`}
          className="flex min-h-[23rem] animate-panel-in flex-col p-4 sm:p-5"
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

          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
              {selected.isRunnable ? "Pipeline" : "Planned pipeline"}
            </p>
            {selected.isRunnable && isAnimated ? (
              <StageStatus current={activeStep} total={selected.steps.length} />
            ) : null}
          </div>
          <PipelineSteps
            listRef={pipelineRef}
            steps={selected.steps}
            isRunnable={selected.isRunnable}
            isAnimated={isAnimated}
            activeStep={activeStep}
          />

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
        Animated preview of each agent&rsquo;s configured pipeline — not a live run.
      </figcaption>
    </figure>
  );
}
