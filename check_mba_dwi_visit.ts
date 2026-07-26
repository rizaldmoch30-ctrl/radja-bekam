import { config } from "dotenv";
config({ path: ".env.local" }); 

async function run() {
  const { db } = await import("./src/lib/db");
  const { patientVisits } = await import("./src/lib/db/schema");
  const { like } = await import("drizzle-orm");

  const visits = await db.select().from(patientVisits).where(like(patientVisits.visitDate, "2026-07-26%"));
  for (const v of visits) {
    if (v.patientName === "MBA DWI" || v.patientName.includes("DWI")) {
      console.log(v);
    }
  }
}

run().then(() => process.exit(0)).catch(console.error);
