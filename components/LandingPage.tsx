'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AppComingSoonPopup from '@/components/AppComingSoonPopup'

type Poster = { id: number; poster: string | null; name: string }
type ModalType = 'login' | 'signup' | null

export default function LandingPage({
  backdrops,
  posters,
}: {
  backdrops: string[]
  posters: Poster[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentBg, setCurrentBg] = useState(0)
  const [modal, setModal] = useState<ModalType>(null)

  // Auto-open signup modal from ?form=signup
  useEffect(() => {
    if (searchParams.get('form') === 'signup') setModal('signup')
  }, [searchParams])

  // Rotate backdrop every 5s
  useEffect(() => {
    if (backdrops.length < 2) return
    const id = setInterval(() => setCurrentBg(i => (i + 1) % backdrops.length), 5000)
    return () => clearInterval(id)
  }, [backdrops.length])

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      {/* ── Hero ── */}
      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
        {/* Rotating backdrop images */}
        {backdrops.map((url, i) => (
          <div
            key={url}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ${
              i === currentBg ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${url})` }}
          />
        ))}

        {/* Warm cream overlay — keeps it light and nature-flavoured */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#fafaf7]/88 via-[#fafaf7]/82 to-[#fafaf7]" />

        {/* Landing nav */}
        <header className="absolute top-0 left-0 right-0 z-20 px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
          <span className="text-[#1a1a18] font-bold text-xl tracking-tight">trakr</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModal('login')}
              className="text-xs font-semibold tracking-wide text-[#6b6560] hover:text-[#1a1a18] transition-colors px-4 py-2 border border-[#e0dbd4] hover:border-[#1a1a18]"
            >
              sign in
            </button>
            <button
              onClick={() => setModal('signup')}
              className="text-xs font-semibold tracking-wide bg-[#7c9e7a] hover:bg-[#6a8c68] text-white px-4 py-2 transition-colors"
            >
              create account
            </button>
          </div>
        </header>

        {/* Headline */}
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#7c9e7a] mb-5">
            the home for tv obsessives
          </p>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold text-[#1a1a18] leading-[1.15] mb-4">
            track every show<br className="hidden sm:block" /> you&apos;ve watched.<br />
            remember every<br className="hidden sm:block" /> take you had.
          </h1>
          <p className="text-base md:text-lg text-[#6b6560] mb-8 leading-relaxed">
            share what&apos;s worth watching.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => setModal('signup')}
              className="bg-[#7c9e7a] hover:bg-[#6a8c68] active:scale-95 text-white px-8 py-3 text-sm font-semibold tracking-wide transition-all cursor-pointer"
            >
              get started — it&apos;s free
            </button>
            <button
              onClick={() => setModal('login')}
              className="border border-[#1a1a18] text-[#1a1a18] hover:bg-[#f0ede8] active:scale-95 px-8 py-3 text-sm font-semibold tracking-wide transition-all cursor-pointer"
            >
              sign in
            </button>
          </div>
        </div>
      </div>

      {/* ── Poster strip ── */}
      {posters.length > 0 && (
        <div className="bg-[#f0ede8] border-t border-b border-[#e0dbd4] py-8">
          <div className="flex gap-3 justify-center overflow-hidden px-6">
            {posters.map(p => (
              <div key={p.id} className="w-20 md:w-24 flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity">
                <div className="aspect-[2/3] overflow-hidden bg-[#e0dbd4]">
                  {p.poster && (
                    <img src={p.poster} alt={p.name} className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-[#6b6560] text-xs font-semibold tracking-widest uppercase mt-6">
            built for people who take tv seriously
          </p>
        </div>
      )}

      {/* ── Modal overlay ── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a18]/50 px-4"
          onClick={e => { if (e.target === e.currentTarget) setModal(null) }}
        >
          <div className="bg-[#fafaf7] border border-[#e0dbd4] w-full max-w-sm p-8 relative">
            <button
              onClick={() => setModal(null)}
              className="absolute top-4 right-4 text-[#6b6560] hover:text-[#1a1a18] transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {modal === 'login' ? (
              <LoginForm
                router={router}
                onSwitchToSignup={() => setModal('signup')}
              />
            ) : (
              <SignupForm
                router={router}
                onSwitchToLogin={() => setModal('login')}
              />
            )}
          </div>
        </div>
      )}

      <AppComingSoonPopup />
    </div>
  )
}

// ── Login form ─────────────────────────────────────────────────

function LoginForm({
  router,
  onSwitchToSignup,
}: {
  router: ReturnType<typeof useRouter>
  onSwitchToSignup: () => void
}) {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/home')
    router.refresh()
  }

  return (
    <>
      <h2 className="text-xl font-bold text-[#1a1a18] mb-6">Sign in</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#6b6560] mb-1">Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full border border-[#e0dbd4] bg-[#f5f2ed] px-3 py-2 text-sm text-[#1a1a18] focus:outline-none focus:border-[#7c9e7a] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#6b6560] mb-1">Password</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full border border-[#e0dbd4] bg-[#f5f2ed] px-3 py-2 text-sm text-[#1a1a18] focus:outline-none focus:border-[#7c9e7a] transition-colors"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full bg-[#7c9e7a] hover:bg-[#6a8c68] disabled:opacity-50 text-white py-2.5 text-sm font-semibold transition-colors"
        >
          {loading ? 'signing in…' : 'sign in'}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-[#6b6560]">
        No account?{' '}
        <button onClick={onSwitchToSignup} className="text-[#7c9e7a] hover:underline font-medium">
          Create one
        </button>
      </p>
    </>
  )
}

// ── Signup form ────────────────────────────────────────────────

function SignupForm({
  router,
  onSwitchToLogin,
}: {
  router: ReturnType<typeof useRouter>
  onSwitchToLogin: () => void
}) {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (username.length < 3) { setError('Username must be at least 3 characters'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { username } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/onboarding')
    router.refresh()
  }

  return (
    <>
      <h2 className="text-xl font-bold text-[#1a1a18] mb-6">Create account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#6b6560] mb-1">Username</label>
          <input
            type="text" value={username} required
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="e.g. tvnerd42"
            className="w-full border border-[#e0dbd4] bg-[#f5f2ed] px-3 py-2 text-sm text-[#1a1a18] placeholder-[#6b6560] focus:outline-none focus:border-[#7c9e7a] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#6b6560] mb-1">Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full border border-[#e0dbd4] bg-[#f5f2ed] px-3 py-2 text-sm text-[#1a1a18] focus:outline-none focus:border-[#7c9e7a] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#6b6560] mb-1">Password</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
            className="w-full border border-[#e0dbd4] bg-[#f5f2ed] px-3 py-2 text-sm text-[#1a1a18] focus:outline-none focus:border-[#7c9e7a] transition-colors"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full bg-[#7c9e7a] hover:bg-[#6a8c68] disabled:opacity-50 text-white py-2.5 text-sm font-semibold transition-colors"
        >
          {loading ? 'creating account…' : 'create account'}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-[#6b6560]">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="text-[#7c9e7a] hover:underline font-medium">
          Sign in
        </button>
      </p>
    </>
  )
}
