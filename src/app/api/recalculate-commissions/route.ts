import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { therapistCommissions, patientVisits, therapistMonthlyReports } from "@/lib/db/schema";
import { eq, and, like } from "drizzle-orm";
import { calculateTherapistCommission } from "@/lib/commission";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Memulai sinkronisasi ulang komisi historis...");

    // Ambil semua komisi beserta data layanannya
    const commissions = await db
      .select({
        id: therapistCommissions.id,
        therapistId: therapistCommissions.therapistId,
        visitId: therapistCommissions.visitId,
        amount: therapistCommissions.amount,
        serviceId: patientVisits.serviceId,
        visitDate: patientVisits.visitDate,
      })
      .from(therapistCommissions)
      .innerJoin(patientVisits, eq(therapistCommissions.visitId, patientVisits.id));

    let fixedCount = 0;
    const fixedDetails = [];
    const affectedMonths = new Set<string>(); // Format: therapistId|YYYY-MM

    for (const c of commissions) {
      if (!c.serviceId || !c.therapistId) continue;

      // Kalkulasi ulang menggunakan rule terbaru (Override > Global > Flat)
      const correctAmount = await calculateTherapistCommission(
        db,
        c.therapistId,
        c.serviceId,
        1
      );

      if (c.amount !== correctAmount) {
        await db
          .update(therapistCommissions)
          .set({ amount: correctAmount })
          .where(eq(therapistCommissions.id, c.id));
        fixedCount++;
        fixedDetails.push(`Diperbarui komisi ${c.id}: Rp ${c.amount} -> Rp ${correctAmount}`);
        
        if (c.visitDate) {
          const month = c.visitDate.substring(0, 7);
          affectedMonths.add(`${c.therapistId}|${month}`);
        }
      }
    }

    // Sync reports
    let syncedReportsCount = 0;
    for (const affected of affectedMonths) {
      const [therapistId, month] = affected.split("|");
      
      // Get all commissions for this therapist in this month
      const monthCommissions = await db
        .select({ amount: therapistCommissions.amount })
        .from(therapistCommissions)
        .innerJoin(patientVisits, eq(therapistCommissions.visitId, patientVisits.id))
        .where(
          and(
            eq(therapistCommissions.therapistId, therapistId),
            like(patientVisits.visitDate, `${month}%`)
          )
        );
        
      const totalComm = monthCommissions.reduce((s, c) => s + c.amount, 0);
      
      const report = await db
        .select()
        .from(therapistMonthlyReports)
        .where(
          and(
            eq(therapistMonthlyReports.therapistId, therapistId),
            eq(therapistMonthlyReports.month, month)
          )
        )
        .limit(1);
        
      if (report.length > 0) {
        const r = report[0];
        const newThp = r.baseSalary + totalComm + r.allowances + r.bonuses - r.deductions;
        await db
          .update(therapistMonthlyReports)
          .set({ 
            commissions: totalComm,
            takeHomePay: newThp,
            updatedAt: new Date().toISOString()
          })
          .where(eq(therapistMonthlyReports.id, r.id));
        syncedReportsCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil memperbaiki ${fixedCount} data komisi dan mensinkronisasi ${syncedReportsCount} laporan bulanan.`,
      details: fixedDetails
    });

  } catch (error: any) {
    console.error("Gagal sinkronisasi komisi:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
