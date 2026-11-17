import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import EmergencyBanner from "@/components/EmergencyBanner";
import Navbar from "@/components/Navbar";
import MKFAIAssistant from "@/components/MKFAIAssistant";
import AppFooter from "@/components/AppFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MKF — Malabar Knowledge Fest",
  description: "Malabar Knowledge Fest · Where curiosity meets discovery. Real-time event coordination, schedule, AI help desk, lost and found, and delegate access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#FAF7F2] text-slate-900 min-h-screen flex flex-col antialiased selection:bg-teal-700 selection:text-white`}>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <AuthProvider>
          <EmergencyBanner />
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <MKFAIAssistant />
          <AppFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
