import type { Metadata } from "next";

import { LegalDocumentView } from "@/components/legal/legal-document";
import { JsonLd } from "@/components/seo/json-ld";
import { termsDocument } from "@/lib/legal/terms";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = buildPageMetadata({
  title: termsDocument.title,
  description: termsDocument.description,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <LegalDocumentView document={termsDocument} path="/terms" />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: termsDocument.title, path: "/terms" },
        ])}
      />
    </>
  );
}
