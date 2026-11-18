"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import MKFLogo from "@/components/MKFLogo";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { ArrowLeft } from "lucide-react";

export default function DelegateLoginPage() {
  const { user, isAudience } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && isAudience) {
      router.push("/");
    }
  }, [user, isAudience, router]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between selection:bg-teal-700 selection:text-white">
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

          {/* Right Column: Delegate Sign-in Card */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/60 shadow-xl shadow-slate-200/50 max-w-md w-full">
              {/* Category Badge */}
              <div className="text-[11px] font-extrabold tracking-[0.18em] text-[#0D9488] uppercase mb-2">
                AUDIENCE ACCESS
              </div>

              {/* Title */}
              <h1 className="text-3xl font-black text-[#0F2841] tracking-tight mb-2">
                Delegate sign in
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                Sign in with Google to explore schedules and access lost & found.
              </p>

              {/* Google Button (Single, Official) */}
              <div className="w-full">
                <GoogleLoginButton redirectPath="/" />
              </div>

              {/* Mint Info Callout Box */}
              <div className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-2xl p-4 mt-6 text-left">
                <p className="text-xs font-bold text-[#0F766E]">
                  Use your existing Google account.
                </p>
                <p className="text-xs text-[#0D9488] mt-0.5">
                  No separate MKF password needed.
                </p>
              </div>

              {/* Subtext */}
              <div className="text-center mt-5">
                <span className="text-[11px] text-slate-400">
                  Your Google password is never entered on MKF.
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
