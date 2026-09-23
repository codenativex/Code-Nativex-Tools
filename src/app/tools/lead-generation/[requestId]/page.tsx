import type { Metadata } from "next";
import { LeadGenerationLiveView } from "@/components/lead-agent/lead-generation-live-view";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Lead Generation Progress | Code Nativex Tools",
  robots: { index: false, follow: false },
};

export default async function LeadGenerationProgressPage({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  return (
    <>
      <section className="border-b border-line bg-page-header">
        <Container width="wide" className="py-8 sm:py-10">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Tools", path: "/tools" }, { name: "Lead Generation Agent", path: "/tools/lead-generation" }, { name: "Progress", path: `/tools/lead-generation/${requestId}` }]} />
          <h1 className="mt-5 text-2xl font-semibold text-ink sm:text-3xl">Lead Generation Agent</h1>
          <p className="mt-2 text-sm text-ink-muted">Live discovery, verification and scoring progress from the connected agent.</p>
        </Container>
      </section>
      <Container width="wide" className="py-10 sm:py-14"><LeadGenerationLiveView requestId={requestId} /></Container>
    </>
  );
}
