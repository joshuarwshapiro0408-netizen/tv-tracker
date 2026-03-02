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
    <div>
      {/* Log button */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 py-2.5 font-medium transition-colors mb-8"
      >
        {saved ? 'Logged ✓' : 'Log this show'}
      </button>

      {/* Community ratings */}
      {communityAvg && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-8">
          <h2 className="text-white font-semibold mb-4">
            Community Rating
            <span className="text-gray-500 font-normal text-sm ml-2">({communityAvg.count} logs)</span>
          </h2>
          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { label: 'Overall', value: communityAvg.overall },
              { label: 'Story', value: communityAvg.story },
              { label: 'Performance', value: communityAvg.performance },
              { label: 'Visuals', value: communityAvg.visuals },
            ].map(item => (
              <div key={item.label}>
                <div className="text-2xl font-bold text-white">{item.value.toFixed(1)}</div>
                <div className="text-gray-500 text-xs mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent reviews */}
      {recentLogs.length > 0 && (
        <div>
          <h2 className="text-white font-semibold mb-4">Recent Reviews</h2>
          <div className="space-y-4">
            {recentLogs.map(log => (
              <div key={log.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-300">
                    {log.profiles?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="text-gray-300 text-sm font-medium">{log.profiles?.username}</span>
                  {log.overall_score && (
                    <span className="ml-auto text-white font-bold">{log.overall_score.toFixed(1)}</span>
                  )}
                </div>
                <p className="text-gray-300 text-sm">{log.review}</p>
              </div>
            ))}
          </div>
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
