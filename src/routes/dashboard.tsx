import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Building2,
  Zap,
  Coffee,
  Briefcase,
  Truck,
  ShieldAlert,
  HeartPulse,
  History,
  LogOut,
  X,
  CheckCircle2,
  ArrowLeft,
  Inbox,
  Lock,
  UserCircle,
  Save,
  Bell,
  BellRing,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getSession, subscribeSession } from "@/lib/session";
import { logout } from "@/lib/auth-client";
import { BRAND_NAME } from "@/lib/brand";
import type { Department, Ticket } from "@/lib/types";
import {
  useDepartments,
  useMyTickets,
  useCreateTicket,
  useReplyToTicket,
  useCloseTicket,
  useEmployeeBroadcasts,
  useNotifications,
  useProfile,
  useSetProfile,
} from "@/lib/tracker-queries";
import { NotificationDotsProvider, useNotificationDots } from "@/lib/notification-dots";
import { connectSocket, disconnectSocket } from "@/lib/socket-client";
import { MediaComposer, AttachmentPreview } from "@/components/tracker/MediaComposer";
import { AvatarUpload, ChangePasswordSection } from "@/components/tracker/ProfileEditor";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSyncExternalStore } from "react";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({ meta: [{ title: `Dashboard — ${BRAND_NAME}` }] }),
  component: () => (
    <NotificationDotsProvider>
      <Dashboard />
    </NotificationDotsProvider>
  ),
});

const ICONS: Record<string, typeof Building2> = {
  infrastructure: Building2,
  energy_utility: Zap,
  hospitality: Coffee,
  workplace_operation: Briefcase,
  fleet_operation: Truck,
  health_security: HeartPulse,
  other: ShieldAlert,
};

function useSession() {
  return useSyncExternalStore(subscribeSession, getSession, getSession);
}

type View = "home" | "chat" | "recent" | "past" | "alerts" | "notifications";

function Dashboard() {
  const navigate = useNavigate();
  const session = useSession();
  const [department, setDepartment] = useState<Department | null>(null);
  const [view, setView] = useState<View>("home");
  const [confirmation, setConfirmation] = useState<{ ticketId: string } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!session) navigate({ to: "/auth" });
<<<<<<< HEAD
    if (session?.mustSetPassword) navigate({ to: "/set-password" });
=======
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
    if (session?.role === "admin") navigate({ to: "/admin" });
  }, [session, navigate]);

  useEffect(() => {
    // Intentionally no disconnect-on-cleanup here: the socket is a shared,
    // page-session-lifetime singleton also used by NotificationDotsProvider's
    // listeners. Tearing it down on this effect's cleanup caused spurious
    // reconnect storms (e.g. under React's dev-mode double-invoke of effects)
    // that orphaned other listeners. Logout explicitly disconnects instead.
    connectSocket();
  }, []);

  const employeeCode = session?.identifier ?? "";
  const { data: departments = [] } = useDepartments();
  const createTicket = useCreateTicket();
  const { clear } = useNotificationDots();

  function pickDepartment(d: Department) {
    setDepartment(d);
    setView("chat");
  }

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
      <Sidebar
        active={view}
        onHome={() => {
          setDepartment(null);
          setView("home");
        }}
        onRecent={() => {
          setDepartment(null);
          setView("recent");
          clear("recent");
        }}
        onPast={() => {
          setDepartment(null);
          setView("past");
          clear("past");
        }}
        onAlerts={() => {
          setDepartment(null);
          setView("alerts");
          clear("alerts");
        }}
        onNotifications={() => {
          setDepartment(null);
          setView("notifications");
          clear("notifications");
        }}
        onProfile={() => setProfileOpen(true)}
        onLogout={async () => {
          await logout();
          disconnectSocket();
          navigate({ to: "/auth" });
        }}
        name={session?.name ?? "User"}
        employeeCode={employeeCode}
      />

      <main className="flex-1 overflow-y-auto">
