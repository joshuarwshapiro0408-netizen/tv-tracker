import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { tmdbImageUrl, getTrendingShows } from '@/lib/tmdb'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = following?.map(f => f.following_id) || []

  const logsQuery = supabase
    .from('show_logs')
    .select('*, profiles(username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(40)

  if (followingIds.length > 0) {
    logsQuery.in('user_id', followingIds)
  }

  const [logsResult, trending] = await Promise.all([
    logsQuery,
    getTrendingShows().catch(() => null),
  ])

  const logs = logsResult.data || []
  const trendingShows: { id: number; name: string; poster_path: string | null }[] =
    trending?.results?.slice(0, 12) || []

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-[#e0dbd4] pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-1">
          {followingIds.length > 0 ? 'following' : 'community'}
        </p>
        <h1 className="text-3xl font-bold text-[#1a1a18]">Journal</h1>
        {followingIds.length === 0 && (
          <p className="text-sm text-[#6b6560] mt-2 leading-relaxed">
            Follow people to see their activity here. Showing community activity for now.
          </p>
        )}
      </div>

      {/* Diary-style entries */}
      <section>
        {logs.length === 0 ? (
          <div className="py-10 border border-dashed border-[#e0dbd4] text-center bg-[#fafaf7]">
            <p className="text-sm font-semibold text-[#1a1a18] mb-1">Your journal is quiet</p>
            <p className="text-xs text-[#6b6560] mb-4 leading-relaxed">
              {followingIds.length === 0
                ? 'Follow people to see their logs here, or start logging yourself.'
                : "The people you follow haven't logged anything yet."}
            </p>
            <div className="flex justify-center gap-6">
              <Link href="/shows" className="text-xs font-semibold text-[#7c9e7a] hover:underline uppercase tracking-wide">
                Browse Shows →
              </Link>
              <Link href="/members" className="text-xs font-semibold text-[#7c9e7a] hover:underline uppercase tracking-wide">
                Find People →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {logs.map((log, i) => {
              const date = new Date(log.created_at)
              const prevLog = i > 0 ? logs[i - 1] : null
              const showDateHeader = !prevLog || date.toDateString() !== new Date(prevLog.created_at).toDateString()
              const posterUrl = tmdbImageUrl(log.show_poster_path, 'w92')
              return (
                <div key={log.id}>
                  {showDateHeader && (
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6560] pt-6 pb-2 border-t border-[#e0dbd4] first:border-t-0 first:pt-0">
                      {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                  <div className="flex gap-3 py-2.5 border-b border-[#e0dbd4]/60 last:border-b-0">
                    <Link href={`/shows/${log.tmdb_show_id}`} className="flex-shrink-0">
                      <div className="w-10 h-14 overflow-hidden bg-[#f0ede8] border border-[#e0dbd4]">
                        {posterUrl
                          ? <img src={posterUrl} alt={log.show_title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-[#e0dbd4]" />}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap text-xs text-[#6b6560] mb-0.5">
                            <Link href={`/profile/${log.profiles?.username}`} className="font-semibold text-[#1a1a18] hover:text-[#7c9e7a] transition-colors">
                              {log.profiles?.username}
                            </Link>
                            <span>
                              {log.status === 'watched' ? 'watched' : log.status === 'watching' ? 'is watching' : 'wants to watch'}
                            </span>
                          </div>
                          <Link href={`/shows/${log.tmdb_show_id}`} className="text-sm font-semibold text-[#1a1a18] hover:text-[#7c9e7a] transition-colors truncate block">
                            {log.show_title}
                          </Link>
                        </div>
                        {log.overall_score && (
                          <span className="text-sm font-bold text-[#7c9e7a] flex-shrink-0 tabular-nums">
                            {log.overall_score.toFixed(1)}
                          </span>
                        )}
                      </div>
                      {log.story_score && (
                        <div className="flex gap-3 text-xs text-[#6b6560] mt-0.5">
                          <span>Story <span className="text-[#1a1a18] font-semibold">{log.story_score.toFixed(1)}</span></span>
                          {log.performance_score && <span>Perf. <span className="text-[#1a1a18] font-semibold">{log.performance_score.toFixed(1)}</span></span>}
                          {log.visuals_score && <span>Visuals <span className="text-[#1a1a18] font-semibold">{log.visuals_score.toFixed(1)}</span></span>}
                        </div>
                      )}
                      {log.review && (
                        <p className="text-xs text-[#6b6560] italic mt-0.5 line-clamp-2">&ldquo;{log.review}&rdquo;</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Popular this week */}
      {trendingShows.length > 0 && (
        <section>
          <div className="border-t border-[#e0dbd4] pt-8 mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560]">Popular This Week</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {trendingShows.map(show => {
              const posterUrl = tmdbImageUrl(show.poster_path, 'w342')
              return (
                <Link key={show.id} href={`/shows/${show.id}`} className="group">
                  <div className="aspect-[2/3] overflow-hidden bg-[#f0ede8] border border-[#e0dbd4] group-hover:border-[#7c9e7a] transition-colors">
                    {posterUrl
                      ? <img src={posterUrl} alt={show.name} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                      : <div className="flex h-full w-full items-center justify-center text-xs text-[#6b6560] text-center p-2">{show.name}</div>}
                  </div>
                  <p className="mt-1.5 text-[11px] font-semibold text-[#1a1a18] truncate">{show.name}</p>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
