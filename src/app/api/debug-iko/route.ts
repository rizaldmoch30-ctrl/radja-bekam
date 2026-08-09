import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { patientVisits, patients, services, therapists } from "@/lib/db/schema";
import { eq, like, and } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const visits = await db.select({
      visitId: patientVisits.id,
      date: patientVisits.visitDate,
      patientName: patients.name,
      serviceName: services.name,
      therapistName: therapists.name,
      price: services.price,
      globalComm: services.globalCommission
    })
    .from(patientVisits)
    .leftJoin(patients, eq(patientVisits.patientId, patients.id))
    .leftJoin(services, eq(patientVisits.serviceId, services.id))
    .leftJoin(therapists, eq(patientVisits.therapistId, therapists.id))
    .where(and(like(patients.name, '%RIKO%'), eq(patientVisits.visitDate, '2026-08-01')));
    
    return NextResponse.json(visits);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
