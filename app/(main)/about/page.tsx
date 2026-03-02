import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="max-w-2xl space-y-10">
      <div className="border-b border-[#e0dbd4] pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-1">company</p>
        <h1 className="text-3xl font-bold text-[#1a1a18]">About trakr</h1>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#1a1a18]">What is trakr?</h2>
        <p className="text-sm text-[#6b6560] leading-relaxed">
          trakr is a social platform for TV lovers. We believe the best shows deserve more than a thumbs-up — they deserve honest ratings, thoughtful reviews, and the kind of conversation that happens between people who actually care.
        </p>
        <p className="text-sm text-[#6b6560] leading-relaxed">
          Log shows as you watch them. Rate them across Story, Performance, and Visuals. Write a review, or don&apos;t. Follow friends. Build lists. Come back to a calm, honest record of your viewing life.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#1a1a18]">Our philosophy</h2>
        <p className="text-sm text-[#6b6560] leading-relaxed">
          We made trakr because we wanted something quieter and more intentional than algorithmic recommendation engines. No infinite scroll designed to addict you. No dark patterns. Just a clean, honest place to track what you watch and find people who love TV as much as you do.
        </p>
        <p className="text-sm text-[#6b6560] leading-relaxed">
          We&apos;re early. The community is small and that&apos;s actually a feature — every person here chose to be here. We&apos;re building this carefully, and we&apos;re grateful you&apos;re along for it.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#1a1a18]">Data & attribution</h2>
        <p className="text-sm text-[#6b6560] leading-relaxed">
          TV metadata, posters, and ratings data are provided by{' '}
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-[#7c9e7a] hover:underline">
            The Movie Database (TMDB)
          </a>
          . trakr is not affiliated with or endorsed by TMDB.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#1a1a18]">Get in touch</h2>
        <p className="text-sm text-[#6b6560] leading-relaxed">
          We&apos;re a small team and we read everything. If you have feedback, a bug to report, or just want to say hello, we&apos;d love to hear from you.
        </p>
      </section>

      <div className="border-t border-[#e0dbd4] pt-6 flex gap-4 text-xs">
        <Link href="/privacy" className="text-[#7c9e7a] hover:underline">Privacy Policy</Link>
        <Link href="/terms" className="text-[#7c9e7a] hover:underline">Terms of Service</Link>
      </div>
    </div>
  )
}
