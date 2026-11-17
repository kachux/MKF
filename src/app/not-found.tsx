import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl mb-4">
        404
      </div>
      <h2 className="text-2xl font-bold text-slate-800">Page Not Found</h2>
      <p className="text-sm text-slate-500 mt-2 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Festival Home
      </Link>
    </div>
  );
}
