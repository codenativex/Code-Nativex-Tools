"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/** Average time a pipeline stage stays active; each stage varies around it. */
const STAGE_BASE_MS = 1100;
/** Pause on a finished pipeline before moving to the next agent. */
const HOLD_MS = 2200;
/** Dwell on an in-development agent, whose plan is shown but not animated. */
const PLANNED_DWELL_MS = 3600;
/** Beat before the first run, while the console rises into place. */
const ENTRANCE_LEAD_MS = 700;
/** Beat before each later run, while the new panel fades in. */
const SWITCH_LEAD_MS = 350;

interface AutoplayAgent {
  readonly steps: readonly string[];
  readonly isRunnable: boolean;
}

interface Timeline {
  readonly starts: readonly number[];
  readonly durations: readonly number[];
  readonly end: number;
}

/**
 * Real pipelines have uneven stages, so each stage gets its own pace. The
 * weight is derived from the stage label: stable across renders and visits,
 * and never shown to the user as a duration.
 */
function stageWeight(label: string): number {
  let hash = 0;
  for (const char of label) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return 0.75 + (Math.abs(hash) % 71) / 100; // 0.75–1.45
}

function buildTimeline(steps: readonly string[]): Timeline {
  const durations = steps.map((step) => STAGE_BASE_MS * stageWeight(step));
  const starts: number[] = [];
  let end = 0;
  for (const duration of durations) {
    starts.push(end);
    end += duration;
  }
  return { starts, durations, end };
}

interface AutoplayOptions {
  readonly agents: readonly AutoplayAgent[];
  /** Element observed to stop the loop while it is off screen. */
  readonly rootRef: RefObject<HTMLElement | null>;
  /** Progress bar on the selected tab. */
  readonly progressRef: RefObject<HTMLElement | null>;
  /** Pipeline list; receives `--p0…--pN` fill values for its connectors. */
  readonly pipelineRef: RefObject<HTMLElement | null>;
}

export type SelectionSource = "auto" | "user";

/**
 * Drives the hero console's preview: plays a live agent's pipeline stage by
 * stage, then rotates to the next agent.
 *
 * - One requestAnimationFrame loop. Continuous values (the tab progress bar
 *   and each connector's fill) are written straight to the DOM through refs;
 *   React re-renders only when the active stage or agent changes.
 * - Stops entirely when paused, off screen, in a hidden tab, or when the user
 *   prefers reduced motion.
 * - While held (hover or keyboard focus), the current pipeline finishes but the
 *   console never moves on to another agent.
 */
export function useConsoleAutoplay({ agents, rootRef, progressRef, pipelineRef }: AutoplayOptions) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHeld, setIsHeld] = useState(false);
  const [isOnScreen, setIsOnScreen] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  // Until hydration the console renders its static form, so it reads correctly without JS.
  const [isReady, setIsReady] = useState(false);

  const elapsed = useRef(-ENTRANCE_LEAD_MS);
  const stepRef = useRef(0);
  const writtenStep = useRef(-1);
  const lastSource = useRef<SelectionSource>("user");

  useEffect(() => {
    setIsReady(true);
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () => setIsPageVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setIsOnScreen(entry?.isIntersecting ?? true), {
      threshold: 0.2,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootRef]);

  const isAnimated = isReady && !prefersReducedMotion;
  const isRunning = isAnimated && !isPaused && isOnScreen && isPageVisible;

  const goTo = useCallback((index: number, source: SelectionSource) => {
    elapsed.current = -SWITCH_LEAD_MS;
    stepRef.current = 0;
    writtenStep.current = -1;
    lastSource.current = source;
    setActiveStep(0);
    setSelectedIndex(index);
  }, []);

  useEffect(() => {
    const agent = agents[selectedIndex];
    if (!isRunning || !agent) return;

    const timeline = agent.isRunnable ? buildTimeline(agent.steps) : null;
    const stepCount = timeline?.durations.length ?? 0;
    const stepsEnd = timeline?.end ?? 0;
    const total = timeline ? stepsEnd + HOLD_MS : PLANNED_DWELL_MS;
    let last = performance.now();
    let frame = 0;

    const writeFills = (step: number, fraction: number) => {
      const list = pipelineRef.current;
      if (!list) return;
      // Settled connectors only change at a stage boundary; the active one changes every frame.
      if (step !== writtenStep.current) {
        for (let index = 0; index < stepCount; index += 1) {
          list.style.setProperty(`--p${index}`, index < step ? "1" : "0");
        }
        writtenStep.current = step;
      }
      if (step < stepCount) list.style.setProperty(`--p${step}`, fraction.toFixed(4));
    };

    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      const next = elapsed.current + delta;
      // Held: let the pipeline finish, then freeze rather than advance.
      elapsed.current = isHeld ? Math.min(next, Math.max(stepsEnd, elapsed.current)) : next;

      const t = Math.max(elapsed.current, 0);
      progressRef.current?.style.setProperty("transform", `scaleX(${Math.min(t / total, 1)})`);

      if (timeline) {
        let step = stepCount;
        for (let index = 0; index < stepCount; index += 1) {
          if (t < (timeline.starts[index] ?? 0) + (timeline.durations[index] ?? 0)) {
            step = index;
            break;
          }
        }
        const fraction = step < stepCount ? (t - (timeline.starts[step] ?? 0)) / (timeline.durations[step] ?? 1) : 1;
        writeFills(step, fraction);
        if (step !== stepRef.current) {
          stepRef.current = step;
          setActiveStep(step);
        }
      }

      if (elapsed.current >= total) {
        goTo((selectedIndex + 1) % agents.length, "auto");
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [agents, goTo, isHeld, isRunning, pipelineRef, progressRef, selectedIndex]);

  return {
    selectedIndex,
    activeStep,
    /** False under reduced motion or before hydration: render the static pipeline. */
    isAnimated,
    isPaused,
    lastSource,
    select: (index: number) => goTo(index, "user"),
    togglePaused: () => setIsPaused((paused) => !paused),
    setIsHeld,
  };
}
