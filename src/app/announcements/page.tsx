"use client";

import React, { useState } from "react";
import { useEventData } from "@/lib/store";
import { Bell, AlertTriangle, Info, Clock } from "lucide-react";
import { PriorityLevel } from "@/types";

export default function AnnouncementsPage() {
  const { announcements } = useEventData();
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const filtered = announcements.filter((a) => {
    if (filterPriority === "all") return true;
    return a.priority === filterPriority;
  });

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-bounce-slight" />
            Urgent Alert
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
            Important
          </span>
        );
      case "normal":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
            Notice
          </span>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
          <Bell className="w-4 h-4" />
          <span>Real-time Broadcasts</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Festival Announcements
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Instant updates, venue alerts, schedule modifications, and emergency notices.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { id: "all", label: "All Updates" },
          { id: "urgent", label: "Urgent Only" },
          { id: "high", label: "High Priority" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterPriority(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterPriority === tab.id
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
            <Info className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No announcements found.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border transition ${
                item.priority === "urgent"
                  ? "border-red-300 bg-red-50/20 ring-1 ring-red-200"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {getPriorityBadge(item.priority)}
                  <span className="text-[11px] font-semibold text-slate-400">
                    To: {item.target.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {new Date(item.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                {item.message}
              </p>

              {item.author && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Issued by: <strong className="text-slate-600 font-medium">{item.author}</strong></span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
