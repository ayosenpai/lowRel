'use client';

import { Settings, Globe, Shield, Bell, CreditCard, Palette, Save } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', name: 'General', icon: Globe },
        { id: 'security', name: 'Security', icon: Shield },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'billing', name: 'Billing & Tax', icon: CreditCard },
        { id: 'appearance', name: 'Storefront Appearance', icon: Palette },
    ];

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-[#0F172A] m-0">System Configuration</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Control your store's global parameters and administrative security</p>
                </div>
                <button className="flex items-center gap-3 px-6 py-3.5 bg-[#0F172A] text-[#d8a4bc] rounded-xl hover:bg-black transition-all shadow-lg active:scale-95 group">
                    <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Commit Changes</span>
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Tabs Sidebar */}
                <div className="w-full lg:w-64 space-y-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all ${isActive
                                        ? 'bg-white shadow-sm border border-gray-100 text-[#0F172A]'
                                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-[#d8a4bc]' : ''}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? '' : 'sm:hidden lg:block'}`}>
                                    {tab.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-8">
                    <div className="admin-card p-8 rounded-2xl space-y-10">
                        {/* Section: Store Profile */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
                                <Globe className="w-5 h-5 text-[#d8a4bc]" />
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">Regional Strategy</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Default Market (Primary)</label>
                                    <select className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-[11px] font-bold uppercase tracking-wider focus:border-[#d8a4bc] focus:bg-white transition-all outline-none appearance-none">
                                        <option>India (₹ INR)</option>
                                        <option>United States ($ USD)</option>
                                        <option>Europe (€ EUR)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Detection Logic</label>
                                    <select className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-[11px] font-bold uppercase tracking-wider focus:border-[#d8a4bc] focus:bg-white transition-all outline-none appearance-none">
                                        <option>IP-Based Auto (Recommended)</option>
                                        <option>Browser Locale</option>
                                        <option>Manual Selector Only</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section: Security */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
                                <Shield className="w-5 h-5 text-[#d8a4bc]" />
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">Access Control</h2>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#d8a4bc]/20 transition-all group cursor-pointer">
                                    <div className="space-y-1">
                                        <span className="block text-[10px] font-black uppercase tracking-wider text-[#0F172A]">Multi-Factor Authentication</span>
                                        <span className="block text-[9px] font-medium text-gray-400">Require MFA for all administrative access attempts</span>
                                    </div>
                                    <div className="w-10 h-5 bg-gray-100 rounded-full p-1 relative transition-colors duration-200 group-hover:bg-gray-200">
                                        <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                                    </div>
                                </label>
                                <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#d8a4bc]/20 transition-all group cursor-pointer">
                                    <div className="space-y-1">
                                        <span className="block text-[10px] font-black uppercase tracking-wider text-[#0F172A]">Maintenance Mode</span>
                                        <span className="block text-[9px] font-medium text-gray-400">Lock the storefront for scheduled technical updates</span>
                                    </div>
                                    <div className="w-10 h-5 bg-gray-100 rounded-full p-1 relative transition-colors duration-200 group-hover:bg-gray-200">
                                        <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
