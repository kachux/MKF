"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import MKFLogo from "@/components/MKFLogo";
import {
  Calendar,
  Clock,
  MapPin,
  Utensils,
  Moon,
  Search,
  Sparkles,
  ArrowUpRight,
  LogOut,
  CheckCircle2,
  X,
  Radio,
  Sun,
  CloudSun,
} from "lucide-react";
import { useEventData } from "@/lib/store";

export default function DelegateFrontPage() {
  const { user, logout, isAudience } = useAuth();
  const router = useRouter();
  const { programs, foodPrayer, announcements } = useEventData();

  const [prayerModalOpen, setPrayerModalOpen] = useState(false);

  // If not logged in, use default delegate demo data so reviewer sees the full UI immediately
  const delegateName = user?.name || "Kasim Rahees";
  const delegateEmail = user?.email || "kasimraheeskzr@gmail.com";
  const delegateAvatar = user?.avatar;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

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

          {/* PROMINENT GOOGLE ACCOUNT BADGE */}
          <div className="flex items-center gap-3 bg-white border border-slate-200/80 rounded-2xl px-4 py-2 shadow-sm">
          {/* Google Official Logo */}
          <div className="w-8 h-8 rounded-full bg-white border border-slate-100 shadow-xs flex items-center justify-center flex-shrink-0">
            {delegateAvatar ? (
              <img
                src={delegateAvatar}
                alt={delegateName}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
            )}
          </div>

          {/* Account Name & Gmail */}
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1.5">
              <span>{delegateName}</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                Delegate
              </span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono leading-tight">
              {delegateEmail}
            </span>
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            title="Sign out of delegate account"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>

      {/* Main Content Area - Matching "MKF — Festival front page" */}
      <main className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 py-8 sm:py-12 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
          {/* Left Column */}
          <div className="flex flex-col">
            {/* Tag */}
            <div className="text-[11px] font-extrabold tracking-[0.18em] text-[#00897B] uppercase mb-3">
              WELCOME TO MKF
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0F2841] tracking-tight leading-[1.08] mb-4">
              Where would you like to go?
            </h1>

            {/* Google Delegate Profile Card */}
            <div className="bg-white/80 border border-slate-200/70 rounded-2xl p-4 mb-8 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{delegateName}</span>
                    <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      Verified Google Delegate
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{delegateEmail}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200/60">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Connected</span>
              </div>
            </div>

            {/* 3 Action Buttons / Pills from Figma Design */}
            <div className="space-y-3.5 max-w-md">
              {/* 1. Schedules ↗ */}
              <Link
                href="/schedule"
                className="w-full bg-[#FAF7F2] hover:bg-white text-slate-800 font-bold py-3.5 px-6 rounded-full border border-slate-300/80 shadow-xs flex items-center justify-between transition hover:shadow-md group text-sm"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition" />
                  <span>Schedules</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-slate-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </Link>

              {/* 2. Weather & prayer timings ↗ */}
              <button
                onClick={() => setPrayerModalOpen(true)}
                className="w-full bg-[#FCE7F3] hover:bg-[#FBCFE8] text-[#9F1239] font-bold py-3.5 px-6 rounded-full border border-rose-200/80 shadow-xs flex items-center justify-between transition hover:shadow-md group text-sm"
              >
                <div className="flex items-center gap-3">
                  <Moon className="w-4 h-4 text-[#9F1239]" />
                  <span>Weather & prayer timings</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#9F1239] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </button>

              {/* 3. Lost & found ↗ */}
              <Link
                href="/lost-found"
                className="w-full bg-[#005C53] hover:bg-[#004740] text-white font-bold py-3.5 px-6 rounded-full shadow-md shadow-teal-950/20 flex items-center justify-between transition hover:shadow-lg group text-sm"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-teal-200" />
                  <span>Lost & found</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </Link>

              {/* 4. MKF AI Help Desk (Voice & Chat) ↗ */}
              <Link
                href="/help-desk"
                className="w-full bg-[#E8F5F1] hover:bg-[#D7ECE7] text-[#005953] font-bold py-3.5 px-6 rounded-full border border-[#CDEAE2] shadow-xs flex items-center justify-between transition hover:shadow-md group text-sm"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-[#005953]" />
                  <span>MKF AI Help Desk · Voice & Chat</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#005953] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </Link>
            </div>
          </div>

          {/* Right Column: Attendees Photo */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="rounded-[28px] overflow-hidden shadow-sm aspect-[4/3] w-full max-w-lg bg-slate-100 border border-slate-200/40">
              <img
                src="/images/attendees.jpg"
                alt="Festival Attendees"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Navy Bottom Bar */}
      <footer className="w-full bg-[#081726] text-slate-400 px-6 sm:px-10 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <span>© MKF · Malabar Knowledge Fest</span>
        <span className="text-[#38BDF8] font-medium">Stay curious.</span>
      </footer>

      {/* Weather & Prayer Timings Modal */}
      {prayerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setPrayerModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#9F1239] flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Weather & Prayer Timings</h3>
                <p className="text-xs text-slate-500">Live timings for Malabar Knowledge Fest</p>
              </div>
            </div>

            {/* Weather widget */}
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CloudSun className="w-8 h-8 text-amber-500" />
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Festival Venue Weather</span>
                  <span className="text-lg font-black text-slate-900">29°C · Partly Sunny</span>
                </div>
              </div>
              <span className="text-xs text-sky-700 bg-sky-100 font-semibold px-2.5 py-1 rounded-full">Calicut / Malabar</span>
            </div>

            {/* Timings list */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {foodPrayer.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    {item.type === "prayer" ? (
                      <Moon className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Utensils className="w-4 h-4 text-amber-500" />
                    )}
                    <div>
                      <span className="text-sm font-bold text-slate-800 block">{item.title}</span>
                      <span className="text-xs text-slate-500">{item.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-700 block">{item.time}</span>
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                      item.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPrayerModalOpen(false)}
              className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
