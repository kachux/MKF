"use client";

import React, { useEffect } from "react";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles, CheckCircle2, UserCheck } from "lucide-react";

export default function SignUpPage() {
  const { user } = useAuth();
  const router = useRouter();

  // If already logged in, redirect to home
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Festival Portal
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 relative overflow-hidden text-center">
          {/* Top subtle decorative accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500"></div>

          {/* Logo badge */}
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3 border border-emerald-100">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant Google Registration</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sign Up for Festival
          </h1>
          <p className="text-sm text-slate-500 mt-2 mb-8 leading-relaxed">
            No registration forms or passwords needed. Simply continue with your Google account to create your attendee profile immediately.
          </p>

          {/* ONLY CONTINUE WITH GOOGLE OPTION */}
          <div className="space-y-4">
            <GoogleLoginButton redirectPath="/" />

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Instant setup • Protected by Google Auth Platform</span>
            </div>
          </div>

          {/* Perks list */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-left">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
              Your Attendee Profile Features:
            </p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Instant access to submit Help Desk inquiries</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Publish and search Lost & Found claims</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Get real-time announcements on any device</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer info for volunteers & admin */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Log In
          </Link>{" "}
          •{" "}
          <Link href="/volunteer/login" className="text-slate-600 hover:underline font-medium">
            Volunteer Access
          </Link>
        </div>
      </div>
    </div>
  );
}
