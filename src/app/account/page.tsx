import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/sections/header'
import Footer from '@/components/sections/footer'
import AccountClient from './AccountClient'

export default async function AccountPage() {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    return (
        <main className="min-h-screen bg-white text-black pt-[100px]">
            <Header variant="solid" />

            <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-12">
                {/* Breadcrumbs */}
                <nav className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-8 text-center">
                    <span className="lowrel-link">Home / My Account</span>
                </nav>

                <AccountClient user={user} />
            </div>

            <Footer />
        </main>
    )
}
