"use client";

import React, { useState } from "react";
import { useEventData } from "@/lib/store";
import Link from "next/link";
import { Search, PlusCircle, MapPin, Tag, Phone, CheckCircle2, Clock } from "lucide-react";
import { LostFoundStatus } from "@/types";

export default function LostFoundPage() {
  const { lostFound } = useEventData();
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = lostFound.filter((item) => {
    const matchesFilter = filter === "all" || item.status === filter;
    const matchesSearch =
      item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: LostFoundStatus) => {
    switch (status) {
      case "found":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            Found / Ready at Desk
          </span>
        );
      case "reported":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
            Reported Lost
          </span>
        );
      case "returned":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full border border-slate-200">
            Returned to Owner
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Search className="w-4 h-4" />
            <span>Community Care</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Lost & Found Desk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Report misplaced belongings or check items turned into the festival control desk.
          </p>
        </div>

        <Link
          href="/lost-found/report"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl shadow transition text-xs sm:text-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Lost Item</span>
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search wallet, bottle, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Items" },
            { id: "found", label: "Found & Claimable" },
            { id: "reported", label: "Searching / Lost" },
            { id: "returned", label: "Returned" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filter === tab.id
                  ? "bg-slate-900 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-slate-200">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No items found.</p>
            <p className="text-xs text-slate-400 mt-1">If you lost an item, please submit a quick report.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border transition flex flex-col justify-between ${
                item.status === "found"
                  ? "border-green-300 ring-1 ring-green-100"
                  : "border-slate-200"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    {item.category}
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-1">{item.item_name}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{item.description}</p>

                <div className="mt-4 space-y-1 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Location: <strong>{item.location}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Contact: {item.contact_name} ({item.contact_phone})</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {item.status === "found" && (
                  <span className="text-green-700 font-semibold">Visit Central Help Desk to claim</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
