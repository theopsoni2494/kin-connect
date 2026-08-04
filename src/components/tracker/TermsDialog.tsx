import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BRAND_NAME } from "@/lib/brand";

// Mirrored from TERMS_AND_GUIDELINES.md (repo root) — keep the two in sync if this is edited.
interface Section {
  heading: string;
  before?: string[];
  bulletIntro?: string;
  bullets?: string[];
  after?: string[];
}

const SECTIONS: Section[] = [
  {
    heading: "1. Purpose of Kin Connect",
    before: [
      "Kin Connect is an internal communication and issue-management platform for authorised K&M employees and administrators. It enables employees to submit operational issues, requests, reports, and supporting files to the appropriate department, receive responses, track progress, and access internal alerts.",
      "Kin Connect is provided solely for legitimate work-related use.",
    ],
  },
  {
    heading: "2. Acceptance of These Terms",
    before: [
      "By logging in to or using Kin Connect, you confirm that you have read, understood, and agree to these Terms and Conditions, together with applicable internal K&M policies, workplace rules, and management instructions.",
      "If you do not agree to these Terms, do not use Kin Connect. Contact your manager or an authorised administrator for assistance.",
    ],
  },
  {
    heading: "3. Eligibility and Account Access",
    before: ["Access to Kin Connect is limited to authorised K&M employees, department administrators, and master administrators."],
    bulletIntro: "You must:",
    bullets: [
      "Use only the account assigned to you.",
      "Keep your login code, password, and device access secure.",
      "Not share, transfer, sell, or permit another person to use your account.",
      "Notify an authorised administrator promptly if you suspect unauthorised use of your account.",
      "Provide accurate information when submitting tickets, updating a profile, or otherwise using the platform.",
    ],
    after: ["K&M may suspend, deactivate, reset, or revoke access where necessary for security, operational, disciplinary, legal, or administrative reasons."],
  },
  {
    heading: "4. Appropriate Use",
    before: ["You may use Kin Connect only for K&M-related operational matters, including reporting issues, requesting assistance, replying to tickets, managing authorised work items, and receiving internal alerts."],
    bulletIntro: "You must not:",
    bullets: [
      "Submit false, misleading, abusive, threatening, discriminatory, obscene, or unlawful content.",
      "Upload content unrelated to work or content that violates another person's privacy, intellectual-property rights, or confidentiality.",
      "Use the platform to harass, intimidate, impersonate, or unfairly target another person.",
      "Attempt to bypass access controls, access another person's account, alter records without permission, or interfere with the platform's operation.",
      "Upload malware, malicious code, or harmful files.",
      "Use Kin Connect for personal commercial activity, spam, political campaigning, or unauthorised advertising.",
    ],
  },
  {
    heading: "5. Tickets, Replies, and Alerts",
    before: [
      "Employees may submit work-related tickets to the appropriate department using text, photos, or files. Department administrators may respond to tickets within their assigned responsibilities. Employees are responsible for reviewing replies and closing a ticket when the issue is satisfactorily resolved.",
      "Submitting a ticket does not guarantee an immediate response, resolution, approval, reimbursement, or other outcome.",
      "Urgent safety, medical, security, or emergency situations must also be reported through the appropriate emergency, security, or management channels. Users must not rely only on Kin Connect in an emergency.",
      "Alerts sent through Kin Connect are internal operational communications. Users must follow valid management instructions communicated through the platform, subject to applicable law and K&M policy.",
    ],
  },
  {
    heading: "6. Content and Attachments",
    before: ["You are responsible for the information and files you submit through Kin Connect. Only upload material that is necessary for the reported issue or internal communication."],
    bulletIntro: "You must not upload:",
    bullets: [
      "Personal, customer, supplier, payroll, financial, medical, or identification information unless it is necessary and you are authorised to do so.",
      "Confidential information that you are not authorised to share.",
      "Files containing viruses, malicious software, or unlawful content.",
      "Images, recordings, or documents that unnecessarily capture individuals or private areas.",
    ],
    after: ["By submitting content, you allow K&M to store, review, route, use, and retain it as reasonably necessary to operate Kin Connect, investigate issues, maintain records, protect security, and meet operational and legal obligations."],
  },
  {
    heading: "7. Privacy and Monitoring",
    before: [
      "Kin Connect may process account details, profile information, ticket content, uploaded attachments, alerts, technical logs, and activity records to operate and secure the platform.",
      "Users should not expect Kin Connect to be a private personal messaging service. K&M may access, review, preserve, disclose, or investigate information in Kin Connect where reasonably necessary for operational management, security, legal compliance, audits, investigations, or enforcement of these Terms.",
      "Personal data will be collected, used, stored, and protected in accordance with applicable data-protection and other relevant laws of the Democratic Republic of the Congo, as well as K&M's internal privacy and information-security policies.",
    ],
  },
  {
    heading: "8. Administrator Responsibilities",
    before: ["Administrators must use their access only for legitimate business purposes and within their authorised role."],
    bulletIntro: "Administrators must not:",
    bullets: [
      "Access, disclose, modify, or use employee information without a legitimate business need.",
      "Share ticket content, account information, or attachments outside authorised channels.",
      "Use administrative access to retaliate against, discriminate against, or unfairly target any employee.",
      "Create, alter, freeze, reset, or delete accounts except as authorised by K&M policy.",
    ],
    after: ["Administrative activity may be recorded and reviewed for security, audit, and operational purposes."],
  },
  {
    heading: "9. Security",
    before: [
      "K&M takes reasonable measures to protect Kin Connect, but no digital system can be guaranteed completely secure or uninterrupted.",
      "Users must use reasonable care to protect access to the platform, including keeping passwords confidential, locking shared devices, and reporting suspicious activity promptly.",
      "Unauthorised access, attempted misuse, or interference with Kin Connect may result in suspension of access, disciplinary action, termination of employment or engagement, and legal action where appropriate.",
    ],
  },
  {
    heading: "10. Intellectual Property",
    before: [
      "Kin Connect, its branding, software, interfaces, workflows, and related materials are owned by or licensed to K&M.",
      "You receive a limited, non-transferable right to use Kin Connect solely for authorised internal work purposes. You may not copy, reverse engineer, modify, distribute, sell, or commercially exploit any part of Kin Connect without K&M's written permission.",
    ],
  },
  {
    heading: "11. Availability and Changes",
    before: [
      "K&M may modify, suspend, restrict, or discontinue any part of Kin Connect at any time, including features, access permissions, storage limits, or these Terms.",
      "K&M may update these Terms when necessary. Continued use of Kin Connect after updated Terms are made available means that you accept the revised Terms.",
    ],
  },
  {
    heading: "12. Disclaimer and Limitation of Liability",
    before: [
      'Kin Connect is provided for internal operational use on an "as available" basis. While K&M aims to keep the platform reliable and accurate, it does not guarantee uninterrupted availability, error-free operation, or immediate resolution of every reported issue.',
      "To the extent permitted by applicable law in the Democratic Republic of the Congo, K&M is not liable for indirect, incidental, special, or consequential loss arising from use of, inability to use, or reliance on Kin Connect.",
      "Nothing in these Terms limits rights or liabilities that cannot legally be limited under applicable law.",
    ],
  },
  {
    heading: "13. Suspension and Termination",
    before: [
      "K&M may suspend or terminate access immediately if it reasonably believes that a user has violated these Terms, created a security risk, misused the platform, left the organisation, or no longer requires access.",
      "Termination of platform access does not remove K&M's right to retain records where required for legitimate operational, legal, security, or audit purposes.",
    ],
  },
  {
    heading: "14. Governing Law and Jurisdiction",
    before: [
      "These Terms are governed by the laws of the Democratic Republic of the Congo.",
      "Any dispute relating to Kin Connect, these Terms, or use of the platform shall be submitted to the competent courts of Kinshasa, Democratic Republic of the Congo, unless applicable law requires otherwise.",
    ],
  },
  {
    heading: "15. Contact",
    before: [
      "For questions about Kin Connect, these Terms, account access, or privacy concerns, contact:",
      "Email: info@kinmarche.com",
      "Phone: +243 89 144 1111",
      "Address: 11 Avenue De La Presse Immeuble Regina, Boulevard du 30 Juin Kinshasa, Democratic Republic of the Congo",
    ],
  },
];

export function TermsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
          <DialogDescription>
            {BRAND_NAME} — Effective Date: 05 August 2026 — Operated by Kin Marché ("K&M", "we", "us", or "our")
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm leading-relaxed text-foreground">
          {SECTIONS.map((s) => (
            <section key={s.heading}>
              <h3 className="font-semibold">{s.heading}</h3>
              {s.before?.map((p) => (
                <p key={p} className="mt-1 text-muted-foreground">
                  {p}
                </p>
              ))}
              {s.bulletIntro && <p className="mt-1 text-muted-foreground">{s.bulletIntro}</p>}
              {s.bullets && (
                <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {s.after?.map((p) => (
                <p key={p} className="mt-1 text-muted-foreground">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
