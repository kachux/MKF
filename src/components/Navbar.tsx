"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import {
  Calendar,
  Bell,
  UtensilsCrossed,
  Search,
  HelpCircle,
  ShieldCheck,
  ClipboardList,
  Menu,
  X,
  QrCode,
  LogOut,
  User,
  KeyRound,
  Users,
  Sparkles,
} from "lucide-react";
import QRCodeModal from "./QRCodeModal";

interface NavLinkItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isAi?: boolean;
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAdmin, isVolunteer, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [rolesDropdown, setRolesDropdown] = useState(false);

  const navLinks: NavLinkItem[] = [
    { href: "/schedule", label: "Schedule", icon: Calendar },
    { href: "/announcements", label: "Announcements", icon: Bell },
    { href: "/food-prayer", label: "Food & Prayer", icon: UtensilsCrossed },
    { href: "/lost-found", label: "Lost & Found", icon: Search },
    { href: "/help-desk", label: "Help Desk", icon: HelpCircle },
    { href: "/mkf-ai", label: "MKF AI", icon: Sparkles, isAi: true },
  ];

  // Hide generic top navbar on Figma landing, auth, and help desk / AI pages
  const figmaPages = ["/", "/login", "/admin/login", "/volunteer/login", "/delegate", "/help-desk", "/mkf-ai"];
  if (figmaPages.includes(pathname)) {
    return null;
  }

  return (
    <>
      <header className="bg-mkf-navy text-white sticky top-0 z-40 shadow-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow-md group-hover:bg-blue-500 transition">
                  M
                </div>
                <div>
                  <div className="font-extrabold text-base tracking-tight leading-none text-white flex items-center gap-1.5">
                    MKF <span className="text-blue-400">CONNECT</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
                    MIC Knowledge Festival
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                const isAi = link.isAi;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : isAi
                        ? "text-blue-300 hover:text-white bg-blue-950/60 border border-blue-500/30 hover:bg-blue-900/60"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isAi ? "text-amber-300 animate-pulse" : "opacity-80"}`} />
                    <span>{link.label}</span>
                    {isAi && (
                      <span className="text-[9px] bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-1.5 py-0.2 rounded-full font-black uppercase">
                        AI
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* QR Code button */}
              <button
                onClick={() => setQrModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
                title="Audience QR Code"
              >
                <QrCode className="w-3.5 h-3.5 text-blue-400" />
                <span>QR Code</span>
              </button>

              {/* Logged in views */}
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold hover:bg-amber-500/30 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Admin Panel</span>
                </Link>
              )}

              {isVolunteer && (
                <Link
                  href="/volunteer/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-300 border border-green-500/40 rounded-lg text-xs font-semibold hover:bg-green-500/30 transition"
                >
                  <ClipboardList className="w-4 h-4 text-green-400" />
                  <span>Volunteer Tasks</span>
                </Link>
              )}

              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                  <div className="flex items-center gap-2">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full border border-blue-400 object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs font-medium text-slate-200 max-w-[100px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      className="flex items-center gap-1.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                    >
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Log In / Sign Up</span>
                    </Link>

                    <button
                      onClick={() => setRolesDropdown(!rolesDropdown)}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 text-xs flex items-center gap-1 border border-slate-700"
                      title="Role Portals"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Dropdown for role access */}
                  {rolesDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs">
                      <Link
                        href="/volunteer/login"
                        onClick={() => setRolesDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-green-400"
                      >
                        <ClipboardList className="w-4 h-4 text-green-400" />
                        <div>
                          <div className="font-semibold">Volunteer Login</div>
                          <div className="text-[10px] text-slate-400">Passcode protected</div>
                        </div>
                      </Link>
                      <Link
                        href="/admin/login"
                        onClick={() => setRolesDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-amber-400 border-t border-slate-800"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <div>
                          <div className="font-semibold">Admin Login</div>
                          <div className="text-[10px] text-slate-400">Password protected</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setQrModalOpen(true)}
                className="p-2 text-slate-300 hover:text-white"
                title="QR Code"
              >
                <QrCode className="w-5 h-5 text-blue-400" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 pt-3 pb-6 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              const isAi = link.isAi;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : isAi
                      ? "bg-blue-950/70 border border-blue-500/30 text-blue-300 hover:bg-blue-900"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isAi ? "text-amber-300" : ""}`} />
                    <span>{link.label}</span>
                  </div>
                  {isAi && (
                    <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                      New AI
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-slate-800 space-y-2">
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              {isVolunteer && (
                <Link
                  href="/volunteer/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-green-500/20 text-green-300 border border-green-500/30"
                >
                  <ClipboardList className="w-5 h-5" />
                  <span>Volunteer Tasks</span>
                </Link>
              )}

              {user ? (
                <div className="flex items-center justify-between px-3 py-2.5 bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">{user.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-red-400 hover:underline flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white text-slate-900 rounded-lg font-bold text-sm shadow-sm"
                  >
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Log In / Sign Up (Google)</span>
                  </Link>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/volunteer/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 text-green-400 rounded-lg text-xs font-semibold border border-slate-700"
                    >
                      <Users className="w-3.5 h-3.5" /> Volunteer Login
                    </Link>
                    <Link
                      href="/admin/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 text-amber-400 rounded-lg text-xs font-semibold border border-slate-700"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Admin Login
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Dynamic QR modal */}
      <QRCodeModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />
    </>
  );
}
