"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useEventData } from "@/lib/store";
import { AlertTriangle, X, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function EmergencyBanner() {
  const pathname = usePathname();
  const { announcements } = useEventData();
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  // Hide on Figma landing, auth, and help desk / AI screens
  const figmaPages = ["/", "/login", "/admin/login", "/volunteer/login", "/delegate", "/help-desk", "/mkf-ai"];
  if (figmaPages.includes(pathname)) {
    return null;
  }

  // Find latest urgent announcement
  const urgentAnnouncement = announcements.find(
    (a) => a.priority === "urgent" && a.id !== dismissedId
  );

  if (!urgentAnnouncement) return null;

  return (
    <aside
      aria-label="Urgent Event Announcement"
      className="bg-red-600 text-white px-4 py-2.5 shadow-md sticky top-0 z-50 animate-pulse-subtle border-b border-red-700"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-300"></span>
          </span>
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-yellow-300" />
          <div className="truncate">
            <span className="font-bold tracking-wide uppercase text-xs bg-red-800 px-2 py-0.5 rounded mr-2">
              Urgent Broadcast
            </span>
            <span className="font-semibold">{urgentAnnouncement.title}:</span>{" "}
            <span className="opacity-95">{urgentAnnouncement.message}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/announcements"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded transition"
          >
            All Updates <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setDismissedId(urgentAnnouncement.id)}
            className="text-white/80 hover:text-white p-1 rounded hover:bg-red-700 transition"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
