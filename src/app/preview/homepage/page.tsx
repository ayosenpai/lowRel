import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import HomepageRenderer from '@/components/sections/homepage-renderer';
import { getAdminUser } from '@/lib/admin-auth';
import { getHomepageSections } from '@/lib/actions/homepage';
import { readHomepageDraft } from '@/lib/homepage-store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Homepage draft preview',
    robots: { index: false, follow: false },
};

/**
 * Renders the unpublished draft layout from the homepage editor. Admin-only
 * and never linked from the storefront, so the live homepage is untouched.
 */
export default async function HomepagePreviewPage() {
    const { admin, authenticated } = await getAdminUser();

    if (!admin) {
        redirect(authenticated ? '/' : '/login');
    }

    const draft = await readHomepageDraft();
    const sections = draft?.sections ?? (await getHomepageSections());

    return (
        <main className="min-h-screen overflow-x-hidden">
            <div className="sticky top-0 z-[60] flex flex-wrap items-center justify-between gap-2 bg-[#0F172A] px-4 py-2.5 text-[#d8a4bc] md:px-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                        Draft preview — not published
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                        {draft
                            ? `Saved ${format(draft.updatedAt, 'MMM d, HH:mm')}`
                            : 'No draft yet — showing the live layout'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-gray-400 transition-colors hover:text-white"
                    >
                        <ExternalLink className="h-3 w-3" />
                        Live site
                    </Link>
                    <Link
                        href="/admin/homepage"
                        className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#d8a4bc] transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Back to editor
                    </Link>
                </div>
            </div>

            <Header variant="transparent" />
            <HomepageRenderer sections={sections} />
            <Footer />
        </main>
    );
}
