import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type AlertTone = "info" | "warn" | "error";

const tones: Record<AlertTone, string> = {
  info: "border-line bg-surface-muted text-ink-muted",
  warn: "border-caution/35 bg-caution/10 text-[oklch(0.45_0.11_75)]",
  error: "border-critical/30 bg-critical/8 text-critical",
};

interface AlertProps {
  readonly tone: AlertTone;
  readonly title?: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function Alert({ tone, title, children, className }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-lg border px-4 py-3 text-sm", tones[tone], className)}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={cn(title && "mt-1")}>{children}</div>
    </div>
  );
}
