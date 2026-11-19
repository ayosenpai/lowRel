'use client'

import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Status = 'idle' | 'saving' | 'success' | 'error'

export default function ChangePassword() {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [status, setStatus] = useState<Status>('idle')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (status === 'saving') return

        if (password.length < 8) {
            setStatus('error')
            setMessage('Password must be at least 8 characters.')
            return
        }
        if (password !== confirm) {
            setStatus('error')
            setMessage('Passwords do not match.')
            return
        }

        setStatus('saving')
        setMessage('')

        const supabase = createClient()
        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            setStatus('error')
            setMessage(error.message)
            return
        }

        setStatus('success')
        setMessage('Password updated. Use it the next time you sign in.')
        setPassword('')
        setConfirm('')
    }

    return (
        <div className="border border-gray-200 p-6">
            <h2 className="lowrel-header text-sm mb-4 uppercase flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                Change Password
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
                <input
                    type="password"
                    name="new-password"
                    autoComplete="new-password"
                    placeholder="NEW PASSWORD"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-[1.5px] border-black px-4 py-3 focus:outline-none placeholder:text-gray-300 font-black text-xs uppercase tracking-wider"
                />
                <input
                    type="password"
                    name="confirm-password"
                    autoComplete="new-password"
                    placeholder="CONFIRM NEW PASSWORD"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full border-[1.5px] border-black px-4 py-3 focus:outline-none placeholder:text-gray-300 font-black text-xs uppercase tracking-wider"
                />

                {message && (
                    <p className={`text-[10px] uppercase font-black ${status === 'error' ? 'text-red-600' : 'text-green-700'}`}>
                        {message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={status === 'saving'}
                    className="w-full bg-black text-white py-3 text-xs uppercase font-black tracking-[0.15em] hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                    {status === 'saving' ? 'Updating…' : 'Update Password'}
                </button>
            </form>
        </div>
    )
}
