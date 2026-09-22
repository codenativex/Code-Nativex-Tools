/**
 * Contact delivery.
 *
 * The form only appears when a destination is configured, so we never accept a
 * message we cannot deliver. `CONTACT_WEBHOOK_URL` receives a JSON POST and
 * works with any inbox, automation or chat integration that accepts webhooks.
 */

export const CONTACT_TOPICS = [
  { value: "general", label: "General enquiry" },
  { value: "pro", label: "The Pro plan" },
  { value: "enterprise", label: "Enterprise and volume" },
  { value: "support", label: "Help with a tool" },
  { value: "feedback", label: "Product feedback" },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]["value"];

export const DEFAULT_TOPIC: ContactTopic = "general";

/** Maps a `?plan=` query value onto a topic, for links from /pricing. */
export function topicFromPlan(plan: string | undefined): ContactTopic {
  if (plan === "pro") return "pro";
  if (plan === "enterprise") return "enterprise";
  return DEFAULT_TOPIC;
}

/** Server-only: the configured webhook, or null when contact is not wired up. */
export function contactWebhookUrl(): string | null {
  const value = process.env.CONTACT_WEBHOOK_URL?.trim();
  return value ? value : null;
}

export function isContactConfigured(): boolean {
  return contactWebhookUrl() !== null;
}
