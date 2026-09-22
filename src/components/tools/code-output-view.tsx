"use client";

import { Button } from "@/components/ui/button";
import type { CodeOutputResult } from "@/lib/tools/results";
import { downloadTextFile } from "@/lib/utils/download";
import { useClipboard } from "@/lib/utils/use-clipboard";
import { cn } from "@/lib/utils/cn";

const fileNames: Record<CodeOutputResult["language"], { name: string; mime: string }> = {
  html: { name: "meta-tags.html", mime: "text/html" },
  json: { name: "output.json", mime: "application/json" },
};

export function CodeOutputView({ output }: { readonly output: CodeOutputResult }) {
  const { state, copy } = useClipboard();
  const file = fileNames[output.language];

  return (
    <div className="space-y-4">
      {output.notes.length > 0 ? (
        <ul className="space-y-2">
          {output.notes.map((note) => (
            <li
              key={note.message}
              className={cn(
                "rounded-lg border px-4 py-3 text-sm leading-relaxed",
                note.status === "warn"
                  ? "border-caution/35 bg-caution/10 text-[oklch(0.45_0.11_75)]"
                  : "border-line bg-surface-muted text-ink-muted",
              )}
            >
              {note.message}
            </li>
          ))}
        </ul>
      ) : null}

      <section aria-labelledby="generated-output" className="overflow-hidden rounded-card border border-line bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <h2 id="generated-output" className="text-sm font-semibold text-ink">
            Generated output
          </h2>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => void copy(output.code)}>
              {state === "copied" ? "Copied" : state === "error" ? "Copy failed" : "Copy"}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => downloadTextFile(file.name, output.code, file.mime)}>
              Download
            </Button>
          </div>
        </div>
        <pre className="overflow-x-auto bg-surface-muted px-4 py-4 text-xs leading-relaxed text-ink sm:px-5 sm:text-[0.8125rem]">
          <code>{output.code}</code>
        </pre>
      </section>
    </div>
  );
}
