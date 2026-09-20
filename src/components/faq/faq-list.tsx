import type { FaqEntry } from "@/lib/faq/entries";

/** Accessible disclosure list — native <details>, no JavaScript required. */
export function FaqList({ entries }: { readonly entries: readonly FaqEntry[] }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
      {entries.map((entry) => (
        <details key={entry.question} className="group">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 text-[0.9375rem] font-medium text-ink sm:px-6">
            {entry.question}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle transition-transform group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <p className="px-5 pb-5 text-[0.9375rem] leading-relaxed text-ink-muted sm:px-6">{entry.answer}</p>
        </details>
      ))}
    </div>
  );
}
