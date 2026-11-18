"use client";

import React from "react";
import { useEventData, EventStore } from "@/lib/store";
import { MapPin, Phone, Trash2 } from "lucide-react";
import { LostFoundStatus } from "@/types";

export default function AdminLostFoundPage() {
  const { lostFound } = useEventData();

  const handleStatusChange = (id: string, status: LostFoundStatus) => {
    EventStore.updateLostFound(id, { status });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this lost item report?")) {
      EventStore.deleteLostFound(id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Lost & Found Desk Manager
        </h1>
        <p className="text-xs text-slate-500">
          Verify recovered items, mark them as ready for pickup, or close cases when returned.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 divide-y divide-slate-100">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900">Reports ({lostFound.length})</h2>
          <span className="text-[11px] text-slate-400">Change status to &quot;Found&quot; when item is at control desk</span>
        </div>

        {lostFound.map((item) => (
          <div key={item.id} className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {item.category}
                </span>
                <h3 className="font-bold text-sm text-slate-900">{item.item_name}</h3>
              </div>
              <p className="text-xs text-slate-600 leading-snug">{item.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                <span className="flex items-center gap-1 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Loc: {item.location}
                </span>
                <span className="flex items-center gap-1 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact: {item.contact_name} ({item.contact_phone})
                </span>
                <span>• {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
              <select
                value={item.status}
                onChange={(e) => handleStatusChange(item.id, e.target.value as LostFoundStatus)}
                className={`text-xs font-bold py-1.5 px-3 rounded-xl border focus:outline-none ${
                  item.status === "found"
                    ? "bg-green-100 text-green-800 border-green-300"
                    : item.status === "returned"
                    ? "bg-slate-100 text-slate-600 border-slate-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}
              >
                <option value="reported">Reported Lost</option>
                <option value="found">● Found & At Desk</option>
                <option value="returned">Returned to Owner</option>
              </select>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete item"
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
