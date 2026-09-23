import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { ToolStatus } from "@/lib/tools/types";

const statusMeta: Record<ToolStatus, { label: string; tone: BadgeTone; dot: string | null }> = {
  live: { label: "Live", tone: "positive", dot: "bg-positive" },
  beta: { label: "Beta", tone: "accent", dot: "bg-accent" },
  planned: { label: "In development", tone: "neutral", dot: null },
};

export function ToolStatusBadge({ status }: { readonly status: ToolStatus }) {
  const meta = statusMeta[status];
  return (
    <Badge tone={meta.tone}>
      {meta.dot ? <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> : null}
      {meta.label}
    </Badge>
  );
}
