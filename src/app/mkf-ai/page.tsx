"use client";

import React, { Suspense } from "react";
import MKFHelpDesk from "@/components/MKFHelpDesk";

export default function MKFAIPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-xs text-slate-500">Loading MKF AI...</div>}>
      <MKFHelpDesk />
    </Suspense>
  );
}
