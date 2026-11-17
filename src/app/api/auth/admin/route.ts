import { NextResponse } from "next/server";
import { ServerDb } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ success: false, error: "Password is required" }, { status: 400 });
    }

    const isValid = ServerDb.verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Incorrect admin password" }, { status: 401 });
    }

    const adminUser = {
      id: "admin-master",
      name: "MKF Event Director",
      email: "admin@mkfconnect.org",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    };

    return NextResponse.json({
      success: true,
      token: `admin_token_${Date.now()}`,
      user: adminUser,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
