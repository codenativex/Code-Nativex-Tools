"use client";

import { useState } from "react";

import { PlanCard } from "@/components/pricing/plan-card";
import { plans, type BillingPeriod } from "@/lib/pricing/plans";
import { cn } from "@/lib/utils/cn";

const periods: readonly { id: BillingPeriod; label: string }[] = [
  { id: "monthly", label: "Monthly" },
  { id: "annual", label: "Annual" },
];

export function PricingPlans() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  return (
    <div>
      <div className="flex justify-center">
        <div
          role="group"
          aria-label="Billing period"
          className="inline-flex rounded-full border border-line bg-surface p-1"
        >
          {periods.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={period === item.id}
              onClick={() => setPeriod(item.id)}
              className={cn(
                "h-9 rounded-full px-4 text-sm transition-colors",
                period === item.id ? "bg-ink text-white" : "text-ink-muted hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-10 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <li key={plan.id} className="h-full">
            <PlanCard plan={plan} period={period} />
          </li>
        ))}
      </ul>
    </div>
  );
}
