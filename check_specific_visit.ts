import { db } from "./src/lib/db";
import { visits, services } from "./src/lib/db/schema";
import { calculateTherapistCommission } from "./src/lib/commission";
import { eq, like, and } from "drizzle-orm";

async function run() {
  const v = await db.select({
    id: visits.id,
    therapistId: visits.therapistId,
    serviceId: visits.serviceId,
    amount: visits.amount,
    commissionAmount: visits.commissionAmount,
    status: visits.status,
    patientName: visits.patientName,
    visitDate: visits.visitDate
  }).from(visits)
  .where(and(like(visits.patientName, "%edi%"), like(visits.visitDate, "%2026-07-15%")));

  console.log("Found visits:", v);

  if (v.length > 0) {
    for (const visit of v) {
      if (visit.therapistId && visit.serviceId) {
        const comm = await calculateTherapistCommission(visit.therapistId, visit.serviceId);
        console.log(`Recalculated commission for visit ${visit.id}:`, comm);
        
        // update the visit
        await db.update(visits).set({ commissionAmount: comm }).where(eq(visits.id, visit.id));
        console.log(`Updated visit ${visit.id} to have commission ${comm}`);
      }
    }
  }
}

run().then(() => process.exit(0));
