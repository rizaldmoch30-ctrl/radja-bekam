import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { therapists, patientVisits, patients, services, therapistCommissions, therapistServiceCommissions } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { getSession, checkBranchAccess, getActiveBranchFilter } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // YYYY-MM format

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: "Query parameter 'month' (YYYY-MM) diperlukan" }, { status: 400 });
    }

    const [year, m] = month.split("-");
    const filterStartDate = `${year}-${m}-01`;
    const lastDay = new Date(parseInt(year), parseInt(m), 0).getDate();
    const filterEndDate = `${year}-${m}-${String(lastDay).padStart(2, "0")}`;

    // Get therapist info to verify existence and access
    const therapistData = await db.select().from(therapists).where(eq(therapists.id, id)).limit(1);
    
    if (therapistData.length === 0) {
      return NextResponse.json({ error: "Terapis tidak ditemukan" }, { status: 404 });
    }

    const therapist = therapistData[0];

    // Authorization checks
    if (session.role === "THERAPIST") {
      // Allow if the session name matches the therapist name or if they have the same phone
      if (session.name !== therapist.name && session.username !== therapist.phone) {
        return NextResponse.json({ error: "Forbidden: Anda hanya bisa melihat data Anda sendiri" }, { status: 403 });
      }
    } else {
      const isAllowed = await checkBranchAccess(therapist.branchId);
      if (!isAllowed) {
        return NextResponse.json({ error: "Forbidden: Anda tidak memiliki akses ke data cabang ini" }, { status: 403 });
      }
    }

    const branchFilter = await getActiveBranchFilter();
    
    const visitConditions: any[] = [
      eq(patientVisits.therapistId, id),
      gte(patientVisits.visitDate, filterStartDate),
      lte(patientVisits.visitDate, filterEndDate)
    ];

    if (branchFilter) {
      visitConditions.push(eq(patientVisits.branchId, branchFilter));
    }

    // Fetch visits for this therapist in the specified month
    const visits = await db
      .select({
        id: patientVisits.id,
        visitDate: patientVisits.visitDate,
        visitTime: patientVisits.visitTime,
        status: patientVisits.status,
        patientName: patients.name,
        serviceName: services.name,
        servicePrice: services.price,
        serviceId: patientVisits.serviceId,
        commissionAmount: therapistCommissions.amount,
        commissionStatus: therapistCommissions.status,
      })
      .from(patientVisits)
      .leftJoin(patients, eq(patientVisits.patientId, patients.id))
      .leftJoin(services, eq(patientVisits.serviceId, services.id))
      .leftJoin(therapistCommissions, eq(patientVisits.id, therapistCommissions.visitId))
      .where(and(...visitConditions));

    // Fetch all custom commissions for fallback
    const allCustomCommissions = await db
      .select()
      .from(therapistServiceCommissions);

    const therapistCommissionMap = new Map<string, number>();
    const globalCommissionMap = new Map<string, number>();

    for (const cc of allCustomCommissions) {
      if (cc.commissionAmount !== null) {
        if (cc.therapistId === id) {
          therapistCommissionMap.set(cc.serviceId, cc.commissionAmount);
        }
        if (!globalCommissionMap.has(cc.serviceId)) {
          globalCommissionMap.set(cc.serviceId, cc.commissionAmount);
        }
      }
    }

    // Group visits by date, time, and patient to avoid duplicate rows for multiple services
    const groupedVisits = new Map<string, any>();
    
    for (const v of visits) {
      const key = `${v.visitDate}_${v.visitTime}_${v.patientName}`;
      
      // Calculate missing commission dynamically if it's null
      let actualCommission = v.commissionAmount;
      if (actualCommission === null || actualCommission === undefined) {
        if (therapistCommissionMap.has(v.serviceId)) {
          actualCommission = therapistCommissionMap.get(v.serviceId);
        } else if (globalCommissionMap.has(v.serviceId)) {
          actualCommission = globalCommissionMap.get(v.serviceId);
        } else {
          actualCommission = therapist.commissionRate || 0;
        }
      }

      if (groupedVisits.has(key)) {
        const existing = groupedVisits.get(key);
        
        // Ensure we don't add the same patientVisit's service and price multiple times
        if (!existing.visitedIds.has(v.id)) {
          existing.serviceName += `, ${v.serviceName}`;
          existing.servicePrice = (existing.servicePrice || 0) + (v.servicePrice || 0);
          
          // Add dynamically calculated commission for this new service
          existing.commissionAmount = (existing.commissionAmount || 0) + (actualCommission || 0);
          
          existing.visitedIds.add(v.id);
        } else if (v.commissionAmount !== null) {
          // If it's the SAME visitId but DIFFERENT commission rows from DB (due to leftJoin)
          existing.commissionAmount = (existing.commissionAmount || 0) + (v.commissionAmount || 0);
        }
        
        // Use "in_progress" if any part of the visit is still in progress
        if (v.status === "in_progress") {
          existing.status = "in_progress";
        }
      } else {
        const newGroup = { ...v, commissionAmount: actualCommission, visitedIds: new Set([v.id]) };
        groupedVisits.set(key, newGroup);
      }
    }
    
    const combinedVisits = Array.from(groupedVisits.values());

    // Sort descending by date and time
    combinedVisits.sort((a, b) => {
      const dateA = new Date(`${a.visitDate}T${a.visitTime}`);
      const dateB = new Date(`${b.visitDate}T${b.visitTime}`);
      return dateB.getTime() - dateA.getTime();
    });

    const totalTreatments = combinedVisits.filter(v => v.status === "completed").length;
    const totalCommissions = combinedVisits.reduce((sum, v) => sum + (v.commissionAmount || 0), 0);

    return NextResponse.json({
      therapist: {
        id: therapist.id,
        name: therapist.name,
        specialization: therapist.specialization,
      },
      period: {
        month,
        startDate: filterStartDate,
        endDate: filterEndDate,
      },
      summary: {
        totalTreatments,
        totalCommissions,
      },
      data: combinedVisits,
    });
  } catch (error) {
    console.error("GET /api/therapists/[id]/history error:", error);
    return NextResponse.json({ error: "Gagal mengambil riwayat pasien terapis" }, { status: 500 });
  }
}
