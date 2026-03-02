'use client'

import { useState } from 'react'
import LogModal from '@/components/LogModal'
import { TMDBShow, ShowLog } from '@/lib/types'
import { tmdbImageUrl } from '@/lib/tmdb'
import Link from 'next/link'

type CommunityAvg = {
  overall: number; story: number; performance: number; visuals: number; count: number
} | null

type SimilarShow = { id: number; name: string; poster_path: string | null; first_air_date: string }

type Props = {
  show: TMDBShow
  communityAvg: CommunityAvg
  recentLogs: (ShowLog & { profiles: { username: string; avatar_url: string | null } | null })[]
  similarShows: SimilarShow[]
}

type Tab = 'reviews' | 'similar'

export default function ShowPageClient({ show, communityAvg, recentLogs, similarShows }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<Tab>('reviews')

  return (
    <div className="space-y-6 pb-12">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#7c9e7a] hover:bg-[#6a8c68] active:scale-95 text-white px-5 py-2 text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer"
        >
          {saved ? '✓ logged' : 'log this show'}
        </button>
      </div>

      {/* Community ratings */}
      {communityAvg && (
        <div className="border border-[#e0dbd4] bg-[#f5f2ed]">
          <div className="px-5 py-3 border-b border-[#e0dbd4] flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#6b6560]">
              Community Rating
              <span className="ml-2 normal-case font-normal">
                ({communityAvg.count} {communityAvg.count === 1 ? 'log' : 'logs'})
              </span>
            </span>
            <span className="text-[#1a1a18] text-2xl font-bold tabular-nums">
              {communityAvg.overall.toFixed(1)}
            </span>
          </div>
          <div className="grid grid-cols-3 divide-x divide-[#e0dbd4]">
            {[
              { label: 'Story', value: communityAvg.story },
              { label: 'Performance', value: communityAvg.performance },
              { label: 'Visuals', value: communityAvg.visuals },
            ].map(item => (
              <div key={item.label} className="px-4 py-3 text-center">
                <div className="text-lg font-bold text-[#1a1a18] tabular-nums">{item.value.toFixed(1)}</div>
                <div className="text-[#6b6560] text-xs mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#e0dbd4]">
        <div className="flex gap-6">
          {([
            { key: 'reviews', label: 'REVIEWS' },
            { key: 'similar', label: 'SIMILAR SHOWS' },
          ] as { key: Tab; label: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-[10px] font-semibold tracking-widest pb-3 transition-colors border-b-2 -mb-px cursor-pointer ${
                tab === t.key
                  ? 'text-[#1a1a18] border-[#7c9e7a]'
                  : 'text-[#6b6560] border-transparent hover:text-[#1a1a18]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews tab */}
      {tab === 'reviews' && (
        <div>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-[#6b6560] py-4">No reviews yet. Log this show to leave one.</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map(log => (
                <div key={log.id} className="border border-[#e0dbd4] bg-[#fafaf7] px-4 py-3 hover:border-l-[#7c9e7a] hover:border-l-2 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-[#f0ede8] border border-[#e0dbd4] overflow-hidden flex items-center justify-center text-[10px] font-bold text-[#6b6560] flex-shrink-0">
                      {log.profiles?.avatar_url
                        ? <img src={log.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                        : log.profiles?.username?.[0]?.toUpperCase()}
                    </div>
                    <Link href={`/profile/${log.profiles?.username}`} className="text-sm font-semibold text-[#1a1a18] hover:text-[#7c9e7a] transition-colors">
                      {log.profiles?.username}
                    </Link>
                    {log.overall_score && (
                      <span className="ml-auto text-sm font-bold text-[#7c9e7a] tabular-nums">
                        {log.overall_score.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {log.story_score && (
                    <div className="flex gap-3 text-xs text-[#6b6560] mb-2">
                      <span>Story <span className="text-[#1a1a18] font-semibold">{log.story_score.toFixed(1)}</span></span>
                      {log.performance_score && <span>Perf. <span className="text-[#1a1a18] font-semibold">{log.performance_score.toFixed(1)}</span></span>}
                      {log.visuals_score && <span>Visuals <span className="text-[#1a1a18] font-semibold">{log.visuals_score.toFixed(1)}</span></span>}
                    </div>
                  )}
                  <p className="text-[#6b6560] text-sm italic">&ldquo;{log.review}&rdquo;</p>
                  <p className="text-[#6b6560] text-xs mt-1.5">
                    {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Similar shows tab */}
      {tab === 'similar' && (
        <div>
          {similarShows.length === 0 ? (
            <p className="text-sm text-[#6b6560] py-4">No similar shows found.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {similarShows.map(show => {
                const posterUrl = tmdbImageUrl(show.poster_path, 'w342')
                const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : null
                return (
                  <Link key={show.id} href={`/shows/${show.id}`} className="group">
                    <div className="relative aspect-[2/3] overflow-hidden bg-[#f0ede8] border border-[#e0dbd4] group-hover:border-[#7c9e7a] transition-all duration-200 group-hover:scale-[1.02]">
                      {posterUrl
                        ? <img src={posterUrl} alt={show.name} loading="lazy" className="w-full h-full object-cover" />
                        : <div className="flex h-full w-full items-center justify-center text-xs text-[#6b6560] text-center p-1">{show.name}</div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a18]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-3">
                        <span className="text-white text-[10px] font-bold uppercase tracking-wide">view</span>
                      </div>
                    </div>
                    <p className="mt-1.5 text-[11px] font-semibold text-[#1a1a18] truncate">{show.name}</p>
                    {year && <p className="text-[10px] text-[#6b6560]">{year}</p>}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <LogModal
          show={show}
          onClose={() => setShowModal(false)}
          onSaved={() => setSaved(true)}
        />
      )}
    </div>
  )
}
