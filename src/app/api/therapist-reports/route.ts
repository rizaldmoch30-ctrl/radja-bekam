import { db } from "@/lib/db";
import { therapists, therapistMonthlyReports, patientVisits, attendance, therapistCommissions } from "@/lib/db/schema";
import { eq, and, like } from "drizzle-orm";
import { getSession, getActiveBranchFilter } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // YYYY-MM

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return Response.json({ error: "Periode bulan (YYYY-MM) wajib diisi" }, { status: 400 });
    }

    const branchFilter = await getActiveBranchFilter();

    // 1. Fetch therapists in the active branch
    const therapistConditions = [eq(therapists.isActive, true)];
    if (branchFilter) {
      therapistConditions.push(eq(therapists.branchId, branchFilter));
    }

    const activeTherapists = await db
      .select()
      .from(therapists)
      .where(and(...therapistConditions));

    // 2. Fetch existing saved reports for this month
    const savedReports = await db
      .select()
      .from(therapistMonthlyReports)
      .where(eq(therapistMonthlyReports.month, month));

    const savedReportsMap = new Map(savedReports.map(r => [r.therapistId, r]));

    // 3. For each therapist, map existing report or calculate defaults
    const data = await Promise.all(
      activeTherapists.map(async (t) => {
        const saved = savedReportsMap.get(t.id);
        if (saved) {
          return {
            ...saved,
            therapistName: t.name,
            branchId: t.branchId,
            isSaved: true,
          };
        }

        // Auto-calculate performance metrics and commissions
        // A. Completed visits count
        const completedVisits = await db
          .select({ id: patientVisits.id })
          .from(patientVisits)
          .where(
            and(
              eq(patientVisits.therapistId, t.id),
              eq(patientVisits.status, "completed"),
              like(patientVisits.visitDate, `${month}%`)
            )
          );
        const totalTreatments = completedVisits.length;

        // B. Attendance counts
        const attendanceLogs = await db
          .select({ status: attendance.status })
          .from(attendance)
          .where(
            and(
              eq(attendance.therapistId, t.id),
              like(attendance.date, `${month}%`)
            )
          );

        let present = 0;
        let late = 0;
        let absent = 0;
        attendanceLogs.forEach((log) => {
          if (log.status === "PRESENT") present++;
          else if (log.status === "LATE") late++;
          else if (log.status === "ABSENT") absent++;
        });

        // C. Commissions sum
        const commissionLogs = await db
          .select({ amount: therapistCommissions.amount })
          .from(therapistCommissions)
          .innerJoin(patientVisits, eq(therapistCommissions.visitId, patientVisits.id))
          .where(
            and(
              eq(therapistCommissions.therapistId, t.id),
              like(patientVisits.visitDate, `${month}%`)
            )
          );
        const totalCommissions = commissionLogs.reduce((sum, c) => sum + c.amount, 0);

        // Prepopulate THP
        const takeHomePay = t.baseSalary + totalCommissions;

        return {
          id: null,
          therapistId: t.id,
          therapistName: t.name,
          branchId: t.branchId,
          month,
          totalTreatments,
          attendancePresent: present,
          attendanceLate: late,
          attendanceAbsent: absent,
          attendancePermit: 0,
          baseSalary: t.baseSalary,
          commissions: totalCommissions,
          allowances: 0,
          bonuses: 0,
          deductions: 0,
          takeHomePay,
          notesStrengths: "",
          notesImprovements: "",
          notesTargets: "",
          rating: "5.0", // Default rating
          isSaved: false,
        };
      })
    );

    return Response.json({ data });
  } catch (error) {
    console.error("GET /api/therapist-reports error:", error);
    return Response.json({ error: "Gagal mengambil data laporan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      therapistId,
      month,
      totalTreatments,
      attendancePresent,
      attendanceLate,
      attendanceAbsent,
      attendancePermit,
      baseSalary,
      commissions,
      allowances,
      bonuses,
      deductions,
      takeHomePay,
      notesStrengths,
      notesImprovements,
      notesTargets,
      rating,
    } = body;

    if (!therapistId || !month) {
      return Response.json({ error: "Data terapis dan bulan wajib diisi" }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (id) {
      // Update existing report
      await db
        .update(therapistMonthlyReports)
        .set({
          totalTreatments: parseInt(totalTreatments) || 0,
          attendancePresent: parseInt(attendancePresent) || 0,
          attendanceLate: parseInt(attendanceLate) || 0,
          attendanceAbsent: parseInt(attendanceAbsent) || 0,
          attendancePermit: parseInt(attendancePermit) || 0,
          baseSalary: parseInt(baseSalary) || 0,
          commissions: parseInt(commissions) || 0,
          allowances: parseInt(allowances) || 0,
          bonuses: parseInt(bonuses) || 0,
          deductions: parseInt(deductions) || 0,
          takeHomePay: parseInt(takeHomePay) || 0,
          notesStrengths: notesStrengths || "",
          notesImprovements: notesImprovements || "",
          notesTargets: notesTargets || "",
          rating: rating || "5.0",
          updatedAt: now,
        })
        .where(eq(therapistMonthlyReports.id, id));

      return Response.json({ success: true, id });
    } else {
      // Check if report already exists for this therapist and month
      const existing = await db
        .select()
        .from(therapistMonthlyReports)
        .where(
          and(
            eq(therapistMonthlyReports.therapistId, therapistId),
            eq(therapistMonthlyReports.month, month)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return Response.json({ error: "Laporan untuk terapis ini pada bulan ini sudah dibuat" }, { status: 400 });
      }

      // Create new report with secure UUID
      const newId = crypto.randomUUID();
      await db.insert(therapistMonthlyReports).values({
        id: newId,
        therapistId,
        month,
        totalTreatments: parseInt(totalTreatments) || 0,
        attendancePresent: parseInt(attendancePresent) || 0,
        attendanceLate: parseInt(attendanceLate) || 0,
        attendanceAbsent: parseInt(attendanceAbsent) || 0,
        attendancePermit: parseInt(attendancePermit) || 0,
        baseSalary: parseInt(baseSalary) || 0,
        commissions: parseInt(commissions) || 0,
        allowances: parseInt(allowances) || 0,
        bonuses: parseInt(bonuses) || 0,
        deductions: parseInt(deductions) || 0,
        takeHomePay: parseInt(takeHomePay) || 0,
        notesStrengths: notesStrengths || "",
        notesImprovements: notesImprovements || "",
        notesTargets: notesTargets || "",
        rating: rating || "5.0",
        createdAt: now,
        updatedAt: now,
      });

      return Response.json({ success: true, id: newId });
    }
  } catch (error) {
    console.error("POST /api/therapist-reports error:", error);
    return Response.json({ error: "Gagal menyimpan laporan" }, { status: 500 });
  }
}
