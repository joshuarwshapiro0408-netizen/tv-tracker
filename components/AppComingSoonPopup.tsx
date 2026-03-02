'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'trakr_app_popup_dismissed'

export default function AppComingSoonPopup() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(STORAGE_KEY)) return
    const timer = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50"
      onClick={dismiss}
    >
      <div
        className="bg-[#1a1410] border border-[#3d2f20] max-w-sm w-full p-8 text-center relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-[#6b5c4c] hover:text-[#f5f0e8] transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7c9e7a]">coming soon</span>
        </div>

        <h2 className="font-playfair text-2xl text-[#f5f0e8] mb-3 leading-snug">
          trakr for iOS &amp; Android
        </h2>

        <p className="text-sm text-[#a89880] leading-relaxed mb-7">
          We&apos;re building the app. Track shows, log episodes, and stay connected — from your pocket.
        </p>

        <button
          onClick={dismiss}
          className="w-full bg-[#7c9e7a] hover:bg-[#6a8c68] active:scale-95 text-white text-sm font-semibold py-3 transition-all cursor-pointer"
        >
          Notify me when it launches
        </button>

        <button
          onClick={dismiss}
          className="mt-3 text-xs text-[#6b5c4c] hover:text-[#a89880] transition-colors cursor-pointer"
        >
          dismiss
        </button>
      </div>
    </div>
  )
}
