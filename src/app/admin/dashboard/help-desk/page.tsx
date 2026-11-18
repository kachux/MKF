"use client";

import React from "react";
import { useEventData, EventStore } from "@/lib/store";
import { MapPin, Trash2, ArrowRight } from "lucide-react";
import { HelpRequestStatus } from "@/types";

export default function AdminHelpDeskPage() {
  const { helpRequests } = useEventData();

  const handleStatusChange = (id: string, status: HelpRequestStatus) => {
    EventStore.updateHelpRequest(id, { status });
  };


  const handleConvertToTask = (req: (typeof helpRequests)[0]) => {
    EventStore.addTask({
      title: `Help Desk: ${req.category} (${req.name})`,
      instructions: `Attendee reported: "${req.description}". Contact: ${req.contact || "N/A"}. Report to ${req.location} immediately.`,
      location: req.location,
      priority: req.category === "Medical assistance" ? "urgent" : "high",
      status: "pending",
      assigned_to: "all",
      team: req.category === "Medical assistance" ? "Medical Team" : "Help Desk Squad",
    });

    EventStore.updateHelpRequest(req.id, {
      status: "in_progress",
      assigned_to: "Dispatched to Volunteer Squad",
    });

    alert("Task dispatched to volunteer radar!");
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this help request?")) {
      EventStore.deleteHelpRequest(id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Help Desk Incident Center
        </h1>
        <p className="text-xs text-slate-500">
          Review attendee requests and dispatch volunteers directly to the attendee&apos;s location.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 divide-y divide-slate-100">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900">Incident Tickets ({helpRequests.length})</h2>
          <span className="text-[11px] text-slate-400">Click &quot;Dispatch to Volunteers&quot; to push onto volunteer radar</span>
        </div>

        {helpRequests.map((req) => (
          <div key={req.id} className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    req.category === "Medical assistance"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {req.category}
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  {req.name} <span className="text-slate-400 text-xs font-normal">({req.contact || "No phone"})</span>
                </h3>
              </div>
              <p className="text-xs text-slate-700 leading-snug">{req.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                <span className="flex items-center gap-1 text-slate-700 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Loc: {req.location}
                </span>
                {req.assigned_to && (
                  <span className="text-blue-600 font-medium">Assigned: {req.assigned_to}</span>
                )}
                <span>• {new Date(req.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
              {req.status !== "resolved" && (
                <button
                  onClick={() => handleConvertToTask(req)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <span>Assign to Volunteer</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}

              <select
                value={req.status}
                onChange={(e) => handleStatusChange(req.id, e.target.value as HelpRequestStatus)}
                className={`text-xs font-bold py-1.5 px-3 rounded-xl border focus:outline-none ${
                  req.status === "resolved"
                    ? "bg-green-100 text-green-800 border-green-300"
                    : req.status === "in_progress" || req.status === "assigned"
                    ? "bg-blue-100 text-blue-800 border-blue-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}
              >
                <option value="open">Open / Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <button
                onClick={() => handleDelete(req.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete ticket"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
