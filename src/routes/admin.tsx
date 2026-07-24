import { createFileRoute, useNavigate } from "@tanstack/react-router";
<<<<<<< HEAD
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
=======
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
import type { DateRange } from "react-day-picker";
import {
  Inbox,
  CheckCheck,
  Users,
  Tag,
  Download,
  Send,
  LogOut,
  ArrowLeft,
  Clock,
  Lock,
  KeyRound,
  Plus,
  Pencil,
  Trash2,
  Paperclip,
  X,
  UserCog,
  Snowflake,
  Sun,
  Check,
  ChevronsUpDown,
  Bell,
  Menu,
  Save,
<<<<<<< HEAD
  Upload,
  Search,
=======
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
} from "lucide-react";
import { getSession, subscribeSession } from "@/lib/session";
import { logout, resetEmployeePassword } from "@/lib/auth-client";
import { BRAND_NAME } from "@/lib/brand";
import { ALLOWED_EXT } from "@/lib/attachment-rules";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Attachment, Employee, Admin, Ticket } from "@/lib/types";
import {
  useAdminTickets,
  useAdminReplyToTicket,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
<<<<<<< HEAD
  useBulkImportEmployees,
  type BulkImportResult,
=======
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
  useEmployees,
  useAdmins,
  useCreateAdmin,
  useUpdateAdmin,
  useDeleteAdmin,
  useResetAdminPassword,
  useAdminProfile,
  useAdminSetProfile,
  useDepartments,
  useNotifications,
  useUploadAttachment,
  useSendBroadcast,
  useProfile,
  useSetProfile,
  downloadTicketsCsv,
} from "@/lib/tracker-queries";
import { NotificationDotsProvider, useNotificationDots } from "@/lib/notification-dots";
import { connectSocket, disconnectSocket } from "@/lib/socket-client";
import { MediaComposer, AttachmentPreview } from "@/components/tracker/MediaComposer";
import { DateRangePicker } from "@/components/tracker/DateRangePicker";
import { SentAlertsTable } from "@/components/tracker/SentAlertsTable";
import { AvatarUpload, ChangePasswordSection } from "@/components/tracker/ProfileEditor";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
<<<<<<< HEAD
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
=======
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: `Admin — ${BRAND_NAME}` }] }),
  component: () => (
    <NotificationDotsProvider>
      <AdminPage />
    </NotificationDotsProvider>
  ),
});

type Tab =
  | "open"
  | "pending"
  | "closed"
  | "employees"
  | "credentials"
  | "admins"
  | "notifications"
  | "titles"
  | "download"
  | "broadcast";

const TABS: { key: Tab; label: string; icon: typeof Inbox; masterOnly?: boolean }[] = [
  { key: "open", label: "Opened issues", icon: Inbox },
  { key: "pending", label: "Underlying queries", icon: Clock },
  { key: "closed", label: "Closed issues", icon: CheckCheck },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "employees", label: "Employee codes", icon: Users },
  { key: "credentials", label: "Manage credentials", icon: KeyRound, masterOnly: true },
  { key: "admins", label: "Admin & Legal", icon: UserCog, masterOnly: true },
  { key: "titles", label: "Issue titles", icon: Tag },
  { key: "download", label: "Download data", icon: Download },
  { key: "broadcast", label: "Send alert", icon: Send },
];

function useSession() {
  return useSyncExternalStore(subscribeSession, getSession, getSession);
}

<<<<<<< HEAD
function formatAdminDepartments(departments?: { id: number; name: string }[]): string {
  if (!departments || departments.length === 0) return "Admin console";
  if (departments.length === 1) return `${departments[0].name} Admin`;
  if (departments.length <= 3) return `${departments.map((d) => d.name).join(", ")} Admin`;
  return `${departments.length} Departments Admin`;
}

