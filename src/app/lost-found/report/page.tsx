"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { EventStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, CheckCircle, AlertTriangle } from "lucide-react";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { LostFoundItem } from "@/types";

export default function ReportLostItemPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState<LostFoundItem["category"]>("Electronics");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !description || !location || !phone) return;

    EventStore.addLostFound({
      item_name: itemName,
      category: category,
      description: description,
      location: location,
      contact_name: user?.name || "Participant",
      contact_phone: phone,
      contact_email: user?.email,
      status: "reported",
    });

    setSubmitted(true);
    setTimeout(() => {
      router.push("/lost-found");
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link
        href="/lost-found"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Lost & Found
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Report a Lost Item</h1>
            <p className="text-xs text-slate-500">
              Submit details so volunteers and organizers can identify your item.
            </p>
          </div>
        </div>

        {/* Require Google login for submission */}
        {!user ? (
          <div className="text-center py-6 border border-slate-200 rounded-2xl p-6 bg-slate-50">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">Sign in to Submit Report</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6 max-w-sm mx-auto">
              Please sign in with your Google account to associate your contact details with this report.
            </p>
            <div className="max-w-xs mx-auto">
              <GoogleLoginButton redirectPath="/lost-found/report" />
            </div>
          </div>
        ) : submitted ? (
          <div className="text-center py-10">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">Report Submitted!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Volunteers will notify you if your item is brought to the control desk.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Item Name / Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Black leather wallet, iPhone 14 with blue case"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LostFoundItem["category"])}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Electronics">Electronics (Phone, Charger, Earbuds)</option>
                <option value="Wallet & ID">Wallet, Purse, ID Cards</option>
                <option value="Bag & Accessories">Bag, Backpack, Watch, Glasses</option>
                <option value="Clothing">Jacket, Shawl, Cap</option>
                <option value="Keys">Keys</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Last-Seen Location
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Seminar Hall A Row 4, or Dining Hall C"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description & Distinguishing Features
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe brand, stickers, color, contents..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Phone Number
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow transition text-sm"
              >
                Submit Lost Item Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
