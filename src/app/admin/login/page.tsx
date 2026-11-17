"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import MKFLogo from "@/components/MKFLogo";
import { ArrowLeft, ArrowUpRight, Loader2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const { loginAdmin, isAdmin } = useAuth();
  const router = useRouter();

  const [adminId, setAdminId] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      router.push("/admin/dashboard");
    }
  }, [isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginAdmin(password);
      if (res.success) {
        router.push("/admin/dashboard");
      } else {
        setError(res.error || "Incorrect admin password (try 'admin123')");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to authenticate");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between selection:bg-rose-600 selection:text-white">
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

          {/* Right Column: Admin Sign-in Card */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/60 shadow-xl shadow-slate-200/50 max-w-md w-full">
              {/* Category Badge */}
              <div className="text-[11px] font-extrabold tracking-[0.18em] text-[#C01E44] uppercase mb-2">
                ORGANISER ACCESS
              </div>

              {/* Title */}
              <h1 className="text-3xl font-black text-[#0F2841] tracking-tight mb-2">
                Admin sign in
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                Manage festival information and send alerts to volunteers and delegates.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Admin ID
                  </label>
                  <input
                    type="text"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="Enter your admin ID"
                    required
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C01E44]/20 focus:border-[#C01E44] transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Special password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your special password"
                    required
                    className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C01E44]/20 focus:border-[#C01E44] transition"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#C01E44] hover:bg-[#A01838] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-between text-sm shadow-md shadow-rose-900/10 active:scale-[0.99] transition disabled:opacity-70 mt-2"
                >
                  <span>{loading ? "Signing in..." : "Sign in as admin"}</span>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  )}
                </button>
              </form>

              <div className="text-center mt-5">
                <span className="text-[11px] text-slate-400">
                  Use the credentials issued by the organiser. (Demo: <code className="font-mono text-slate-600">admin123</code>)
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
