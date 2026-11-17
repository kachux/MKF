"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Copy, Check } from "lucide-react";

export default function AdminQRPosterPage() {
  const [copied, setCopied] = useState(false);
  const [originUrl, setOriginUrl] = useState("http://localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginUrl(window.location.origin);
    }
  }, []);

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(originUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Audience QR Standee & Poster
          </h1>
          <p className="text-xs text-slate-500">
            Print this poster and place it at festival entry gates, registration desks, and dining halls.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy URL"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold shadow transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Poster</span>
          </button>
        </div>
      </div>

      {/* Printable Poster Canvas */}
      <div className="max-w-md mx-auto bg-white rounded-3xl p-8 sm:p-10 shadow-lg border-2 border-slate-300 text-center print:shadow-none print:border-none print:m-0 print:max-w-full">
        {/* Festival Badge */}
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-3 shadow-md">
          M
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          MIC KNOWLEDGE FESTIVAL 2026
        </h2>
        <div className="text-xs font-bold text-blue-600 tracking-widest uppercase mt-0.5">
          MKF CONNECT • OFFICIAL PORTAL
        </div>

        <p className="text-xs text-slate-500 mt-2 mb-6">
          Scan with your phone camera for live timeline, prayer timings, food distribution, and help desk.
        </p>

        {/* QR Code */}
        <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-200 inline-block shadow-inner mb-6">
          <QRCodeSVG
            value={originUrl}
            size={240}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="font-mono text-xs text-slate-600 bg-slate-100 py-2 px-3 rounded-lg max-w-xs mx-auto mb-6 truncate font-semibold">
          {originUrl}
        </div>

        {/* Feature bullets */}
        <div className="grid grid-cols-2 gap-2 text-left text-[11px] text-slate-600 font-medium pt-4 border-t border-slate-100">
          <div>✓ No App Download</div>
          <div>✓ Live Program Schedule</div>
          <div>✓ Food & Prayer Updates</div>
          <div>✓ Lost & Found Desk</div>
        </div>

        <p className="text-[10px] text-slate-400 mt-6 tracking-wider uppercase font-semibold">
          One Festival. One Platform. Zero Confusion.
        </p>
      </div>
    </div>
  );
}
