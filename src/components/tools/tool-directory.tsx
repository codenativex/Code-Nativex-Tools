"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ToolGrid } from "@/components/tools/tool-grid";
import { Button } from "@/components/ui/button";
import { getCategory } from "@/lib/tools/categories";
import { getPopulatedCategoryIds, queryTools } from "@/lib/tools/registry";
import type { ToolCategoryId } from "@/lib/tools/types";
import { cn } from "@/lib/utils/cn";

const URL_SYNC_DELAY_MS = 300;

type CategoryFilter = ToolCategoryId | "all";

function parseCategory(value: string | null): CategoryFilter {
  if (!value) return "all";
  return getPopulatedCategoryIds().includes(value as ToolCategoryId) ? (value as ToolCategoryId) : "all";
}

/**
 * Directory search and filtering. State lives in the URL so results are
 * shareable and survive a refresh, with the text input kept local so typing
 * stays instant.
 */
export function ToolDirectory() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("q") ?? "";
  const category = parseCategory(searchParams.get("category"));
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (category !== "all") params.set("category", category);
      const queryString = params.toString();
      router.replace(queryString ? `/tools?${queryString}` : "/tools", { scroll: false });
    }, URL_SYNC_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [search, category, router]);

  const categories = useMemo(
    () => [{ id: "all" as const, name: "All tools" }, ...getPopulatedCategoryIds().map((id) => getCategory(id))],
    [],
  );

  const results = useMemo(() => queryTools({ search, category }), [search, category]);

  const setCategory = (next: CategoryFilter) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (next !== "all") params.set("category", next);
    const queryString = params.toString();
    router.replace(queryString ? `/tools?${queryString}` : "/tools", { scroll: false });
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="relative">
          <label htmlFor="tool-search" className="sr-only">
            Search tools
          </label>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            id="tool-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, category or what you need to do"
            className="h-12 w-full rounded-lg border border-line-strong bg-surface pl-10 pr-4 text-[0.9375rem] text-ink placeholder:text-ink-subtle focus:border-accent focus:outline-none"
          />
        </div>

        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div role="group" aria-label="Filter by category" className="flex w-max gap-2 pb-1 sm:w-auto sm:flex-wrap">
            {categories.map((item) => {
              const isActive = category === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setCategory(item.id as CategoryFilter)}
                  className={cn(
                    "h-9 shrink-0 rounded-full border px-3.5 text-sm transition-colors",
                    isActive
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
                  )}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-ink-subtle" role="status" aria-live="polite">
        {results.length} {results.length === 1 ? "tool" : "tools"}
        {category === "all" ? "" : ` in ${getCategory(category).name}`}
        {search.trim() ? ` matching “${search.trim()}”` : ""}
      </p>

      <div className="mt-4">
        {results.length > 0 ? (
          <ToolGrid tools={results} />
        ) : (
          <div className="rounded-card border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
            <h2 className="text-base font-semibold text-ink">No tools match that search</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
              Try a broader term, or clear the filters to see the full catalogue. New tools are added regularly.
            </p>
            <Button
              variant="secondary"
              className="mt-6"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
