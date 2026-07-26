import { config } from "dotenv";
config({ path: ".env.local" }); // MUST be first

async function run() {
  const { db } = await import("./src/lib/db");
  const { systemLogs, financeTransactions, invoices, patientVisits } = await import("./src/lib/db/schema");
  const { like } = await import("drizzle-orm");

  const dateStr = "2026-07-26";
  
  const logs = await db.select().from(systemLogs).where(like(systemLogs.createdAt, `${dateStr}%`));
  
  console.log("System Logs:");
  logs.forEach(l => {
    if (l.action.includes("DELETE") || l.action.includes("ERROR")) {
      console.log(`[${l.createdAt}] ${l.action} - ${l.entityType} ${l.entityId} : ${l.details}`);
    }
  });

  const invs = await db.select().from(invoices).where(like(invoices.createdAt, `${dateStr}%`));
  let cashTotal = 0, qrisTotal = 0, debitTotal = 0, transferTotal = 0;
  
  for (const inv of invs) {
    if (inv.paymentMethod === "CASH") cashTotal += inv.grandTotal;
    if (inv.paymentMethod === "QRIS") qrisTotal += inv.grandTotal;
    if (inv.paymentMethod === "DEBIT") debitTotal += inv.grandTotal;
    if (inv.paymentMethod === "TRANSFER") transferTotal += inv.grandTotal;
    if (inv.paymentMethod === "SPLIT") {
       const sps = JSON.parse(inv.splitPayments || "[]");
       for (const sp of sps) {
         if (sp.method === "CASH") cashTotal += sp.amount;
         if (sp.method === "QRIS") qrisTotal += sp.amount;
         if (sp.method === "DEBIT") debitTotal += sp.amount;
         if (sp.method === "TRANSFER") transferTotal += sp.amount;
       }
    }
  }
  
  console.log(`\nInvoices Summary:`);
  console.log(`CASH: ${cashTotal}`);
  console.log(`QRIS: ${qrisTotal}`);
  console.log(`DEBIT: ${debitTotal}`);
  console.log(`TRANSFER: ${transferTotal}`);
  
  const visits = await db.select().from(patientVisits).where(like(patientVisits.createdAt, `${dateStr}%`));
  const unpaidVisits = visits.filter(v => v.paymentStatus === "UNPAID");
  console.log(`\nUnpaid visits: ${unpaidVisits.length}`);
}

run().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
