"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import { useEventData, EventStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  UserCheck,
  Check,
  Users,
} from "lucide-react";
import { PriorityLevel } from "@/types";

export default function VolunteerDashboardPage() {
  const { user, isVolunteer, isLoading } = useAuth();
  const { tasks } = useEventData();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"all" | "pending" | "accepted" | "completed">("all");

  useEffect(() => {
    if (!isLoading && !isVolunteer) {
      router.push("/volunteer/login");
    }
  }, [isLoading, isVolunteer, router]);

  if (isLoading || !isVolunteer) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 font-medium">Verifying volunteer session...</p>
        </div>
      </div>
    );
  }

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === "all") return true;
    return t.status === activeTab;
  });

  const urgentCount = tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const myCompletedCount = tasks.filter((t) => t.status === "completed").length;

  const handleAccept = (taskId: string) => {
    EventStore.updateTask(taskId, {
      status: "accepted",
      assigned_to: user?.name || "Active Volunteer",
      accepted_at: new Date().toISOString(),
    });
  };

  const handleComplete = (taskId: string) => {
    EventStore.updateTask(taskId, {
      status: "completed",
      completed_at: new Date().toISOString(),
    });
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200">
            <AlertTriangle className="w-3 h-3 text-red-600 animate-pulse" />
            URGENT
          </span>
        );
      case "high":
        return (
          <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
            High Priority
          </span>
        );
      case "normal":
        return (
          <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200">
            Normal
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Profile Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xl">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                Active Duty
              </span>
              <span className="text-xs text-slate-400">{user?.team || "General Support Squad"}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              Welcome, {user?.name}
            </h1>
            <p className="text-xs text-slate-400">
              Live Volunteer Task Radar • MIC Knowledge Festival
            </p>
          </div>
        </div>

        {/* Quick stats pills */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
          <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl text-center border border-slate-700">
            <div className="text-lg font-black text-red-400">{urgentCount}</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Urgent</div>
          </div>
          <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl text-center border border-slate-700">
            <div className="text-lg font-black text-amber-400">{pendingCount}</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Pending</div>
          </div>
          <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl text-center border border-slate-700">
            <div className="text-lg font-black text-emerald-400">{myCompletedCount}</div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Done</div>
          </div>
        </div>
      </div>

      {/* Urgent Alert Callout */}
      {urgentCount > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-center justify-between gap-3 animate-pulse-subtle">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="text-xs font-semibold">
              <strong className="font-bold">{urgentCount} Urgent Action{urgentCount > 1 ? "s" : ""} Required!</strong> Check the radar below and respond immediately.
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All Tasks" },
          { id: "pending", label: `Pending (${pendingCount})` },
          { id: "accepted", label: "In Progress" },
          { id: "completed", label: `Completed (${myCompletedCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task Radar Cards */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No active tasks in this tab!</h3>
            <p className="text-xs text-slate-400 mt-1">
              You are all caught up. Keep this page open for real-time task dispatches from Admin.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isUrgent = task.priority === "urgent";
            const isPending = task.status === "pending";
            const isAccepted = task.status === "accepted";
            const isCompleted = task.status === "completed";

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-5 sm:p-6 shadow-sm border transition ${
                  isUrgent && !isCompleted
                    ? "border-red-400 ring-2 ring-red-100 bg-red-50/10"
                    : isAccepted
                    ? "border-emerald-300 bg-emerald-50/10"
                    : "border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getPriorityBadge(task.priority)}
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Target: {task.assigned_to === "all" ? "All Volunteers" : task.assigned_to}
                      </span>
                      {task.team && (
                        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {task.team}
                        </span>
                      )}
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-slate-900">{task.title}</h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">
                      {task.instructions}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Location: <strong>{task.location}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Created: {new Date(task.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center justify-end gap-2 flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {isPending && (
                      <button
                        onClick={() => handleAccept(task.id)}
                        className="w-full sm:w-36 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow transition text-xs flex items-center justify-center gap-1.5"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Accept Task</span>
                      </button>
                    )}

                    {isAccepted && (
                      <button
                        onClick={() => handleComplete(task.id)}
                        className="w-full sm:w-36 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow transition text-xs flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Mark Completed</span>
                      </button>
                    )}

                    {isCompleted && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
