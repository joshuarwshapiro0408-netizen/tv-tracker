import { createClient } from '@/lib/supabase/server'
import { tmdbImageUrl } from '@/lib/tmdb'
import Link from 'next/link'

export default async function DiscoverPage() {
  const supabase = await createClient()

  // Trending: most logged in the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: trendingRaw } = await supabase
    .from('show_logs')
    .select('tmdb_show_id, show_title, show_poster_path')
    .gte('created_at', sevenDaysAgo)

  // Count occurrences and deduplicate
  const trendingMap = new Map<number, { title: string; poster: string | null; count: number }>()
  trendingRaw?.forEach(log => {
    const existing = trendingMap.get(log.tmdb_show_id)
    trendingMap.set(log.tmdb_show_id, {
      title: log.show_title,
      poster: log.show_poster_path,
      count: (existing?.count || 0) + 1,
    })
  })
  const trending = Array.from(trendingMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 12)
    .map(([id, data]) => ({ id, ...data }))

  // Highest rated overall (min 2 logs)
  const { data: allLogs } = await supabase
    .from('show_logs')
    .select('tmdb_show_id, show_title, show_poster_path, overall_score')
    .not('overall_score', 'is', null)

  const ratingMap = new Map<number, { title: string; poster: string | null; scores: number[] }>()
  allLogs?.forEach(log => {
    const existing = ratingMap.get(log.tmdb_show_id)
    ratingMap.set(log.tmdb_show_id, {
      title: log.show_title,
      poster: log.show_poster_path,
      scores: [...(existing?.scores || []), log.overall_score],
    })
  })
  const topRated = Array.from(ratingMap.entries())
    .filter(([, data]) => data.scores.length >= 2)
    .map(([id, data]) => ({
      id,
      title: data.title,
      poster: data.poster,
      avgScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      count: data.scores.length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 12)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Discover</h1>

      {/* Trending */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Trending This Week</h2>
        {trending.length === 0 ? (
          <p className="text-gray-500 text-sm">Not enough activity yet — log some shows to see trends!</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {trending.map(show => {
              const posterUrl = tmdbImageUrl(show.poster, 'w185')
              return (
                <Link key={show.id} href={`/shows/${show.id}`} className="group">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                    {posterUrl ? (
                      <img src={posterUrl} alt={show.title} className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-2">{show.title}</div>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs text-center mt-1">{show.count} logs</p>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Top rated */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Highest Rated</h2>
        {topRated.length === 0 ? (
          <p className="text-gray-500 text-sm">No rated shows yet. Be the first!</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {topRated.map(show => {
              const posterUrl = tmdbImageUrl(show.poster, 'w185')
              return (
                <Link key={show.id} href={`/shows/${show.id}`} className="group">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                    {posterUrl ? (
                      <img src={posterUrl} alt={show.title} className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-2">{show.title}</div>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs text-center mt-1 font-semibold">{show.avgScore.toFixed(1)}</p>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
