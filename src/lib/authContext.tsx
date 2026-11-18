"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile } from "@/types";
import { supabase, isSupabaseConfigured } from "./supabaseClient";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginAdmin: (password: string) => Promise<{ success: boolean; error?: string }>;
  loginVolunteer: (passcode: string, name?: string, team?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (customRedirect?: string) => Promise<void>;
  loginWithGoogleCredential: (credential: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  setAuthenticatedUser: (user: UserProfile) => void;
  logout: () => void;
  isAdmin: boolean;
  isVolunteer: boolean;
  isAudience: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "mkf_auth_user";

export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "874897984292-oicpjgbe0mudb0ufa5ejmq0i2b73afvv.apps.googleusercontent.com";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUserSession = (newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  // 1. Admin login with backend password verification
  const loginAdmin = async (password: string) => {
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        saveUserSession(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Incorrect admin password" };
      }
    } catch (err: any) {
      // Offline fallback
      if (password === "admin123") {
        const adminUser: UserProfile = {
          id: "admin-master",
          name: "MKF Event Director",
          email: "admin@mkfconnect.org",
          role: "admin",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        };
        saveUserSession(adminUser);
        return { success: true };
      }
      return { success: false, error: "Authentication service error. Try 'admin123'." };
    }
  };

  // 2. Volunteer login with backend passcode verification & registration
  const loginVolunteer = async (passcode: string, name: string = "Field Volunteer", team: string = "General Support") => {
    try {
      const res = await fetch("/api/auth/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode, name, team }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        saveUserSession(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Invalid volunteer access passcode" };
      }
    } catch {
      // Offline fallback
      if (passcode === "mkf123" || passcode === "mkf2026") {
        const cleanName = (name && name.trim()) || "Field Volunteer";
        const volunteerUser: UserProfile = {
          id: `vol-${Date.now()}`,
          name: cleanName,
          role: "volunteer",
          team: team,
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        };
        saveUserSession(volunteerUser);
        return { success: true };
      }
      return { success: false, error: "Authentication service error. Try 'mkf123'." };
    }
  };

  // 3. Google Identity Services (GIS) Credential Handler
  const loginWithGoogleCredential = async (credential: string) => {
    try {
      // Decode JWT token safely
      const base64Url = credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);

      const googleUser: UserProfile = {
        id: payload.sub || `google-${Date.now()}`,
        name: payload.name || payload.given_name || "Festival Attendee",
        email: payload.email || "",
        role: "audience",
        avatar:
          payload.picture ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      };

      saveUserSession(googleUser);

      // Sync attendee to database users table
      fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: googleUser }),
      }).catch(console.error);

      return { success: true, user: googleUser };
    } catch (err: any) {
      console.error("Error decoding Google credential:", err);
      return { success: false, error: err?.message || "Invalid Google credential" };
    }
  };

  // 4. Peoples / Audience login with ONLY Continue with Google
  const loginWithGoogle = async (customRedirect?: string) => {
    if (typeof window === "undefined") return;

    // Check if Google Identity Services SDK is ready
    const google = (window as any).google;
    if (google?.accounts?.id) {
      google.accounts.id.prompt();
      return;
    }

    // Direct Google Accounts OAuth Endpoint fallback
    const clientId = GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = encodeURIComponent("openid email profile");
    const nonce = Math.random().toString(36).substring(2, 15);
    const state = encodeURIComponent(customRedirect || "/");

    const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token%20id_token&scope=${scope}&nonce=${nonce}&state=${state}&prompt=select_account`;

    window.location.href = googleOAuthUrl;
  };

  const logout = () => {
    saveUserSession(null);
  };

  const isAdmin = user?.role === "admin";
  const isVolunteer = user?.role === "volunteer";
  const isAudience = user?.role === "audience";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginAdmin,
        loginVolunteer,
        loginWithGoogle,
        loginWithGoogleCredential,
        setAuthenticatedUser: saveUserSession,
        logout,
        isAdmin,
        isVolunteer,
        isAudience,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
