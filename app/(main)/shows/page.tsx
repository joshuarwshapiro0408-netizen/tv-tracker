import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTrendingShows, getShowsByNetwork, tmdbImageUrl } from '@/lib/tmdb'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ShowsSearch from './ShowsSearch'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Shows — trakr' }

type TMDBResult = {
  id: number
  name: string
  poster_path: string | null
  vote_average: number
  first_air_date: string
}

export default async function ShowsPage() {
  const [trending, netflix, hbo, appletv, prime, supabase] = await Promise.all([
    getTrendingShows().catch(() => null),
    getShowsByNetwork(213).catch(() => null),
    getShowsByNetwork(49).catch(() => null),
    getShowsByNetwork(2552).catch(() => null),
    getShowsByNetwork(1024).catch(() => null),
    createClient(),
  ])

  const trendingShows: TMDBResult[] = trending?.results?.slice(0, 20) || []

  const networkRows: { label: string; shows: TMDBResult[] }[] = [
    { label: 'Popular on Netflix',     shows: netflix?.results?.slice(0, 8) || [] },
    { label: 'Popular on HBO',         shows: hbo?.results?.slice(0, 8) || [] },
    { label: 'Popular on Apple TV+',   shows: appletv?.results?.slice(0, 8) || [] },
    { label: 'Popular on Prime Video', shows: prime?.results?.slice(0, 8) || [] },
  ].filter(row => row.shows.length > 0)

  const { data: recentReviews } = await supabase
    .from('show_logs')
    .select('*, profiles(username, avatar_url)')
    .not('review', 'is', null)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-1">browse</p>
        <h1 className="text-3xl font-bold text-[#1a1a18]">Shows</h1>
      </div>

      {/* Search */}
      <Suspense>
        <ShowsSearch />
      </Suspense>

      {/* Trending this week */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-5 pb-2 border-b border-[#e0dbd4]">
          Trending This Week
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {trendingShows.map(show => {
            const posterUrl = tmdbImageUrl(show.poster_path, 'w342')
            const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : null
            return (
              <Link key={show.id} href={`/shows/${show.id}`} className="group">
                <div className="relative aspect-[2/3] overflow-hidden bg-[#f0ede8] border border-[#e0dbd4] group-hover:border-[#7c9e7a] transition-all duration-200 group-hover:scale-[1.02]">
                  {posterUrl ? (
                    <img src={posterUrl} alt={show.name} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[#6b6560] text-center p-2">{show.name}</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a18]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-3">
                    <span className="text-white text-[10px] font-bold uppercase tracking-wide">view</span>
                  </div>
                </div>
                <p className="mt-2 text-xs font-semibold text-[#1a1a18] truncate">{show.name}</p>
                {year && <p className="text-[11px] text-[#6b6560]">{year}</p>}
              </Link>
            )
          })}
        </div>
      </section>

      {/* Streaming platform rows */}
      {networkRows.map(row => (
        <section key={row.label}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-5 pb-2 border-b border-[#e0dbd4]">
            {row.label}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {row.shows.map(show => {
              const posterUrl = tmdbImageUrl(show.poster_path, 'w342')
              const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : null
              return (
                <Link key={show.id} href={`/shows/${show.id}`} className="group flex-shrink-0 w-32 sm:w-36">
                  <div className="relative aspect-[2/3] overflow-hidden bg-[#f0ede8] border border-[#e0dbd4] group-hover:border-[#7c9e7a] transition-all duration-200 group-hover:scale-[1.02]">
                    {posterUrl ? (
                      <img src={posterUrl} alt={show.name} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-[#6b6560] text-center p-2">{show.name}</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a18]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-3">
                      <span className="text-white text-[10px] font-bold uppercase tracking-wide">view</span>
                    </div>
                  </div>
                  <p className="mt-1.5 text-[11px] font-semibold text-[#1a1a18] truncate">{show.name}</p>
                  {year && <p className="text-[10px] text-[#6b6560]">{year}</p>}
                </Link>
              )
            })}
          </div>
        </section>
      ))}

      {/* Just reviewed */}
      {recentReviews && recentReviews.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-5 pb-2 border-b border-[#e0dbd4]">
            Just Reviewed…
          </h2>
          <div className="space-y-3">
            {recentReviews.map((log: {
              id: string
              tmdb_show_id: number
              show_title: string
              show_poster_path: string | null
              overall_score: number | null
              review: string | null
              created_at: string
              profiles: { username: string; avatar_url: string | null } | null
            }) => {
              const posterUrl = tmdbImageUrl(log.show_poster_path, 'w92')
              return (
                <div key={log.id} className="flex gap-4 bg-[#f5f2ed] border border-[#e0dbd4] px-4 py-3">
                  <Link href={`/shows/${log.tmdb_show_id}`} className="flex-shrink-0">
                    <div className="w-10 h-14 overflow-hidden bg-[#e0dbd4]">
                      {posterUrl ? <img src={posterUrl} alt={log.show_title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#e0dbd4]" />}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="w-5 h-5 rounded-full bg-[#e0dbd4] overflow-hidden flex items-center justify-center text-[9px] font-bold text-[#6b6560] flex-shrink-0">
                        {log.profiles?.avatar_url ? <img src={log.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : log.profiles?.username?.[0]?.toUpperCase()}
                      </div>
                      <Link href={`/profile/${log.profiles?.username}`} className="text-xs font-semibold text-[#1a1a18] hover:text-[#7c9e7a] transition-colors">{log.profiles?.username}</Link>
                      <span className="text-[#6b6560] text-xs">reviewed</span>
                      <Link href={`/shows/${log.tmdb_show_id}`} className="text-xs font-semibold text-[#1a1a18] truncate hover:text-[#7c9e7a] transition-colors">{log.show_title}</Link>
                      {log.overall_score && <span className="ml-auto text-xs font-bold text-[#7c9e7a] flex-shrink-0">{log.overall_score.toFixed(1)}</span>}
                    </div>
                    <p className="text-xs text-[#6b6560] italic line-clamp-2">&ldquo;{log.review}&rdquo;</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
