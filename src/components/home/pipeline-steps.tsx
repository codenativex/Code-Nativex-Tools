import type { CSSProperties, Ref } from "react";

import { cn } from "@/lib/utils/cn";

type StepState = "static" | "done" | "active" | "pending";

interface PipelineStepsProps {
  readonly steps: readonly string[];
  readonly isRunnable: boolean;
  /** When false, steps render without progress: reduced motion, pre-hydration, or planned agents. */
  readonly isAnimated: boolean;
  /** Index of the stage in progress; equal to `steps.length` once every stage is done. */
  readonly activeStep: number;
  /** Receives `--p0…--pN`, each connector's fill from 0 to 1, from the autoplay loop. */
  readonly listRef?: Ref<HTMLOListElement>;
}

function stepState(index: number, activeStep: number, animate: boolean): StepState {
  if (!animate) return "static";
  if (index < activeStep) return "done";
  if (index === activeStep) return "active";
  return "pending";
}

const nodeClasses: Record<StepState, string> = {
  static: "border-line-strong bg-surface text-ink",
  done: "animate-pop border-accent bg-accent text-on-accent",
  active: "border-line bg-surface text-ink",
  pending: "border-line bg-surface text-ink-subtle",
};

const labelClasses: Record<StepState, string> = {
  static: "text-ink",
  done: "text-ink",
  active: "font-medium text-ink",
  pending: "text-ink-muted",
};

/** Dash length matching the check path, so the draw animation starts fully hidden. */
const CHECK_PATH_LENGTH = 18;
const checkDrawStyle = { strokeDasharray: CHECK_PATH_LENGTH, "--path-length": CHECK_PATH_LENGTH } as CSSProperties;

export function PipelineSteps({ steps, isRunnable, isAnimated, activeStep, listRef }: PipelineStepsProps) {
  // Only runnable agents animate: a planned agent's pipeline is a published plan, not something that runs.
  const animate = isAnimated && isRunnable;

  return (
    <ol ref={listRef} className="mt-2.5 flex-1">
      {steps.map((step, index) => {
        const state = stepState(index, activeStep, animate);
        const isLast = index === steps.length - 1;

        return (
          <li key={step} className="relative flex gap-3 pb-3 last:pb-0">
            {isLast ? null : (
              <span aria-hidden="true" className="absolute left-[0.6875rem] top-6 h-[calc(100%-1.25rem)] w-px bg-line">
                {animate ? (
                  // Filled continuously by the loop while this stage runs, so the line flows into the next one.
                  <span
                    className="absolute inset-0 origin-top bg-accent"
                    style={{ transform: `scaleY(var(--p${index}, 0))` }}
                  />
                ) : null}
              </span>
            )}

            <span
              aria-hidden="true"
              className={cn(
                "relative grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[0.625rem] transition-colors duration-300",
                isRunnable ? nodeClasses[state] : "border-dashed border-line-strong text-ink-subtle",
              )}
            >
              {state === "active" ? (
                <svg viewBox="0 0 30 30" fill="none" className="absolute -inset-[4px] animate-spin text-accent [animation-duration:1.1s]">
                  <circle cx="15" cy="15" r="13.5" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1.75" />
                  <path d="M15 1.5A13.5 13.5 0 0 1 28.5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              ) : null}
              {state === "done" ? (
                <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m4.5 10.5 3.5 3.5 7.5-8" className="animate-draw" style={checkDrawStyle} />
                </svg>
              ) : (
                <span className="relative">{index + 1}</span>
              )}
            </span>

            <span
              className={cn(
                "pt-0.5 text-[0.8125rem] leading-snug transition-colors duration-300",
                isRunnable ? labelClasses[state] : "text-ink",
              )}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
