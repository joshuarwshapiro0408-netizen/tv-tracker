'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [username, setUsername] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single()
        setUsername(profile?.username || null)
        setAvatarUrl(profile?.avatar_url || null)
      }
    }
    getUser()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) =>
    pathname === href || (href.length > 1 && pathname.startsWith(href + '/'))

  const browseLinks = [
    { href: '/shows', label: 'SHOWS' },
    { href: '/lists', label: 'LISTS' },
    { href: '/members', label: 'MEMBERS' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-[#1a1410] border-b border-[#2d2018]">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4">

        {/* Logo */}
        <Link
          href={username ? '/home' : '/login'}
          className="text-base font-bold tracking-tight text-[#f5f0e8] flex-shrink-0 hover:text-white transition-colors"
        >
          trakr
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
          {!username && (
            <>
              <Link
                href="/login"
                className={`text-xs font-bold tracking-widest transition-colors pb-0.5 ${
                  pathname === '/login'
                    ? 'text-[#f5f0e8] border-b border-[#7c9e7a]'
                    : 'text-[#a89880] hover:text-[#f5f0e8]'
                }`}
              >
                SIGN IN
              </Link>
              <Link
                href="/login?form=signup"
                className="text-xs font-bold tracking-widest text-[#a89880] hover:text-[#f5f0e8] transition-colors"
              >
                CREATE ACCOUNT
              </Link>
            </>
          )}
          {browseLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs font-bold tracking-widest transition-colors pb-0.5 ${
                isActive(link.href)
                  ? 'text-[#f5f0e8] border-b border-[#7c9e7a]'
                  : 'text-[#a89880] hover:text-[#f5f0e8]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {username && (
            <Link
              href="/feed"
              className={`text-xs font-bold tracking-widest transition-colors pb-0.5 ${
                isActive('/feed')
                  ? 'text-[#f5f0e8] border-b border-[#7c9e7a]'
                  : 'text-[#a89880] hover:text-[#f5f0e8]'
              }`}
            >
              JOURNAL
            </Link>
          )}
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/search" className="text-[#a89880] hover:text-[#f5f0e8] transition-colors" aria-label="Search">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
          {username ? (
            <>
              <Link href={`/profile/${username}`} className="flex items-center gap-1.5 group">
                <div className="w-6 h-6 rounded-full bg-[#2d2018] border border-[#3d3020] overflow-hidden flex items-center justify-center text-[10px] font-bold text-[#a89880] flex-shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                  ) : (
                    username[0]?.toUpperCase()
                  )}
                </div>
                <span className="text-xs font-bold tracking-widest text-[#a89880] group-hover:text-[#f5f0e8] transition-colors uppercase">
                  {username}
                </span>
              </Link>
              <button
                onClick={signOut}
                className="text-xs font-bold tracking-widest text-[#a89880] hover:text-[#f5f0e8] transition-colors cursor-pointer"
              >
                SIGN OUT
              </button>
            </>
          ) : null}
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden p-1 text-[#f5f0e8] cursor-pointer"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#2d2018] bg-[#1a1410] px-4 py-4 space-y-0.5">
          {!username && (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-xs font-semibold tracking-widest text-[#a89880] hover:text-[#f5f0e8]">SIGN IN</Link>
              <Link href="/login?form=signup" onClick={() => setMenuOpen(false)} className="block py-2 text-xs font-semibold tracking-widest text-[#a89880] hover:text-[#f5f0e8]">CREATE ACCOUNT</Link>
            </>
          )}
          {browseLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 text-xs font-semibold tracking-widest transition-colors ${
                isActive(link.href) ? 'text-[#f5f0e8]' : 'text-[#a89880] hover:text-[#f5f0e8]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {username && (
            <>
              <Link href="/feed" onClick={() => setMenuOpen(false)} className="block py-2 text-xs font-semibold tracking-widest text-[#a89880] hover:text-[#f5f0e8]">JOURNAL</Link>
              <Link href="/search" onClick={() => setMenuOpen(false)} className="block py-2 text-xs font-semibold tracking-widest text-[#a89880] hover:text-[#f5f0e8]">SEARCH</Link>
              <Link href={`/profile/${username}`} onClick={() => setMenuOpen(false)} className="block py-2 text-xs font-semibold tracking-widest text-[#a89880] hover:text-[#f5f0e8] uppercase">{username}</Link>
              <button onClick={signOut} className="block w-full text-left py-2 text-xs font-semibold tracking-widest text-[#a89880] hover:text-[#f5f0e8] cursor-pointer">SIGN OUT</button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
