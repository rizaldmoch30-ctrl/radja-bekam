import test from "node:test";
import assert from "node:assert/strict";
import { calculateCommissionAmount } from "../src/lib/commission";

test("Sistem Komisi Terapis - Hierarki", async (t) => {
  
  await t.test("1. Override: Menggunakan Override Commission meskipun ada Global dan Flat Rate", () => {
    const result = calculateCommissionAmount({
      overrideCommission: 50000,
      serviceGlobalCommission: 30000,
      therapistCommissionRate: 20000,
      qty: 1
    });
    assert.equal(result, 50000, "Gagal menggunakan Override Commission");
  });

  await t.test("1b. Override: Boleh bernilai 0 (Terapis tidak dapat komisi untuk layanan ini)", () => {
    const result = calculateCommissionAmount({
      overrideCommission: 0,
      serviceGlobalCommission: 30000,
      therapistCommissionRate: 20000,
      qty: 1
    });
    assert.equal(result, 0, "Override 0 harusnya valid dan mengembalikan 0");
  });

  await t.test("2. Global: Menggunakan Global Commission jika tidak ada Override", () => {
    const result = calculateCommissionAmount({
      overrideCommission: null,
      serviceGlobalCommission: 30000,
      therapistCommissionRate: 20000,
      qty: 1
    });
    assert.equal(result, 30000, "Gagal menggunakan Global Commission saat Override kosong");
  });

  await t.test("3. Flat Rate: Menggunakan Flat Rate jika Override null dan Global 0", () => {
    const result = calculateCommissionAmount({
      overrideCommission: undefined,
      serviceGlobalCommission: 0,
      therapistCommissionRate: 20000,
      qty: 1
    });
    assert.equal(result, 20000, "Gagal menggunakan Flat Rate saat Global 0");
  });

  await t.test("4. Fallback: Mengembalikan 0 jika semuanya null atau 0", () => {
    const result = calculateCommissionAmount({
      overrideCommission: null,
      serviceGlobalCommission: 0,
      therapistCommissionRate: 0,
      qty: 1
    });
    assert.equal(result, 0, "Harusnya mengembalikan 0");
  });

  await t.test("Multiplier: Qty > 1 harus mengkalikan hasil akhir (Override)", () => {
    const result = calculateCommissionAmount({
      overrideCommission: 50000,
      qty: 3
    });
    assert.equal(result, 150000, "Perkalian Qty gagal untuk Override");
  });

  await t.test("Multiplier: Qty > 1 harus mengkalikan hasil akhir (Global)", () => {
    const result = calculateCommissionAmount({
      overrideCommission: null,
      serviceGlobalCommission: 30000,
      qty: 3
    });
    assert.equal(result, 90000, "Perkalian Qty gagal untuk Global");
  });

  await t.test("Multiplier: Qty 0 harus menghasilkan 0", () => {
    const result = calculateCommissionAmount({
      overrideCommission: 50000,
      qty: 0
    });
    assert.equal(result, 0, "Layanan dengan Qty 0 tidak boleh menghasilkan komisi");
  });

});
