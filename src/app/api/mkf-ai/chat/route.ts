import { NextRequest, NextResponse } from "next/server";
import { askMKFAI, ChatMessage, FestivalContextData } from "@/lib/mkfAiService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context } = body as {
      messages: ChatMessage[];
      context?: FestivalContextData;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required." },
        { status: 400 }
      );
    }

    const result = await askMKFAI(messages, context);

    return NextResponse.json({
      success: true,
      text: result.text,
      assistant: "MKF AI"
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "MKF AI service is temporarily unavailable. Please try again in a moment.";
    console.error("[MKF AI Route Error]:", message);
    return NextResponse.json(
      {
        success: false,
        error: message
      },
      { status: 500 }
    );
  }
}
