import { findingMeta } from "@/components/audit/score";
import type { AuditFinding } from "@/lib/audit/types";
import { cn } from "@/lib/utils/cn";

export function FindingList({ findings }: { readonly findings: readonly AuditFinding[] }) {
  return (
    <ul className="divide-y divide-line">
      {findings.map((finding) => {
        const meta = findingMeta[finding.status];

        return (
          <li key={finding.id} className="flex gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4">
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-xs font-bold leading-none",
                meta.markerClass,
              )}
            >
              {meta.symbol}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">
                {finding.title}
                <span className="sr-only"> — {meta.label}</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{finding.detail}</p>

              {finding.evidence ? (
                <p className="mt-2 overflow-x-auto rounded-md bg-surface-muted px-3 py-2 font-mono text-xs leading-relaxed text-ink-muted">
                  {finding.evidence}
                </p>
              ) : null}

              {finding.recommendation ? (
                <p className="mt-2 text-sm leading-relaxed text-ink">
                  <span className="font-medium">Recommendation: </span>
                  {finding.recommendation}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
