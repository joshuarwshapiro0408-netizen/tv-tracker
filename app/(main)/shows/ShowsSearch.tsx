'use client'

import { useCallback, useRef, useState } from 'react'
import { TMDBShow } from '@/lib/types'
import { tmdbImageUrl } from '@/lib/tmdb'
import Link from 'next/link'

export default function ShowsSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TMDBShow[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<number | null>(null)

  const performSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results || [])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    if (value.trim().length < 2) { setResults([]); return }
    debounceRef.current = window.setTimeout(() => performSearch(value), 350)
  }

  return (
    <div className="space-y-5">
      {/* Search input */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6560]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder="Find a show…"
          className="w-full border border-[#e0dbd4] bg-[#f5f2ed] pl-11 pr-4 py-3 text-sm text-[#1a1a18] placeholder-[#6b6560] focus:outline-none focus:border-[#7c9e7a] transition-colors"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6b6560]">Searching…</span>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {results.map(show => {
            const posterUrl = tmdbImageUrl(show.poster_path, 'w342')
            return (
              <Link key={show.id} href={`/shows/${show.id}`} className="group">
                <div className="aspect-[2/3] overflow-hidden bg-[#f0ede8] border border-[#e0dbd4] group-hover:border-[#7c9e7a] transition-colors">
                  {posterUrl
                    ? <img src={posterUrl} alt={show.name} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                    : <div className="flex h-full w-full items-center justify-center text-xs text-[#6b6560] text-center p-1">{show.name}</div>}
                </div>
                <p className="mt-1 text-[11px] font-semibold text-[#1a1a18] truncate">{show.name}</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
