import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const trimmed = q.trim()
  let results: { id: string; username: string; bio: string | null }[] | null = null

  if (trimmed.length >= 2) {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, bio')
      .ilike('username', `%${trimmed}%`)
      .limit(20)
    results = data
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a18]">Find People</h1>
        <p className="text-sm text-[#6b6560] mt-1">Search by username and follow profiles you&apos;d like in your feed.</p>
      </div>

      <form>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search usernames…"
          autoFocus
          className="w-full border border-[#1a1a18] bg-[#fafaf7] px-4 py-3 text-[#1a1a18] text-sm placeholder-[#6b6560] focus:outline-none focus:border-[#7c9e7a] transition-colors"
        />
      </form>

      {trimmed.length < 2 && (
        <p className="text-sm text-[#6b6560]">Type at least 2 characters to search.</p>
      )}

      {trimmed.length >= 2 && (
        <div className="divide-y divide-[#e0dbd4] border-t border-b border-[#e0dbd4]">
          {results && results.length > 0 ? (
            results.map(profile => (
              <Link
                key={profile.id}
                href={`/profile/${profile.username}`}
                className="flex items-center justify-between py-3 text-sm hover:bg-[#f0ede8] transition-colors px-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#f0ede8] border border-[#e0dbd4] flex items-center justify-center text-xs font-bold text-[#6b6560]">
                    {profile.username[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1a18]">{profile.username}</p>
                    {profile.bio && (
                      <p className="text-xs text-[#6b6560] line-clamp-1">{profile.bio}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-[#7c9e7a]">View →</span>
              </Link>
            ))
          ) : (
            <p className="py-4 text-sm text-[#6b6560]">No people found for &quot;{trimmed}&quot;.</p>
          )}
        </div>
      )}
    </div>
  )
}
