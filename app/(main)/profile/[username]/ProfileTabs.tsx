'use client'

import { useState } from 'react'
import { tmdbImageUrl } from '@/lib/tmdb'
import Link from 'next/link'

type ShowEntry = {
  tmdb_show_id: number
  show_title: string
  show_poster_path: string | null
  overall_score: number | null
  created_at: string
}

type ReviewEntry = {
  id: string
  tmdb_show_id: number
  show_title: string
  show_poster_path: string | null
  overall_score: number | null
  story_score: number | null
  performance_score: number | null
  visuals_score: number | null
  review: string | null
  date_watched: string | null
  created_at: string
}

type ListEntry = {
  id: string
  title: string
  description: string | null
  is_public: boolean
  created_at: string
  list_items: {
    tmdb_show_id: number
    show_poster_path: string | null
    show_title: string
    position: number
  }[] | null
}

type Props = {
  loggedShows: ShowEntry[]
  reviews: ReviewEntry[]
  lists: ListEntry[]
}

type Tab = 'shows' | 'reviews' | 'lists' | 'journal'

export default function ProfileTabs({ loggedShows, reviews, lists }: Props) {
  const [tab, setTab] = useState<Tab>('shows')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'shows', label: 'SHOWS' },
    { key: 'reviews', label: 'REVIEWS' },
    { key: 'lists', label: 'LISTS' },
    { key: 'journal', label: 'JOURNAL' },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-6 border-b border-[#e0dbd4] mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-[10px] font-semibold tracking-widest pb-3 border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'text-[#1a1a18] border-[#7c9e7a]'
                : 'text-[#6b6560] border-transparent hover:text-[#1a1a18]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SHOWS tab */}
      {tab === 'shows' && (
        <div>
          {loggedShows.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-[#e0dbd4] bg-[#fafaf7]">
              <p className="text-sm font-semibold text-[#1a1a18] mb-1">Nothing logged yet</p>
              <p className="text-xs text-[#6b6560] mb-4">Start building your watchlist.</p>
              <Link href="/shows" className="text-xs font-semibold text-[#7c9e7a] hover:underline uppercase tracking-wide">
                Browse Shows →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {loggedShows.map(log => {
                const posterUrl = tmdbImageUrl(log.show_poster_path, 'w185')
                return (
                  <Link key={`${log.tmdb_show_id}-${log.created_at}`} href={`/shows/${log.tmdb_show_id}`} className="group">
                    <div className="aspect-[2/3] overflow-hidden bg-[#f0ede8] border border-[#e0dbd4] group-hover:border-[#7c9e7a] transition-colors">
                      {posterUrl
                        ? <img src={posterUrl} alt={log.show_title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                        : <div className="flex h-full w-full items-center justify-center text-xs text-[#6b6560] text-center p-1">{log.show_title}</div>}
                    </div>
                    {log.overall_score && (
                      <p className="text-[10px] text-[#7c9e7a] font-semibold text-center mt-1">{log.overall_score.toFixed(1)}</p>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* REVIEWS tab */}
      {tab === 'reviews' && (
        <div>
          {reviews.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-[#e0dbd4] bg-[#fafaf7]">
              <p className="text-sm font-semibold text-[#1a1a18] mb-1">No reviews yet</p>
              <p className="text-xs text-[#6b6560] mb-4">Log a show and share your thoughts.</p>
              <Link href="/shows" className="text-xs font-semibold text-[#7c9e7a] hover:underline uppercase tracking-wide">
                Find a Show →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(log => {
                const posterUrl = tmdbImageUrl(log.show_poster_path, 'w92')
                return (
                  <div key={log.id} className="flex gap-4 border border-[#e0dbd4] bg-[#fafaf7] p-4">
                    <Link href={`/shows/${log.tmdb_show_id}`} className="flex-shrink-0">
                      <div className="w-12 h-[68px] overflow-hidden bg-[#f0ede8] border border-[#e0dbd4]">
                        {posterUrl
                          ? <img src={posterUrl} alt={log.show_title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-[#e0dbd4]" />}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Link href={`/shows/${log.tmdb_show_id}`} className="font-semibold text-sm text-[#1a1a18] hover:text-[#7c9e7a] transition-colors truncate">
                          {log.show_title}
                        </Link>
                        {log.overall_score && (
                          <span className="text-sm font-bold text-[#7c9e7a] flex-shrink-0 tabular-nums">
                            {log.overall_score.toFixed(1)}
                          </span>
                        )}
                      </div>
                      {log.story_score && (
                        <div className="flex gap-3 text-xs text-[#6b6560] mb-1.5">
                          <span>Story <span className="text-[#1a1a18] font-semibold">{log.story_score.toFixed(1)}</span></span>
                          {log.performance_score && <span>Perf. <span className="text-[#1a1a18] font-semibold">{log.performance_score.toFixed(1)}</span></span>}
                          {log.visuals_score && <span>Visuals <span className="text-[#1a1a18] font-semibold">{log.visuals_score.toFixed(1)}</span></span>}
                        </div>
                      )}
                      <p className="text-sm text-[#6b6560] italic line-clamp-3">&ldquo;{log.review}&rdquo;</p>
                      <p className="text-xs text-[#6b6560] mt-1.5">
                        {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* LISTS tab */}
      {tab === 'lists' && (
        <div>
          {lists.length === 0 ? (
            <div>
              <p className="text-sm text-[#6b6560] py-6">No lists yet.</p>
              <Link href="/lists/new" className="text-[#7c9e7a] text-sm hover:underline">Create a list →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lists.map(list => {
                const items = [...(list.list_items || [])]
                  .sort((a, b) => a.position - b.position)
                  .slice(0, 4)
                return (
                  <Link key={list.id} href={`/lists/${list.id}`} className="group border border-[#e0dbd4] hover:border-[#7c9e7a] transition-colors">
                    <div className="grid grid-cols-4 border-b border-[#e0dbd4]">
                      {[0, 1, 2, 3].map(i => {
                        const item = items[i]
                        const url = item ? tmdbImageUrl(item.show_poster_path, 'w92') : null
                        return (
                          <div key={i} className="aspect-[2/3] overflow-hidden bg-[#f0ede8]">
                            {url
                              ? <img src={url} alt="" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                              : <div className="w-full h-full bg-[#e8e3dc]" />}
                          </div>
                        )
                      })}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-[#1a1a18] truncate">{list.title}</p>
                      <p className="text-xs text-[#6b6560] mt-0.5">{list.list_items?.length || 0} shows</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* JOURNAL tab — diary-style */}
      {tab === 'journal' && (
        <div>
          {loggedShows.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-[#e0dbd4] bg-[#fafaf7]">
              <p className="text-sm font-semibold text-[#1a1a18] mb-1">Your journal is empty</p>
              <p className="text-xs text-[#6b6560] mb-4">Every show you log will appear here by date.</p>
              <Link href="/shows" className="text-xs font-semibold text-[#7c9e7a] hover:underline uppercase tracking-wide">
                Start Logging →
              </Link>
            </div>
          ) : (
            <div className="space-y-0">
              {loggedShows.map((log, i) => {
                const posterUrl = tmdbImageUrl(log.show_poster_path, 'w92')
                const date = new Date(log.created_at)
                const prevDate = i > 0 ? new Date(loggedShows[i - 1].created_at) : null
                const showDateHeader = !prevDate || date.toDateString() !== prevDate.toDateString()
                return (
                  <div key={`${log.tmdb_show_id}-${log.created_at}`}>
                    {showDateHeader && (
                      <p className="text-xs font-semibold text-[#6b6560] uppercase tracking-widest pt-5 pb-2 border-t border-[#e0dbd4] first:border-t-0 first:pt-0">
                        {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                    <div className="flex gap-3 py-2.5 border-b border-[#e0dbd4]/60 last:border-b-0">
                      <Link href={`/shows/${log.tmdb_show_id}`} className="flex-shrink-0">
                        <div className="w-10 h-14 overflow-hidden bg-[#f0ede8] border border-[#e0dbd4]">
                          {posterUrl
                            ? <img src={posterUrl} alt={log.show_title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-[#e0dbd4]" />}
                        </div>
                      </Link>
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <Link href={`/shows/${log.tmdb_show_id}`} className="text-sm font-semibold text-[#1a1a18] hover:text-[#7c9e7a] transition-colors truncate">
                          {log.show_title}
                        </Link>
                        {log.overall_score && (
                          <span className="text-sm font-bold text-[#7c9e7a] ml-3 flex-shrink-0 tabular-nums">
                            {log.overall_score.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
