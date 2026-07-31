ALTER TABLE "employees" DROP CONSTRAINT IF EXISTS "employees_department_id_departments_id_fk";--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN IF EXISTS "department_id";--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "sector" text;
