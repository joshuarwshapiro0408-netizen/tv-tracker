import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { tmdbImageUrl } from '@/lib/tmdb'
import Link from 'next/link'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = following?.map(f => f.following_id) || []

  const query = supabase
    .from('show_logs')
    .select('*, profiles(username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(30)

  if (followingIds.length > 0) {
    query.in('user_id', followingIds)
  }

  const { data: logs } = await query

  // Popular this week
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
  const popular = Array.from(trendingMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([id, data]) => ({ id, ...data }))

  return (
    <div className="max-w-2xl mx-auto space-y-10">

      {/* Popular This Week */}
      {popular.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-4">Popular This Week</h2>
          <div className="grid grid-cols-3 gap-3">
            {popular.map(show => {
              const posterUrl = tmdbImageUrl(show.poster, 'w342')
              return (
                <Link key={show.id} href={`/shows/${show.id}`} className="group">
                  <div className="aspect-[2/3] overflow-hidden bg-[#f0ede8] border border-[#e0dbd4]">
                    {posterUrl ? (
                      <img src={posterUrl} alt={show.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#6b6560] text-xs text-center p-2">{show.title}</div>
                    )}
                  </div>
                  <p className="text-[#1a1a18] text-xs font-medium mt-1.5 truncate">{show.title}</p>
                  <p className="text-[#6b6560] text-[11px]">{show.count} {show.count === 1 ? 'log' : 'logs'}</p>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Activity feed */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-4">
          {followingIds.length > 0 ? 'Friends Activity' : 'Community Activity'}
        </h2>

        {followingIds.length === 0 && (
          <p className="text-sm text-[#6b6560] border border-[#e0dbd4] bg-[#f0ede8] px-4 py-3 mb-4">
            Follow people to see their activity here. Showing all community activity for now.
          </p>
        )}

        {(!logs || logs.length === 0) && (
          <p className="text-sm text-[#6b6560]">No activity yet. Search for shows and start logging!</p>
        )}

        <div className="divide-y divide-[#e0dbd4] border-t border-b border-[#e0dbd4]">
          {logs?.map(log => {
            const posterUrl = tmdbImageUrl(log.show_poster_path, 'w92')
            return (
              <div key={log.id} className="flex gap-4 py-4">
                {/* Poster */}
                <Link href={`/shows/${log.tmdb_show_id}`} className="flex-shrink-0">
                  <div className="w-10 h-[60px] overflow-hidden bg-[#f0ede8] border border-[#e0dbd4]">
                    {posterUrl ? (
                      <img src={posterUrl} alt={log.show_title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#e0dbd4]" />
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap text-sm">
                    <Link href={`/profile/${log.profiles?.username}`} className="text-[#1a1a18] font-semibold hover:text-[#7c9e7a] transition-colors">
                      {log.profiles?.username}
                    </Link>
                    <span className="text-[#6b6560]">
                      {log.status === 'watched' ? 'watched' : log.status === 'watching' ? 'is watching' : 'wants to watch'}
                    </span>
                    <Link href={`/shows/${log.tmdb_show_id}`} className="text-[#1a1a18] font-semibold hover:text-[#7c9e7a] transition-colors">
                      {log.show_title}
                    </Link>
                  </div>

                  {log.overall_score && (
                    <div className="flex gap-3 mt-1 text-xs text-[#6b6560]">
                      <span>Overall <span className="text-[#1a1a18] font-semibold">{log.overall_score.toFixed(1)}</span></span>
                      {log.story_score && <span>Story <span className="text-[#1a1a18]">{log.story_score.toFixed(1)}</span></span>}
                      {log.performance_score && <span>Perf. <span className="text-[#1a1a18]">{log.performance_score.toFixed(1)}</span></span>}
                      {log.visuals_score && <span>Visuals <span className="text-[#1a1a18]">{log.visuals_score.toFixed(1)}</span></span>}
                    </div>
                  )}

                  {log.review && (
                    <p className="text-[#6b6560] text-sm mt-1.5 line-clamp-2 italic">&ldquo;{log.review}&rdquo;</p>
                  )}

                  <p className="text-[#6b6560] text-xs mt-1">
                    {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
