import { company } from "./company";
import type { LegalDocument } from "./types";

export const termsDocument: LegalDocument = {
  title: "Terms and Conditions",
  description:
    "The terms that apply when you use Code Nativex Tools, including acceptable use, the limits of our audit results, plans and billing, and liability.",
  updatedAt: "2026-09-21",
  intro: `These terms govern your use of the Code Nativex Tools platform. By using the platform you agree to them. If you are agreeing on behalf of an organisation, you confirm you are authorised to do so.`,
  sections: [
    {
      id: "the-service",
      heading: "1. The service",
      blocks: [
        {
          type: "paragraph",
          text: `Code Nativex Tools provides web-based tools that analyse content you submit and return a structured result. Tools marked "Live" are available now. Tools marked "In development" are published as specifications only and cannot be run.`,
        },
        {
          type: "paragraph",
          text: "We may add, change or withdraw individual tools. Where a change materially reduces what a paid plan provides, we will give notice before it takes effect.",
        },
      ],
    },
    {
      id: "acceptable-use",
      heading: "2. Acceptable use",
      blocks: [
        { type: "paragraph", text: "You agree that you will not:" },
        {
          type: "list",
          items: [
            "Submit a URL you do not own or have permission to analyse.",
            "Use the platform to probe, scan or map infrastructure you are not authorised to test.",
            "Attempt to bypass rate limits, authentication or any other technical control.",
            "Resell or redistribute results as your own product without a written agreement with us.",
            "Use the platform in a way that breaks any applicable law, or that infringes anyone's rights.",
          ],
        },
        {
          type: "paragraph",
          text: "We may suspend access immediately where we reasonably believe this section has been broken.",
        },
      ],
    },
    {
      id: "results",
      heading: "3. Results and their limits",
      blocks: [
        {
          type: "paragraph",
          text: "Our tools report what they observed at the moment they ran. They are automated checks, not a professional audit, and they do not guarantee search rankings, legal or regulatory compliance, accessibility conformance, or the security of any system.",
        },
        {
          type: "paragraph",
          text: "You are responsible for deciding whether to act on a recommendation. Results are provided for your own assessment and should not be presented to third parties as a certification.",
        },
      ],
    },
    {
      id: "accounts",
      heading: "4. Accounts",
      blocks: [
        {
          type: "paragraph",
          text: "Some plans require an account. You are responsible for keeping your credentials secure and for everything done under your account. Tell us promptly if you believe it has been accessed without your permission.",
        },
      ],
    },
    {
      id: "plans",
      heading: "5. Plans, billing and cancellation",
      blocks: [
        {
          type: "paragraph",
          text: "Paid plans are billed in advance, monthly or annually, at the price shown when you subscribe. Unless stated otherwise, prices exclude any applicable taxes.",
        },
        {
          type: "paragraph",
          text: "You may cancel at any time. Cancellation takes effect at the end of the period you have already paid for, and we do not charge a cancellation fee. We do not provide refunds for partial periods except where required by law.",
        },
        {
          type: "paragraph",
          text: "We may change prices with at least 30 days' notice. A change never applies to a period you have already paid for.",
        },
      ],
    },
    {
      id: "intellectual-property",
      heading: "6. Intellectual property",
      blocks: [
        {
          type: "paragraph",
          text: `The platform, its interface and its underlying software remain the property of ${company.legalName}. You keep all rights in the content you submit and in the reports produced for you, and you may use those reports freely within your own organisation and for your clients.`,
        },
      ],
    },
    {
      id: "availability",
      heading: "7. Availability",
      blocks: [
        {
          type: "paragraph",
          text: "We aim to keep the platform available but do not guarantee uninterrupted service on any plan that does not include a written service level. Maintenance, third-party outages and the behaviour of the sites you analyse can all affect a run.",
        },
      ],
    },
    {
      id: "liability",
      heading: "8. Liability",
      blocks: [
        {
          type: "paragraph",
          text: "To the fullest extent permitted by law, we are not liable for indirect or consequential loss, loss of profit, revenue, data or goodwill arising from your use of the platform. Our total liability in any twelve-month period is limited to the amount you paid us in that period, or one hundred US dollars if you are on a free plan.",
        },
        {
          type: "paragraph",
          text: "Nothing in these terms limits liability that cannot be limited by law.",
        },
      ],
    },
    {
      id: "changes",
      heading: "9. Changes to these terms",
      blocks: [
        {
          type: "paragraph",
          text: "We may update these terms. The date at the top of this page shows when they last changed substantively, and continued use after a change means you accept the updated terms.",
        },
      ],
    },
    {
      id: "law",
      heading: "10. Governing law",
      blocks: [
        {
          type: "paragraph",
          text: `These terms are governed by the laws of ${company.governingLaw}, and the courts of that jurisdiction have exclusive jurisdiction over any dispute.`,
        },
      ],
    },
    {
      id: "contact",
      heading: "11. Contact",
      blocks: [
        {
          type: "paragraph",
          text: `Questions about these terms can be sent to ${company.contactEmail}, or to ${company.legalName}, ${company.registeredAddress}.`,
        },
      ],
    },
  ],
};
