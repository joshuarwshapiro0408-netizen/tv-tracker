'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [username, setUsername] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
        setUsername(profile?.username || null)
      }
    }
    getUser()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/home', label: 'Home' },
    { href: '/feed', label: 'Feed' },
    { href: '/search', label: 'Search & Discover' },
    { href: '/people', label: 'People' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-[#e8e3dc] bg-[#fafaf7]">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Left: logo + desktop links */}
        <div className="flex items-center gap-8">
          <Link href="/home" className="text-base font-bold tracking-tight text-[#1a1a18]">
            TVTracker
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`pb-0.5 transition-colors ${
                  pathname === link.href
                    ? 'border-b-2 border-[#7c9e7a] text-[#1a1a18] font-medium'
                    : 'text-[#6b6560] hover:text-[#1a1a18]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: desktop actions + hamburger */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/lists/new" className="text-[#6b6560] hover:text-[#1a1a18] transition-colors">
              + List
            </Link>
            {username && (
              <Link
                href={`/profile/${username}`}
                className={`transition-colors ${
                  pathname === `/profile/${username}`
                    ? 'text-[#1a1a18] font-medium'
                    : 'text-[#6b6560] hover:text-[#1a1a18]'
                }`}
              >
                {username}
              </Link>
            )}
            <button
              onClick={signOut}
              className="text-[#6b6560] hover:text-[#1a1a18] transition-colors"
            >
              Sign out
            </button>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-1"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-[#1a1a18] transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block w-5 h-0.5 bg-[#1a1a18] transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-[#1a1a18] transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#e8e3dc] bg-[#fafaf7] px-4 py-4 space-y-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 text-sm ${
                pathname === link.href
                  ? 'text-[#1a1a18] font-semibold border-l-2 border-[#7c9e7a] pl-3'
                  : 'text-[#6b6560] pl-3'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#e0dbd4] flex flex-col gap-2">
            <Link href="/lists/new" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-[#6b6560] pl-3">
              + New List
            </Link>
            {username && (
              <Link href={`/profile/${username}`} onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-[#6b6560] pl-3">
                {username}
              </Link>
            )}
            <button onClick={signOut} className="text-left py-2 text-sm text-[#6b6560] pl-3">
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
