import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you were looking for does not exist.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24 text-center bg-white">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6">
          Error 404
        </p>
        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
          Lost in the<br />void
        </h1>
        <p className="max-w-md text-[11px] md:text-xs font-bold uppercase tracking-widest text-gray-500 leading-loose mb-10">
          This page has been moved, sold out, or never existed. The good stuff is still one click away.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/"
            className="px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#d8a4bc] hover:text-black transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/collections/all"
            className="px-10 py-4 border border-black text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-colors"
          >
            Shop all
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
