import { NextResponse } from "next/server";
import { ServerDb } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminPwd = ServerDb.getSetting("admin_password", "admin123");
    const volPass = ServerDb.getSetting("volunteer_passcode", "mkf2026");
    const volunteers = ServerDb.getVolunteers();

    return NextResponse.json({
      success: true,
      currentAdminPassword: adminPwd,
      currentVolunteerPasscode: volPass,
      activeVolunteers: volunteers,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentAdminPassword, newAdminPassword, newVolunteerPasscode, action } = body;

    // Reset action
    if (action === "reset_festival") {
      if (!ServerDb.verifyAdminPassword(currentAdminPassword)) {
        return NextResponse.json({ success: false, error: "Incorrect admin password" }, { status: 401 });
      }
      ServerDb.resetAll();
      return NextResponse.json({ success: true, message: "Festival database reset to defaults" });
    }

    // Verify current admin password before updating security settings
    if (!ServerDb.verifyAdminPassword(currentAdminPassword)) {
      return NextResponse.json({ success: false, error: "Current admin password verification failed" }, { status: 401 });
    }

    if (newAdminPassword && newAdminPassword.trim().length >= 4) {
      ServerDb.setAdminPassword(newAdminPassword.trim());
    }

    if (newVolunteerPasscode && newVolunteerPasscode.trim().length >= 4) {
      ServerDb.setVolunteerPasscode(newVolunteerPasscode.trim());
    }

    return NextResponse.json({
      success: true,
      message: "Security credentials updated successfully",
      newAdminPassword: ServerDb.getSetting("admin_password"),
      newVolunteerPasscode: ServerDb.getSetting("volunteer_passcode"),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
