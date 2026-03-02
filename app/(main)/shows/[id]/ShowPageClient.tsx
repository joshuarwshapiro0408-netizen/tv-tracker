'use client'

import { useState } from 'react'
import LogModal from '@/components/LogModal'
import { TMDBShow, ShowLog } from '@/lib/types'

type CommunityAvg = {
  overall: number
  story: number
  performance: number
  visuals: number
  count: number
} | null

type Props = {
  show: TMDBShow
  communityAvg: CommunityAvg
  recentLogs: (ShowLog & { profiles: { username: string; avatar_url: string | null } | null })[]
}

export default function ShowPageClient({ show, communityAvg, recentLogs }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [saved, setSaved] = useState(false)

  return (
    <div className="space-y-8">
      {/* Log button */}
      <div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#7c9e7a] hover:bg-[#6a8c68] text-white px-6 py-2.5 text-sm font-semibold transition-colors"
        >
          {saved ? 'Logged ✓' : 'Log this show'}
        </button>
      </div>

      {/* Community ratings */}
      {communityAvg && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-3">
            Community Rating
            <span className="ml-2 normal-case font-normal">({communityAvg.count} {communityAvg.count === 1 ? 'log' : 'logs'})</span>
          </h2>
          <div className="border border-[#e0dbd4] bg-[#f0ede8]">
            {/* Overall score bar */}
            <div className="px-5 py-4 border-b border-[#e0dbd4] flex items-center justify-between">
              <span className="text-[#6b6560] text-sm">Overall</span>
              <span className="text-[#1a1a18] text-2xl font-bold tabular-nums">{communityAvg.overall.toFixed(1)}</span>
            </div>
            {/* Sub-scores */}
            <div className="grid grid-cols-3 divide-x divide-[#e0dbd4] px-0">
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
        </section>
      )}

      {/* Recent reviews */}
      {recentLogs.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-3">Recent Reviews</h2>
          <div className="space-y-3">
            {recentLogs.map(log => (
              <div key={log.id} className="border border-[#e0dbd4] bg-[#fafaf7] px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-[#f0ede8] border border-[#e0dbd4] flex items-center justify-center text-xs text-[#6b6560] font-medium flex-shrink-0">
                    {log.profiles?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="text-[#1a1a18] text-sm font-medium">{log.profiles?.username}</span>
                  {log.overall_score && (
                    <span className="ml-auto text-[#1a1a18] font-bold text-sm tabular-nums">{log.overall_score.toFixed(1)}</span>
                  )}
                </div>
                <p className="text-[#6b6560] text-sm italic">&ldquo;{log.review}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>
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
