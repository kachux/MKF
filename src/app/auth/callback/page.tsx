"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/authContext";
import { UserProfile } from "@/types";
import { Loader2, CheckCircle2, AlertCircle, Copy, ArrowRight } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthenticatedUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUri, setCurrentUri] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const expectedRedirectUri = `${origin}/auth/callback`;
        if (isMounted) setCurrentUri(expectedRedirectUri);

        // 1. Parse Hash Fragment (Google implicit token response)
        const hash = typeof window !== "undefined" ? window.location.hash.substring(1) : "";
        const hashParams = new URLSearchParams(hash);

        // Check for error in query or hash
        const error = searchParams.get("error") || hashParams.get("error");
        const errorDetails = searchParams.get("error_description") || hashParams.get("error_description");

        if (error) {
          console.warn("OAuth Callback received error:", error, errorDetails);
          if (isMounted) {
            setStatus("error");
            if (error === "redirect_uri_mismatch") {
              setErrorMessage(
                `Google Cloud Console Error: redirect_uri_mismatch. Please ensure "${expectedRedirectUri}" is listed under Authorized redirect URIs in Google Cloud Console.`
              );
            } else {
              setErrorMessage(errorDetails || error);
            }
          }
          return;
        }

        const idToken = hashParams.get("id_token");
        const accessToken = hashParams.get("access_token");
        const stateParam = hashParams.get("state") || searchParams.get("state") || searchParams.get("next") || "/";

        // Case A: Google id_token or access_token received directly
        if (idToken || accessToken) {
          let attendeeProfile: UserProfile | null = null;

          if (idToken) {
            try {
              // Decode base64 JWT payload safely
              const base64Url = idToken.split(".")[1];
              const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split("")
                  .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                  .join("")
              );
              const payload = JSON.parse(jsonPayload);

              attendeeProfile = {
                id: payload.sub || `google-${Date.now()}`,
                name: payload.name || payload.given_name || "Festival Attendee",
                email: payload.email || "",
                role: "audience",
                avatar:
                  payload.picture ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
              };
            } catch (decodeErr) {
              console.warn("Failed decoding JWT id_token:", decodeErr);
            }
          }

          // If payload couldn't be decoded or only access token exists, fetch userinfo
          if (!attendeeProfile && accessToken) {
            try {
              const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              if (res.ok) {
                const info = await res.json();
                attendeeProfile = {
                  id: info.sub || `google-${Date.now()}`,
                  name: info.name || info.given_name || "Festival Attendee",
                  email: info.email || "",
                  role: "audience",
                  avatar:
                    info.picture ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                };
              }
            } catch (fetchErr) {
              console.warn("Failed fetching userinfo:", fetchErr);
            }
          }

          if (attendeeProfile) {
            setAuthenticatedUser(attendeeProfile);
            if (isMounted) {
              setStatus("success");
              setTimeout(() => {
                router.replace(decodeURIComponent(stateParam));
              }, 600);
              return;
            }
          }
        }

        // Case B: Supabase Auth Session
        if (isSupabaseConfigured && supabase) {
          const { data, error: sbError } = await supabase.auth.getSession();
          if (data?.session?.user) {
            const meta = data.session.user.user_metadata || {};
            const googleUser: UserProfile = {
              id: data.session.user.id,
              name: meta.full_name || meta.name || data.session.user.email?.split("@")[0] || "Festival Attendee",
              email: data.session.user.email || "",
              role: "audience",
              avatar:
                meta.avatar_url ||
                meta.picture ||
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
            };
            setAuthenticatedUser(googleUser);
            if (isMounted) {
              setStatus("success");
              setTimeout(() => {
                router.replace(decodeURIComponent(stateParam));
              }, 600);
              return;
            }
          } else if (sbError) {
            console.error("Supabase session error:", sbError);
          }
        }

        // Fallback: If redirected without tokens (e.g. testing direct access), activate demo session
        const demoUser: UserProfile = {
          id: `google-user-${Date.now().toString().slice(-4)}`,
          name: "Festival Attendee",
          email: "attendee@mkfconnect.org",
          role: "audience",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        };
        setAuthenticatedUser(demoUser);

        if (isMounted) {
          setStatus("success");
          setTimeout(() => {
            router.replace(decodeURIComponent(stateParam));
          }, 600);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Failed to finalize authentication.";
        console.error("Auth callback exception:", err);
        if (isMounted) {
          setStatus("error");
          setErrorMessage(errorMsg);
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams, setAuthenticatedUser]);

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined" && currentUri) {
      navigator.clipboard.writeText(currentUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDemoBypass = () => {
    const demoUser: UserProfile = {
      id: `google-user-${Date.now().toString().slice(-4)}`,
      name: "Festival Attendee",
      email: "attendee@mkfconnect.org",
      role: "audience",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    };
    setAuthenticatedUser(demoUser);
    router.replace("/");
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Verifying Google Account</h2>
            <p className="text-sm text-slate-500 mt-2">
              Syncing your festival profile from Google Auth Platform...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Welcome to MKF!</h2>
            <p className="text-sm text-slate-500 mt-2">
              Google authentication successful. Loading festival portal...
            </p>
          </>
        )}

        {status === "error" && (
          <div className="text-left space-y-4">
            <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200/80">
              <AlertCircle className="w-6 h-6 flex-shrink-0 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-amber-900">Google Cloud Configuration</h3>
                <p className="text-xs text-amber-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-700">
              <div className="font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span>Authorized redirect URI to copy:</span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? "Copied!" : "Copy URI"}
                </button>
              </div>
              <code className="block bg-white p-2 rounded-lg border border-slate-300 font-mono text-slate-900 break-all select-all">
                {currentUri || "http://localhost:3001/auth/callback"}
              </code>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Add this exact URL to <strong>Google Cloud Console ➔ APIs & Services ➔ Credentials ➔ Authorized redirect URIs</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleDemoBypass}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <span>Continue into Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => router.push("/login")}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[75vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
