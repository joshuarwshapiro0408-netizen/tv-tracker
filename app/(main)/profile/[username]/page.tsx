import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { tmdbImageUrl } from '@/lib/tmdb'
import Link from 'next/link'
import ProfileTabs from './ProfileTabs'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  return { title: `${username} — trakr` }
}

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
    .select('id, username, bio, avatar_url, favourite_genres')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const isOwnProfile = user?.id === profile.id

  const [
    { count: loggedCount },
    { count: followerCount },
    { count: followingCount },
    { count: reviewCount },
    { count: listCount },
    { data: isFollowing },
  ] = await Promise.all([
    supabase.from('show_logs').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
    supabase.from('show_logs').select('*', { count: 'exact', head: true }).eq('user_id', profile.id).not('review', 'is', null),
    supabase.from('lists').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
    user
      ? supabase.from('follows').select('*').eq('follower_id', user.id).eq('following_id', profile.id)
      : Promise.resolve({ data: [] }),
  ])

  // Fetch data for all tabs
  const [
    { data: loggedShows },
    { data: reviews },
    { data: lists },
  ] = await Promise.all([
    supabase
      .from('show_logs')
      .select('tmdb_show_id, show_title, show_poster_path, overall_score, created_at')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(48),
    supabase
      .from('show_logs')
      .select('id, tmdb_show_id, show_title, show_poster_path, overall_score, story_score, performance_score, visuals_score, review, date_watched, created_at')
      .eq('user_id', profile.id)
      .not('review', 'is', null)
      .order('created_at', { ascending: false })
      .limit(24),
    supabase
      .from('lists')
      .select('*, list_items(tmdb_show_id, show_poster_path, show_title, position)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false }),
  ])

  const favouriteGenres: string[] = (profile as { favourite_genres?: string[] }).favourite_genres ?? []

  return (
    <div className="space-y-8">
      {/* Profile header */}
      <div className="border-b border-[#e0dbd4] pb-7">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-[#f0ede8] border border-[#e0dbd4] overflow-hidden flex items-center justify-center text-3xl font-bold text-[#6b6560] flex-shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              profile.username[0].toUpperCase()
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[#1a1a18]">{profile.username}</h1>
              {isOwnProfile && (
                <Link
                  href="/profile/edit"
                  className="text-xs text-[#6b6560] hover:text-[#1a1a18] border border-[#e0dbd4] px-2.5 py-1 transition-colors hover:border-[#1a1a18]"
                >
                  edit profile
                </Link>
              )}
            </div>

            {profile.bio && (
              <p className="text-[#6b6560] mt-1.5 text-sm leading-relaxed">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-5 mt-3 text-sm text-[#6b6560] flex-wrap">
              <span><span className="text-[#1a1a18] font-bold">{loggedCount || 0}</span> shows</span>
              <span><span className="text-[#1a1a18] font-bold">{reviewCount || 0}</span> reviews</span>
              <span><span className="text-[#1a1a18] font-bold">{listCount || 0}</span> lists</span>
              <span><span className="text-[#1a1a18] font-bold">{followerCount || 0}</span> followers</span>
              <span><span className="text-[#1a1a18] font-bold">{followingCount || 0}</span> following</span>
            </div>

            {/* Follow button */}
            {!isOwnProfile && user && (
              <form action="/api/follow" method="POST" className="mt-3">
                <input type="hidden" name="target_id" value={profile.id} />
                <input type="hidden" name="action" value={isFollowing && isFollowing.length > 0 ? 'unfollow' : 'follow'} />
                <button
                  type="submit"
                  className={`px-5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    isFollowing && isFollowing.length > 0
                      ? 'border border-[#e0dbd4] text-[#6b6560] hover:border-[#1a1a18] hover:text-[#1a1a18]'
                      : 'bg-[#7c9e7a] hover:bg-[#6a8c68] text-white'
                  }`}
                >
                  {isFollowing && isFollowing.length > 0 ? 'following' : 'follow'}
                </button>
              </form>
            )}

            {/* Genre chips */}
            {favouriteGenres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {favouriteGenres.map(g => (
                  <span key={g} className="text-[10px] text-[#6b6560] border border-[#e0dbd4] px-2 py-0.5 bg-[#f5f2ed] uppercase tracking-wide">
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Complete profile nudge — own profile with no bio */}
            {isOwnProfile && !profile.bio && (
              <div className="mt-3 flex items-center gap-2 text-xs text-[#6b6560] bg-[#f0ede8] border border-[#e0dbd4] px-3 py-2">
                <svg className="w-3.5 h-3.5 flex-shrink-0 text-[#7c9e7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Add a bio and favourite genres to complete your profile.</span>
                <Link href="/profile/edit" className="text-[#7c9e7a] font-semibold hover:underline ml-auto flex-shrink-0">
                  Edit →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ProfileTabs
        loggedShows={loggedShows || []}
        reviews={reviews || []}
        lists={lists || []}
      />
    </div>
  )
}
