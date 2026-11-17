"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, QrCode } from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({ isOpen, onClose }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("http://localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.origin);
    }
  }, []);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-slate-900">Scan for Instant Access</h3>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          Scan with any mobile camera. No app download or installation required.
        </p>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 inline-block shadow-inner mb-4">
          <QRCodeSVG
            value={currentUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="text-xs text-slate-500 mb-4 font-mono truncate px-2 py-1.5 bg-slate-100 rounded">
          {currentUrl}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 text-sm font-medium py-2.5 px-4 rounded-xl transition"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied Link!" : "Copy Portal Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
