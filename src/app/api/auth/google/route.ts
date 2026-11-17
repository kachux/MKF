import { NextResponse } from "next/server";
import { ServerDb } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user } = body;

    if (!user || !user.id) {
      return NextResponse.json({ success: false, error: "User payload is required" }, { status: 400 });
    }

    ServerDb.saveUser(user);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
