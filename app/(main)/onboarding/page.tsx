'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const GENRES = [
  'Drama', 'Comedy', 'Crime', 'Thriller', 'Action & Adventure',
  'Sci-Fi & Fantasy', 'Horror', 'Mystery', 'Documentary',
  'Animation', 'Reality', 'Romance', 'Western', 'News & Politics',
]

export default function OnboardingPage() {
  const supabase = createClient()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [genres, setGenres] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('favourite_genres')
        .eq('id', user.id)
        .single()

      const existing = (profile as { favourite_genres?: string[] } | null)?.favourite_genres
      if (existing && existing.length > 0) {
        router.push('/home')
      }
    }
    checkAuth()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleGenre(g: string) {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  async function handleFinish() {
    setSaving(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: err } = await supabase
      .from('profiles')
      .update({
        favourite_genres: genres,
        bio: bio.trim() || null,
      })
      .eq('id', user.id)

    if (err) { setError(err.message); setSaving(false); return }
    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col">
      {/* Minimal header */}
      <header className="px-6 py-5 border-b border-[#e0dbd4]">
        <span className="text-[#1a1410] font-bold text-base tracking-tight">trakr</span>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Progress dots */}
          <div className="flex gap-1.5 mb-8">
            {[1, 2].map(n => (
              <div
                key={n}
                className={`h-1 flex-1 transition-colors ${n <= step ? 'bg-[#7c9e7a]' : 'bg-[#e0dbd4]'}`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-1">step 1 of 2</p>
                <h1 className="text-2xl font-bold text-[#1a1a18]">What do you like to watch?</h1>
                <p className="text-sm text-[#6b6560] mt-2 leading-relaxed">
                  Pick your favourite genres. We&apos;ll use this to personalise your experience.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {GENRES.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-2 text-xs font-medium transition-all duration-150 border cursor-pointer ${
                      genres.includes(g)
                        ? 'bg-[#7c9e7a] border-[#7c9e7a] text-white'
                        : 'bg-[#fafaf7] border-[#e0dbd4] text-[#6b6560] hover:border-[#7c9e7a] hover:text-[#1a1a18]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  disabled={genres.length === 0}
                  className="flex-1 bg-[#7c9e7a] hover:bg-[#6a8c68] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 text-sm font-semibold transition-all cursor-pointer"
                >
                  continue →
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-[#6b6560] hover:text-[#1a1a18] transition-colors cursor-pointer px-3"
                >
                  skip
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-1">step 2 of 2</p>
                <h1 className="text-2xl font-bold text-[#1a1a18]">Tell people about yourself</h1>
                <p className="text-sm text-[#6b6560] mt-2 leading-relaxed">
                  A short bio helps others find you. You can always update this later.
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide text-[#6b6560] mb-2">
                  Bio <span className="normal-case font-normal text-[#6b6560]">(optional)</span>
                </label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="TV obsessive. Crime drama, slow-burn comedy, anything with a great ending."
                  rows={4}
                  maxLength={160}
                  className="w-full border border-[#e0dbd4] bg-[#fafaf7] px-3 py-2.5 text-sm text-[#1a1a18] placeholder-[#6b6560] focus:outline-none focus:border-[#7c9e7a] resize-none"
                />
                <p className="text-[11px] text-[#6b6560] text-right mt-0.5">{bio.length}/160</p>
              </div>

              {/* Genres recap */}
              {genres.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#6b6560] mb-2">Your picks</p>
                  <div className="flex flex-wrap gap-1.5">
                    {genres.map(g => (
                      <span key={g} className="px-2 py-0.5 text-[11px] bg-[#d4e5d2] text-[#4a7a48] font-medium">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-[#6b6560] hover:text-[#1a1a18] transition-colors cursor-pointer px-3 py-3"
                >
                  ← back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex-1 bg-[#7c9e7a] hover:bg-[#6a8c68] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 text-sm font-semibold transition-all cursor-pointer"
                >
                  {saving ? 'setting up your account…' : 'start tracking →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
