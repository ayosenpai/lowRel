'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { logout } from '@/app/login/actions'
import { Mail, User as UserIcon, LogOut, Package, Heart, MapPin } from 'lucide-react'

interface AccountClientProps {
    user: User
}

export default function AccountClient({ user }: AccountClientProps) {
    const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist'>('profile')

    const userMetadata = user.user_metadata || {}
    const displayName = userMetadata.full_name || userMetadata.name || user.email?.split('@')[0] || 'User'
    const avatarUrl = userMetadata.avatar_url || userMetadata.picture

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
                <div className="flex justify-center mb-4">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-24 h-24 rounded-full border-2 border-black"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full border-2 border-black bg-gray-100 flex items-center justify-center">
                            <UserIcon className="w-12 h-12 text-gray-400" />
                        </div>
                    )}
                </div>
                <h1 className="lowrel-header text-3xl mb-2 uppercase">
                    {displayName}
                </h1>
                <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-8">
                <div className="flex justify-center gap-8">
                    {[
                        { id: 'profile', label: 'Profile', icon: UserIcon },
                        { id: 'orders', label: 'Orders', icon: Package },
                        { id: 'wishlist', label: 'Wishlist', icon: Heart },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 pb-4 text-xs uppercase font-black tracking-[0.15em] transition-colors relative ${activeTab === tab.id
                                    ? 'text-black'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'profile' && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="border border-gray-200 p-6">
                            <h2 className="lowrel-header text-sm mb-4 uppercase">Account Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs uppercase font-black tracking-widest text-gray-500 block mb-1">
                                        Full Name
                                    </label>
                                    <p className="text-sm font-medium">{displayName}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase font-black tracking-widest text-gray-500 block mb-1">
                                        Email Address
                                    </label>
                                    <p className="text-sm font-medium">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs uppercase font-black tracking-widest text-gray-500 block mb-1">
                                        Account Created
                                    </label>
                                    <p className="text-sm font-medium">
                                        {new Date(user.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 p-6">
                            <h2 className="lowrel-header text-sm mb-4 uppercase">Saved Addresses</h2>
                            <div className="text-center py-8">
                                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 mb-4">No saved addresses yet</p>
                                <button className="text-xs uppercase font-black tracking-[0.15em] border border-black px-6 py-2 hover:bg-black hover:text-white transition-colors">
                                    Add Address
                                </button>
                            </div>
                        </div>

                        <form action={logout} className="text-center pt-4">
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 text-xs uppercase font-black tracking-[0.15em] text-red-600 hover:text-red-700 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center py-16">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="lowrel-header text-lg mb-2 uppercase">No Orders Yet</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Start shopping to see your orders here
                            </p>
                            <a
                                href="/collections/all"
                                className="inline-block bg-black text-white px-8 py-3 text-xs uppercase font-black tracking-[0.15em] hover:bg-gray-800 transition-colors"
                            >
                                Start Shopping
                            </a>
                        </div>
                    </div>
                )}

                {activeTab === 'wishlist' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center py-16">
                            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="lowrel-header text-lg mb-2 uppercase">Your Wishlist is Empty</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Save your favorite items for later
                            </p>
                            <a
                                href="/pages/wishlist"
                                className="inline-block border border-black text-black px-8 py-3 text-xs uppercase font-black tracking-[0.15em] hover:bg-black hover:text-white transition-colors"
                            >
                                View Wishlist
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
