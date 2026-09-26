import Link from "next/link";
import type { ReactNode } from "react";

import { ToolIcon, toolIconName } from "@/components/tools/tool-icon";
import { ToolStatusBadge } from "@/components/tools/tool-status-badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { getCategory } from "@/lib/tools/categories";
import type { ToolDefinition } from "@/lib/tools/types";
import { cn } from "@/lib/utils/cn";

interface AgentHeroProps {
  readonly tool: ToolDefinition;
  readonly breadcrumbs: readonly { readonly name: string; readonly path: string }[];
  readonly title: string;
  readonly lead: string;
  readonly actions: ReactNode;
}

/**
 * Header shared by an agent's details and run pages. Everything sits on the
 * container's left edge — breadcrumb, identity row, title, lead and actions —
 * so it lines up with the site header and the body grid below.
 */
export function AgentHero({ tool, breadcrumbs, title, lead, actions }: AgentHeroProps) {
  const category = getCategory(tool.category);
  const isRunnable = tool.runtime !== undefined;

  return (
    <section className="border-b border-line bg-page-header">
      <Container width="wide" className="py-10 sm:py-14">
        <Breadcrumbs items={breadcrumbs} />

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "grid h-11 w-11 shrink-0 place-items-center rounded-control border",
              isRunnable ? "border-accent bg-accent text-on-accent" : "border-line bg-surface text-ink-subtle",
            )}
          >
            <ToolIcon name={toolIconName(tool)} className="h-5 w-5" />
          </span>
          <Link
            href={`/tools?category=${category.id}`}
            className="inline-flex h-7 items-center rounded-full border border-line bg-surface px-3 text-xs font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            {category.name}
          </Link>
          <ToolStatusBadge status={tool.status} />
        </div>

        <h1 className="mt-5 max-w-3xl text-[1.875rem] font-bold leading-[1.1] sm:text-[2.5rem]">{title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-muted sm:text-lg">{lead}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>
      </Container>
    </section>
  );
}
