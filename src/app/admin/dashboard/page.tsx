"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MKFLogo from "@/components/MKFLogo";
import { useEventData, EventStore } from "@/lib/store";
import { useAuth } from "@/lib/authContext";
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Radio,
  Send,
  Loader2,
  Sparkles,
  LogOut,
} from "lucide-react";
import { PriorityLevel, TargetAudience, Program } from "@/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { programs, tasks, announcements } = useEventData();

  const handleSignOut = () => {
    logout();
    router.push("/");
  };

  // 01 / Alert Centre state
  const [alertAudience, setAlertAudience] = useState<"volunteers" | "all">("volunteers");
  const [alertTitle, setAlertTitle] = useState("Volunteer briefing");
  const [alertMessage, setAlertMessage] = useState(
    "Please meet at the main help desk at 12:45 PM for task check-ins and radio frequency updates."
  );
  const [alertSending, setAlertSending] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  // 02 / Programme state
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    programs[0]?.id || "prog-grand-1"
  );
  const selectedProgram = programs.find((p) => p.id === selectedProgramId) || programs[0];
  const [startTime, setStartTime] = useState(selectedProgram?.start_time || "10:00 AM");
  const [endTime, setEndTime] = useState(selectedProgram?.end_time || "11:30 AM");
  const [venue, setVenue] = useState(selectedProgram?.venue || "The Grand Forum");
  const [notifyDelegates, setNotifyDelegates] = useState(true);
  const [progSaving, setProgSaving] = useState(false);
  const [progSuccess, setProgSuccess] = useState(false);

  // Sync selected program inputs when programs load
  React.useEffect(() => {
    if (programs.length > 0) {
      const p = programs.find((prog) => prog.id === selectedProgramId) || programs[0];
      if (p) {
        setSelectedProgramId(p.id);
        setStartTime(p.start_time);
        setEndTime(p.end_time);
        setVenue(p.venue);
      }
    }
  }, [programs, selectedProgramId]);

  // 03 / Tasks state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskVenue, setNewTaskVenue] = useState("The Grand Forum");
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityLevel>("urgent");
  const [taskSaving, setTaskSaving] = useState(false);

  // Update programme handler
  const handleProgramSelect = (id: string) => {
    setSelectedProgramId(id);
    const p = programs.find((prog) => prog.id === id);
    if (p) {
      setStartTime(p.start_time);
      setEndTime(p.end_time);
      setVenue(p.venue);
    }
  };

  const handleSaveScheduleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;

    setProgSaving(true);
    const updatedFields = {
      start_time: startTime,
      end_time: endTime,
      venue: venue,
    };

    EventStore.updateProgram(selectedProgram.id, updatedFields);

    if (notifyDelegates) {
      EventStore.addAnnouncement({
        title: `Schedule Update: ${selectedProgram.title}`,
        message: `Timing updated to ${startTime} - ${endTime} at ${venue}.`,
        target: "all",
        priority: "high",
        author: "Admin Control",
      });
    }

    setProgSaving(false);
    setProgSuccess(true);
    setTimeout(() => setProgSuccess(false), 3000);
  };

  // Broadcast alert handler
  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim() || !alertMessage.trim()) return;

    setAlertSending(true);
    const newAlert = {
      title: alertTitle.trim(),
      message: alertMessage.trim(),
      target: alertAudience === "volunteers" ? ("volunteers" as TargetAudience) : ("all" as TargetAudience),
      priority: alertAudience === "volunteers" ? ("high" as PriorityLevel) : ("urgent" as PriorityLevel),
      author: "Admin Organiser",
    };

    EventStore.addAnnouncement(newAlert);

    setAlertSending(false);
    setAlertSuccess(true);
    setTimeout(() => setAlertSuccess(false), 3500);
  };

  // Add volunteer task handler
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setTaskSaving(true);
    const newTask = {
      title: newTaskTitle.trim(),
      instructions: `Assigned venue: ${newTaskVenue}. Priority: ${newTaskPriority}.`,
      description: `Assigned venue: ${newTaskVenue}. Priority: ${newTaskPriority}.`,
      venue: newTaskVenue,
      location: newTaskVenue,
      priority: newTaskPriority,
      status: "pending" as const,
      assigned_to: "Field Volunteer",
      due_time: "Immediate",
    };

    EventStore.addTask(newTask);

    setNewTaskTitle("");
    setTaskSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between selection:bg-rose-600 selection:text-white">
      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 pt-8 pb-4 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="hover:opacity-90 transition">
          <MKFLogo size="md" />
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-extrabold tracking-wider bg-rose-50 text-[#C01E44] border border-rose-200 px-3 py-1 rounded-full uppercase">
            ORGANISER WORKSPACE
          </span>

          <Link
            href="/help-desk"
            className="bg-[#005953] hover:bg-[#004843] text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xs transition"
          >
            <span>? Help Desk</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* Main Container (Figma node 2007-44) */}
      <main className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 py-6 sm:py-10 flex-1">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition group mb-5"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition group-hover:-translate-x-0.5" />
          <span>Festival home</span>
        </Link>

        {/* Hero Kicker & Headlines */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F2841] tracking-tight leading-tight mb-2">
            Keep the festival moving.
          </h1>

          <p className="text-xs sm:text-sm text-slate-600">
            Send the right alerts, update the programme and coordinate your volunteer team.
          </p>
        </div>

        {/* 3 Core Operational Modules (Matching Figma node 2007-44) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* =========================================
              01 / ALERT CENTRE
             ========================================= */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <span className="text-[11px] font-extrabold tracking-wider text-[#C01E44] font-mono uppercase">
                  01 / ALERT CENTRE
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              </div>

              <h2 className="text-lg font-black text-[#0F2841] mb-1">Send an alert</h2>
              <p className="text-xs text-slate-500 mb-5">
                Choose who receives this update.
              </p>

              <form onSubmit={handleBroadcastAlert} className="space-y-4">
                {/* Audience Selection Radio */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Alert audience
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                      <input
                        type="radio"
                        name="audience"
                        checked={alertAudience === "volunteers"}
                        onChange={() => setAlertAudience("volunteers")}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Volunteers only</span>
                        <span className="text-[11px] text-slate-400">Internal operational team alert</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                      <input
                        type="radio"
                        name="audience"
                        checked={alertAudience === "all"}
                        onChange={() => setAlertAudience("all")}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">All delegates & volunteers</span>
                        <span className="text-[11px] text-slate-400">Broadcast banner across whole app</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Alert Title */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Alert title
                  </label>
                  <input
                    type="text"
                    required
                    value={alertTitle}
                    onChange={(e) => setAlertTitle(e.target.value)}
                    placeholder="e.g. Volunteer briefing"
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-600 focus:border-rose-600 transition"
                  />
                </div>

                {/* Message Textarea */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Message
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={alertMessage}
                    onChange={(e) => setAlertMessage(e.target.value)}
                    placeholder="Enter urgent instructions..."
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-600 focus:border-rose-600 transition"
                  />
                </div>

                {/* Delivery Preview Card from Figma */}
                <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl p-3.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#BE123C] uppercase mb-1">
                    <span>Delivery Preview</span>
                    <span>{alertAudience === "volunteers" ? "Team Channel" : "Public Broadcast"}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#9F1239] leading-snug">{alertTitle || "Alert Title"}</h4>
                  <p className="text-[11px] text-[#BE123C] mt-0.5 line-clamp-2 leading-relaxed">
                    {alertMessage || "Alert message preview..."}
                  </p>
                </div>

                {/* Broadcast Action Button */}
                <button
                  type="submit"
                  disabled={alertSending}
                  className="w-full bg-[#C01E44] hover:bg-[#A01838] text-white font-bold py-3 px-5 rounded-full flex items-center justify-between text-xs shadow-md transition disabled:opacity-70"
                >
                  <span>{alertSending ? "Sending broadcast..." : "Review & send alert"}</span>
                  {alertSending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  )}
                </button>

                {alertSuccess && (
                  <p className="text-xs font-semibold text-emerald-600 text-center flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Alert dispatched live!</span>
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* =========================================
              02 / PROGRAMME
             ========================================= */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <span className="text-[11px] font-extrabold tracking-wider text-teal-700 font-mono uppercase">
                  02 / PROGRAMME
                </span>
                <Calendar className="w-4 h-4 text-teal-600" />
              </div>

              <h2 className="text-lg font-black text-[#0F2841] mb-1">Update programme</h2>
              <p className="text-xs text-slate-500 mb-5">
                Edit a session&apos;s time or venue in real-time.
              </p>

              <form onSubmit={handleSaveScheduleChange} className="space-y-4">
                {/* Session Dropdown */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Select session to adjust
                  </label>
                  <select
                    value={selectedProgramId}
                    onChange={(e) => handleProgramSelect(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.start_time})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start & End Times */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Start time
                    </label>
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="09:00 AM"
                      className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      End time
                    </label>
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="10:30 AM"
                      className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition"
                    />
                  </div>
                </div>

                {/* Venue Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Venue / Hall
                  </label>
                  <select
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition"
                  >
                    <option value="The Grand Forum">01 The Grand Forum</option>
                    <option value="The Literary Circle">02 The Literary Circle</option>
                    <option value="The Islamic Discourse">03 The Islamic Discourse</option>
                    <option value="The Creative Arena">04 The Creative Arena</option>
                    <option value="The Global Room">05 The Global Room</option>
                    <option value="The Youth Lab">06 The Youth Lab</option>
                  </select>
                </div>

                {/* Checkbox: Notify all delegates */}
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={notifyDelegates}
                    onChange={(e) => setNotifyDelegates(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Notify all delegates & update live schedule
                  </span>
                </label>

                {/* Save Schedule Change Button */}
                <button
                  type="submit"
                  disabled={progSaving}
                  className="w-full bg-[#005953] hover:bg-[#004843] text-white font-bold py-3 px-5 rounded-full flex items-center justify-between text-xs shadow-md transition disabled:opacity-70 mt-2"
                >
                  <span>{progSaving ? "Saving..." : "Save schedule change"}</span>
                  {progSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  )}
                </button>

                {progSuccess && (
                  <p className="text-xs font-semibold text-emerald-600 text-center flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Programme updated in database!</span>
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* =========================================
              03 / VOLUNTEER COORDINATION & TASKS
             ========================================= */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <span className="text-[11px] font-extrabold tracking-wider text-amber-700 font-mono uppercase">
                  03 / TASKS
                </span>
                <Users className="w-4 h-4 text-amber-600" />
              </div>

              <h2 className="text-lg font-black text-[#0F2841] mb-1">Assign volunteer tasks</h2>
              <p className="text-xs text-slate-500 mb-5">
                Give volunteers and field teams their focus.
              </p>

              <form onSubmit={handleAddTask} className="space-y-3 mb-6">
                <div>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Set up audio in The Literary Circle"
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newTaskVenue}
                    onChange={(e) => setNewTaskVenue(e.target.value)}
                    className="bg-[#FAF7F2] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="The Grand Forum">The Grand Forum</option>
                    <option value="The Literary Circle">The Literary Circle</option>
                    <option value="Main Help Desk">Main Help Desk</option>
                    <option value="Gate 2 Entrance">Gate 2 Entrance</option>
                  </select>

                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as PriorityLevel)}
                    className="bg-[#FAF7F2] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High Priority</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={taskSaving}
                  className="w-full bg-[#D97706] hover:bg-[#B45309] text-white font-bold py-2.5 px-4 rounded-full flex items-center justify-between text-xs shadow-xs transition"
                >
                  <span>Assign task</span>
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </button>
              </form>

              {/* Live Tasks List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Active volunteer tasks ({tasks.length})
                </span>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div className="truncate mr-2">
                      <strong className="block text-slate-800 truncate">{task.title}</strong>
                      <span className="text-[10px] text-slate-400">{task.venue}</span>
                    </div>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                        task.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : task.priority === "urgent"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Navy Bottom Bar */}
      <footer className="w-full bg-[#081726] text-slate-400 px-6 sm:px-10 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <span>© MKF · Malabar Knowledge Fest</span>
        <span className="text-[#38BDF8] font-medium">Stay curious.</span>
      </footer>
    </div>
  );
}
