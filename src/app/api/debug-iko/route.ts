import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { therapistServiceCommissions } from "@/lib/db/schema";

export async function GET(request: Request) {
  try {
    const overrides = await db
      .select()
      .from(therapistServiceCommissions)
      .limit(100);

    return NextResponse.json({ overrides });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
