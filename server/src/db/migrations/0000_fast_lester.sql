CREATE EXTENSION IF NOT EXISTS pgcrypto;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_departments" (
	"admin_id" uuid NOT NULL,
	"department_id" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text DEFAULT 'Admin' NOT NULL,
	"is_master" boolean DEFAULT false NOT NULL,
	"whatsapp_number" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"storage_bucket" text DEFAULT 'attachments' NOT NULL,
	"storage_path" text,
	"original_name" text,
	"mime_type" text,
	"size_bytes" integer,
	"text_content" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "broadcast_recipients" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"broadcast_id" uuid NOT NULL,
	"employee_code" text NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "broadcasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_admin_id" uuid NOT NULL,
	"target_type" text NOT NULL,
	"target_employee_code" text,
	"target_department_id" smallint,
	"message" text NOT NULL,
	"attachment_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "departments" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "departments_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"password_hash" text NOT NULL,
	"label" text,
	"whatsapp_number" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "employees_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"ticket_id" text,
	"broadcast_id" uuid,
	"recipient_type" text NOT NULL,
	"recipient_employee_code" text,
	"recipient_admin_id" uuid,
	"channel" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"provider" text,
	"provider_message_id" text,
	"error_message" text,
	"attempt_count" smallint DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"identifier" text PRIMARY KEY NOT NULL,
	"name" text,
	"phone" text,
	"office_mail" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_type" text NOT NULL,
	"subject_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" text NOT NULL,
	"from_role" text NOT NULL,
	"admin_id" uuid,
	"attachment_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_code" text NOT NULL,
	"department_id" smallint NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"title" text NOT NULL,
	"attachment_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	"closed_by" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_departments" ADD CONSTRAINT "admin_departments_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_departments" ADD CONSTRAINT "admin_departments_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "broadcast_recipients" ADD CONSTRAINT "broadcast_recipients_broadcast_id_broadcasts_id_fk" FOREIGN KEY ("broadcast_id") REFERENCES "public"."broadcasts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "broadcast_recipients" ADD CONSTRAINT "broadcast_recipients_employee_code_employees_code_fk" FOREIGN KEY ("employee_code") REFERENCES "public"."employees"("code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_sender_admin_id_admins_id_fk" FOREIGN KEY ("sender_admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_target_employee_code_employees_code_fk" FOREIGN KEY ("target_employee_code") REFERENCES "public"."employees"("code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_target_department_id_departments_id_fk" FOREIGN KEY ("target_department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "broadcasts" ADD CONSTRAINT "broadcasts_attachment_id_attachments_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_broadcast_id_broadcasts_id_fk" FOREIGN KEY ("broadcast_id") REFERENCES "public"."broadcasts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_employee_code_employees_code_fk" FOREIGN KEY ("recipient_employee_code") REFERENCES "public"."employees"("code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_admin_id_admins_id_fk" FOREIGN KEY ("recipient_admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "replies" ADD CONSTRAINT "replies_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "replies" ADD CONSTRAINT "replies_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "replies" ADD CONSTRAINT "replies_attachment_id_attachments_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_employee_code_employees_code_fk" FOREIGN KEY ("employee_code") REFERENCES "public"."employees"("code") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_attachment_id_attachments_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "admin_departments_pk" ON "admin_departments" USING btree ("admin_id","department_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_broadcast_recipients_employee" ON "broadcast_recipients" USING btree ("employee_code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_broadcast_recipient" ON "broadcast_recipients" USING btree ("broadcast_id","employee_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_broadcasts_created_at" ON "broadcasts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_status" ON "notifications" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_ticket" ON "notifications" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_subject" ON "refresh_tokens" USING btree ("subject_id","subject_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_replies_ticket_id" ON "replies" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_employee_code" ON "tickets" USING btree ("employee_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_department_status" ON "tickets" USING btree ("department_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_created_at" ON "tickets" USING btree ("created_at");