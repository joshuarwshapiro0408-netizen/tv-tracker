import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { tmdbImageUrl } from '@/lib/tmdb'
import Link from 'next/link'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const isOwnProfile = user?.id === profile.id

  // Get counts
  const [
    { count: watchedCount },
    { count: followerCount },
    { count: followingCount },
    { data: isFollowing },
  ] = await Promise.all([
    supabase.from('show_logs').select('*', { count: 'exact', head: true }).eq('user_id', profile.id).eq('status', 'watched'),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
    user ? supabase.from('follows').select('*').eq('follower_id', user.id).eq('following_id', profile.id) : Promise.resolve({ data: [] }),
  ])

  // Get recent watched shows
  const { data: watchedShows } = await supabase
    .from('show_logs')
    .select('*')
    .eq('user_id', profile.id)
    .eq('status', 'watched')
    .order('created_at', { ascending: false })
    .limit(12)

  return (
    <div className="max-w-3xl mx-auto">
      {/* Profile header */}
      <div className="flex items-start gap-5 mb-8">
        <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-3xl text-gray-300 flex-shrink-0">
          {profile.username[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
          {profile.bio && <p className="text-gray-400 mt-1">{profile.bio}</p>}
          <div className="flex gap-5 mt-3 text-sm text-gray-400">
            <span><span className="text-white font-semibold">{watchedCount || 0}</span> watched</span>
            <span><span className="text-white font-semibold">{followerCount || 0}</span> followers</span>
            <span><span className="text-white font-semibold">{followingCount || 0}</span> following</span>
          </div>
          {!isOwnProfile && user && (
            <form action={`/api/follow`} method="POST" className="mt-3">
              <input type="hidden" name="target_id" value={profile.id} />
              <input type="hidden" name="action" value={isFollowing && isFollowing.length > 0 ? 'unfollow' : 'follow'} />
              <button
                type="submit"
                className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isFollowing && isFollowing.length > 0
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {isFollowing && isFollowing.length > 0 ? 'Following' : 'Follow'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Watched shows grid */}
      <h2 className="text-white font-semibold mb-4">Recently Watched</h2>
      {watchedShows && watchedShows.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {watchedShows.map(log => {
            const posterUrl = tmdbImageUrl(log.show_poster_path, 'w185')
            return (
              <Link key={log.id} href={`/shows/${log.tmdb_show_id}`} className="group">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={log.show_title}
                      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center p-2">
                      {log.show_title}
                    </div>
                  )}
                </div>
                {log.overall_score && (
                  <p className="text-gray-400 text-xs text-center mt-1">{log.overall_score.toFixed(1)}</p>
                )}
              </Link>
            )
          })}
        </div>
      ) : (
        <p className="text-gray-500">No shows logged yet.</p>
      )}
    </div>
  )
}
