import { eq, inArray } from "drizzle-orm";
import { db, pool } from "./client.js";
import { admins, adminDepartments, departments } from "./schema.js";

// One-off, destructive: Required Update item 4 (PROJECT_CONTEXT.md).
// KN-01 (master) is left completely untouched. KN-02 is repurposed to cover
// every department. KN-03 through KN-08 are hard-deleted.
//
// MUST run after wipe-activity-data.ts (item 3) — deleting KN-03..KN-08 will
// fail with a Postgres FK-restrict error (23503) if they still have replies
// or sent broadcasts on file.
//
// DO NOT RUN without explicit, immediate confirmation from the user —
// deletion is irreversible on the live Supabase database.
const KEEP_CODE = "KN-02";
const DELETE_CODES = ["KN-03", "KN-04", "KN-05", "KN-06", "KN-07", "KN-08"];

async function main() {
  const [keepAdmin] = await db.select().from(admins).where(eq(admins.code, KEEP_CODE)).limit(1);
  if (!keepAdmin) throw new Error(`${KEEP_CODE} not found — aborting, nothing changed`);
  if (keepAdmin.isMaster) throw new Error(`${KEEP_CODE} is a master admin — refusing to touch it, aborting`);

  const allDepartments = await db.select({ id: departments.id, name: departments.name }).from(departments);
  if (allDepartments.length === 0) throw new Error("no departments found — aborting, nothing changed");

  await db.delete(adminDepartments).where(eq(adminDepartments.adminId, keepAdmin.id));
  await db.insert(adminDepartments).values(allDepartments.map((d) => ({ adminId: keepAdmin.id, departmentId: d.id })));
  console.log(`${KEEP_CODE} (${keepAdmin.id}) now assigned to all ${allDepartments.length} departments.`);

  const toDelete = await db.select().from(admins).where(inArray(admins.code, DELETE_CODES));
  for (const admin of toDelete) {
    try {
      await db.delete(admins).where(eq(admins.id, admin.id));
      console.log(`deleted ${admin.code} (${admin.id})`);
    } catch (err) {
      if ((err as { code?: string }).code === "23503") {
        console.error(
          `FAILED to delete ${admin.code}: has existing replies/broadcasts on file. ` +
            `Run wipe-activity-data.ts first, then re-run this script.`,
        );
      } else {
        throw err;
      }
    }
  }

  const missing = DELETE_CODES.filter((c) => !toDelete.some((a) => a.code === c));
  if (missing.length > 0) console.log(`Not found (already gone?): ${missing.join(", ")}`);

  console.log("KN-01 (master admin): untouched, as required.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
