import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./src/lib/db";
import { services, therapistCommissions, patientVisits } from "./src/lib/db/schema";
import { eq, like } from "drizzle-orm";

async function run() {
  const svcs = await db.select().from(services).where(like(services.name, "%Kepala%"));
  console.log("Services matching 'Kepala':", svcs);
  
  // Find the specific visit for "koh edi"
  const visits = await db.select({
      id: patientVisits.id,
      patientId: patientVisits.patientId,
      serviceId: patientVisits.serviceId,
      therapistId: patientVisits.therapistId,
      status: patientVisits.status,
      paymentStatus: patientVisits.paymentStatus,
      date: patientVisits.visitDate
  })
  .from(patientVisits)
  // Join therapistCommissions
  .where(like(patientVisits.visitDate, "%2026-07-15%"));
  
  console.log("Visits on 15 July:", visits);
  
  const commissions = await db.select().from(therapistCommissions).where(like(therapistCommissions.createdAt, "%2026-07-15%"));
  console.log("Commissions on 15 July:", commissions);
}

run().then(() => process.exit(0));
