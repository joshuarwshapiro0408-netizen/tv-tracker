'use client'

type RatingInputProps = {
  label: string
  description: string
  value: number | null
  onChange: (value: number) => void
}

export default function RatingInput({ label, description, value, onChange }: RatingInputProps) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <div>
          <span className="text-white font-medium text-sm">{label}</span>
          <span className="text-gray-500 text-xs ml-2">{description}</span>
        </div>
        <span className="text-white font-bold tabular-nums">
          {value !== null ? value.toFixed(1) : '—'}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={0.5}
        value={value ?? 5}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-blue-500"
      />
      <div className="flex justify-between text-gray-600 text-xs mt-1">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  )
}
