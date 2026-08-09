import { eq, and } from "drizzle-orm";
import { services, therapists, therapistServiceCommissions } from "@/lib/db/schema";

/**
 * ⚠️ WARNING UNTUK AI AGENTS & DEVELOPERS:
 * FUNGSI INI ADALAH SINGLE SOURCE OF TRUTH UNTUK PERHITUNGAN KOMISI TERAPIS.
 * DILARANG KERAS membuat ulang logika perhitungan komisi di file lain.
 * Selalu panggil fungsi ini jika Anda perlu menghitung komisi.
 * 
 * Hierarki Komisi:
 * 1. Override Commission (therapistServiceCommissions)
 * 2. Global Commission (services.globalCommission)
 * 3. Flat Rate Commission (therapists.commissionRate)
 * 
 * @param dbInstance - Instance Drizzle DB (bisa `db` biasa atau `tx` dari transaksi)
 * @param therapistId - ID terapis
 * @param serviceId - ID layanan terapi
 * @param qty - Jumlah layanan (default 1)
 * @returns Nominal komisi total yang berhak didapatkan
 */
export function calculateCommissionAmount(params: {
  overrideCommission?: number | null;
  serviceGlobalCommission?: number | null;
  therapistCommissionRate?: number | null;
  servicePrice?: number;
  serviceName?: string;
  qty: number;
}): number {
  const qty = params.qty || 0;
  const price = params.servicePrice || 0;

  const resolveAmount = (val: number) => {
    if (val > 0 && val <= 100) {
      return (val / 100) * price;
    }
    return val;
  };

  // 1. Override
  if (params.overrideCommission != null) {
    return resolveAmount(params.overrideCommission) * qty;
  }

  // 1.5. Dynamic Backend Logic based on Service Name Keywords
  if (params.serviceName) {
    const nameLower = params.serviceName.toLowerCase();
    let dynamicCommission = 0;
    let matched = false;

    // Hardcoded rules requested by user
    if (nameLower.includes("bekam holistik")) {
      dynamicCommission += 35000;
      matched = true;
    }
    
    if (nameLower.includes("refleksi")) {
      dynamicCommission += 30000;
      matched = true;
    }
    
    if (nameLower.includes("bekam kepala")) {
      dynamicCommission += 15000;
      matched = true;
    }

    if (matched) {
      return dynamicCommission * qty;
    }
  }

  // 2. Global
  if (params.serviceGlobalCommission != null && params.serviceGlobalCommission > 0) {
    return resolveAmount(params.serviceGlobalCommission) * qty;
  }

  // 3. Flat Rate
  if (params.therapistCommissionRate != null && params.therapistCommissionRate > 0) {
    return resolveAmount(params.therapistCommissionRate) * qty;
  }

  return 0;
}

export async function calculateTherapistCommission(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dbInstance: any,
  therapistId: string,
  serviceId: string,
  qty: number = 1
): Promise<number> {
  // 1. Override
  const overrideRow = await dbInstance
    .select({ amount: therapistServiceCommissions.commissionAmount })
    .from(therapistServiceCommissions)
    .where(
      and(
        eq(therapistServiceCommissions.therapistId, therapistId),
        eq(therapistServiceCommissions.serviceId, serviceId)
      )
    )
    .limit(1);
    
  const overrideCommission = overrideRow.length > 0 ? overrideRow[0].amount : null;

  // 2. Global, Price & Name
  const svcRow = await dbInstance
    .select({ gc: services.globalCommission, price: services.price, name: services.name })
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1);

  const serviceGlobalCommission = svcRow.length > 0 ? svcRow[0].gc : 0;
  const servicePrice = svcRow.length > 0 ? svcRow[0].price : 0;
  const serviceName = svcRow.length > 0 ? svcRow[0].name : "";

  // 3. Flat Rate
  const thRow = await dbInstance
    .select({ cr: therapists.commissionRate })
    .from(therapists)
    .where(eq(therapists.id, therapistId))
    .limit(1);

  const therapistCommissionRate = thRow.length > 0 ? thRow[0].cr : 0;

  return calculateCommissionAmount({
    overrideCommission,
    serviceGlobalCommission,
    therapistCommissionRate,
    servicePrice,
    serviceName,
    qty
  });
}
