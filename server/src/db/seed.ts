import bcrypt from "bcryptjs";
import { db, pool } from "./client.js";
import { departments, employees, admins } from "./schema.js";

const DEPARTMENTS = [
  { slug: "infrastructure", name: "Infrastructure", sortOrder: 1 },
  { slug: "energy_utility", name: "Energy & Utility Management", sortOrder: 2 },
  { slug: "hospitality", name: "Hospitality Services", sortOrder: 3 },
  { slug: "workplace_operation", name: "Workplace Operation", sortOrder: 4 },
  { slug: "fleet_operation", name: "Fleet Operation", sortOrder: 5 },
  { slug: "health_security", name: "Health & Security", sortOrder: 6 },
  { slug: "other", name: "Any other Issue", sortOrder: 7 },
];

async function main() {
  console.log("Seeding departments...");
  for (const d of DEPARTMENTS) {
    await db.insert(departments).values(d).onConflictDoNothing({ target: departments.slug });
  }

  console.log("Seeding demo employee (STR-1042)...");
  const demoWhatsapp = "+243980001042";
  await db
    .insert(employees)
    .values({
      code: "STR-1042",
      passwordHash: await bcrypt.hash(demoWhatsapp, 10),
      label: "Downtown flagship",
      whatsappNumber: demoWhatsapp,
    })
    .onConflictDoNothing({ target: employees.code });

  console.log("Seeding demo master admin (KN-01)...");
  await db
    .insert(admins)
    .values({
      code: "KN-01",
      email: "admin@company.com",
      passwordHash: await bcrypt.hash("MT-ADMIN", 10),
      name: "Admin",
      isMaster: true,
    })
    .onConflictDoNothing({ target: admins.email });

  console.log("Seed complete.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
