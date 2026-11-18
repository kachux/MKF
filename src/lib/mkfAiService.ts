/**
 * MKF AI Service
 * Official AI assistant engine for MIC Knowledge Festival (MKF).
 * Strictly branded as MKF AI.
 */

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface FestivalContextData {
  programs?: Array<{
    title: string;
    speaker: string;
    start_time: string;
    end_time: string;
    venue: string;
    status: string;
    category?: string;
  }>;
  foodPrayer?: Array<{
    type: string;
    title: string;
    time: string;
    location: string;
    status: string;
    notes?: string;
  }>;
  announcements?: Array<{
    title: string;
    message: string;
    priority?: string;
    target?: string;
  }>;
  lostFoundCount?: number;
}

const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash"
];

function buildSystemPrompt(contextData?: FestivalContextData): string {
  let contextSection = "";

  if (contextData) {
    if (contextData.programs && contextData.programs.length > 0) {
      contextSection += "\n\n### CURRENT FESTIVAL PROGRAMS & SCHEDULE:\n";
      contextData.programs.forEach((p, idx) => {
        contextSection += `${idx + 1}. [${p.status.toUpperCase()}] "${p.title}" by ${p.speaker} | Time: ${p.start_time} - ${p.end_time} | Venue: ${p.venue} (Category: ${p.category || "General"})\n`;
      });
    }

    if (contextData.foodPrayer && contextData.foodPrayer.length > 0) {
      contextSection += "\n### FOOD & PRAYER ARRANGEMENTS:\n";
      contextData.foodPrayer.forEach((fp, idx) => {
        contextSection += `${idx + 1}. [${fp.type.toUpperCase()}] ${fp.title} | Time: ${fp.time} | Location: ${fp.location} | Status: ${fp.status} | Notes: ${fp.notes || "None"}\n`;
      });
    }

    if (contextData.announcements && contextData.announcements.length > 0) {
      contextSection += "\n### LIVE OFFICIAL ANNOUNCEMENTS:\n";
      contextData.announcements.forEach((a, idx) => {
        contextSection += `${idx + 1}. [Priority: ${a.priority || "normal"}] ${a.title}: ${a.message}\n`;
      });
    }
  }

  return `You are "MKF AI", the premier intelligent festival assistant created specifically for the MIC Knowledge Festival (MKF).

CRITICAL BRANDING RULES (NON-NEGOTIABLE):
1. You are MKF AI and ONLY MKF AI.
2. NEVER mention Gemini, Google, OpenAI, Anthropic, or any underlying model or technology company.
3. If anyone asks "Who created you?", "What model are you?", "Are you Gemini?", or similar, ALWAYS reply: "I am MKF AI, the dedicated artificial intelligence system for MIC Knowledge Festival."
4. Always speak with polite, welcoming, helpful, and energetic hospitality.

FESTIVAL KEY INFORMATION:
- Festival Name: MIC Knowledge Festival (MKF)
- Tagline: "One Festival. One Platform. Zero Confusion."
- Venues: Main Auditorium (Grand Hall), Seminar Hall A, Seminar Hall B (relays), Exhibition Pavilion, Dining Halls A/B/C, Lawn.
- Emergency Hotlines:
  * Medical Emergency: +91 98000 11122
  * Security Control Desk: +91 98000 33344
- Portal Sections:
  * Live Schedule: /schedule
  * Announcements: /announcements
  * Food & Prayer: /food-prayer
  * Lost & Found: /lost-found
  * Help Desk / Volunteer Dispatch: /help-desk

CURRENT FESTIVAL LIVE CONTEXT:${contextSection || "\nRefer to official schedule, food, prayer, and help desk services."}

BEHAVIOR GUIDELINES:
- Answer accurately based on the current schedule and live context above.
- If an ongoing program or meal is active, highlight it immediately.
- If an attendee is lost, needs medical care, or has an emergency, immediately provide the relevant hotline number (+91 98000 11122 for Medical, +91 98000 33344 for Security) and advise them to submit a ticket at the Help Desk (/help-desk).
- Support English, Malayalam (മലയാളം), Hindi (हिंदी), Urdu (اردو), and Arabic (العربية) smoothly depending on the user's inquiry language.
- Keep answers clear, structured with bullet points where appropriate, and easy to read on mobile devices.`;
}

