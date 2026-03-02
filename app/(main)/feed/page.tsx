import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { tmdbImageUrl } from '@/lib/tmdb'
import Link from 'next/link'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get IDs of people the user follows
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = following?.map(f => f.following_id) || []

  // Fetch activity: show logs from followed users (or everyone if not following anyone)
  const query = supabase
    .from('show_logs')
    .select('*, profiles(username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(30)

  if (followingIds.length > 0) {
    query.in('user_id', followingIds)
  }

  const { data: logs } = await query

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">
        {followingIds.length > 0 ? 'Feed' : 'Community Activity'}
      </h1>

      {followingIds.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6 text-sm text-gray-400">
          Follow people to see their activity here. For now, here&apos;s what the community has been watching.
        </div>
      )}

      {(!logs || logs.length === 0) && (
        <p className="text-gray-500">No activity yet. Search for shows and start logging!</p>
      )}

      <div className="space-y-4">
        {logs?.map(log => {
          const posterUrl = tmdbImageUrl(log.show_poster_path, 'w92')
          return (
            <div key={log.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-4">
              {/* Poster */}
              <Link href={`/shows/${log.tmdb_show_id}`} className="flex-shrink-0">
                <div className="w-12 h-18 rounded-md overflow-hidden bg-gray-800">
                  {posterUrl ? (
                    <img src={posterUrl} alt={log.show_title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-700" />
                  )}
                </div>
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link href={`/profile/${log.profiles?.username}`} className="text-white font-medium hover:text-blue-400 transition-colors">
                    {log.profiles?.username}
                  </Link>
                  <span className="text-gray-500 text-sm">
                    {log.status === 'watched' ? 'watched' : log.status === 'watching' ? 'is watching' : 'wants to watch'}
                  </span>
                  <Link href={`/shows/${log.tmdb_show_id}`} className="text-white font-medium hover:text-blue-400 transition-colors">
                    {log.show_title}
                  </Link>
                </div>

                {log.overall_score && (
                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                    <span>Overall <span className="text-white font-bold">{log.overall_score.toFixed(1)}</span></span>
                    {log.story_score && <span>Story <span className="text-gray-300">{log.story_score.toFixed(1)}</span></span>}
                    {log.performance_score && <span>Performance <span className="text-gray-300">{log.performance_score.toFixed(1)}</span></span>}
                    {log.visuals_score && <span>Visuals <span className="text-gray-300">{log.visuals_score.toFixed(1)}</span></span>}
                  </div>
                )}

                {log.review && (
                  <p className="text-gray-400 text-sm mt-2 line-clamp-3">{log.review}</p>
                )}

                <p className="text-gray-600 text-xs mt-2">
                  {new Date(log.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
