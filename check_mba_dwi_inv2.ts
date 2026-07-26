import { config } from "dotenv";
config({ path: ".env.local" }); 

async function run() {
  const { db } = await import("./src/lib/db");
  const { invoices } = await import("./src/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  const invs = await db.select().from(invoices).where(eq(invoices.id, "f947dbbb-ef35-4221-872e-d8e7883447de"));
  console.log("Check if f947dbbb... exists:");
  console.log(invs);
}

run().then(() => process.exit(0)).catch(console.error);
