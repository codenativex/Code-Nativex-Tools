/** Frequently asked questions, grouped for the /faq page and FAQPage JSON-LD. */

export interface FaqEntry {
  readonly question: string;
  /** Plain text — rendered as a paragraph and used verbatim in structured data. */
  readonly answer: string;
}

export interface FaqGroup {
  readonly id: string;
  readonly name: string;
  readonly entries: readonly FaqEntry[];
}

export const faqGroups: readonly FaqGroup[] = [
  {
    id: "platform",
    name: "The platform",
    entries: [
      {
        question: "What is Code Nativex Tools?",
        answer:
          "A suite of web development, SEO, auditing and AI-agent tools built by Code Nativex. Each tool takes a small amount of input, does real work on our servers, and returns a structured result you can act on.",
      },
      {
        question: "Do I need an account to use the tools?",
        answer:
          "No. Every tool marked Live runs without an account. Accounts arrive with the Pro plan, where saved history, scheduling and sharing need somewhere to keep your data.",
      },
      {
        question: "Why are some tools marked as in development?",
        answer:
          "We publish a tool's specification before its engine is finished, so you can see what is coming and tell us if it solves the wrong problem. A tool marked in development cannot be run and will never show placeholder results.",
      },
      {
        question: "How often are new tools added?",
        answer:
          "Continuously. The platform is built so a new tool is a configuration entry rather than a rewrite, which is why the catalogue can grow without the existing tools degrading.",
      },
    ],
  },
  {
    id: "audits",
    name: "Website audits",
    entries: [
      {
        question: "What does the Website Audit Agent actually check?",
        answer:
          "It requests your URL from our servers, parses the HTML that comes back, and runs deterministic checks across seven categories: SEO and metadata, content and structure, accessibility, technical and security, links, images, and mobile readiness. Every finding reports the value it read from your page.",
      },
      {
        question: "Does the audit run JavaScript?",
        answer:
          "Not today. The agent analyses the HTML your server returns, so content rendered entirely in the browser is not visible to it. A rendering-based agent is on the roadmap and will be listed separately rather than silently changing these results.",
      },
      {
        question: "How is the score calculated?",
        answer:
          "A passed check scores full marks, a warning scores half and an issue scores zero. A category score is the average across its checks, and the overall score is the average across every check. There is no weighting or curve, so you can reproduce the number from the findings list yourself.",
      },
      {
        question: "Can I audit a page behind a login or on my local machine?",
        answer:
          "No. Audits work on public URLs only. Requests to private, loopback and link-local addresses are rejected before any connection is made, which protects both your infrastructure and ours.",
      },
      {
        question: "Do you store my reports?",
        answer:
          "On the free Basic plan, no. The report is generated for your request and returned to your browser. Saved history is a Pro feature, and it is opt-in by design.",
      },
    ],
  },
  {
    id: "billing",
    name: "Plans and billing",
    entries: [
      {
        question: "Is there a free plan?",
        answer:
          "Yes. Basic is free and gives you every live tool with a daily audit limit. No card is required.",
      },
      {
        question: "What happens if I hit a limit?",
        answer:
          "The tool tells you plainly and says when the limit resets. Nothing is charged automatically and no work is silently dropped.",
      },
      {
        question: "Can I change or cancel a plan?",
        answer:
          "Yes, at any time. Changes take effect from the next billing period and we do not charge a cancellation fee.",
      },
      {
        question: "Do you offer annual billing?",
        answer:
          "Yes. Annual billing is discounted against the monthly rate, and the saving is shown on the pricing page.",
      },
    ],
  },
  {
    id: "privacy",
    name: "Privacy and security",
    entries: [
      {
        question: "What do you do with the URLs I submit?",
        answer:
          "They are used to perform the audit you asked for. We do not sell them, and on the Basic plan they are not retained after the report is returned.",
      },
      {
        question: "Will an audit affect my site?",
        answer:
          "An audit is a single page request, the same as one visitor loading the page. It respects timeouts and size limits and does not crawl the rest of your site.",
      },
      {
        question: "How do I identify your requests in my logs?",
        answer:
          "Audit requests are sent with the user agent CodeNativexAuditAgent/1.0, so you can recognise or allow them in your access logs.",
      },
    ],
  },
] as const;

export const allFaqEntries: readonly FaqEntry[] = faqGroups.flatMap((group) => group.entries);
