import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getShow, tmdbImageUrl } from '@/lib/tmdb'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Lists — trakr' }

type ListItem = {
  tmdb_show_id: number
  show_poster_path: string | null
  show_title: string
  position: number
}

export default async function ListsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: lists } = await supabase
    .from('lists')
    .select('id, title, description, is_public, created_at, profiles(username), list_items(tmdb_show_id, show_poster_path, show_title, position)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  // Backfill missing poster paths from TMDB (for seed data where show_poster_path is null)
  // Only fetch for the first 4 items per list (the collage thumbnails)
  const needPosters = new Set<number>()
  for (const list of lists || []) {
    const items = (list.list_items as ListItem[] | null) || []
    for (const item of [...items].sort((a, b) => a.position - b.position).slice(0, 4)) {
      if (!item.show_poster_path && item.tmdb_show_id) {
        needPosters.add(item.tmdb_show_id)
      }
    }
  }

  const posterMap = new Map<number, string | null>()
  if (needPosters.size > 0) {
    const results = await Promise.all(
      Array.from(needPosters).map(async id => {
        try {
          const show = await getShow(id)
          return { id, poster_path: (show.poster_path as string | null) || null }
        } catch {
          return { id, poster_path: null }
        }
      })
    )
    results.forEach(r => posterMap.set(r.id, r.poster_path))
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-[#e0dbd4] pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-1">browse</p>
        <h1 className="text-3xl font-bold text-[#1a1a18] mb-3">Lists</h1>
        <p className="text-sm text-[#6b6560] leading-relaxed max-w-lg">
          Curated collections from the trakr community — from prestige drama to guilty pleasures.
        </p>
        {user && (
          <Link
            href="/lists/new"
            className="inline-block mt-4 bg-[#7c9e7a] hover:bg-[#6a8c68] text-white px-5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors"
          >
            + Create a List
          </Link>
        )}
      </div>

      {/* Early community note */}
      <div className="bg-[#f0ede8] border border-[#e0dbd4] px-5 py-4 flex items-start gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#7c9e7a] mt-1.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-[#1a1a18] mb-0.5">trakr editorial picks</p>
          <p className="text-xs text-[#6b6560] leading-relaxed">
            These lists are curated by us while the community gets started. As more people join, you&apos;ll see lists from people you follow right here.{' '}
            {!user && (
              <>
                <Link href="/login?form=signup" className="text-[#7c9e7a] hover:underline font-medium">
                  Create an account
                </Link>
                {' '}to share yours.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Lists grid */}
      {!lists || lists.length === 0 ? (
        <div className="py-8">
          <p className="text-sm text-[#6b6560] mb-3">No lists yet.</p>
          {user && (
            <Link href="/lists/new" className="text-[#7c9e7a] text-sm hover:underline font-semibold">
              Be the first — create a list →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map(list => {
            const items = [...((list.list_items as ListItem[] | null) || [])]
              .sort((a, b) => a.position - b.position)
              .slice(0, 4)
            return (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                className="group border border-[#e0dbd4] hover:border-[#7c9e7a] transition-colors bg-[#fafaf7]"
              >
                {/* 4-poster collage */}
                <div className="grid grid-cols-4 border-b border-[#e0dbd4]">
                  {[0, 1, 2, 3].map(i => {
                    const item = items[i]
                    const rawPath = item?.show_poster_path || (item ? posterMap.get(item.tmdb_show_id) : null) || null
                    const url = rawPath ? tmdbImageUrl(rawPath, 'w92') : null
                    return (
                      <div key={i} className="aspect-[2/3] overflow-hidden bg-[#f0ede8]">
                        {url ? (
                          <img src={url} alt="" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                        ) : (
                          <div className="w-full h-full bg-[#e8e3dc] flex items-center justify-center">
                            {item && (
                              <span className="text-[8px] text-[#6b6560] text-center px-0.5 leading-tight font-medium">
                                {item.show_title?.split(' ').map((w: string) => w[0]).join('').slice(0, 3)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-[#1a1a18] truncate group-hover:text-[#7c9e7a] transition-colors">
                    {list.title}
                  </p>
                  {list.description && (
                    <p className="text-xs text-[#6b6560] mt-0.5 line-clamp-2 leading-relaxed">{list.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-[#6b6560]">
                      {(list.list_items as ListItem[] | null)?.length || 0} shows
                    </p>
                    {(list.profiles as unknown as { username: string } | null)?.username && (
                      <p className="text-[10px] text-[#6b6560] truncate ml-2">
                        by {(list.profiles as unknown as { username: string }).username}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
