import { getShow, getSimilarShows, getShowExternalIds, tmdbImageUrl } from '@/lib/tmdb'
import { createClient } from '@/lib/supabase/server'
import ShowPageClient from './ShowPageClient'

export default async function ShowPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const showId = Number(id)

  const [show, similar, externalIds, supabase] = await Promise.all([
    getShow(showId),
    getSimilarShows(showId).catch(() => null),
    getShowExternalIds(showId).catch(() => null),
    createClient(),
  ])

  const { data: communityLogs } = await supabase
    .from('show_logs')
    .select('overall_score, story_score, performance_score, visuals_score')
    .eq('tmdb_show_id', showId)
    .not('overall_score', 'is', null)

  const communityAvg = communityLogs && communityLogs.length > 0
    ? {
        overall: communityLogs.reduce((s, l) => s + (l.overall_score || 0), 0) / communityLogs.length,
        story: communityLogs.reduce((s, l) => s + (l.story_score || 0), 0) / communityLogs.length,
        performance: communityLogs.reduce((s, l) => s + (l.performance_score || 0), 0) / communityLogs.length,
        visuals: communityLogs.reduce((s, l) => s + (l.visuals_score || 0), 0) / communityLogs.length,
        count: communityLogs.length,
      }
    : null

  const { data: recentLogs } = await supabase
    .from('show_logs')
    .select('*, profiles(username, avatar_url)')
    .eq('tmdb_show_id', showId)
    .not('review', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)

  const backdropUrl = tmdbImageUrl(show.backdrop_path, 'w1280')
  const posterUrl = tmdbImageUrl(show.poster_path, 'w342')
  const similarShows = similar?.results?.slice(0, 12) || []
  const imdbId: string | null = externalIds?.imdb_id || null

  return (
    <div className="-mx-4 -mt-8">
      {/* Full-width backdrop */}
      {backdropUrl && (
        <div className="relative w-full h-52 md:h-72 overflow-hidden">
          <img src={backdropUrl} alt={show.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#fafaf7]/20 to-[#fafaf7]" />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4">
        {/* Poster + info row */}
        <div className={`flex gap-6 ${backdropUrl ? '-mt-20 relative z-10' : 'mt-8'} mb-8`}>
          {posterUrl && (
            <img
              src={posterUrl}
              alt={show.name}
              className="w-28 md:w-40 flex-shrink-0 border border-[#e0dbd4] object-cover shadow-sm"
              style={{ aspectRatio: '2/3' }}
            />
          )}
          <div className={`flex-1 min-w-0 ${backdropUrl ? 'pt-24' : ''}`}>
            {/* Genres */}
            {show.genres && show.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {show.genres.map((g: { id: number; name: string }) => (
                  <span key={g.id} className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 border border-[#e0dbd4] text-[#6b6560] bg-[#f5f2ed]">
                    {g.name}
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-2xl md:text-4xl font-bold text-[#1a1a18] leading-tight">{show.name}</h1>
            <p className="text-sm text-[#6b6560] mt-1">
              {show.first_air_date ? new Date(show.first_air_date).getFullYear() : ''}
              {show.number_of_seasons ? ` · ${show.number_of_seasons} season${show.number_of_seasons !== 1 ? 's' : ''}` : ''}
              {show.status ? ` · ${show.status}` : ''}
            </p>
            <p className="text-sm text-[#1a1a18] mt-3 leading-relaxed line-clamp-4 md:line-clamp-none max-w-2xl">
              {show.overview}
            </p>

            {/* Rating row */}
            <div className="flex items-center gap-4 mt-4 text-xs text-[#6b6560]">
              {show.vote_average > 0 && (
                <span>
                  TMDB{' '}
                  <span className="text-[#1a1a18] font-bold">{show.vote_average.toFixed(1)}</span>
                </span>
              )}
              {imdbId && (
                <a
                  href={`https://www.imdb.com/title/${imdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7c9e7a] font-semibold hover:underline"
                >
                  IMDB ↗
                </a>
              )}
              {communityAvg && (
                <span>
                  trakr{' '}
                  <span className="text-[#1a1a18] font-bold">{communityAvg.overall.toFixed(1)}</span>
                  <span className="text-[#6b6560]"> ({communityAvg.count})</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Client section: log button + tabs */}
        <ShowPageClient
          show={show}
          communityAvg={communityAvg}
          recentLogs={recentLogs || []}
          similarShows={similarShows}
        />
      </div>
    </div>
  )
}
