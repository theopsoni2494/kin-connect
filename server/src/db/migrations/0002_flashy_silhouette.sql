ALTER TABLE "admins" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "code" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "avatar_path" text;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_code_unique" UNIQUE("code");