import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div className="border-b border-[#e0dbd4] pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-1">legal</p>
        <h1 className="text-3xl font-bold text-[#1a1a18]">Privacy Policy</h1>
        <p className="text-xs text-[#6b6560] mt-2">Last updated: March 2026</p>
      </div>

      <p className="text-sm text-[#6b6560] leading-relaxed">
        trakr is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights around it. It&apos;s written to be read by humans.
      </p>

      {[
        {
          title: '1. What we collect',
          content: [
            'Account information: your email address, chosen username, and password (stored securely via Supabase Auth — we never see your password in plain text).',
            'Profile information: your bio, favourite genres, and profile photo — all optional and set by you.',
            'Usage data: the shows you log, your ratings, reviews, lists, and follow relationships. This is the core of what trakr does.',
            'Technical data: basic server logs including IP addresses and browser information, retained only for security and debugging purposes.',
          ],
        },
        {
          title: '2. How we use it',
          content: [
            'To provide the trakr service — showing you your logs, profile, and community activity.',
            'To let other users find your public profile and lists (based on your privacy settings).',
            'To send you account-related emails (e.g. password reset). We do not send marketing email.',
            'We do not sell your data. We do not share it with advertisers. Full stop.',
          ],
        },
        {
          title: '3. Data storage & security',
          content: [
            'Your data is stored in Supabase, a managed database platform with industry-standard security practices.',
            'Passwords are hashed and never stored in plain text.',
            'We use HTTPS for all connections.',
            'We take security seriously, but no system is 100% secure. Please use a strong, unique password.',
          ],
        },
        {
          title: '4. Third-party services',
          content: [
            'TMDB (The Movie Database): We use TMDB&apos;s API to display TV show data, posters, and metadata. Your use of trakr is subject to TMDB&apos;s terms.',
            'Supabase: We use Supabase for our database, authentication, and file storage. Your data is processed in accordance with Supabase&apos;s privacy policy.',
          ],
        },
        {
          title: '5. Your rights',
          content: [
            'Access: you can view all your data by visiting your profile.',
            'Deletion: you can delete your account and all associated data at any time by contacting us.',
            'Portability: we can provide a copy of your data on request.',
            'If you are in the EU/EEA, you have additional rights under GDPR. We honour these.',
          ],
        },
        {
          title: '6. Cookies',
          content: [
            'We use a single session cookie to keep you logged in. We do not use tracking cookies or advertising cookies.',
          ],
        },
        {
          title: '7. Changes to this policy',
          content: [
            'We may update this policy as trakr grows. We will notify users of material changes via the app. Continued use after changes constitutes acceptance.',
          ],
        },
      ].map(section => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-sm font-bold text-[#1a1a18]">{section.title}</h2>
          <ul className="space-y-2">
            {section.content.map((item, i) => (
              <li key={i} className="text-sm text-[#6b6560] leading-relaxed flex gap-2">
                <span className="text-[#e0dbd4] mt-1 flex-shrink-0">—</span>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="border-t border-[#e0dbd4] pt-6 flex gap-4 text-xs">
        <Link href="/about" className="text-[#7c9e7a] hover:underline">About</Link>
        <Link href="/terms" className="text-[#7c9e7a] hover:underline">Terms of Service</Link>
      </div>
    </div>
  )
}
