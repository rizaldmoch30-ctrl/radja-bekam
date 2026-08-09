import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { patientVisits, services, therapistCommissions, therapists, patients } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const visits = await db
      .select({
        visitId: patientVisits.id,
        serviceName: services.name,
        commAmount: therapistCommissions.amount,
        therapistName: therapists.name,
        patientName: patients.name,
        visitDate: patientVisits.visitDate
      })
      .from(patientVisits)
      .innerJoin(services, eq(patientVisits.serviceId, services.id))
      .innerJoin(therapists, eq(patientVisits.therapistId, therapists.id))
      .innerJoin(patients, eq(patientVisits.patientId, patients.id))
      .leftJoin(therapistCommissions, eq(patientVisits.id, therapistCommissions.visitId))
      .orderBy(desc(patientVisits.createdAt))
      .limit(20);

    return NextResponse.json({ visits });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
