import { db } from "@/lib/db";
import { patientVisits, financeTransactions, therapists, therapistCommissions, patients, therapistServiceCommissions, invoices, branches } from "@/lib/db/schema";
import { eq, and, like, desc } from "drizzle-orm";
import { getServicePrice, SERVICES_LIST } from "@/lib/pricing";
import { createJournalEntry, COA } from "@/lib/accounting";
import { checkBranchAccess, getSession } from "@/lib/auth";
import crypto from "crypto";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: visitId } = await params;
    const body = await request.json();
    const { paymentMethod } = body;

    if (!paymentMethod) {
      return Response.json({ error: "Metode pembayaran harus diisi" }, { status: 400 });
    }

    // 1. Dapatkan data kunjungan
    const visitsRecords = await db.select().from(patientVisits).where(eq(patientVisits.id, visitId)).limit(1);
    if (visitsRecords.length === 0) {
      return Response.json({ error: "Kunjungan tidak ditemukan" }, { status: 404 });
    }
    const visit = visitsRecords[0];

    // Enforce branch access check
    const isAllowed = await checkBranchAccess(visit.branchId);
    if (!isAllowed) {
      return Response.json({ error: "Forbidden: Anda tidak memiliki akses ke cabang ini" }, { status: 403 });
    }

    if (visit.paymentStatus === "PAID") {
      return Response.json({ error: "Kunjungan sudah lunas" }, { status: 400 });
    }

    // 2. Dapatkan data pasien untuk deskripsi transaksi
    const patientRecords = await db.select().from(patients).where(eq(patients.id, visit.patientId)).limit(1);
    const patientName = patientRecords.length > 0 ? patientRecords[0].name : "Unknown";

    // 3. Dapatkan harga layanan berdasarkan cabang
    const basePrice = getServicePrice(visit.branchId, visit.serviceId);
    const serviceDetail = SERVICES_LIST.find(s => s.id === visit.serviceId);
    const serviceName = serviceDetail ? serviceDetail.name : visit.serviceId;

    if (basePrice > 0) {
      // A. Catat Pemasukan (Income)
      const newTrxId = crypto.randomUUID();
      const trxDate = new Date().toISOString();

      await db.insert(financeTransactions).values({
        id: newTrxId,
        type: "INCOME",
        category: "Pendapatan Layanan",
        amount: basePrice,
        description: `Pembayaran Terapi (${serviceName}) atas nama ${patientName}`,
        referenceId: visitId,
        branchId: visit.branchId,
        paymentMethod: paymentMethod,
        date: trxDate
      });

      // Otomatisasi Jurnal (Debet: Kas, Kredit: Pendapatan Layanan)
      await createJournalEntry({
        date: trxDate,
        description: `[Auto] Pendapatan Layanan: ${serviceName} - ${patientName}`,
        referenceId: newTrxId,
        debitAccountId: COA.KAS,
        creditAccountId: COA.PENDAPATAN_LAYANAN,
        amount: basePrice
      });

      // B. Catat Komisi Terapis (PENDING)
      if (visit.therapistId) {
        const therapistRecords = await db.select().from(therapists).where(eq(therapists.id, visit.therapistId)).limit(1);
        if (therapistRecords.length > 0) {
          const therapist = therapistRecords[0];
          
          // Check for service commission override first
          const customOverride = await db
            .select()
            .from(therapistServiceCommissions)
            .where(
              and(
                eq(therapistServiceCommissions.therapistId, visit.therapistId),
                eq(therapistServiceCommissions.serviceId, visit.serviceId)
              )
            )
            .limit(1);

          let commissionAmount = 0;
          if (customOverride.length > 0 && customOverride[0].commissionAmount !== null) {
            commissionAmount = customOverride[0].commissionAmount;
          }

          if (commissionAmount > 0) {
            await db.insert(therapistCommissions).values({
              id: crypto.randomUUID(),
              therapistId: visit.therapistId,
              visitId: visitId,
              amount: commissionAmount,
              status: "PENDING",
            });

            // Langsung catat komisi sebagai pengeluaran / beban di sistem keuangan
            const commTrxId = crypto.randomUUID();
            await db.insert(financeTransactions).values({
              id: commTrxId,
              type: "EXPENSE",
              category: "Bagi Hasil Terapis",
              amount: commissionAmount,
              description: `Bagi Hasil Terapis (${therapist.name}) untuk layanan ${serviceName} pasien ${patientName}`,
              referenceId: visitId,
              branchId: visit.branchId,
              paymentMethod: "CASH", // Asumsi disisihkan via kas
              date: trxDate
            });

            // Otomatisasi Jurnal (Debet: Beban Komisi, Kredit: Kas)
            await createJournalEntry({
              date: trxDate,
              description: `[Auto] Beban Bagi Hasil Terapis: ${therapist.name} - ${serviceName}`,
              referenceId: commTrxId,
              debitAccountId: COA.BEBAN_KOMISI,
              creditAccountId: COA.KAS,
              amount: commissionAmount
            });
          }
        }
      }
    }

    // 4. Update status kunjungan menjadi PAID
    const payDate = new Date().toISOString();
    await db.update(patientVisits)
      .set({ paymentStatus: "PAID", updatedAt: payDate })
      .where(eq(patientVisits.id, visitId));

    // 5. Auto-generate invoice/struk
    let invoiceId = null;
    try {
      const branchRecords = await db.select().from(branches).where(eq(branches.id, visit.branchId)).limit(1);
      const branch = branchRecords[0];
      if (branch && basePrice > 0) {
        const dateStr = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" }).replace(/-/g, "");
        const branchCode = branch.name.substring(0, 3).toUpperCase();
        const prefix = `INV-${branchCode}-${dateStr}`;
        const existingInvoices = await db.select().from(invoices).where(like(invoices.invoiceNumber, `${prefix}%`)).orderBy(desc(invoices.invoiceNumber));
        let seq = 1;
        if (existingInvoices.length > 0) {
          const lastSeq = parseInt(existingInvoices[0].invoiceNumber.split("-").pop() || "0");
          seq = lastSeq + 1;
        }
        const invoiceNumber = `${prefix}-${seq.toString().padStart(3, "0")}`;

        invoiceId = crypto.randomUUID();
        const therapistRecords2 = visit.therapistId ? await db.select().from(therapists).where(eq(therapists.id, visit.therapistId)).limit(1) : [];

        await db.insert(invoices).values({
          id: invoiceId,
          invoiceNumber,
          visitId,
          patientId: visit.patientId,
          patientName,
          patientPhone: patientRecords[0]?.phone || "",
          therapistId: visit.therapistId || null,
          therapistName: therapistRecords2.length > 0 ? therapistRecords2[0].name : null,
          branchId: visit.branchId,
          branchName: branch.name,
          branchAddress: branch.address,
          branchPhone: branch.phone,
          items: JSON.stringify([{ serviceId: visit.serviceId, name: serviceName, qty: 1, price: basePrice, subtotal: basePrice }]),
          subtotal: basePrice,
          discount: 0,
          tax: 0,
          grandTotal: basePrice,
          paymentMethod,
          amountPaid: basePrice,
          changeAmount: 0,
          createdAt: payDate,
        });
      }
    } catch (invoiceErr) {
      console.error("Auto-generate invoice error (non-fatal):", invoiceErr);
    }

    return Response.json({ success: true, message: "Pembayaran berhasil diproses", invoiceId });
  } catch (error) {
    console.error("POST /api/patient-visits/[id]/pay error:", error);
    return Response.json({ error: "Gagal memproses pembayaran" }, { status: 500 });
  }
}
