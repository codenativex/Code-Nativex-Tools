import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type BadgeTone = "neutral" | "accent" | "positive" | "caution" | "critical";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line bg-surface-muted text-ink-muted",
  accent: "border-accent/25 bg-accent-soft text-accent",
  positive: "border-positive/25 bg-positive/10 text-positive",
  caution: "border-caution/30 bg-caution/10 text-[oklch(0.5_0.12_75)]",
  critical: "border-critical/25 bg-critical/10 text-critical",
};

interface BadgeProps {
  readonly children: ReactNode;
  readonly tone?: BadgeTone;
  readonly className?: string;
}

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
