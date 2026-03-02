import { getTrendingShows, getTopRatedShows, getPopularShows, tmdbImageUrl } from '@/lib/tmdb'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type TMDBResult = { id: number; name: string; poster_path: string | null }

function PosterGrid({ shows }: { shows: TMDBResult[] }) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {shows.map(show => {
        const posterUrl = tmdbImageUrl(show.poster_path, 'w342')
        return (
          <Link key={show.id} href={`/shows/${show.id}`} className="group">
            <div className="aspect-[2/3] overflow-hidden bg-[#f0ede8] border border-[#e0dbd4] rounded-sm group-hover:border-[#7c9e7a] transition-colors">
              {posterUrl ? (
                <img src={posterUrl} alt={show.name} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#6b6560] text-xs text-center p-2">{show.name}</div>
              )}
            </div>
            <p className="text-[#1a1a18] text-xs font-medium mt-1.5 truncate">{show.name}</p>
          </Link>
        )
      })}
    </div>
  )
}

function PosterScroll({ shows }: { shows: TMDBResult[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {shows.map(show => {
        const posterUrl = tmdbImageUrl(show.poster_path, 'w185')
        return (
          <Link key={show.id} href={`/shows/${show.id}`} className="w-24 flex-shrink-0 group">
            <div className="aspect-[2/3] overflow-hidden bg-[#f0ede8] border border-[#e0dbd4] rounded-sm group-hover:border-[#7c9e7a] transition-colors">
              {posterUrl ? (
                <img src={posterUrl} alt={show.name} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#6b6560] text-xs text-center p-2">{show.name}</div>
              )}
            </div>
            <p className="text-[#1a1a18] text-xs font-medium mt-1.5 truncate">{show.name}</p>
          </Link>
        )
      })}
    </div>
  )
}

export default async function DiscoverPage() {
  const [trending, popular, topRated] = await Promise.all([
    getTrendingShows(),
    getPopularShows(),
    getTopRatedShows(),
  ])

  const trendingShows: TMDBResult[] = trending?.results?.slice(0, 18) || []
  const popularShows: TMDBResult[] = popular?.results?.slice(0, 12) || []
  const topRatedShows: TMDBResult[] = topRated?.results?.slice(0, 18) || []

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a18] mb-1">Discover</h1>
        <p className="text-sm text-[#6b6560]">Browse what&apos;s trending, popular, and highly rated.</p>
      </div>

      {trendingShows.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-4">Trending This Week</h2>
          <PosterGrid shows={trendingShows} />
        </section>
      )}

      {popularShows.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-4">Popular Right Now</h2>
          <PosterScroll shows={popularShows} />
        </section>
      )}

      {topRatedShows.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-4">Top Rated All Time</h2>
          <PosterGrid shows={topRatedShows} />
        </section>
      )}
    </div>
  )
}
