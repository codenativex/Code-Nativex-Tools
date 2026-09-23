import { ButtonLink } from "@/components/ui/button";
import { annualSavingMonths, type BillingPeriod, type Plan } from "@/lib/pricing/plans";
import { cn } from "@/lib/utils/cn";

interface PlanCardProps {
  readonly plan: Plan;
  readonly period: BillingPeriod;
}

export function PlanCard({ plan, period }: PlanCardProps) {
  const amount = plan.price[period];
  const saving = annualSavingMonths(plan);

  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-card border bg-surface p-6 sm:p-7",
        plan.highlighted ? "border-accent shadow-[0_0_0_1px_var(--color-accent)]" : "border-line",
      )}
    >
      {plan.highlighted ? (
        <p className="absolute -top-3 left-6 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-on-accent">
          Most popular
        </p>
      ) : null}

      <h2 className="text-lg font-semibold text-ink">{plan.name}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{plan.tagline}</p>

      <p className="mt-6 flex items-baseline gap-1.5">
        {amount === null ? (
          <span className="text-3xl font-semibold tracking-tight text-ink">Custom</span>
        ) : amount === 0 ? (
          <span className="text-3xl font-semibold tracking-tight text-ink">Free</span>
        ) : (
          <>
            <span className="font-mono text-4xl font-semibold tracking-tight tabular-nums text-ink">${amount}</span>
            <span className="text-sm text-ink-muted">/ month</span>
          </>
        )}
      </p>
      <p className="mt-1.5 h-5 text-xs text-ink-subtle">
        {amount === null
          ? "Priced on volume and requirements"
          : amount === 0
            ? "Free forever"
            : period === "annual"
              ? `Billed annually${saving ? ` — ${saving} months free` : ""}`
              : "Billed monthly"}
      </p>

      <ButtonLink
        href={plan.cta.href}
        variant={plan.highlighted ? "primary" : "secondary"}
        className="mt-6"
        fullWidth
      >
        {plan.cta.label}
      </ButtonLink>

      <ul className="mt-7 flex-1 space-y-3 border-t border-line pt-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="mt-0.5 h-4 w-4 shrink-0 text-positive"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m4 10.5 4 4 8-9" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {plan.footnote ? <p className="mt-5 text-xs text-ink-subtle">{plan.footnote}</p> : null}
    </article>
  );
}
