import { config } from "dotenv";
config({ path: ".env.local" }); 

async function run() {
  const { db } = await import("./src/lib/db");
  const { patientVisits, invoices, financeTransactions, journalEntries, journalLines, therapists, branches } = await import("./src/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const { randomUUID } = await import("crypto");
  const { COA } = await import("./src/lib/accounting");

  // Get the visit
  const visit = await db.select().from(patientVisits).where(eq(patientVisits.id, "V-1785073167195-2015")).limit(1);
  if (visit.length === 0) throw new Error("Visit not found");
  const v = visit[0];

  // Get therapist and branch
  const th = await db.select().from(therapists).where(eq(therapists.id, v.therapistId!)).limit(1);
  const br = await db.select().from(branches).where(eq(branches.id, v.branchId)).limit(1);

  // Generate invoice number
  // Format: INV-RAD-20260726-xxx
  // We will just use the next sequence
  const { generateInvoiceNumber } = await import("./src/lib/utils/invoice"); // wait, doesn't exist. I'll just hardcode or find max.
  const allInvs = await db.select({ invoiceNumber: invoices.invoiceNumber }).from(invoices).where(eq(invoices.branchId, v.branchId));
  let maxSeq = 0;
  for (const i of allInvs) {
    const parts = i.invoiceNumber.split("-");
    const num = parseInt(parts[parts.length - 1]);
    if (num > maxSeq) maxSeq = num;
  }
  const nextSeq = String(maxSeq + 1).padStart(3, "0");
  const invoiceNumber = `INV-${br[0].name.substring(0,3).toUpperCase()}-20260726-${nextSeq}`;
  
  console.log(`Creating invoice ${invoiceNumber} for ${v.patientName}`);

  const invoiceId = randomUUID();
  const now = "2026-07-26T14:14:15.000Z"; // Same time

  await db.transaction(async (tx) => {
    // Insert invoice
    await tx.insert(invoices).values({
      id: invoiceId,
      invoiceNumber,
      visitId: v.id,
      patientId: v.patientId,
      patientName: v.patientName,
      patientPhone: "08", // Not in visit, just use dummy
      therapistId: v.therapistId,
      therapistName: v.therapistName,
      branchId: v.branchId,
      branchName: br[0].name,
      branchAddress: br[0].address,
      branchPhone: br[0].phone,
      items: v.services,
      subtotal: v.totalAmount,
      discount: 0,
      tax: 0,
      grandTotal: v.totalAmount,
      paymentMethod: "QRIS", // The user wants QRIS!
      amountPaid: v.totalAmount,
      changeAmount: 0,
      notes: "Rekap ulang otomatis dari visit",
      createdAt: now,
    });

    const finTrxId = randomUUID();
    await tx.insert(financeTransactions).values({
      id: finTrxId,
      type: "INCOME",
      category: "Pendapatan Layanan",
      amount: v.totalAmount,
      description: `Struk ${invoiceNumber} - ${v.patientName}`,
      referenceId: invoiceId,
      branchId: v.branchId,
      paymentMethod: "QRIS", // QRIS!
      date: now,
    });

    const journalId = randomUUID();
    await tx.insert(journalEntries).values({
      id: journalId,
      date: now,
      description: `[POS] ${invoiceNumber} - ${v.patientName}`,
      referenceId: finTrxId,
    });

    await tx.insert(journalLines).values([
      {
        id: randomUUID(),
        entryId: journalId,
        accountId: COA.KAS,
        debit: v.totalAmount,
        credit: 0,
      },
      {
        id: randomUUID(),
        entryId: journalId,
        accountId: COA.PENDAPATAN_LAYANAN,
        debit: 0,
        credit: v.totalAmount,
      }
    ]);
  });
  
  console.log("Re-created MBA DWI invoice as QRIS successfully.");
}

run().then(() => process.exit(0)).catch(console.error);
