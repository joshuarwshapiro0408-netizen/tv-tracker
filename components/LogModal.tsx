'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import RatingInput from '@/components/RatingInput'
import { TMDBShow, TMDBSeason, TMDBEpisode } from '@/lib/types'

type ExistingLog = {
  id: string
  story_score: number | null
  performance_score: number | null
  visuals_score: number | null
  review: string | null
  date_watched: string | null
  status: string
}

type LogModalProps = {
  show: TMDBShow
  onClose: () => void
  onSaved: () => void
  existingLog?: ExistingLog
}

type Level = 'show' | 'season' | 'episode'
type Status = 'watched' | 'watching' | 'want_to_watch'

export default function LogModal({ show, onClose, onSaved, existingLog }: LogModalProps) {
  const [level, setLevel] = useState<Level>('show')
  const [status, setStatus] = useState<Status>((existingLog?.status as Status) ?? 'watched')
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null)
  const [seasons, setSeasons] = useState<TMDBSeason[]>([])
  const [episodes, setEpisodes] = useState<TMDBEpisode[]>([])
  const [story, setStory] = useState<number | null>(existingLog?.story_score ?? null)
  const [performance, setPerformance] = useState<number | null>(existingLog?.performance_score ?? null)
  const [visuals, setVisuals] = useState<number | null>(existingLog?.visuals_score ?? null)
  const [review, setReview] = useState(existingLog?.review ?? '')
  const [dateWatched, setDateWatched] = useState(existingLog?.date_watched ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (existingLog) return // Edit mode: don't need season/episode data
    fetch(`/api/tmdb/show/${show.id}`)
      .then(r => r.json())
      .then(data => {
        const filtered = (data.seasons as TMDBSeason[] | undefined)?.filter(s => s.season_number > 0) ?? []
        setSeasons(filtered)
      })
      .catch(() => {})
  }, [show.id])

  useEffect(() => {
    if (selectedSeason === null) {
      setEpisodes([])
      return
    }
    fetch(`/api/tmdb/season/${show.id}/${selectedSeason}`)
      .then(r => r.json())
      .then(data => {
        setEpisodes((data.episodes as TMDBEpisode[] | undefined) ?? [])
      })
      .catch(() => {})
  }, [show.id, selectedSeason])

  const overallScore =
    story !== null && performance !== null && visuals !== null
      ? Math.round(((story + performance + visuals) / 3) * 10) / 10
      : null

  async function handleSave() {
    setSaving(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to log a show.')
      setSaving(false)
      return
    }

    const baseData = {
      user_id: user.id,
      tmdb_show_id: show.id,
      show_title: show.name,
      show_poster_path: show.poster_path ?? null,
      story_score: story,
      performance_score: performance,
      visuals_score: visuals,
      review: review || null,
      date_watched: dateWatched || null,
    }

    let err = null

    // Edit mode: update by ID
    if (existingLog) {
      const { error: e } = await supabase
        .from('show_logs')
        .update({
          story_score: story,
          performance_score: performance,
          visuals_score: visuals,
          review: review || null,
          date_watched: dateWatched || null,
          status,
        })
        .eq('id', existingLog.id)
      err = e
    } else if (level === 'show') {
      const { error: e } = await supabase
        .from('show_logs')
        .upsert({ ...baseData, status }, { onConflict: 'user_id,tmdb_show_id' })
      err = e
    } else if (level === 'season') {
      if (selectedSeason === null) {
        setError('Please select a season.')
        setSaving(false)
        return
      }
      const { error: e } = await supabase
        .from('season_logs')
        .upsert({ ...baseData, season_number: selectedSeason }, { onConflict: 'user_id,tmdb_show_id,season_number' })
      err = e
    } else {
      if (selectedSeason === null || selectedEpisode === null) {
        setError('Please select a season and episode.')
        setSaving(false)
        return
      }
      const ep = episodes.find(e => e.episode_number === selectedEpisode)
      const { error: e } = await supabase
        .from('episode_logs')
        .upsert(
          {
            ...baseData,
            season_number: selectedSeason,
            episode_number: selectedEpisode,
            episode_title: ep?.name ?? null,
          },
          { onConflict: 'user_id,tmdb_show_id,season_number,episode_number' }
        )
      err = e
    }

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40">
      <div className="bg-[#fafaf7] w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-[#e0dbd4]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e0dbd4]">
          <div className="truncate pr-4">
            {existingLog && <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c9e7a] mb-0.5">Editing log</p>}
            <h2 className="text-[#1a1a18] font-semibold text-base truncate">{show.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b6560] hover:text-[#1a1a18] transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Log as toggle — hidden in edit mode */}
          {!existingLog && <div>
            <p className="text-[#6b6560] text-xs uppercase tracking-wide mb-2">Log as</p>
            <div className="flex gap-0 border border-[#e0dbd4]">
              {(['show', 'season', 'episode'] as Level[]).map((l, i) => (
                <button
                  key={l}
                  onClick={() => { setLevel(l); setSelectedSeason(null); setSelectedEpisode(null) }}
                  className={`flex-1 py-2 text-sm font-medium transition-colors capitalize ${
                    i > 0 ? 'border-l border-[#e0dbd4]' : ''
                  } ${
                    level === l
                      ? 'bg-[#7c9e7a] text-white'
                      : 'bg-[#fafaf7] text-[#6b6560] hover:text-[#1a1a18]'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>}

          {/* Status selector (show level only, or always in edit mode) */}
          {(level === 'show' || existingLog) && (
            <div>
              <p className="text-[#6b6560] text-xs uppercase tracking-wide mb-2">Status</p>
              <div className="flex gap-0 border border-[#e0dbd4]">
                {([
                  { value: 'watched', label: 'Watched' },
                  { value: 'watching', label: 'Watching' },
                  { value: 'want_to_watch', label: 'Want to Watch' },
                ] as { value: Status; label: string }[]).map((s, i) => (
                  <button
                    key={s.value}
                    onClick={() => setStatus(s.value)}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${
                      i > 0 ? 'border-l border-[#e0dbd4]' : ''
                    } ${
                      status === s.value
                        ? 'bg-[#7c9e7a] text-white'
                        : 'bg-[#fafaf7] text-[#6b6560] hover:text-[#1a1a18]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Season picker — hidden in edit mode */}
          {!existingLog && (level === 'season' || level === 'episode') && (
            <div>
              <label className="text-[#6b6560] text-xs uppercase tracking-wide block mb-2">Season</label>
              <select
                value={selectedSeason ?? ''}
                onChange={e => {
                  setSelectedSeason(e.target.value ? Number(e.target.value) : null)
                  setSelectedEpisode(null)
                }}
                className="w-full bg-[#fafaf7] text-[#1a1a18] px-3 py-2 text-sm border border-[#e0dbd4] focus:outline-none focus:border-[#7c9e7a]"
              >
                <option value="">Select a season…</option>
                {seasons.map(s => (
                  <option key={s.season_number} value={s.season_number}>
                    {s.name} (Season {s.season_number})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Episode picker — hidden in edit mode */}
          {!existingLog && level === 'episode' && selectedSeason !== null && (
            <div>
              <label className="text-[#6b6560] text-xs uppercase tracking-wide block mb-2">Episode</label>
              <select
                value={selectedEpisode ?? ''}
                onChange={e => setSelectedEpisode(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-[#fafaf7] text-[#1a1a18] px-3 py-2 text-sm border border-[#e0dbd4] focus:outline-none focus:border-[#7c9e7a]"
              >
                <option value="">Select an episode…</option>
                {episodes.map(ep => (
                  <option key={ep.episode_number} value={ep.episode_number}>
                    E{ep.episode_number} — {ep.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Ratings */}
          <div className="space-y-4">
            <RatingInput label="Story" description="writing, plot, pacing" value={story} onChange={setStory} />
            <RatingInput label="Performance" description="acting, direction" value={performance} onChange={setPerformance} />
            <RatingInput label="Visuals" description="cinematography, production design" value={visuals} onChange={setVisuals} />
          </div>

          {/* Overall score preview */}
          {overallScore !== null && (
            <div className="bg-[#f0ede8] border border-[#e0dbd4] px-4 py-3 flex items-center justify-between">
              <span className="text-[#6b6560] text-sm">Overall Score</span>
              <span className="text-[#1a1a18] font-bold text-xl tabular-nums">{overallScore.toFixed(1)}</span>
            </div>
          )}

          {/* Review */}
          <div>
            <label className="text-[#6b6560] text-xs uppercase tracking-wide block mb-2">
              Review <span className="normal-case text-[#6b6560]">(optional)</span>
            </label>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="Write your thoughts…"
              rows={3}
              className="w-full bg-[#fafaf7] text-[#1a1a18] px-3 py-2 text-sm border border-[#e0dbd4] focus:outline-none focus:border-[#7c9e7a] resize-none placeholder-[#6b6560]"
            />
          </div>

          {/* Date watched */}
          <div>
            <label className="text-[#6b6560] text-xs uppercase tracking-wide block mb-2">Date Watched</label>
            <input
              type="date"
              value={dateWatched}
              onChange={e => setDateWatched(e.target.value)}
              className="w-full bg-[#fafaf7] text-[#1a1a18] px-3 py-2 text-sm border border-[#e0dbd4] focus:outline-none focus:border-[#7c9e7a]"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#7c9e7a] hover:bg-[#6a8c68] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 transition-all cursor-pointer"
          >
            {saving ? 'saving…' : existingLog ? 'save changes' : 'save log'}
          </button>
        </div>
      </div>
    </div>
  )
}
