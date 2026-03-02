import { getShow, tmdbImageUrl } from '@/lib/tmdb'
import { createClient } from '@/lib/supabase/server'
import ShowPageClient from './ShowPageClient'

export default async function ShowPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const show = await getShow(Number(id))
  const supabase = await createClient()

  const { data: communityLogs } = await supabase
    .from('show_logs')
    .select('overall_score, story_score, performance_score, visuals_score')
    .eq('tmdb_show_id', Number(id))
    .not('overall_score', 'is', null)

  const communityAvg = communityLogs && communityLogs.length > 0
    ? {
        overall: communityLogs.reduce((sum, l) => sum + (l.overall_score || 0), 0) / communityLogs.length,
        story: communityLogs.reduce((sum, l) => sum + (l.story_score || 0), 0) / communityLogs.length,
        performance: communityLogs.reduce((sum, l) => sum + (l.performance_score || 0), 0) / communityLogs.length,
        visuals: communityLogs.reduce((sum, l) => sum + (l.visuals_score || 0), 0) / communityLogs.length,
        count: communityLogs.length,
      }
    : null

  const { data: recentLogs } = await supabase
    .from('show_logs')
    .select('*, profiles(username, avatar_url)')
    .eq('tmdb_show_id', Number(id))
    .not('review', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)

  const backdropUrl = tmdbImageUrl(show.backdrop_path, 'w1280')
  const posterUrl = tmdbImageUrl(show.poster_path, 'w342')

  return (
    <div>
      {/* Backdrop */}
      {backdropUrl && (
        <div
          className="w-full h-56 md:h-72 bg-cover bg-center mb-0 -mx-4 md:mx-0"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      )}

      {/* Poster + info row */}
      <div className={`flex gap-6 mb-8 ${backdropUrl ? '-mt-16 relative z-10' : 'mt-0'}`}>
        {posterUrl && (
          <img
            src={posterUrl}
            alt={show.name}
            className="w-28 md:w-36 flex-shrink-0 border border-[#e0dbd4] object-cover self-end"
            style={{ aspectRatio: '2/3' }}
          />
        )}
        <div className={`flex-1 min-w-0 ${backdropUrl ? 'pt-20' : ''}`}>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a18]">{show.name}</h1>
          <p className="text-[#6b6560] mt-1 text-sm">
            {show.first_air_date ? new Date(show.first_air_date).getFullYear() : ''}
            {show.number_of_seasons ? ` · ${show.number_of_seasons} season${show.number_of_seasons !== 1 ? 's' : ''}` : ''}
            {show.status ? ` · ${show.status}` : ''}
          </p>
          <p className="text-[#1a1a18] mt-3 text-sm leading-relaxed line-clamp-4 md:line-clamp-none">{show.overview}</p>
        </div>
      </div>

      <ShowPageClient show={show} communityAvg={communityAvg} recentLogs={recentLogs || []} />
    </div>
  )
}
