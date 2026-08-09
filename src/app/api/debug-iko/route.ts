import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { patientVisits, services, therapistCommissions, therapists } from "@/lib/db/schema";
import { eq, ilike } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const visits = await db
      .select({
        visitId: patientVisits.id,
        serviceId: patientVisits.serviceId,
        serviceName: services.name,
        commAmount: therapistCommissions.amount,
        therapistName: therapists.name,
        visitDate: patientVisits.visitDate
      })
      .from(patientVisits)
      .innerJoin(services, eq(patientVisits.serviceId, services.id))
      .innerJoin(therapists, eq(patientVisits.therapistId, therapists.id))
      .leftJoin(therapistCommissions, eq(patientVisits.id, therapistCommissions.visitId))
      .where(ilike(therapists.name, "%MAS NUR FIQIH%"))
      .limit(100);

    return NextResponse.json({ visits });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
