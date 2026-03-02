'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/home')
    router.refresh()
  }

  return (
    <div className="border border-[#e0dbd4] bg-[#f0ede8] p-8">
      <h2 className="mb-6 text-xl font-bold text-[#1a1a18]">Sign in</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-[#6b6560]">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-[#e0dbd4] bg-[#fafaf7] px-3 py-2 text-sm text-[#1a1a18] placeholder-[#6b6560] focus:outline-none focus:border-[#7c9e7a]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-[#6b6560]">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full border border-[#e0dbd4] bg-[#fafaf7] px-3 py-2 text-sm text-[#1a1a18] focus:outline-none focus:border-[#7c9e7a]"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#7c9e7a] hover:bg-[#6a8c68] py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-[#6b6560]">
        No account?{' '}
        <Link href="/signup" className="text-[#7c9e7a] hover:underline">Sign up</Link>
      </p>
    </div>
  )
}
