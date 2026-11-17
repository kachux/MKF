"use client";

import React, { useState } from "react";
import { useEventData, EventStore } from "@/lib/store";
import { Trash2, Send, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { PriorityLevel, TargetAudience } from "@/types";

export default function AdminAnnouncementsPage() {
  const { announcements } = useEventData();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<TargetAudience>("all");
  const [priority, setPriority] = useState<PriorityLevel>("normal");
  const [sent, setSent] = useState(false);

  // MKF AI Drafting States
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiDraft, setShowAiDraft] = useState(false);

  const handleAiDraft = async (customPrompt?: string) => {
    const promptToUse = (customPrompt || aiPrompt).trim();
    if (!promptToUse || aiLoading) return;

    setAiLoading(true);
    try {
      const res = await fetch("/api/mkf-ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToUse })
      });
      const data = await res.json();
      if (data.success && data.draft) {
        setTitle(data.draft.title);
        setMessage(data.draft.message);
        if (data.draft.priority) setPriority(data.draft.priority);
        if (data.draft.target) setTarget(data.draft.target);
      }
    } catch (err) {
      console.error("AI draft failed", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    EventStore.addAnnouncement({
      title,
      message,
      target,
      priority,
      author: "Admin Control",
    });

    setSent(true);
    setTitle("");
    setMessage("");
    setTimeout(() => setSent(false), 3000);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this announcement?")) {
      EventStore.deleteAnnouncement(id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Broadcast & Announcements
        </h1>
        <p className="text-xs text-slate-500">
          Push real-time alerts to audience screens and volunteer devices instantly.
        </p>
      </div>

      {/* Broadcast Form */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600" />
            Create New Broadcast
          </h2>

          <button
            type="button"
            onClick={() => setShowAiDraft(!showAiDraft)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{showAiDraft ? "Hide MKF AI Assistant" : "Draft with MKF AI"}</span>
          </button>
        </div>

        {/* MKF AI Drafting Box */}
        {showAiDraft && (
          <div className="mb-5 p-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl border border-blue-800 shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>MKF AI Smart Announcement Writer</span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Type what you want to broadcast (or click a quick preset), and MKF AI will draft a clear, high-impact announcement instantly.
            </p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                "Lunch distribution is now open at Dining Hall B",
                "Seminar Hall A is full, join relay in Hall B",
                "Asr prayer will begin in 15 minutes at Campus Mosque",
                "Black wallet found near Exhibition Pavilion",
                "Keynote address by Dr. Rahman starting in 10 minutes"
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAiDraft(preset)}
                  disabled={aiLoading}
                  className="text-[11px] bg-white/10 hover:bg-white/20 text-slate-200 px-2.5 py-1 rounded-lg border border-white/10 transition"
                >
                  ⚡ {preset}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Announce that buses for train station will depart from Gate 2 at 7 PM"
                disabled={aiLoading}
                className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => handleAiDraft()}
                disabled={aiLoading || !aiPrompt.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Drafting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Generate Draft</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {sent && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Announcement dispatched and visible on public banner!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Announcement Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Asr prayer begins in 10 minutes at Mosque"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Target Group
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as TargetAudience)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">Everyone</option>
                <option value="audience">Audience Only</option>
                <option value="volunteers">Volunteers Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Message Content
            </label>
            <textarea
              required
              rows={3}
              placeholder="Full announcement message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Priority:</span>
              <div className="flex gap-1.5">
                {(["normal", "high", "urgent"] as PriorityLevel[]).map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                      priority === p
                        ? p === "urgent"
                          ? "bg-red-600 text-white"
                          : p === "high"
                          ? "bg-amber-600 text-white"
                          : "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow text-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Announcement</span>
            </button>
          </div>
        </form>
      </div>

      {/* History */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-4">
          Broadcast History ({announcements.length})
        </h2>

        <div className="space-y-3">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-200 flex items-start justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      item.priority === "urgent"
                        ? "bg-red-100 text-red-700"
                        : item.priority === "high"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    Target: {item.target.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    • {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{item.message}</p>
              </div>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
