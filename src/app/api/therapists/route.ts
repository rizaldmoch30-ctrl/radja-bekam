import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { therapists, patientVisits, financeTransactions } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getSession, getActiveBranchFilter } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branchFilter = await getActiveBranchFilter();

    const therapistsConditions = [];
    let visitsConditions = [eq(patientVisits.status, "completed")];
    let financesConditions = [eq(financeTransactions.category, "Gaji Terapis")];

    if (branchFilter) {
      therapistsConditions.push(eq(therapists.branchId, branchFilter));
      visitsConditions.push(eq(patientVisits.branchId, branchFilter));
      financesConditions.push(eq(financeTransactions.branchId, branchFilter));
    }

    const allTherapists = await db
      .select()
      .from(therapists)
      .where(therapistsConditions.length > 0 ? and(...therapistsConditions) : undefined)
      .orderBy(desc(therapists.joinedAt));
    
    // Kalkulasi KPI scoped to branch
    const allVisits = await db.select().from(patientVisits).where(and(...visitsConditions));
    const allFinances = await db.select().from(financeTransactions).where(and(...financesConditions));

    const enriched = allTherapists.map(t => {
      const handled = allVisits.filter(v => v.therapistId === t.id).length;
      // Filter transaksi komisi berdasarkan nama terapis di deskripsi
      const commission = allFinances.filter(f => f.description.includes(t.name)).reduce((sum, f) => sum + f.amount, 0);
      return { ...t, patientsHandled: handled, totalCommission: commission };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Failed to fetch therapists:", error);
    return NextResponse.json({ error: "Failed to fetch therapists" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, specialization, phone, gender, baseSalary, commissionRate, isActive, branchId, photoUrl, birthDate, pinCode } = body;

    if (!name || !specialization || !phone || !gender) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Enforce branch for branch admin
    const finalBranchId = session.role === "BRANCH_ADMIN" ? session.branchId : (branchId || null);

    const newTherapist = {
      id: crypto.randomUUID(),
      name,
      specialization,
      phone,
      gender,
      branchId: finalBranchId,
      baseSalary: baseSalary ? parseInt(baseSalary) : 0,
      commissionRate: commissionRate ? parseInt(commissionRate) : 0,
      photoUrl: photoUrl || null,
      birthDate: birthDate || null,
      pinCode: pinCode || null,
      isActive: isActive !== undefined ? isActive : true,
      joinedAt: new Date().toISOString(),
    };

    await db.insert(therapists).values(newTherapist);

    return NextResponse.json(newTherapist, { status: 201 });
  } catch (error) {
    console.error("Failed to create therapist:", error);
    return NextResponse.json({ error: "Failed to create therapist" }, { status: 500 });
  }
}
