import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface SectionHeadingProps {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
  readonly as?: "h2" | "h3";
  readonly className?: string;
}

export function SectionHeading({ eyebrow, title, description, action, as: Tag = "h2", className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent">{eyebrow}</p>
        ) : null}
        <Tag className="text-2xl font-semibold text-ink sm:text-3xl">{title}</Tag>
        {description ? <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
