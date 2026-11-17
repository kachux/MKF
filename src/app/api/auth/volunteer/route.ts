import { NextResponse } from "next/server";
import { ServerDb } from "@/lib/serverDb";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { passcode, name, team } = body;

    if (!passcode) {
      return NextResponse.json({ success: false, error: "Volunteer passcode is required" }, { status: 400 });
    }

    const isValid = ServerDb.verifyVolunteerPasscode(passcode);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid volunteer access passcode" }, { status: 401 });
    }

    const volunteerName = (name && name.trim()) || "Field Volunteer";
    const volunteerTeam = team || "General Support";
    const volunteerId = `vol-${Date.now().toString().slice(-4)}`;

    const volunteerUser = {
      id: volunteerId,
      name: volunteerName,
      role: "volunteer",
      team: volunteerTeam,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    };

    // Register active volunteer in database
    ServerDb.registerVolunteer(volunteerUser);

    return NextResponse.json({
      success: true,
      token: `vol_token_${Date.now()}`,
      user: volunteerUser,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
