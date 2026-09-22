import { z } from "zod";

import { fieldErrors, jsonError, jsonSuccess, readJsonBody } from "@/lib/api/http";
import { checkRateLimit, clientKey } from "@/lib/api/rate-limit";
import { generateMetaTags } from "@/lib/meta-tags/generate";

export const runtime = "nodejs";

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .url("Enter a full URL, including https://")
  .optional()
  .or(z.literal("").transform(() => undefined));

const requestSchema = z.object({
  title: z.string().trim().min(1, "Enter a page title.").max(200, "Keep the title under 200 characters."),
  description: z
    .string()
    .trim()
    .min(1, "Enter a meta description.")
    .max(400, "Keep the description under 400 characters."),
  url: z.string().trim().min(1, "Enter a canonical URL.").max(2048).url("Enter a full URL, including https://"),
  imageUrl: optionalUrl,
  siteName: z.string().trim().max(120).optional(),
  twitterCard: z.enum(["summary", "summary_large_image"]),
});

export async function POST(request: Request): Promise<Response> {
  const limit = checkRateLimit(clientKey(request, "meta-tag-generator"), { limit: 60, windowMs: 60_000 });
  if (!limit.allowed) {
    return jsonError(`Too many requests. Try again in ${limit.retryAfterSeconds} seconds.`, "rate_limited", 429);
  }

  const parsed = requestSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return jsonError("Please correct the highlighted fields.", "invalid_input", 400, fieldErrors(parsed.error.issues));
  }

  return jsonSuccess({ view: "code-output", output: generateMetaTags(parsed.data) });
}
