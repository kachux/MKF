import { NextRequest, NextResponse } from "next/server";
import { ServerDb } from "@/lib/serverDb";

export async function GET() {
  try {
    const messages = ServerDb.getVoiceMessages();
    return NextResponse.json({ success: true, messages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch voice messages";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userName, userEmail, userRole, audioUrl, duration, transcript, responseText, status } = body;

    if (!transcript && !audioUrl) {
      return NextResponse.json(
        { success: false, error: "Either transcript or audioUrl is required." },
        { status: 400 }
      );
    }

    const saved = ServerDb.addVoiceMessage({
      userName: userName || "Festival Delegate",
      userEmail: userEmail || "",
      userRole: userRole || "delegate",
      audioUrl: audioUrl || "",
      duration: duration || 0,
      transcript: transcript || "Voice recording",
      responseText: responseText || "",
      status: status || "processed"
    });

    return NextResponse.json({ success: true, message: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save voice message";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
