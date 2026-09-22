import Link from "next/link";

import { siteConfig } from "@/lib/site";

export function Logo() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5 rounded-md text-ink"
      aria-label={`${siteConfig.name} home`}
    >
      <span
        aria-hidden="true"
        className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-[0.8125rem] font-bold tracking-tight text-white"
      >
        CN
      </span>
      <span className="text-[0.9375rem] font-semibold leading-none">
        Code Nativex
        <span className="ml-1.5 font-normal text-ink-subtle">Tools</span>
      </span>
    </Link>
  );
}
