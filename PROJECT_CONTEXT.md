# PROJECT_CONTEXT.md

> Single source of truth for this project. Read this before making changes. Update it whenever a significant feature ships — see "Change Log" at the bottom.
> Last verified against the actual codebase: 2026-07-16.

---

# Project Overview

**Kin Connect** (working app name — the real business is "K&M", a supermarket/retail chain; the UI brand text is still "Kin Connect" and has not been renamed) is an internal issue-tracking and communication tool connecting store employees to department-specific admins and a master admin. An employee picks a department (Infrastructure, Energy & Utility, Hospitality, Workplace Operation, Fleet Operation, Health & Security, or "Any other Issue"), submits a query as text/voice/video/photo/file, and the query ("ticket") is routed to whichever admin(s) are assigned to that department. That admin replies (also as text or media), the employee sees the reply and can close the ticket once satisfied. Admins can also broadcast one-off "alerts" to one, many, or all employees.

The system is two independent apps: a TanStack Start (React 19) frontend and a hand-rolled Express + Drizzle ORM backend, talking to a Supabase-hosted Postgres database (used purely as a database + file storage host — **Supabase Auth is not used**; all login/session logic is custom JWT). Real-time delivery (new-ticket pop-ups, reply notifications, live ticket-list updates) runs over Socket.IO. There is no external notification integration active — WhatsApp (Twilio) and email (SMTP) code paths exist and are fully wired, but are currently unconfigured/dormant by design; only in-app (toast + sound + persisted feed) notifications are live.

