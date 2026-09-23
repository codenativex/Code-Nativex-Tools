import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { Container } from "@/components/ui/container";
import { footerNav, siteConfig } from "@/lib/site";
import { getRunnableTools } from "@/lib/tools/registry";

const linkClasses = "inline-block py-1.5 text-sm text-ink-muted transition-colors hover:text-ink";

interface FooterColumnProps {
  readonly id: string;
  readonly title: string;
  readonly links: readonly { readonly href: string; readonly label: string }[];
}

function FooterColumn({ id, title, links }: FooterColumnProps) {
  return (
    <nav aria-labelledby={id}>
      <h2 id={id} className="text-sm font-semibold text-ink">
        {title}
      </h2>
      <ul className="mt-4 space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={linkClasses}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  const toolLinks = getRunnableTools().map((tool) => ({ href: `/tools/${tool.slug}`, label: tool.name }));

  return (
    <footer className="mt-24 border-t border-line bg-band">
      <Container width="wide">
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5 lg:py-16">
          <div className="sm:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">{siteConfig.description}</p>
            <a
              href={siteConfig.mainSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkClasses} mt-3`}
            >
              Visit the Code Nativex main site →
            </a>
          </div>

          <FooterColumn id="footer-tools" title="Available tools" links={toolLinks} />
          <FooterColumn id="footer-platform" title="Platform" links={footerNav.platform} />

          <div className="space-y-8">
            <FooterColumn id="footer-support" title="Support" links={footerNav.support} />
            <FooterColumn id="footer-legal" title="Legal" links={footerNav.legal} />
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-line py-6 text-sm text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Code Nativex. All rights reserved.</p>
          <p>Built for teams that ship.</p>
        </div>
      </Container>
    </footer>
  );
}
