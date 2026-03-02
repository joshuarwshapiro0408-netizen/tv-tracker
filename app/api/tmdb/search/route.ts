import { searchShows } from '@/lib/tmdb'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const data = await searchShows(query.trim())
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search shows' }, { status: 500 })
  }
}
