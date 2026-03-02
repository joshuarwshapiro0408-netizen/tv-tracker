import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { tmdbImageUrl } from '@/lib/tmdb'
import Link from 'next/link'

export default async function ListPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: list } = await supabase
    .from('lists')
    .select('*, profiles(username), list_items(*, position)')
    .eq('id', id)
    .single()

  if (!list) notFound()

  const sortedItems = list.list_items?.sort((a: { position: number }, b: { position: number }) => a.position - b.position) || []

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-[#e0dbd4] pb-6">
        <p className="text-[#6b6560] text-sm mb-1">
          List by{' '}
          <Link href={`/profile/${list.profiles?.username}`} className="text-[#7c9e7a] hover:underline">
            {list.profiles?.username}
          </Link>
        </p>
        <h1 className="text-2xl font-bold text-[#1a1a18]">{list.title}</h1>
        {list.description && <p className="text-[#6b6560] mt-2 text-sm">{list.description}</p>}
        <p className="text-[#6b6560] text-xs mt-2">{sortedItems.length} {sortedItems.length === 1 ? 'show' : 'shows'}</p>
      </div>

      <div className="divide-y divide-[#e0dbd4]">
        {sortedItems.map((item: { tmdb_show_id: number; show_poster_path: string | null; show_title: string; position: number }, index: number) => {
          const posterUrl = tmdbImageUrl(item.show_poster_path, 'w92')
          return (
            <Link
              key={item.tmdb_show_id}
              href={`/shows/${item.tmdb_show_id}`}
              className="flex items-center gap-4 py-3 hover:bg-[#f0ede8] transition-colors px-1"
            >
              <span className="text-[#6b6560] font-bold w-6 text-right flex-shrink-0 text-sm">{index + 1}</span>
              <div className="w-10 h-14 overflow-hidden bg-[#f0ede8] border border-[#e0dbd4] rounded-sm flex-shrink-0">
                {posterUrl ? (
                  <img src={posterUrl} alt={item.show_title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#e0dbd4]" />
                )}
              </div>
              <span className="text-[#1a1a18] font-medium text-sm">{item.show_title}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
