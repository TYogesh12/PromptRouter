'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 h-screen w-full px-4 text-center">
      <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center text-red-500 mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
      </div>
      <h2 className="text-3xl font-black font-headline text-white tracking-tighter mb-4">
        Something went wrong
      </h2>
      <p className="text-slate-400 max-w-sm mb-8 text-sm leading-relaxed">
        The application encountered an unexpected error.
      </p>
      <button
        onClick={() => reset()}
        className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl transition-all shadow-xl shadow-emerald-500/10 active:scale-95"
      >
        Try Again
      </button>
    </div>
  );
}
