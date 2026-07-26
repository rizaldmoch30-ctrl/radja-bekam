import { config } from "dotenv";
config({ path: ".env.local" }); 

async function run() {
  const { db } = await import("./src/lib/db");
  const { financeTransactions } = await import("./src/lib/db/schema");
  const { like, eq, and } = await import("drizzle-orm");

  const dateStr = "2026-07-26";
  const finTxs = await db.select().from(financeTransactions).where(
    and(
      like(financeTransactions.date, `${dateStr}%`),
      eq(financeTransactions.paymentMethod, "QRIS"),
      eq(financeTransactions.type, "INCOME")
    )
  );
  
  let finTotal = 0;
  for (const tx of finTxs) {
    finTotal += tx.amount;
  }
  
  console.log(`Finance Transactions QRIS Income: ${finTotal}, Count: ${finTxs.length}`);
}

run().then(() => process.exit(0)).catch(console.error);
