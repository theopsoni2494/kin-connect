import { useRef, useState } from "react";
import { Camera, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useProfile, useUploadAvatar, useChangePassword } from "@/lib/tracker-queries";

export function AvatarUpload({ name }: { name: string }) {
  const { data: profile } = useProfile();
  const uploadAvatar = useUploadAvatar();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      await uploadAvatar.mutateAsync(f);
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      e.target.value = "";
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-primary text-xl font-semibold text-primary-foreground"
        title="Change profile photo"
      >
        {profile?.avatarUrl ? (
          <img src={profile.avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          name.slice(0, 1).toUpperCase() || "?"
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
          <Camera className="h-5 w-5 text-white" />
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
    </>
  );
}

export function ChangePasswordSection() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const changePassword = useChangePassword();

  async function submit() {
    if (newPassword !== confirmPassword) return toast.error("New passwords don't match");
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOpen(false);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
      >
        <KeyRound className="h-3.5 w-3.5" /> Change password
      </button>
    );
  }

  function preventOuterSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="mt-1 space-y-2 rounded-xl border bg-muted/30 p-3">
      <p className="text-xs font-medium text-muted-foreground">Change password</p>
      <input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        onKeyDown={preventOuterSubmit}
        placeholder="Current password"
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
      />
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        onKeyDown={preventOuterSubmit}
        placeholder="New password"
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        onKeyDown={preventOuterSubmit}
        placeholder="Confirm new password"
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
      />
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          className="rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-95"
        >
          Update
        </button>
      </div>
    </div>
  );
}
