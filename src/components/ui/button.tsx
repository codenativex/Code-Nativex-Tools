import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors duration-150 " +
  "disabled:cursor-not-allowed disabled:opacity-55 whitespace-nowrap";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent font-semibold text-on-accent hover:bg-accent-hover",
  secondary: "border border-line-strong bg-surface/60 text-ink hover:border-ink-subtle hover:bg-surface-raised",
  ghost: "text-ink-muted hover:bg-surface-raised hover:text-ink",
};

/** Minimum 44px touch target at `md` and above. */
const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm sm:text-[0.9375rem]",
  lg: "h-12 px-6 text-base",
};

interface CommonProps {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly className?: string;
  readonly children: ReactNode;
  readonly fullWidth?: boolean;
}

type ButtonProps = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

interface ButtonLinkProps extends CommonProps {
  readonly href: string;
  readonly external?: boolean;
}

type StyleProps = Omit<CommonProps, "children">;

function classes({ variant = "primary", size = "md", fullWidth, className }: StyleProps): string {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
}

export function Button({ variant, size, className, fullWidth, children, ...props }: ButtonProps) {
  return (
    <button className={classes({ variant, size, fullWidth, className })} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({ href, external, variant, size, className, fullWidth, children }: ButtonLinkProps) {
  const classNames = classes({ variant, size, fullWidth, className });

  if (external) {
    return (
      <a href={href} className={classNames} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classNames}>
      {children}
    </Link>
  );
}
