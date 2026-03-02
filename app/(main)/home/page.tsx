import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getTrendingShows, tmdbImageUrl } from '@/lib/tmdb'

export const metadata: Metadata = { title: 'Home — trakr' }

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const username: string = user.user_metadata?.username ?? ''

  const [recentLogsResult, trendingResult] = await Promise.all([
    supabase
      .from('show_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(12),
    getTrendingShows().catch(() => null),
  ])

  const recentLogs = recentLogsResult.data || []
  const trendingShows: { id: number; name: string; poster_path: string | null; backdrop_path: string | null }[] =
    trendingResult?.results?.slice(0, 12) || []

  // Pick the first show with a backdrop for the hero
  const featuredShow = trendingShows.find(s => s.backdrop_path) || trendingShows[0] || null
  const backdropUrl = featuredShow?.backdrop_path ? tmdbImageUrl(featuredShow.backdrop_path, 'w1280') : null

  return (
    <div className="space-y-10">
      {/* Hero — full-bleed backdrop */}
      <section className="-mx-4 -mt-8 relative overflow-hidden" style={{ height: '320px' }}>
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[#f0ede8]" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#fafaf7]/5 via-[#fafaf7]/30 to-[#fafaf7]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#fafaf7]/70 via-transparent to-transparent" />

        {/* Text content */}
        <div className="absolute bottom-10 left-4 right-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b6560] mb-1">
            welcome back
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a18] leading-tight mb-4">
            {username}
          </h1>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/search"
              className="bg-[#7c9e7a] hover:bg-[#6a8c68] text-white px-5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors"
            >
              search shows
            </Link>
            <Link
              href="/feed"
              className="border border-[#1a1a18] bg-[#fafaf7]/80 text-[#1a1a18] hover:bg-[#f0ede8] px-5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors"
            >
              open journal
            </Link>
          </div>
        </div>
      </section>

      {/* Trending poster strip */}
      {trendingShows.length > 0 && (
        <section className="-mx-4 px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b6560]">Trending This Week</h2>
            <Link href="/shows" className="text-xs text-[#7c9e7a] hover:text-[#6a8c68] transition-colors">
              See all →
            </Link>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-2">
            {trendingShows.map(show => {
              const posterUrl = tmdbImageUrl(show.poster_path, 'w185')
              return (
                <Link key={show.id} href={`/shows/${show.id}`} className="group flex-shrink-0 w-[88px]">
                  <div className="aspect-[2/3] overflow-hidden bg-[#f0ede8] border border-[#e0dbd4] group-hover:border-[#7c9e7a] transition-colors">
                    {posterUrl ? (
                      <img src={posterUrl} alt={show.name} loading="lazy" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-[#6b6560] text-center p-1">{show.name}</div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Recently logged */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b6560]">Your Recently Logged</h2>
          <Link href={`/profile/${username}`} className="text-xs text-[#7c9e7a] hover:text-[#6a8c68] transition-colors">
            View profile →
          </Link>
        </div>
        {recentLogs.length > 0 ? (
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {recentLogs.map(log => {
              const posterUrl = tmdbImageUrl(log.show_poster_path, 'w185')
              return (
                <Link key={log.id} href={`/shows/${log.tmdb_show_id}`} className="w-[88px] flex-shrink-0 group">
                  <div className="aspect-[2/3] overflow-hidden bg-[#f0ede8] border border-[#e0dbd4] group-hover:border-[#7c9e7a] transition-colors">
                    {posterUrl ? (
                      <img src={posterUrl} alt={log.show_title} loading="lazy" className="h-full w-full object-cover group-hover:opacity-90 transition-opacity" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] text-[#6b6560]">
                        {log.show_title}
                      </div>
                    )}
                  </div>
                  {log.overall_score && (
                    <p className="mt-1 text-[10px] font-semibold text-[#7c9e7a] text-center tabular-nums">
                      {log.overall_score.toFixed(1)}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="py-8 border border-dashed border-[#e0dbd4] text-center bg-[#fafaf7]">
            <p className="text-sm font-semibold text-[#1a1a18] mb-1">Nothing logged yet</p>
            <p className="text-xs text-[#6b6560] mb-4">Find a show and start your diary.</p>
            <Link href="/search" className="text-xs font-semibold text-[#7c9e7a] hover:underline uppercase tracking-wide">
              Search Shows →
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
