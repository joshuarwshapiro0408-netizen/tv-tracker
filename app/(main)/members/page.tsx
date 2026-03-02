import { createClient } from '@/lib/supabase/server'
import { tmdbImageUrl } from '@/lib/tmdb'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MembersPage() {
  const supabase = await createClient()

  const { data: members } = await supabase
    .from('profiles')
    .select('id, username, bio, avatar_url')
    .order('created_at', { ascending: false })
    .limit(48)

  // For each member, fetch log count and last 4 posters
  const memberData = await Promise.all(
    (members || []).map(async (m: { id: string; username: string; bio: string | null; avatar_url: string | null }) => {
      const [{ count }, { data: recentLogs }] = await Promise.all([
        supabase
          .from('show_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', m.id),
        supabase
          .from('show_logs')
          .select('show_poster_path, show_title, tmdb_show_id')
          .eq('user_id', m.id)
          .order('created_at', { ascending: false })
          .limit(4),
      ])
      return { ...m, logCount: count || 0, recentPosters: recentLogs || [] }
    })
  )

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-[#e0dbd4] pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-1">browse</p>
        <h1 className="text-3xl font-bold text-[#1a1a18] mb-3">Members</h1>
        <p className="text-sm text-[#6b6560] leading-relaxed">
          TV lovers, critics and friends — find people to follow.
        </p>
      </div>

      {/* Member grid */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-5">
          All Members
        </h2>
        {memberData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {memberData.map(member => (
              <Link
                key={member.id}
                href={`/profile/${member.username}`}
                className="group border border-[#e0dbd4] bg-[#fafaf7] hover:border-[#7c9e7a] transition-colors p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-[#f0ede8] border border-[#e0dbd4] overflow-hidden flex items-center justify-center text-lg font-bold text-[#6b6560] flex-shrink-0">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.username} className="w-full h-full object-cover" />
                    ) : (
                      member.username[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-[#1a1a18] group-hover:text-[#7c9e7a] transition-colors truncate">
                      {member.username}
                    </p>
                    {member.bio && (
                      <p className="text-xs text-[#6b6560] line-clamp-1 mt-0.5">{member.bio}</p>
                    )}
                    <p className="text-[11px] text-[#6b6560] mt-1">
                      <span className="font-semibold text-[#1a1a18]">{member.logCount}</span> logged
                    </p>
                  </div>
                </div>

                {/* Last 4 posters */}
                {member.recentPosters.length > 0 && (
                  <div className="flex gap-1.5 mt-3">
                    {member.recentPosters.map((log: { tmdb_show_id: number; show_poster_path: string | null; show_title: string }, i: number) => {
                      const posterUrl = tmdbImageUrl(log.show_poster_path, 'w92')
                      return (
                        <div key={i} className="w-10 h-14 overflow-hidden bg-[#f0ede8] border border-[#e0dbd4]">
                          {posterUrl
                            ? <img src={posterUrl} alt={log.show_title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-[#e0dbd4]" />}
                        </div>
                      )
                    })}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6b6560] py-8">No members yet.</p>
        )}
      </section>
    </div>
  )
}
