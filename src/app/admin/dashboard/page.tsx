"use client";

import React, { useState } from "react";
import { useEventData, EventStore } from "@/lib/store";
import Link from "next/link";
import {
  Calendar,
  ClipboardList,
  HelpCircle,
  Search,
  Radio,
  Send,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { PriorityLevel, TargetAudience } from "@/types";

export default function AdminOverviewPage() {
  const { programs, tasks, helpRequests, lostFound } = useEventData();

  // Quick broadcast state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<TargetAudience>("all");
  const [priority, setPriority] = useState<PriorityLevel>("urgent");
  const [broadcastSent, setBroadcastSent] = useState(false);

  const ongoingPrograms = programs.filter((p) => p.status === "ongoing").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const urgentTasks = tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length;
  const openHelpRequests = helpRequests.filter((r) => r.status === "open").length;

  const handleQuickBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    EventStore.addAnnouncement({
      title,
      message,
      target,
      priority,
      author: "Admin Control Center",
    });

    setBroadcastSent(true);
    setTitle("");
    setMessage("");
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Festival Control Center
          </h1>
          <p className="text-xs text-slate-500">
            Real-time telemetry, live broadcasts, and volunteer task coordination.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
          <span>SYSTEM LIVE & BROADCASTING</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/dashboard/schedule"
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Sessions
            </span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{ongoingPrograms}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            {programs.length} total scheduled today
          </div>
        </Link>

        <Link
          href="/admin/dashboard/tasks"
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-400 transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Tasks
            </span>
            <ClipboardList className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingTasks}</div>
          <div className="text-[11px] text-red-500 mt-1 font-semibold">
            {urgentTasks} urgent require assignment
          </div>
        </Link>

        <Link
          href="/admin/dashboard/help-desk"
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-amber-400 transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Help Desk
            </span>
            <HelpCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{openHelpRequests}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            {helpRequests.length} total tickets logged
          </div>
        </Link>

        <Link
          href="/admin/dashboard/lost-found"
          className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-purple-400 transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Lost & Found
            </span>
            <Search className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{lostFound.length}</div>
          <div className="text-[11px] text-green-600 mt-1 font-medium">
            {lostFound.filter((l) => l.status === "found").length} ready for pickup
          </div>
        </Link>
      </div>

      {/* Instant Broadcast Engine */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Instant Broadcast Center
            </h2>
            <p className="text-xs text-slate-500">
              Instantly push notifications to all audience mobile screens and volunteer devices.
            </p>
          </div>
        </div>

        {broadcastSent && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="font-semibold">
              Broadcast successfully dispatched across all connected clients!
            </span>
          </div>
        )}

        <form onSubmit={handleQuickBroadcast} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Announcement Headline
              </label>
              <input
                type="text"
                required
                placeholder="e.g. URGENT: Lunch Hall shift to Dining Tent C"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Audience
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as TargetAudience)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="all">Everyone (Audience + Volunteers)</option>
                <option value="audience">Audience Only</option>
                <option value="volunteers">Volunteers Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Broadcast Message
            </label>
            <textarea
              required
              rows={2}
              placeholder="Provide clear instructions for attendees or field teams..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600">Priority Level:</span>
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl shadow transition text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Fire Real-Time Broadcast</span>
            </button>
          </div>
        </form>
      </div>

      {/* Two Columns: Live Tasks and Open Help Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volunteer Task Radar */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-emerald-600" />
              Active Volunteer Tasks
            </h3>
            <Link
              href="/admin/dashboard/tasks"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              Manage Tasks <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {tasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        task.priority === "urgent"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <strong className="text-slate-800">{task.title}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Assignee: {task.assigned_to} • Loc: {task.location}
                  </div>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
                    task.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : task.status === "accepted"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Help Requests */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              Audience Help Requests
            </h3>
            <Link
              href="/admin/dashboard/help-desk"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {helpRequests.slice(0, 4).map((req) => (
              <div
                key={req.id}
                className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      {req.category}
                    </span>
                    <strong className="text-slate-800">{req.name}</strong>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{req.description}</p>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
                    req.status === "resolved"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
