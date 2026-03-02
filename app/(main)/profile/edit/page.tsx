'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const GENRES = [
  'Drama', 'Comedy', 'Crime', 'Thriller', 'Action & Adventure',
  'Sci-Fi & Fantasy', 'Horror', 'Mystery', 'Documentary',
  'Animation', 'Reality', 'Romance', 'Western', 'News & Politics',
]

export default function EditProfilePage() {
  const supabase = createClient()
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [genres, setGenres] = useState<string[]>([])
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, bio, avatar_url, favourite_genres')
        .eq('id', user.id)
        .single()
      if (profile) {
        setUsername(profile.username || '')
        setBio(profile.bio || '')
        setAvatarUrl(profile.avatar_url || null)
        setGenres((profile as { favourite_genres?: string[] }).favourite_genres || [])
      }
      setLoaded(true)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleGenre(g: string) {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    let newAvatarUrl = avatarUrl

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop() || 'jpg'
      const path = `${user.id}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true })
      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`)
        setSaving(false)
        return
      }
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      newAvatarUrl = urlData.publicUrl
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        bio: bio.trim() || null,
        avatar_url: newAvatarUrl,
        favourite_genres: genres,
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push(`/profile/${username}`)
  }

  if (!loaded) {
    return <p className="text-sm text-[#6b6560] pt-8">Loading…</p>
  }

  const displayAvatar = avatarPreview || avatarUrl

  return (
    <div className="max-w-lg space-y-7">
      <div className="flex items-center justify-between border-b border-[#e0dbd4] pb-5">
        <h1 className="text-2xl font-bold text-[#1a1a18]">Edit Profile</h1>
        <Link href={`/profile/${username}`} className="text-sm text-[#6b6560] hover:text-[#1a1a18] transition-colors">
          ← back
        </Link>
      </div>

      {/* Profile photo */}
      <div>
        <label className="block text-xs uppercase tracking-wide text-[#6b6560] mb-3">Profile Photo</label>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-[#f0ede8] border border-[#e0dbd4] overflow-hidden flex items-center justify-center text-2xl font-bold text-[#6b6560] flex-shrink-0">
            {displayAvatar ? (
              <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              username[0]?.toUpperCase()
            )}
          </div>
          <div>
            <label className="cursor-pointer text-sm text-[#7c9e7a] hover:text-[#6a8c68] transition-colors font-medium">
              choose photo
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
            </label>
            <p className="text-xs text-[#6b6560] mt-1">JPG, PNG or WebP · max 2 MB</p>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-xs uppercase tracking-wide text-[#6b6560] mb-2">
          Bio <span className="normal-case font-normal">(optional)</span>
        </label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="A few words about you…"
          rows={3}
          maxLength={160}
          className="w-full border border-[#e0dbd4] bg-[#fafaf7] px-3 py-2 text-sm text-[#1a1a18] placeholder-[#6b6560] focus:outline-none focus:border-[#7c9e7a] resize-none"
        />
        <p className="text-[11px] text-[#6b6560] text-right mt-0.5">{bio.length}/160</p>
      </div>

      {/* Favourite genres */}
      <div>
        <label className="block text-xs uppercase tracking-wide text-[#6b6560] mb-3">Favourite Genres</label>
        <div className="flex flex-wrap gap-2">
          {GENRES.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => toggleGenre(g)}
              className={`px-3 py-1.5 text-xs transition-colors border ${
                genres.includes(g)
                  ? 'bg-[#7c9e7a] border-[#7c9e7a] text-white'
                  : 'bg-[#fafaf7] border-[#e0dbd4] text-[#6b6560] hover:border-[#7c9e7a] hover:text-[#1a1a18]'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-[#7c9e7a] hover:bg-[#6a8c68] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 text-sm font-semibold transition-colors"
      >
        {saving ? 'saving…' : 'save changes'}
      </button>
    </div>
  )
}