=======
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
function AdminPage() {
  const navigate = useNavigate();
  const session = useSession();
  const [tab, setTab] = useState<Tab>("open");
  const [responding, setResponding] = useState<Ticket | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isUnread, clear } = useNotificationDots();
  const { data: profile } = useProfile();

  useEffect(() => {
    if (!session) navigate({ to: "/auth" });
<<<<<<< HEAD
    if (session?.mustSetPassword) navigate({ to: "/set-password" });
=======
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
    if (session?.role === "employee") navigate({ to: "/dashboard" });
  }, [session, navigate]);

  useEffect(() => {
    // See dashboard.tsx for why this doesn't disconnect on cleanup.
    connectSocket();
  }, []);

  const visibleTabs = TABS.filter((t) => !t.masterOnly || session?.isMaster);

  const navBody = (
    <>
      <div className="flex items-center gap-2 px-6 py-6">
        <img src="/brand/logo.png" alt={BRAND_NAME} className="h-9 w-auto object-contain" />
        <div>
          <p className="text-sm font-semibold">{BRAND_NAME}</p>
          <p className="text-xs text-muted-foreground">
<<<<<<< HEAD
            {session?.isMaster ? "Master Admin" : formatAdminDepartments(session?.departments)}
=======
            {session?.isMaster ? "Master Admin" : session?.departmentName ? `${session.departmentName} Admin` : "Admin console"}
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
          </p>
        </div>
      </div>
      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setResponding(null);
              setTab(t.key);
              clear(t.key === "broadcast" ? "broadcast" : (t.key as any));
              setMobileOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              tab === t.key
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            {isUnread(t.key as any) && (
              <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-destructive" />
            )}
          </button>
        ))}
      </nav>
      <div className="border-t p-3">
        <div className="flex items-center gap-2 rounded-xl px-1 py-1">
          <button
            onClick={() => setProfileOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-muted"
            title="View profile"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={session?.name ?? "Admin"} className="h-full w-full object-cover" />
              ) : (
                (session?.name ?? "A").slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{session?.name}</p>
              <p className="truncate font-mono text-xs text-muted-foreground">{session?.code}</p>
            </div>
          </button>
          <button
            onClick={async () => {
              await logout();
              disconnectSocket();
              navigate({ to: "/auth" });
            }}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
<<<<<<< HEAD
    <div className="relative flex h-screen flex-col overflow-hidden md:flex-row">
=======
    <div className="relative flex min-h-screen flex-col overflow-hidden md:flex-row">
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
      {/* Store-photo colour wash (same photo/tone as the login page) plus soft glow accents */}
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center opacity-[0.14]"
        style={{ backgroundImage: "url(/brand/hero-aisle.jpg)" }}
      />
      <div className="pointer-events-none fixed -right-16 -top-16 h-[26rem] w-[26rem] rounded-full bg-[#dc3c32] opacity-20 blur-3xl blob-float-a" />
      <div className="pointer-events-none fixed -bottom-24 right-1/4 h-[24rem] w-[24rem] rounded-full bg-[#14a05a] opacity-20 blur-3xl blob-float-b" />
      {/* Mobile top bar — the desktop <aside> below is hidden under md, so this is
          the only way to navigate, view notifications, or log out on a phone. */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-card px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <img src="/brand/logo.png" alt={BRAND_NAME} className="h-7 w-auto object-contain" />
          <span className="text-sm font-semibold">{BRAND_NAME}</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="relative rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
              {visibleTabs.some((t) => isUnread(t.key as any)) && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
            <div className="flex h-full flex-col">{navBody}</div>
          </SheetContent>
        </Sheet>
      </div>

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-card/70 backdrop-blur md:flex">
        {navBody}
      </aside>

      <main className="flex-1 overflow-y-auto">
<<<<<<< HEAD
        <div className="flex min-h-full flex-col">
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
=======
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
          {responding ? (
            <RespondView ticket={responding} onBack={() => setResponding(null)} />
          ) : (
            <>
              {tab === "open" && <TicketList status="open" onRespond={setResponding} />}
              {tab === "pending" && <TicketList status="pending" onRespond={setResponding} />}
              {tab === "closed" && <TicketList status="closed" />}
              {tab === "employees" && <EmployeesView />}
              {tab === "credentials" && session?.isMaster && <CredentialsView />}
              {tab === "admins" && session?.isMaster && <AdminsView currentAdminId={session.identifier} />}
              {tab === "notifications" && <AdminNotificationsView />}
              {tab === "titles" && <TitlesView />}
              {tab === "download" && <DownloadView />}
              {tab === "broadcast" && <BroadcastView />}
            </>
          )}
        </div>
        <p className="pb-6 text-center text-xs text-muted-foreground">© 2026 Made by Yash Soni</p>
<<<<<<< HEAD
        </div>
=======
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
      </main>

      {profileOpen && session && (
        <AdminProfilePanel code={session.code ?? ""} name={session.name} onClose={() => setProfileOpen(false)} />
      )}
    </div>
  );
}

function AdminProfilePanel({ code, name, onClose }: { code: string; name: string; onClose: () => void }) {
  const { data: profile } = useProfile();
  const setProfile = useSetProfile();
  const [profileName, setProfileName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [officeMail, setOfficeMail] = useState(profile?.officeMail ?? "");

  useEffect(() => {
    setProfileName(profile?.name ?? "");
    setPhone(profile?.phone ?? "");
    setOfficeMail(profile?.officeMail ?? "");
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await setProfile.mutateAsync({ name: profileName, phone, officeMail });
    toast.success("Profile saved");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-sm">
      <form onSubmit={save} className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mb-5 flex items-center gap-3">
          <AvatarUpload name={name || code} />
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Your profile</h3>
            <p className="text-xs text-muted-foreground">Admin account details</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Admin Code</label>
            <input
              value={code}
              disabled
              className="w-full rounded-xl border bg-background px-3.5 py-2.5 font-mono text-sm outline-none ring-primary/30 focus:ring-2 disabled:opacity-60"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Name</label>
            <input
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Phone number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
              className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Office mail</label>
            <input
              type="email"
              value={officeMail}
              onChange={(e) => setOfficeMail(e.target.value)}
              placeholder="you@company.com"
<<<<<<< HEAD
              disabled={!!profile?.officeMail}
              className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2 disabled:opacity-60"
            />
            {profile?.officeMail && (
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Locked after first entry — contact the master admin to change it.
              </p>
            )}
=======
              className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
            />
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</label>
            <ChangePasswordSection />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-primary py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
        >
          <Save className="h-4 w-4" /> Save profile
        </button>
      </form>
    </div>
  );
}

function AdminNotificationsView() {
  const { data: notifications = [] } = useNotifications();

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Notifications</h1>
      <p className="mt-2 text-sm text-muted-foreground">New queries registered in your department.</p>

      {notifications.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed bg-card/40 py-16 text-center text-sm text-muted-foreground">
          No notifications yet.
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TicketList({
  status,
  onRespond,
}: {
  status: "open" | "pending" | "closed";
  onRespond?: (t: Ticket) => void;
}) {
  const { data: tickets = [] } = useAdminTickets(status);
  const heading =
    status === "open" ? "Opened issues" : status === "pending" ? "Underlying queries" : "Closed issues";
  const subline =
    status === "pending"
      ? "Replied to — waiting for the employee to close them."
      : undefined;
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
        {subline ? ` · ${subline}` : ""}
      </p>

      {tickets.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed bg-card/40 py-16 text-center text-sm text-muted-foreground">
          No {status} tickets yet.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono font-semibold text-foreground">{t.id}</span>
                    <span>·</span>
                    <span className="rounded-full bg-muted px-2 py-0.5">{t.departmentName}</span>
                    <span>·</span>
                    <span className="font-mono">{t.employeeCode}</span>
                    <span>·</span>
                    <span>{new Date(t.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">{t.title}</p>
                  <div className="mt-3">
                    <AttachmentPreview a={t.attachment} />
                  </div>
                  {t.replies.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {t.replies.map((r) => (
                        <div
                          key={r.id}
                          className={cn(
                            "rounded-xl border p-3",
                            r.from === "admin" ? "bg-primary/5" : "bg-accent/30",
                          )}
                        >
                          <p className="mb-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                            {r.from === "admin" ? "Admin" : "Employee"}
                          </p>
                          <AttachmentPreview a={r.attachment} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {status === "open" && onRespond && (
                    <button
                      onClick={() => onRespond(t)}
                      className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
                    >
                      Respond
                    </button>
                  )}
                  {/* Note: no "Close Query" action here — closing a query is
                      intentionally employee-only (see dashboard.tsx RecentQueries). */}
                  {status === "pending" && onRespond && (
                    <button
                      onClick={() => onRespond(t)}
                      className="rounded-xl border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                    >
                      Reply again
                    </button>
                  )}
                  {status === "closed" && (
                    <span
                      className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium"
                      style={{ color: "oklch(0.45 0.13 160)" }}
                    >
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RespondView({ ticket, onBack }: { ticket: Ticket; onBack: () => void }) {
  const replyToTicket = useAdminReplyToTicket();
  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono font-semibold text-foreground">{ticket.id}</span>
          <span>
            {ticket.departmentName} · {ticket.employeeCode}
          </span>
        </div>
        <p className="mt-2 text-sm font-medium">{ticket.title}</p>
        <div className="mt-4 rounded-xl border bg-muted/30 p-4">
          <AttachmentPreview a={ticket.attachment} />
        </div>
      </div>
      <h2 className="mb-3 mt-6 text-sm font-medium text-muted-foreground">Your response</h2>
      <MediaComposer
        onSubmit={async (a) => {
          await replyToTicket.mutateAsync({ ticketId: ticket.id, attachmentId: a.id });
          toast.success(`Reply sent · notified employee ${ticket.employeeCode}`);
          onBack();
        }}
      />
    </div>
  );
}

function EmployeesView() {
  const { data: tickets = [] } = useAdminTickets();
  const grouped = useMemo(() => {
    const map = new Map<string, { open: number; pending: number; closed: number; last: number }>();
    for (const t of tickets) {
      const g = map.get(t.employeeCode) ?? { open: 0, pending: 0, closed: 0, last: 0 };
      if (t.status === "open") g.open++;
      else if (t.status === "pending") g.pending++;
      else g.closed++;
      g.last = Math.max(g.last, new Date(t.updatedAt).getTime());
      map.set(t.employeeCode, g);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].last - a[1].last);
  }, [tickets]);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Employee codes</h1>
      <p className="mt-2 text-sm text-muted-foreground">Employees with active or historical tickets.</p>
      {grouped.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed bg-card/40 py-16 text-center text-sm text-muted-foreground">
          No employees yet.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-card shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Employee Code</th>
                <th className="px-5 py-3 text-left font-medium">Open</th>
                <th className="px-5 py-3 text-left font-medium">Underlying</th>
                <th className="px-5 py-3 text-left font-medium">Closed</th>
                <th className="px-5 py-3 text-left font-medium">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(([code, g]) => (
                <tr key={code} className="border-b last:border-0 transition hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono font-medium">{code}</td>
                  <td className="px-5 py-3">{g.open}</td>
                  <td className="px-5 py-3">{g.pending}</td>
                  <td className="px-5 py-3">{g.closed}</td>
                  <td className="px-5 py-3 text-muted-foreground">{new Date(g.last).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CredentialsView() {
  const { data: employees = [] } = useEmployees();
  const deleteEmployee = useDeleteEmployee();
  const updateEmployee = useUpdateEmployee();
<<<<<<< HEAD
  const bulkImport = useBulkImportEmployees();
  const [editing, setEditing] = useState<Employee | null>(null);
  const [creating, setCreating] = useState(false);
  const [resetting, setResetting] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) => e.code.toLowerCase().includes(q) || (e.label ?? "").toLowerCase().includes(q),
    );
  }, [employees, search]);

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportResult(null);
    try {
      const result = await bulkImport.mutateAsync(file);
      setImportResult(result);
      if (result.created.length > 0) {
        toast.success(`Imported ${result.created.length} new employee${result.created.length === 1 ? "" : "s"}`);
      } else {
        toast.error("No new employees were created — see details below");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      e.target.value = "";
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    const code = deleting.code;
    try {
      await deleteEmployee.mutateAsync(code);
      toast.success(`${code} deleted`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDeleting(null);
    }
  }
=======
  const [editing, setEditing] = useState<Employee | null>(null);
  const [creating, setCreating] = useState(false);
  const [resetting, setResetting] = useState<Employee | null>(null);
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e

  async function toggleActive(e: Employee) {
    const nextActive = !(e.isActive ?? true);
    await updateEmployee.mutateAsync({ code: e.code, patch: { isActive: nextActive } });
    toast.success(`${e.code} ${nextActive ? "unfrozen" : "frozen"}`);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Manage credentials</h1>
          <p className="mt-2 text-sm text-muted-foreground">
<<<<<<< HEAD
            Add employees, reset a forgotten password, or freeze/delete an account — visible only here, in the master admin console.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            onClick={() => importInputRef.current?.click()}
            disabled={bulkImport.isPending}
            className="inline-flex items-center gap-1.5 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-muted disabled:opacity-60"
          >
            <Upload className="h-4 w-4" /> {bulkImport.isPending ? "Importing…" : "Import from spreadsheet"}
          </button>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
          >
            <Plus className="h-4 w-4" /> New employee
          </button>
        </div>
      </div>

      {importResult && (
        <div className="mt-3 rounded-2xl border bg-card/60 p-4 text-sm">
          <div className="flex items-center justify-between">
            <p className="font-medium">Import results</p>
            <button
              onClick={() => setImportResult(null)}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-1 text-success" style={{ color: "oklch(0.45 0.13 160)" }}>
            {importResult.created.length} created
          </p>
          {importResult.skippedExisting.length > 0 && (
            <p className="mt-1 text-muted-foreground">
              {importResult.skippedExisting.length} already existed, skipped: {importResult.skippedExisting.join(", ")}
            </p>
          )}
          {importResult.skippedInvalid.length > 0 && (
            <p className="mt-1 text-destructive">
              {importResult.skippedInvalid.length} had an unusable code, skipped: {importResult.skippedInvalid.join(", ")}
            </p>
          )}
        </div>
      )}

=======
            Only the master admin can create, edit, or delete employee logins.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
        >
          <Plus className="h-4 w-4" /> New employee
        </button>
      </div>

>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
      {employees.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed bg-card/40 py-16 text-center text-sm text-muted-foreground">
          No employees yet — create the first one.
        </div>
      ) : (
<<<<<<< HEAD
        <>
          <div className="relative mt-6 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by employee code…"
              className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3.5 text-sm outline-none ring-primary/30 focus:ring-2"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
          {filteredEmployees.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed bg-card/40 py-16 text-center text-sm text-muted-foreground">
              No employee matches "{search}".
            </div>
          ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border bg-card shadow-sm">
=======
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-card shadow-sm">
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Employee Code</th>
                <th className="px-5 py-3 text-left font-medium">WhatsApp (Password)</th>
                <th className="px-5 py-3 text-left font-medium">Label</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
<<<<<<< HEAD
              {filteredEmployees.map((e) => {
=======
              {employees.map((e) => {
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
                const active = e.isActive ?? true;
                return (
                  <tr key={e.code} className="border-b last:border-0 transition hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono font-medium">{e.code}</td>
                    <td className="px-5 py-3 font-mono text-muted-foreground">{e.whatsappNumber ?? "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{e.label ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          active ? "bg-success/15" : "bg-destructive/15 text-destructive",
                        )}
                        style={active ? { color: "oklch(0.45 0.13 160)" } : undefined}
                      >
                        {active ? "Active" : "Frozen"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setEditing(e)}
                        className="mr-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-primary hover:bg-primary/10"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => setResetting(e)}
                        className="mr-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-primary hover:bg-primary/10"
                      >
                        <KeyRound className="h-3.5 w-3.5" /> Reset password
                      </button>
                      <button
                        onClick={() => toggleActive(e)}
                        className="mr-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-primary hover:bg-primary/10"
                      >
                        {active ? (
                          <>
                            <Snowflake className="h-3.5 w-3.5" /> Freeze
                          </>
                        ) : (
                          <>
                            <Sun className="h-3.5 w-3.5" /> Unfreeze
                          </>
                        )}
                      </button>
                      <button
<<<<<<< HEAD
                        onClick={() => setDeleting(e)}
=======
                        onClick={async () => {
                          if (confirm(`Delete ${e.code}? This cannot be undone.`)) {
                            try {
                              await deleteEmployee.mutateAsync(e.code);
                              toast.success(`${e.code} deleted`);
                            } catch (err) {
                              toast.error((err as Error).message);
                            }
                          }
                        }}
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
<<<<<<< HEAD
          )}
        </>
=======
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
      )}

      {(creating || editing) && (
        <EmployeeForm
          initial={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      {resetting && (
        <ResetPasswordForm employee={resetting} onClose={() => setResetting(null)} />
      )}
<<<<<<< HEAD

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. If this employee has existing tickets, deletion will be blocked — freeze the
              account instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
=======
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
    </div>
  );
}

function AdminsView({ currentAdminId }: { currentAdminId: string }) {
  const { data: admins = [] } = useAdmins();
  const deleteAdmin = useDeleteAdmin();
  const updateAdmin = useUpdateAdmin();
  const [editing, setEditing] = useState<Admin | null>(null);
  const [creating, setCreating] = useState(false);
  const [resetting, setResetting] = useState<Admin | null>(null);
<<<<<<< HEAD
  const [deleting, setDeleting] = useState<Admin | null>(null);

  async function confirmDelete() {
    if (!deleting) return;
    const code = deleting.code;
    try {
      await deleteAdmin.mutateAsync(deleting.id);
      toast.success(`${code} deleted`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDeleting(null);
    }
  }
=======
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e

  async function toggleActive(a: Admin) {
    try {
      await updateAdmin.mutateAsync({ id: a.id, patch: { isActive: !a.isActive } });
      toast.success(`${a.code} ${a.isActive ? "frozen" : "unfrozen"}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Admin & Legal</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create, edit, freeze, or delete admin accounts and assign their department.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
        >
          <Plus className="h-4 w-4" /> New admin
        </button>
      </div>

      {admins.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed bg-card/40 py-16 text-center text-sm text-muted-foreground">
          No admins yet.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-card shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Admin Code</th>
                <th className="px-5 py-3 text-left font-medium">Name</th>
                <th className="px-5 py-3 text-left font-medium">Department</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => {
                const isSelf = a.id === currentAdminId;
                return (
                  <tr key={a.id} className="border-b last:border-0 transition hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono font-medium">{a.code}</td>
                    <td className="px-5 py-3 text-muted-foreground">{a.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">
<<<<<<< HEAD
                      {a.isMaster
                        ? "All departments"
                        : a.departments.length > 0
                          ? a.departments.map((d) => d.name).join(", ")
                          : "—"}
=======
                      {a.isMaster ? "All departments" : (a.departmentName ?? "—")}
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          a.isActive ? "bg-success/15" : "bg-destructive/15 text-destructive",
                        )}
                        style={a.isActive ? { color: "oklch(0.45 0.13 160)" } : undefined}
                      >
                        {a.isActive ? "Active" : "Frozen"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setEditing(a)}
                        className="mr-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-primary hover:bg-primary/10"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => setResetting(a)}
                        className="mr-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-primary hover:bg-primary/10"
                      >
                        <KeyRound className="h-3.5 w-3.5" /> Reset password
                      </button>
                      {!isSelf && (
                        <>
                          <button
                            onClick={() => toggleActive(a)}
                            className="mr-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-primary hover:bg-primary/10"
                          >
                            {a.isActive ? (
                              <>
                                <Snowflake className="h-3.5 w-3.5" /> Freeze
                              </>
                            ) : (
                              <>
                                <Sun className="h-3.5 w-3.5" /> Unfreeze
                              </>
                            )}
                          </button>
                          <button
<<<<<<< HEAD
                            onClick={() => setDeleting(a)}
=======
                            onClick={async () => {
                              if (confirm(`Delete ${a.code}? This cannot be undone.`)) {
                                try {
                                  await deleteAdmin.mutateAsync(a.id);
                                  toast.success(`${a.code} deleted`);
                                } catch (err) {
                                  toast.error((err as Error).message);
                                }
                              }
                            }}
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {(creating || editing) && (
        <AdminForm
          initial={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      {resetting && <AdminResetPasswordForm admin={resetting} onClose={() => setResetting(null)} />}
<<<<<<< HEAD

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. If this admin has existing replies or sent alerts, deletion will be blocked —
              freeze the account instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
=======
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
    </div>
  );
}

function AdminForm({ initial, onClose }: { initial?: Admin; onClose: () => void }) {
  const isEdit = !!initial;
  const { data: departments = [] } = useDepartments();
  const [code, setCode] = useState(initial?.code ?? "");
<<<<<<< HEAD
  const [name, setName] = useState(initial?.name ?? "");
  const [isMaster, setIsMaster] = useState(initial?.isMaster ?? false);
  const [departmentIds, setDepartmentIds] = useState<number[]>(initial?.departments.map((d) => d.id) ?? []);
  const createAdmin = useCreateAdmin();
  const updateAdmin = useUpdateAdmin();

  function toggleDepartment(id: number) {
    setDepartmentIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

=======
  const [password, setPassword] = useState("");
  const [name, setName] = useState(initial?.name ?? "");
  const [isMaster, setIsMaster] = useState(initial?.isMaster ?? false);
  const [departmentId, setDepartmentId] = useState<number | "">(initial?.departmentId ?? "");
  const createAdmin = useCreateAdmin();
  const updateAdmin = useUpdateAdmin();

>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isEdit && initial) {
        await updateAdmin.mutateAsync({
          id: initial.id,
          patch: {
            name,
<<<<<<< HEAD
            ...(initial.isMaster ? {} : { departmentIds }),
=======
            ...(initial.isMaster || departmentId === "" ? {} : { departmentId: Number(departmentId) }),
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
          },
        });
        toast.success(`${initial.code} updated`);
      } else {
<<<<<<< HEAD
        if (!isMaster && departmentIds.length === 0) return toast.error("Select at least one department");
        await createAdmin.mutateAsync({
          code,
          name,
          isMaster,
          departmentIds: isMaster ? undefined : departmentIds,
        });
        toast.success(`${code.toUpperCase()} created — they'll set their own password on first login`);
=======
        if (!isMaster && departmentId === "") return toast.error("Select a department");
        await createAdmin.mutateAsync({
          code,
          password,
          name,
          isMaster,
          departmentId: isMaster ? undefined : Number(departmentId),
        });
        toast.success(`${code.toUpperCase()} created`);
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
      }
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">
            {isEdit ? `Edit ${initial?.code}` : "New admin"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Admin Code</label>
            <input
              value={code}
              disabled={isEdit}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="KN-09"
              className="w-full rounded-xl border bg-background px-3.5 py-2.5 font-mono text-sm uppercase outline-none ring-primary/30 focus:ring-2 disabled:opacity-60"
            />
          </div>
<<<<<<< HEAD
=======
          {!isEdit && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
              />
            </div>
          )}
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
            />
          </div>
          {!isEdit && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isMaster}
                onChange={(e) => setIsMaster(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              Master admin (sees every department)
            </label>
          )}
          {!isMaster && (
            <div>
<<<<<<< HEAD
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Departments — select one or more
              </label>
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border bg-background p-2">
                {departments.map((d) => (
                  <label
                    key={d.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/60"
                  >
                    <input
                      type="checkbox"
                      checked={departmentIds.includes(d.id)}
                      onChange={() => toggleDepartment(d.id)}
                      className="h-4 w-4 rounded border-input"
                    />
                    {d.name}
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setDepartmentIds(departments.map((d) => d.id))}
                  className="mt-1 px-2 text-xs font-medium text-primary hover:underline"
                >
                  Select all departments
                </button>
              </div>
=======
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : "")}
                className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
              >
                <option value="">Select a department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95"
          >
            {isEdit ? "Save changes" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

function AdminResetPasswordForm({ admin, onClose }: { admin: Admin; onClose: () => void }) {
  const [newPassword, setNewPassword] = useState("");
  const resetPassword = useResetAdminPassword();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await resetPassword.mutateAsync({ id: admin.id, newPassword });
      toast.success(`Password reset for ${admin.code}`);
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">Reset password · {admin.code}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">New password</label>
        <input
          type="text"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
        />
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

function EmployeeForm({ initial, onClose }: { initial?: Employee; onClose: () => void }) {
  const isEdit = !!initial;
  const [code, setCode] = useState(initial?.code ?? "");
  const [whatsappNumber, setWhatsappNumber] = useState(initial?.whatsappNumber ?? "");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [officeMail, setOfficeMail] = useState("");
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const { data: profile } = useAdminProfile(initial?.code ?? "", isEdit);
  const setAdminProfile = useAdminSetProfile();

  useEffect(() => {
    setOfficeMail(profile?.officeMail ?? "");
  }, [profile]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isEdit && initial) {
        await updateEmployee.mutateAsync({ code: initial.code, patch: { whatsappNumber, label } });
        await setAdminProfile.mutateAsync({ identifier: initial.code, patch: { officeMail } });
        toast.success(`${initial.code} updated`);
      } else {
        await createEmployee.mutateAsync({ code, whatsappNumber, label });
<<<<<<< HEAD
        toast.success(`${code.toUpperCase()} created — they'll set their own password on first login`);
=======
        toast.success(`${code.toUpperCase()} created — password defaults to their WhatsApp number`);
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
      }
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">
            {isEdit ? `Edit ${initial?.code}` : "New employee"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Employee Code
            </label>
            <input
              value={code}
              disabled={isEdit}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Username"
              className="w-full rounded-xl border bg-background px-3.5 py-2.5 font-mono text-sm uppercase outline-none ring-primary/30 focus:ring-2 disabled:opacity-60"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
<<<<<<< HEAD
              WhatsApp number
=======
              WhatsApp number (this is also their password)
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
            </label>
            <input
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+91••••••••••"
              className="w-full rounded-xl border bg-background px-3.5 py-2.5 font-mono text-sm outline-none ring-primary/30 focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Label (optional)
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Downtown flagship"
              className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
            />
          </div>
          {isEdit && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Office mail</label>
              <input
                type="email"
                value={officeMail}
                onChange={(e) => setOfficeMail(e.target.value)}
                placeholder="employee@company.com"
                className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
              />
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95"
          >
            {isEdit ? "Save changes" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ResetPasswordForm({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const [newPassword, setNewPassword] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await resetEmployeePassword(employee.code, newPassword);
      toast.success(`Password reset for ${employee.code}`);
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">Reset password · {employee.code}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">New password</label>
        <input
          type="text"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
        />
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

function TitlesView() {
  const { data: tickets = [] } = useAdminTickets();
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Issue titles</h1>
      <p className="mt-2 text-sm text-muted-foreground">All reported issues at a glance.</p>
      {tickets.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed bg-card/40 py-16 text-center text-sm text-muted-foreground">
          No issues yet.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-card shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Ticket</th>
                <th className="px-5 py-3 text-left font-medium">Title</th>
                <th className="px-5 py-3 text-left font-medium">Department</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b last:border-0 transition hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono text-xs">{t.id}</td>
                  <td className="px-5 py-3">{t.title}</td>
                  <td className="px-5 py-3 text-muted-foreground">{t.departmentName}</td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        t.status === "open"
                          ? "bg-warning/15"
                          : t.status === "pending"
                            ? "bg-primary/10 text-primary"
                            : "bg-success/15",
                      )}
                      style={
                        t.status === "open"
                          ? { color: "oklch(0.45 0.15 75)" }
                          : t.status === "closed"
                            ? { color: "oklch(0.45 0.13 160)" }
                            : undefined
                      }
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DownloadView() {
  const [range, setRange] = useState<DateRange>(() => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 1);
    return { from, to };
  });

  async function download() {
    if (!range.from || !range.to) return toast.error("Pick a date range first");
    try {
      await downloadTicketsCsv(range.from, range.to);
      toast.success("Export downloaded");
    } catch {
      toast.error("Export failed");
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Download data</h1>
      <p className="mt-2 text-sm text-muted-foreground">Export the ticket log as CSV for a date range.</p>
      <div className="mt-6">
        <DateRangePicker range={range} onChange={setRange} />
      </div>
      <div className="mt-8 rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground">
          <Download className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Dataset (CSV)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ticket ID, employee code, department, title, status, and timestamps for the selected range.
        </p>
        <button
          onClick={download}
          className="mt-5 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
        >
          Download CSV
        </button>
      </div>
    </div>
  );
}

function BroadcastView() {
  const { data: employees = [] } = useEmployees();
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const uploadAttachment = useUploadAttachment();
  const sendBroadcast = useSendBroadcast();

  function toggleCode(code: string) {
    setSelectedCodes((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  function selectAll() {
    setSelectedCodes(employees.map((e) => e.code));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const a = await uploadAttachment.mutateAsync({ kind: "file", file: f, fileName: f.name });
      setAttachment(a);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      e.target.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedCodes.length === 0 || !msg.trim()) {
      return toast.error("Select at least one employee and enter a message");
    }
    try {
      await Promise.all(
        selectedCodes.map((code) =>
          sendBroadcast.mutateAsync({
            targetType: "employee",
            targetEmployeeCode: code,
            message: msg,
            attachmentId: attachment?.id,
          }),
        ),
      );
      toast.success(`Alert sent to ${selectedCodes.length} ${selectedCodes.length === 1 ? "employee" : "employees"}`);
      setSelectedCodes([]);
      setMsg("");
      setAttachment(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Send alert</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Broadcast a message to one or more employees' Alerts tab.
      </p>
      <form
        onSubmit={submit}
        className="mt-8 max-w-xl space-y-4 rounded-2xl border bg-card p-6 shadow-sm"
      >
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Employees ({selectedCodes.length} selected)
            </label>
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-medium text-primary hover:underline"
            >
              Send to all
            </button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl border bg-background px-3.5 py-2.5 text-left text-sm outline-none ring-primary/30 focus:ring-2"
              >
                <span className={selectedCodes.length === 0 ? "text-muted-foreground" : undefined}>
                  {selectedCodes.length === 0 ? "Search or select employees…" : `${selectedCodes.length} selected`}
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search employees…" />
                <CommandList>
                  <CommandEmpty>No employees found.</CommandEmpty>
                  <CommandGroup>
                    {employees.map((e) => (
                      <CommandItem key={e.code} value={`${e.code} ${e.label ?? ""}`} onSelect={() => toggleCode(e.code)}>
                        <Check
                          className={cn("h-4 w-4", selectedCodes.includes(e.code) ? "opacity-100" : "opacity-0")}
                        />
                        <span className="font-mono">{e.code}</span>
                        {e.label && <span className="text-xs text-muted-foreground">· {e.label}</span>}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedCodes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectedCodes.map((code) => (
                <Badge key={code} variant="secondary" className="gap-1 font-mono">
                  {code}
                  <button
                    type="button"
                    onClick={() => toggleCode(code)}
                    className="ml-0.5 rounded-full hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Message</label>
          <textarea
            rows={5}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Type your alert…"
            className="w-full resize-none rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Attachment (optional)
          </label>
          {attachment ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3">
              <AttachmentPreview a={attachment} />
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-background hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed bg-muted/30 px-4 py-3 text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5">
              <Paperclip className="h-4 w-4" />
              <span>
                Attach a file · max 5MB · {ALLOWED_EXT.join(", ")} · no .zip
              </span>
              <input
                type="file"
                hidden
                accept={ALLOWED_EXT.map((e) => "." + e).join(",")}
                onChange={handleFile}
              />
            </label>
          )}
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
        >
          <Send className="h-4 w-4" /> Send alert
        </button>
      </form>

      <h2 className="mt-10 text-lg font-semibold tracking-tight">Sent Alerts</h2>
      <SentAlertsTable />
    </div>
  );
}
