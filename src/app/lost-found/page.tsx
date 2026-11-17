"use client";

import React, { useState } from "react";
import Link from "next/link";
import MKFLogo from "@/components/MKFLogo";
import { useEventData, EventStore } from "@/lib/store";
import {
  ArrowLeft,
  ArrowUpRight,
  Search,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles,
  Info,
} from "lucide-react";
import { LostFoundStatus } from "@/types";

export default function LostFoundPage() {
  const { lostFound } = useEventData();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleResolve = (itemId: string, itemName: string) => {
    EventStore.updateLostFound(itemId, { status: "returned" });
    setToastMessage(`"${itemName}" marked as returned/resolved. Thank you!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredItems = lostFound.filter((item) => {
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.item_name.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      (item.contact_name && item.contact_name.toLowerCase().includes(query));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between selection:bg-teal-700 selection:text-white">
      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 pt-8 pb-4 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="hover:opacity-90 transition">
          <MKFLogo size="md" />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/help-desk"
            className="bg-[#005953] hover:bg-[#004843] text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xs transition"
          >
            <span>? Help Desk</span>
          </Link>

          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition px-2 py-1"
          >
            FESTIVAL GUIDE
          </Link>
        </div>
      </header>

      {/* Main Lost & Found Content (Figma node 13-2) */}
      <main className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 py-6 sm:py-10 flex-1">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition group mb-5"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition group-hover:-translate-x-0.5" />
          <span>Festival home</span>
        </Link>

        {/* Hero Kicker & Headlines */}
        <div className="mb-6">
          <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#00897B] uppercase block mb-2">
            LOST & FOUND
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F2841] tracking-tight leading-tight mb-2">
            Let&apos;s get it back to you.
          </h1>

          <p className="text-xs sm:text-sm text-slate-600">
            Lost something or found an item? Report it here and connect directly.
          </p>
        </div>

        {/* Two Main Action Buttons from Figma node 13-2 */}
        <div className="flex flex-wrap items-center gap-3.5 mb-8">
          <Link
            href="/lost-found/report?type=lost"
            className="bg-[#005953] hover:bg-[#004843] text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-full shadow-sm flex items-center gap-2 transition hover:shadow-md active:scale-95"
          >
            <span>Report a lost item</span>
            <ArrowUpRight className="w-4 h-4 text-teal-200" />
          </Link>

          <Link
            href="/lost-found/report?type=found"
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold px-6 py-3.5 rounded-full shadow-2xs flex items-center gap-2 transition hover:shadow-xs active:scale-95"
          >
            <span>Report a found item</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/help-desk"
            className="text-xs font-semibold text-teal-800 hover:underline ml-auto flex items-center gap-1 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200"
          >
            <Sparkles className="w-3 h-3 text-teal-600" />
            <span>Ask AI Help Desk</span>
          </Link>
        </div>

        {/* Notice Banner from Figma node 13-2 */}
        <div className="bg-[#E8F5F1] border border-[#CDEAE2] rounded-2xl p-4 mb-8 flex items-start gap-3 text-xs text-[#005953] leading-relaxed shadow-2xs">
          <Info className="w-4 h-4 text-[#005953] flex-shrink-0 mt-0.5" />
          <p>
            Share only the contact details you&apos;re comfortable making visible. Verify ownership before handing over an item.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 mb-8 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search item name, brand, color, location..."
              className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
            <span className="text-slate-400 text-xs hidden lg:inline mr-1">Status:</span>
            {[
              { id: "all", label: `All (${lostFound.length})` },
              { id: "found", label: "Found" },
              { id: "reported", label: "Reported Lost" },
              { id: "returned", label: "Claimed / Resolved" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition ${
                  statusFilter === tab.id
                    ? "bg-[#005953] text-white font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section Heading: Recent reports */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-[#0F2841]">
            Recent reports
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredItems.length} items
          </span>
        </div>

        {/* Cards Grid (Matching Figma layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">No items match your search</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Be the first to log a report if you found or lost an item.
              </p>
              <Link
                href="/lost-found/report"
                className="bg-[#005953] text-white text-xs font-bold px-4 py-2 rounded-full inline-block"
              >
                Submit a new report
              </Link>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isFound = item.status === "found";
              const isReturned = item.status === "returned";

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Badge */}
                    <div className="flex items-center justify-between">
                      {isReturned ? (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-slate-500" />
                          <span>RESOLVED / RETURNED</span>
                        </span>
                      ) : isFound ? (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-cyan-100/70 text-cyan-900 px-2.5 py-0.5 rounded-full border border-cyan-200">
                          FOUND
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-200">
                          REPORTED LOST
                        </span>
                      )}

                      <span className="text-[11px] font-semibold text-slate-400">
                        {item.category}
                      </span>
                    </div>

                    {/* Title & Location */}
                    <div>
                      <h3 className="text-base font-bold text-[#0F2841] leading-snug">
                        {item.item_name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-teal-800 font-medium mt-1">
                        <MapPin className="w-3 h-3 text-teal-600 flex-shrink-0" />
                        <span>{item.location}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Contact Row & Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-700 font-semibold mb-3 flex items-center justify-between">
                      <span className="text-slate-500 font-normal">
                        {isFound ? "Finder" : "Owner"}:{" "}
                        <strong className="text-slate-800 font-semibold">{item.contact_name}</strong>
                      </span>
                      {item.contact_phone && (
                        <span className="font-mono text-slate-600 text-[11px]">{item.contact_phone}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.contact_phone && (
                        <>
                          <a
                            href={`tel:${item.contact_phone}`}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition text-center"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-600" />
                            <span>Call</span>
                          </a>

                          <a
                            href={`sms:${item.contact_phone}`}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition text-center"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                            <span>Message</span>
                          </a>
                        </>
                      )}

                      {!isReturned && (
                        <button
                          type="button"
                          onClick={() => handleResolve(item.id, item.item_name)}
                          className="bg-[#005953] hover:bg-[#004843] text-white text-xs font-bold py-2 px-3 rounded-xl transition"
                          title="Mark this item as returned/claimed"
                        >
                          Claim
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <Link
        href="/help-desk"
        title="Open MKF AI Help Desk"
        className="fixed bottom-8 right-8 z-40 w-12 h-12 bg-white hover:bg-slate-50 text-slate-800 rounded-full shadow-lg hover:shadow-xl border border-slate-200/80 flex items-center justify-center font-bold text-lg hover:scale-105 active:scale-95 transition"
      >
        <span>?</span>
      </Link>

      {/* Navy Bottom Bar */}
      <footer className="w-full bg-[#081726] text-slate-400 px-6 sm:px-10 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <span>© MKF · Malabar Knowledge Fest</span>
        <span className="text-[#38BDF8] font-medium">Stay curious.</span>
      </footer>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
