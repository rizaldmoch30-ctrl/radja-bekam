import { config } from "dotenv";
config({ path: ".env.local" }); 

async function run() {
  const { db } = await import("./src/lib/db");
  const { invoices } = await import("./src/lib/db/schema");
  const { like } = await import("drizzle-orm");

  const invs = await db.select().from(invoices).where(like(invoices.createdAt, "2026-07-26%"));
  
  let cashTotal = 0;
  let cashCount = 0;
  console.log("CASH INVOICES TODAY:");
  for (const inv of invs) {
    if (inv.paymentMethod === "CASH") {
      cashTotal += inv.grandTotal;
      cashCount++;
      console.log(`- ${inv.invoiceNumber}: ${inv.patientName} (${inv.grandTotal})`);
    }
  }
  console.log(`Total CASH: ${cashTotal} (${cashCount} transactions)`);
}

run().then(() => process.exit(0)).catch(console.error);
