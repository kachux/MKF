import { NextRequest, NextResponse } from "next/server";
import { askMKFAI, ChatMessage, FestivalContextData } from "@/lib/mkfAiService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, message, prompt, text, context } = body as {
      messages?: ChatMessage[];
      message?: string;
      prompt?: string;
      text?: string;
      context?: FestivalContextData;
    };

    let chatMessages: ChatMessage[] = [];

    if (Array.isArray(messages) && messages.length > 0) {
      chatMessages = messages;
    } else if (typeof message === "string" && message.trim()) {
      chatMessages = [{ role: "user", content: message.trim() }];
    } else if (typeof prompt === "string" && prompt.trim()) {
      chatMessages = [{ role: "user", content: prompt.trim() }];
    } else if (typeof text === "string" && text.trim()) {
      chatMessages = [{ role: "user", content: text.trim() }];
    } else {
      return NextResponse.json(
        { error: "Invalid request: a message or messages array is required." },
        { status: 400 }
      );
    }

    const result = await askMKFAI(chatMessages, context);

    return NextResponse.json({
      success: true,
      text: result.text,
      modelUsed: result.modelUsed,
      assistant: "MKF AI"
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "MKF AI service is temporarily unavailable. Please try again in a moment.";
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
