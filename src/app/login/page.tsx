"use client";

import { login } from '@/app/login/actions'
import { useActionState } from 'react'
import Link from 'next/link'
import Header from '@/components/sections/header'
import Footer from '@/components/sections/footer'

// Graphic Print Aesthetic Styles - Minimal Scale
const graphicStyles = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@900&display=swap');

.minga-header {
  display: inline-block;
  transform: scaleX(1.1);
  transform-origin: center;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: 'Archivo', sans-serif;
  font-weight: 900;
  letter-spacing: 0.1em;
  line-height: 1.1;
}

.minga-link {
  display: inline-block;
  transform: scaleX(1.05);
  transform-origin: left;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: 'Archivo', sans-serif;
  font-weight: 900;
  letter-spacing: 0.05em;
  line-height: 1.1;
}
`;

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, { error: undefined } as any)

    return (
        <main className="min-h-screen bg-white text-black pt-[100px] font-sans">
            <style dangerouslySetInnerHTML={{ __html: graphicStyles }} />
            <Header variant="solid" />

            <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-12">
                {/* Breadcrumbs */}
                <nav className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-8 text-center">
                    <span className="minga-link">Home / Account</span>
                </nav>

                <div className="max-w-[380px] mx-auto text-center">
                    <h1 className="minga-header text-2xl mb-8 uppercase">
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
                                <button type="button" className="minga-link text-[8px] text-gray-400 hover:text-black transition-colors uppercase font-black">
                                    Forgot password?
                                </button>
                            </div>
                        </div>

                        {state?.error && (
                            <p className="minga-link text-red-500 text-[10px] uppercase font-black">{state.error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-black text-white py-3.5 text-xs hover:bg-gray-900 transition-colors disabled:opacity-50 mt-2"
                        >
                            <span className="minga-header tracking-[0.2em]">
                                {isPending ? 'SIGNING IN...' : 'SIGN IN'}
                            </span>
                        </button>
                    </form>

                    <div className="mt-8">
                        <Link
                            href="/register"
                            className="minga-link text-[10px] hover:text-gray-600 transition-colors uppercase underline underline-offset-4 decoration-1 font-black"
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
