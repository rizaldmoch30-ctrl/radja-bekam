const { db } = require('./src/lib/db/index.js');
const { invoices, patientVisits, therapistCommissions, patients, services } = require('./src/lib/db/schema.js');
const { ilike, inArray, eq } = require('drizzle-orm');

async function run() {
  const invs = await db.select().from(invoices).where(ilike(invoices.patientName, '%MARNAH%'));
  console.log('INVOICES:', invs);

  if (invs.length === 0) return;
  const patientId = invs[0].patientId;

  const visits = await db.select({
      id: patientVisits.id,
      serviceId: patientVisits.serviceId,
      visitDate: patientVisits.visitDate,
      visitTime: patientVisits.visitTime,
      status: patientVisits.status,
      paymentStatus: patientVisits.paymentStatus,
      serviceName: services.name
  }).from(patientVisits)
    .leftJoin(services, eq(patientVisits.serviceId, services.id))
    .where(eq(patientVisits.patientId, patientId));
  console.log('VISITS:', visits);

  const visitIds = visits.map(v => v.id);
  const comms = await db.select().from(therapistCommissions).where(inArray(therapistCommissions.visitId, visitIds));
  console.log('COMMISSIONS:', comms);

  process.exit(0);
}
run();
