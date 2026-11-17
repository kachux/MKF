"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth, GOOGLE_CLIENT_ID } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

interface GoogleLoginButtonProps {
  redirectPath?: string;
  className?: string;
}

export default function GoogleLoginButton({
  redirectPath = "/",
  className = "",
}: GoogleLoginButtonProps) {
  const { loginWithGoogleCredential, loginWithGoogle } = useAuth();
  const router = useRouter();
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [gisRendered, setGisRendered] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let attempts = 0;

    const initGoogleIdentity = () => {
      const google = (typeof window !== "undefined" ? (window as any).google : null);

      if (google?.accounts?.id && buttonContainerRef.current) {
        try {
          google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response: { credential: string }) => {
              if (response?.credential) {
                setLoading(true);
                const res = await loginWithGoogleCredential(response.credential);
                if (res.success) {
                  router.push(redirectPath);
                } else {
                  setErrorMessage(res.error || "Failed to log in with Google");
                  setLoading(false);
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Clear any previous child before rendering
          if (buttonContainerRef.current) {
            buttonContainerRef.current.innerHTML = "";
            google.accounts.id.renderButton(buttonContainerRef.current, {
              type: "standard",
              theme: "outline",
              size: "large",
              text: "continue_with",
              shape: "rectangular",
              logo_alignment: "left",
              width: buttonContainerRef.current.offsetWidth || 320,
            });
            setGisRendered(true);
          }

          if (interval) clearInterval(interval);
        } catch (e: any) {
          console.warn("GIS initialization notice:", e);
        }
      } else {
        attempts++;
        if (attempts > 30 && interval) {
          clearInterval(interval);
        }
      }
    };

    // Try immediately
    initGoogleIdentity();

    // Check periodically until script loads
    interval = setInterval(initGoogleIdentity, 300);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loginWithGoogleCredential, redirectPath, router]);

  const handleManualClick = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const google = (typeof window !== "undefined" ? (window as any).google : null);
      if (google?.accounts?.id) {
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log("GIS prompt skipped or not displayed:", notification.getNotDisplayedReason?.());
            // Fall back to direct OAuth redirect if One Tap was dismissed/blocked
            loginWithGoogle(redirectPath);
          }
        });
      } else {
        await loginWithGoogle(redirectPath);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e?.message || "Could not launch Google authentication.");
      setLoading(false);
    }
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      {/* Official Google Identity Services Render Target */}
      <div
        ref={buttonContainerRef}
        className={`w-full flex justify-center transition-all ${
          gisRendered ? "block min-h-[44px]" : "hidden"
        }`}
      />

      {/* Styled Native Fallback Button when GIS iframe is initializing or if script blocked */}
      {!gisRendered && (
        <button
          onClick={handleManualClick}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3.5 rounded-xl border border-slate-300 shadow-sm hover:shadow transition duration-200 active:scale-[0.99] disabled:opacity-75 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              {/* Official Google 'G' icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span className="text-base text-slate-800">Continue with Google</span>
            </>
          )}
        </button>
      )}

      {errorMessage && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
