import { config } from "dotenv";
config({ path: ".env.local" }); 

async function run() {
  const { db } = await import("./src/lib/db");
  const { invoices } = await import("./src/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  const invs = await db.select().from(invoices).where(eq(invoices.id, "788fa6c5-af41-450a-bb79-3de77dafc01c"));
  console.log("Deleted invoice 117:");
  console.log(invs);
}

run().then(() => process.exit(0)).catch(console.error);
