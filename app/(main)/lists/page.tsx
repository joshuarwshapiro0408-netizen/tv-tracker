import { createClient } from '@/lib/supabase/server'
import { tmdbImageUrl } from '@/lib/tmdb'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ListsPage() {
  const supabase = await createClient()

  const { data: lists } = await supabase
    .from('lists')
    .select('*, profiles(username), list_items(tmdb_show_id, show_poster_path, show_title, position)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(24)

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-[#e0dbd4] pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-1">browse</p>
        <h1 className="text-3xl font-bold text-[#1a1a18] mb-3">Lists</h1>
        <p className="text-sm text-[#6b6560] max-w-lg leading-relaxed">
          Collect, curate, and share. Lists are the perfect way to group shows around a theme or mood.
        </p>
        <Link
          href="/lists/new"
          className="inline-block mt-5 bg-[#7c9e7a] hover:bg-[#6a8c68] text-white px-5 py-2 text-xs font-semibold tracking-wide uppercase transition-colors"
        >
          Start Your Own List
        </Link>
      </div>

      {/* All public lists */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-5">
          Featured Lists
        </h2>
        {lists && lists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {lists.map(list => {
              const items = [...(list.list_items || [])]
                .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
                .slice(0, 4)
              const itemCount = list.list_items?.length || 0
              return (
                <Link
                  key={list.id}
                  href={`/lists/${list.id}`}
                  className="group border border-[#e0dbd4] bg-[#fafaf7] hover:border-[#7c9e7a] transition-colors"
                >
                  {/* Poster collage */}
                  <div className="grid grid-cols-4 border-b border-[#e0dbd4]">
                    {[0, 1, 2, 3].map(i => {
                      const item = items[i]
                      const posterUrl = item ? tmdbImageUrl(item.show_poster_path, 'w185') : null
                      return (
                        <div key={i} className="aspect-[2/3] overflow-hidden bg-[#f0ede8]">
                          {posterUrl
                            ? <img src={posterUrl} alt={item.show_title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                            : <div className="w-full h-full bg-[#e8e3dc]" />}
                        </div>
                      )
                    })}
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold text-[#1a1a18] truncate">{list.title}</p>
                    <p className="text-xs text-[#6b6560] mt-0.5">
                      {itemCount} {itemCount === 1 ? 'show' : 'shows'} · by{' '}
                      <span className="text-[#7c9e7a]">{list.profiles?.username}</span>
                    </p>
                    {list.description && (
                      <p className="text-xs text-[#6b6560] mt-1 line-clamp-2">{list.description}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 border border-[#e0dbd4] bg-[#f5f2ed]">
            <p className="text-sm text-[#6b6560] mb-4">No public lists yet.</p>
            <Link href="/lists/new" className="text-[#7c9e7a] text-sm font-medium hover:underline">
              Be the first to create one →
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
