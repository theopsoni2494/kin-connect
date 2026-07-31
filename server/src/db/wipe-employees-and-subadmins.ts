import { eq, inArray } from "drizzle-orm";
import { db, pool } from "./client.js";
import { notifications, broadcasts, tickets, attachments, profiles, refreshTokens, employees, admins } from "./schema.js";

// One-off, destructive: wipes every employee account and every non-master
// admin account on the LIVE database, ahead of re-importing employees via
// the new richer bulk-import format (code + name + department). Master
// admin(s) (isMaster = true) are explicitly preserved and untouched.
//
// FK constraints force this order: notifications -> broadcasts (cascades
// broadcast_recipients) -> tickets (cascades replies) -> attachments must
// go first (they reference employees/admins with onDelete: restrict/no
// action), THEN employees + non-master admins can be deleted, THEN their
// now-orphaned profiles and refresh_tokens are cleaned up. departments and
// admin_departments (for the surviving master admin) are untouched.
//
// DO NOT RUN without explicit, immediate confirmation from the user —
// this is irreversible on the live Supabase database.
async function main() {
  const notificationsDeleted = await db.delete(notifications).returning({ id: notifications.id });
  const broadcastsDeleted = await db.delete(broadcasts).returning({ id: broadcasts.id });
  const ticketsDeleted = await db.delete(tickets).returning({ id: tickets.id });
  const attachmentsDeleted = await db.delete(attachments).returning({ id: attachments.id });

  const employeeRows = await db.query.employees.findMany({ columns: { code: true } });
  const employeeCodes = employeeRows.map((e) => e.code);

  const nonMasterAdminRows = await db.query.admins.findMany({
    where: eq(admins.isMaster, false),
    columns: { id: true, code: true, name: true },
  });
  const nonMasterAdminIds = nonMasterAdminRows.map((a) => a.id);

  const orphanedIdentifiers = [...employeeCodes, ...nonMasterAdminIds];
  const profilesDeleted = orphanedIdentifiers.length
    ? await db
        .delete(profiles)
        .where(inArray(profiles.identifier, orphanedIdentifiers))
        .returning({ identifier: profiles.identifier })
    : [];
  const refreshTokensDeleted = orphanedIdentifiers.length
    ? await db
        .delete(refreshTokens)
        .where(inArray(refreshTokens.subjectId, orphanedIdentifiers))
        .returning({ id: refreshTokens.id })
    : [];

  const employeesDeleted = await db.delete(employees).returning({ code: employees.code });
  const adminsDeleted = nonMasterAdminIds.length
    ? await db.delete(admins).where(inArray(admins.id, nonMasterAdminIds)).returning({ code: admins.code, name: admins.name })
    : [];

  console.log(`notifications deleted: ${notificationsDeleted.length}`);
  console.log(`broadcasts deleted (broadcast_recipients cascaded): ${broadcastsDeleted.length}`);
  console.log(`tickets deleted (replies cascaded): ${ticketsDeleted.length}`);
  console.log(`attachments deleted: ${attachmentsDeleted.length}`);
  console.log(`profiles deleted: ${profilesDeleted.length}`);
  console.log(`refresh tokens deleted: ${refreshTokensDeleted.length}`);
  console.log(`employees deleted: ${employeesDeleted.length}`);
  console.log(
    `non-master admins deleted: ${adminsDeleted.length} (${adminsDeleted.map((a) => a.code ?? a.name).join(", ") || "none"})`,
  );

  const remainingAdmins = await db.query.admins.findMany({ columns: { code: true, name: true, isMaster: true } });
  console.log("admins remaining (should be master-only):", remainingAdmins);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
