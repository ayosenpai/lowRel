'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error in the browser console and any configured monitoring.
    console.error('[app-error]', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24 text-center bg-white">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6">
        Something went wrong
      </p>
      <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
        A glitch in<br />the system
      </h1>
      <p className="max-w-md text-[11px] md:text-xs font-bold uppercase tracking-widest text-gray-500 leading-loose mb-10">
        We hit an unexpected error. Try again — if it keeps happening, our team is one message away.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={reset}
          className="px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#d8a4bc] hover:text-black transition-colors"
        >
          Try again
        </button>
        <Link
          href="/help/contact"
          className="px-10 py-4 border border-black text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-colors"
        >
          Contact support
        </Link>
      </div>
      {error.digest && (
        <p className="mt-10 text-[9px] font-mono uppercase tracking-widest text-gray-300">
          Ref: {error.digest}
        </p>
      )}
    </main>
  );
}
