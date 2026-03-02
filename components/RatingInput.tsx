'use client'

import { useState } from 'react'

type RatingInputProps = {
  label: string
  description: string
  value: number | null
  onChange: (value: number) => void
}

export default function RatingInput({ label, description, value, onChange }: RatingInputProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [halfPoint, setHalfPoint] = useState(false)

  // Compute the "active" display value (hovered or selected)
  const displayValue = hovered !== null
    ? (halfPoint ? hovered - 0.5 : hovered)
    : value

  function handleSelect(n: number) {
    const v = halfPoint ? n - 0.5 : n
    onChange(v)
  }

  // A button is "filled" (light green) if it's within the active range
  function isFilled(n: number) {
    if (displayValue === null) return false
    return n <= Math.ceil(displayValue)
  }

  // A button is "selected" (full green) if it's the chosen integer
  function isSelected(n: number) {
    if (displayValue === null) return false
    return n === Math.ceil(displayValue)
  }

  return (
    <div>
      <div className="flex justify-between items-baseline mb-2.5">
        <div>
          <span className="text-[#1a1a18] font-semibold text-sm">{label}</span>
          <span className="text-[#6b6560] text-xs ml-2">{description}</span>
        </div>
        <span className="text-[#1a1a18] font-bold text-lg tabular-nums min-w-[2.5rem] text-right">
          {displayValue !== null ? displayValue.toFixed(1) : '—'}
        </span>
      </div>

      {/* Number grid 1–10 */}
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleSelect(n)}
            className={`flex-1 py-2 text-xs font-bold transition-all duration-150 cursor-pointer border ${
              isSelected(n)
                ? 'bg-[#7c9e7a] border-[#7c9e7a] text-white'
                : isFilled(n)
                ? 'bg-[#d4e5d2] border-[#b8d4b5] text-[#4a7a48]'
                : 'bg-[#f5f2ed] border-[#e0dbd4] text-[#6b6560] hover:border-[#7c9e7a] hover:text-[#1a1a18]'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Half-point toggle */}
      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={() => setHalfPoint(v => !v)}
          className={`text-[11px] font-semibold px-2 py-0.5 border transition-colors cursor-pointer ${
            halfPoint
              ? 'bg-[#7c9e7a] border-[#7c9e7a] text-white'
              : 'border-[#e0dbd4] text-[#6b6560] hover:border-[#7c9e7a]'
          }`}
        >
          +0.5
        </button>
        <span className="text-[11px] text-[#6b6560]">half-point</span>
      </div>
    </div>
  )
}
