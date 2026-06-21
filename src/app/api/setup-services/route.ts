import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allServices = await db.select().from(services);
    
    for (const s of allServices) {
      const name = s.name.toLowerCase();
      let newCategory: "Terapi Bekam" | "Pijat & Refleksi" | "Paket Kombinasi" | "Layanan Medis & Ekstra" = "Terapi Bekam";
      
      if (name.includes("refleksi") && name.includes("bekam")) {
        newCategory = "Paket Kombinasi";
      } else if (name.includes("paket") || name.includes("bundling")) {
        newCategory = "Paket Kombinasi";
      } else if (name.includes("refleksi") || name.includes("pijat") || name.includes("totok")) {
        newCategory = "Pijat & Refleksi";
      } else if (name.includes("cek") || name.includes("mcu") || name.includes("infrared")) {
        newCategory = "Layanan Medis & Ekstra";
      } else {
        newCategory = "Terapi Bekam";
      }

      await db.update(services).set({ category: newCategory }).where(eq(services.id, s.id));
    }

    return NextResponse.json({ success: true, message: "Services categorized successfully!" });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
