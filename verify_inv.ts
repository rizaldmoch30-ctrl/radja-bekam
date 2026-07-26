import { config } from "dotenv";
config({ path: ".env.local" }); 

async function run() {
  const { db } = await import("./src/lib/db");
  const { invoices } = await import("./src/lib/db/schema");
  const { like } = await import("drizzle-orm");

  const invs = await db.select().from(invoices).where(like(invoices.createdAt, "2026-07-26%"));
  console.log(`Total invoices for 2026-07-26: ${invs.length}`);
  
  const mbaDwi = invs.find(i => i.patientName === "MBA DWI");
  if (mbaDwi) {
    console.log(`Found MBA DWI: ${mbaDwi.paymentMethod}, Amount: ${mbaDwi.grandTotal}`);
  } else {
    console.log("MBA DWI not found in today's invoices!");
  }
}

run().then(() => process.exit(0)).catch(console.error);