<<<<<<< HEAD
        <div className="flex min-h-full flex-col">
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
=======
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
          {view === "home" && !department && (
            <HomeGrid
              employeeCode={employeeCode}
              departments={departments}
              onPick={pickDepartment}
              onRecent={() => setView("recent")}
              onPast={() => setView("past")}
            />
          )}
          {view === "chat" && department && (
            <ChatView
              department={department}
              onBack={() => {
                setDepartment(null);
                setView("home");
              }}
              onSubmit={async (attachmentId) => {
                const ticket = await createTicket.mutateAsync({
                  departmentSlug: department.slug,
                  attachmentId,
                });
                setConfirmation({ ticketId: ticket.id });
              }}
            />
          )}
          {view === "recent" && <RecentQueries />}
          {view === "past" && <PastReplies />}
          {view === "alerts" && <AlertsView />}
          {view === "notifications" && <EmployeeNotificationsView />}
        </div>
        <p className="pb-6 text-center text-xs text-muted-foreground">© 2026 Made by Yash Soni</p>
<<<<<<< HEAD
        </div>
=======
>>>>>>> c115baa1c5dfb114d21ff384e0c1ee230498883e
      </main>

      {profileOpen && session && (
        <Modal onClose={() => setProfileOpen(false)}>
          <ProfilePanel identifier={session.identifier} onClose={() => setProfileOpen(false)} />
        </Modal>
      )}

      {confirmation && (
        <Modal onClose={() => setConfirmation(null)}>
          <div className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-7 w-7" style={{ color: "oklch(0.55 0.14 160)" }} />
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight">Response Submitted</h3>
            <p className="mt-1 text-sm text-muted-foreground">Your ticket has been logged.</p>
            <div className="mt-4 rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Ticket number</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-foreground">
                {confirmation.ticketId}
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setConfirmation(null);
                  setDepartment(null);
                  setView("recent");
                }}
                className="rounded-xl border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                View my queries
              </button>
              <button
                onClick={() => {
                  setConfirmation(null);
                  setDepartment(null);
                  setView("home");
                }}
                className="rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95"
              >
                Address another issue
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Sidebar({
  active,
  onHome,
  onRecent,
  onPast,
  onAlerts,
  onNotifications,
  onProfile,
  onLogout,
  name,
  employeeCode,
}: {
  active: View;
  onHome: () => void;
  onRecent: () => void;
  onPast: () => void;
  onAlerts: () => void;
  onNotifications: () => void;
  onProfile: () => void;
  onLogout: () => void;
  name: string;
  employeeCode: string;
}) {
  const { isUnread } = useNotificationDots();
  const { data: profile } = useProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items: { key: View; label: string; icon: typeof Briefcase; onClick: () => void; dot?: boolean }[] = [
    { key: "home", label: "Report an issue", icon: Briefcase, onClick: onHome },
    { key: "recent", label: "Recent queries", icon: Inbox, onClick: onRecent, dot: isUnread("recent") },
    { key: "alerts", label: "Alerts", icon: Bell, onClick: onAlerts, dot: isUnread("alerts") },
    {
      key: "notifications",
      label: "Notifications",
      icon: BellRing,
      onClick: onNotifications,
      dot: isUnread("notifications"),
    },
    { key: "past", label: "Past queries", icon: History, onClick: onPast, dot: isUnread("past") },
  ];

  const navBody = (
    <>
      {/* Header: profile button at top */}
      <div className="border-b p-3">
        <button
          onClick={onProfile}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-muted"
          title="View profile"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-sm">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              name.slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">{employeeCode}</p>
          </div>
          <UserCircle className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="flex items-center gap-2 px-6 py-5">
        <img src="/brand/logo.png" alt={BRAND_NAME} className="h-9 w-auto object-contain" />
        <div>
          <p className="text-sm font-semibold">{BRAND_NAME}</p>
          <p className="text-xs text-muted-foreground">Department portal</p>
        </div>
      </div>
      <nav className="mt-1 flex-1 space-y-1 px-3">
        {items.map((it) => {
          const isActive = active === it.key || (it.key === "home" && active === "chat");
          return (
            <button
              key={it.key}
              onClick={() => {
                it.onClick();
                setMobileOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <it.icon className="h-4 w-4" /> {it.label}
              {it.dot && <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-destructive" />}
            </button>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar — the desktop <aside> below is hidden under md, so this is
          the only way to navigate, view alerts/notifications, or log out on a phone. */}
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
              {items.some((it) => it.dot) && (
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
    </>
  );
}

function HomeGrid({
  employeeCode,
  departments,
  onPick,
  onRecent,
  onPast,
}: {
  employeeCode: string;
  departments: Department[];
  onPick: (d: Department) => void;
  onRecent: () => void;
  onPast: () => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="bg-gradient-primary bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
            Create the report
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Choose a department</p>
        </div>
        {employeeCode && (
          <span className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Employee Code: <span className="font-mono text-foreground">{employeeCode}</span>
          </span>
        )}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => {
          const Icon = ICONS[d.slug] ?? Building2;
          return (
            <button
              key={d.id}
              onClick={() => onPick(d)}
              className="group flex items-start gap-4 rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{d.name}</p>
              </div>
            </button>
          );
        })}
        <button
          onClick={onRecent}
          className="group flex items-start gap-4 rounded-2xl border border-dashed bg-card/40 p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Inbox className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Recent queries</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Open tickets and admin replies awaiting close.
            </p>
          </div>
        </button>
        <button
          onClick={onPast}
          className="group flex items-start gap-4 rounded-2xl border border-dashed bg-card/40 p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <History className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Past queries</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Closed tickets you've raised.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

function ChatView({
  department,
  onBack,
  onSubmit,
}: {
  department: Department;
  onBack: () => void;
  onSubmit: (attachmentId: string) => Promise<void>;
}) {
  const Icon = ICONS[department.slug] ?? Building2;
  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-sm">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{department.name}</h1>
          <p className="text-sm text-muted-foreground">
            We're on it — just tell us what's happening, in a few words.
          </p>
        </div>
      </div>
      <MediaComposer onSubmit={(a) => onSubmit(a.id)} />
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Pick one input method per submission. Files up to 5MB.
      </p>
    </div>
  );
}

function RecentQueries() {
  const { data: tickets = [] } = useMyTickets();
  const openAndPending = tickets.filter((t) => t.status !== "closed");
  const replyToTicket = useReplyToTicket();
  const closeTicket = useCloseTicket();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Recent queries</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tickets you've raised that are still open or awaiting close.
      </p>

      {openAndPending.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed bg-card/40 py-16 text-center text-sm text-muted-foreground">
          No active queries.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {openAndPending.map((t) => (
            <div key={t.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono font-semibold text-foreground">{t.id}</span>
                    <span>·</span>
                    <span className="rounded-full bg-muted px-2 py-0.5">{t.departmentName}</span>
                    <span>·</span>
                    <span className="font-mono">{t.employeeCode}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium">{t.title}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    t.status === "open" ? "bg-warning/15" : "bg-primary/10 text-primary",
                  )}
                  style={t.status === "open" ? { color: "oklch(0.45 0.15 75)" } : undefined}
                >
                  {t.status === "open" ? "Awaiting reply" : "Underlying"}
                </span>
              </div>

              <div className="mt-4 rounded-xl border bg-muted/30 p-3">
                <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Your report</p>
                <AttachmentPreview a={t.attachment} />
              </div>

              {t.replies.length > 0 && (
                <div className="mt-3 space-y-2">
                  {t.replies.map((r) => (
                    <div
                      key={r.id}
                      className={cn(
                        "rounded-xl border p-3",
                        r.from === "admin" ? "bg-primary/5" : "bg-accent/30",
                      )}
                    >
                      <p
                        className={cn(
                          "mb-2 text-xs uppercase tracking-wide",
                          r.from === "admin" ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {r.from === "admin" ? "Admin reply" : "Your reply"}
                      </p>
                      <AttachmentPreview a={r.attachment} />
                    </div>
                  ))}
                </div>
              )}

              {t.status === "pending" && (
                <div className="mt-4 space-y-3">
                  {replyingTo === t.id ? (
                    <div>
                      <MediaComposer
                        onSubmit={async (a) => {
                          await replyToTicket.mutateAsync({ ticketId: t.id, attachmentId: a.id });
                          toast.success("Reply sent");
                          setReplyingTo(null);
                        }}
                      />
                      <div className="mt-2 text-right">
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => setReplyingTo(t.id)}
                        className="rounded-xl border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                      >
                        Reply back
                      </button>
                      {/* "Close Query" is intentionally only available here — front-end/employee users only. */}
                      <button
                        onClick={async () => {
                          await closeTicket.mutateAsync(t.id);
                          toast.success(`Ticket ${t.id} closed`);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
                      >
                        <Lock className="h-3.5 w-3.5" /> Close this query
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AlertsView() {
  const { data: broadcasts = [] } = useEmployeeBroadcasts();

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Alerts</h1>
      <p className="mt-2 text-sm text-muted-foreground">Messages sent to you by admin.</p>

      {broadcasts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed bg-card/40 py-16 text-center text-sm text-muted-foreground">
          No alerts yet.
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {broadcasts.map((b) => (
            <div key={b.id} className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(b.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{b.message}</p>
              {b.attachment && (
                <div className="mt-3">
                  <AttachmentPreview a={b.attachment} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmployeeNotificationsView() {
  const { data: notifications = [] } = useNotifications();

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Notifications</h1>
      <p className="mt-2 text-sm text-muted-foreground">Updates on queries you've raised.</p>

      {notifications.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed bg-card/40 py-16 text-center text-sm text-muted-foreground">
          No notifications yet.
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BellRing className="h-4 w-4" />
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

function PastReplies() {
  const { data: tickets = [] } = useMyTickets("closed");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Past queries</h1>
          <p className="mt-2 text-sm text-muted-foreground">Closed tickets you've raised.</p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Resolved tickets
        </h2>
        {tickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card/40 py-16 text-center text-sm text-muted-foreground">
            Nothing here yet.
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t: Ticket) => (
              <details
                key={t.id}
                className="group rounded-2xl border bg-card shadow-sm transition hover:shadow-md"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">{t.id}</span>
                      <span>·</span>
                      <span>{t.departmentName}</span>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-foreground">{t.title}</p>
                  </div>
                  <span
                    className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium"
                    style={{ color: "oklch(0.45 0.13 160)" }}
                  >
                    Resolved
                  </span>
                </summary>
                <div className="border-t px-5 py-4">
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Your report</p>
                  <AttachmentPreview a={t.attachment} />
                  {t.replies.length > 0 && (
                    <>
                      <p className="mb-2 mt-4 text-xs uppercase tracking-wide text-muted-foreground">
                        Conversation
                      </p>
                      <div className="space-y-2">
                        {t.replies.map((r) => (
                          <div
                            key={r.id}
                            className={cn(
                              "rounded-xl border p-3",
                              r.from === "admin" ? "bg-primary/5" : "bg-accent/30",
                            )}
                          >
                            <p className="mb-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                              {r.from === "admin" ? "Admin" : "You"}
                            </p>
                            <AttachmentPreview a={r.attachment} />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProfilePanel({ identifier, onClose }: { identifier: string; onClose: () => void }) {
  const { data: profile } = useProfile();
  const setProfile = useSetProfile();
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [officeMail, setOfficeMail] = useState(profile?.officeMail ?? "");

  useEffect(() => {
    setName(profile?.name ?? "");
    setPhone(profile?.phone ?? "");
    setOfficeMail(profile?.officeMail ?? "");
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await setProfile.mutateAsync({ name, phone, officeMail });
    toast.success("Profile saved");
    onClose();
  }

  return (
    <form onSubmit={save} className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <AvatarUpload name={name || identifier} />
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Your profile</h3>
          <p className="text-xs text-muted-foreground">Managed for your department</p>
        </div>
      </div>

      <div className="space-y-3">
        <Field label="Employee Code">
          <input
            value={identifier}
            disabled
            className="w-full rounded-xl border bg-background px-3.5 py-2.5 font-mono text-sm outline-none ring-primary/30 focus:ring-2 disabled:opacity-60"
          />
        </Field>
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </Field>
        <Field label="Phone number">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 000 0000"
            className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
          />
        </Field>
        <Field label="Office mail">
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
        </Field>
        <Field label="Password">
          <ChangePasswordSection />
        </Field>
      </div>

      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-primary py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95"
      >
        <Save className="h-4 w-4" /> Save profile
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border bg-card shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
