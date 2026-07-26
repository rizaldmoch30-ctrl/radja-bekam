import { config } from "dotenv";
config({ path: ".env.local" }); 

async function run() {
  const { db } = await import("./src/lib/db");
  const { invoices } = await import("./src/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  const invs = await db.select().from(invoices).where(eq(invoices.visitId, "V-1785073167195-2015"));
  console.log("Invoices for MBA DWI visit:");
  console.log(invs);
}

run().then(() => process.exit(0)).catch(console.error);
