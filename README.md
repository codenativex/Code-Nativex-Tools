# Code Nativex Tools

The tools and automation platform for Code Nativex: a directory of web development, SEO,
auditing and AI-agent tools, a learning center that explains each one, and a configuration-driven
architecture designed to carry hundreds of tools without the codebase degrading.

## Stack

- **Next.js 15** (App Router, React 19 Server Components)
- **TypeScript** in strict mode, with `noUncheckedIndexedAccess` and no unused locals
- **Tailwind CSS 4** with design tokens declared in `src/app/globals.css`
- **Zod** for server-side request validation
- **Cheerio** for HTML parsing inside the audit engine

No UI kit, no state library, no animation library. Everything visual is built from the
primitives in `src/components/ui`.

## Getting started

```bash
npm install
cp .env.example .env.local   # then set NEXT_PUBLIC_SITE_URL
npm run dev
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (flat config, includes `jsx-a11y` and `react-hooks`) |
| `npm run typecheck` | `tsc --noEmit` |

## Architecture

```
src/
├── app/                    Routes, metadata, API handlers
│   ├── api/contact/        Contact form delivery
│   ├── api/tools/<slug>/   One POST handler per runnable tool
│   ├── learning/           Learning center index and per-tool guides
│   ├── tools/              Directory and per-tool landing pages
│   ├── pricing/            Plans and feature comparison
│   ├── faq/                Grouped questions with FAQPage structured data
│   ├── contact/            Contact form (or an email fallback)
│   ├── terms/ privacy/     Legal documents
│   ├── robots.ts           Derived from the registry
│   └── sitemap.ts          Derived from the registry
├── components/
│   ├── audit/              Audit report rendering (scores, findings)
│   ├── contact/            Contact form
│   ├── faq/                Disclosure list
│   ├── layout/             Header, footer, logo
│   ├── learning/           Learning cards
│   ├── legal/              Structured legal-document renderer
│   ├── pricing/            Plan cards, billing toggle, comparison table
│   ├── seo/                JSON-LD renderer
│   ├── tools/              Directory, generic runner, form, progress, results
│   └── ui/                 Design-system primitives
└── lib/
    ├── api/                Response envelope and rate limiting
    ├── audit/              Fetching, analysis and result types
    │   └── checks/         One module per scored audit category
    ├── contact/            Topics and delivery configuration
    ├── faq/                Question content
    ├── legal/              Terms, privacy and the entity details they cite
    ├── meta-tags/          Meta tag generation
    ├── pricing/            Plans and the feature comparison matrix
    ├── seo/                Metadata and structured data builders
    ├── tools/              Tool registry, types, validation, result contracts
    └── utils/              Small shared helpers
```

### The tool contract

Every tool is a `ToolDefinition` (`src/lib/tools/types.ts`). One object describes its identity,
category, status, input fields, validation constraints, processing stages, result view,
learning content and SEO keywords. The directory, search, tool page, learning page, sitemap and
metadata are all derived from it.

Tools without a `runtime` are rendered as *in development*: documented, indexable, not runnable.
We publish the specification before the engine, never placeholder results.

### Adding a tool

1. Create `src/lib/tools/definitions/<slug>.ts` exporting a `ToolDefinition`.
2. Register it in the `tools` array in `src/lib/tools/registry.ts`.
3. If it runs, add `runtime` (endpoint, stages, `resultView`) and create
   `src/app/api/tools/<slug>/route.ts` using `jsonSuccess` / `jsonError` and a Zod schema.
4. If it needs a new result shape, extend the `ToolResult` union in `src/lib/tools/results.ts`
   and add the matching branch in `src/components/tools/tool-runner.tsx`.

Nothing else needs to change: routing, navigation, search, the sitemap and metadata pick the
tool up automatically.

### Adding an audit check

Audit categories live in `src/lib/audit/checks/`, one module per category, each exporting a
`CategorySpec`. Add a finding to the relevant module, or add a new module and register it in
`src/lib/audit/checks/index.ts`. Scoring, report rendering and the category list follow.

## Honest results

The Website Audit Agent fetches the URL you give it, server-side, and every finding reports a
value read from the response. Checks that cannot run are reported as such. No part of the
platform fabricates analysis or simulates work that did not happen — the processing stages
shown during a run describe real server-side steps, and the UI says that their timings are
indicative rather than measured.

## Security

- Audits accept public `http`/`https` URLs only. Hostnames resolving to loopback, link-local,
  private or reserved ranges are rejected before any request is made (SSRF protection in
  `src/lib/audit/fetch-page.ts`).
- Outbound fetches have a timeout, a response size cap and a content-type check.
- Every endpoint revalidates input with Zod; client-side validation is a convenience only.
- Generated markup is HTML-escaped before it is returned.
- Endpoints are rate limited per connection. The limiter is in-memory and therefore per
  instance — move it to a shared store before running more than one instance.
- Secrets belong in environment variables read on the server. Only `NEXT_PUBLIC_*` values,
  which are public by definition, reach the browser.
- Baseline security headers are set in `next.config.ts`.

## Accessibility and responsiveness

Semantic landmarks, a skip link, one `h1` per page, labelled controls with `aria-describedby`
wiring, visible focus rings, pointer targets of at least 24px, and `prefers-reduced-motion`
support. Layouts are authored mobile-first and verified from 320px upwards.

## Linking from the main Code Nativex site

The cards on codenativex.com/tools are meant to point here: **Try Now** to `/tools/<slug>`,
where the tool runs, and **Read More** to `/learning/<slug>`, the full write-up. Alternative
names — `site-audit`, `site-audit-agent`, `content-writer` — are redirected to their canonical
slugs in `next.config.ts`, so a link never lands on a 404 if the naming differs.

## Before launch

Three things in this repo are deliberate placeholders:

1. **Prices** in `src/lib/pricing/plans.ts` — replace with Code Nativex's real figures.
2. **Entity details** in `src/lib/legal/company.ts` — registered name, address, jurisdiction.
3. **Legal wording** in `src/lib/legal/terms.ts` and `privacy.ts` — these describe how the
   platform actually behaves, but they are not legal advice and need a lawyer's review.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes in production | Canonical URLs, sitemap, Open Graph |
| `NEXT_PUBLIC_MAIN_SITE_URL` | No | Link back to the main Code Nativex site |
| `CONTACT_WEBHOOK_URL` | No | Where contact submissions are POSTed as JSON. While unset, `/contact` shows an email address instead of a form rather than accepting a message it cannot deliver. |
