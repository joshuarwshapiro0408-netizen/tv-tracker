import { redirect } from 'next/navigation'

export default function DiscoverPage() {
  // Keep a single Search/Discover experience by routing here.
  redirect('/search?tab=discover')
}
