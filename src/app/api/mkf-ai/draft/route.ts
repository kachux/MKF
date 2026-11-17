import { NextRequest, NextResponse } from "next/server";
import { draftAnnouncementWithMKFAI } from "@/lib/mkfAiService";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const draft = await draftAnnouncementWithMKFAI(prompt);
    return NextResponse.json({ success: true, draft });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate announcement draft.";
    console.error("[MKF AI Draft Error]:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
