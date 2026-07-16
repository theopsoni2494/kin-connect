import {
  pgTable,
  smallserial,
  smallint,
  text,
  boolean,
  timestamp,
  uuid,
  integer,
  bigserial,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const departments = pgTable("departments", {
  id: smallserial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: smallint("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  label: text("label"),
  whatsappNumber: text("whatsapp_number"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").unique(),
  email: text("email").unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull().default("Admin"),
  isMaster: boolean("is_master").notNull().default(false),
  whatsappNumber: text("whatsapp_number"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminDepartments = pgTable(
  "admin_departments",
  {
    adminId: uuid("admin_id")
      .notNull()
      .references(() => admins.id, { onDelete: "cascade" }),
    departmentId: smallint("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "restrict" }),
  },
  (t) => ({
    pk: uniqueIndex("admin_departments_pk").on(t.adminId, t.departmentId),
  }),
);

export const profiles = pgTable("profiles", {
  identifier: text("identifier").primaryKey(),
  name: text("name"),
  phone: text("phone"),
  officeMail: text("office_mail"),
  avatarPath: text("avatar_path"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const attachments = pgTable("attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: text("kind", { enum: ["text", "voice", "video", "photo", "file"] }).notNull(),
  storageBucket: text("storage_bucket").notNull().default("attachments"),
  storagePath: text("storage_path"),
  originalName: text("original_name"),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  textContent: text("text_content"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tickets = pgTable(
  "tickets",
  {
    id: text("id").primaryKey(),
    employeeCode: text("employee_code")
      .notNull()
      .references(() => employees.code, { onDelete: "restrict" }),
    departmentId: smallint("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "restrict" }),
    status: text("status", { enum: ["open", "pending", "closed"] })
      .notNull()
      .default("open"),
    title: text("title").notNull(),
    attachmentId: uuid("attachment_id")
      .notNull()
      .references(() => attachments.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    closedBy: text("closed_by"),
  },
  (t) => ({
    employeeIdx: index("idx_tickets_employee_code").on(t.employeeCode),
    deptStatusIdx: index("idx_tickets_department_status").on(t.departmentId, t.status),
    createdIdx: index("idx_tickets_created_at").on(t.createdAt),
  }),
);

export const replies = pgTable(
  "replies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    fromRole: text("from_role", { enum: ["user", "admin"] }).notNull(),
    adminId: uuid("admin_id").references(() => admins.id),
    attachmentId: uuid("attachment_id")
      .notNull()
      .references(() => attachments.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    ticketIdx: index("idx_replies_ticket_id").on(t.ticketId),
  }),
);

export const broadcasts = pgTable(
  "broadcasts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    senderAdminId: uuid("sender_admin_id")
      .notNull()
      .references(() => admins.id),
    targetType: text("target_type", { enum: ["employee", "department", "all"] }).notNull(),
    targetEmployeeCode: text("target_employee_code").references(() => employees.code),
    targetDepartmentId: smallint("target_department_id").references(() => departments.id),
    message: text("message").notNull(),
    attachmentId: uuid("attachment_id").references(() => attachments.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    createdIdx: index("idx_broadcasts_created_at").on(t.createdAt),
  }),
);

export const broadcastRecipients = pgTable(
  "broadcast_recipients",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    broadcastId: uuid("broadcast_id")
      .notNull()
      .references(() => broadcasts.id, { onDelete: "cascade" }),
    employeeCode: text("employee_code")
      .notNull()
      .references(() => employees.code),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (t) => ({
    employeeIdx: index("idx_broadcast_recipients_employee").on(t.employeeCode),
    uniqPair: uniqueIndex("uq_broadcast_recipient").on(t.broadcastId, t.employeeCode),
  }),
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventType: text("event_type", {
      enum: ["ticket_created", "ticket_replied", "ticket_closed", "broadcast_sent"],
    }).notNull(),
    ticketId: text("ticket_id").references(() => tickets.id),
    broadcastId: uuid("broadcast_id").references(() => broadcasts.id),
    recipientType: text("recipient_type", { enum: ["employee", "admin"] }).notNull(),
    recipientEmployeeCode: text("recipient_employee_code").references(() => employees.code),
    recipientAdminId: uuid("recipient_admin_id").references(() => admins.id),
    message: text("message"),
    channel: text("channel", { enum: ["inapp", "whatsapp", "email"] }).notNull(),
    status: text("status", {
      enum: ["pending", "sent", "failed", "skipped_no_config"],
    })
      .notNull()
      .default("pending"),
    provider: text("provider"),
    providerMessageId: text("provider_message_id"),
    errorMessage: text("error_message"),
    attemptCount: smallint("attempt_count").notNull().default(0),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (t) => ({
    statusIdx: index("idx_notifications_status").on(t.status, t.nextAttemptAt),
    ticketIdx: index("idx_notifications_ticket").on(t.ticketId),
  }),
);

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectType: text("subject_type", { enum: ["employee", "admin"] }).notNull(),
    subjectId: text("subject_id").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    subjectIdx: index("idx_refresh_tokens_subject").on(t.subjectId, t.subjectType),
  }),
);

