'use client'

import { useEffect, useRef, useState } from 'react'
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

  const [originalUsername, setOriginalUsername] = useState('')
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [bio, setBio] = useState('')
  const [genres, setGenres] = useState<string[]>([])
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [favouriteShows, setFavouriteShows] = useState<{ id: number; name: string; poster_path: string | null }[]>([])
  const [showSearch, setShowSearch] = useState('')
  const [showResults, setShowResults] = useState<{ id: number; name: string; poster_path: string | null }[]>([])
  const [showSearching, setShowSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, bio, avatar_url, favourite_genres, favourite_show_ids')
        .eq('id', user.id)
        .single()
      if (profile) {
        setOriginalUsername(profile.username || '')
        setUsername(profile.username || '')
        setBio(profile.bio || '')
        setAvatarUrl(profile.avatar_url || null)
        setGenres((profile as { favourite_genres?: string[] }).favourite_genres || [])
        const ids: number[] = (profile as { favourite_show_ids?: number[] }).favourite_show_ids || []
        if (ids.length > 0) {
          const shows = await Promise.all(
            ids.slice(0, 3).map(async id => {
              try {
                const r = await fetch(`/api/tmdb/show/${id}`)
                const data = await r.json()
                return { id: data.id, name: data.name, poster_path: data.poster_path || null }
              } catch { return null }
            })
          )
          setFavouriteShows(shows.filter(Boolean) as { id: number; name: string; poster_path: string | null }[])
        }
      }
      setLoaded(true)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced username availability check
  function handleUsernameChange(value: string) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(cleaned)

    if (cleaned === originalUsername) {
      setUsernameStatus('idle')
      return
    }

    if (cleaned.length < 3) {
      setUsernameStatus(cleaned.length === 0 ? 'idle' : 'invalid')
      return
    }

    setUsernameStatus('checking')

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', cleaned)
        .maybeSingle()
      setUsernameStatus(data ? 'taken' : 'available')
    }, 500)
  }

  function toggleGenre(g: string) {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  function handleShowSearch(value: string) {
    setShowSearch(value)
    if (!value.trim()) { setShowResults([]); return }
    setShowSearching(true)
    if (showDebounceRef.current) clearTimeout(showDebounceRef.current)
    showDebounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/tmdb/search?q=${encodeURIComponent(value)}`)
        const data = await r.json()
        setShowResults((data.results || []).slice(0, 5).map((s: { id: number; name: string; poster_path: string | null }) => ({
          id: s.id, name: s.name, poster_path: s.poster_path || null
        })))
      } catch { setShowResults([]) }
      setShowSearching(false)
    }, 400)
  }

  function addFavouriteShow(show: { id: number; name: string; poster_path: string | null }) {
    if (favouriteShows.length >= 3) return
    if (favouriteShows.find(s => s.id === show.id)) return
    setFavouriteShows(prev => [...prev, show])
    setShowSearch('')
    setShowResults([])
  }

  function removeFavouriteShow(id: number) {
    setFavouriteShows(prev => prev.filter(s => s.id !== id))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') return
    if (username.length < 3) { setError('Username must be at least 3 characters'); return }

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

    const updatePayload: Record<string, unknown> = {
      bio: bio.trim() || null,
      avatar_url: newAvatarUrl,
      favourite_genres: genres,
      favourite_show_ids: favouriteShows.map(s => s.id),
    }

    if (username !== originalUsername) {
      updatePayload.username = username
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updatePayload)
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

  const usernameHint = () => {
    if (username === originalUsername) return null
    if (usernameStatus === 'checking') return <span className="text-[#6b6560]">checking…</span>
    if (usernameStatus === 'available') return <span className="text-[#7c9e7a]">✓ available</span>
    if (usernameStatus === 'taken') return <span className="text-red-500">✗ already taken</span>
    if (usernameStatus === 'invalid') return <span className="text-red-500">minimum 3 characters</span>
    return null
  }

  return (
    <div className="max-w-lg space-y-7">
      <div className="flex items-center justify-between border-b border-[#e0dbd4] pb-5">
        <h1 className="text-2xl font-bold text-[#1a1a18]">Edit Profile</h1>
        <Link href={`/profile/${originalUsername}`} className="text-sm text-[#6b6560] hover:text-[#1a1a18] transition-colors">
          ← back
        </Link>
      </div>

      {/* Profile photo */}
      <div>
        <label className="block text-xs uppercase tracking-wide text-[#6b6560] mb-3">Profile Photo</label>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#f0ede8] border border-[#e0dbd4] overflow-hidden flex items-center justify-center text-2xl font-bold text-[#6b6560] flex-shrink-0">
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

      {/* Username */}
      <div>
        <label className="block text-xs uppercase tracking-wide text-[#6b6560] mb-2">Username</label>
        <input
          type="text"
          value={username}
          onChange={e => handleUsernameChange(e.target.value)}
          placeholder="your_username"
          className="w-full border border-[#e0dbd4] bg-[#fafaf7] px-3 py-2 text-sm text-[#1a1a18] placeholder-[#6b6560] focus:outline-none focus:border-[#7c9e7a] transition-colors"
        />
        <div className="mt-1 text-xs min-h-[1rem]">{usernameHint()}</div>
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

      {/* Favourite Shows */}
      <div>
        <label className="block text-xs uppercase tracking-wide text-[#6b6560] mb-3">
          Favourite Shows <span className="normal-case font-normal">(up to 3)</span>
        </label>

        {/* Selected shows */}
        {favouriteShows.length > 0 && (
          <div className="flex gap-3 mb-4">
            {favouriteShows.map(show => (
              <div key={show.id} className="relative w-[72px] flex-shrink-0 group">
                <div className="aspect-[2/3] bg-[#f0ede8] border border-[#e0dbd4] overflow-hidden">
                  {show.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${show.poster_path}`}
                      alt={show.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[9px] text-[#6b6560] text-center p-1 leading-tight">
                      {show.name}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-[9px] text-[#6b6560] text-center truncate leading-tight">{show.name}</p>
                <button
                  type="button"
                  onClick={() => removeFavouriteShow(show.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1a1a18] text-white text-[10px] flex items-center justify-center leading-none hover:bg-red-600 transition-colors cursor-pointer"
                  aria-label={`Remove ${show.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search input */}
        {favouriteShows.length < 3 && (
          <div className="relative">
            <input
              type="text"
              value={showSearch}
              onChange={e => handleShowSearch(e.target.value)}
              placeholder="Search for a show…"
              className="w-full border border-[#e0dbd4] bg-[#fafaf7] px-3 py-2 text-sm text-[#1a1a18] placeholder-[#6b6560] focus:outline-none focus:border-[#7c9e7a] transition-colors"
            />
            {showSearching && (
              <p className="text-[11px] text-[#6b6560] mt-1">searching…</p>
            )}
            {showResults.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 border border-[#e0dbd4] bg-[#fafaf7] shadow-sm mt-0.5 max-h-60 overflow-y-auto">
                {showResults.map(show => (
                  <button
                    key={show.id}
                    type="button"
                    onClick={() => addFavouriteShow(show)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#f0ede8] transition-colors text-left cursor-pointer border-b border-[#e0dbd4] last:border-b-0"
                  >
                    <div className="w-7 h-10 flex-shrink-0 bg-[#e8e3dc] overflow-hidden">
                      {show.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${show.poster_path}`}
                          alt={show.name}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <span className="text-sm text-[#1a1a18] truncate">{show.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {favouriteShows.length >= 3 && (
          <p className="text-[11px] text-[#6b6560]">3 shows selected · remove one to add another</p>
        )}
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
              className={`px-3 py-1.5 text-xs transition-colors border cursor-pointer ${
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
        disabled={saving || usernameStatus === 'taken' || usernameStatus === 'invalid'}
        className="w-full bg-[#7c9e7a] hover:bg-[#6a8c68] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 text-sm font-semibold transition-all cursor-pointer"
      >
        {saving ? 'saving…' : 'save changes'}
      </button>
    </div>
  )
}
