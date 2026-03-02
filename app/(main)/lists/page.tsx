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

// Hardcoded editorial lists — always present, always fresh TMDB posters
const EDITORIAL_LISTS = [
  {
    title: 'Essential Crime TV',
    desc: 'The shows that defined a genre.',
    ids: [1396, 1438, 1398, 46952, 60574], // Breaking Bad, The Wire, The Sopranos, Narcos, Mindhunter
  },
  {
    title: "Can't Stop Watching",
    desc: 'Once you start, you cannot stop.',
    ids: [63174, 136320, 95396, 110316, 87108], // Succession, The Bear, Severance, White Lotus, Euphoria
  },
  {
    title: 'Prestige Drama',
    desc: 'Slow, rich, unforgettable.',
    ids: [1104, 15260, 65494, 44217, 79696], // Mad Men, The Crown, Better Call Saul, The Good Place, Fleabag
  },
  {
    title: 'Sci-Fi Must-Sees',
    desc: 'Ideas that linger for days.',
    ids: [42009, 63247, 70785, 67915, 66732], // Black Mirror, Westworld, Dark, Stranger Things, Altered Carbon
  },
  {
    title: 'Best Comedies',
    desc: 'Actually funny, every time.',
    ids: [1400, 2316, 6473, 2190, 84958], // Seinfeld, The Office US, Parks & Rec, It's Always Sunny, Ted Lasso
  },
  {
    title: 'Hidden Gems',
    desc: 'Underseen. Unforgotten.',
    ids: [62560, 61334, 66788, 73586, 94605], // Halt & Catch Fire, The Leftovers, Rectify, Justified, Detectorists
  },
  {
    title: 'Reality That Hooks You',
    desc: 'Guilty? Never.',
    ids: [14436, 34038, 1486, 61818, 16461], // Survivor, RuPaul's Drag Race, Amazing Race, Great British Bake Off, Top Chef
  },
]

export default async function ListsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch editorial list posters from TMDB (all unique IDs)
  const editorialIds = [...new Set(EDITORIAL_LISTS.flatMap(l => l.ids.slice(0, 4)))]
  const editorialPosterMap = new Map<number, string | null>()
  await Promise.all(
    editorialIds.map(async id => {
      try {
        const show = await getShow(id)
        editorialPosterMap.set(id, show.poster_path || null)
      } catch {
        editorialPosterMap.set(id, null)
      }
    })
  )

  // Fetch community lists from DB
  const { data: lists } = await supabase
    .from('lists')
    .select('id, title, description, is_public, created_at, profiles(username), list_items(tmdb_show_id, show_poster_path, show_title, position)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  // Backfill missing poster paths for DB list items
  const needPosters = new Set<number>()
  for (const list of lists || []) {
    const items = (list.list_items as ListItem[] | null) || []
    for (const item of [...items].sort((a, b) => a.position - b.position).slice(0, 4)) {
      if (!item.show_poster_path && item.tmdb_show_id) {
        needPosters.add(item.tmdb_show_id)
      }
    }
  }
  const dbPosterMap = new Map<number, string | null>()
  if (needPosters.size > 0) {
    await Promise.all(
      Array.from(needPosters).map(async id => {
        try {
          const show = await getShow(id)
          dbPosterMap.set(id, show.poster_path || null)
        } catch {
          dbPosterMap.set(id, null)
        }
      })
    )
  }

  // Filter out editorial lists from DB lists (they're already shown above)
  const communityLists = (lists || []).filter(
    l => !(l.profiles as unknown as { username: string } | null)?.username?.startsWith('trakr')
  )

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-[#e0dbd4] pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-1">browse</p>
        <h1 className="text-3xl font-bold text-[#1a1a18] mb-3">Lists</h1>
        <p className="text-sm text-[#6b6560] leading-relaxed max-w-lg">
          Curated collections from the trakr team and community — from prestige drama to guilty pleasures.
        </p>
        {user && (
          <Link
            href="/lists/new"
            className="inline-block mt-4 bg-[#7c9e7a] hover:bg-[#6a8c68] active:scale-95 text-white px-5 py-2 text-xs font-semibold uppercase tracking-wide transition-all"
          >
            + Create a List
          </Link>
        )}
      </div>

      {/* trakr Editorial Picks */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b6560]">trakr Picks</h2>
          <span className="text-[11px] text-[#6b6560] italic">curated by us</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EDITORIAL_LISTS.map(list => {
            const first4 = list.ids.slice(0, 4)
            return (
              <div key={list.title} className="border border-[#e0dbd4] bg-[#fafaf7] hover:border-[#7c9e7a] transition-colors group cursor-default">
                {/* 4-poster collage */}
                <div className="grid grid-cols-4 border-b border-[#e0dbd4]">
                  {[0, 1, 2, 3].map(i => {
                    const id = first4[i]
                    const path = id ? editorialPosterMap.get(id) : null
                    const url = path ? tmdbImageUrl(path, 'w92') : null
                    return (
                      <div key={i} className="aspect-[2/3] overflow-hidden bg-[#f0ede8]">
                        {url ? (
                          <img src={url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                        ) : (
                          <div className="w-full h-full bg-[#e8e3dc]" />
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-[#1a1a18] truncate">{list.title}</p>
                  <p className="text-xs text-[#6b6560] mt-0.5 leading-relaxed">{list.desc}</p>
                  <p className="text-[10px] text-[#6b6560] mt-2">{list.ids.length} shows · trakr editorial</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Community lists */}
      {communityLists.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b6560] mb-5 pb-2 border-b border-[#e0dbd4]">
            From the Community
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {communityLists.map(list => {
              const items = [...((list.list_items as ListItem[] | null) || [])]
                .sort((a, b) => a.position - b.position)
                .slice(0, 4)
              return (
                <Link
                  key={list.id}
                  href={`/lists/${list.id}`}
                  className="group border border-[#e0dbd4] hover:border-[#7c9e7a] transition-colors bg-[#fafaf7]"
                >
                  <div className="grid grid-cols-4 border-b border-[#e0dbd4]">
                    {[0, 1, 2, 3].map(i => {
                      const item = items[i]
                      const rawPath = item?.show_poster_path || (item ? dbPosterMap.get(item.tmdb_show_id) : null) || null
                      const url = rawPath ? tmdbImageUrl(rawPath, 'w92') : null
                      return (
                        <div key={i} className="aspect-[2/3] overflow-hidden bg-[#f0ede8]">
                          {url ? (
                            <img src={url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
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
        </section>
      )}

      {communityLists.length === 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b6560] mb-5 pb-2 border-b border-[#e0dbd4]">
            From the Community
          </h2>
          <div className="py-8 border border-dashed border-[#e0dbd4] text-center bg-[#fafaf7]">
            <p className="text-sm font-semibold text-[#1a1a18] mb-1">No community lists yet</p>
            <p className="text-xs text-[#6b6560] mb-4">Be the first to share a list with the community.</p>
            {user ? (
              <Link href="/lists/new" className="text-xs font-semibold text-[#7c9e7a] hover:underline uppercase tracking-wide">
                Create a List →
              </Link>
            ) : (
              <Link href="/login?form=signup" className="text-xs font-semibold text-[#7c9e7a] hover:underline uppercase tracking-wide">
                Join trakr →
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
