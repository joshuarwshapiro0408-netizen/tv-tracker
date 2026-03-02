import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { tmdbImageUrl } from '@/lib/tmdb'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: recentLogs } = await supabase
    .from('show_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: trendingRaw } = await supabase
    .from('show_logs')
    .select('tmdb_show_id, show_title, show_poster_path')
    .gte('created_at', sevenDaysAgo)

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
    .slice(0, 10)
    .map(([id, data]) => ({ id, ...data }))

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="border border-[#e0dbd4] bg-[#f0ede8] px-6 py-8 sm:px-8 sm:py-10">
        <div className="max-w-2xl space-y-4">
          <p className="text-xs uppercase tracking-widest text-[#6b6560]">tv diary</p>
          <h1 className="text-3xl font-bold text-[#1a1a18] sm:text-4xl leading-tight">
            A quieter place to track what you watch.
          </h1>
          <p className="text-sm text-[#6b6560] leading-relaxed">
            Log shows as you watch them, keep gentle scores, and come back to a calm overview of your viewing life.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/search"
              className="bg-[#7c9e7a] hover:bg-[#6a8c68] text-white px-5 py-2 text-sm font-semibold transition-colors"
            >
              Search shows
            </Link>
            <Link
              href="/feed"
              className="border border-[#1a1a18] text-[#1a1a18] hover:bg-[#f0ede8] px-5 py-2 text-sm font-semibold transition-colors"
            >
              Open feed
            </Link>
          </div>
        </div>
      </section>

      {/* Recently logged */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560]">Recently Logged</h2>
          <Link href={`/profile/${user.user_metadata?.username ?? ''}`} className="text-xs text-[#7c9e7a] hover:text-[#6a8c68]">
            View profile
          </Link>
        </div>
        {recentLogs && recentLogs.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recentLogs.map(log => {
              const posterUrl = tmdbImageUrl(log.show_poster_path, 'w185')
              return (
                <Link key={log.id} href={`/shows/${log.tmdb_show_id}`} className="w-24 flex-shrink-0 group">
                  <div className="aspect-[2/3] overflow-hidden bg-[#f0ede8] border border-[#e0dbd4] group-hover:border-[#7c9e7a] transition-colors">
                    {posterUrl ? (
                      <img src={posterUrl} alt={log.show_title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-[#6b6560]">
                        {log.show_title}
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 truncate text-xs text-[#1a1a18] font-medium">{log.show_title}</p>
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-[#6b6560]">
            Nothing logged yet.{' '}
            <Link href="/search" className="text-[#7c9e7a] hover:underline">Search for a show</Link> to get started.
          </p>
        )}
      </section>

      {/* Community trending */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560]">Trending This Week</h2>
        {trending.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {trending.map(show => {
              const posterUrl = tmdbImageUrl(show.poster, 'w185')
              return (
                <Link key={show.id} href={`/shows/${show.id}`} className="group">
                  <div className="aspect-[2/3] overflow-hidden bg-[#f0ede8] border border-[#e0dbd4] group-hover:border-[#7c9e7a] transition-colors">
                    {posterUrl ? (
                      <img src={posterUrl} alt={show.title} className="h-full w-full object-cover group-hover:opacity-90 transition-opacity" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-[#6b6560]">
                        {show.title}
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 truncate text-xs text-[#1a1a18] font-medium">{show.title}</p>
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-[#6b6560]">Log a few shows and you&apos;ll see what the community is watching.</p>
        )}
      </section>
    </div>
  )
}
