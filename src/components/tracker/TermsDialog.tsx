import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BRAND_NAME } from "@/lib/brand";

// Placeholder content mirrored from TERMS_AND_GUIDELINES.md (repo root) —
// keep the two in sync if this is edited. Swap in real legal copy before
// this is shown to real employees in production.
export function TermsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Terms and Guidelines</DialogTitle>
          <DialogDescription>{BRAND_NAME} — internal ticketing tool. Draft placeholder, pending final review.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm leading-relaxed text-foreground">
          <section>
            <h3 className="font-semibold">1. Purpose of this tool</h3>
            <p className="mt-1 text-muted-foreground">
              {BRAND_NAME} is provided solely for work-related use by authorized employees and administrators to
              report issues, request support, and receive updates.
            </p>
          </section>
          <section>
            <h3 className="font-semibold">2. Your account</h3>
            <p className="mt-1 text-muted-foreground">
              Your login code and password are personal to you — do not share them. You are responsible for all
              activity submitted under your account. Report suspected unauthorized access immediately.
            </p>
          </section>
          <section>
            <h3 className="font-semibold">3. Acceptable use</h3>
            <p className="mt-1 text-muted-foreground">
              Use this tool only for genuine work-related issues and communications. Do not submit false,
              misleading, or offensive content, and do not attempt to access another employee's tickets or any
              admin-only feature you haven't been granted.
            </p>
          </section>
          <section>
            <h3 className="font-semibold">4. Content you submit</h3>
            <p className="mt-1 text-muted-foreground">
              Text, photo, video, voice, or file attachments you submit are stored so the relevant admin(s) can
              review and respond. Don't include sensitive personal information beyond what's necessary to describe
              the issue.
            </p>
          </section>
          <section>
            <h3 className="font-semibold">5. Notifications</h3>
            <p className="mt-1 text-muted-foreground">
              By using this tool you agree to receive in-app notifications and alerts related to your tickets and
              any broadcasts sent to you.
            </p>
          </section>
          <section>
            <h3 className="font-semibold">6. Changes</h3>
            <p className="mt-1 text-muted-foreground">
              These terms may be updated from time to time. Continued use after an update means you accept the
              revised terms.
            </p>
          </section>
          <p className="text-xs italic text-muted-foreground">
            Full version: TERMS_AND_GUIDELINES.md. This is placeholder draft copy pending real legal review.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
