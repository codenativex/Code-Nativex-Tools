import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface ContainerProps {
  readonly children: ReactNode;
  readonly className?: string;
  /** `wide` is used for dense grids; `narrow` for long-form reading. */
  readonly width?: "default" | "wide" | "narrow";
}

const widths = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
} as const;

export function Container({ children, className, width = "default" }: ContainerProps) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", widths[width], className)}>{children}</div>;
}
