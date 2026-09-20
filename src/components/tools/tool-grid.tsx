import { ToolCard } from "@/components/tools/tool-card";
import type { ToolDefinition } from "@/lib/tools/types";
import { cn } from "@/lib/utils/cn";

interface ToolGridProps {
  readonly tools: readonly ToolDefinition[];
  readonly columns?: 2 | 3;
}

export function ToolGrid({ tools, columns = 3 }: ToolGridProps) {
  return (
    <ul className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", columns === 3 && "lg:grid-cols-3")}>
      {tools.map((tool) => (
        <li key={tool.id} className="h-full">
          <ToolCard tool={tool} />
        </li>
      ))}
    </ul>
  );
}
