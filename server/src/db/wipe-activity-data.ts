import { db, pool } from "./client.js";
import { notifications, broadcasts, tickets, attachments } from "./schema.js";

// One-off, destructive: wipes all recorded ticket/activity data on the LIVE
// database (Required Update item 3, PROJECT_CONTEXT.md). Deletion order
// respects FK constraints: notifications -> broadcasts (cascades to
// broadcast_recipients) -> tickets (cascades to replies) -> attachments.
// Deliberately does NOT touch employees, admins, admin_departments,
// departments, profiles, or refresh_tokens — every login account and
// profile (including avatars) survives untouched.
//
// DO NOT RUN without explicit, immediate confirmation from the user —
// this is irreversible on the live Supabase database.
async function main() {
  const notificationsDeleted = await db.delete(notifications).returning({ id: notifications.id });
  const broadcastsDeleted = await db.delete(broadcasts).returning({ id: broadcasts.id });
  const ticketsDeleted = await db.delete(tickets).returning({ id: tickets.id });
  const attachmentsDeleted = await db.delete(attachments).returning({ id: attachments.id });

  console.log(`notifications deleted: ${notificationsDeleted.length}`);
  console.log(`broadcasts deleted (broadcast_recipients cascaded): ${broadcastsDeleted.length}`);
  console.log(`tickets deleted (replies cascaded): ${ticketsDeleted.length}`);
  console.log(`attachments deleted: ${attachmentsDeleted.length}`);
  console.log("employees, admins, admin_departments, departments, profiles, refresh_tokens: untouched.");

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
