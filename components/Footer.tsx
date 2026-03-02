import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#1a1410] border-t border-[#2d2018] mt-16">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-base font-bold text-[#f5f0e8] tracking-tight mb-2">trakr</p>
            <p className="text-xs text-[#a89880] leading-relaxed max-w-xs">
              built for people who take TV seriously.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#f5f0e8] mb-3">Product</p>
            <ul className="space-y-2">
              <li><Link href="/shows" className="text-xs text-[#a89880] hover:text-[#f5f0e8] transition-colors">Browse Shows</Link></li>
              <li><Link href="/lists" className="text-xs text-[#a89880] hover:text-[#f5f0e8] transition-colors">Lists</Link></li>
              <li><Link href="/members" className="text-xs text-[#a89880] hover:text-[#f5f0e8] transition-colors">Members</Link></li>
              <li><Link href="/login?form=signup" className="text-xs text-[#a89880] hover:text-[#f5f0e8] transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#f5f0e8] mb-3">Company</p>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-xs text-[#a89880] hover:text-[#f5f0e8] transition-colors">About</Link></li>
              <li><Link href="/privacy" className="text-xs text-[#a89880] hover:text-[#f5f0e8] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-xs text-[#a89880] hover:text-[#f5f0e8] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Data */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#f5f0e8] mb-3">Data</p>
            <p className="text-xs text-[#a89880] leading-relaxed">
              TV data from{' '}
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7c9e7a] hover:text-[#9ab898] transition-colors"
              >
                TMDB
              </a>
              . Not affiliated with TMDB.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#2d2018] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-[11px] text-[#6b6058]">
            © {year} trakr · TV data from TMDB
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-[11px] text-[#6b6058] hover:text-[#a89880] transition-colors">Privacy</Link>
            <Link href="/terms" className="text-[11px] text-[#6b6058] hover:text-[#a89880] transition-colors">Terms</Link>
            <Link href="/about" className="text-[11px] text-[#6b6058] hover:text-[#a89880] transition-colors">About</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
