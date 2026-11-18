"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import MKFLogo from "@/components/MKFLogo";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import {
  ArrowLeft,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  HelpCircle,
  X,
  Moon,
  Utensils,
  CloudSun,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useEventData } from "@/lib/store";

type ViewState = "front" | "choose" | "delegate" | "admin" | "volunteer";

export default function HomePage() {
  const { user, loginAdmin, loginVolunteer, logout } = useAuth();
  const router = useRouter();
  const { foodPrayer } = useEventData();

  // Active view: defaults to 'choose' (role direction screen, Figma node 6-2) if not logged in; 'front' if logged in as audience
  const [view, setView] = useState<ViewState>(user?.role === "audience" ? "front" : "choose");

  // Admin form state (password ONLY)
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Volunteer form state (password ONLY)
  const [volunteerPassword, setVolunteerPassword] = useState("");
  const [volunteerLoading, setVolunteerLoading] = useState(false);
  const [volunteerError, setVolunteerError] = useState<string | null>(null);

  // Weather & Prayer Modal state
  const [prayerModalOpen, setPrayerModalOpen] = useState(false);

  // When user is authenticated, ensure immediate routing
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "volunteer") {
        router.push("/volunteer/dashboard");
      } else if (user.role === "audience") {
        setView("front");
      }
    }
  }, [user, router]);

  // Handlers
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminLoading(true);
    try {
      const res = await loginAdmin(adminPassword);
      if (res.success) {
        router.push("/admin/dashboard");
      } else {
        setAdminError(res.error || "Incorrect admin password (try 'admin123')");
        setAdminLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to authenticate";
      setAdminError(msg);
      setAdminLoading(false);
    }
  };

  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVolunteerError(null);
    if (!volunteerPassword) {
      setVolunteerError("Please enter volunteer password");
      return;
    }
    setVolunteerLoading(true);
    try {
      const res = await loginVolunteer(volunteerPassword, "Field Volunteer", "General Support");
      if (res.success) {
        router.push("/volunteer/dashboard");
      } else {
        setVolunteerError(res.error || "Incorrect volunteer password (try 'mkf123')");
        setVolunteerLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to authenticate";
      setVolunteerError(msg);
      setVolunteerLoading(false);
    }
  };

  // SCREEN 1: "MKF — Choose your role" (node 6-2)
  if (view === "choose") {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between selection:bg-teal-700 selection:text-white">
        <header className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 pt-8 pb-4 flex items-center justify-between">
          <Link href="/" onClick={() => setView("front")} className="hover:opacity-90 transition">
            <MKFLogo size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/help-desk"
              className="bg-[#005953] hover:bg-[#004843] text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xs transition"
            >
              <span>? Help Desk</span>
            </Link>
            <span className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
              ROLE ACCESS
            </span>
          </div>
        </header>

        <main className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 py-8 sm:py-12 flex-1 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => setView("front")}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition mb-6 group w-fit"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition group-hover:-translate-x-0.5" />
                <span>Festival front page</span>
              </button>

              <div className="text-[11px] font-extrabold tracking-[0.18em] text-[#00897B] uppercase mb-3">
                WELCOME TO MKF
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0F2841] tracking-tight leading-[1.08] mb-4">
                Your role. Your<br />festival.
              </h1>

              <p className="text-sm sm:text-base text-slate-500 mb-8 max-w-md">
                Choose how you&apos;re joining the festival.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setView("delegate")}
                  className="inline-flex items-center gap-2.5 bg-[#005C53] hover:bg-[#004740] text-white px-5 py-3 rounded-full text-xs font-bold transition shadow-sm hover:shadow-md active:scale-95 group"
                >
                  <span className="text-teal-200/90 font-mono text-[11px]">01</span>
                  <span>Delegate</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setView("admin")}
                  className="inline-flex items-center gap-2.5 bg-[#FCE7F3] hover:bg-[#FBCFE8] text-[#9F1239] px-5 py-3 rounded-full text-xs font-bold transition shadow-xs hover:shadow-md active:scale-95 group"
                >
                  <span className="text-[#9F1239]/70 font-mono text-[11px]">02</span>
                  <span>Admin</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setView("volunteer")}
                  className="inline-flex items-center gap-2.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] px-5 py-3 rounded-full text-xs font-bold transition shadow-xs hover:shadow-md active:scale-95 group"
                >
                  <span className="text-[#92400E]/70 font-mono text-[11px]">03</span>
                  <span>Volunteer</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </div>

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

        <footer className="w-full bg-[#081726] text-slate-400 px-6 sm:px-10 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span>© MKF · Malabar Knowledge Fest</span>
          <span className="text-[#38BDF8] font-medium">Stay curious.</span>
        </footer>
      </div>
    );
  }

  // SCREEN 2: "MKF — Admin login" (node 8-14)
  if (view === "admin") {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between selection:bg-rose-600 selection:text-white">
        <header className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 pt-8 pb-4 flex items-center justify-between">
          <Link href="/" onClick={() => setView("front")} className="hover:opacity-90 transition">
            <MKFLogo size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/help-desk"
              className="bg-[#005953] hover:bg-[#004843] text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xs transition"
            >
              <span>? Help Desk</span>
            </Link>
            <span className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">ROLE ACCESS</span>
          </div>
        </header>

        <main className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 py-6 sm:py-10 flex-1 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => setView("choose")}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition mb-6 group w-fit"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition group-hover:-translate-x-0.5" />
                <span>Choose a different role</span>
              </button>

              <div className="rounded-[28px] overflow-hidden shadow-sm aspect-[4/3] w-full max-w-lg bg-slate-100 border border-slate-200/40">
                <img src="/images/attendees.jpg" alt="Festival Attendees" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="w-full flex justify-center lg:justify-end">
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/60 shadow-xl shadow-slate-200/50 max-w-md w-full">
                <div className="text-[11px] font-extrabold tracking-[0.18em] text-[#C01E44] uppercase mb-2">
                  ORGANISER ACCESS
                </div>
                <h1 className="text-3xl font-black text-[#0F2841] tracking-tight mb-2">
                  Admin sign in
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                  Manage festival information and send alerts to volunteers and delegates.
                </p>

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">Special password</label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter your special password"
                      required
                      className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C01E44]/20 focus:border-[#C01E44] transition"
                    />
                  </div>

                  {adminError && (
                    <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{adminError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={adminLoading}
                    className="w-full bg-[#C01E44] hover:bg-[#A01838] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-between text-sm shadow-md shadow-rose-900/10 active:scale-[0.99] transition disabled:opacity-70 mt-2"
                  >
                    <span>{adminLoading ? "Signing in..." : "Sign in as admin"}</span>
                    {adminLoading ? (
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

        <footer className="w-full bg-[#081726] text-slate-400 px-6 sm:px-10 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span>© MKF · Malabar Knowledge Fest</span>
          <span className="text-[#38BDF8] font-medium">Stay curious.</span>
        </footer>
      </div>
    );
  }

  // SCREEN 3: "MKF — Volunteer login" (node 8-20)
  if (view === "volunteer") {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between selection:bg-amber-500 selection:text-white">
        <header className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 pt-8 pb-4 flex items-center justify-between">
          <Link href="/" onClick={() => setView("front")} className="hover:opacity-90 transition">
            <MKFLogo size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/help-desk"
              className="bg-[#005953] hover:bg-[#004843] text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xs transition"
            >
              <span>? Help Desk</span>
            </Link>
            <span className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">ROLE ACCESS</span>
          </div>
        </header>

        <main className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 py-6 sm:py-10 flex-1 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => setView("choose")}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition mb-6 group w-fit"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition group-hover:-translate-x-0.5" />
                <span>Choose a different role</span>
              </button>

              <div className="rounded-[28px] overflow-hidden shadow-sm aspect-[4/3] w-full max-w-lg bg-slate-100 border border-slate-200/40">
                <img src="/images/attendees.jpg" alt="Festival Attendees" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="w-full flex justify-center lg:justify-end">
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/60 shadow-xl shadow-slate-200/50 max-w-md w-full">
                <div className="text-[11px] font-extrabold tracking-[0.18em] text-[#D97706] uppercase mb-2">
                  TEAM ACCESS
                </div>
                <h1 className="text-3xl font-black text-[#0F2841] tracking-tight mb-2">
                  Volunteer sign in
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                  Stay up to date with festival movements and instructions from your admin.
                </p>

                <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">Password</label>
                    <input
                      type="password"
                      value={volunteerPassword}
                      onChange={(e) => setVolunteerPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full bg-[#FAF7F2] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 focus:border-[#F59E0B] transition"
                    />
                  </div>

                  {volunteerError && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{volunteerError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={volunteerLoading}
                    className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-between text-sm shadow-md shadow-amber-900/10 active:scale-[0.99] transition disabled:opacity-70 mt-2"
                  >
                    <span>{volunteerLoading ? "Signing in..." : "Sign in as volunteer"}</span>
                    {volunteerLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-white" />
                    )}
                  </button>
                </form>

                <div className="text-center mt-5">
                  <span className="text-[11px] text-slate-400">
                    Enter your volunteer access passcode. (Demo: <code className="font-mono text-slate-600">mkf123</code>)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full bg-[#081726] text-slate-400 px-6 sm:px-10 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span>© MKF · Malabar Knowledge Fest</span>
          <span className="text-[#38BDF8] font-medium">Stay curious.</span>
        </footer>
      </div>
    );
  }

  // SCREEN 4: "MKF — Delegate login" (node 8-26)
  if (view === "delegate") {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between selection:bg-teal-700 selection:text-white">
        <header className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 pt-8 pb-4 flex items-center justify-between">
          <Link href="/" onClick={() => setView("front")} className="hover:opacity-90 transition">
            <MKFLogo size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/help-desk"
              className="bg-[#005953] hover:bg-[#004843] text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xs transition"
            >
              <span>? Help Desk</span>
            </Link>
            <span className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">ROLE ACCESS</span>
          </div>
        </header>

        <main className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 py-6 sm:py-10 flex-1 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => setView("choose")}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition mb-6 group w-fit"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition group-hover:-translate-x-0.5" />
                <span>Choose a different role</span>
              </button>

              <div className="rounded-[28px] overflow-hidden shadow-sm aspect-[4/3] w-full max-w-lg bg-slate-100 border border-slate-200/40">
                <img src="/images/attendees.jpg" alt="Festival Attendees" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="w-full flex justify-center lg:justify-end">
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/60 shadow-xl shadow-slate-200/50 max-w-md w-full">
                <div className="text-[11px] font-extrabold tracking-[0.18em] text-[#0D9488] uppercase mb-2">
                  AUDIENCE ACCESS
                </div>
                <h1 className="text-3xl font-black text-[#0F2841] tracking-tight mb-2">
                  Delegate sign in
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                  Sign in with Google to explore schedules and access lost & found.
                </p>

                <div className="w-full">
                  <GoogleLoginButton redirectPath="/" onSuccess={() => setView("front")} />
                </div>

                <div className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-2xl p-4 mt-6 text-left">
                  <p className="text-xs font-bold text-[#0F766E]">
                    Use your existing Google account.
                  </p>
                  <p className="text-xs text-[#0D9488] mt-0.5">
                    No separate MKF password needed.
                  </p>
                </div>

                <div className="text-center mt-5">
                  <span className="text-[11px] text-slate-400">
                    Your Google password is never entered on MKF.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full bg-[#081726] text-slate-400 px-6 sm:px-10 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span>© MKF · Malabar Knowledge Fest</span>
          <span className="text-[#38BDF8] font-medium">Stay curious.</span>
        </footer>
      </div>
    );
  }

  // DEFAULT MAIN SCREEN: "MKF — Festival front page" (node 5-7)
  const delegateName = user?.name;
  const delegateEmail = user?.email;
  const delegateAvatar = user?.avatar;

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between selection:bg-teal-700 selection:text-white relative">
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
            href="/schedule"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition px-2 py-1"
          >
            FESTIVAL GUIDE
          </Link>

          {/* User Account / Role Access Button */}
          {user ? (
            <div className="flex items-center gap-2.5 bg-white border border-slate-200/80 rounded-full px-3 py-1.5 shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {delegateAvatar ? (
                  <img src={delegateAvatar} alt={delegateName || "User"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-teal-700 text-white flex items-center justify-center text-[10px] font-bold">
                    {delegateName ? delegateName.charAt(0) : "U"}
                  </div>
                )}
              </div>
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">{delegateName}</span>
              <button
                onClick={() => {
                  logout();
                  setView("choose");
                }}
                title="Sign out"
                className="p-1 text-slate-400 hover:text-rose-600 rounded-full transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setView("choose")}
              className="bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-semibold px-3.5 py-1.5 rounded-full transition shadow-2xs flex items-center gap-1"
            >
              <span>Role access</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>
      </header>

      {/* Main Hero: MKF — Festival front page (Exact layout of node 5-7) */}
      <main className="max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-16 py-8 sm:py-12 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
          {/* Left Column: Heading and 3 Action Pills */}
          <div className="flex flex-col">
            {/* Kicker Box: WELCOME TO MKF with yellow/gold border */}
            <div className="inline-block border border-[#CA8A04] bg-[#FEF9C3]/20 text-[#005953] font-bold text-[11px] tracking-[0.2em] uppercase px-3 py-1 rounded-sm w-fit mb-5">
              WELCOME TO MKF
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0F2841] tracking-tight leading-[1.08] mb-8">
              Where would you<br />like to go?
            </h1>

            {/* 3 Main Action Pills from Figma (arranged as in node 5-7) */}
            <div className="space-y-3.5 max-w-lg">
              {/* Row 1: 01 Schedules ↗ and 03 Session & stage locations ↗ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 01 Schedules ↗ */}
                <Link
                  href="/schedule"
                  className="bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#0F2F4A] font-bold py-3.5 px-5 rounded-full border border-[#BFDBFE] shadow-2xs flex items-center justify-between transition hover:shadow-xs group text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400 font-mono text-[11px]">01</span>
                    <span>Schedules</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-slate-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </Link>

                {/* 03 Session & stage locations ↗ */}
                <Link
                  href="/schedule#venues"
                  className="bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#BE123C] font-bold py-3.5 px-5 rounded-full border border-[#FECDD3] shadow-2xs flex items-center justify-between transition hover:shadow-xs group text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#BE123C]/60 font-mono text-[11px]">03</span>
                    <span className="truncate">Session & stage locations</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#BE123C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </Link>
              </div>

              {/* Row 2: 02 Lost & found ↗ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/lost-found"
                  className="bg-[#005953] hover:bg-[#004843] text-white font-bold py-3.5 px-5 rounded-full shadow-sm flex items-center justify-between transition hover:shadow-md group text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-teal-200/90 font-mono text-[11px]">02</span>
                    <span>Lost & found</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </Link>

                {/* Additional Quick Action: Weather & prayer timings */}
                <button
                  type="button"
                  onClick={() => setPrayerModalOpen(true)}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3.5 px-5 rounded-full border border-slate-200 shadow-2xs flex items-center justify-between transition hover:shadow-xs group text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5 text-amber-600" />
                    <span>Weather & prayer</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition" />
                </button>
              </div>
            </div>

            {/* Quick Live Strip */}
            <div className="mt-8 pt-6 border-t border-slate-200/60 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-600">
                <strong className="text-slate-900 font-bold">Day 01 Live:</strong> All 6 parallel venues are in session.
              </span>
              <Link href="/help-desk" className="text-xs font-bold text-[#005953] hover:underline ml-auto flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Attendees Photograph from Figma */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="rounded-[28px] overflow-hidden shadow-sm aspect-[4/3] w-full max-w-lg bg-slate-100 border border-slate-200/40">
              <img
                src="/images/attendees.jpg"
                alt="Malabar Knowledge Fest Attendees"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button (FAB): Circle '?' in bottom right corner */}
      <Link
        href="/help-desk"
        title="Open MKF AI Help Desk"
        className="fixed bottom-8 right-8 z-40 w-12 h-12 bg-white hover:bg-slate-50 text-slate-800 rounded-full shadow-lg hover:shadow-xl border border-slate-200/80 flex items-center justify-center font-bold text-lg hover:scale-105 active:scale-95 transition"
      >
        <span>?</span>
      </Link>

      {/* Navy Bottom Bar (Exact design from node 5-7) */}
      <footer className="w-full bg-[#081726] text-slate-400 px-6 sm:px-10 lg:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <span>© MKF · Malabar Knowledge Fest</span>
        <span className="text-[#38BDF8] font-medium">Stay curious.</span>
      </footer>

      {/* Weather & Prayer Modal */}
      {prayerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setPrayerModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Weather & Prayer Timings</h3>
                <p className="text-xs text-slate-500">Live festival timings for Malabar Knowledge Fest</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CloudSun className="w-8 h-8 text-amber-500" />
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Venue Weather</span>
                  <span className="text-lg font-black text-slate-900">29°C · Partly Sunny</span>
                </div>
              </div>
              <span className="text-xs text-sky-700 bg-sky-100 font-semibold px-2.5 py-1 rounded-full">Calicut / Malabar</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {foodPrayer.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
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
