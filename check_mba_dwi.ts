import { config } from "dotenv";
config({ path: ".env.local" }); 

async function run() {
  const { db } = await import("./src/lib/db");
  const { financeTransactions } = await import("./src/lib/db/schema");
  const { eq, and, like } = await import("drizzle-orm");

  const invId = "f947dbbb-ef35-4221-872e-d8e7883447de"; // MBA DWI 254k
  const finTxs = await db.select().from(financeTransactions).where(eq(financeTransactions.referenceId, invId));
  console.log("Finance transactions for MBA DWI invoice:");
  console.log(finTxs);
  
  // also get all finance transactions for today
  const allFinTxs = await db.select().from(financeTransactions).where(like(financeTransactions.date, "2026-07-26%"));
  
  let qrisFin = 0;
  for (const f of allFinTxs) {
    if (f.paymentMethod === "QRIS" && f.type === "INCOME") {
      qrisFin += f.amount;
    }
  }
  console.log("QRIS Total in finance: ", qrisFin);
}

run().then(() => process.exit(0)).catch(console.error);
