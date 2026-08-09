import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateTherapistCommission } from "@/lib/commission";
import { therapistServiceCommissions, therapists } from "@/lib/db/schema";
import { eq, ilike } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const therapist = await db.select().from(therapists).where(ilike(therapists.name, "%Akmal%")).limit(1);
    const therapistId = therapist[0].id;
    const serviceId = "SRV-1783669257259";

    const expected = await calculateTherapistCommission(db, therapistId, serviceId, 1);
    
    const override = await db.select().from(therapistServiceCommissions).where(eq(therapistServiceCommissions.therapistId, therapistId));

    return NextResponse.json({ expected, override });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
