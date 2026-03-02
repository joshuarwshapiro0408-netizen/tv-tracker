'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { TMDBShow } from '@/lib/types'
import { tmdbImageUrl } from '@/lib/tmdb'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function SearchPage() {
  return (
    <Suspense>
      <SearchInner />
    </Suspense>
  )
}

function SearchInner() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TMDBShow[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<number | null>(null)

  const performSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      performSearch(q)
    }
  }, [searchParams, performSearch])

  function handleQueryChange(value: string) {
    setQuery(value)
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    if (value.trim().length < 2) { setResults([]); return }
    debounceRef.current = window.setTimeout(() => performSearch(value), 400)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a18] mb-1">Search & Discover</h1>
        <p className="text-sm text-[#6b6560]">Find shows to log, rate, and share.</p>
      </div>

      {/* Full-width search bar */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          placeholder="Search for a TV show…"
          autoFocus
          className="w-full border border-[#1a1a18] bg-[#fafaf7] px-4 py-3 text-[#1a1a18] text-base placeholder-[#6b6560] focus:outline-none focus:border-[#7c9e7a] transition-colors"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6b6560]">Searching…</span>
        )}
      </div>

      {/* Empty hint */}
      {!loading && query.trim().length < 2 && results.length === 0 && (
        <p className="text-sm text-[#6b6560]">Type at least 2 characters to search.</p>
      )}

      {/* No results */}
      {!loading && query.trim().length >= 2 && results.length === 0 && (
        <p className="text-sm text-[#6b6560]">No shows found for &quot;{query}&quot;.</p>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map(show => (
            <ShowPosterCard key={show.id} show={show} />
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
      <div className="aspect-[2/3] w-full overflow-hidden bg-[#f0ede8] border border-[#e0dbd4] group-hover:border-[#7c9e7a] transition-colors">
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
