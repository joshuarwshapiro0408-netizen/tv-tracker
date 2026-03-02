import { Suspense } from 'react'
import { getTrendingShows, tmdbImageUrl } from '@/lib/tmdb'
import LandingPage from '@/components/LandingPage'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const trending = await getTrendingShows().catch(() => null)

  const backdrops: string[] = trending?.results
    ?.filter((s: { backdrop_path: string | null }) => s.backdrop_path)
    ?.slice(0, 6)
    ?.map((s: { backdrop_path: string }) => tmdbImageUrl(s.backdrop_path, 'w1280') as string)
    ?? []

  const posters: { id: number; poster: string | null; name: string }[] = trending?.results
    ?.slice(0, 8)
    ?.map((s: { id: number; poster_path: string | null; name: string }) => ({
      id: s.id,
      poster: tmdbImageUrl(s.poster_path, 'w342'),
      name: s.name,
    }))
    ?? []

  return (
    <Suspense>
      <LandingPage backdrops={backdrops} posters={posters} />
    </Suspense>
  )
}
