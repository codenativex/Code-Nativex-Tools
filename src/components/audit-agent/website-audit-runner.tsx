"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { QUICK_OPTIONS, STANDARD_OPTIONS, PRESET_COPY, type AuditPreset } from "@/lib/audit-agent/presets";
import type { AuditOptions, AuditStatusResponse } from "@/lib/audit-agent/types";

const inputClass =
  "w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-[0.9375rem] text-ink transition-colors placeholder:text-ink-subtle focus:border-accent focus:outline-none disabled:opacity-60";

function numberValue(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

export function WebsiteAuditRunner() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [preset, setPreset] = useState<AuditPreset>("quick");
  const [options, setOptions] = useState<AuditOptions>(QUICK_OPTIONS);
  const [advanced, setAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSummary = useMemo(() => PRESET_COPY[preset].summary, [preset]);

  function choosePreset(next: AuditPreset) {
    setPreset(next);
    if (next === "quick") setOptions(QUICK_OPTIONS);
    if (next === "standard") setOptions(STANDARD_OPTIONS);
    if (next === "custom") setAdvanced(true);
  }

  function updateNumber(field: keyof Pick<AuditOptions, "max_pages" | "performance_pages" | "lighthouse_runs" | "external_links">, value: string) {
    setPreset("custom");
    setOptions((current) => ({ ...current, [field]: numberValue(value, current[field]) }));
  }

  function updateBoolean(field: keyof Pick<AuditOptions, "cross_browser" | "firefox" | "ai_enabled">, value: boolean) {
    setPreset("custom");
    setOptions((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("Enter the website address you want to audit.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/tools/website-audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          ...(companyName.trim() ? { company_name: companyName.trim() } : {}),
          ...options,
          client_request_id: crypto.randomUUID(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok: true; data: AuditStatusResponse }
        | { ok: false; error: { message: string } }
        | null;

      if (!response.ok || !payload || !payload.ok) {
        setError(payload && !payload.ok ? payload.error.message : "The audit could not be started.");
        return;
      }

      router.push(`/tools/website-audit/${encodeURIComponent(payload.data.audit_id)}`);
    } catch {
      setError("Could not reach the audit service. Check that the worker is running and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-ink">Website URL</span>
            <input
              className={inputClass}
              type="url"
              inputMode="url"
              placeholder="https://example.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              disabled={submitting}
              required
            />
            <span className="block text-sm text-ink-subtle">Public websites only. Redirects are followed by the audit worker.</span>
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-ink">
              Company name <span className="font-normal text-ink-subtle">Optional</span>
            </span>
            <input
              className={inputClass}
              type="text"
              placeholder="Example Company"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              disabled={submitting}
              maxLength={200}
            />
          </label>
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-ink">Scan preset</legend>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {(Object.keys(PRESET_COPY) as AuditPreset[]).map((id) => {
              const item = PRESET_COPY[id];
              const selected = preset === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => choosePreset(id)}
                  disabled={submitting}
                  className={`rounded-card border p-4 text-left transition-colors ${
                    selected ? "border-accent bg-accent-soft" : "border-line bg-surface hover:bg-surface-muted"
                  }`}
                >
                  <span className="block text-sm font-semibold text-ink">{item.name}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-ink-muted">{item.summary}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-ink-subtle">Current setup: {activeSummary}</p>
        </fieldset>

        <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
          <div>
            <p className="text-sm font-medium text-ink">Advanced options</p>
            <p className="mt-0.5 text-xs text-ink-subtle">Control crawl size, Lighthouse coverage and browser checks.</p>
          </div>
          <button
            type="button"
            onClick={() => setAdvanced((value) => !value)}
            className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-surface-muted"
          >
            {advanced ? "Hide" : "Show"}
          </button>
        </div>

        {advanced ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <NumberField label="Page budget" value={options.max_pages} min={1} max={500} onChange={(v) => updateNumber("max_pages", v)} />
            <NumberField
              label="Performance pages"
              value={options.performance_pages}
              min={0}
              max={500}
              help="0 = every audited page"
              onChange={(v) => updateNumber("performance_pages", v)}
            />
            <NumberField label="Lighthouse runs per page" value={options.lighthouse_runs} min={1} max={3} onChange={(v) => updateNumber("lighthouse_runs", v)} />
            <NumberField label="External links to check" value={options.external_links} min={0} max={500} onChange={(v) => updateNumber("external_links", v)} />

            <Toggle label="Cross-browser checks" checked={options.cross_browser} onChange={(v) => updateBoolean("cross_browser", v)} />
            <Toggle label="Firefox checks" checked={options.firefox} onChange={(v) => updateBoolean("firefox", v)} />
            <Toggle label="AI explanation" checked={options.ai_enabled} onChange={(v) => updateBoolean("ai_enabled", v)} />
          </div>
        ) : null}

        {error ? <Alert tone="error" className="mt-5">{error}</Alert> : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Starting audit…" : "Start audit"}
          </Button>
          <p className="text-xs leading-relaxed text-ink-subtle">
            The audit runs in the separate Code Nativex audit worker. You can watch progress on the next screen.
          </p>
        </div>
      </form>

      <div className="rounded-card border border-dashed border-line-strong bg-surface px-6 py-8">
        <p className="text-sm font-semibold text-ink">What happens after Start audit?</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {["Discover pages", "Run browser checks", "Measure Lighthouse", "Generate report"].map((item, index) => (
            <div key={item} className="rounded-lg border border-line bg-surface-muted p-3">
              <span className="font-mono text-xs text-ink-subtle">0{index + 1}</span>
              <p className="mt-1 text-sm font-medium text-ink">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, min, max, help, onChange }: { label: string; value: number; min: number; max: number; help?: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input className={inputClass} type="number" value={value} min={min} max={max} onChange={(event) => onChange(event.target.value)} />
      {help ? <span className="block text-xs text-ink-subtle">{help}</span> : null}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex min-h-11 items-center justify-between gap-4 rounded-lg border border-line bg-surface-muted px-4 py-3">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-[var(--color-accent)]" />
    </label>
  );
}
