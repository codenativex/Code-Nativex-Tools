"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const RESET_DELAY_MS = 2000;

type CopyState = "idle" | "copied" | "error";

/** Copy-to-clipboard with a short-lived confirmation state. */
export function useClipboard(): { state: CopyState; copy: (text: string) => Promise<void> } {
  const [state, setState] = useState<CopyState>("idle");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("error");
    }
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setState("idle"), RESET_DELAY_MS);
  }, []);

  return { state, copy };
}
