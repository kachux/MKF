"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import MKFLogo from "@/components/MKFLogo";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { ArrowLeft, Loader2, Sparkles, UserCheck } from "lucide-react";

export default function DelegateLoginPage() {
  const { user, isAudience, setAuthenticatedUser } = useAuth();
  const router = useRouter();
  const [demoSigningIn, setDemoSigningIn] = useState(false);

  useEffect(() => {
    if (user && isAudience) {
      router.push("/delegate");
    }
  }, [user, isAudience, router]);

  // Fast 1-click Google sign in for instant preview & testing
  const handleQuickGoogleSignIn = (accountName: string, email: string) => {
    setDemoSigningIn(true);
    const googleUser = {
      id: `google-${Date.now()}`,
      name: accountName,
      email: email,
      role: "audience" as const,
      avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c",
    };
    setAuthenticatedUser(googleUser);
    setTimeout(() => {
      router.push("/delegate");
    }, 400);
  };

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

              {/* Google Button */}
              <div className="space-y-3">
                <GoogleLoginButton redirectPath="/delegate" />

                {/* Instant 1-Click Google Sign In */}
                <button
                  type="button"
                  onClick={() => handleQuickGoogleSignIn("Kasim Rahees", "kasimraheeskzr@gmail.com")}
                  disabled={demoSigningIn}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3.5 rounded-xl border border-slate-300 shadow-sm transition active:scale-[0.99] text-sm"
                >
                  {demoSigningIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                      <span>Signing in with Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
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
