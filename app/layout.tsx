import type { Metadata } from 'next'
import { Assistant } from 'next/font/google'
import './globals.css'

const assistant = Assistant({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'trakr',
  description: 'The social network for TV lovers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${assistant.className} min-h-screen bg-[#fafaf7] text-[#1a1a18] antialiased`}>
        {children}
      </body>
    </html>
  )
}
