import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { ToolStatus } from "@/lib/tools/types";

const statusMeta: Record<ToolStatus, { label: string; tone: BadgeTone }> = {
  live: { label: "Live", tone: "positive" },
  beta: { label: "Beta", tone: "accent" },
  planned: { label: "In development", tone: "neutral" },
};

export function ToolStatusBadge({ status }: { readonly status: ToolStatus }) {
  const meta = statusMeta[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
