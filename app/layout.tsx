import type { Metadata } from 'next'
import { Assistant, Playfair_Display } from 'next/font/google'
import './globals.css'

const assistant = Assistant({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-assistant',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'trakr',
  description: 'The social network for TV lovers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${assistant.variable} ${playfair.variable} ${assistant.className} min-h-screen bg-[#fafaf7] text-[#1a1a18] antialiased`}>
        {children}
      </body>
    </html>
  )
}
