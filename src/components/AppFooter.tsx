"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function AppFooter() {
  const pathname = usePathname();

  // Hide on Figma landing, auth flow, and help desk / AI pages
  const figmaPages = ["/", "/login", "/admin/login", "/volunteer/login", "/delegate", "/help-desk", "/mkf-ai"];
  if (figmaPages.includes(pathname)) {
    return null;
  }

  return (
    <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs text-center mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <p className="font-semibold text-slate-300">MIC Knowledge Festival 2026 (MKF CONNECT)</p>
        <p className="text-slate-500 mt-1">One Festival. One Platform. Zero Confusion.</p>
        <div className="mt-4 flex items-center justify-center gap-4 text-slate-400">
          <a href="/schedule" className="hover:text-white transition">Schedule</a>
          <span>•</span>
          <a href="/announcements" className="hover:text-white transition">Announcements</a>
          <span>•</span>
          <a href="/mkf-ai" className="hover:text-blue-400 transition font-semibold text-blue-300">MKF AI Guide</a>
          <span>•</span>
          <a href="/login" className="hover:text-white transition">Log In / Sign Up</a>
          <span>•</span>
          <a href="/volunteer/login" className="hover:text-green-400 transition">Volunteer Access</a>
          <span>•</span>
          <a href="/admin/login" className="hover:text-amber-400 transition">Admin Portal</a>
        </div>
      </div>
    </footer>
  );
}
