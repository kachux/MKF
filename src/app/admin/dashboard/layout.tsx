"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Bell,
  UtensilsCrossed,
  Search,
  HelpCircle,
  ClipboardList,
  QrCode,
  ShieldCheck,
  LogOut,
  RotateCcw,
  KeyRound,
} from "lucide-react";
import { EventStore } from "@/lib/store";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/admin/login");
    }
  }, [isLoading, isAdmin, router]);

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 font-medium">Verifying administrator authorization...</p>
        </div>
      </div>
    );
  }

  const adminNav = [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/admin/dashboard/schedule", label: "Schedule Manager", icon: Calendar },
    { href: "/admin/dashboard/announcements", label: "Broadcast Alerts", icon: Bell },
    { href: "/admin/dashboard/tasks", label: "Volunteer Tasks", icon: ClipboardList },
    { href: "/admin/dashboard/food-prayer", label: "Food & Prayer", icon: UtensilsCrossed },
    { href: "/admin/dashboard/lost-found", label: "Lost & Found", icon: Search },
    { href: "/admin/dashboard/help-desk", label: "Help Desk", icon: HelpCircle },
    { href: "/admin/dashboard/security", label: "Passwords & Access", icon: KeyRound },
    { href: "/admin/dashboard/qr", label: "Audience QR Poster", icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 border-r border-slate-800">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white leading-none">
                Admin Console
              </div>
              <div className="text-[10px] text-amber-400 font-semibold uppercase mt-0.5">
                Full Controller
              </div>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1 overflow-x-auto md:overflow-x-visible flex md:flex-col gap-1 md:gap-0">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block p-4 mt-auto border-t border-slate-800">
          <button
            onClick={() => {
              if (confirm("Reset all festival data back to fresh PRD seed state?")) {
                EventStore.resetToDefaults();
                alert("Festival data reset successfully!");
              }
            }}
            className="w-full mb-2 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-[11px] font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Seed Data</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-xl text-xs font-semibold transition border border-red-800/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
