"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import MKFLogo from "@/components/MKFLogo";
import { useEventData } from "@/lib/store";
import {
  ArrowLeft,
  ArrowUpRight,
  Search,
  Bell,
  Check,
  MapPin,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";

const VENUES = [
  {
    id: "grand-forum",
    number: "01",
    name: "The Grand Forum",
    theme: "Politics, democracy & public life",
    filterKey: "The Grand Forum",
  },
  {
    id: "literary-circle",
    number: "02",
    name: "The Literary Circle",
    theme: "Malayalam & world literature",
    filterKey: "The Literary Circle",
  },
  {
    id: "islamic-discourse",
    number: "03",
    name: "The Islamic Discourse",
    theme: "Islam, faith & contemporary thought",
    filterKey: "The Islamic Discourse",
  },
  {
    id: "creative-arena",
    number: "04",
    name: "The Creative Arena",
    theme: "Art, cinema, media & culture",
    filterKey: "The Creative Arena",
  },
  {
    id: "global-room",
    number: "05",
    name: "The Global Room",
    theme: "International affairs & geopolitics",
    filterKey: "The Global Room",
  },
  {
    id: "youth-lab",
    number: "06",
    name: "The Youth Lab",
    theme: "Education, technology & future society",
    filterKey: "The Youth Lab",
  },
];

export default function SchedulePage() {
  const { programs } = useEventData();
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [reminders, setReminders] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load reminders from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mkf_reminders");
      if (saved) {
        setReminders(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const toggleReminder = (programId: string, title: string) => {
    setReminders((prev) => {
      const nextState = !prev[programId];
      const updated = { ...prev, [programId]: nextState };
      try {
        localStorage.setItem("mkf_reminders", JSON.stringify(updated));
      } catch {}

      setToastMessage(
        nextState
          ? `Reminder set for "${title}". We'll notify you before it starts.`
          : `Reminder removed for "${title}".`
      );
      setTimeout(() => setToastMessage(null), 3500);

      return updated;
    });
  };

  const filteredPrograms = programs.filter((p) => {
    const matchesVenue = !selectedVenue || p.venue.toLowerCase().includes(selectedVenue.toLowerCase());
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.title.toLowerCase().includes(query) ||
      p.venue.toLowerCase().includes(query) ||
      (p.speaker && p.speaker.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query));
    return matchesVenue && matchesSearch;
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

      {/* Main Schedule Content (Figma node 17-2) */}
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
            YOUR DAY AT MKF
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F2841] tracking-tight leading-tight mb-2">
            One day. Six perspectives.
          </h1>

          <p className="text-xs sm:text-sm text-slate-600">
            9:00 AM — 8:30 PM · View-only schedule · Use <strong className="text-slate-800 font-semibold">Notify me</strong> to choose sessions to follow.
          </p>
        </div>

        {/* Suggested Programme Notice Banner */}
        <div className="bg-[#FEF9C3]/50 border border-[#FEF08A] rounded-2xl p-4 mb-8 flex items-start gap-3 text-xs text-amber-900 leading-relaxed shadow-2xs">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Suggested programme</strong> · Invitees are suggestions, not confirmed. All six venues run in parallel except common events.
          </p>
        </div>

        {/* Section: Find your venue (Figma 6-box identity grid) */}
        <section id="venues" className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-black text-[#0F2841]">
              Find your venue
            </h2>
            {selectedVenue && (
              <button
                onClick={() => setSelectedVenue(null)}
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                Show all venues (clear filter)
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {VENUES.map((venue) => {
              const isSelected = selectedVenue === venue.filterKey;
              return (
                <button
                  key={venue.id}
                  onClick={() => setSelectedVenue(isSelected ? null : venue.filterKey)}
                  className={`text-left p-4 rounded-2xl border transition shadow-2xs group flex flex-col justify-between h-28 ${
                    isSelected
                      ? "bg-[#005953] border-[#005953] text-white shadow-md ring-2 ring-teal-500/20"
                      : "bg-white hover:bg-slate-50/80 border-slate-200/90 text-slate-900 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isSelected ? "text-teal-200" : "text-slate-400 group-hover:text-teal-700"
                      }`}
                    >
                      {venue.number}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-teal-700/60 text-white"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                      }`}
                    >
                      Parallel Venue
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-sm font-bold leading-snug ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {venue.name}
                    </h3>
                    <p
                      className={`text-xs mt-0.5 line-clamp-1 ${
                        isSelected ? "text-teal-100" : "text-slate-500"
                      }`}
                    >
                      {venue.theme}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 mb-8 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search session title, speaker, or keyword..."
              className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
            <span className="text-slate-400 text-xs hidden lg:inline mr-1">Filter:</span>
            <button
              onClick={() => setSelectedVenue(null)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition ${
                !selectedVenue ? "bg-[#005953] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Venues ({programs.length})
            </button>
            <Link
              href="/help-desk"
              className="bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-teal-100 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-teal-700" />
              <span>Ask AI schedule</span>
            </Link>
          </div>
        </div>

        {/* Session Timeline Stream (Matching Figma node 17-2) */}
        <div className="space-y-4">
          {filteredPrograms.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">No sessions match your search</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Try searching for a different keyword or view all parallel venues.
              </p>
              <button
                onClick={() => {
                  setSelectedVenue(null);
                  setSearchQuery("");
                }}
                className="bg-[#005953] text-white text-xs font-bold px-4 py-2 rounded-full"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            filteredPrograms.map((program) => {
              const isReminded = reminders[program.id];
              const isLive = program.status === "ongoing";

              return (
                <div
                  key={program.id}
                  className={`bg-white rounded-2xl border p-5 sm:p-6 transition shadow-2xs hover:shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isLive
                      ? "border-emerald-300 ring-2 ring-emerald-100"
                      : "border-slate-200/90 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    {/* Time & Venue Header Pill */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono font-bold text-[#0F2841] bg-slate-100 px-2.5 py-1 rounded-md">
                        {program.start_time} — {program.end_time}
                      </span>

                      <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-600" />
                        <span>{program.venue}</span>
                      </span>

                      {isLive && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                          <span>HAPPENING NOW</span>
                        </span>
                      )}

                      {program.category && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          • {program.category}
                        </span>
                      )}
                    </div>

                    {/* Session Title */}
                    <h3 className="text-base sm:text-lg font-black text-[#0F2841] tracking-tight leading-snug pt-0.5">
                      {program.title}
                    </h3>

                    {/* Speakers & Description */}
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {program.speaker && (
                        <strong className="text-slate-800 font-semibold mr-1">
                          {program.speaker}:
                        </strong>
                      )}
                      {program.description}
                    </p>
                  </div>

                  {/* Right Action: Notify me / Reminder on button */}
                  <div className="flex-shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => toggleReminder(program.id, program.title)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition shadow-2xs active:scale-95 ${
                        isReminded
                          ? "bg-[#005953] text-white shadow-xs"
                          : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300"
                      }`}
                    >
                      {isReminded ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-teal-200" />
                          <span>Reminder on</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-3.5 h-3.5 text-slate-400" />
                          <span>Notify me</span>
                        </>
                      )}
                    </button>
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

      {/* Interactive Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700">
          <Bell className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
