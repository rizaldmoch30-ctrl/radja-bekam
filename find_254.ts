import { config } from "dotenv";
config({ path: ".env.local" }); 

async function run() {
  const { db } = await import("./src/lib/db");
  const { systemLogs } = await import("./src/lib/db/schema");
  const { like } = await import("drizzle-orm");

  const logs = await db.select().from(systemLogs).where(like(systemLogs.createdAt, "2026-07-26%"));
  
  console.log("Deleted invoices matching 254000 or anything related:");
  for (const log of logs) {
    if (log.action.includes("DELETE") && log.details.includes("254000")) {
      console.log(`[${log.createdAt}] ${log.details}`);
    }
  }
}

run().then(() => process.exit(0)).catch(console.error);
