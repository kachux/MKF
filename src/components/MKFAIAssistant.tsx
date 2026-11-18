"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  User,
  ExternalLink,
  Calendar,
  Utensils,
  HelpCircle,
  Maximize2,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from "lucide-react";
import { useEventData } from "@/lib/store";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "What is happening right now?",
  "Where & when is lunch served?",
  "What time is the next prayer?",
  "Emergency hotlines & medical help",
  "Who is speaking in the upcoming session?"
];

export default function MKFAIAssistant() {
  const pathname = usePathname();
  const { programs, foodPrayer, announcements } = useEventData();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Assalamu Alaikum! I am **MKF AI**, your official real-time intelligent guide for the **MIC Knowledge Festival 2026**.\n\nAsk me anything about ongoing sessions, speaker venues, food and prayer arrangements, lost & found, or emergency support!",
      timestamp: "Just now"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [autoVoice, setAutoVoice] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Text-to-speech engine
  const speakText = (text: string, msgId?: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      if (isSpeaking === msgId) {
        setIsSpeaking(null);
        return;
      }
    }
    const cleanText = text
      .replace(/[*_#`[\]()]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\/[\w-]+/g, "")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);
    if (msgId) setIsSpeaking(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Do not render floating widget on Figma pages or the dedicated help-desk/mkf-ai page
  const figmaPages = [
    "/",
    "/schedule",
    "/lost-found",
    "/lost-found/report",
    "/help-desk",
    "/admin/dashboard",
    "/volunteer/dashboard",
    "/login",
    "/admin/login",
    "/volunteer/login",
    "/delegate",
    "/mkf-ai",
  ];
  if (figmaPages.includes(pathname)) {
    return null;
  }

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Package live festival context from store
      const festivalContext = {
        programs: programs.map((p) => ({
          title: p.title,
          speaker: p.speaker,
          start_time: p.start_time,
          end_time: p.end_time,
          venue: p.venue,
          status: p.status,
          category: p.category
        })),
        foodPrayer: foodPrayer.map((fp) => ({
          type: fp.type,
          title: fp.title,
          time: fp.time,
          location: fp.location,
          status: fp.status,
          notes: fp.notes
        })),
        announcements: announcements.map((a) => ({
          title: a.title,
          message: a.message,
          priority: a.priority,
          target: a.target
        }))
      };

      // Prepare conversation history
      const conversationHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/mkf-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationHistory,
          context: festivalContext
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reach MKF AI");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (autoVoice && data.text) {
        speakText(data.text, assistantMessage.id);
      }
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "⚠️ **MKF AI Notice:** I couldn't reach the festival intelligence server right now. Please check your internet connection or refer to the [Schedule](/schedule) or [Help Desk](/help-desk) directly.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content:
          "Chat reset. Assalamu Alaikum! I am **MKF AI**, your MIC Knowledge Festival assistant. How can I assist you?",
        timestamp: "Just now"
      }
    ]);
  };

  // Helper to render markdown bold, links, lists cleanly
  const renderFormattedText = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, lineIndex) => {
      // Handle list items
      const isBullet = line.trim().startsWith("* ") || line.trim().startsWith("- ");
      const cleanLine = isBullet ? line.trim().substring(2) : line;

      // Handle bold **text** and [link](url)
      const parts = cleanLine.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);

      const parsedLine = parts.map((part, partIndex) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={partIndex} className="font-semibold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
          return (
            <Link
              key={partIndex}
              href={linkMatch[2]}
              className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-0.5"
            >
              {linkMatch[1]}
              <ExternalLink className="w-3 h-3 inline" />
            </Link>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={lineIndex} className="flex items-start gap-2 my-1">
            <span className="text-blue-500 font-bold">•</span>
            <span className="flex-1">{parsedLine}</span>
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={lineIndex} className="h-2" />;
      }

      return (
        <p key={lineIndex} className="my-0.5 leading-relaxed">
          {parsedLine}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/20"
          aria-label="Open MKF AI Assistant"
        >
          {/* Glowing pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-40 blur-sm group-hover:opacity-75 animate-pulse" />

          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/20 text-white">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
          </div>

          <div className="relative flex flex-col items-start pr-1">
            <span className="text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
              MKF AI
              <span className="text-[9px] bg-emerald-400 text-emerald-950 font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                Live
              </span>
            </span>
            <span className="text-[10px] text-blue-100 font-medium hidden sm:inline">
              Ask anything about festival
            </span>
          </div>

          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-bounce" />
          )}
        </button>
      )}

      {/* Floating Chat Modal / Card */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-mkf-navy via-slate-900 to-blue-950 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-inner relative">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm tracking-tight text-white">
                    MKF AI
                  </h3>
                  <span className="text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded font-bold border border-blue-400/30">
                    Official Concierge
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Real-Time Festival Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={handleResetChat}
                title="Reset conversation"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setAutoVoice(!autoVoice)}
                title={autoVoice ? "Voice auto-narration is ON" : "Turn voice auto-narration ON"}
                className={`p-1.5 rounded-lg transition ${
                  autoVoice
                    ? "bg-blue-500 text-white shadow-xs"
                    : "hover:text-white hover:bg-white/10 text-blue-200"
                }`}
              >
                {autoVoice ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-75" />}
              </button>

              <Link
                href="/mkf-ai"
                onClick={() => setIsOpen(false)}
                title="Open Fullscreen MKF AI"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition hidden sm:inline-block"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick shortcuts strip */}
          <div className="bg-slate-100/90 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600 overflow-x-auto gap-2">
            <span className="text-slate-400 font-semibold whitespace-nowrap text-[10px] uppercase">
              Quick links:
            </span>
            <Link
              href="/schedule"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1 text-blue-700 hover:text-blue-900 font-medium whitespace-nowrap"
            >
              <Calendar className="w-3 h-3 text-blue-600" /> Schedule
            </Link>
            <Link
              href="/food-prayer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-medium whitespace-nowrap"
            >
              <Utensils className="w-3 h-3 text-emerald-600" /> Food & Prayer
            </Link>
            <Link
              href="/help-desk"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1 text-amber-700 hover:text-amber-900 font-medium whitespace-nowrap"
            >
              <HelpCircle className="w-3 h-3 text-amber-600" /> Help Desk
            </Link>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-[10px] shadow-sm">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 shadow-sm text-slate-800 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white border border-slate-200 rounded-tl-none text-slate-700"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="space-y-1">{renderFormattedText(msg.content)}</div>
                  )}

                  <div
                    className={`text-[9px] mt-1.5 flex items-center justify-between gap-2 ${
                      msg.role === "user" ? "text-blue-100" : "text-slate-400"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.content, msg.id)}
                        className="inline-flex items-center gap-1 hover:text-blue-600 transition"
                        title={isSpeaking === msg.id ? "Stop voice" : "Listen to answer"}
                      >
                        {isSpeaking === msg.id ? (
                          <>
                            <VolumeX className="w-3 h-3 text-red-500 animate-pulse" />
                            <span className="text-red-500 font-semibold">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-slate-400 hover:text-blue-600" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex-shrink-0 flex items-center justify-center font-semibold text-[10px]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-[10px]">
                  AI
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-2 text-slate-500">
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">
                    MKF AI is searching festival updates...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          {messages.length <= 3 && !loading && (
            <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Suggested Questions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-[11px] text-left bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 px-2.5 py-1 rounded-lg transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask MKF AI about schedule, food, venues..."
                disabled={loading}
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition flex items-center justify-center ${
                  isListening
                    ? "bg-rose-500 text-white animate-pulse"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
                title={isListening ? "Stop listening" : "Speak query with voice"}
                aria-label="Voice input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-md transition flex items-center justify-center"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-400 px-1">
              <span>Powered exclusively by MKF AI</span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Live Festival Sync
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
