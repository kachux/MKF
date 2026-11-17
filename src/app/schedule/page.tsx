"use client";

import React, { useState } from "react";
import { useEventData } from "@/lib/store";
import { Calendar, Clock, MapPin, User, Search } from "lucide-react";
import { ProgramStatus } from "@/types";

export default function SchedulePage() {
  const { programs } = useEventData();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPrograms = programs.filter((p) => {
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.speaker && p.speaker.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: ProgramStatus) => {
    switch (status) {
      case "ongoing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-ping"></span>
            LIVE NOW
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Upcoming
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
          <Calendar className="w-4 h-4" />
          <span>Live Festival Timeline</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Program Schedule
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time updates on keynotes, seminars, discussions, and award sessions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by topic, speaker, hall..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Sessions" },
            { id: "ongoing", label: "Live Now" },
            { id: "upcoming", label: "Upcoming" },
            { id: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterStatus === tab.id
                  ? "bg-slate-900 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Programs List */}
      <div className="space-y-4">
        {filteredPrograms.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No sessions match your filter.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the search or filter tab.</p>
          </div>
        ) : (
          filteredPrograms.map((program) => (
            <div
              key={program.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border transition relative ${
                program.status === "ongoing"
                  ? "border-green-400 ring-2 ring-green-100"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(program.status)}
                    {program.category && (
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {program.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {program.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {program.description}
                  </p>

                  {program.speaker && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium mt-3">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>{program.speaker}</span>
                    </div>
                  )}
                </div>

                <div className="sm:text-right flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="inline-flex sm:flex sm:flex-col items-center sm:items-end gap-1.5 text-xs font-semibold text-slate-800 bg-slate-50 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg">
                    <span className="flex items-center gap-1 text-blue-600">
                      <Clock className="w-3.5 h-3.5" />
                      {program.start_time} - {program.end_time}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 font-normal">
                      <MapPin className="w-3.5 h-3.5" />
                      {program.venue}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
