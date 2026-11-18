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

    let festivalContext = context;
    if (!festivalContext || (!festivalContext.programs?.length && !festivalContext.foodPrayer?.length)) {
      try {
        const { ServerDb } = await import("@/lib/serverDb");
        const progs = ServerDb.getPrograms();
        const fp = ServerDb.getFoodPrayer();
        const ann = ServerDb.getAnnouncements();
        festivalContext = {
          programs: progs.map((p) => ({
            title: p.title,
            speaker: p.speaker || "",
            start_time: p.start_time,
            end_time: p.end_time,
            venue: p.venue,
            status: p.status,
            category: p.category
          })),
          foodPrayer: fp.map((f) => ({
            type: f.type,
            title: f.title,
            time: f.time,
            location: f.location,
            status: f.status,
            notes: f.notes
          })),
          announcements: ann.map((a) => ({
            title: a.title,
            message: a.message,
            priority: a.priority,
            target: a.target
          }))
        };
      } catch {
        // continue with context as passed
      }
    }

    const result = await askMKFAI(chatMessages, festivalContext);

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
