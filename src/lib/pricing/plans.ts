/**
 * Plan configuration.
 *
 * PLACEHOLDER PRICING — replace `monthly` and `annual` with Code Nativex's real
 * figures before launch. Everything on /pricing is derived from this file, so a
 * price change is a one-line edit here.
 */

export type PlanId = "basic" | "pro" | "enterprise";

export type BillingPeriod = "monthly" | "annual";

export interface PlanPrice {
  /** Price per month in USD, billed monthly. `null` means "talk to us". */
  readonly monthly: number | null;
  /** Price per month in USD when billed annually. */
  readonly annual: number | null;
}

export interface Plan {
  readonly id: PlanId;
  readonly name: string;
  readonly tagline: string;
  readonly price: PlanPrice;
  readonly cta: { readonly label: string; readonly href: string };
  readonly highlighted: boolean;
  /** Headline points shown on the plan card. */
  readonly features: readonly string[];
  readonly footnote?: string;
}

export const plans: readonly Plan[] = [
  {
    id: "basic",
    name: "Basic",
    tagline: "For individuals checking their own sites.",
    price: { monthly: 0, annual: 0 },
    cta: { label: "Start free", href: "/tools" },
    highlighted: false,
    features: [
      "Every live tool, no account required",
      "20 audits per day",
      "Full reports with evidence and recommendations",
      "JSON export",
    ],
    footnote: "No card required.",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For developers and agencies working across many sites.",
    price: { monthly: 29, annual: 24 },
    cta: { label: "Talk to us about Pro", href: "/contact?plan=pro" },
    highlighted: true,
    features: [
      "Everything in Basic",
      "1,000 audits per month",
      "Scheduled audits with change alerts",
      "Saved report history and score trends",
      "Shareable report links",
      "Priority access to new agents",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For teams with volume, compliance or integration needs.",
    price: { monthly: null, annual: null },
    cta: { label: "Contact sales", href: "/contact?plan=enterprise" },
    highlighted: false,
    features: [
      "Everything in Pro",
      "Custom volume and rate limits",
      "API access for your own pipelines",
      "SSO and role-based access",
      "Custom checks and white-labelled reports",
      "A named contact and agreed response times",
    ],
  },
] as const;

/** Months of an annual plan that are effectively free, derived from the config. */
export function annualSavingMonths(plan: Plan): number | null {
  const { monthly, annual } = plan.price;
  if (monthly === null || annual === null || monthly === 0) return null;
  return Math.round(((monthly - annual) * 12) / monthly);
}

export interface ComparisonRow {
  readonly feature: string;
  /** A string renders as text; a boolean renders as an included/excluded mark. */
  readonly values: Readonly<Record<PlanId, string | boolean>>;
}

export interface ComparisonGroup {
  readonly name: string;
  readonly rows: readonly ComparisonRow[];
}

export const comparison: readonly ComparisonGroup[] = [
  {
    name: "Usage",
    rows: [
      { feature: "Website audits", values: { basic: "20 / day", pro: "1,000 / month", enterprise: "Custom" } },
      { feature: "Generator tools", values: { basic: "Unlimited", pro: "Unlimited", enterprise: "Unlimited" } },
      { feature: "Concurrent runs", values: { basic: "1", pro: "5", enterprise: "Custom" } },
    ],
  },
  {
    name: "Reporting",
    rows: [
      { feature: "Full findings with evidence", values: { basic: true, pro: true, enterprise: true } },
      { feature: "JSON export", values: { basic: true, pro: true, enterprise: true } },
      { feature: "Saved report history", values: { basic: false, pro: true, enterprise: true } },
      { feature: "Shareable report links", values: { basic: false, pro: true, enterprise: true } },
      { feature: "White-labelled reports", values: { basic: false, pro: false, enterprise: true } },
    ],
  },
  {
    name: "Automation",
    rows: [
      { feature: "Scheduled audits", values: { basic: false, pro: true, enterprise: true } },
      { feature: "Change alerts", values: { basic: false, pro: true, enterprise: true } },
      { feature: "API access", values: { basic: false, pro: false, enterprise: true } },
    ],
  },
  {
    name: "Team and support",
    rows: [
      { feature: "Seats", values: { basic: "1", pro: "5", enterprise: "Custom" } },
      { feature: "SSO", values: { basic: false, pro: false, enterprise: true } },
      { feature: "Support", values: { basic: "Community", pro: "Email", enterprise: "Named contact" } },
    ],
  },
] as const;
