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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-gray-500 text-sm mb-1">
          List by{' '}
          <Link href={`/profile/${list.profiles?.username}`} className="text-blue-400 hover:text-blue-300">
            {list.profiles?.username}
          </Link>
        </p>
        <h1 className="text-3xl font-bold text-white">{list.title}</h1>
        {list.description && <p className="text-gray-400 mt-2">{list.description}</p>}
        <p className="text-gray-500 text-sm mt-2">{sortedItems.length} shows</p>
      </div>

      <div className="space-y-3">
        {sortedItems.map((item: { tmdb_show_id: number; show_poster_path: string | null; show_title: string; position: number }, index: number) => {
          const posterUrl = tmdbImageUrl(item.show_poster_path, 'w92')
          return (
            <Link
              key={item.tmdb_show_id}
              href={`/shows/${item.tmdb_show_id}`}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <span className="text-gray-600 font-bold w-6 text-right flex-shrink-0">{index + 1}</span>
              <div className="w-10 h-14 rounded overflow-hidden bg-gray-800 flex-shrink-0">
                {posterUrl ? (
                  <img src={posterUrl} alt={item.show_title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-700" />
                )}
              </div>
              <span className="text-white font-medium">{item.show_title}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
