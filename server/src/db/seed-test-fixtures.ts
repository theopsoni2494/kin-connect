// LOCAL TEST DB ONLY — not for production. Adds fixture data to exercise:
//  - passwordless first-login flow (item 1)
//  - FK-restrict blocking admin deletion until wipe-activity-data.ts runs (item 3 -> item 4 sequencing)
import { db, pool } from "./client.js";
import { employees, admins, departments, attachments, tickets, replies, broadcasts } from "./schema.js";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding passwordless test employee (TEST-NEW)...");
  await db
    .insert(employees)
    .values({ code: "TEST-NEW", passwordHash: null, label: "Passwordless test account", whatsappNumber: "+919800009999" })
    .onConflictDoNothing({ target: employees.code });

  const [dept] = await db.select().from(departments).where(eq(departments.slug, "energy_utility")).limit(1);
  const [energyAdmin] = await db.select().from(admins).where(eq(admins.code, "KN-03")).limit(1);
  if (!dept || !energyAdmin) throw new Error("expected seed data missing — run db:seed + seed-department-admins first");

  console.log("Seeding a ticket + reply (linking KN-03) + a broadcast from KN-03...");
  const [textAttachment] = await db
    .insert(attachments)
    .values({ kind: "text", textContent: "Test ticket for FK-restrict verification" })
    .returning();
  const [ticket] = await db
    .insert(tickets)
    .values({
      id: `TKT-TEST-${Date.now()}`,
      employeeCode: "STR-1042",
      departmentId: dept.id,
      status: "open",
      title: "Test ticket",
      attachmentId: textAttachment.id,
    })
    .returning();
  const [replyAttachment] = await db
    .insert(attachments)
    .values({ kind: "text", textContent: "Test reply from KN-03" })
    .returning();
  await db.insert(replies).values({
    ticketId: ticket.id,
    fromRole: "admin",
    adminId: energyAdmin.id,
    attachmentId: replyAttachment.id,
  });
  await db.insert(broadcasts).values({
    senderAdminId: energyAdmin.id,
    targetType: "all",
    message: "Test broadcast from KN-03",
  });

  console.log("Fixtures seeded. KN-03 now has a reply + a broadcast on file (should block deletion until wiped).");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
