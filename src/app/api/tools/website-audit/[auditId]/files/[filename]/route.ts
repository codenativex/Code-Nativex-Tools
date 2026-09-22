import { auditArtifactPath, auditWorkerFetch } from "@/lib/audit-agent/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ auditId: string; filename: string }> }) {
  try {
    const { auditId, filename } = await params;
    const upstream = await auditWorkerFetch(auditArtifactPath(auditId, filename));
    if (!upstream.ok) return new Response("Artifact is not available.", { status: upstream.status });

    const headers = new Headers();
    const contentType = upstream.headers.get("content-type");
    const disposition = upstream.headers.get("content-disposition");
    if (contentType) headers.set("content-type", contentType);
    headers.set("content-disposition", disposition ?? `attachment; filename="${filename}"`);
    headers.set("cache-control", "no-store");
    headers.set("x-content-type-options", "nosniff");

    return new Response(upstream.body, { status: 200, headers });
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Could not download artifact.", { status: 400 });
  }
}
