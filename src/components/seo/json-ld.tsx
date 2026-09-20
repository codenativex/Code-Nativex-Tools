interface JsonLdProps {
  readonly data: Record<string, unknown> | readonly Record<string, unknown>[];
}

/**
 * Renders schema.org JSON-LD. The payload is generated server-side from our own
 * data, never from user input.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
