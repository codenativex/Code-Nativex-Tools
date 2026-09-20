import { company } from "./company";
import type { LegalDocument } from "./types";

export const privacyDocument: LegalDocument = {
  title: "Privacy Policy",
  description:
    "What Code Nativex Tools collects, why, how long we keep it, who it is shared with, and the rights you have over it.",
  updatedAt: "2026-09-21",
  intro: `This policy explains what we collect when you use Code Nativex Tools, why we collect it and what you can ask us to do with it. It describes the platform as it actually works today.`,
  sections: [
    {
      id: "who-we-are",
      heading: "1. Who we are",
      blocks: [
        {
          type: "paragraph",
          text: `${company.legalName}, ${company.registeredAddress}, is the controller of personal data processed through this platform. You can reach us at ${company.privacyEmail}.`,
        },
      ],
    },
    {
      id: "what-we-collect",
      heading: "2. What we collect",
      blocks: [
        { type: "paragraph", text: "We collect only what a given feature needs:" },
        {
          type: "list",
          items: [
            "Tool input — the URL or text you submit to a tool, for as long as it takes to produce your result.",
            "Technical data — IP address and request headers, used to apply rate limits and to detect abuse.",
            "Contact submissions — the name, email address and message you send us through the contact form.",
            "Account and billing data — where you hold a paid plan, the details needed to operate and bill it.",
          ],
        },
        {
          type: "paragraph",
          text: "We do not require an account to use the free tools, and we do not ask for more than the fields shown on each form.",
        },
      ],
    },
    {
      id: "why",
      heading: "3. Why we process it, and on what basis",
      blocks: [
        {
          type: "list",
          items: [
            "To perform the tool run you asked for — necessary to provide the service you requested.",
            "To keep the platform available and prevent abuse — our legitimate interest in a working, secure service.",
            "To answer your message — necessary to respond to an enquiry you initiated.",
            "To operate a paid plan and meet accounting obligations — contract performance and legal obligation.",
          ],
        },
      ],
    },
    {
      id: "retention",
      heading: "4. How long we keep it",
      blocks: [
        {
          type: "list",
          items: [
            "Audit reports on the free plan are generated for your request and returned to your browser; they are not stored on our servers afterwards.",
            "Saved report history exists only where you are on a plan that includes it, and you can delete it.",
            "Rate-limiting records are short-lived and expire automatically within minutes.",
            "Contact messages are kept for as long as needed to deal with your enquiry and any follow-up.",
            "Billing records are kept for the period required by tax and accounting law.",
          ],
        },
      ],
    },
    {
      id: "sharing",
      heading: "5. Who we share it with",
      blocks: [
        {
          type: "paragraph",
          text: "We do not sell personal data. We share it only with the service providers needed to run the platform — hosting, error monitoring, payment processing and email delivery — each under a contract that limits them to acting on our instructions. We may also disclose data where the law requires it.",
        },
      ],
    },
    {
      id: "third-party-sites",
      heading: "6. Sites you ask us to analyse",
      blocks: [
        {
          type: "paragraph",
          text: "When you run an audit, our servers request the URL you provided, identifying themselves as CodeNativexAuditAgent/1.0. That request appears in the target site's logs. Only submit URLs you own or have permission to analyse. Requests to private, loopback and link-local addresses are rejected before any connection is made.",
        },
      ],
    },
    {
      id: "cookies",
      heading: "7. Cookies and analytics",
      blocks: [
        {
          type: "paragraph",
          text: "The tools do not set advertising or cross-site tracking cookies. Where a feature needs to remember something — such as a signed-in session — the cookie is strictly necessary for that feature. If we introduce analytics, this page will be updated first and consent will be requested where the law requires it.",
        },
      ],
    },
    {
      id: "security",
      heading: "8. Security",
      blocks: [
        {
          type: "paragraph",
          text: "Traffic is served over HTTPS, input is validated on the server, secrets are held in server-side environment variables and never exposed to the browser, and outbound requests are constrained by timeouts, size limits and address filtering. No system is perfectly secure, but we design to keep the amount of data at risk small.",
        },
      ],
    },
    {
      id: "your-rights",
      heading: "9. Your rights",
      blocks: [
        {
          type: "paragraph",
          text: "Depending on where you live, you may have the right to access the personal data we hold about you, correct it, delete it, restrict or object to its processing, and receive it in a portable form. You can also complain to your local data protection authority.",
        },
        {
          type: "paragraph",
          text: `To exercise any of these, email ${company.privacyEmail}. We will respond within the period the applicable law allows.`,
        },
      ],
    },
    {
      id: "transfers",
      heading: "10. International transfers",
      blocks: [
        {
          type: "paragraph",
          text: "Our providers may process data outside your country. Where that happens, we rely on transfer mechanisms recognised by the applicable law, such as standard contractual clauses.",
        },
      ],
    },
    {
      id: "children",
      heading: "11. Children",
      blocks: [
        {
          type: "paragraph",
          text: "The platform is intended for professional use and is not directed at children under 16. We do not knowingly collect their data.",
        },
      ],
    },
    {
      id: "changes",
      heading: "12. Changes to this policy",
      blocks: [
        {
          type: "paragraph",
          text: "We will update this page when our processing changes, and the date at the top shows the last substantive revision.",
        },
      ],
    },
  ],
};
