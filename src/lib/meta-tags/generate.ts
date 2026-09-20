import type { CodeOutputResult } from "@/lib/tools/results";

export interface MetaTagInput {
  readonly title: string;
  readonly description: string;
  readonly url: string;
  readonly imageUrl?: string;
  readonly siteName?: string;
  readonly twitterCard: "summary" | "summary_large_image";
}

const TITLE_MAX = 60;
const DESCRIPTION_MIN = 70;
const DESCRIPTION_MAX = 160;

/** Escapes a value for safe use inside a double-quoted HTML attribute. */
function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tag(markup: string): string {
  return markup;
}

export function generateMetaTags(input: MetaTagInput): CodeOutputResult {
  const title = escapeAttribute(input.title.trim());
  const description = escapeAttribute(input.description.trim());
  const url = escapeAttribute(input.url.trim());
  const image = input.imageUrl?.trim() ? escapeAttribute(input.imageUrl.trim()) : null;
  const siteName = input.siteName?.trim() ? escapeAttribute(input.siteName.trim()) : null;

  const lines = [
    tag(`<title>${title}</title>`),
    tag(`<meta name="description" content="${description}">`),
    tag(`<link rel="canonical" href="${url}">`),
    "",
    tag(`<meta property="og:type" content="website">`),
    tag(`<meta property="og:title" content="${title}">`),
    tag(`<meta property="og:description" content="${description}">`),
    tag(`<meta property="og:url" content="${url}">`),
    ...(siteName ? [tag(`<meta property="og:site_name" content="${siteName}">`)] : []),
    ...(image ? [tag(`<meta property="og:image" content="${image}">`)] : []),
    "",
    tag(`<meta name="twitter:card" content="${input.twitterCard}">`),
    tag(`<meta name="twitter:title" content="${title}">`),
    tag(`<meta name="twitter:description" content="${description}">`),
    ...(image ? [tag(`<meta name="twitter:image" content="${image}">`)] : []),
  ];

  const notes: CodeOutputResult["notes"] = [
    ...(input.title.length > TITLE_MAX
      ? ([{ status: "warn", message: `The title is ${input.title.length} characters. Search results usually truncate past ${TITLE_MAX}.` }] as const)
      : []),
    ...(input.description.length > DESCRIPTION_MAX
      ? ([{ status: "warn", message: `The description is ${input.description.length} characters. Aim for ${DESCRIPTION_MIN}–${DESCRIPTION_MAX}.` }] as const)
      : []),
    ...(input.description.length < DESCRIPTION_MIN
      ? ([{ status: "warn", message: `The description is only ${input.description.length} characters. Short descriptions are often rewritten by search engines.` }] as const)
      : []),
    ...(!image
      ? ([{ status: "info", message: "No share image was provided, so og:image and twitter:image were omitted. Most platforms fall back to a plain text preview." }] as const)
      : []),
    ...(input.twitterCard === "summary_large_image" && !image
      ? ([{ status: "warn", message: "A large image card without an image falls back to a summary card." }] as const)
      : []),
  ];

  return { language: "html", code: lines.join("\n"), notes };
}
