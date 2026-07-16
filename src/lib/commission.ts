import { eq, and } from "drizzle-orm";
import { therapistServiceCommissions, services, therapists } from "@/lib/db/schema";

/**
 * ⚠️ WARNING UNTUK AI AGENTS & DEVELOPERS:
 * FUNGSI INI ADALAH SINGLE SOURCE OF TRUTH UNTUK PERHITUNGAN KOMISI TERAPIS.
 * DILARANG KERAS membuat ulang logika perhitungan komisi di file lain.
 * Selalu panggil fungsi ini jika Anda perlu menghitung komisi.
 * 
 * Hierarki Komisi:
 * 1. Override per terapis per layanan (`therapistServiceCommissions`)
 * 2. Global commission per layanan (`services.globalCommission`)
 * 3. Flat rate default terapis (`therapists.commissionRate`)
 * 
 * @param dbInstance - Instance Drizzle DB (bisa `db` biasa atau `tx` dari transaksi)
 * @param therapistId - ID terapis
 * @param serviceId - ID layanan terapi
 * @param qty - Jumlah layanan (default 1)
 * @returns Nominal komisi total yang berhak didapatkan
 */
/**
 * Pure function untuk menghitung nominal komisi berdasarkan hierarki.
 * Sangat aman dan mudah di-test (Unit Testing).
 */
export function calculateCommissionAmount(params: {
  customOverrideAmount: number | null;
  serviceGlobalCommission: number;
  therapistFlatRate: number;
  qty: number;
}): number {
  let baseCommission = 0;
  if (params.customOverrideAmount !== null) {
    baseCommission = params.customOverrideAmount; // Prioritas 1
  } else if (params.serviceGlobalCommission > 0) {
    baseCommission = params.serviceGlobalCommission; // Prioritas 2
  } else {
    baseCommission = params.therapistFlatRate; // Prioritas 3
  }
  return baseCommission * params.qty;
}

export async function calculateTherapistCommission(
  dbInstance: any,
  therapistId: string,
  serviceId: string,
  qty: number = 1
): Promise<number> {
  // 1. Ambil semua kemungkinan data komisi
  const customOverride = await dbInstance
    .select({ amount: therapistServiceCommissions.commissionAmount })
    .from(therapistServiceCommissions)
    .where(
      and(
        eq(therapistServiceCommissions.therapistId, therapistId),
        eq(therapistServiceCommissions.serviceId, serviceId)
      )
    )
    .limit(1);

  const svcRow = await dbInstance
    .select({ gc: services.globalCommission })
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1);

  const therapistRow = await dbInstance
    .select({ rate: therapists.commissionRate })
    .from(therapists)
    .where(eq(therapists.id, therapistId))
    .limit(1);

  // 2. Ekstrak nilai mentah
  const customOverrideAmount = customOverride.length > 0 && customOverride[0].amount !== null 
    ? customOverride[0].amount 
    : null;
  
  const serviceGlobalCommission = svcRow.length > 0 ? svcRow[0].gc : 0;
  const therapistFlatRate = therapistRow.length > 0 ? therapistRow[0].rate : 0;

  // 3. Serahkan ke fungsi murni untuk dihitung
  return calculateCommissionAmount({
    customOverrideAmount,
    serviceGlobalCommission,
    therapistFlatRate,
    qty
  });
}
