"use client";

import { signup } from '@/app/login/actions'
import { useActionState } from 'react'
import Link from 'next/link'
import Header from '@/components/sections/header'
import Footer from '@/components/sections/footer'

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(signup, { error: undefined, success: false } as any)

    return (
        <main className="min-h-screen bg-white text-black pt-[100px] font-sans">
            <Header variant="solid" />

            <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-12">
                {/* Breadcrumbs */}
                <nav className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-8 text-center">
                    <span className="lowrel-link">Home / Create Account</span>
                </nav>

                <div className="max-w-[380px] mx-auto text-center">
                    <h1 className="lowrel-header text-2xl mb-8 uppercase">
                        Create Account
                    </h1>

                    <form action={formAction} className="space-y-3">
                        <div className="space-y-1 text-left">
                            <input
                                id="first-name"
                                name="firstName"
                                type="text"
                                placeholder="FIRST NAME"
                                required
                                className="w-full border-[1.5px] border-black px-4 py-3 focus:outline-none placeholder:text-gray-300 font-black text-xs uppercase tracking-wider"
                            />
                        </div>

                        <div className="space-y-1 text-left">
                            <input
                                id="last-name"
                                name="lastName"
                                type="text"
                                placeholder="LAST NAME"
                                required
                                className="w-full border-[1.5px] border-black px-4 py-3 focus:outline-none placeholder:text-gray-300 font-black text-xs uppercase tracking-wider"
                            />
                        </div>

                        <div className="space-y-1 text-left">
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="EMAIL"
                                required
                                className="w-full border-[1.5px] border-black px-4 py-3 focus:outline-none placeholder:text-gray-300 font-black text-xs uppercase tracking-wider"
                            />
                        </div>

                        <div className="space-y-1 text-left">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="PASSWORD"
                                required
                                className="w-full border-[1.5px] border-black px-4 py-3 focus:outline-none placeholder:text-gray-300 font-black text-xs uppercase tracking-wider"
                            />
                        </div>

                        {state?.error && (
                            <p className="lowrel-link text-red-500 text-[10px] uppercase font-black text-center">{state.error}</p>
                        )}

                        {state?.success && (
                            <p className="lowrel-link text-green-500 text-[10px] uppercase font-black text-center">Check your email for a confirmation link.</p>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-black text-white py-3.5 text-xs hover:bg-gray-900 transition-colors disabled:opacity-50 mt-4"
                        >
                            <span className="lowrel-header tracking-[0.2em]">
                                {isPending ? 'PROCESSING...' : 'CREATE'}
                            </span>
                        </button>
                    </form>

                    <div className="mt-8">
                        <Link
                            href="/login"
                            className="lowrel-link text-[10px] hover:text-gray-600 transition-colors uppercase underline underline-offset-4 decoration-1 font-black"
                        >
                            Already have an account? Sign In
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
