import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loginEmployee, loginAdmin } from "@/lib/auth-client";
import { getSession } from "@/lib/session";
import { BRAND_NAME } from "@/lib/brand";
import { ShieldCheck, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PasswordInput } from "@/components/tracker/PasswordInput";
import { TermsDialog } from "@/components/tracker/TermsDialog";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: `Sign in — ${BRAND_NAME}` },
      { name: "description", content: "Sign in to the issue tracker." },
    ],
  }),
  component: AuthPage,
});

type Role = "employee" | "admin";

function AuthPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("employee");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [termsOpen, setTermsOpen] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return toast.error("Please agree to the Terms and Guidelines to continue");
    setSubmitting(true);
    try {
      if (role === "admin") {
        await loginAdmin(id, password);
        navigate({ to: getSession()?.mustSetPassword ? "/set-password" : "/admin" });
        return;
      }
      await loginEmployee(id, password);
      navigate({ to: getSession()?.mustSetPassword ? "/set-password" : "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message || "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Store-photo backdrop (hero-aisle fits every viewport, incl. mobile) — kept light on the dimming/blur so the photo stays clearly visible, with just enough contrast for the white text and glass card to stay legible */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/brand/hero-aisle.jpg)" }}
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <div className="relative z-10 grid w-full max-w-5xl gap-8 lg:grid-cols-2">
        <div className="hidden flex-col justify-between text-white lg:flex">
          <div className="flex items-center gap-2">
            <div className="flex h-10 items-center justify-center rounded-xl bg-white/90 px-2 py-1.5 backdrop-blur ring-1 ring-white/30">
              <img src="/brand/logo.png" alt={BRAND_NAME} className="h-full w-auto object-contain" />
            </div>
            <span className="text-2xl font-bold tracking-tight">{BRAND_NAME}</span>
          </div>
          <div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              3R.<br />Report, Response, Resolve.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85">
              Admin - Unified Solutions
            </p>
          </div>
          <p className="text-xs text-white/70">© 2026 Made by Yash Soni</p>
        </div>

        {/* Glass login card */}
        <form
          onSubmit={submit}
          className="w-full rounded-3xl border border-white/40 bg-white/25 p-8 shadow-2xl backdrop-blur-xl"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-white drop-shadow-sm">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-white/90">Sign in to continue.</p>

          {/* Role selector */}
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-white/25 p-1 ring-1 ring-white/40">
            <button
              type="button"
              onClick={() => {
                setRole("employee");
                setId("");
                setPassword("");
              }}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition",
                role === "employee"
                  ? "bg-white text-primary shadow-sm"
                  : "text-white/90 hover:bg-white/20",
              )}
            >
              <UserIcon className="h-4 w-4" /> Department
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("admin");
                setId("");
                setPassword("");
              }}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition",
                role === "admin"
                  ? "bg-white text-primary shadow-sm"
                  : "text-white/90 hover:bg-white/20",
              )}
            >
              <ShieldCheck className="h-4 w-4" /> Admin
            </button>
          </div>

          <div className="mt-6 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/90">
                {role === "admin" ? "Admin Code" : "Employee Code"}
              </label>
              <input
                value={id}
                onChange={(e) => setId(e.target.value.toUpperCase())}
                placeholder={role === "admin" ? "KN-01" : "Username"}
                className="w-full rounded-xl border border-white/50 bg-white/70 px-3.5 py-2.5 text-sm text-foreground outline-none ring-primary/30 transition placeholder:text-muted-foreground focus:bg-white focus:ring-2"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/90">Password</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                inputClassName="w-full rounded-xl border border-white/50 bg-white/70 px-3.5 py-2.5 text-sm text-foreground outline-none ring-primary/30 transition placeholder:text-muted-foreground focus:bg-white focus:ring-2"
                iconClassName="text-muted-foreground/80"
              />
              {role === "employee" && (
                <p className="mt-1.5 text-[11px] text-white/80">
                  First time here? Leave the password blank to sign in — you'll be asked to set one right after.
                </p>
              )}
            </div>
          </div>

          <label className="mt-4 flex items-start gap-2 text-xs text-white/90">
            <Checkbox
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
              className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-white/60 bg-white/20 data-[state=checked]:border-white data-[state=checked]:bg-primary"
            />
            <span>
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setTermsOpen(true)}
                className="font-medium underline underline-offset-2 hover:text-white"
              >
                Terms and Guidelines
              </button>
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-95 disabled:opacity-60"
          >
            Sign in
          </button>
        </form>
      </div>

      <TermsDialog open={termsOpen} onOpenChange={setTermsOpen} />
    </div>
  );
}
