import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./src/lib/db";
import { services, therapistCommissions, patientVisits } from "./src/lib/db/schema";
import { eq, like, and } from "drizzle-orm";
import { calculateTherapistCommission } from "./src/lib/commission";

async function run() {
  const svcs = await db.select().from(services).where(like(services.name, "%Kepala%"));
  console.log("Services matching 'Kepala':", svcs.map(s => ({ name: s.name, gc: s.globalCommission })));
  
  // Find the specific visit for "koh edi"
  const v = await db.select({
      id: patientVisits.id,
      patientId: patientVisits.patientId,
      serviceId: patientVisits.serviceId,
      therapistId: patientVisits.therapistId,
      status: patientVisits.status,
      paymentStatus: patientVisits.paymentStatus,
      date: patientVisits.visitDate
  })
  .from(patientVisits)
  .where(like(patientVisits.visitDate, "%2026-07-15%"));
  
  // Actually let's query the specific patient directly from patients table joined to visits, but we don't have patient names directly in visits.
  // Wait, I can just find the visits that had the service matching "Kepala"
  const serviceIds = svcs.map(s => s.id);
  const matchedVisits = v.filter(visit => serviceIds.includes(visit.serviceId));
  
  console.log("Visits on 15 July for 'Kepala' services:", matchedVisits);
  
  for (const visit of matchedVisits) {
    const commissions = await db.select().from(therapistCommissions).where(eq(therapistCommissions.visitId, visit.id));
    console.log(`Commissions for visit ${visit.id}:`, commissions);
    
    if (visit.therapistId) {
       const calculated = await calculateTherapistCommission(db, visit.therapistId, visit.serviceId);
       console.log(`Calculated commission using commission.ts: ${calculated}`);
    }
  }
}

run().then(() => process.exit(0));
