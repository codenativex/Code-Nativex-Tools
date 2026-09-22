import { Fragment } from "react";

import { comparison, plans } from "@/lib/pricing/plans";

function Cell({ value }: { readonly value: string | boolean }) {
  if (typeof value === "string") {
    return <span className="text-sm text-ink">{value}</span>;
  }

  return value ? (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="mx-auto h-4 w-4 text-positive"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m4 10.5 4 4 8-9" />
      </svg>
      <span className="sr-only">Included</span>
    </>
  ) : (
    <>
      <span aria-hidden="true" className="mx-auto block h-px w-3 bg-line-strong" />
      <span className="sr-only">Not included</span>
    </>
  );
}

/** Full feature matrix. Scrolls horizontally on narrow screens rather than squashing. */
export function ComparisonTable() {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[34rem] border-collapse text-left">
        <caption className="sr-only">Feature comparison across the Basic, Pro and Enterprise plans</caption>
        <thead>
          <tr className="border-b border-line-strong">
            <th scope="col" className="w-2/5 py-3 pr-4 text-sm font-semibold text-ink">
              Feature
            </th>
            {plans.map((plan) => (
              <th key={plan.id} scope="col" className="px-4 py-3 text-center text-sm font-semibold text-ink">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparison.map((group) => (
            <Fragment key={group.name}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={plans.length + 1}
                  className="bg-surface-muted px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted"
                >
                  {group.name}
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.feature} className="border-b border-line">
                  <th scope="row" className="py-3.5 pr-4 text-sm font-normal text-ink-muted">
                    {row.feature}
                  </th>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-4 py-3.5 text-center">
                      <Cell value={row.values[plan.id]} />
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
