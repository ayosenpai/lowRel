import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldOff } from 'lucide-react';
import { getAdminUser } from '@/lib/admin-auth';
import AdminShell from './AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const { admin, authenticated } = await getAdminUser();

    // Not signed in at all → send to login
    if (!authenticated) {
        redirect('/login');
    }

    // Signed in, but not an admin → deny with a clear screen (no admin UI leaks)
    if (!admin) {
        return (
            <main className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-6">
                <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm max-w-md w-full p-10 text-center">
                    <div className="w-14 h-14 rounded-xl bg-[#0F172A] flex items-center justify-center mx-auto mb-6">
                        <ShieldOff className="w-7 h-7 text-[#d8a4bc]" />
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-widest text-[#0F172A] mb-3">
                        Access Denied
                    </h1>
                    <p className="text-sm text-gray-500 leading-relaxed mb-8">
                        Your account does not have permission to view the admin panel.
                        If you believe this is a mistake, contact the store owner.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-[#1E293B] transition-colors"
                    >
                        Back to Store
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <AdminShell email={admin.email}>
            {children}
        </AdminShell>
    );
}
