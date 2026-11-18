import React from "react";

interface MKFLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function MKFLogo({ className = "", size = "md" }: MKFLogoProps) {
  const fontSizes = {
    sm: "text-xl",
    md: "text-2xl sm:text-3xl",
    lg: "text-4xl",
  };

  const textStackedSizes = {
    sm: "text-[9px] leading-[10px]",
    md: "text-[10px] sm:text-[11px] leading-[12px] sm:leading-[13px]",
    lg: "text-xs leading-4",
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* MKF Letters */}
      <div className={`font-black tracking-tighter ${fontSizes[size]} flex items-center font-sans`}>
        <span className="text-[#00897B]">M</span>
        <span className="text-[#EF4444]">K</span>
        <span className="text-[#F59E0B]">F</span>
      </div>

      {/* Vertical separator */}
      <div className="h-7 w-[1.5px] bg-slate-200" />

      {/* Stacked Malabar Knowledge Fest */}
      <div className={`flex flex-col font-extrabold tracking-wider text-slate-800 ${textStackedSizes[size]} uppercase`}>
        <span>MALABAR</span>
        <span>KNOWLEDGE</span>
        <span>FEST</span>
      </div>

      {/* 4 Cultural / Educational Emblems */}
      <div style={{ width: 36, height: 36, minWidth: 36, minHeight: 36 }} className="grid grid-cols-2 gap-1 items-center justify-center p-1 bg-slate-50/80 rounded border border-slate-100 flex-shrink-0">
        {/* Book (Blue) */}
        <svg width="14" height="14" style={{ width: 14, height: 14, maxWidth: 14, maxHeight: 14 }} className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
        </svg>

        {/* Fountain pen nib / Minaret (Gold/Orange) */}
        <svg width="14" height="14" style={{ width: 14, height: 14, maxWidth: 14, maxHeight: 14 }} className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3 5v4l-3 7-3-7V7l3-5zm0 18a2 2 0 100 4 2 2 0 000-4z"/>
        </svg>

        {/* Drama / Culture Mask (Red) */}
        <svg width="14" height="14" style={{ width: 14, height: 14, maxWidth: 14, maxHeight: 14 }} className="w-3.5 h-3.5 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3 7c.83 0 1.5.67 1.5 1.5S9.83 12 9 12s-1.5-.67-1.5-1.5S8.17 9 9 9zm6 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-3 9.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
        </svg>

        {/* Wheat / Sprout (Green) */}
        <svg width="14" height="14" style={{ width: 14, height: 14, maxWidth: 14, maxHeight: 14 }} className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5c1.5-2 4.5-2 6.5-2 3.5 0 6.5-1.5 8.5-3.5z"/>
        </svg>
      </div>
    </div>
  );
}
