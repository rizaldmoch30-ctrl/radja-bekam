import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { therapistServiceCommissions } from "@/lib/db/schema";

export async function GET() {
  try {
    await db.delete(therapistServiceCommissions);
    return NextResponse.json({ message: "Semua override komisi berhasil dihapus dari database." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
