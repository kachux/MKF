"use client";

import React, { useState } from "react";
import { useEventData, EventStore } from "@/lib/store";
import { Plus, Trash2, MapPin } from "lucide-react";
import { PriorityLevel, TaskStatus } from "@/types";

export default function AdminTasksPage() {
  const { tasks } = useEventData();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("normal");
  const [team, setTeam] = useState("Crowd Control");
  const [assignedTo, setAssignedTo] = useState("all");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !instructions || !location) return;

    EventStore.addTask({
      title,
      instructions,
      location,
      priority,
      status: "pending",
      assigned_to: assignedTo,
      team,
    });

    setTitle("");
    setInstructions("");
    setLocation("");
    setShowForm(false);
  };

  const handleStatusChange = (id: string, status: TaskStatus) => {
    EventStore.updateTask(id, {
      status,
      completed_at: status === "completed" ? new Date().toISOString() : undefined,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this volunteer task?")) {
      EventStore.deleteTask(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Volunteer Tasks & Radar
          </h1>
          <p className="text-xs text-slate-500">
            Dispatch urgent instructions to ground squads and monitor completion status live.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch New Task</span>
        </button>
      </div>

      {/* Task Creation Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-200 space-y-4 animate-in fade-in"
        >
          <h2 className="text-sm font-bold text-slate-900">Dispatch Task to Field Volunteers</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Task Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Crowd Management at Hall 2 Entry"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Location
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Gate 1, Dining Hall B, Seminar Stage"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Assigned Team Squad
              </label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Crowd Control">Crowd Control & Gate Safety</option>
                <option value="Stage & Ground Team">Stage & Audio-Visual Squad</option>
                <option value="Hospitality Team">Dining & Refreshment Squad</option>
                <option value="Medical Team">Medical & First-Aid Squad</option>
                <option value="Help Desk Squad">Information & Help Desk</option>
                <option value="General Support">General Support Squad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Target Volunteer
              </label>
              <input
                type="text"
                placeholder="'all' or specific volunteer name"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Instructions
            </label>
            <textarea
              required
              rows={2}
              placeholder="Explicit steps: where to report, who to contact, what to deliver..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Priority:</span>
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

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow"
              >
                Dispatch Task Now
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 divide-y divide-slate-100">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900">Task Log ({tasks.length})</h2>
          <span className="text-[11px] text-slate-400">Updates sync in real-time to volunteer devices</span>
        </div>

        {tasks.map((task) => (
          <div key={task.id} className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    task.priority === "urgent"
                      ? "bg-red-100 text-red-700"
                      : task.priority === "high"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {task.priority}
                </span>
                <h3 className="font-bold text-sm text-slate-900">{task.title}</h3>
                {task.team && (
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded">
                    {task.team}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-snug">{task.instructions}</p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {task.location}
                </span>
                <span>Assigned: <strong className="text-slate-700">{task.assigned_to}</strong></span>
                <span>• {new Date(task.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                className={`text-xs font-bold py-1.5 px-3 rounded-xl border focus:outline-none ${
                  task.status === "completed"
                    ? "bg-green-100 text-green-800 border-green-300"
                    : task.status === "accepted"
                    ? "bg-blue-100 text-blue-800 border-blue-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}
              >
                <option value="pending">Pending</option>
                <option value="accepted">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <button
                onClick={() => handleDelete(task.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete task"
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
