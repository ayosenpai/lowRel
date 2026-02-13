"use client";

import { login, signInWithGoogle } from '@/app/login/actions'
import { useActionState } from 'react'
import Link from 'next/link'
import Header from '@/components/sections/header'
import Footer from '@/components/sections/footer'

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, { error: undefined } as any)

    return (
        <main className="min-h-screen bg-white text-black pt-[100px] font-sans">
            <Header variant="solid" />

            <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-12">
                {/* Breadcrumbs */}
                <nav className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-8 text-center">
                    <span className="lowrel-link">Home / Account</span>
                </nav>

                <div className="max-w-[380px] mx-auto text-center">
                    <h1 className="lowrel-header text-2xl mb-8 uppercase">
                        Login
                    </h1>

                    <form action={formAction} className="space-y-4">
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

                        <div className="space-y-1 text-left relative">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="PASSWORD"
                                required
                                className="w-full border-[1.5px] border-black px-4 py-3 focus:outline-none placeholder:text-gray-300 font-black text-xs uppercase tracking-wider"
                            />
                            <div className="flex justify-end mt-2">
                                <button type="button" className="lowrel-link text-[8px] text-gray-400 hover:text-black transition-colors uppercase font-black">
                                    Forgot password?
                                </button>
                            </div>
                        </div>

                        {state?.error && (
                            <p className="lowrel-link text-red-500 text-[10px] uppercase font-black">{state.error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-black text-white py-3.5 text-xs hover:bg-gray-900 transition-colors disabled:opacity-50 mt-2"
                        >
                            <span className="lowrel-header tracking-[0.2em]">
                                {isPending ? 'SIGNING IN...' : 'SIGN IN'}
                            </span>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-400 font-black tracking-widest">Or</span>
                        </div>
                    </div>

                    {/* Google Sign-In Button */}
                    <form action={signInWithGoogle}>
                        <button
                            type="submit"
                            className="w-full border-[1.5px] border-black bg-white text-black py-3.5 text-xs hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="lowrel-header tracking-[0.15em]">
                                Continue with Google
                            </span>
                        </button>
                    </form>

                    <div className="mt-8">
                        <Link
                            href="/register"
                            className="lowrel-link text-[10px] hover:text-gray-600 transition-colors uppercase underline underline-offset-4 decoration-1 font-black"
                        >
                            Create account
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
