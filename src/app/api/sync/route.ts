import { NextResponse } from "next/server";
import { ServerDb } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = ServerDb.getFullSnapshot();
    return NextResponse.json({
      success: true,
      data: snapshot,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
