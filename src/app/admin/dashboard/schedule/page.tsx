"use client";

import React, { useState } from "react";
import { useEventData, EventStore } from "@/lib/store";
import { Plus, Trash2, Clock, MapPin, X } from "lucide-react";
import { ProgramStatus } from "@/types";

export default function AdminSchedulePage() {
  const { programs } = useEventData();

  // Create form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [startTime, setStartTime] = useState("10:00 AM");
  const [endTime, setEndTime] = useState("11:30 AM");
  const [venue, setVenue] = useState("Main Auditorium (Grand Hall)");
  const [category, setCategory] = useState("Keynote");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !venue) return;

    EventStore.addProgram({
      title,
      description,
      speaker,
      start_time: startTime,
      end_time: endTime,
      venue,
      status: "upcoming",
      category,
    });

    setTitle("");
    setDescription("");
    setSpeaker("");
    setShowAddForm(false);
  };

  const handleStatusChange = (id: string, status: ProgramStatus) => {
    EventStore.updateProgram(id, { status });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this program?")) {
      EventStore.deleteProgram(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Schedule Manager
          </h1>
          <p className="text-xs text-slate-500">
            Control the live festival timeline. Real-time updates sync to all audience screens.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow self-start sm:self-auto"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? "Close Form" : "Add Program Session"}</span>
        </button>
      </div>

      {/* Add Program Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-3xl p-6 shadow-sm border border-blue-200 space-y-4 animate-in fade-in"
        >
          <h2 className="text-sm font-bold text-slate-900">Add New Program Session</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Program Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Panel Discussion on AI & Society"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Speaker / Host
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. A. Rahman & Guests"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Start Time
              </label>
              <input
                type="text"
                required
                placeholder="02:00 PM"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                End Time
              </label>
              <input
                type="text"
                required
                placeholder="03:30 PM"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Venue / Hall
              </label>
              <input
                type="text"
                required
                placeholder="Main Auditorium, Seminar Hall A, Exhibition Pavilion"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Category
              </label>
              <input
                type="text"
                placeholder="Keynote, Symposium, Workshop, Valedictory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Session summary and attendee highlights..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow"
            >
              Save & Publish Program
            </button>
          </div>
        </form>
      )}

      {/* Programs Management Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900">Program List ({programs.length})</h2>
          <span className="text-[11px] text-slate-400">Click status badge to toggle live session state</span>
        </div>

        <div className="divide-y divide-slate-100">
          {programs.map((program) => (
            <div key={program.id} className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-900">{program.title}</span>
                  {program.category && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      {program.category}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-blue-600 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> {program.start_time} - {program.end_time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {program.venue}
                  </span>
                  {program.speaker && <span>Host: {program.speaker}</span>}
                </div>
              </div>

              {/* Status Switcher & Delete */}
              <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
                <select
                  value={program.status}
                  onChange={(e) => handleStatusChange(program.id, e.target.value as ProgramStatus)}
                  className={`text-xs font-bold py-1.5 px-3 rounded-xl border focus:outline-none ${
                    program.status === "ongoing"
                      ? "bg-green-100 text-green-800 border-green-300"
                      : program.status === "cancelled"
                      ? "bg-red-100 text-red-800 border-red-300"
                      : program.status === "completed"
                      ? "bg-slate-100 text-slate-600 border-slate-300"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">● Live Now</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <button
                  onClick={() => handleDelete(program.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete program"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
