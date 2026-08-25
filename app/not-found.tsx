import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

export default function NotFound() {
  return (
    <PageLayout showBlobs={true}>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-sm border border-blue-100/50">
          <Search className="w-8 h-8" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3">
          404 - Page Not Found
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-md mb-8">
          The page or tool you are looking for does not exist or might have been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </PageLayout>
  );
}
