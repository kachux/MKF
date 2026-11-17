"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import MKFLogo from "@/components/MKFLogo";
import { useAuth } from "@/lib/authContext";
import { EventStore } from "@/lib/store";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";
import { LostFoundItem, LostFoundStatus } from "@/types";

function ReportItemForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const initialType = searchParams.get("type") === "found" ? "found" : "reported";
  const [reportType, setReportType] = useState<LostFoundStatus>(initialType);

  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState<LostFoundItem["category"]>("Bags & Books");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !location.trim() || !description.trim()) return;

    setLoading(true);

    const payload = {
      item_name: itemName.trim(),
      category,
      location: location.trim(),
      description: description.trim(),
      status: reportType,
      contact_name: contactName.trim() || (reportType === "found" ? "Finder Desk" : "Attendee"),
      contact_phone: phone.trim() || "+91 98000 00000",
      contact_email: user?.email || "helpdesk@mkf.org",
    };

    // 1. Add to client store for immediate reactivity
    EventStore.addLostFound(payload);

    // 2. Persist to SQLite backend
    try {
      await fetch("/api/lost-found", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {}

    setSubmitted(true);
    setTimeout(() => {
      router.push("/lost-found");
    }, 1800);
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

          <Link
            href="/lost-found"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition px-2 py-1"
          >
            LOST & FOUND
          </Link>
        </div>
      </header>

      {/* Main Content (Figma nodes 13-66 & 13-119) */}
      <main className="max-w-3xl w-full mx-auto px-6 sm:px-10 py-6 sm:py-10 flex-1">
        {/* Back Link */}
        <Link
          href="/lost-found"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition group mb-5"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition group-hover:-translate-x-0.5" />
          <span>Lost & found list</span>
        </Link>

        {/* Hero Kicker & Headlines */}
        <div className="mb-6">
          <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#00897B] uppercase block mb-2">
            A LITTLE DETAIL HELPS
          </span>

          <h1 className="text-3xl sm:text-4xl font-black text-[#0F2841] tracking-tight leading-tight mb-2">
            {reportType === "found" ? "Help the owner find it." : "Report a lost item"}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600">
            {reportType === "found"
              ? "Describe the item clearly and say where it was found. Keep it in a safe place until ownership is confirmed."
              : "Describe your missing item with identifying features so volunteers can trace and notify you."}
          </p>
        </div>

        {/* Type Toggle Pills */}
        <div className="inline-flex bg-slate-100 p-1 rounded-full text-xs font-semibold mb-6">
          <button
            type="button"
            onClick={() => setReportType("found")}
            className={`px-5 py-2 rounded-full transition ${
              reportType === "found"
                ? "bg-[#005953] text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            I Found an Item
          </button>
          <button
            type="button"
            onClick={() => setReportType("reported")}
            className={`px-5 py-2 rounded-full transition ${
              reportType === "reported"
                ? "bg-[#005953] text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            I Lost an Item
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-xl font-black text-[#0F2841]">Report Submitted Successfully!</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                Thank you for contributing to the festival community. Redirecting to the Lost & Found list...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Item Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Item name / title *
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Navy backpack, Keys with red tag, Titan Leather Wallet"
                  className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition"
                />
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition"
                  >
                    <option value="Bags & Books">Bags & Books</option>
                    <option value="Electronics">Electronics & Phones</option>
                    <option value="Wallets & IDs">Wallets & IDs</option>
                    <option value="Keys">Keys</option>
                    <option value="Glasses & Accessories">Glasses & Accessories</option>
                    <option value="Other">Other Belonging</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Location {reportType === "found" ? "found" : "last seen"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Near Stage 1, Food court beside Stage 2"
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Detailed description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe color, brand, unique marks, stickers, or specific contents to verify ownership..."
                  className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition"
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Your name / role
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Suhail / Volunteer desk"
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Contact phone number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98471 23456"
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition"
                  />
                </div>
              </div>

              {/* Notice Box from Figma node 13-66 */}
              <div className="bg-[#FEF9C3]/50 border border-[#FEF08A] rounded-2xl p-4 text-xs text-amber-900 leading-relaxed shadow-2xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block mb-0.5">Keep it safe.</strong>
                  Avoid sharing ID numbers, passwords or bank details in your description. Only share a phone number if you&apos;re comfortable being contacted directly.
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#005953] hover:bg-[#004843] text-white font-bold py-3.5 px-6 rounded-full flex items-center justify-between text-xs sm:text-sm shadow-md transition disabled:opacity-70 mt-2"
              >
                <span>{loading ? "Submitting report..." : "Submit report"}</span>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-white" />
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Navy Bottom Bar */}
      <footer className="w-full bg-[#081726] text-slate-400 px-6 sm:px-10 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <span>© MKF · Malabar Knowledge Fest</span>
        <span className="text-[#38BDF8] font-medium">Stay curious.</span>
      </footer>
    </div>
  );
}

export default function ReportItemPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-xs text-slate-500">
          Loading report form...
        </div>
      }
    >
      <ReportItemForm />
    </Suspense>
  );
}
