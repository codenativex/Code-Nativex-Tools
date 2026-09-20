import { z } from "zod";

import { fieldErrors, jsonError, jsonSuccess, readJsonBody } from "@/lib/api/http";
import { checkRateLimit, clientKey } from "@/lib/api/rate-limit";
import { CONTACT_TOPICS, contactWebhookUrl } from "@/lib/contact/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEBHOOK_TIMEOUT_MS = 8_000;

const topicValues = CONTACT_TOPICS.map((topic) => topic.value) as [string, ...string[]];

const requestSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120, "That name is too long."),
  email: z.string().trim().min(1, "Enter your email address.").max(254).email("Enter a valid email address."),
  company: z.string().trim().max(160).optional(),
  topic: z.enum(topicValues, { errorMap: () => ({ message: "Choose a topic." }) }),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a little more — at least 20 characters.")
    .max(4000, "Please keep the message under 4,000 characters."),
  /**
   * Honeypot: a real person never fills a field they cannot see. It accepts any
   * value so a bot gets an ordinary success response instead of learning that
   * this field is the trap.
   */
  website: z.string().max(2048).optional(),
});

export async function POST(request: Request): Promise<Response> {
  const webhook = contactWebhookUrl();
  if (!webhook) {
    return jsonError(
      "The contact form is not available right now. Please email us instead.",
      "not_configured",
      503,
    );
  }

  const limit = checkRateLimit(clientKey(request, "contact"), { limit: 5, windowMs: 600_000 });
  if (!limit.allowed) {
    return jsonError(
      "You have sent several messages already. Please wait a few minutes before sending another.",
      "rate_limited",
      429,
    );
  }

  const parsed = requestSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    return jsonError(
      "Please correct the highlighted fields.",
      "invalid_input",
      400,
      fieldErrors(parsed.error.issues),
    );
  }

  const { website, ...submission } = parsed.data;
  if (website?.trim()) {
    // Silently accept so a bot learns nothing from the response.
    return jsonSuccess({ received: true });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...submission, submittedAt: new Date().toISOString(), source: "code-nativex-tools" }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error("contact: webhook responded with", response.status);
      return jsonError("We could not send your message. Please try again or email us directly.", "delivery_failed", 502);
    }
  } catch (error) {
    console.error("contact: webhook request failed", error);
    return jsonError("We could not send your message. Please try again or email us directly.", "delivery_failed", 502);
  } finally {
    clearTimeout(timeout);
  }

  return jsonSuccess({ received: true });
}
