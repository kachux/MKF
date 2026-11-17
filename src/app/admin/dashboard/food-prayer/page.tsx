"use client";

import React, { useState } from "react";
import { useEventData, EventStore } from "@/lib/store";
import { Plus, Trash2, Clock, MapPin } from "lucide-react";
import { FoodPrayerStatus, FoodPrayerType } from "@/types";

export default function AdminFoodPrayerPage() {
  const { foodPrayer } = useEventData();

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<FoodPrayerType>("food");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !time || !location) return;

    EventStore.addFoodPrayer({
      type,
      title,
      time,
      location,
      status: "upcoming",
      notes,
    });

    setTitle("");
    setTime("");
    setLocation("");
    setNotes("");
    setShowForm(false);
  };

  const handleStatusChange = (id: string, status: FoodPrayerStatus) => {
    EventStore.updateFoodPrayer(id, { status });
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this food/prayer entry?")) {
      const updated = foodPrayer.filter((item) => item.id !== id);
      EventStore.saveFoodPrayer(updated);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Food & Prayer Control
          </h1>
          <p className="text-xs text-slate-500">
            Publish meal distribution announcements, dining shifts, and prayer congregation updates.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Food or Prayer Schedule</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-3xl p-6 shadow-sm border border-amber-200 space-y-4 animate-in fade-in"
        >
          <h2 className="text-sm font-bold text-slate-900">Add Entry</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Entry Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as FoodPrayerType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="food">Food Distribution / Meals</option>
                <option value="prayer">Prayer Announcement / Congregation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Title / Session Name
              </label>
              <input
                type="text"
                required
                placeholder={type === "food" ? "e.g. Afternoon High Tea" : "e.g. Maghrib Congregation"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Time Window
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 01:30 PM - 03:00 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Distribution / Prayer Location
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dining Hall B, Central Mosque"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Notes or Special Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Entry via East Wing only. Wudu facilities available in Basement."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow"
            >
              Publish Entry
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 divide-y divide-slate-100">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900">Items ({foodPrayer.length})</h2>
          <span className="text-[11px] text-slate-400">Toggle active status when meals or prayers start</span>
        </div>

        {foodPrayer.map((item) => (
          <div key={item.id} className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    item.type === "food"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {item.type}
                </span>
                <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location}
                </span>
              </div>
              {item.notes && <p className="text-[11px] text-slate-400 mt-1">{item.notes}</p>}
            </div>

            <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
              <select
                value={item.status}
                onChange={(e) => handleStatusChange(item.id, e.target.value as FoodPrayerStatus)}
                className={`text-xs font-bold py-1.5 px-3 rounded-xl border focus:outline-none ${
                  item.status === "active"
                    ? "bg-green-100 text-green-800 border-green-300"
                    : item.status === "completed"
                    ? "bg-slate-100 text-slate-600 border-slate-300"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">● Serving / Active Now</option>
                <option value="completed">Concluded</option>
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
