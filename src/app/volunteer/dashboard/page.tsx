"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MKFLogo from "@/components/MKFLogo";
import { useAuth } from "@/lib/authContext";
import { useEventData, EventStore } from "@/lib/store";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
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
  Calendar,
  UtensilsCrossed,
  Search,
  ClipboardList,
  QrCode,
  Plus,
  Radio,
  Copy,
  Check,
  Tag,
  Loader2,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import {
  PriorityLevel,
  TargetAudience,
  Program,
  ProgramStatus,
  FoodPrayerStatus,
  HelpRequestStatus,
  LostFoundCategory,
  HelpCategory
} from "@/types";

type VolunteerTab =
  | "tasks"
  | "schedule"
  | "announcements"
  | "food-prayer"
  | "lost-found"
  | "help-desk"
  | "qr";

export default function VolunteerDashboardPage() {
  const router = useRouter();
  const { user, isVolunteer, isAdmin, isLoading, logout } = useAuth();
  const { programs, foodPrayer, announcements, lostFound, helpRequests, tasks } = useEventData();

  useEffect(() => {
    if (!isLoading && !isVolunteer && !isAdmin) {
      router.push("/volunteer/login");
    }
  }, [isLoading, isVolunteer, isAdmin, router]);

  const handleSignOut = () => {
    logout();
    router.push("/");
  };

  const [activeTab, setActiveTab] = useState<VolunteerTab>("tasks");
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  // Message Admin Modal
  const [adminMessageModal, setAdminMessageModal] = useState(false);
  const [adminMessageText, setAdminMessageText] = useState("");
  const [adminMessageSent, setAdminMessageSent] = useState(false);

  // New Task Modal
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskLocation, setNewTaskLocation] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityLevel>("urgent");
  const [newTaskTeam, setNewTaskTeam] = useState("Operations");
  const [newTaskInstructions, setNewTaskInstructions] = useState("");

  // New Announcement Modal
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [newAnnounceTitle, setNewAnnounceTitle] = useState("");
  const [newAnnounceMessage, setNewAnnounceMessage] = useState("");
  const [newAnnouncePriority, setNewAnnouncePriority] = useState<PriorityLevel>("high");
  const [newAnnounceTarget, setNewAnnounceTarget] = useState<TargetAudience>("all");
  const [aiDraftPrompt, setAiDraftPrompt] = useState("");
  const [aiDrafting, setAiDrafting] = useState(false);

  // New Lost & Found Modal
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [newLostName, setNewLostName] = useState("");
  const [newLostCategory, setNewLostCategory] = useState<LostFoundCategory>("Other");
  const [newLostLocation, setNewLostLocation] = useState("");
  const [newLostDescription, setNewLostDescription] = useState("");
  const [newLostContact, setNewLostContact] = useState("");

  // New Program Modal
  const [progModalOpen, setProgModalOpen] = useState(false);
  const [newProgTitle, setNewProgTitle] = useState("");
  const [newProgSpeaker, setNewProgSpeaker] = useState("");
  const [newProgStart, setNewProgStart] = useState("10:00 AM");
  const [newProgEnd, setNewProgEnd] = useState("11:30 AM");
  const [newProgVenue, setNewProgVenue] = useState("The Grand Forum");
  const [newProgCategory, setNewProgCategory] = useState("Keynote");

  // QR Modal
  const [qrCopied, setQrCopied] = useState(false);
  const [originUrl, setOriginUrl] = useState("http://localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginUrl(window.location.origin);
    }
  }, []);

  // Metrics
  const highPriorityCount = tasks.filter(
    (t) => (t.priority === "urgent" || t.priority === "high") && t.status !== "completed"
  ).length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  // Task actions
  const handleUpdateStatus = (taskId: string, currentStatus: string) => {
    let nextStatus: "pending" | "accepted" | "completed" = "accepted";
    if (currentStatus === "pending") nextStatus = "accepted";
    else if (currentStatus === "accepted") nextStatus = "completed";
    else nextStatus = "pending";

    EventStore.updateTask(taskId, {
      status: nextStatus,
      assigned_to: user?.name || "Active Volunteer",
      completed_at: nextStatus === "completed" ? new Date().toISOString() : undefined,
    });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskLocation.trim()) return;

    EventStore.addTask({
      title: newTaskTitle.trim(),
      instructions: newTaskInstructions.trim() || `Report to ${newTaskLocation.trim()} for immediate assistance.`,
      description: newTaskInstructions.trim() || `Report to ${newTaskLocation.trim()} for immediate assistance.`,
      location: newTaskLocation.trim(),
      venue: newTaskLocation.trim(),
      priority: newTaskPriority,
      status: "pending",
      assigned_to: "all",
      team: newTaskTeam,
    });

    setNewTaskTitle("");
    setNewTaskLocation("");
    setNewTaskInstructions("");
    setTaskModalOpen(false);
  };

  // Schedule status update
  const handleProgramStatusChange = (progId: string, status: ProgramStatus) => {
    EventStore.updateProgram(progId, { status });
  };

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgTitle.trim()) return;

    EventStore.addProgram({
      title: newProgTitle.trim(),
      speaker: newProgSpeaker.trim() || "Distinguished Scholar",
      description: `Official MKF 2026 session held at ${newProgVenue}.`,
      start_time: newProgStart,
      end_time: newProgEnd,
      venue: newProgVenue,
      status: "upcoming",
      category: newProgCategory,
    });

    setNewProgTitle("");
    setNewProgSpeaker("");
    setProgModalOpen(false);
  };

  // Announcement actions
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnounceTitle.trim() || !newAnnounceMessage.trim()) return;

    EventStore.addAnnouncement({
      title: newAnnounceTitle.trim(),
      message: newAnnounceMessage.trim(),
      priority: newAnnouncePriority,
      target: newAnnounceTarget,
      author: user?.name || "Volunteer Coordinator",
    });

    setNewAnnounceTitle("");
    setNewAnnounceMessage("");
    setAnnouncementModalOpen(false);
  };

  const handleAiDraftAnnouncement = async () => {
    if (!aiDraftPrompt.trim() || aiDrafting) return;
    setAiDrafting(true);
    try {
      const res = await fetch("/api/mkf-ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiDraftPrompt.trim() }),
      });
      const data = await res.json();
      if (data.success && data.draft) {
        setNewAnnounceTitle(data.draft.title || "");
        setNewAnnounceMessage(data.draft.message || "");
        setNewAnnouncePriority(data.draft.priority || "high");
        setNewAnnounceTarget(data.draft.target || "all");
      }
    } catch {
      // fallback
      setNewAnnounceTitle(`Notice: ${aiDraftPrompt.trim().slice(0, 30)}`);
      setNewAnnounceMessage(aiDraftPrompt.trim());
    } finally {
      setAiDrafting(false);
    }
  };

  // Food & Prayer status update
  const handleFoodPrayerStatus = (id: string, status: FoodPrayerStatus) => {
    EventStore.updateFoodPrayer(id, { status });
  };

  // Lost & Found actions
  const handleCreateLostFound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLostName.trim() || !newLostLocation.trim()) return;

    EventStore.addLostFound({
      item_name: newLostName.trim(),
      category: newLostCategory,
      location: newLostLocation.trim(),
      description: newLostDescription.trim() || "Item secured by on-duty volunteer at help counter.",
      status: "found",
      contact_name: user?.name || "Volunteer Counter",
      contact_phone: newLostContact.trim() || "+91 98000 11122",
    });

    setNewLostName("");
    setNewLostLocation("");
    setNewLostDescription("");
    setNewLostContact("");
    setLostModalOpen(false);
  };

  const handleLostStatusChange = (id: string, status: "reported" | "found" | "returned") => {
    EventStore.updateLostFound(id, { status });
  };

  // Help Desk actions
  const handleHelpStatusChange = (id: string, status: HelpRequestStatus) => {
    EventStore.updateHelpRequest(id, { status });
  };

  const handleHelpToTask = (req: (typeof helpRequests)[0]) => {
    EventStore.addTask({
      title: `Help Desk: ${req.category} (${req.name})`,
      instructions: `Attendee request: "${req.description}". Contact: ${req.contact || req.phone || "N/A"}. Location: ${req.location}`,
      location: req.location,
      priority: req.category === "Medical assistance" ? "urgent" : "high",
      status: "pending",
      assigned_to: "all",
      team: req.category === "Medical assistance" ? "Medical Team" : "Help Desk Squad",
    });

    EventStore.updateHelpRequest(req.id, {
      status: "in_progress",
      assigned_to: user?.name || "Volunteer Squad",
    });
  };

  // Admin message
  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMessageText.trim()) return;

    EventStore.addHelpRequest({
      name: user?.name || "Volunteer On Duty",
      category: "General enquiry" as HelpCategory,
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

  if (isLoading || (!isVolunteer && !isAdmin)) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 font-medium">Verifying volunteer authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 pt-8 pb-4 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="hover:opacity-90 transition">
          <MKFLogo size="md" />
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-extrabold tracking-wider bg-amber-50 text-[#D97706] border border-amber-200 px-3 py-1 rounded-full uppercase">
            VOLUNTEER & OPERATIONS PORTAL
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

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 py-6 sm:py-8 flex-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition group mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition group-hover:-translate-x-0.5" />
          <span>Festival home</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =========================================
              LEFT NAVY SIDEBAR (Synced Navigation)
             ========================================= */}
          <aside className="lg:col-span-3 bg-[#0A2540] text-white rounded-3xl p-6 shadow-md flex flex-col justify-between min-h-[580px]">
            <div>
              <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#38BDF8] uppercase block mb-1">
                TEAM MKF · CONNECTED CONSOLE
              </span>
              <h2 className="text-xl font-black text-white leading-tight mb-1">
                A little time.<br />A big difference.
              </h2>
              <p className="text-xs text-slate-300 mb-5">
                Logged in as <strong className="text-white">{user?.name || "Volunteer On Duty"}</strong>
              </p>

              <nav className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("tasks")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-between ${
                    activeTab === "tasks"
                      ? "bg-white text-[#0A2540] shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ClipboardList className="w-3.5 h-3.5 text-teal-400" />
                    <span>Tasks Radar</span>
                  </span>
                  <span className="text-[11px] font-mono bg-white/20 px-2 py-0.5 rounded-full">{tasks.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("schedule")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-between ${
                    activeTab === "schedule"
                      ? "bg-white text-[#0A2540] shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    <span>Schedule & Stages</span>
                  </span>
                  <span className="text-[11px] font-mono bg-white/20 px-2 py-0.5 rounded-full">{programs.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("announcements")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-between ${
                    activeTab === "announcements"
                      ? "bg-white text-[#0A2540] shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-rose-400" />
                    <span>Broadcast Alerts</span>
                  </span>
                  <span className="text-[11px] font-mono bg-white/20 px-2 py-0.5 rounded-full">{announcements.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("food-prayer")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-between ${
                    activeTab === "food-prayer"
                      ? "bg-white text-[#0A2540] shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
                    <span>Food & Prayer</span>
                  </span>
                  <span className="text-[11px] font-mono bg-white/20 px-2 py-0.5 rounded-full">{foodPrayer.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("lost-found")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-between ${
                    activeTab === "lost-found"
                      ? "bg-white text-[#0A2540] shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Lost & Found Hub</span>
                  </span>
                  <span className="text-[11px] font-mono bg-white/20 px-2 py-0.5 rounded-full">{lostFound.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("help-desk")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-between ${
                    activeTab === "help-desk"
                      ? "bg-white text-[#0A2540] shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Incident Center</span>
                  </span>
                  <span className="text-[11px] font-mono bg-white/20 px-2 py-0.5 rounded-full">{helpRequests.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("qr")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-between ${
                    activeTab === "qr"
                      ? "bg-white text-[#0A2540] shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Audience QR</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Scan</span>
                </button>
              </nav>
            </div>

            <div className="pt-5 border-t border-slate-700/60 mt-6">
              <span className="text-[11px] text-slate-400 block mb-1">Duty Coordinator Desk:</span>
              <span className="text-xs font-bold text-white block">Control Room · Main Gate</span>
              <span className="text-[11px] text-slate-400 font-mono">+91 98000 33344</span>
            </div>
          </aside>

          {/* =========================================
              MAIN CONTENT AREA (Connected with Admin)
             ========================================= */}
          <div className="lg:col-span-9 space-y-6">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0F2841] tracking-tight">
                  {activeTab === "tasks" && "Tasks & Operations Radar"}
                  {activeTab === "schedule" && "Live Schedule & Stage Manager"}
                  {activeTab === "announcements" && "Broadcast & Field Alerts"}
                  {activeTab === "food-prayer" && "Food & Prayer Control"}
                  {activeTab === "lost-found" && "Lost & Found Floor Hub"}
                  {activeTab === "help-desk" && "Help Desk & Incidents"}
                  {activeTab === "qr" && "Audience Registration QR"}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronized live with central Admin control and delegate guides.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {activeTab === "tasks" && (
                  <button
                    type="button"
                    onClick={() => setTaskModalOpen(true)}
                    className="bg-[#005953] hover:bg-[#004843] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xs flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                )}

                {activeTab === "schedule" && (
                  <button
                    type="button"
                    onClick={() => setProgModalOpen(true)}
                    className="bg-[#005953] hover:bg-[#004843] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xs flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Session</span>
                  </button>
                )}

                {activeTab === "announcements" && (
                  <button
                    type="button"
                    onClick={() => setAnnouncementModalOpen(true)}
                    className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xs flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post Broadcast Alert</span>
                  </button>
                )}

                {activeTab === "lost-found" && (
                  <button
                    type="button"
                    onClick={() => setLostModalOpen(true)}
                    className="bg-[#005953] hover:bg-[#004843] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xs flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Log Found Item</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setAdminMessageModal(true)}
                  className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold px-4 py-2.5 rounded-full shadow-2xs flex items-center gap-2 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                  <span>Message Admin</span>
                </button>
              </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
                <span className="text-2xl font-black text-[#0F2841] font-mono block">
                  {tasks.length < 10 ? `0${tasks.length}` : tasks.length}
                </span>
                <span className="text-xs font-bold text-slate-600 block mt-0.5">Active Tasks</span>
                <span className="text-[11px] text-slate-400">{completedCount} marked completed</span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
                <span className="text-2xl font-black text-[#BE123C] font-mono block">
                  {highPriorityCount < 10 ? `0${highPriorityCount}` : highPriorityCount}
                </span>
                <span className="text-xs font-bold text-slate-600 block mt-0.5">High Priority</span>
                <span className="text-[11px] text-rose-600 font-semibold">Immediate attention</span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
                <span className="text-sm font-black text-[#0F2841] font-mono block">
                  {programs.filter((p) => p.status === "ongoing").length} Live Stage(s)
                </span>
                <span className="text-xs font-bold text-slate-600 block mt-0.5">Stage Operations</span>
                <span className="text-[11px] text-emerald-600 font-semibold">● Real-time synced</span>
              </div>
            </div>

            {/* TAB 1: TASKS RADAR */}
            {activeTab === "tasks" && (
              <div className="space-y-3.5">
                {tasks.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                    No active volunteer tasks right now.
                  </div>
                ) : (
                  tasks.map((task) => {
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
                              <span
                                className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                  isUrgent ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {task.priority}
                              </span>
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
                              {task.team && (
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  {task.team}
                                </span>
                              )}
                            </div>

                            <h3 className="text-sm font-bold text-[#0F2841] pt-0.5">{task.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2">
                              {task.description || task.instructions}
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="text-xs font-mono font-bold text-slate-700 block">
                              {task.due_time || "Immediate"}
                            </span>
                            <span className="text-[10px] text-slate-400 block flex items-center gap-1 justify-end">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {task.venue || task.location || "Festival Grounds"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setSelectedTask(task)}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                          >
                            View details
                          </button>

                          <div className="flex items-center gap-2">
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
                                <span>Reopen</span>
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
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: SCHEDULE & STAGE CONTROLLER */}
            {activeTab === "schedule" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 divide-y divide-slate-100">
                  <div className="pb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Live Stage Sessions ({programs.length})</span>
                    <span className="text-[11px] text-slate-400">Update status live from stage floor</span>
                  </div>

                  {programs.map((prog) => (
                    <div key={prog.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              prog.status === "ongoing"
                                ? "bg-emerald-100 text-emerald-800 animate-pulse font-extrabold"
                                : prog.status === "completed"
                                ? "bg-slate-100 text-slate-600"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {prog.status === "ongoing" ? "● LIVE ON STAGE" : prog.status}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{prog.title}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Speaker: <strong className="text-slate-700">{prog.speaker}</strong> · {prog.start_time} - {prog.end_time}
                        </p>
                        <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-teal-600" /> {prog.venue} ({prog.category || "General"})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-auto">
                        {prog.status !== "ongoing" ? (
                          <button
                            type="button"
                            onClick={() => handleProgramStatusChange(prog.id, "ongoing")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-2xs"
                          >
                            Set Live
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleProgramStatusChange(prog.id, "completed")}
                            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-2xs"
                          >
                            Mark Concluded
                          </button>
                        )}

                        {prog.status === "completed" && (
                          <button
                            type="button"
                            onClick={() => handleProgramStatusChange(prog.id, "upcoming")}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-xl transition"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: ANNOUNCEMENTS */}
            {activeTab === "announcements" && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-slate-900">Official Festival Bulletins ({announcements.length})</h2>
                    <span className="text-[11px] text-slate-400">Broadcasts pushed directly to attendees & volunteers</span>
                  </div>

                  {announcements.map((a) => (
                    <div key={a.id} className="p-4 rounded-2xl border border-slate-100 bg-[#FAF7F2] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              a.priority === "urgent"
                                ? "bg-rose-100 text-rose-800"
                                : a.priority === "high"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {a.priority}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{a.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{a.message}</p>
                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                        <span>Target: <strong>{a.target}</strong></span>
                        <span>Author: <strong>{a.author || "MKF Control"}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: FOOD & PRAYER */}
            {activeTab === "food-prayer" && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">Food & Prayer Schedule ({foodPrayer.length})</h2>
                  <span className="text-[11px] text-slate-400">Toggle live when serving starts or prayers call</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {foodPrayer.map((fp) => (
                    <div key={fp.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              fp.type === "food" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"
                            }`}
                          >
                            {fp.type}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{fp.title}</span>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              fp.status === "active"
                                ? "bg-emerald-100 text-emerald-800 animate-pulse"
                                : fp.status === "completed"
                                ? "bg-slate-100 text-slate-500"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {fp.status === "active" ? "● ACTIVE NOW" : fp.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Time: <strong className="text-slate-700">{fp.time}</strong> · Venue: {fp.location}
                        </p>
                        {fp.notes && <p className="text-[11px] text-slate-400">{fp.notes}</p>}
                      </div>

                      <div className="flex items-center gap-2">
                        {fp.status !== "active" ? (
                          <button
                            type="button"
                            onClick={() => handleFoodPrayerStatus(fp.id, "active")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition"
                          >
                            Set Active
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleFoodPrayerStatus(fp.id, "completed")}
                            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition"
                          >
                            Conclude
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: LOST & FOUND */}
            {activeTab === "lost-found" && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">Lost & Found Registry ({lostFound.length})</h2>
                  <span className="text-[11px] text-slate-400">Search & verify items claimed by delegates</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {lostFound.map((item) => (
                    <div key={item.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              item.status === "returned"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.status === "found"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{item.item_name}</span>
                          <span className="text-[10px] text-slate-400">({item.category})</span>
                        </div>
                        <p className="text-xs text-slate-600">{item.description}</p>
                        <div className="text-[11px] text-slate-400 flex items-center gap-3">
                          <span>Location: <strong>{item.location}</strong></span>
                          <span>Contact: <strong>{item.contact_name} ({item.contact_phone})</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.status !== "returned" ? (
                          <button
                            type="button"
                            onClick={() => handleLostStatusChange(item.id, "returned")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition"
                          >
                            Mark Returned
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600">✓ Resolved</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: HELP DESK / INCIDENT DESK */}
            {activeTab === "help-desk" && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">Incident Tickets & Attendee Inquiries ({helpRequests.length})</h2>
                  <span className="text-[11px] text-slate-400">Review attendee requests from the Help Desk</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {helpRequests.map((req) => (
                    <div key={req.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              req.category === "Medical assistance" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {req.category}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{req.name}</span>
                          <span className="text-[10px] text-slate-400">({req.contact || req.phone || "No phone"})</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-snug">{req.description}</p>
                        <div className="text-[11px] text-slate-400 flex items-center gap-3">
                          <span className="flex items-center gap-1 font-semibold text-slate-600">
                            <MapPin className="w-3 h-3 text-teal-600" /> Loc: {req.location}
                          </span>
                          {req.assigned_to && <span className="text-blue-600 font-semibold">Assigned: {req.assigned_to}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {req.status !== "resolved" && (
                          <button
                            type="button"
                            onClick={() => handleHelpToTask(req)}
                            className="bg-[#005953] hover:bg-[#004843] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition"
                          >
                            Assign to Task
                          </button>
                        )}

                        <select
                          value={req.status}
                          onChange={(e) => handleHelpStatusChange(req.id, e.target.value as HelpRequestStatus)}
                          className={`text-xs font-bold py-1.5 px-3 rounded-xl border focus:outline-none ${
                            req.status === "resolved"
                              ? "bg-green-100 text-green-800 border-green-300"
                              : req.status === "in_progress"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : "bg-amber-100 text-amber-800 border-amber-300"
                          }`}
                        >
                          <option value="open">Open / Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: AUDIENCE QR */}
            {activeTab === "qr" && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-6 max-w-md mx-auto">
                <div>
                  <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                    AUDIENCE SCANNER
                  </span>
                  <h3 className="text-lg font-black text-slate-900">Delegate Portal QR Code</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Show this QR code to attendees to connect them to live schedules, prayer times, and MKF AI.
                  </p>
                </div>

                <div className="p-6 bg-[#FAF7F2] rounded-3xl border border-slate-200 inline-block shadow-sm">
                  <QRCodeSVG value={originUrl} size={220} level="H" />
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== "undefined") {
                        navigator.clipboard.writeText(originUrl);
                        setQrCopied(true);
                        setTimeout(() => setQrCopied(false), 2000);
                      }
                    }}
                    className="bg-[#005953] hover:bg-[#004843] text-white text-xs font-bold px-4 py-2.5 rounded-full transition shadow-xs flex items-center gap-1.5"
                  >
                    {qrCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{qrCopied ? "Copied Link" : "Copy Portal URL"}</span>
                  </button>

                  <a
                    href={originUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold px-4 py-2.5 rounded-full transition shadow-2xs flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Portal</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Navy Bottom Bar */}
      <footer className="w-full bg-[#081726] text-slate-400 px-6 sm:px-10 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <span>© MKF · Malabar Knowledge Fest · Volunteer Radar</span>
        <span className="text-[#38BDF8] font-medium">One Festival. One Platform. Zero Confusion.</span>
      </footer>

      {/* MODAL 1: ADD TASK */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setTaskModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-slate-900 mb-1">Add Volunteer Task</h3>
            <p className="text-xs text-slate-500 mb-4">Post a field requirement directly onto the volunteer radar.</p>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-left">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stage B Water Refill Needed"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hall 2 Entry"
                    value={newTaskLocation}
                    onChange={(e) => setNewTaskLocation(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as PriorityLevel)}
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Assigned Squad</label>
                <select
                  value={newTaskTeam}
                  onChange={(e) => setNewTaskTeam(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                >
                  <option value="Operations">Operations</option>
                  <option value="Help Desk Squad">Help Desk Squad</option>
                  <option value="Medical Team">Medical Team</option>
                  <option value="Crowd Control">Crowd Control</option>
                  <option value="Stage Crew">Stage Crew</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Specific details for the volunteer..."
                  value={newTaskInstructions}
                  onChange={(e) => setNewTaskInstructions(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#005953] hover:bg-[#004843] text-white font-bold py-2.5 rounded-full text-xs transition"
              >
                Push Task to Radar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PROGRAM / SCHEDULE */}
      {progModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setProgModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-slate-900 mb-1">Add Festival Session</h3>
            <p className="text-xs text-slate-500 mb-4">Sync a new stage program onto the official schedule.</p>

            <form onSubmit={handleCreateProgram} className="space-y-3.5 text-left">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Islamic AI Ethics & Renaissance"
                  value={newProgTitle}
                  onChange={(e) => setNewProgTitle(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Speaker</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Bahauddeen Muhammed Nadwi"
                  value={newProgSpeaker}
                  onChange={(e) => setNewProgSpeaker(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={newProgStart}
                    onChange={(e) => setNewProgStart(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    value={newProgEnd}
                    onChange={(e) => setNewProgEnd(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Venue / Stage</label>
                <select
                  value={newProgVenue}
                  onChange={(e) => setNewProgVenue(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                >
                  <option value="The Grand Forum">The Grand Forum</option>
                  <option value="The Youth Lab">The Youth Lab</option>
                  <option value="The Global Room">The Global Room</option>
                  <option value="The Creative Arena">The Creative Arena</option>
                  <option value="Seminar Hall A">Seminar Hall A</option>
                  <option value="Exhibition Pavilion">Exhibition Pavilion</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#005953] hover:bg-[#004843] text-white font-bold py-2.5 rounded-full text-xs transition"
              >
                Publish to Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BROADCAST ALERT WITH AI DRAFT */}
      {announcementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setAnnouncementModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-slate-900 mb-1">Post Broadcast Alert</h3>
            <p className="text-xs text-slate-500 mb-3">Broadcast an immediate alert to attendees and volunteer teams.</p>

            {/* AI Draft helper */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 mb-3 text-left">
              <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>MKF AI Draft Generator</span>
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Lunch starting early at Hall B"
                  value={aiDraftPrompt}
                  onChange={(e) => setAiDraftPrompt(e.target.value)}
                  className="flex-1 bg-white border border-emerald-300 rounded-xl px-2.5 py-1 text-xs text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAiDraftAnnouncement}
                  disabled={aiDrafting || !aiDraftPrompt.trim()}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold px-3 py-1 rounded-xl transition flex items-center gap-1"
                >
                  {aiDrafting && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Draft</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-left">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rain Contingency: Relocation to Hall A"
                  value={newAnnounceTitle}
                  onChange={(e) => setNewAnnounceTitle(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Broadcast Message</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Clear message for delegates..."
                  value={newAnnounceMessage}
                  onChange={(e) => setNewAnnounceMessage(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target</label>
                  <select
                    value={newAnnounceTarget}
                    onChange={(e) => setNewAnnounceTarget(e.target.value as TargetAudience)}
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="all">Everyone</option>
                    <option value="volunteers">Volunteers Only</option>
                    <option value="audience">Audience Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Priority</label>
                  <select
                    value={newAnnouncePriority}
                    onChange={(e) => setNewAnnouncePriority(e.target.value as PriorityLevel)}
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-700 hover:bg-rose-800 text-white font-bold py-2.5 rounded-full text-xs transition"
              >
                Broadcast to Live Board
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: LOG FOUND ITEM */}
      {lostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setLostModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-slate-900 mb-1">Log Found Item</h3>
            <p className="text-xs text-slate-500 mb-4">Register an item recovered on festival campus.</p>

            <form onSubmit={handleCreateLostFound} className="space-y-3.5 text-left">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Black Samsung Galaxy Buds case"
                  value={newLostName}
                  onChange={(e) => setNewLostName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Category</label>
                  <select
                    value={newLostCategory}
                    onChange={(e) => setNewLostCategory(e.target.value as LostFoundCategory)}
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Wallets & IDs">Wallets & IDs</option>
                    <option value="Bags & Books">Bags & Books</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Glasses & Accessories">Glasses</option>
                    <option value="Keys">Keys</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Found Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lawn Bench"
                    value={newLostLocation}
                    onChange={(e) => setNewLostLocation(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Description / Identifying Marks</label>
                <textarea
                  rows={2}
                  placeholder="Colour, brand, stickers..."
                  value={newLostDescription}
                  onChange={(e) => setNewLostDescription(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Holding Desk Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+91 98000 11122"
                  value={newLostContact}
                  onChange={(e) => setNewLostContact(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#005953] hover:bg-[#004843] text-white font-bold py-2.5 rounded-full text-xs transition"
              >
                Register into Lost & Found Hub
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: TASK DETAIL MODAL */}
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

            <h3 className="text-lg font-black text-[#0F2841] mt-2 mb-1">{selectedTask.title}</h3>

            <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
              <span>Location: <strong>{selectedTask.venue || selectedTask.location || "Festival Grounds"}</strong></span>
              <span>Priority: <strong>{selectedTask.priority}</strong></span>
            </div>

            <div className="bg-[#FAF7F2] border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed mb-6">
              {selectedTask.description || selectedTask.instructions || "No detailed instructions provided."}
            </div>

            <button
              type="button"
              onClick={() => {
                handleUpdateStatus(selectedTask.id, selectedTask.status);
                setSelectedTask(null);
              }}
              className="w-full bg-[#005953] hover:bg-[#004843] text-white font-bold py-3 rounded-full text-xs transition"
            >
              Toggle Task Status
            </button>
          </div>
        </div>
      )}

      {/* MODAL 6: MESSAGE ADMIN */}
      {adminMessageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setAdminMessageModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-[#0F2841] mb-1">Message Admin Coordinator</h3>
            <p className="text-xs text-slate-500 mb-4">
              Send a field status alert directly to central control desk.
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