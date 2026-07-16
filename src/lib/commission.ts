import { eq } from "drizzle-orm";
import { services } from "@/lib/db/schema";

/**
 * ⚠️ WARNING UNTUK AI AGENTS & DEVELOPERS:
 * FUNGSI INI ADALAH SINGLE SOURCE OF TRUTH UNTUK PERHITUNGAN KOMISI TERAPIS.
 * DILARANG KERAS membuat ulang logika perhitungan komisi di file lain.
 * Selalu panggil fungsi ini jika Anda perlu menghitung komisi.
 * 
 * Hierarki Komisi:
 * Komisi HANYA diambil dari Global commission per layanan (`services.globalCommission`)
 * 
 * @param dbInstance - Instance Drizzle DB (bisa `db` biasa atau `tx` dari transaksi)
 * @param serviceId - ID layanan terapi
 * @param qty - Jumlah layanan (default 1)
 * @returns Nominal komisi total yang berhak didapatkan
 */
export function calculateCommissionAmount(params: {
  serviceGlobalCommission: number;
  qty: number;
}): number {
  return (params.serviceGlobalCommission || 0) * (params.qty || 0);
}

export async function calculateTherapistCommission(
  dbInstance: any,
  therapistId: string, // Kept for backwards compatibility if needed, though unused
  serviceId: string,
  qty: number = 1
): Promise<number> {
  const svcRow = await dbInstance
    .select({ gc: services.globalCommission })
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1);

  const serviceGlobalCommission = svcRow.length > 0 ? svcRow[0].gc : 0;

  return calculateCommissionAmount({
    serviceGlobalCommission,
    qty
  });
}
