import { getSeason } from '@/lib/tmdb'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ showId: string; seasonNumber: string }> }
) {
  const { showId, seasonNumber } = await params

  try {
    const data = await getSeason(Number(showId), Number(seasonNumber))
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Season not found' }, { status: 404 })
  }
}
