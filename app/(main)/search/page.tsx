'use client'

import { useState, useCallback } from 'react'
import ShowCard from '@/components/ShowCard'
import { TMDBShow } from '@/lib/types'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TMDBShow[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (q: string) => {
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)

    // Debounce: wait 400ms after typing stops before searching
    const timer = setTimeout(() => search(val), 400)
    return () => clearTimeout(timer)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Search Shows</h1>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search for a TV show..."
        autoFocus
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-blue-500 mb-4"
      />
      {loading && <p className="text-gray-400 text-sm">Searching...</p>}
      {!loading && results.length > 0 && (
        <div className="divide-y divide-gray-800">
          {results.map(show => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      )}
      {!loading && query.length >= 2 && results.length === 0 && (
        <p className="text-gray-400">No shows found for "{query}"</p>
      )}
    </div>
  )
}
