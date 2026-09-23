"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/** Time each pipeline step stays active. */
const STEP_MS = 750;
/** Pause on a finished pipeline before moving to the next agent. */
const HOLD_MS = 1800;
/** Dwell on an in-development agent, whose plan is shown but not animated. */
const PLANNED_DWELL_MS = 3400;

interface AutoplayAgent {
  readonly steps: readonly string[];
  readonly isRunnable: boolean;
}

interface AutoplayOptions {
  readonly agents: readonly AutoplayAgent[];
  /** Element observed to stop the loop while it is off screen. */
  readonly rootRef: RefObject<HTMLElement | null>;
  /** Progress bar on the selected tab, driven directly to avoid re-renders. */
  readonly progressRef: RefObject<HTMLElement | null>;
}

export type SelectionSource = "auto" | "user";

/**
 * Drives the hero console's preview: steps through a live agent's pipeline,
 * then rotates to the next agent.
 *
 * - One requestAnimationFrame loop; React only re-renders when the active step
 *   or agent changes. The progress bar is updated through a ref.
 * - Stops entirely when paused, off screen, in a hidden tab, or when the user
 *   prefers reduced motion.
 * - While held (hover or keyboard focus), the current pipeline finishes but the
 *   console never moves on to another agent.
 */
export function useConsoleAutoplay({ agents, rootRef, progressRef }: AutoplayOptions) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHeld, setIsHeld] = useState(false);
  const [isOnScreen, setIsOnScreen] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  // Until hydration the console renders its static form, so it reads correctly without JS.
  const [isReady, setIsReady] = useState(false);

  const elapsed = useRef(0);
  const stepRef = useRef(0);
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
    elapsed.current = 0;
    stepRef.current = 0;
    lastSource.current = source;
    setActiveStep(0);
    setSelectedIndex(index);
  }, []);

  useEffect(() => {
    const agent = agents[selectedIndex];
    if (!isRunning || !agent) return;

    const stepCount = agent.isRunnable ? agent.steps.length : 0;
    const stepsEnd = stepCount * STEP_MS;
    const total = agent.isRunnable ? stepsEnd + HOLD_MS : PLANNED_DWELL_MS;
    let last = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      const next = elapsed.current + delta;
      // Held: let the pipeline finish, then freeze rather than advance.
      elapsed.current = isHeld ? Math.min(next, Math.max(stepsEnd, elapsed.current)) : next;

      const t = elapsed.current;
      progressRef.current?.style.setProperty("transform", `scaleX(${Math.min(t / total, 1)})`);

      if (stepCount > 0) {
        const step = Math.min(Math.floor(t / STEP_MS), stepCount);
        if (step !== stepRef.current) {
          stepRef.current = step;
          setActiveStep(step);
        }
      }

      if (t >= total) {
        goTo((selectedIndex + 1) % agents.length, "auto");
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [agents, goTo, isHeld, isRunning, progressRef, selectedIndex]);

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
