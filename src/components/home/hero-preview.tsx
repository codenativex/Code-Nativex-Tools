import { websiteAuditTool } from "@/lib/tools/definitions/website-audit";
import { PRESET_COPY } from "@/lib/audit-agent/presets";

/**
 * A static illustration of the Website Audit Agent interface.
 *
 * The stages are read from the tool's own configuration, so they can never
 * drift from what the agent actually runs. No scores or findings are shown,
 * because those only exist after a real run against the audit worker.
 */
const stages = websiteAuditTool.runtime?.stages ?? [];

/** Lighthouse reports these four categories per audited page. */
const lighthouseCategories = ["Performance", "Accessibility", "SEO", "Best practices"] as const;

const artifacts = ["report.pdf", "report.html", "report.json"] as const;

export function HeroPreview() {
  return (
    <div className="relative">
      {/* Sand plate, offset behind the panel to give the hero depth. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden translate-x-3 translate-y-3 rounded-card bg-sand sm:block"
      />

      <figure className="relative rounded-card border border-line bg-surface">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-line-strong" />
            <span className="h-2 w-2 rounded-full bg-line-strong" />
            <span className="h-2 w-2 rounded-full bg-line-strong" />
          </span>
          <span className="truncate font-mono text-xs text-ink-subtle">/tools/website-audit</span>
        </div>

        <div className="p-4 sm:p-5">
          {/* Input */}
          <div className="flex items-center gap-3 rounded-lg border border-line-strong bg-surface px-3 py-2">
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink">https://example.com</span>
            <span className="shrink-0 rounded-md bg-accent px-2.5 py-1 text-[0.6875rem] font-medium text-white">
              Run audit
            </span>
          </div>
          <p className="mt-2 text-[0.6875rem] text-ink-subtle">
            Preset: {PRESET_COPY.standard.name} · {PRESET_COPY.standard.summary}
          </p>

          {/* The stages the worker actually reports */}
          <ol className="mt-4 space-y-2">
            {stages.map((stage) => (
              <li key={stage.id} className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent/35"
                />
                <span className="text-xs text-ink-muted">{stage.label}</span>
              </li>
            ))}
          </ol>

          {/* What a completed run produces */}
          <div className="mt-4 rounded-lg bg-surface-muted p-3.5">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-ink-subtle">
              Lighthouse, per audited page
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {lighthouseCategories.map((category) => (
                <li
                  key={category}
                  className="rounded-md border border-line bg-surface px-2 py-1 text-[0.6875rem] text-ink-muted"
                >
                  {category}
                </li>
              ))}
            </ul>

            <p className="mt-3 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-ink-subtle">
              Downloadable artifacts
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {artifacts.map((artifact) => (
                <li
                  key={artifact}
                  className="rounded-md border border-sand-line bg-sand-soft px-2 py-1 font-mono text-[0.6875rem] text-ink-muted"
                >
                  {artifact}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <figcaption className="border-t border-line px-4 py-3 text-[0.6875rem] leading-relaxed text-ink-subtle">
          The Website Audit Agent interface. Scores, findings and evidence appear here once a run completes.
        </figcaption>
      </figure>
    </div>
  );
}
