/** Structured legal documents, so terms and privacy stay consistent. */

export interface LegalBlock {
  readonly type: "paragraph" | "list";
  readonly text?: string;
  readonly items?: readonly string[];
}

export interface LegalSection {
  readonly id: string;
  readonly heading: string;
  readonly blocks: readonly LegalBlock[];
}

export interface LegalDocument {
  readonly title: string;
  readonly description: string;
  /** ISO date of the last substantive change. */
  readonly updatedAt: string;
  readonly intro: string;
  readonly sections: readonly LegalSection[];
}
