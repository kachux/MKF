"use client";

import React, { useState, useEffect } from "react";
import { KeyRound, ShieldCheck, Users, CheckCircle2, AlertCircle, Lock, RefreshCw, UserCheck } from "lucide-react";

export default function AdminSecurityPage() {
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [volunteerPasscode, setVolunteerPasscode] = useState("mkf2026");
  const [activeVolunteers, setActiveVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [currentAdminVerify, setCurrentAdminVerify] = useState("");
  const [newAdminPwd, setNewAdminPwd] = useState("");
  const [newVolPass, setNewVolPass] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success) {
        setAdminPassword(data.currentAdminPassword || "admin123");
        setVolunteerPasscode(data.currentVolunteerPasscode || "mkf2026");
        setActiveVolunteers(data.activeVolunteers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentAdminPassword: currentAdminVerify,
          newAdminPassword: newAdminPwd || undefined,
          newVolunteerPasscode: newVolPass || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Security credentials updated in SQLite database!" });
        setNewAdminPwd("");
        setNewVolPass("");
        setCurrentAdminVerify("");
        fetchSettings();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update security credentials." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Network error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Security & Access Passwords
        </h1>
        <p className="text-xs text-slate-500">
          Manage event access keys, change passwords dynamically, and monitor active field volunteers.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

      {/* Current Keys Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Admin Master Password
            </span>
            <div className="text-xl font-mono font-bold text-slate-900 mt-1">
              {loading ? "..." : adminPassword}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Required for accessing `/admin/login` and full event controls.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Volunteer Access Passcode
            </span>
            <div className="text-xl font-mono font-bold text-emerald-600 mt-1">
              {loading ? "..." : volunteerPasscode}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Distributed to ground crews for `/volunteer/login` task radar access.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Change Passwords Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200">
          <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Update Event Security Keys
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Changes take effect immediately across all devices with zero server restart required.
          </p>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Admin Password (For Verification)
              </label>
              <input
                type="password"
                required
                placeholder="Enter current admin password"
                value={currentAdminVerify}
                onChange={(e) => setCurrentAdminVerify(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Admin Master Password
                </label>
                <input
                  type="text"
                  placeholder="Leave blank to keep unchanged"
                  value={newAdminPwd}
                  onChange={(e) => setNewAdminPwd(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Volunteer Access Passcode
                </label>
                <input
                  type="text"
                  placeholder="Leave blank to keep unchanged"
                  value={newVolPass}
                  onChange={(e) => setNewVolPass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl shadow transition text-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${saving ? "animate-spin" : ""}`} />
                <span>Update Credentials in Database</span>
              </button>
            </div>
          </form>
        </div>

        {/* Active Volunteers Registry */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Active Volunteers ({activeVolunteers.length})
            </h3>
            <button
              onClick={fetchSettings}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {activeVolunteers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No volunteers logged in yet today.</p>
            ) : (
              activeVolunteers.map((vol) => (
                <div key={vol.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{vol.name}</span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                      {vol.team}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Last active: {new Date(vol.last_active).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
