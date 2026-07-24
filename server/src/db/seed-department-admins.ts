import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, pool } from "./client.js";
import { admins, adminDepartments, departments } from "./schema.js";

const DEPARTMENT_ADMINS = [
  { slug: "infrastructure", code: "KN-02", email: "infrastructure@company.com", password: "INFRA-ADMIN", name: "Infrastructure Admin" },
  { slug: "energy_utility", code: "KN-03", email: "energy@company.com", password: "ENERGY-ADMIN", name: "Energy & Utility Admin" },
  { slug: "hospitality", code: "KN-04", email: "hospitality@company.com", password: "HOSPITALITY-ADMIN", name: "Hospitality Admin" },
  { slug: "workplace_operation", code: "KN-05", email: "workplace@company.com", password: "WORKPLACE-ADMIN", name: "Workplace Operation Admin" },
  { slug: "fleet_operation", code: "KN-06", email: "fleet@company.com", password: "FLEET-ADMIN", name: "Fleet Operation Admin" },
  { slug: "health_security", code: "KN-07", email: "health@company.com", password: "HEALTH-ADMIN", name: "Health & Security Admin" },
  { slug: "other", code: "KN-08", email: "other@company.com", password: "OTHER-ADMIN", name: "Other Issues Admin" },
];

async function main() {
  for (const da of DEPARTMENT_ADMINS) {
    const [dept] = await db.select().from(departments).where(eq(departments.slug, da.slug)).limit(1);
    if (!dept) {
      console.error(`Department not found for slug ${da.slug} — skipping ${da.code}`);
      continue;
    }

    await db
      .insert(admins)
      .values({
        code: da.code,
        email: da.email,
        passwordHash: await bcrypt.hash(da.password, 10),
        name: da.name,
        isMaster: false,
      })
      .onConflictDoNothing({ target: admins.email });

    const [admin] = await db.select().from(admins).where(eq(admins.email, da.email)).limit(1);
    if (!admin) continue;

    await db
      .insert(adminDepartments)
      .values({ adminId: admin.id, departmentId: dept.id })
      .onConflictDoNothing();

    console.log(`${da.code} (${da.password}) -> ${dept.name}`);
  }

  console.log("Department admins seeded.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
