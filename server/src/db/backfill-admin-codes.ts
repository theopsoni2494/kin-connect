import { eq, isNull } from "drizzle-orm";
import { db, pool } from "./client.js";
import { admins, adminDepartments, departments } from "./schema.js";

// One-off: assigns a KN-xx login code to every admin that doesn't have one yet
// (part of the office-mail -> employee-code-style admin login migration).
// Master admin(s) get KN-01, KN-02, ...; department admins are ordered by
// their department's sortOrder so the mapping is stable and predictable.
async function main() {
  const rows = await db
    .select({
      id: admins.id,
      email: admins.email,
      isMaster: admins.isMaster,
      createdAt: admins.createdAt,
      sortOrder: departments.sortOrder,
    })
    .from(admins)
    .leftJoin(adminDepartments, eq(adminDepartments.adminId, admins.id))
    .leftJoin(departments, eq(adminDepartments.departmentId, departments.id))
    .where(isNull(admins.code));

  rows.sort((a, b) => {
    if (a.isMaster !== b.isMaster) return a.isMaster ? -1 : 1;
    const so = (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
    if (so !== 0) return so;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  let n = 1;
  for (const row of rows) {
    const code = `KN-${String(n).padStart(2, "0")}`;
    await db.update(admins).set({ code }).where(eq(admins.id, row.id));
    console.log(`${code}  <-  ${row.email ?? row.id}${row.isMaster ? " (master)" : ""}`);
    n++;
  }

  console.log(`Backfilled ${rows.length} admin code(s).`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
