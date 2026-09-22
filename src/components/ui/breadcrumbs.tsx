import Link from "next/link";

interface Crumb {
  readonly name: string;
  readonly path: string;
}

/** The last crumb is the current page and is not linked. */
export function Breadcrumbs({ items }: { readonly items: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-subtle">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className="text-ink-muted">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="inline-block py-1 transition-colors hover:text-ink">
                  {item.name}
                </Link>
              )}
              {isLast ? null : (
                <span aria-hidden="true" className="text-line-strong">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
