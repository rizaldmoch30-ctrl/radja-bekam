import test from "node:test";
import assert from "node:assert/strict";
import { calculateCommissionAmount } from "../src/lib/commission.ts";

// Test suite for Commission Logic
test("Sistem Komisi Terapis - Hierarki & Prioritas", async (t) => {
  
  await t.test("Prioritas 1: Override Terapis harus mengalahkan Global dan Flat Rate", () => {
    const result = calculateCommissionAmount({
      customOverrideAmount: 50000,
      serviceGlobalCommission: 30000,
      therapistFlatRate: 20000,
      qty: 1
    });
    assert.equal(result, 50000, "Override terapis gagal mendominasi prioritas");
  });

  await t.test("Prioritas 2: Global Commission harus dipakai jika Override tidak ada (null)", () => {
    const result = calculateCommissionAmount({
      customOverrideAmount: null, // Tidak ada override
      serviceGlobalCommission: 30000,
      therapistFlatRate: 20000,
      qty: 1
    });
    assert.equal(result, 30000, "Global commission gagal dipakai sebagai prioritas ke-2");
  });

  await t.test("Prioritas 3: Flat Rate harus dipakai jika Override dan Global tidak ada/0", () => {
    const result = calculateCommissionAmount({
      customOverrideAmount: null,
      serviceGlobalCommission: 0,
      therapistFlatRate: 20000,
      qty: 1
    });
    assert.equal(result, 20000, "Flat rate gagal dipakai sebagai fallback terakhir");
  });

  await t.test("Edge Case: Override bernilai 0 (menggratiskan layanan) harus tetap dipakai (bukan null)", () => {
    const result = calculateCommissionAmount({
      customOverrideAmount: 0, // Override eksplisit 0
      serviceGlobalCommission: 30000,
      therapistFlatRate: 20000,
      qty: 1
    });
    assert.equal(result, 0, "Override 0 diabaikan. Ini berisiko membuat komisi bocor!");
  });

  await t.test("Edge Case: Tidak ada komisi sama sekali (semua null/0)", () => {
    const result = calculateCommissionAmount({
      customOverrideAmount: null,
      serviceGlobalCommission: 0,
      therapistFlatRate: 0,
      qty: 1
    });
    assert.equal(result, 0, "Komisi default seharusnya 0");
  });

  await t.test("Multiplier: Qty > 1 harus mengkalikan hasil akhir (misal pembayaran POS)", () => {
    const result = calculateCommissionAmount({
      customOverrideAmount: 15000, // Menang
      serviceGlobalCommission: 30000,
      therapistFlatRate: 20000,
      qty: 3
    });
    assert.equal(result, 45000, "Perkalian Qty gagal (15000 * 3 != 45000)");
  });

  await t.test("Multiplier: Qty 0 harus menghasilkan 0", () => {
    const result = calculateCommissionAmount({
      customOverrideAmount: null,
      serviceGlobalCommission: 30000,
      therapistFlatRate: 20000,
      qty: 0
    });
    assert.equal(result, 0, "Layanan dengan Qty 0 tidak boleh menghasilkan komisi");
  });

});
