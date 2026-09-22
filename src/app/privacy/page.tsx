import type { Metadata } from "next";

import { LegalDocumentView } from "@/components/legal/legal-document";
import { JsonLd } from "@/components/seo/json-ld";
import { privacyDocument } from "@/lib/legal/privacy";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = buildPageMetadata({
  title: privacyDocument.title,
  description: privacyDocument.description,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <LegalDocumentView document={privacyDocument} path="/privacy" />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: privacyDocument.title, path: "/privacy" },
        ])}
      />
    </>
  );
}
