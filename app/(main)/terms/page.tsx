import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div className="border-b border-[#e0dbd4] pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6560] mb-1">legal</p>
        <h1 className="text-3xl font-bold text-[#1a1a18]">Terms of Service</h1>
        <p className="text-xs text-[#6b6560] mt-2">Last updated: March 2026</p>
      </div>

      <p className="text-sm text-[#6b6560] leading-relaxed">
        By using trakr, you agree to these terms. We&apos;ve written them plainly. Please read them.
      </p>

      {[
        {
          title: '1. Acceptance',
          content: [
            'By creating an account or using trakr, you agree to these Terms of Service and our Privacy Policy.',
            'If you do not agree, please do not use trakr.',
          ],
        },
        {
          title: '2. Your account',
          content: [
            'You must be at least 13 years old to use trakr.',
            'You are responsible for keeping your account credentials secure.',
            'You are responsible for all activity that occurs under your account.',
            'You must provide accurate information when creating your account.',
            'You may not create an account on behalf of someone else without their permission.',
          ],
        },
        {
          title: '3. Acceptable use',
          content: [
            'You may use trakr to log shows, write reviews, create lists, and connect with other users.',
            'You may not use trakr to post content that is hateful, harassing, threatening, or illegal.',
            'You may not attempt to access other users\' accounts or the underlying infrastructure.',
            'You may not scrape or automate requests to trakr in a way that disrupts the service.',
            'You may not impersonate another person or organisation.',
          ],
        },
        {
          title: '4. Your content',
          content: [
            'You retain ownership of the reviews, lists, and other content you create on trakr.',
            'By posting content, you grant trakr a non-exclusive, royalty-free licence to display it as part of the service.',
            'You are solely responsible for the content you post. We do not endorse user-generated content.',
            'We reserve the right to remove content that violates these terms.',
          ],
        },
        {
          title: '5. Intellectual property',
          content: [
            'The trakr name, design, and codebase are our intellectual property.',
            'TV metadata, images, and related data are provided by TMDB under their terms of use.',
            'You may not reproduce or redistribute trakr\'s design or content without permission.',
          ],
        },
        {
          title: '6. Service availability',
          content: [
            'We aim to keep trakr available at all times, but we cannot guarantee uninterrupted access.',
            'We may modify, suspend, or discontinue the service with reasonable notice where possible.',
            'trakr is provided "as is" without warranty of any kind.',
          ],
        },
        {
          title: '7. Limitation of liability',
          content: [
            'To the maximum extent permitted by law, trakr is not liable for any indirect, incidental, or consequential damages arising from your use of the service.',
            'Our total liability to you for any claim shall not exceed the amount you have paid us in the twelve months preceding the claim (which for free users is zero).',
          ],
        },
        {
          title: '8. Termination',
          content: [
            'You may delete your account at any time.',
            'We may suspend or terminate accounts that violate these terms, with or without notice depending on severity.',
            'Upon termination, your right to use trakr ceases immediately.',
          ],
        },
        {
          title: '9. Changes to these terms',
          content: [
            'We may update these terms as trakr evolves. We will notify users of material changes.',
            'Continued use of trakr after changes take effect constitutes acceptance of the new terms.',
          ],
        },
        {
          title: '10. Governing law',
          content: [
            'These terms are governed by the laws of the jurisdiction in which trakr operates, without regard to conflict of law principles.',
          ],
        },
      ].map(section => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-sm font-bold text-[#1a1a18]">{section.title}</h2>
          <ul className="space-y-2">
            {section.content.map((item, i) => (
              <li key={i} className="text-sm text-[#6b6560] leading-relaxed flex gap-2">
                <span className="text-[#e0dbd4] mt-1 flex-shrink-0">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="border-t border-[#e0dbd4] pt-6 flex gap-4 text-xs">
        <Link href="/about" className="text-[#7c9e7a] hover:underline">About</Link>
        <Link href="/privacy" className="text-[#7c9e7a] hover:underline">Privacy Policy</Link>
      </div>
    </div>
  )
}
