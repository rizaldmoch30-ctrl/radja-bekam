import { config } from "dotenv";
config({ path: ".env.local" }); 

async function run() {
  const { db } = await import("./src/lib/db");
  const { invoices } = await import("./src/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  const invs = await db.select().from(invoices).where(eq(invoices.invoiceNumber, "INV-RAD-20260726-118"));
  console.log("Invoices with 118:");
  for (const inv of invs) {
    console.log(`- ${inv.id}: ${inv.patientName} (${inv.grandTotal})`);
  }
}

run().then(() => process.exit(0)).catch(console.error);
