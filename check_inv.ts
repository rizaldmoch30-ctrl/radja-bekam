import { config } from "dotenv";
config({ path: ".env.local" }); 

async function run() {
  const { db } = await import("./src/lib/db");
  const { invoices } = await import("./src/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  const invId = "788fa6c5-af41-450a-bb79-3de77dafc01c";
  const logs = await db.select().from(invoices).where(eq(invoices.id, invId));
  console.log(logs);
}

run().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
