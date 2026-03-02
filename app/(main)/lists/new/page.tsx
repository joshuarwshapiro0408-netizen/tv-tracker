'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewListPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('lists')
      .insert({ user_id: user.id, title, description: description || null, is_public: true })
      .select()
      .single()

    if (!error && data) {
      router.push(`/lists/${data.id}`)
    }
    setSaving(false)
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-[#1a1a18] mb-6">Create a List</h1>
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#6b6560] mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="e.g. Best Shows of 2025"
            className="w-full border border-[#e0dbd4] bg-[#fafaf7] px-3 py-2 text-sm text-[#1a1a18] placeholder-[#6b6560] focus:outline-none focus:border-[#7c9e7a]"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#6b6560] mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-[#e0dbd4] bg-[#fafaf7] px-3 py-2 text-sm text-[#1a1a18] resize-none focus:outline-none focus:border-[#7c9e7a]"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#7c9e7a] hover:bg-[#6a8c68] disabled:opacity-50 text-white py-3 text-sm font-semibold transition-colors"
        >
          {saving ? 'creating…' : 'create list'}
        </button>
      </form>
    </div>
  )
}
