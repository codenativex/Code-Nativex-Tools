import { cn } from "@/lib/utils/cn";

type StepState = "static" | "done" | "active" | "pending";

interface PipelineStepsProps {
  readonly steps: readonly string[];
  readonly isRunnable: boolean;
  /** When false, steps render without progress: reduced motion, pre-hydration, or planned agents. */
  readonly isAnimated: boolean;
  /** Index of the step in progress; equal to `steps.length` once every step is done. */
  readonly activeStep: number;
}

function stepState(index: number, activeStep: number, animate: boolean): StepState {
  if (!animate) return "static";
  if (index < activeStep) return "done";
  if (index === activeStep) return "active";
  return "pending";
}

const nodeClasses: Record<StepState, string> = {
  static: "border-line-strong bg-surface text-ink",
  done: "border-accent bg-accent text-on-accent",
  active: "border-accent bg-surface text-ink",
  pending: "border-line bg-surface text-ink-subtle",
};

const labelClasses: Record<StepState, string> = {
  static: "text-ink",
  done: "text-ink",
  active: "font-medium text-ink",
  pending: "text-ink-muted",
};

export function PipelineSteps({ steps, isRunnable, isAnimated, activeStep }: PipelineStepsProps) {
  // Only runnable agents animate: a planned agent's pipeline is a published plan, not something that runs.
  const animate = isAnimated && isRunnable;

  return (
    <ol className="mt-2.5 flex-1">
      {steps.map((step, index) => {
        const state = stepState(index, activeStep, animate);
        const isLast = index === steps.length - 1;

        return (
          <li key={step} className="relative flex gap-3 pb-3 last:pb-0">
            {isLast ? null : (
              <span aria-hidden="true" className="absolute left-[0.6875rem] top-6 h-[calc(100%-1.25rem)] w-px bg-line-strong">
                {animate ? (
                  <span
                    className={cn(
                      "absolute inset-0 origin-top bg-accent transition-transform duration-500 ease-out",
                      state === "done" ? "scale-y-100" : "scale-y-0",
                    )}
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
                <span className="absolute inset-0 animate-pulse-ring rounded-full bg-accent/25" />
              ) : null}
              {state === "done" ? (
                <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m4.5 10.5 3.5 3.5 7.5-8" />
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
