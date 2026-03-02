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

  // Get community rating
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

  // Get recent reviews
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
          className="w-full h-48 bg-cover bg-center rounded-xl mb-6 opacity-40"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      )}

      <div className="flex gap-6 mb-8">
        {/* Poster */}
        {posterUrl && (
          <img
            src={posterUrl}
            alt={show.name}
            className="w-32 h-48 object-cover rounded-lg flex-shrink-0 -mt-16 relative z-10 shadow-xl"
          />
        )}

        {/* Show info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-white">{show.name}</h1>
          <p className="text-gray-400 mt-1">
            {show.first_air_date ? new Date(show.first_air_date).getFullYear() : ''}
            {show.number_of_seasons ? ` · ${show.number_of_seasons} seasons` : ''}
          </p>
          <p className="text-gray-300 mt-3 text-sm leading-relaxed">{show.overview}</p>
        </div>
      </div>

      <ShowPageClient show={show} communityAvg={communityAvg} recentLogs={recentLogs || []} />
    </div>
  )
}
