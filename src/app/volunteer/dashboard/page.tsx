"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MKFLogo from "@/components/MKFLogo";
import { useAuth } from "@/lib/authContext";
import { useEventData, EventStore } from "@/lib/store";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  AlertTriangle,
  HelpCircle,
  LogOut,
  Send,
  X,
  Sparkles,
} from "lucide-react";

export default function VolunteerDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { tasks, announcements } = useEventData();

  const handleSignOut = () => {
    logout();
    router.push("/");
  };

  const [activeTab, setActiveTab] = useState<"tasks" | "messages">("tasks");
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [adminMessageModal, setAdminMessageModal] = useState(false);
  const [adminMessageText, setAdminMessageText] = useState("");
  const [adminMessageSent, setAdminMessageSent] = useState(false);

  // Metrics
  const highPriorityCount = tasks.filter(
    (t) => (t.priority === "urgent" || t.priority === "high") && t.status !== "completed"
  ).length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  // Handle task status update
  const handleUpdateStatus = (taskId: string, currentStatus: string) => {
    let nextStatus: "pending" | "accepted" | "completed" = "accepted";
    if (currentStatus === "pending") nextStatus = "accepted";
    else if (currentStatus === "accepted") nextStatus = "completed";
    else nextStatus = "pending";

    EventStore.updateTask(taskId, {
      status: nextStatus,
      assigned_to: user?.name || "Active Volunteer",
    });

    try {
      fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          status: nextStatus,
          assigned_to: user?.name || "Active Volunteer",
        }),
      });
    } catch {}
  };

  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMessageText.trim()) return;

    EventStore.addHelpRequest({
      name: user?.name || "Volunteer On Duty",
      category: "Volunteer Coordinator Dispatch",
      description: adminMessageText.trim(),
      location: "Active Venue Floor",
      phone: "+91 98000 00000",
      status: "open",
    });

    setAdminMessageSent(true);
    setAdminMessageText("");
    setTimeout(() => {
      setAdminMessageSent(false);
      setAdminMessageModal(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 pt-8 pb-4 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="hover:opacity-90 transition">
          <MKFLogo size="md" />
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-extrabold tracking-wider bg-amber-50 text-[#D97706] border border-amber-200 px-3 py-1 rounded-full uppercase">
            VOLUNTEER PORTAL
          </span>

          <Link
            href="/help-desk"
            className="bg-[#005953] hover:bg-[#004843] text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xs transition"
          >
            <span>? Help Desk</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="text-xs font-semibold text-slate-500 hover:text-amber-800 flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* Main Container (Figma node 2030-44) */}
      <main className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 py-6 sm:py-10 flex-1">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition group mb-5"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition group-hover:-translate-x-0.5" />
          <span>Festival home</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =========================================
              LEFT NAVY SIDEBAR (from Figma node 2030-44)
             ========================================= */}
          <aside className="lg:col-span-3 bg-[#0A2540] text-white rounded-3xl p-6 shadow-md flex flex-col justify-between min-h-[480px]">
            <div>
              <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#38BDF8] uppercase block mb-1">
                TEAM MKF
              </span>
              <h2 className="text-xl font-black text-white leading-tight mb-2">
                A little time.<br />A big difference.
              </h2>
              <p className="text-xs text-slate-300 mb-6">
                Assigned team: <strong className="text-white font-semibold">Guest Experience / Operations</strong>
              </p>

              <nav className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("tasks")}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-between ${
                    activeTab === "tasks"
                      ? "bg-white text-[#0A2540] shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span>Assigned tasks</span>
                  <span className="text-[11px] font-mono">{tasks.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("messages")}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-between ${
                    activeTab === "messages"
                      ? "bg-white text-[#0A2540] shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span>Admin messages</span>
                  <span className="text-[11px] font-mono">{announcements.length}</span>
                </button>
              </nav>
            </div>

            <div className="pt-6 border-t border-slate-700/60 mt-6">
              <span className="text-[11px] text-slate-400 block mb-1">Duty Coordinator:</span>
              <span className="text-xs font-bold text-white block">Afsal Rahman · Help Desk</span>
              <span className="text-[11px] text-slate-400 font-mono">+91 98471 00000</span>
            </div>
          </aside>

          {/* =========================================
              MAIN VOLUNTEER WORKSPACE (9 Cols)
             ========================================= */}
          <div className="lg:col-span-9 space-y-6">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0F2841] tracking-tight">
                  Good morning, volunteer.
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Here is your shift briefing and priority tasks for today.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAdminMessageModal(true)}
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold px-4 py-2.5 rounded-full shadow-2xs flex items-center gap-2 self-start sm:self-auto transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>Message admin</span>
              </button>
            </div>

            {/* 3 Metric Cards (Figma node 2030-44) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Metric 1 */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
                <span className="text-2xl font-black text-[#0F2841] font-mono block">
                  {tasks.length < 10 ? `0${tasks.length}` : tasks.length}
                </span>
                <span className="text-xs font-bold text-slate-600 block mt-0.5">
                  Assigned tasks
                </span>
                <span className="text-[11px] text-slate-400">{completedCount} completed today</span>
              </div>

              {/* Metric 2 */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
                <span className="text-2xl font-black text-[#BE123C] font-mono block">
                  {highPriorityCount < 10 ? `0${highPriorityCount}` : highPriorityCount}
                </span>
                <span className="text-xs font-bold text-slate-600 block mt-0.5">
                  High-priority task
                </span>
                <span className="text-[11px] text-rose-600 font-semibold">Immediate attention</span>
              </div>

              {/* Metric 3 */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
                <span className="text-sm font-black text-[#0F2841] font-mono block">
                  09:00 — 13:00
                </span>
                <span className="text-xs font-bold text-slate-600 block mt-0.5">
                  Your shift today
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">● Active on duty</span>
              </div>
            </div>

            {/* Main Tab Content */}
            {activeTab === "tasks" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Tasks List (8 Cols) */}
                <div className="lg:col-span-8 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-black text-[#0F2841]">
                      Prioritized task list
                    </h2>
                    <span className="text-xs text-slate-400 font-medium">
                      Tap card to view details
                    </span>
                  </div>

                  {tasks.map((task) => {
                    const isDone = task.status === "completed";
                    const isAccepted = task.status === "accepted";
                    const isUrgent = task.priority === "urgent" || task.priority === "high";

                    return (
                      <div
                        key={task.id}
                        className={`bg-white rounded-2xl border p-5 shadow-2xs transition hover:shadow-xs flex flex-col justify-between gap-3 ${
                          isDone
                            ? "border-emerald-200 bg-emerald-50/20"
                            : isUrgent
                            ? "border-rose-200"
                            : "border-slate-200/90"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {/* Priority Badge */}
                              <span
                                className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                  isUrgent
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {task.priority}
                              </span>

                              {/* Status Badge */}
                              <span
                                className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                  isDone
                                    ? "bg-emerald-100 text-emerald-800"
                                    : isAccepted
                                    ? "bg-teal-100 text-teal-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {isDone ? "Done" : isAccepted ? "In Progress" : "Pending"}
                              </span>
                            </div>

                            <h3 className="text-sm font-bold text-[#0F2841] pt-0.5">
                              {task.title}
                            </h3>
                            <p className="text-xs text-slate-500 line-clamp-2">
                              {task.description}
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="text-xs font-mono font-bold text-slate-700 block">
                              {task.due_time}
                            </span>
                            <span className="text-[10px] text-slate-400 block">{task.venue}</span>
                          </div>
                        </div>

                        {/* Action Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setSelectedTask(task)}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                          >
                            View instructions
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(task.id, task.status)}
                            className={`text-xs font-bold px-4 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                              isDone
                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                : isAccepted
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-[#005953] hover:bg-[#004843] text-white"
                            }`}
                          >
                            {isDone ? (
                              <span>Reopen task</span>
                            ) : isAccepted ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mark complete</span>
                              </>
                            ) : (
                              <span>Accept task →</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Cards: Briefing & From Admin (4 Cols) */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Today's briefing Card */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      TODAY&apos;S BRIEFING
                    </span>
                    <h3 className="text-sm font-bold text-[#0F2841] mb-2">General Guidelines</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Welcome to Day 1! All volunteers report to assigned zones 15 minutes before shift. Hydration stations are set up at all 6 venues.
                    </p>
                  </div>

                  {/* From your admin Card */}
                  <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl p-5 shadow-2xs">
                    <span className="text-[11px] font-bold text-[#BE123C] uppercase tracking-wider block mb-1">
                      FROM YOUR ADMIN
                    </span>
                    <h3 className="text-sm font-bold text-[#9F1239] mb-1">Volunteer alert</h3>
                    <p className="text-xs text-[#BE123C] leading-relaxed mb-4">
                      Please check the Lost & Found desk at Stage 1 for any unclaimed backpacks reported before noon.
                    </p>
                    <button
                      type="button"
                      onClick={() => setAdminMessageModal(true)}
                      className="w-full bg-[#BE123C] hover:bg-[#9F1239] text-white text-xs font-bold py-2.5 px-4 rounded-full text-center transition"
                    >
                      Open conversation →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Admin Messages Broadcast Feed */
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4">
                <h2 className="text-base font-black text-[#0F2841] mb-2">
                  Live Admin Broadcasts & Bulletins
                </h2>
                {announcements.map((a) => (
                  <div key={a.id} className="p-4 rounded-2xl border border-slate-100 bg-[#FAF7F2] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{a.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{a.message}</p>
                    <span className="text-[10px] text-slate-400 font-semibold block pt-1">
                      By {a.author || "Admin Control"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Navy Bottom Bar */}
      <footer className="w-full bg-[#081726] text-slate-400 px-6 sm:px-10 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <span>© MKF · Malabar Knowledge Fest</span>
        <span className="text-[#38BDF8] font-medium">Stay curious.</span>
      </footer>

      {/* Task Instruction Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setSelectedTask(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-extrabold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Task Details
            </span>

            <h3 className="text-lg font-black text-[#0F2841] mt-2 mb-1">
              {selectedTask.title}
            </h3>

            <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
              <span>Venue: <strong>{selectedTask.venue}</strong></span>
              <span>Due: <strong>{selectedTask.due_time}</strong></span>
            </div>

            <div className="bg-[#FAF7F2] border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed mb-6">
              {selectedTask.description}
            </div>

            <button
              type="button"
              onClick={() => {
                handleUpdateStatus(selectedTask.id, selectedTask.status);
                setSelectedTask(null);
              }}
              className="w-full bg-[#005953] hover:bg-[#004843] text-white font-bold py-3 rounded-full text-xs transition"
            >
              Update Task Status
            </button>
          </div>
        </div>
      )}

      {/* Message Admin Modal */}
      {adminMessageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setAdminMessageModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-[#0F2841] mb-1">Message Admin Coordinator</h3>
            <p className="text-xs text-slate-500 mb-4">
              Send a direct query or field status update to the central control desk.
            </p>

            {adminMessageSent ? (
              <div className="text-center py-6 text-emerald-600 font-bold text-xs flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Message delivered to central admin desk!</span>
              </div>
            ) : (
              <form onSubmit={handleSendAdminMessage} className="space-y-4">
                <textarea
                  required
                  rows={4}
                  value={adminMessageText}
                  onChange={(e) => setAdminMessageText(e.target.value)}
                  placeholder="e.g. Need additional badge lanyards at Gate 2 entrance..."
                  className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600 transition"
                />

                <button
                  type="submit"
                  className="w-full bg-[#0A2540] hover:bg-[#071a2e] text-white font-bold py-3 rounded-full text-xs transition flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Admin Control</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
