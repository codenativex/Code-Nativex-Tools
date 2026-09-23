import type { Metadata } from "next";

import { AuditLiveView } from "@/components/audit-agent/audit-live-view";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Website Audit Progress | Code Nativex Tools",
  robots: { index: false, follow: false },
};

export default async function WebsiteAuditProgressPage({ params }: { params: Promise<{ auditId: string }> }) {
  const { auditId } = await params;
  return (
    <>
      <section className="border-b border-line bg-page-header">
        <Container width="wide" className="py-7 sm:py-9">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Tools", path: "/tools" }, { name: "Website Audit Agent", path: "/tools/website-audit" }, { name: "Audit", path: `/tools/website-audit/${auditId}` }]} />
        </Container>
      </section>
      <Container width="wide" className="py-8 sm:py-10">
        <AuditLiveView auditId={auditId} />
      </Container>
    </>
  );
}