export async function askMKFAI(
  messages: ChatMessage[],
  contextData?: FestivalContextData
): Promise<{ text: string; modelUsed: string }> {
  const apiKey = process.env.MKF_AI_API_KEY;
  if (!apiKey) {
    throw new Error("MKF_AI_API_KEY is not configured on the server.");
  }

  const systemInstruction = buildSystemPrompt(contextData);

  // Convert messages to Gemini API format
  // API expects: contents: [ { role: 'user' | 'model', parts: [{ text }] } ]
  const contents = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

  // If there are no user messages, throw an error
  if (contents.length === 0) {
    throw new Error("No user message provided to MKF AI.");
  }

  let lastError: Error | null = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024
            }
          }),
          // 10 seconds timeout
          signal: AbortSignal.timeout(10000)
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.warn(`[MKF AI] Model ${model} returned status ${response.status}:`, errorBody);
        lastError = new Error(`Model ${model} failed with ${response.status}`);
        continue;
      }

      const json = await response.json();
      const generatedText = json.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText && generatedText.trim().length > 0) {
        return {
          text: generatedText.trim(),
          modelUsed: "MKF-AI-Core"
        };
      } else {
        lastError = new Error("Empty candidate response");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[MKF AI] Failed with ${model}:`, errMsg);
      lastError = err instanceof Error ? err : new Error(errMsg);
    }
  }

  // Intelligent local fallback if API keys or remote endpoints are unavailable
  const lastUserMsg = messages.filter((m) => m.role === "user").slice(-1)[0]?.content.toLowerCase() || "";
  
  if (lastUserMsg.includes("schedule") || lastUserMsg.includes("session") || lastUserMsg.includes("programme") || lastUserMsg.includes("today")) {
    const progs = contextData?.programs || [];
    if (progs.length > 0) {
      const progList = progs.slice(0, 3).map((p) => `• **${p.title}** by ${p.speaker} (${p.start_time} - ${p.end_time}) at **${p.venue}**`).join("\n");
      return {
        text: `Here is the current festival programme:\n\n${progList}\n\nYou can view the full schedule under [Schedules](/schedule).`,
        modelUsed: "MKF-Local-Knowledge"
      };
    }
  }

  if (lastUserMsg.includes("lost") || lastUserMsg.includes("found") || lastUserMsg.includes("item")) {
    return {
      text: `To report or find a missing item:\n\n1. Visit the **Lost & Found Counter** near Main Gate 1.\n2. Submit a quick report online via our [Lost & Found Portal](/lost-found).\n3. Alert any on-duty volunteer wearing an MKF badge for immediate broadcast.`,
      modelUsed: "MKF-Local-Knowledge"
    };
  }

  if (lastUserMsg.includes("venue") || lastUserMsg.includes("auditorium") || lastUserMsg.includes("stage") || lastUserMsg.includes("hall") || lastUserMsg.includes("where")) {
    return {
      text: `Here are key stages & venues across the MIC Knowledge Festival campus:\n\n• **Main Auditorium**: Central Hall (Ground Floor, Main Gate)\n• **The Youth Lab**: Academic Block B\n• **The Global Room**: International Centre Hall\n• **The Creative Arena**: Open Amphitheatre\n• **Dining Halls & Refreshments**: Pavilion East & West\n\nNeed guided directions? Ask any nearby volunteer!`,
      modelUsed: "MKF-Local-Knowledge"
    };
  }

  if (lastUserMsg.includes("food") || lastUserMsg.includes("lunch") || lastUserMsg.includes("prayer") || lastUserMsg.includes("namaz") || lastUserMsg.includes("dinner")) {
    return {
      text: `**Food & Prayer Facilities:**\n\n• **Dining Hall A & B**: Lunch served 12:30 PM - 02:30 PM.\n• **Main Prayer Hall**: Open for all five daily prayers with dedicated ablution (Wudu) areas for men and women.\n• **Evening Refreshments**: Available at the Courtyard from 04:30 PM.`,
      modelUsed: "MKF-Local-Knowledge"
    };
  }

  if (lastUserMsg.includes("emergency") || lastUserMsg.includes("medical") || lastUserMsg.includes("security") || lastUserMsg.includes("help") || lastUserMsg.includes("doctor")) {
    return {
      text: `🚨 **Immediate Festival Emergency Support:**\n\n• **Medical Team**: +91 98000 11122 (First Aid Post at Gate 1)\n• **Security Control Desk**: +91 98000 33344\n\nVolunteers are stationed throughout the venue to assist immediately.`,
      modelUsed: "MKF-Local-Knowledge"
    };
  }

  return {
    text: `Assalamu Alaikum! I am **MKF AI**, your dedicated assistant for the MIC Knowledge Festival 2026. I can assist you with programme schedules, venue locations, prayer timings, dining arrangements, and lost items. How may I help you today?`,
    modelUsed: "MKF-Local-Knowledge"
  };
}

export async function draftAnnouncementWithMKFAI(prompt: string): Promise<{
  title: string;
  message: string;
  priority: "normal" | "high" | "urgent";
  target: "all" | "audience" | "volunteers";
}> {
  const apiKey = process.env.MKF_AI_API_KEY;
  if (!apiKey) {
    throw new Error("MKF_AI_API_KEY is not configured.");
  }

  const systemInstruction = `You are MKF AI, assisting festival administrators of MIC Knowledge Festival to write clear, concise, and professional broadcast announcements.
STRICT RULE: Never mention Gemini or Google. You are MKF AI.
Return ONLY valid JSON matching this exact structure with no markdown backticks or commentary:
{
  "title": "short catchy title max 10 words",
  "message": "clear announcement message max 2-3 sentences",
  "priority": "normal" | "high" | "urgent",
  "target": "all" | "audience" | "volunteers"
}`;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: "user", parts: [{ text: `Draft an announcement for: "${prompt}"` }] }],
            generationConfig: {
              temperature: 0.4,
              responseMimeType: "application/json"
            }
          }),
          signal: AbortSignal.timeout(10000)
        }
      );

      if (!response.ok) continue;

      const json = await response.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return {
          title: parsed.title || "Festival Announcement",
          message: parsed.message || prompt,
          priority: ["normal", "high", "urgent"].includes(parsed.priority) ? parsed.priority : "normal",
          target: ["all", "audience", "volunteers"].includes(parsed.target) ? parsed.target : "all"
        };
      }
    } catch (e) {
      console.warn(`[MKF AI Draft] Failed with ${model}:`, e);
    }
  }

  return {
    title: "Festival Update",
    message: prompt,
    priority: "normal",
    target: "all"
  };
}
