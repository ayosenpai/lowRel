'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Search,
    PlusCircle,
    ShoppingBag
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import './admin.css';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setIsSidebarOpen(false);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkAdmin();
    }, [supabase]);

    const navItems = [
        {
            group: 'Overview',
            items: [
                { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
                { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
            ]
        },
        {
            group: 'Management',
            items: [
                { name: 'Products', href: '/admin/products', icon: Package },
                { name: 'Customers', href: '/admin/customers', icon: Users },
            ]
        },
        {
            group: 'Settings',
            items: [
                { name: 'Settings', href: '/admin/settings', icon: Settings },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#F0F2F5] flex font-sans admin-scrollbar">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99]"
                    />
                )}
            </AnimatePresence>

            <aside className={`fixed md:sticky top-0 h-screen bg-[#0F172A] text-white transition-all duration-300 z-[100] ${isMobile ? (isSidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full') : (isSidebarOpen ? 'w-72 translate-x-0' : 'w-24 translate-x-0')} flex flex-col border-r border-[#1E293B]`}>
                <div className="h-20 flex items-center justify-between px-8 border-b border-[#1E293B]">
                    <span className="text-xl font-black uppercase tracking-[0.2em] text-[#d8a4bc]">
                        {isSidebarOpen ? 'Low Religion Admin' : 'LR'}
                    </span>
                    {isMobile && (
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 hover:bg-white/5 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto admin-scrollbar">
                    {navItems.map((group) => (
                        <div key={group.group} className="space-y-3">
                            {isSidebarOpen && (
                                <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500">{group.group}</h3>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => isMobile && setIsSidebarOpen(false)}
                                            className={`flex items-center gap-4 px-4 py-3.5 transition-all duration-200 rounded-lg group ${isActive
                                                ? 'bg-[#d8a4bc] text-black font-bold shadow-lg shadow-[#d8a4bc]/10'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-black' : 'group-hover:text-[#d8a4bc]'}`} />
                                            {isSidebarOpen && <span className="text-xs uppercase tracking-widest leading-relaxed">{item.name}</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-6 border-t border-[#1E293B]">
                    <button className="flex items-center gap-4 px-4 py-3.5 w-full text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all rounded-lg group text-[10px] font-black uppercase tracking-widest">
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Top Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-40 flex items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-4 md:gap-6">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-gray-100/50 rounded-xl transition-colors border border-gray-100"
                        >
                            <Menu className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Quick search..." className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest outline-none w-32 md:w-48 placeholder:text-gray-300" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#0F172A] m-0">{user?.email?.split('@')[0] || 'Admin'}</p>
                                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest m-0 mt-0.5">Store Manager</p>
                            </div>
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#0F172A] border-2 border-[#E2E8F0] shadow-sm flex items-center justify-center text-[#d8a4bc] font-black text-sm uppercase">
                                {user?.email?.[0] || 'LR'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10 admin-scrollbar bg-[#F8FAFC]">
                    <div className="max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
