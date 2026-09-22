# Code Nativex Tools + Live Website Audit Agent integration

This pack connects Code-Nativex-Tools to the separate CodeNativeX Live Audit Worker. It does **not** copy Playwright/Lighthouse into the Tools app.

## 1. Files to copy

Copy this pack over the root of your existing `Code-Nativex-Tools-main` project and allow the listed files to replace/add.

The important changed/additional files are:

- `src/app/tools/[slug]/page.tsx` — mounts the special full audit runner for Website Audit Agent.
- `src/lib/tools/definitions/website-audit.ts` — updates the tool copy for the real audit engine.
- `src/components/audit-agent/website-audit-runner.tsx` — URL + Quick/Standard/Custom form.
- `src/components/audit-agent/audit-live-view.tsx` — live polling + final report view.
- `src/app/tools/website-audit/[auditId]/page.tsx` — dedicated progress/report route.
- `src/app/api/tools/website-audit/*` — secure server-side proxy to the audit worker.
- `src/lib/audit-agent/*` — shared worker types, presets and server client.

No existing generic tools were changed beyond the Website Audit special case.

## 2. Configure the audit worker

In the **Live Website Audit Agent** worker `.env`, make sure you have something like:

```env
AUDIT_PORT=8088
AUDIT_BIND=127.0.0.1
AUDIT_API_TOKEN=put_a_random_token_here_at_least_32_characters_long
```

Start the worker using the command already documented by your audit project / Docker setup. The worker health endpoint should respond on:

`http://127.0.0.1:8088/health`

## 3. Configure Code Nativex Tools

Create or edit `.env.local` in the Tools project root:

```env
AUDIT_WORKER_BASE_URL=http://127.0.0.1:8088
AUDIT_WORKER_TOKEN=put_the_exact_same_value_as_AUDIT_API_TOKEN_here
```

Never prefix the worker token with `NEXT_PUBLIC_`. It must stay server-only.

## 4. Run Tools

```bash
npm install
npm run dev
```

Open:

`http://localhost:3000/tools/website-audit`

Submit an audit. The browser should redirect to:

`/tools/website-audit/<audit-id>`

That page polls the worker every ~2.5 seconds and renders the final `report.json` when the job completes.

## 5. Production

Deploy the audit worker separately on a Docker-capable host (Railway/Render/VPS/etc.). Example:

```env
AUDIT_WORKER_BASE_URL=https://audit-api.yourdomain.com
AUDIT_WORKER_TOKEN=the_same_private_worker_token
```

Set those as **server environment variables** on the deployed Tools project. The token is attached only inside Next.js API routes and is never sent to the browser.

## Notes

- The Tools frontend does not expose the worker token.
- The progress page does not fake a percentage; it displays the real worker stage/counters.
- Download buttons only appear for artifacts listed by the worker.
- Existing simple HTML-only audit code can remain in the repo, but the Website Audit page now uses this live worker integration instead.
