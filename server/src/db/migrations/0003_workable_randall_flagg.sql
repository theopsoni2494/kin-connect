ALTER TABLE "admins" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "password_hash" DROP NOT NULL;