Three roles exist: **Employee** (submits/tracks their own tickets), **Department Admin** (one admin ⇄ exactly one department, sees/replies only to that department's tickets), and **Master Admin** (unrestricted — sees every department, and is the only role that can create/edit/freeze/delete admin and employee accounts).

---

# Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | TanStack Start (React 19) + TanStack Router + Vite 8 |
| Frontend state/data | TanStack Query (React Query) v5 |
| Frontend styling | Tailwind CSS v4 (via `@tailwindcss/vite`), shadcn/ui component kit (Radix primitives) |
| Frontend realtime client | `socket.io-client` |
| Backend framework | Express 4 (Node.js, ESM, `type: "module"`) |
| Backend language | TypeScript, run via `tsx` in dev, compiled via `tsc` for prod |
| ORM | Drizzle ORM (`drizzle-orm` + `drizzle-kit` for migrations) |
| Database | PostgreSQL, hosted on **Supabase** (plain Postgres connection via `pg`, not Supabase's client SDK for queries) |
| File storage | **Supabase Storage** (bucket: `attachments`), accessed via `@supabase/supabase-js` server-side only |
| Auth | Custom — `bcryptjs` password hashing + `jsonwebtoken` (JWT) access/refresh tokens. **Not Supabase Auth.** |
| Realtime (server) | `socket.io` |
| Validation | `zod` (both frontend forms via `@hookform/resolvers` and backend request validation) |
| WhatsApp (dormant) | `twilio` SDK — code complete, disabled until `TWILIO_*` env vars are set |
| Email (dormant) | `nodemailer` (SMTP) — code complete, disabled until `SMTP_*` env vars are set |
| Deployment | Not yet deployed — local dev only (Vite dev server on :8080, Express on :4000) |

---

# Folder Structure

```
/ (root — frontend, TanStack Start)
├── public/
│   ├── brand/                  # Logo, favicon source, uploaded store photos (see UI Design Rules)
│   └── ...
├── src/
│   ├── routes/                 # TanStack Router file-based routes
│   │   ├── __root.tsx          # Root shell: <html>, favicon/meta tags, QueryClientProvider, Toaster
│   │   ├── index.tsx           # Landing/redirect route
│   │   ├── auth.tsx            # Combined login page (Employee / Admin toggle)
│   │   ├── dashboard.tsx       # Employee-facing app (all employee views + Sidebar)
│   │   └── admin.tsx           # Admin-facing app (all admin views + Sidebar, master-only tabs gated inline)
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives (button, dialog, sheet, command, popover, table, etc.) — generated, rarely hand-edited
│   │   └── tracker/             # App-specific components: MediaComposer (attachment recorder/uploader), DateRangePicker, SentAlertsTable, NotificationDot
│   ├── lib/
│   │   ├── api-client.ts       # fetch wrapper: attaches Bearer token, auto-refreshes on 401, throws ApiError
│   │   ├── auth-client.ts      # loginEmployee/loginAdmin/logout — writes to session.ts on success
│   │   ├── session.ts          # localStorage-backed session store + pub/sub (subscribeSession) for useSyncExternalStore
│   │   ├── socket-client.ts    # Singleton Socket.IO connection + useSocketEvent hook
│   │   ├── notification-dots.tsx # Global provider: listens to socket events, shows toasts, plays sound, tracks unread-dot state per tab
​│   │   ├── notification-sound.ts # Web Audio API two-tone chime (no audio asset file)
│   │   ├── tracker-queries.ts  # All React Query hooks (one per API endpoint) — see API Documentation
│   │   ├── types.ts            # Shared TS interfaces mirroring backend DTOs
│   │   ├── brand.ts            # BRAND_NAME / API_BASE_URL from Vite env
│   │   └── attachment-rules.ts # Allowed file extensions/size limits for uploads
│   ├── styles.css              # Tailwind v4 config, CSS custom properties (colors, gradients incl. --gradient-brand), @utility classes
│   ├── router.tsx / start.ts / server.ts  # TanStack Start framework plumbing
│   └── routeTree.gen.ts        # Auto-generated by TanStack Router — do not hand-edit
├── vite.config.ts
└── package.json

/server (backend, separate Node project — separate package.json/node_modules)
├── src/
│   ├── index.ts                # Entry point: creates HTTP server, wraps Express app, initSockets()
│   ├── app.ts                  # Express app assembly — route mounting ORDER MATTERS (see Development Guidelines)
│   ├── config/env.ts           # Zod-validated environment config, isXConfigured() flags
│   ├── db/
│   │   ├── schema.ts           # Drizzle table definitions — the actual schema source of truth
│   │   ├── client.ts           # pg Pool + drizzle() instance
│   │   ├── migrate.ts          # Runs migrations (npm run db:migrate)
│   │   ├── migrations/         # Generated SQL migration files (npm run db:generate)
│   │   ├── seed.ts             # Seeds departments + one demo employee + one master admin
│   │   └── seed-department-admins.ts  # One-off script: seeds the 7 department-scoped admin accounts
│   ├── routes/                 # Express routers — one file per resource, thin (validation + service calls + response)
│   ├── services/                # Business logic + DB queries, one file per domain
│   ├── middleware/
│   │   ├── requireAuth.ts      # Verifies JWT, sets req.auth; requireEmployee gate
│   │   ├── requireAdminDepartment.ts  # Sets req.scopedDepartmentId (null = master/unrestricted); requireMasterAdmin gate
│   │   ├── errorHandler.ts     # HttpError class, asyncHandler wrapper, central error middleware
│   │   └── upload.ts           # multer config for multipart file uploads
│   ├── notifications/
│   │   ├── types.ts            # NotificationJob / NotificationEventType / NotificationRecipient
│   │   ├── templates.ts        # renderMessage() — text templates per event type
│   │   ├── dispatcher.ts       # dispatchNotification() — writes outbox rows (inapp/whatsapp/email), attempts delivery
│   │   ├── whatsapp/twilio-provider.ts  # Twilio send wrapper, no-ops cleanly if unconfigured
│   │   └── email/mailer.ts     # SMTP send wrapper, no-ops cleanly if unconfigured
│   ├── sockets/
│   │   ├── index.ts            # initSockets() — JWT auth on connect, joins rooms (employee:<code>, admin:department:<id>)
│   │   └── emit.ts             # emitTicketCreated/emitTicketReplied/emitTicketClosed/emitBroadcastSent
│   └── utils/                  # ids.ts (ticket ID generator), csv.ts, validation.ts (all Zod schemas)
├── drizzle.config.ts
└── package.json
```

---

# Database Schema

All tables live in the `public` schema of the Supabase Postgres database. RLS is enabled on all tables with no policies (default-deny for the `anon`/`authenticated` Supabase API roles) — the app's own `postgres`-role connection bypasses RLS entirely, so this has zero effect on the app and exists purely to lock down Supabase's auto-REST API, which the app doesn't use.

| Table | Purpose | Key columns | Relationships |
|---|---|---|---|
| `departments` | The 7 fixed departments | `id` (smallserial PK), `slug` (unique), `name`, `sort_order` | Referenced by `tickets`, `admin_departments`, `broadcasts` |
| `employees` | Store employee accounts | `id` (uuid), `code` (unique, e.g. `STR-1042`), `password_hash` (independent credential — see Authentication Flow), `whatsapp_number` (contact info only), `label`, `is_active` | Referenced by `tickets.employee_code`, `broadcast_recipients`, `profiles.identifier` |
| `admins` | Admin + master admin accounts | `id` (uuid), `code` (unique login ID, e.g. `KN-01`, nullable at the DB level but always set by the app), `email` (unique, nullable — legacy/unused, kept for historical data + dormant email-notification fallback only), `password_hash`, `name`, `is_master` (bool), `is_active` | Linked to departments via `admin_departments` |
| `admin_departments` | Join table: which department(s) an admin is scoped to | `admin_id`, `department_id` (composite unique) | In practice every non-master admin has exactly **one** row here (UI enforces this; schema allows more) |
| `profiles` | Optional employee/admin profile fields, keyed by employee code or admin id | `identifier` (PK, = employee code or admin uuid), `name`, `phone`, `office_mail`, `avatar_path` (Supabase Storage path under `avatars/`, nullable) | 1:1 with `employees`/`admins` (by convention, not FK) — this is also where each admin's own profile lives, via `/profiles/me` |
| `attachments` | Uploaded/text content — the actual payload of a ticket, reply, or broadcast | `id` (uuid), `kind` (text/voice/video/photo/file), `storage_path` (Supabase Storage path, null for text), `text_content` (for kind=text), `mime_type`, `size_bytes` | Referenced by `tickets.attachment_id`, `replies.attachment_id`, `broadcasts.attachment_id` |
| `tickets` | The core issue/query record | `id` (text PK, e.g. `TKT-20260710-69553`), `employee_code` (FK, restrict), `department_id` (FK, restrict), `status` (open/pending/closed), `title`, `attachment_id` (FK), `closed_at`, `closed_by` | 1:many with `replies` |
| `replies` | Messages exchanged on a ticket, from either side | `id` (uuid), `ticket_id` (FK, cascade), `from_role` (user/admin), `admin_id` (nullable FK), `attachment_id` (FK) | Belongs to `tickets` |
| `broadcasts` | An admin-sent "alert" (one row per send action) | `id` (uuid), `sender_admin_id` (FK), `target_type` (employee/department/all), `message`, `attachment_id` (nullable FK) | 1:many with `broadcast_recipients` |
| `broadcast_recipients` | Fan-out: one row per employee who received a given broadcast | `broadcast_id` (FK, cascade), `employee_code` (FK), `read_at` | Composite unique on (broadcast_id, employee_code) |
| `notifications` | Outbox/audit log for every notification attempt, across all channels | `id` (uuid), `event_type` (ticket_created/ticket_replied/ticket_closed/broadcast_sent), `ticket_id`/`broadcast_id` (nullable FKs), `recipient_type` (employee/admin), `recipient_employee_code`/`recipient_admin_id`, `message` (rendered text, added in a later migration — older rows have `NULL`), `channel` (inapp/whatsapp/email), `status` (pending/sent/failed/skipped_no_config), `provider`, `provider_message_id`, `error_message` | This table is **both** the delivery audit log for WhatsApp/email **and** the data source for the in-app "Notifications" tab (filtered to `channel='inapp'`) |
| `refresh_tokens` | Hashed refresh tokens for session renewal | `id` (uuid), `subject_type` (employee/admin), `subject_id`, `token_hash` (SHA-256 of the raw token), `expires_at`, `revoked_at` | Not FK'd to employees/admins (subject_id is polymorphic) |

**Deletion behavior**: `employees`/`admins` deletion is `RESTRICT`ed by any existing tickets/replies/broadcasts they're linked to — the service layer catches Postgres FK-violation errors (code `23503`) and returns a friendly "freeze the account instead" error rather than a raw 500.

---

# Authentication Flow

**No Supabase Auth involved anywhere.** All three login flows share the same JWT infrastructure (`server/src/services/auth.service.ts`).

### Employee Login
`POST /v1/auth/employee/login { code, password }` → looks up `employees.code` (case-insensitive, normalized to uppercase), `bcrypt.compare` against `password_hash`. On success, issues a JWT access token (`{ sub: code, role: "employee" }`) + a refresh token (random 48-byte hex, SHA-256 hashed and stored in `refresh_tokens`). An employee's password is initially set to their WhatsApp number at account creation, but **is now decoupled from it** — see "Self-Service Password Change" below.

### Admin Login (Department Admin & Master Admin — same endpoint)
`POST /v1/auth/admin/login { code, password }` → looks up `admins.code` (an employee-code-style login ID, e.g. `KN-01`; case-insensitive, normalized to uppercase), verifies password. Admins no longer log in with `admins.email` — that column still exists in the DB (historical data, used only as an optional dormant-email-notification contact) but is not shown or required anywhere in the UI. **Department is resolved automatically at login** — there is no "select your department" step anymore (removed; see Important Decisions): the server queries `admin_departments` for that admin and bakes the department id straight into the access token (`{ sub: adminId, role: "admin", isMaster, departmentId }`). Master admins get `departmentId: undefined` (unrestricted). If a non-master admin somehow has zero departments assigned, login is rejected with 403 "no department assigned — contact the master admin".

### Token Refresh
`POST /v1/auth/refresh { refreshToken }` → validates the hashed token against `refresh_tokens` (not expired, not revoked), re-issues a fresh access token. For admins, this **re-resolves** their department from `admin_departments` each time (so a department reassignment takes effect on next refresh, not just next full login).

### Self-Service Password Change
`POST /v1/auth/change-password { currentPassword, newPassword }` (any authenticated employee or admin) → verifies `currentPassword` against their own `password_hash`, then sets a new one. This intentionally **decouples an employee's password from their WhatsApp number** (a change from the original design — the WhatsApp number field is now contact info only, no longer double-duty as the password). Master admin retains the separate "reset password" flow (`/v1/auth/admin/reset-employee-password`, `/v1/admin/admins/:id/reset-password`) to set a new password for anyone — this is **reset-only**, never "view current password"; passwords remain one-way bcrypt hashes and are never stored or displayed in recoverable form.

### JWT
- Access token: signed with `JWT_ACCESS_SECRET`, default TTL `15m`. Stateless — not re-checked against the DB per-request (only signature + expiry).
- Refresh token: opaque random string, TTL `30d` by default, hash stored server-side so it can be revoked (`POST /v1/auth/logout`).
- `requireAuth` middleware verifies the access token and populates `req.auth`. `requireAdminDepartment` then sets `req.scopedDepartmentId` (`null` = master/unrestricted, otherwise the admin's one department) — every admin-scoped query branches on this value, never on `req.auth` directly.

---

# User Roles

## Employee
**Can:**
- Log in with employee code + password (initially set to their WhatsApp number, but changeable — see below)
- Submit a new ticket (query) to any department, with text/voice/video/photo/file attachment
- View their own tickets (Recent = open/pending, Past = closed)
- Reply to their own open/pending tickets
- Close their own ticket once satisfied (**closing is intentionally employee-only** — no admin "close" endpoint exists)
- View Alerts (broadcasts) sent to them
- View Notifications (admin-reply pings) for their own tickets
- Edit their own profile (name, phone, office mail, profile photo) and change their own password (`/v1/auth/change-password`)

**Cannot:**
- See any other employee's tickets
- See or manage other employees'/admins' credentials
- Reply to tickets that aren't theirs, or in any other department they didn't submit to

## Department Admin (non-master)
**Can:**
- Log in with an admin code (e.g. `KN-02`) + password — automatically scoped to exactly one department at login
- View and reply to tickets **only in their assigned department**
- Send alerts to individual/multiple employees (any employee, not department-restricted)
- View employee list, create/edit/freeze/delete employees (**Manage Credentials — currently master-only, see below**)
- View their own Notifications (new-ticket pings for their department)
- Export CSV of tickets, scoped to their department
- Edit their own profile (name, phone, office mail, profile photo) and change their own password, same as employees

**Cannot:**
- See or act on tickets outside their department
- Access "Manage credentials" or "Admin & Legal" tabs (master-only)
- Reset another admin's password, freeze/delete admins, or create new admins
- Broadcast to "all employees" (master-only target type)
- Edit their own department assignment

## Master Admin
**Can:**
- Everything a department admin can, across **all** departments simultaneously (unrestricted `scopedDepartmentId = null`), including editing their own profile and changing their own password like any other account
- Full CRUD on admin accounts: create, edit (name/department), freeze/unfreeze, delete, reset password — via the "Admin & Legal" tab (`/v1/admin/admins/*`, all master-gated). Password reset only ever **sets a new password** — the current one is never viewable (it's a one-way bcrypt hash, by design)
- Full CRUD on employee accounts, including resetting any employee's password and editing their office mail (via `/v1/profiles/:identifier`, master-only)
- Broadcast to "all employees" in one action
- Export CSV across all departments
- Cannot freeze or delete **their own** account (guarded server-side)

---

# Current Features

✔ Employee login (code + independent, self-service password — no longer tied to WhatsApp number after initial creation)
✔ Admin login (admin code, e.g. `KN-01`, + password — not email), auto-scoped to department, no manual department picker
✔ Master admin (unrestricted, full account management)
✔ Self-service password change for employees and admins alike (`/auth/change-password`); master admin retains reset-only capability for anyone
✔ Profile photo upload for every role (employee, department admin, master admin) — local-device upload, stored in Supabase Storage, shown in the sidebar
✔ Ticket system: create, reply (both directions), close (employee-only), status lifecycle (open → pending → closed)
✔ Attachments: text, voice, video, photo, file — stored in Supabase Storage, served via time-limited signed URLs
✔ 7 fixed departments, each with exactly one scoped admin
✔ Department-scoped admin data isolation (verified via direct API testing)
✔ Employee dashboard: Create the report, Recent queries, Alerts, Notifications, Past queries, Profile
✔ Admin dashboard: Opened/Underlying/Closed issues, Notifications, Employee codes, Manage credentials (master-only), Admin & Legal (master-only), Issue titles, Download data (CSV), Send alert; admins/master admin can also edit their own profile
✔ Alerts (broadcasts): single employee, multiple employees (searchable multi-select), or all employees (master-only)
✔ In-app real-time notifications: Socket.IO push, toast pop-up, Web Audio chime, persisted "Notifications" tab, unread dot indicators — strictly separated from Alerts (different tab, different data source)
✔ Freeze/unfreeze (soft-disable) for both employees and admins, distinct from hard delete
✔ Self-protection guards: an admin cannot freeze or delete their own account
✔ Mobile navigation: hamburger + slide-out Sheet menu on both employee and admin apps (both were previously nav-less on mobile — fixed)
✔ Desktop navigation: static, always-expanded sidebar on both apps (no hover-to-expand — reverted from an earlier collapsible-rail design per explicit request)
✔ Branding: logo + favicon wired from real brand assets; brand-color gradient (sampled from the logo) now lives on the two post-login app shells (dashboard/admin) as a background wash; the login page background is real store photography (`hero-aisle.jpg` full-bleed, `hero-bakery.jpg` as a desktop accent)
✔ CSV export of tickets, date-range filtered, department-scoped

---

# Pending Features

□ **Twilio WhatsApp notifications** — fully coded (provider, dispatcher integration, DB outbox) but **not configured** (`TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`/`TWILIO_WHATSAPP_FROM` are blank). Waiting on real Twilio credentials from the user.
□ **SMTP email fallback** — same status as above: coded, dormant, unconfigured.
□ Real device mobile testing pass (layout was fixed and verified via responsive dev-tools emulation; a real-phone pass over LAN is still recommended)
□ Production deployment (currently local-dev only; no hosting/CI configured)
□ Analytics / reporting dashboard beyond the existing CSV export
□ Audit log UI (the `notifications` table is effectively an audit trail already, but there's no admin-facing "who did what when" view)
□ Admin ability to reassign their own department (currently master-only, by design)
□ Multi-department admin support (schema allows it via `admin_departments`, but no UI path creates more than one row per admin)

---

# API Documentation

Base URL: `{VITE_API_BASE_URL}` (default `http://localhost:4000/v1`). All routes below are relative to this base. Auth via `Authorization: Bearer <accessToken>` unless noted.

### Auth (`/auth`)
| Method | Route | Purpose | Auth |
|---|---|---|---|
| POST | `/auth/employee/login` | Employee login (`{code, password}`) | Public |
| POST | `/auth/admin/login` | Admin/master login (`{code, password}` — admin code like `KN-01`, not email), auto-resolves department | Public |
| POST | `/auth/refresh` | Refresh access token | Public (refresh token in body) |
| POST | `/auth/logout` | Revoke a refresh token | Public (refresh token in body) |
| POST | `/auth/admin/reset-employee-password` | Legacy master-only employee password reset | Master admin |
| POST | `/auth/change-password` | Self-service: `{currentPassword, newPassword}`, verifies current password then sets a new one | Any authenticated (employee or admin) |

### Departments (`/departments`)
| Method | Route | Purpose |
|---|---|---|
| GET | `/departments` | List all 7 departments |

### Employee-side tickets (`/`, mounted broadly — see Development Guidelines)
| Method | Route | Purpose | Auth |
|---|---|---|---|
| GET | `/employees/me/tickets` | List own tickets, optional `?status=` | Employee |
| POST | `/tickets` | Create a new ticket | Employee |
| POST | `/tickets/:id/replies` | Reply to own ticket | Employee |
| POST | `/tickets/:id/close` | Close own ticket | Employee |

### Admin-side tickets (`/admin/tickets`)
| Method | Route | Purpose | Auth |
|---|---|---|---|
| GET | `/admin/tickets` | List tickets, department-scoped, optional `?status=` | Admin |
| GET | `/admin/tickets/titles` | Lightweight list (id/title/dept/status) | Admin |
| GET | `/admin/tickets/:id` | Get one ticket, scope-checked | Admin |
| POST | `/admin/tickets/:id/replies` | Reply to a ticket in scope | Admin |

### Attachments (`/attachments`)
| Method | Route | Purpose | Auth |
|---|---|---|---|
| POST | `/attachments` | Create attachment — JSON `{kind:"text", text}` or multipart file upload | Any authenticated |
| GET | `/attachments/:id/url` | Get attachment DTO incl. signed URL | Any authenticated |

### Broadcasts / Alerts
| Method | Route | Purpose | Auth |
|---|---|---|---|
| GET | `/employees/me/broadcasts` | List alerts received | Employee |
| GET | `/admin/broadcasts` | List sent alerts (own only, or all if master) | Admin |
| POST | `/admin/broadcasts` | Send an alert — `targetType: employee\|department\|all` | Admin (`all` = master only) |

### Employees (credentials — `/admin/employees`)
| Method | Route | Purpose | Auth |
|---|---|---|---|
| GET | `/admin/employees` | List all employees | Admin |
| POST | `/admin/employees` | Create employee | Admin |
| PATCH | `/admin/employees/:code` | Update (label/whatsapp/isActive) | Admin |
| DELETE | `/admin/employees/:code` | Delete (fails gracefully if they have tickets) | Admin |

### Admins (`/admin/admins`) — master-only, entire router
| Method | Route | Purpose |
|---|---|---|
| GET | `/admin/admins` | List all admins with resolved department (each admin's `code`, not email, is the identifier shown) |
| POST | `/admin/admins` | Create admin (master or single-department) — takes `{code, password, name, isMaster, departmentId?}` |
| PATCH | `/admin/admins/:id` | Update name/isActive/department; blocks self-freeze (code is immutable after creation) |
| DELETE | `/admin/admins/:id` | Delete; blocks self-delete; friendly error on FK conflict |
| POST | `/admin/admins/:id/reset-password` | Reset an admin's password (sets new, never reveals current) |

### Notifications (`/notifications`)
| Method | Route | Purpose | Auth |
|---|---|---|---|
| GET | `/notifications/me` | Role-aware feed: `ticket_created` for admins, `ticket_replied` for employees, `channel=inapp` only | Any authenticated |

### Profiles (`/profiles`)
| Method | Route | Purpose | Auth |
|---|---|---|---|
| GET | `/profiles/me` | Get own profile (includes `avatarUrl`, a signed URL, if a photo is set) — works identically for employees and admins (own admin profile lives here too) | Any authenticated |
| PATCH | `/profiles/me` | Update own profile | Any authenticated |
| POST | `/profiles/me/avatar` | Upload a profile photo (multipart `file` field) — stored in Supabase Storage under `avatars/`, updates `profiles.avatar_path` | Any authenticated |
| GET | `/profiles/:identifier` | Get any identifier's profile | Master admin |
| PATCH | `/profiles/:identifier` | Update any identifier's profile (e.g. employee office mail) | Master admin |

### Export (`/admin/export`)
| Method | Route | Purpose | Auth |
|---|---|---|---|
| GET | `/admin/export/tickets.csv?from=&to=` | CSV export, department-scoped | Admin |

### Socket.IO events (not REST, `ws`/polling to the same host:4000)
| Event | Direction | Payload highlights |
|---|---|---|
| `ticket:created` | Server→Admin room (`admin:department:<id>`) | `employeeCode`, `adminMessage` (pre-rendered pop-up text) |
| `ticket:replied` | Server→Employee (`employee:<code>`) or Admin room | `from`, `message` (when from=admin) |
| `ticket:closed` | Server→Admin room | — |
| `broadcast:sent` | Server→each recipient Employee room | `message`, `recipients` |

Room joins happen in `sockets/index.ts` on connect: employees join `employee:<code>`; admins join `admin:department:<id>` (master admins join **every** department's room).

---

# Business Rules

- Employees can only view and act on their own tickets.
- Department Admins can only view/reply to tickets in their one assigned department.
- Only the Master Admin can create, edit, freeze, or delete admin accounts.
- Only the Master Admin can edit an employee's office mail / reset any employee's password (via the Admin & Legal/Credentials flows). Any employee or admin can also change their own password via self-service (`/v1/auth/change-password`).
- Closing a ticket is employee-only — there is no admin "close ticket" capability, by design.
- An employee's password is set to their WhatsApp number at account creation, but is **decoupled** from it afterward — editing the WhatsApp number field (contact info) no longer changes the login password, and the employee can change their own password independently at any time.
- Passwords (employee and admin) are always one-way bcrypt hashes. No UI or endpoint ever displays a current password — master admin's "reset password" sets a brand-new one, it never reveals the old one.
- Admins log in with an admin code (e.g. `KN-01`), not an email address. The `admins.email` column still exists in the DB for historical data but plays no role in login or the UI.
- Notifications and Alerts are strictly separate systems: Alerts (broadcasts) show full message content in the Alerts tab; Notifications show short system pings (new query / got a reply) in the Notifications tab. Broadcast events never appear in the Notifications feed.
- A non-master admin has exactly one department. There is no in-UI way to assign more than one (schema permits it, product does not).
- Freeze (soft-disable, `is_active = false`) is preferred over hard delete for any account with history; delete is blocked at the DB level (FK restrict) for accounts with existing tickets/replies/broadcasts, and the API surfaces this as a clean 409 rather than a crash.
- An admin cannot freeze or delete their own account (self-lockout guard).
- Master admin broadcasting to "all employees" is the only broadcast target type restricted to master.
- All monetary/financial actions, credential changes via raw SQL, and destructive Supabase operations are things Claude should never perform autonomously — see Development Guidelines.

---

# UI Design Rules

**Color palette** (Tailwind v4 CSS custom properties in `src/styles.css`, oklch-based, light + dark variants defined):
- `--primary` / `--gradient-primary`: warm red-orange (brand-adjacent, used for buttons/active states)
- `--gradient-brand`: the actual brand gradient, sampled directly from the KM logo pixels — `#dc3c32` (red) → `#2563eb` (blue) → `#14a05a` (green), used on the login page background and as soft blurred "glow" accents on the employee/admin app backgrounds
- `--success` (green), `--warning`, `--destructive` (red) for status badges (Active/Frozen, Open/Pending/Closed, etc.)
- `--card` / `--background`: near-white light theme (dark theme variables exist in CSS but there is no in-app theme toggle currently)

**Typography**: system sans-serif stack (`font-sans`), Tailwind's default type scale. Headings use `font-semibold tracking-tight`.

**Spacing**: Tailwind's default scale throughout; cards typically `rounded-2xl` with `p-5`/`p-6`; forms/inputs `rounded-xl`.

**Buttons**: primary actions use `bg-gradient-primary text-primary-foreground`; secondary/outline actions use `border bg-background`; destructive actions use `text-destructive hover:bg-destructive/10`.

**Cards**: `rounded-2xl border bg-card shadow-sm`, translucent variants (`bg-card/40`, `bg-card/60 backdrop-blur`) used for empty states and the sidebar panel so the background glow shows through subtly.

**Tables**: plain HTML `<table>` with `bg-muted/40` header row, `border-b last:border-0` rows — used for Employee codes, Manage credentials, Admin & Legal, Issue titles.

**Responsive behavior**: mobile-first breakpoints via Tailwind `md:`. Both the employee dashboard and admin panel use a `hidden md:flex` desktop `<aside>` sidebar **plus** a `md:hidden` mobile top bar with a hamburger button opening a `Sheet` (slide-out drawer) containing the identical nav — this was a real bug (no mobile nav existed at all) fixed during this project's build-out.

**Desktop sidebar is a static, always-expanded `w-64` `<aside>`** (`dashboard.tsx` and `admin.tsx`) — full nav (profile/logo/nav items/sign-out) is always visible on desktop, no hover/collapse behavior. (An earlier build had this as a hover-collapsible rail that expanded on `onMouseEnter`/`onFocus`; that was explicitly reverted per client request — the nav bar should never hide/unfold on desktop.) Mobile behavior (hamburger + Sheet, click to open) is unchanged.

**Brand gradient wash on the post-login shells**: `dashboard.tsx` and `admin.tsx` both render a fixed, full-viewport `bg-gradient-brand` layer at low opacity (`opacity-[0.12]`) behind the sidebar/main content, plus the pre-existing soft blob-float glow accents. This gradient previously lived only on the login page background; it was moved (in addition to being kept on login) to the two main app shells per client request, with the login page's background replaced by real store photography instead (see below).

**Login page background**: `public/brand/hero-aisle.jpg` (wide store-aisle photo) is a full-bleed `bg-cover bg-center` background on every viewport size, incl. mobile, with a dark overlay + blur so the glass login card stays legible — replacing the flat gradient backdrop the login page used to have. `public/brand/hero-bakery.jpg` appears as a smaller framed accent image in the desktop-only (`hidden lg:flex`) left info panel.

**Logo/Favicon**: `public/brand/logo.png` (134×134, transparent) used as the header logo across login/dashboard/admin; `public/brand/favicon-source.png` (1182×1182, transparent) used as the favicon and apple-touch-icon. Both sampled/verified for true alpha transparency before use.

**Profile photos**: every role (employee, department admin, master admin) can upload a profile photo from their local device via the "Your profile" panel — stored in Supabase Storage under `avatars/` (bucket `attachments`, same bucket as ticket attachments), referenced by `profiles.avatar_path`, served as a time-limited signed URL (same pattern as ticket attachments). Shown in the sidebar avatar circle in place of initials once set.

---

# Environment Variables

### Root (`.env`, frontend — Vite)
| Variable | Purpose |
|---|---|
| `VITE_BRAND_NAME` | Display brand name, defaults to "Kin Connect" |
| `VITE_API_BASE_URL` | Backend API base URL, e.g. `http://localhost:4000/v1` |

### `server/.env` (backend)
| Variable | Purpose |
|---|---|
| `PORT` | Express server port (default 4000) |
| `NODE_ENV` | development/production/test |
| `CORS_ORIGIN` | Must match the frontend's actual dev-server origin (e.g. `http://localhost:8080`) — mismatch causes CORS failures if the frontend port changes |
| `BRAND_NAME` | Used in notification message templates |
| `DATABASE_URL` | Supabase Postgres connection string (Session Pooler or direct) |
| `SUPABASE_URL` | Supabase project URL, for Storage client only |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only secret key for Supabase Storage access — never exposed to frontend |
| `SUPABASE_STORAGE_BUCKET` | Bucket name for attachments (default `attachments`) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Signing secrets for JWTs — must be kept secret, randomly generated |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL` | Token lifetimes (default `15m` / `30d`) |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_WHATSAPP_FROM` | WhatsApp send credentials — **currently blank/unconfigured** |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Email fallback credentials — **currently blank/unconfigured** |

---

# Third Party Services

| Service | Status | Notes |
|---|---|---|
| **Supabase Postgres** | ✅ Active | Sole database. Accessed via direct `pg` connection (`DATABASE_URL`), not Supabase's client SDK. |
| **Supabase Storage** | ✅ Active | Stores all non-text attachments (voice/video/photo/file). Bucket `attachments`, private, signed URLs generated on demand (600s expiry default). |
| **Supabase Auth** | ❌ Not used, not planned | App has its own JWT auth entirely. Do not attempt to integrate Supabase Auth. |
| **Supabase Data API (PostgREST)** | ⚠️ Should be disabled | Not used by the app, but was left enabled with RLS off at one point — RLS has since been enabled on all tables as a defense-in-depth measure. Recommend also disabling the Data API toggle in Supabase settings since nothing legitimate uses it. |
| **Twilio (WhatsApp)** | 🟡 Coded, dormant | Provider class no-ops cleanly and falls through to email when unconfigured. Activate by filling `TWILIO_*` env vars. |
| **SMTP (Nodemailer)** | 🟡 Coded, dormant | Same pattern — activate by filling `SMTP_*` env vars. |
| **Socket.IO** | ✅ Active | Self-hosted (not a third party), runs on the same Express HTTP server. |

---

# Known Bugs

None currently open. Historical bugs found and fixed during development (kept here for context — do not reintroduce):
- **Critical routing bug**: a broadly-mounted `app.use("/v1", ticketsRouter)` registered *before* `/v1/admin/*` routers caused every admin/profile request to be silently 403'd by the employee-only gate. Fixed by reordering router registration (see Development Guidelines — this class of bug is easy to reintroduce).
- **Socket reconnect storm**: `connectSocket()` checked `.connected` instead of just checking for an existing instance, causing multiple concurrent connections under React's dev-mode double-effect-invocation. Fixed by reusing any existing socket instance regardless of connection state, and removing an unnecessary `disconnectSocket()` from a component's cleanup.
- **Infinite render loop**: `getSession()` returned a freshly-parsed object on every call, breaking `useSyncExternalStore`'s reference-equality check. Fixed by caching the parsed result and only re-parsing when the raw localStorage string actually changes.
- **No mobile navigation**: both app shells hid the sidebar below `md:` with no fallback. Fixed with a hamburger + Sheet pattern.
- **Employee dashboard mobile layout broken (flex-row instead of flex-col)**: `dashboard.tsx`'s root shell div was `flex` (row, Tailwind's default axis) with no `flex-col`/`md:flex-row`, unlike `admin.tsx` which had it correctly. On mobile this laid the sticky top bar and `<main>` out side-by-side instead of stacked, squeezing the top bar (logo/brand/hamburger) into a thin vertical sliver on the left and pushing content off-screen to the right. Fixed by adding `flex-col md:flex-row` to match `admin.tsx`.

---

# Future Roadmap

- Configure and activate Twilio WhatsApp + SMTP email notifications
- Production deployment (hosting TBD — backend needs a Node host supporting WebSockets, e.g. Render/Fly.io; frontend can go to Vercel/Netlify)
- Real-device mobile QA pass
- Possible dark-mode toggle (CSS variables already exist for it)
- Possible multi-department admin support if the business needs it later
- Audit-log / activity-history UI surfaced from the existing `notifications` table

---

# Development Guidelines

Claude (or any future contributor) must always follow these rules on this project:

1. **Never change existing business logic unless explicitly requested.** Confirm scope before refactoring.
2. **Never rename database tables or columns without explicit permission** — this is a live Supabase database with real data.
3. **Router mount order in `server/src/app.ts` is load-bearing.** Any router mounted broadly at `/v1` with an unconditional role gate (like `ticketsRouter`, `employeeBroadcastsRouter`) MUST be registered *after* every more-specific `/v1/admin/*` and `/v1/profiles/*` router. Getting this wrong silently breaks admin/master endpoints with 403s that look like auth bugs but aren't.
4. **Employee/admin passwords are independent, self-service credentials** (as of the password-decoupling change — see Change Log). Never reintroduce the old rule where an employee's password was silently derived from their WhatsApp number field; WhatsApp number is contact info only now. Master admin's "reset password" must remain reset-only (set a new password) — never store or expose a current password in recoverable/plaintext form.
5. **Freeze, don't delete, wherever there might be history.** Delete is a hard operation blocked by FK constraints for accounts with tickets/replies/broadcasts — always prefer `isActive: false` for "remove this person" requests unless the user explicitly confirms permanent deletion of a never-used account.
6. **Keep Alerts and Notifications strictly separate** — different tabs, different data sources, different dot state. Never let a broadcast_sent event populate the Notifications feed, and never let a ticket_created/ticket_replied event populate the Alerts feed.
7. **Maintain department scoping discipline**: any new admin-facing query must branch on `req.scopedDepartmentId` (null = master), never assume `req.auth.departmentId` directly.
8. **Preserve the existing folder structure** (routes/services/middleware split on the backend; routes/components/lib on the frontend). Don't introduce a different architecture pattern for new features.
9. **Use TypeScript strictly** — no `any` except where already present (a couple of Drizzle `where` clause accumulator arrays); prefer proper types end-to-end (backend DTO interfaces mirrored in `src/lib/types.ts`).
10. **Never delete a working feature to "simplify"** without explicit user confirmation.
11. **Verify changes actually work** — type-check (`npx tsc --noEmit`) after every backend/frontend change, and test the real flow via curl (backend) or the browser (frontend) before declaring something done. Don't claim "done" on code that only compiles.
12. **Never run destructive Supabase/SQL operations** (drop table, delete rows in bulk, disable RLS, rotate production credentials) without explicit, scoped user confirmation — even if asked to "just fix it."
13. **Secrets stay server-side.** `SUPABASE_SERVICE_ROLE_KEY`, JWT secrets, and the database password must never be sent to or used from frontend code.
14. **This file should be updated** whenever a feature listed under "Pending Features" ships, or a new architectural decision is made — move it to "Current Features" / "Important Decisions" / "Change Log" accordingly.

---

# Change Log

- **Initial setup**: Connected the existing Lovable-scaffolded frontend + hand-built Express/Drizzle backend to a real Supabase Postgres database; ran migrations; seeded demo data.
- **Critical fix**: Diagnosed and fixed the router-mount-order bug that made admin/master dashboards appear completely broken (silently 403'd).
- **Critical fix**: Diagnosed and fixed the socket reconnect-storm bug causing unreliable real-time delivery of admin replies to employees.
- **Feature**: Added employee-facing Alerts tab (previously broadcasts were buried inside Past Queries).
- **Feature**: Built full department-scoped admin system — 7 seeded department admins, one department each, enforced end-to-end and verified via direct API testing.
- **Feature**: Built master-admin CRUD for both admin accounts and employee accounts (create/edit/freeze/delete/reset-password), replacing the earlier idea of managing credentials directly in Supabase.
- **Feature**: Removed the manual "select your department" login step — department is now resolved automatically from the admin's single assignment.
- **Feature**: Master admin can now edit any employee's office mail via a dedicated master-only profile endpoint.
- **Feature**: Built the full in-app Notifications system (distinct from Alerts) — DB-backed feed, Socket.IO live push, toast, Web Audio chime, unread dots — replacing the originally-planned email/WhatsApp-only notification approach per the client's explicit "no email/WhatsApp, in-web notifications" requirement.
- **Feature**: Multi-select (searchable combobox) + "Send to all" in the alert composer, replacing the original single-employee-code text field.
- **Critical fix + Feature**: Fixed the employee dashboard's mobile layout bug (missing `flex-col`, see Known Bugs) that squeezed the mobile top bar into a vertical sliver. Converted the desktop sidebar on both `dashboard.tsx` and `admin.tsx` from an always-expanded static `<aside>` into a hover-collapsible rail (logo-only at rest, expands to full nav on hover/focus) per an explicit client request for a "foldable" nav. Also gave the decorative background glow blobs on both shells a slow drifting CSS transform animation (`blob-float-a`/`blob-float-b` in `styles.css`, `prefers-reduced-motion`-aware) instead of sitting static.
- **Fix**: Diagnosed and fixed complete absence of mobile navigation on both app shells.
- **Feature**: Wired real brand assets — logo, favicon, and a gradient sampled directly from the logo's pixel colors — replacing placeholder iconography and an earlier (reverted) photo-background experiment.
- **Security hardening**: Enabled RLS on all Supabase tables (no functional impact — the app's own connection bypasses RLS — closes off the unused Supabase Data API as an attack surface).
- **UI overhaul + admin login/password redesign** (2026-07-16): Login page background switched from the flat brand gradient to real store photography (`hero-aisle.jpg` full-bleed on every viewport incl. mobile, `hero-bakery.jpg` as a desktop accent); the brand gradient moved to the two post-login app shells (dashboard/admin) as a low-opacity background wash instead. Desktop sidebar reverted from the hover-collapsible rail (added in an earlier change) back to a static, always-expanded `w-64` `<aside>` per explicit client request that the nav never hide on desktop. Removed the "Demo credentials" hint box from the login page. Renamed the master-only "Manage admins" tab to "Admin & Legal". Home-page copy changes: dropped the "Report a new issue" eyebrow label, "Let's get it sorted, together." → "Create the report"; ticket-submitted confirmation dialog "Issue submitted" → "Response Submitted"; login page tagline "Kin Connect. Report, resolve, reply." → "3R. Report, Response, Resolve." with a new "Admin - Unified Solutions" subheading, and a larger brand wordmark.
- **Breaking change to admin login**: Admins (including master admin) now log in with an employee-code-style **admin code** (e.g. `KN-01`) instead of an office-mail address. Added `admins.code` (unique, nullable at the DB level) via migration `0002_flashy_silhouette.sql`; backfilled all 8 existing admin accounts (`server/src/db/backfill-admin-codes.ts`) — master admin got `KN-01`, the 7 department admins got `KN-02`–`KN-08` in department `sort_order`. `admins.email` was relaxed to nullable (not dropped — historical data preserved, still used as an optional contact for the dormant email-notification channel) and is no longer collected, shown, or used for login anywhere in the app.
- **Breaking change to password model**: Employee passwords are no longer silently tied to the WhatsApp-number field — added self-service password change (`POST /v1/auth/change-password`) usable by any employee or admin, verified against their own current password hash. Master admin's existing "reset password" flows for employees and admins are unchanged in shape but are now explicitly documented as reset-only (never able to view a current password, since passwords remain one-way bcrypt hashes throughout).
- **Feature**: Profile photo upload for every role. Added `profiles.avatar_path` (nullable) via the same migration; new `POST /v1/profiles/me/avatar` endpoint (multipart upload, reuses the existing Supabase Storage attachment pipeline under an `avatars/` folder) and a signed `avatarUrl` now included in every profile response. Admins and the master admin also gained a "Your profile" panel (identical in shape to the employee one) they didn't have before, so every role can now edit their own name/phone/office-mail and photo, and change their own password, from one place.

---

# Important Decisions

- Master Admin controls all credential management (both admins and employees); department admins can manage employees but not other admins.
- Department Admins cannot manage credentials for other admins, and (as of this build) cannot edit employee office mail — that's master-only.
- Notifications and Alerts are deliberately separate systems with separate tabs, separate unread-dot state, and separate backend data sources — this was an explicit client requirement, not an implementation shortcut.
- Email and WhatsApp integrations are **not** the primary notification mechanism — the client explicitly requested in-app web notifications (pop-up + sound) instead. Twilio/SMTP remain as optional secondary channels, fully coded but inactive until credentials are supplied.
- Mobile responsiveness is mandatory — both app shells must have a working mobile nav at all times; this was treated as a P0 bug fix, not a nice-to-have.
- Backend is Node.js + Express (not a framework like NestJS/Fastify) — hand-rolled REST API.
- Database is Supabase-hosted PostgreSQL, accessed as plain Postgres (not through Supabase's client SDK) — Supabase is a hosting choice, not an architectural dependency.
- Storage is Supabase Storage, server-side only, via the service-role key.
- Every non-master admin gets exactly one department — this is a product decision (not a hard schema constraint) that simplified the login flow (no department picker needed).
- Freeze (soft-disable) is the preferred way to "remove" an account with any history; hard delete is reserved for never-used accounts and is blocked at the database level otherwise.
- Employee password was originally the WhatsApp number by design; this was explicitly superseded (2026-07-16) by self-service password change for both employees and admins — the WhatsApp number field is now contact info only.
- Admin identity moved from office-mail to an employee-code-style admin code (2026-07-16), explicitly requested so admin login matches employee login conceptually (same code-based pattern, easier to communicate/rotate than email addresses).
- Master admin's password control is deliberately reset-only, never view-only — an explicit client decision after being told that "viewing" a current password would require storing it in reversible form, which was rejected as a security downgrade.
- The brand's actual visual identity (logo colors: red `#dc3c32`, blue `#2563eb`, green `#14a05a`) is used for the app's gradient/accent treatment — sampled directly from the provided logo file rather than approximated, per the client's explicit ask to "represent their brand." As of 2026-07-16 this gradient wash lives on the two post-login app shells rather than the login page, which now uses real store photography instead.
- Desktop sidebar nav must always stay visibly expanded — a hover-collapsible rail was tried and explicitly reverted per client request; don't reintroduce collapse-on-idle behavior without being asked.

---

# Coding Standards

- **Backend routes are thin**: parse/validate with Zod (`utils/validation.ts`), delegate to a `services/*.ts` function, shape the response. No business logic inline in route handlers beyond orchestration (emit socket event, dispatch notification).
- **Every route uses `asyncHandler`** (from `middleware/errorHandler.ts`) to avoid unhandled promise rejections; errors are thrown as `HttpError(status, message)` and caught centrally.
- **All request validation goes through Zod schemas** defined in `server/src/utils/validation.ts` — one schema per endpoint shape, reused between create/update where sensible.
- **Drizzle ORM only** — no raw SQL strings in application code (migrations are the exception, auto-generated).
- **Column naming**: camelCase in TypeScript/Drizzle definitions, snake_case in actual Postgres columns (Drizzle's `text("column_name")` mapping) — always check `schema.ts` for the real column name before writing raw SQL in the Supabase SQL Editor.
- **Frontend data fetching**: every backend endpoint has a corresponding React Query hook in `src/lib/tracker-queries.ts` — never call `fetch`/`apiGet` directly from a component.
- **Frontend types mirror backend DTOs** in `src/lib/types.ts` — keep these in sync when a backend response shape changes.
- **No comments explaining *what* code does** — only *why*, when non-obvious (e.g. the router-mount-order warning comment in `app.ts`). Well-named identifiers carry the "what".
- **Tailwind utility classes only** for styling — no separate CSS files per component; shared design tokens live in `src/styles.css` as CSS custom properties + `@utility` classes.
- **Self-contained edits**: after any change, run `npx tsc --noEmit` (both root and `server/`) before considering the change complete.
