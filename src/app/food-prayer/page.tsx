"use client";

import React, { useState } from "react";
import { useEventData } from "@/lib/store";
import { Utensils, Moon, Clock, MapPin } from "lucide-react";
import { FoodPrayerStatus } from "@/types";

export default function FoodPrayerPage() {
  const { foodPrayer } = useEventData();
  const [activeTab, setActiveTab] = useState<"all" | "food" | "prayer">("all");

  const filtered = foodPrayer.filter((item) => {
    if (activeTab === "all") return true;
    return item.type === activeTab;
  });

  const getStatusBadge = (status: FoodPrayerStatus) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-ping"></span>
            ACTIVE NOW
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Upcoming
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
            Concluded
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
          <Utensils className="w-4 h-4" />
          <span>Hospitality & Worship</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Food Distribution & Prayer Timings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Check live meals, dining hall locations, congregation prayer calls, and ablution facilities.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "all"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setActiveTab("food")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "food"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Utensils className="w-3.5 h-3.5" /> Food & Meals
        </button>
        <button
          onClick={() => setActiveTab("prayer")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "prayer"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Moon className="w-3.5 h-3.5" /> Prayer Timings
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const isFood = item.type === "food";
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border transition relative flex flex-col justify-between ${
                item.status === "active"
                  ? isFood
                    ? "border-amber-400 ring-2 ring-amber-100"
                    : "border-purple-400 ring-2 ring-purple-100"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                        isFood ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {isFood ? <Utensils className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isFood ? "text-amber-700" : "text-purple-700"
                      }`}
                    >
                      {isFood ? "Dining / Meals" : "Prayer Call"}
                    </span>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{item.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.location}</span>
                  </div>
                </div>

                {item.notes && (
                  <p className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {item.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
