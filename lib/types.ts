export type Profile = {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export type ShowLog = {
  id: string
  user_id: string
  tmdb_show_id: number
  show_title: string
  show_poster_path: string | null
  status: 'watched' | 'watching' | 'want_to_watch'
  story_score: number | null
  performance_score: number | null
  visuals_score: number | null
  overall_score: number | null
  review: string | null
  date_watched: string | null
  created_at: string
  profiles?: Profile
}

export type SeasonLog = {
  id: string
  user_id: string
  tmdb_show_id: number
  season_number: number
  show_title: string
  show_poster_path: string | null
  story_score: number | null
  performance_score: number | null
  visuals_score: number | null
  overall_score: number | null
  review: string | null
  date_watched: string | null
  created_at: string
}

export type EpisodeLog = {
  id: string
  user_id: string
  tmdb_show_id: number
  season_number: number
  episode_number: number
  episode_title: string | null
  show_title: string
  show_poster_path: string | null
  story_score: number | null
  performance_score: number | null
  visuals_score: number | null
  overall_score: number | null
  review: string | null
  date_watched: string | null
  created_at: string
}

export type List = {
  id: string
  user_id: string
  title: string
  description: string | null
  is_public: boolean
  created_at: string
  profiles?: Profile
  list_items?: ListItem[]
}

export type ListItem = {
  id: string
  list_id: string
  tmdb_show_id: number
  show_title: string
  show_poster_path: string | null
  position: number
}

// TMDB API types
export type TMDBShow = {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  genre_ids?: number[]
  genres?: { id: number; name: string }[]
  number_of_seasons?: number
  number_of_episodes?: number
  status?: string
}

export type TMDBSeason = {
  id: number
  season_number: number
  name: string
  overview: string
  poster_path: string | null
  air_date: string
  episode_count: number
  episodes?: TMDBEpisode[]
}

export type TMDBEpisode = {
  id: number
  episode_number: number
  season_number: number
  name: string
  overview: string
  still_path: string | null
  air_date: string
  vote_average: number
}
