const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export const tmdbImageUrl = (path: string | null, size = 'w500') => {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

async function tmdbFetch(endpoint: string) {
  const res = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 3600 }, // cache for 1 hour
  })

  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status}`)
  }

  return res.json()
}

export async function searchShows(query: string) {
  return tmdbFetch(`/search/tv?query=${encodeURIComponent(query)}&language=en-US&page=1`)
}

export async function getShow(id: number) {
  return tmdbFetch(`/tv/${id}?language=en-US`)
}

export async function getSeason(showId: number, seasonNumber: number) {
  return tmdbFetch(`/tv/${showId}/season/${seasonNumber}?language=en-US`)
}
