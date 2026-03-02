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

  const [
    { count: loggedCount },
    { count: followerCount },
    { count: followingCount },
    { data: isFollowing },
  ] = await Promise.all([
    supabase.from('show_logs').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
    user ? supabase.from('follows').select('*').eq('follower_id', user.id).eq('following_id', profile.id) : Promise.resolve({ data: [] }),
  ])

  const { data: loggedShows } = await supabase
    .from('show_logs')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(24)

  return (
    <div className="space-y-8">
      {/* Profile header */}
      <div className="border-b border-[#e0dbd4] pb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-[#f0ede8] border border-[#e0dbd4] flex items-center justify-center text-2xl font-bold text-[#6b6560] flex-shrink-0">
            {profile.username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[#1a1a18]">{profile.username}</h1>
            {profile.bio && <p className="text-[#6b6560] mt-1 text-sm">{profile.bio}</p>}
            <div className="flex gap-6 mt-3 text-sm text-[#6b6560]">
              <span><span className="text-[#1a1a18] font-bold">{loggedCount || 0}</span> logged</span>
              <span><span className="text-[#1a1a18] font-bold">{followerCount || 0}</span> followers</span>
              <span><span className="text-[#1a1a18] font-bold">{followingCount || 0}</span> following</span>
            </div>
            {!isOwnProfile && user && (
              <form action="/api/follow" method="POST" className="mt-3">
                <input type="hidden" name="target_id" value={profile.id} />
                <input type="hidden" name="action" value={isFollowing && isFollowing.length > 0 ? 'unfollow' : 'follow'} />
                <button
                  type="submit"
                  className={`px-5 py-1.5 text-sm font-medium transition-colors ${
                    isFollowing && isFollowing.length > 0
                      ? 'border border-[#e0dbd4] text-[#6b6560] hover:border-[#1a1a18] hover:text-[#1a1a18]'
                      : 'bg-[#7c9e7a] hover:bg-[#6a8c68] text-white'
                  }`}
                >
                  {isFollowing && isFollowing.length > 0 ? 'Following' : 'Follow'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Logged shows grid */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-4">Recently Logged</h2>
        {loggedShows && loggedShows.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {loggedShows.map(log => {
              const posterUrl = tmdbImageUrl(log.show_poster_path, 'w185')
              return (
                <Link key={log.id} href={`/shows/${log.tmdb_show_id}`} className="group">
                  <div className="aspect-[2/3] overflow-hidden bg-[#f0ede8] border border-[#e0dbd4] group-hover:border-[#7c9e7a] transition-colors">
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={log.show_title}
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#6b6560] text-xs text-center p-2">
                        {log.show_title}
                      </div>
                    )}
                  </div>
                  {log.overall_score && (
                    <p className="text-[#6b6560] text-xs text-center mt-1">{log.overall_score.toFixed(1)}</p>
                  )}
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-[#6b6560]">No shows logged yet.</p>
        )}
      </section>
    </div>
  )
}
