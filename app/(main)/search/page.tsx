'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { TMDBShow } from '@/lib/types'
import { tmdbImageUrl } from '@/lib/tmdb'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  )
}

type Tab = 'shows' | 'people'
type Profile = { id: string; username: string; bio: string | null; avatar_url: string | null }

function SearchInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = (searchParams.get('tab') as Tab) ?? 'shows'
  const supabase = createClient()

  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState<TMDBShow[]>([])
  const [peopleResults, setPeopleResults] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<number | null>(null)

  // Reset state when tab changes
  useEffect(() => {
    setQuery('')
    setShowResults([])
    setPeopleResults([])
  }, [tab])

  // Seed query from URL on shows tab
  useEffect(() => {
    const q = searchParams.get('q')
    if (q && tab === 'shows') {
      setQuery(q)
      searchShows(q)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const searchShows = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setShowResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setShowResults(data.results || [])
    } finally {
      setLoading(false)
    }
  }, [])

  const searchPeople = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setPeopleResults([]); return }
    setLoading(true)
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, bio, avatar_url')
        .ilike('username', `%${q.trim()}%`)
        .limit(20)
      setPeopleResults(data || [])
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function setTab(t: Tab) {
    const params = new URLSearchParams()
    params.set('tab', t)
    router.push(`/search?${params.toString()}`)
  }

  function handleQueryChange(value: string) {
    setQuery(value)
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    if (value.trim().length < 2) {
      setShowResults([])
      setPeopleResults([])
      return
    }
    if (tab === 'shows') {
      debounceRef.current = window.setTimeout(() => searchShows(value), 400)
    } else {
      debounceRef.current = window.setTimeout(() => searchPeople(value), 400)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a18] mb-1">Search</h1>
        <p className="text-sm text-[#6b6560]">Find shows to log or people to follow.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e0dbd4]">
        {(['shows', 'people'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors -mb-px ${
              tab === t
                ? 'border-b-2 border-[#7c9e7a] text-[#1a1a18]'
                : 'text-[#6b6560] hover:text-[#1a1a18]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          placeholder={tab === 'shows' ? 'Search for a TV show…' : 'Search by username…'}
          autoFocus
          className="w-full border border-[#1a1a18] bg-[#fafaf7] px-4 py-3 text-[#1a1a18] text-base placeholder-[#6b6560] focus:outline-none focus:border-[#7c9e7a] transition-colors"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6b6560]">Searching…</span>
        )}
      </div>

      {!loading && query.trim().length < 2 && (
        <p className="text-sm text-[#6b6560]">Type at least 2 characters to search.</p>
      )}

      {/* Shows results */}
      {tab === 'shows' && !loading && query.trim().length >= 2 && showResults.length === 0 && (
        <p className="text-sm text-[#6b6560]">No shows found for &quot;{query}&quot;.</p>
      )}
      {tab === 'shows' && showResults.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {showResults.map(show => (
            <ShowPosterCard key={show.id} show={show} />
          ))}
        </div>
      )}

      {/* People results */}
      {tab === 'people' && !loading && query.trim().length >= 2 && peopleResults.length === 0 && (
        <p className="text-sm text-[#6b6560]">No people found for &quot;{query}&quot;.</p>
      )}
      {tab === 'people' && peopleResults.length > 0 && (
        <div className="divide-y divide-[#e0dbd4] border-t border-b border-[#e0dbd4]">
          {peopleResults.map(profile => (
            <Link
              key={profile.id}
              href={`/profile/${profile.username}`}
              className="flex items-center justify-between py-3 px-1 hover:bg-[#f0ede8] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#f0ede8] border border-[#e0dbd4] overflow-hidden flex items-center justify-center text-sm font-bold text-[#6b6560] flex-shrink-0">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                  ) : (
                    profile.username[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#1a1a18]">{profile.username}</p>
                  {profile.bio && <p className="text-xs text-[#6b6560] line-clamp-1">{profile.bio}</p>}
                </div>
              </div>
              <span className="text-xs text-[#7c9e7a] flex-shrink-0">View →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function ShowPosterCard({ show }: { show: TMDBShow }) {
  const imageUrl = tmdbImageUrl(show.poster_path, 'w342')
  const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : undefined

  return (
    <Link href={`/shows/${show.id}`} className="group block">
      <div className="aspect-[2/3] w-full overflow-hidden bg-[#f0ede8] border border-[#e0dbd4] rounded-sm group-hover:border-[#7c9e7a] transition-colors">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={show.name}
            className="h-full w-full object-cover group-hover:opacity-90 transition-opacity"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[#6b6560] text-center px-2">
            No image
          </div>
        )}
      </div>
      <p className="mt-2 truncate text-xs font-semibold text-[#1a1a18]">{show.name}</p>
      {year && <p className="text-[11px] text-[#6b6560]">{year}</p>}
    </Link>
  )
}
