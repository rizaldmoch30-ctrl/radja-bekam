import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./src/lib/db";
import { invoices, financeTransactions } from "./src/lib/db/schema";
import { like, eq, and } from "drizzle-orm";

async function run() {
  const dateStr = "2026-07-26";
  
  const invs = await db.select().from(invoices).where(like(invoices.createdAt, `${dateStr}%`));
  
  let qrisTotal = 0;
  let qrisCount = 0;
  
  for (const inv of invs) {
    if (inv.paymentMethod === "QRIS") {
      qrisTotal += inv.amountPaid || inv.grandTotal;
      qrisCount++;
    } else if (inv.paymentMethod === "SPLIT" && inv.splitPayments) {
      try {
        const splits = JSON.parse(inv.splitPayments);
        for (const sp of splits) {
          if (sp.method === "QRIS") {
            qrisTotal += sp.amount;
            qrisCount++; // counting split part as 1 or just add to total?
          }
        }
      } catch (e) {}
    }
  }
  
  console.log(`Invoices QRIS Total: ${qrisTotal}, Count: ${qrisCount}`);
  
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

run().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
