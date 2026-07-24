import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { BRAND_NAME } from "@/lib/brand";
import { getSession, subscribeSession, setSession, setTokens, getRefreshToken } from "@/lib/session";
import { apiPost } from "@/lib/api-client";
import { useSetInitialPassword } from "@/lib/tracker-queries";
import { PasswordInput } from "@/components/tracker/PasswordInput";

export const Route = createFileRoute("/set-password")({
  ssr: false,
  head: () => ({ meta: [{ title: `Set your password — ${BRAND_NAME}` }] }),
  component: SetPasswordPage,
});

function useSession() {
  return useSyncExternalStore(subscribeSession, getSession, getSession);
}

function SetPasswordPage() {
  const navigate = useNavigate();
  const session = useSession();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const setInitialPassword = useSetInitialPassword();

  useEffect(() => {
    if (!session) {
      navigate({ to: "/auth" });
      return;
    }
    if (!session.mustSetPassword) {
      navigate({ to: session.role === "admin" ? "/admin" : "/dashboard" });
    }
  }, [session, navigate]);

  if (!session || !session.mustSetPassword) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 4) return toast.error("Password must be at least 4 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords don't match");
    setSubmitting(true);
    try {
      await setInitialPassword.mutateAsync({ newPassword });
      // The current access token still carries mustSetPassword:true — refresh
      // to get a token reflecting the password that was just set, otherwise
      // every other route keeps 403ing until natural token expiry.
      const refreshToken = getRefreshToken();
      const data = await apiPost<{ accessToken: string }>("/auth/refresh", { refreshToken });
      setTokens(data.accessToken);
      setSession({ ...session!, mustSetPassword: false });
      toast.success("Password set — welcome in!");
      navigate({ to: session!.role === "admin" ? "/admin" : "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message || "Could not set password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/brand/hero-aisle.jpg)" }}
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/40 bg-white/25 p-8 shadow-2xl backdrop-blur-xl"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-white drop-shadow-sm">
          Set your password
        </h2>
        <p className="mt-1 text-sm text-white/90">
          This is your first time signing in — choose a password for your account before continuing.
        </p>

        <div className="mt-6 space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/90">New password</label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              inputClassName="w-full rounded-xl border border-white/50 bg-white/70 px-3.5 py-2.5 text-sm text-foreground outline-none ring-primary/30 transition placeholder:text-muted-foreground focus:bg-white focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/90">Confirm password</label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              inputClassName="w-full rounded-xl border border-white/50 bg-white/70 px-3.5 py-2.5 text-sm text-foreground outline-none ring-primary/30 transition placeholder:text-muted-foreground focus:bg-white focus:ring-2"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-95 disabled:opacity-60"
        >
          Set password &amp; continue
        </button>
      </form>
    </div>
  );
}
