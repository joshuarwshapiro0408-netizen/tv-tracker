'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TMDBShow } from '@/lib/types'
import { tmdbImageUrl } from '@/lib/tmdb'
import Link from 'next/link'

type Tab = 'search' | 'discover'

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<Tab>('search')
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
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current)
    }

    if (query.trim().length < 2) {
      setResults([])
      return
    }

    debounceRef.current = window.setTimeout(() => {
      performSearch(query)
    }, 400)

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current)
      }
    }
  }, [query, performSearch])

  const discoverSections = useMemo(
    () => [
      {
        id: 'popular',
        title: 'Popular this week',
        shows: results.slice(0, 10),
      },
      {
        id: 'highly-rated',
        title: 'Highly rated',
        shows: results.slice(10, 20),
      },
    ],
    [results],
  )

  const showSearchEmptyHint = query.trim().length < 2 && results.length === 0 && !loading

  const showNoResults =
    !loading && query.trim().length >= 2 && results.length === 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8 space-y-2 text-center sm:text-left">
        <h1 className="text-2xl font-semibold text-white">Discover shows</h1>
        <p className="text-sm text-gray-400">
          Search or browse to decide what to watch next.
        </p>
      </div>

      <div className="flex justify-center sm:justify-start mb-6">
        <div className="inline-flex rounded-full bg-gray-900 border border-gray-800 p-1">
          {(['search', 'discover'] as Tab[]).map(tab => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                  isActive
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'search' ? 'Search' : 'Discover'}
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === 'search' ? (
        <div className="space-y-4">
          <div className="relative max-w-xl">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500 text-sm">
              🔎
            </span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for a TV show..."
              autoFocus
              className="w-full bg-gray-900/60 border border-gray-800 rounded-full pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gray-500 focus:bg-gray-900 transition-colors"
            />
          </div>

          {loading && (
            <p className="text-xs text-gray-500">Searching…</p>
          )}

          {showSearchEmptyHint && (
            <p className="text-sm text-gray-500">
              Start typing to search TV shows.
            </p>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map(show => (
                <ShowPosterCard key={show.id} show={show} />
              ))}
            </div>
          )}

          {showNoResults && (
            <p className="text-sm text-gray-500">
              No shows found for &quot;{query}&quot;.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {discoverSections.map(
            section =>
              section.shows.length > 0 && (
                <section key={section.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-white">
                      {section.title}
                    </h2>
                    <button
                      type="button"
                      className="hidden text-xs text-gray-500 hover:text-gray-300 sm:inline"
                    >
                      View all
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="flex gap-3 pb-1">
                      {section.shows.map(show => (
                        <div key={show.id} className="w-28 flex-shrink-0">
                          <ShowPosterCard show={show} />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              ),
          )}

          {discoverSections.every(section => section.shows.length === 0) && (
            <p className="text-sm text-gray-500">
              Start a search first and we&apos;ll use your results to populate
              Discover sections.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function ShowPosterCard({ show }: { show: TMDBShow }) {
  const imageUrl = tmdbImageUrl(show.poster_path, 'w185')
  const year = show.first_air_date
    ? new Date(show.first_air_date).getFullYear()
    : undefined

  return (
    <Link
      href={`/shows/${show.id}`}
      className="group block"
    >
      <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-gray-800 shadow-sm ring-1 ring-gray-900/40 group-hover:ring-gray-500/60 transition-all">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={show.name}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
            No image
          </div>
        )}
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="truncate text-xs font-medium text-white">
          {show.name}
        </p>
        <p className="text-[11px] text-gray-500">
          {year ?? 'Unknown year'}
        </p>
      </div>
    </Link>
  )
}

