"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import MKFLogo from "@/components/MKFLogo";
import { ArrowLeft, ArrowUpRight, Loader2, AlertCircle } from "lucide-react";

export default function VolunteerLoginPage() {
  const { loginVolunteer, isVolunteer } = useAuth();
  const router = useRouter();

  const [volunteerId, setVolunteerId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isVolunteer) {
      router.push("/volunteer/dashboard");
    }
  }, [isVolunteer, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("Please enter your volunteer password");
      return;
    }

    setLoading(true);

    try {
      const volunteerName = volunteerId.trim() || "Field Volunteer";
      const res = await loginVolunteer(password, volunteerName, "General Support");
      if (res.success) {
        router.push("/volunteer/dashboard");
      } else {
        setError(res.error || "Incorrect volunteer password (try 'mkf2026')");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to authenticate volunteer");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 pt-8 pb-4 flex items-center justify-between">
        <Link href="/" className="hover:opacity-90 transition">
          <MKFLogo size="md" />
        </Link>
        <span className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
          ROLE ACCESS
        </span>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 py-6 sm:py-10 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
          {/* Left Column: Back button + Attendee Photo */}
          <div className="flex flex-col">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition mb-6 group w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition group-hover:-translate-x-0.5" />
              <span>Choose a different role</span>
            </Link>

            <div className="rounded-[28px] overflow-hidden shadow-sm aspect-[4/3] w-full max-w-lg bg-slate-100 border border-slate-200/40">
              <img
                src="/images/attendees.jpg"
                alt="Festival Attendees"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column: Volunteer Sign-in Card */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/60 shadow-xl shadow-slate-200/50 max-w-md w-full">
              {/* Category Badge */}
              <div className="text-[11px] font-extrabold tracking-[0.18em] text-[#D97706] uppercase mb-2">
                TEAM ACCESS
              </div>

              {/* Title */}
              <h1 className="text-3xl font-black text-[#0F2841] tracking-tight mb-2">
                Volunteer sign in
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                Stay up to date with festival movements and instructions from your admin.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Volunteer ID
                  </label>
                  <input
                    type="text"
                    value={volunteerId}
                    onChange={(e) => setVolunteerId(e.target.value)}
                    placeholder="Enter your volunteer ID"
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 focus:border-[#F59E0B] transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 focus:border-[#F59E0B] transition"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-between text-sm shadow-md shadow-amber-900/10 active:scale-[0.99] transition disabled:opacity-70 mt-2"
                >
                  <span>{loading ? "Signing in..." : "Sign in as volunteer"}</span>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  )}
                </button>
              </form>

              <div className="text-center mt-5">
                <span className="text-[11px] text-slate-400">
                  Need your ID? Contact your team coordinator. (Demo: <code className="font-mono text-slate-600">mkf2026</code>)
                </span>
              </div>
            </div>
          </div>
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
