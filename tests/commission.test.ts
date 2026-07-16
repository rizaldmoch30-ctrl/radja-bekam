import test from "node:test";
import assert from "node:assert/strict";
import { calculateCommissionAmount } from "../src/lib/commission";

// Test suite for Commission Logic
test("Sistem Komisi Terapis - Global Commission Only", async (t) => {
  
  await t.test("Komisi dihitung berdasarkan Global Commission", () => {
    const result = calculateCommissionAmount({
      serviceGlobalCommission: 30000,
      qty: 1
    });
    assert.equal(result, 30000, "Gagal menggunakan Global Commission");
  });

  await t.test("Edge Case: Global Commission bernilai 0", () => {
    const result = calculateCommissionAmount({
      serviceGlobalCommission: 0,
      qty: 1
    });
    assert.equal(result, 0, "Komisi default seharusnya 0");
  });

  await t.test("Multiplier: Qty > 1 harus mengkalikan hasil akhir (misal pembayaran POS)", () => {
    const result = calculateCommissionAmount({
      serviceGlobalCommission: 30000,
      qty: 3
    });
    assert.equal(result, 90000, "Perkalian Qty gagal (30000 * 3 != 90000)");
  });

  await t.test("Multiplier: Qty 0 harus menghasilkan 0", () => {
    const result = calculateCommissionAmount({
      serviceGlobalCommission: 30000,
      qty: 0
    });
    assert.equal(result, 0, "Layanan dengan Qty 0 tidak boleh menghasilkan komisi");
  });

});
