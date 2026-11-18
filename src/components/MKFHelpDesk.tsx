"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import MKFLogo from "@/components/MKFLogo";
import { useAuth } from "@/lib/authContext";
import { useEventData } from "@/lib/store";
import {
  Mic,
  MicOff,
  Send,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  LogOut,
  Radio,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function MKFHelpDesk() {
  const { user, isAudience, logout } = useAuth();
  const { programs, foodPrayer, announcements } = useEventData();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "voice" ? "voice" : "chat";

  const [activeTab, setActiveTab] = useState<"chat" | "voice" | "ticket">(
    initialMode === "voice" ? "voice" : searchParams.get("mode") === "ticket" ? "ticket" : "chat"
  );
  const [speechLang, setSpeechLang] = useState<string>("en-IN");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-assistant-greeting",
      role: "assistant",
      content:
        "Hi! I'm your MKF AI assistant. Ask me about the programme, finding a venue, or reporting a lost item. What would you like to know?",
      timestamp: "Just now"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  // Ticket Submission State
  const [ticketCategory, setTicketCategory] = useState("General enquiry");
  const [ticketLocation, setTicketLocation] = useState("");
  const [ticketPhone, setTicketPhone] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);

  // Voice Interaction State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [voiceVolume, setVoiceVolume] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [lastSpokenAnswer, setLastSpokenAnswer] = useState<string | null>(null);
  const [voiceMessageSaved, setVoiceMessageSaved] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<string>("");
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Delegate account details
  const delegateName = user?.name || "Kasim Rahees";
  const delegateEmail = user?.email || "kasimraheeskzr@gmail.com";
  const delegateAvatar = user?.avatar;

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Check speech recognition support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }
  }, []);

  // Stop speech synthesis when unmounting or switching to chat
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Text to speech helper
  const speakText = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    // Clean markdown before speaking
    const cleanText = text
      .replace(/[*#_`\[\]]/g, "")
      .replace(/\(.*?\)/g, "")
      .replace(/•/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick voice matching language if available
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = (speechLang || "en").split("-")[0];
    const naturalVoice =
      voices.find((v) => v.lang.startsWith(langPrefix) && (v.name.includes("Natural") || v.name.includes("Google"))) ||
      voices.find((v) => v.lang.startsWith(langPrefix)) ||
      voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google"))) ||
      voices.find((v) => v.lang.startsWith("en"));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [speechLang]);

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Core Send Query Logic
  const handleSendQuery = async (queryToSend: string, isFromVoice = false) => {
    const trimmed = queryToSend.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
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

      const conversationHistory = [...messages, userMsg].map((m) => ({
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
      const answer = data.text || "I am here to help you navigate MIC Knowledge Festival 2026.";

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setLastSpokenAnswer(answer);

      // Save voice message into database if query originated from voice
      if (isFromVoice) {
        fetch("/api/voice-messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: delegateName,
            userEmail: delegateEmail,
            transcript: trimmed,
            responseText: answer,
            status: "processed"
          })
        }).catch(() => {});

        // Speak the reply aloud!
        speakText(answer);
      }
    } catch {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Assalamu Alaikum! I am MKF AI. You can view the complete schedule under [Schedules](/schedule) or contact the Help Desk counter at Gate 1.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (isFromVoice) {
        speakText(fallbackMsg.content);
      }
    } finally {
      setLoading(false);
    }
  };

  // Submit Ticket / Volunteer Dispatch Logic
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDescription.trim()) return;
    setTicketSubmitting(true);
    setTicketSuccess(null);
    try {
      const res = await fetch("/api/help-desk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: delegateName,
          category: ticketCategory,
          description: ticketDescription.trim(),
          location: ticketLocation.trim() || "Main Campus",
          contact: ticketPhone.trim() || delegateEmail,
          phone: ticketPhone.trim(),
          status: "open"
        })
      });
      const data = await res.json();
      if (data.success) {
        setTicketSuccess(
          `Ticket dispatched successfully! An on-duty volunteer has been alerted to report to ${ticketLocation.trim() || "your location"}.`
        );
        setTicketDescription("");
      } else {
        alert("Failed to submit ticket: " + (data.error || "Please try again."));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      alert("Error submitting ticket: " + msg);
    } finally {
      setTicketSubmitting(false);
    }
  };

  // Start voice recording and speech recognition
  const startVoiceChat = async () => {
    if (isListening) {
      stopVoiceChat();
      return;
    }

    stopSpeaking();
    setSpeechTranscript("");
    transcriptRef.current = "";
    setIsListening(true);
    setVoiceMessageSaved(false);

    try {
      // 1. Microphone Audio Stream & Visualizer
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Audio visualizer setup
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      analyser.fftSize = 64;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setVoiceVolume(Math.min(100, Math.round((avg / 255) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // MediaRecorder for saving voice memo
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // 2. Speech-to-Text Recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = speechLang || "en-IN";

        recognition.onresult = (event: any) => {
          let current = "";
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setSpeechTranscript(current);
          transcriptRef.current = current;
        };

        recognition.onend = () => {
          setIsListening(false);
          cleanupAudio();
          // If we got speech input, send query
          const finalQuery = transcriptRef.current.trim();
          if (finalQuery) {
            handleSendQuery(finalQuery, true);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn("Speech recognition error:", e);
          setIsListening(false);
          cleanupAudio();
        };

        recognitionRef.current = recognition;
        recognition.start();
      } else {
        setSpeechSupported(false);
        setIsListening(false);
        cleanupAudio();
        alert("Speech recognition is not supported in this browser engine. Please type in Chat or use Chrome/Edge/Safari for voice chat.");
      }
    } catch (err) {
      console.warn("Microphone access denied or unavailable:", err);
      setIsListening(false);
      cleanupAudio();
      alert("Please allow microphone permissions in your browser to speak with MKF AI.");
    }
  };

  const cleanupAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    setVoiceVolume(0);
  };

  const stopVoiceChat = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    cleanupAudio();

    const textToSend = transcriptRef.current.trim() || speechTranscript.trim();
    if (textToSend) {
      handleSendQuery(textToSend, true);
    }
  };

  const handleResetChat = () => {
    stopSpeaking();
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "Hi! I'm your MKF AI assistant. Ask me about the programme, finding a venue, or reporting a lost item. What would you like to know?",
        timestamp: "Just now"
      }
    ]);
    setLastSpokenAnswer(null);
  };

  // Render markdown text cleanly
  const renderFormattedText = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, lineIndex) => {
      const isBullet = line.trim().startsWith("•") || line.trim().startsWith("* ") || line.trim().startsWith("- ");
      const cleanLine = isBullet ? line.trim().replace(/^[•*-]\s*/, "") : line;
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
              className="text-[#005953] hover:underline font-semibold inline-flex items-center gap-0.5"
            >
              {linkMatch[1]}
              <ExternalLink className="w-3 h-3 inline ml-0.5" />
            </Link>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={lineIndex} className="flex items-start gap-2 my-1">
            <span className="text-[#005953] font-bold">•</span>
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
    <div className="min-h-screen bg-[#FAF7F2] text-slate-800 flex flex-col justify-between selection:bg-teal-700 selection:text-white">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto px-6 sm:px-8 pt-8 pb-4 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="hover:opacity-90 transition">
          <MKFLogo size="md" />
        </Link>

        <div className="flex items-center gap-3">
          {/* Help Desk Pill Button */}
          <button
            onClick={() => setActiveTab("chat")}
            className="bg-[#005953] hover:bg-[#004843] text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xs transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>? Help Desk</span>
          </button>

          {/* Festival Guide Link */}
          <Link
            href="/delegate"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition px-2 py-1"
          >
            FESTIVAL GUIDE
          </Link>

          {/* Google Account Badge (Always showing user name & gmail as requested) */}
          <div className="hidden sm:flex items-center gap-2.5 bg-white border border-slate-200/90 rounded-full px-3 py-1 shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {delegateAvatar ? (
                <img src={delegateAvatar} alt={delegateName} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold text-slate-800 leading-tight">
                {delegateName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono leading-tight">
                {delegateEmail}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-6 sm:px-8 py-4 sm:py-6 flex-1">
        {/* Breadcrumb & Hero Title */}
        <div className="mb-8">
          <Link
            href="/delegate"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition group mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition group-hover:-translate-x-0.5" />
            <span>Festival home</span>
          </Link>

          <span className="text-[11px] font-extrabold tracking-wider text-[#008080] uppercase block mb-1">
            DELEGATE HELP DESK
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-[#0B1E34] tracking-tight leading-tight">
            A little help. More festival.
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
            Ask your AI assistant about sessions, venues, lost items and getting around.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Topic Cards + Switch Mode Card */}
          <div className="lg:col-span-4 space-y-3">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                YOUR FESTIVAL ASSISTANT
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#0B1E34] mb-3">
                What can I help with?
              </h2>
            </div>

            {/* 01 Sessions & schedules */}
            <button
              onClick={() => {
                setActiveTab("chat");
                handleSendQuery("Show me today's schedule and current sessions");
              }}
              className="w-full text-left bg-white hover:bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-teal-500 transition group"
            >
              <span className="text-xs font-bold text-slate-400 font-mono block mb-0.5 group-hover:text-teal-600 transition">
                01
              </span>
              <h3 className="text-sm font-bold text-slate-900">Sessions & schedules</h3>
              <p className="text-xs text-slate-500 mt-0.5">Explore the day&apos;s programme</p>
            </button>

            {/* 02 Stages & venues */}
            <button
              onClick={() => {
                setActiveTab("chat");
                handleSendQuery("Where are the festival stages and venues located?");
              }}
              className="w-full text-left bg-white hover:bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-teal-500 transition group"
            >
              <span className="text-xs font-bold text-slate-400 font-mono block mb-0.5 group-hover:text-teal-600 transition">
                02
              </span>
              <h3 className="text-sm font-bold text-slate-900">Stages & venues</h3>
              <p className="text-xs text-slate-500 mt-0.5">Find where a session takes place</p>
            </button>

            {/* 03 Lost & found */}
            <button
              onClick={() => {
                setActiveTab("chat");
                handleSendQuery("How do I report or find a lost item at MKF?");
              }}
              className="w-full text-left bg-white hover:bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-teal-500 transition group"
            >
              <span className="text-xs font-bold text-slate-400 font-mono block mb-0.5 group-hover:text-teal-600 transition">
                03
              </span>
              <h3 className="text-sm font-bold text-slate-900">Lost & found</h3>
              <p className="text-xs text-slate-500 mt-0.5">Get help reporting an item</p>
            </button>

            {/* 04 Dispatch volunteer */}
            <button
              onClick={() => {
                stopSpeaking();
                setActiveTab("ticket");
              }}
              className="w-full text-left bg-white hover:bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-teal-500 transition group"
            >
              <span className="text-xs font-bold text-slate-400 font-mono block mb-0.5 group-hover:text-teal-600 transition">
                04
              </span>
              <h3 className="text-sm font-bold text-slate-900">Dispatch volunteer</h3>
              <p className="text-xs text-slate-500 mt-0.5">Request in-person assistance</p>
            </button>

            {/* Bottom Callout Mode Switcher Card */}
            {activeTab === "chat" ? (
              <div className="bg-[#E8F5F1] border border-[#CDEAE2] rounded-2xl p-5 mt-4">
                <h3 className="text-sm font-bold text-[#0F2841] mb-1">Prefer to talk?</h3>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Use your microphone to speak with the AI assistant.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("voice");
                    startVoiceChat();
                  }}
                  className="bg-[#005953] hover:bg-[#004843] text-white text-xs font-bold py-2.5 px-4 rounded-full w-full text-center shadow-xs transition"
                >
                  Start voice chat
                </button>
              </div>
            ) : (
              <div className="bg-[#E8F5F1] border border-[#CDEAE2] rounded-2xl p-5 mt-4">
                <h3 className="text-sm font-bold text-[#0F2841] mb-1">Prefer to type?</h3>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Ask a question in chat. No microphone needed.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    stopVoiceChat();
                    setActiveTab("chat");
                  }}
                  className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold py-2.5 px-4 rounded-full w-full text-center shadow-xs transition"
                >
                  Switch to chat
                </button>
              </div>
            )}
          </div>

          {/* Right Column: AI Assistant Box (Unified Chat & Voice) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col min-h-[580px] justify-between relative">
            {/* Box Header */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      MKF AI assistant
                    </h3>
                    <p className="text-[11px] text-slate-400">AI-powered festival guidance</p>
                  </div>
                </div>

                <button
                  onClick={handleResetChat}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>New chat</span>
                </button>
              </div>

              {/* Segmented Control Pill: [Chat | Voice | Dispatch Volunteer] */}
              <div className="flex justify-center my-4">
                <div className="inline-flex bg-slate-100 p-1 rounded-full text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      stopVoiceChat();
                      setActiveTab("chat");
                    }}
                    className={`px-4 sm:px-5 py-1.5 rounded-full transition ${
                      activeTab === "chat"
                        ? "bg-[#005953] text-white shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("voice");
                    }}
                    className={`px-4 sm:px-5 py-1.5 rounded-full transition ${
                      activeTab === "voice"
                        ? "bg-[#005953] text-white shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Voice
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopVoiceChat();
                      stopSpeaking();
                      setActiveTab("ticket");
                    }}
                    className={`px-4 sm:px-5 py-1.5 rounded-full transition ${
                      activeTab === "ticket"
                        ? "bg-[#005953] text-white shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Dispatch Volunteer
                  </button>
                </div>
              </div>
            </div>

            {/* TAB CONTENT: CHAT MODE */}
            {activeTab === "chat" && (
              <div className="flex-1 flex flex-col justify-between">
                {/* Scrollable Conversation Stream */}
                <div className="overflow-y-auto max-h-[340px] pr-2 space-y-3 mb-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="space-y-1">
                      {msg.role === "assistant" ? (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1">
                            AI ASSISTANT
                          </span>
                          <div className="bg-[#E8F5F1] text-slate-800 text-xs sm:text-sm leading-relaxed p-4 rounded-2xl rounded-tl-sm max-w-xl">
                            {renderFormattedText(msg.content)}
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <div className="bg-[#005953] text-white text-xs sm:text-sm leading-relaxed p-3.5 rounded-2xl rounded-tr-sm max-w-md shadow-xs">
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1">
                        AI ASSISTANT
                      </span>
                      <div className="bg-[#E8F5F1] text-slate-600 text-xs p-3.5 rounded-2xl rounded-tl-sm max-w-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-teal-700 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-teal-700 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-teal-700 rounded-full animate-bounce [animation-delay:0.4s]" />
                        <span className="text-[11px] font-medium ml-1">Searching festival schedule & updates...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts Chips */}
                <div className="mb-4">
                  <span className="text-[11px] text-slate-400 mb-2 block">Try a question</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleSendQuery("Show me today's schedule")}
                      className="bg-white hover:bg-teal-50/60 text-slate-700 hover:text-teal-800 border border-slate-300/80 hover:border-teal-400 text-xs px-3.5 py-1.5 rounded-full transition shadow-2xs"
                    >
                      Show me today&apos;s schedule
                    </button>
                    <button
                      onClick={() => handleSendQuery("How do I report a lost item?")}
                      className="bg-white hover:bg-teal-50/60 text-slate-700 hover:text-teal-800 border border-slate-300/80 hover:border-teal-400 text-xs px-3.5 py-1.5 rounded-full transition shadow-2xs"
                    >
                      How do I report a lost item?
                    </button>
                    <button
                      onClick={() => handleSendQuery("Where is the Main Auditorium?")}
                      className="bg-white hover:bg-teal-50/60 text-slate-700 hover:text-teal-800 border border-slate-300/80 hover:border-teal-400 text-xs px-3.5 py-1.5 rounded-full transition shadow-2xs"
                    >
                      Where is the Main Auditorium?
                    </button>
                  </div>
                </div>

                {/* Input Area */}
                <div>
                  <span className="text-[11px] text-slate-400 mb-1.5 block">
                    Avoid sharing passwords, ID numbers or payment details.
                  </span>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendQuery(inputText);
                    }}
                    className="border border-slate-300 focus-within:border-teal-700 focus-within:ring-1 focus-within:ring-teal-700 rounded-full pl-5 pr-1.5 py-1.5 flex items-center bg-white shadow-2xs transition"
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type your question..."
                      disabled={loading}
                      className="flex-1 outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("voice");
                        startVoiceChat();
                      }}
                      className="p-1.5 text-slate-400 hover:text-teal-700 transition mr-1"
                      title="Speak with Voice"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <button
                      type="submit"
                      disabled={!inputText.trim() || loading}
                      className="bg-[#005953] hover:bg-[#004843] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1 transition shadow-xs"
                    >
                      <span>Send</span>
                      <span>↑</span>
                    </button>
                  </form>

                  <span className="text-[11px] text-slate-400 text-center block mt-2.5">
                    AI can make mistakes. Check the programme or ask a volunteer.
                  </span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: VOICE MODE */}
            {activeTab === "voice" && (
              <div className="flex-1 flex flex-col justify-between py-4 text-center">
                {/* Voice Centerpiece */}
                <div className="flex flex-col items-center justify-center my-auto">
                  <span className="text-[11px] font-bold text-[#008080] uppercase tracking-wider mb-3">
                    VOICE SUPPORT
                  </span>

                  {/* Language Selector */}
                  <div className="flex items-center gap-1 mb-6 bg-slate-100 p-1 rounded-full text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setSpeechLang("en-IN")}
                      className={`px-3 py-1 rounded-full transition ${speechLang === "en-IN" ? "bg-white text-teal-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpeechLang("ml-IN")}
                      className={`px-3 py-1 rounded-full transition ${speechLang === "ml-IN" ? "bg-white text-teal-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      മലയാളം
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpeechLang("ar-SA")}
                      className={`px-3 py-1 rounded-full transition ${speechLang === "ar-SA" ? "bg-white text-teal-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      العربية
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpeechLang("hi-IN")}
                      className={`px-3 py-1 rounded-full transition ${speechLang === "hi-IN" ? "bg-white text-teal-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      हिन्दी
                    </button>
                  </div>

                  {/* Microphone Action Avatar / Button */}
                  <div className="relative mb-6">
                    {/* Animated Pulsing Sound Waves when Listening */}
                    {isListening && (
                      <div className="absolute inset-0 -m-4 rounded-full bg-teal-400/20 animate-ping pointer-events-none" />
                    )}

                    <button
                      type="button"
                      onClick={startVoiceChat}
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition shadow-md active:scale-95 ${
                        isListening
                          ? "bg-rose-500 text-white ring-8 ring-rose-200 animate-pulse"
                          : isSpeaking
                          ? "bg-emerald-600 text-white ring-8 ring-emerald-100"
                          : "bg-[#DFF2EE] text-[#005953] hover:bg-[#D0EDE7] ring-8 ring-[#FAF7F2]"
                      }`}
                      title={isListening ? "Stop listening" : "Click to speak"}
                    >
                      {isListening ? (
                        <MicOff className="w-10 h-10" />
                      ) : isSpeaking ? (
                        <Volume2 className="w-10 h-10 animate-bounce" />
                      ) : (
                        <Mic className="w-10 h-10" />
                      )}
                    </button>
                  </div>

                  {/* Dynamic Soundwave Visualizer Bars */}
                  {isListening && (
                    <div className="flex items-center gap-1.5 h-8 mb-4">
                      {[12, 24, 38, 20, 48, 28, 16, 32, 22].map((height, i) => (
                        <span
                          key={i}
                          style={{
                            height: `${Math.max(6, Math.min(32, (voiceVolume / 100) * height + 6))}px`
                          }}
                          className="w-1 bg-teal-600 rounded-full transition-all duration-75"
                        />
                      ))}
                    </div>
                  )}

                  {/* Headline & Subtitle */}
                  <h3 className="text-xl sm:text-2xl font-black text-[#0B1E34] mb-2">
                    {isListening
                      ? "Listening to your voice..."
                      : isSpeaking
                      ? "Speaking answer out loud..."
                      : loading
                      ? "MKF AI is thinking..."
                      : "Ready when you are."}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
                    {speechTranscript
                      ? `"${speechTranscript}"`
                      : isSpeaking
                      ? "Listen to the assistant reply. Tap 'Stop speaking' anytime."
                      : "Ask a question out loud and hear the AI assistant's reply."}
                  </p>

                  {/* Big Voice Button */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {isListening ? (
                      <button
                        type="button"
                        onClick={stopVoiceChat}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-7 py-3 rounded-full transition shadow-sm flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span>Stop listening & Process</span>
                      </button>
                    ) : isSpeaking ? (
                      <button
                        type="button"
                        onClick={stopSpeaking}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-7 py-3 rounded-full transition shadow-sm flex items-center gap-2"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Stop speaking</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startVoiceChat}
                        className="bg-[#005953] hover:bg-[#004843] text-white text-xs font-bold px-8 py-3.5 rounded-full transition shadow-sm flex items-center gap-2 active:scale-95"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Start voice chat</span>
                      </button>
                    )}

                    {lastSpokenAnswer && !isListening && (
                      <button
                        type="button"
                        onClick={() => speakText(lastSpokenAnswer)}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold px-4 py-3 rounded-full transition flex items-center gap-1.5"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-teal-700" />
                        <span>Replay last answer</span>
                      </button>
                    )}
                  </div>

                  {/* Spoken Response Preview Card if available */}
                  {lastSpokenAnswer && (
                    <div className="mt-6 text-left bg-[#E8F5F1] border border-[#D0ECE4] rounded-2xl p-4 max-w-lg w-full">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-teal-600" />
                          <span>Last AI Response</span>
                        </span>
                        <span className="text-[10px] text-teal-700 font-semibold bg-white/70 px-2 py-0.5 rounded-full">
                          Voice Mode
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 line-clamp-3 leading-relaxed">
                        {lastSpokenAnswer}
                      </p>
                    </div>
                  )}
                </div>

                {/* Disclaimers & Helper Notes */}
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    Allow microphone access when prompted. Nothing is sent until you start.
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    You can mute or end your conversation at any time.
                  </span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: TICKET / DISPATCH VOLUNTEER MODE */}
            {activeTab === "ticket" && (
              <div className="flex-1 flex flex-col justify-between py-2">
                <div>
                  <div className="text-left mb-6">
                    <span className="text-[11px] font-bold text-[#008080] uppercase tracking-wider block mb-1">
                      VOLUNTEER INCIDENT DISPATCH
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#0B1E34] tracking-tight">
                      Request in-person assistance
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Need physical help, medical assistance, or guidance? Submit this request to alert the festival volunteer squad.
                    </p>
                  </div>

                  {ticketSuccess ? (
                    <div className="bg-[#E8F5F1] border border-[#CDEAE2] rounded-2xl p-6 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 mb-1">Volunteer Dispatched</h4>
                        <p className="text-xs text-slate-600 max-w-md mx-auto">{ticketSuccess}</p>
                      </div>
                      <div className="flex justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setTicketSuccess(null)}
                          className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold px-4 py-2 rounded-full transition shadow-xs"
                        >
                          Submit another request
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab("chat")}
                          className="bg-[#005953] hover:bg-[#004843] text-white text-xs font-bold px-5 py-2 rounded-full transition shadow-xs"
                        >
                          Back to AI Chat
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleTicketSubmit} className="space-y-4 text-left">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                            Your Name
                          </label>
                          <input
                            type="text"
                            value={delegateName}
                            disabled
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                            Contact Phone / WhatsApp
                          </label>
                          <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={ticketPhone}
                            onChange={(e) => setTicketPhone(e.target.value)}
                            className="w-full bg-white border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 rounded-xl px-3.5 py-2 text-xs text-slate-800 transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                            Assistance Category
                          </label>
                          <select
                            value={ticketCategory}
                            onChange={(e) => setTicketCategory(e.target.value)}
                            className="w-full bg-white border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 rounded-xl px-3.5 py-2 text-xs text-slate-800 transition"
                          >
                            <option value="General enquiry">General enquiry</option>
                            <option value="Medical assistance">🚨 Medical assistance (Urgent)</option>
                            <option value="Venue information">Venue information & Directions</option>
                            <option value="Lost item assistance">Lost item inquiry</option>
                            <option value="Food & Refreshment">Food & Refreshment</option>
                            <option value="Accommodation">Accommodation & Rest area</option>
                            <option value="Technical issue">Technical / Projection support</option>
                            <option value="Other">Other assistance</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                            Your Current Location / Venue
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder="e.g. Main Auditorium Row 12, Gate 1, Food Pavilion"
                              value={ticketLocation}
                              onChange={(e) => setTicketLocation(e.target.value)}
                              className="w-full bg-white border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 transition"
                            />
                            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          How can our volunteers assist you?
                        </label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Describe the issue or assistance required so the right team member is dispatched..."
                          value={ticketDescription}
                          onChange={(e) => setTicketDescription(e.target.value)}
                          className="w-full bg-white border border-slate-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 rounded-xl p-3 text-xs text-slate-800 transition"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
                        <button
                          type="submit"
                          disabled={ticketSubmitting || !ticketDescription.trim()}
                          className="bg-[#005953] hover:bg-[#004843] disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-full transition shadow-xs flex items-center gap-2"
                        >
                          {ticketSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <span>Dispatch Volunteer to My Location</span>
                        </button>

                        <div className="text-[11px] text-slate-400">
                          Priority dispatch to nearest on-duty volunteer squad.
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                {/* Emergency Hotlines Callout Footer */}
                <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between gap-3 text-left flex-wrap">
                  <div className="text-[11px] text-slate-500">
                    <span className="font-bold text-rose-700">Immediate Emergency: </span>
                    <span>Medical: <a href="tel:+919800011122" className="text-teal-700 font-semibold underline">+91 98000 11122</a></span>
                    <span className="mx-1.5">·</span>
                    <span>Security Desk: <a href="tel:+919800033344" className="text-teal-700 font-semibold underline">+91 98000 33344</a></span>
                  </div>
                  <span className="text-[10px] text-slate-400">Gate 1 First Aid Station</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="max-w-6xl w-full mx-auto px-6 sm:px-8 pt-10 pb-8 flex items-center justify-between text-xs text-slate-500">
        <span>© MKF · Malabar Knowledge Fest</span>
        <span className="text-[#008080] font-medium">Stay curious.</span>
      </footer>
    </div>
  );
}
